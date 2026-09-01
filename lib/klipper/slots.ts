// Calcula horarios libres para un profesional cruzando el horario de la
// sucursal (weekly_schedule) con su calendario puntual (/user_calendar):
// citas ya tomadas (attendances) y turno/bloqueo propio del día
// (schedules). Puro — sin "server-only", se usa tanto en el Route Handler
// como directo en el cliente (mismo patrón que
// components/booking/helpers.ts:computeAvailableSlots para el otro flujo).
//
// Nota sobre schedules[]: la doc que nos pasaron marca cada entrada como
// "ocupada" (se resta de la ventana). Eso da 0 slots siempre que el turno
// del profesional cubra toda la ventana de la sucursal (el caso típico) —
// contradictorio con el propósito del endpoint. Acá se interpreta en
// cambio como el turno/ventana propia del profesional ese día: angosta la
// ventana de la sucursal (nunca la ensancha), y solo attendances[] resta
// horas ocupadas. is_day_off sigue cancelando el día completo. Si al
// probar con datos reales se ve que las citas normales SÍ aparecen dentro
// de schedules[], hay que invertir esta interpretación.
import momentTz from "moment-timezone";
import type {
  KlipperCalendarAttendance,
  KlipperCalendarScheduleEvent,
  KlipperUserCalendarResponse,
  KlipperWeekday,
  KlipperWeeklySchedule,
} from "@/types/klipper";

const WEEKDAY_KEYS: KlipperWeekday[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

interface ExtractedCalendar {
  schedules: KlipperCalendarScheduleEvent[];
  attendances: KlipperCalendarAttendance[];
}

// Tolera las 3 formas documentadas de respuesta del backend.
export function extractUserCalendar(
  data: KlipperUserCalendarResponse | KlipperCalendarScheduleEvent[] | null | undefined
): ExtractedCalendar {
  if (!data) return { schedules: [], attendances: [] };
  if (Array.isArray(data)) return { schedules: data, attendances: [] };
  const schedules = data.data?.schedules ?? data.schedules ?? [];
  const attendances = data.data?.attendances ?? data.attendances ?? [];
  return { schedules, attendances };
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutesToTime(mins: number): string {
  const normalized = ((mins % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export interface ComputeSlotsFromCalendarParams {
  date: string; // "YYYY-MM-DD"
  timezone: string;
  professionalId: number;
  weeklySchedule: KlipperWeeklySchedule | undefined;
  calendar: KlipperUserCalendarResponse | KlipperCalendarScheduleEvent[] | null | undefined;
  durationMinutes: number;
}

export function computeSlotsFromCalendar(params: ComputeSlotsFromCalendarParams): [string, string][] {
  const { date, timezone, professionalId, weeklySchedule, calendar, durationMinutes } = params;
  if (durationMinutes <= 0) return [];

  const { schedules, attendances } = extractUserCalendar(calendar);

  const dayEvents = schedules.filter((e) => e.user_id === professionalId && e.date === date);
  if (dayEvents.some((e) => e.is_day_off)) return [];

  const dayKey = WEEKDAY_KEYS[momentTz.tz(date, timezone).day()];
  const branchDay = weeklySchedule?.[dayKey];
  if (!branchDay || !branchDay.is_working_day) return [];

  let windowStart = toMinutes(branchDay.start_time);
  let windowEnd = toMinutes(branchDay.end_time);
  if (windowEnd <= windowStart) windowEnd += 24 * 60; // cierre cruza medianoche

  // Turno propio del profesional ese día: angosta la ventana de la
  // sucursal a la intersección (nunca la ensancha más allá de la branch).
  const ownShift = dayEvents.find((e) => e.start_time && e.end_time);
  if (ownShift) {
    const shiftStart = toMinutes(ownShift.start_time);
    let shiftEnd = toMinutes(ownShift.end_time);
    if (shiftEnd <= shiftStart) shiftEnd += 24 * 60;
    windowStart = Math.max(windowStart, shiftStart);
    windowEnd = Math.min(windowEnd, shiftEnd);
  }
  if (windowStart >= windowEnd) return [];

  const busy = attendances
    .filter((a) => a.attended_by === professionalId && a.appointment_at?.slice(0, 10) === date)
    .map((a) => {
      const start = momentTz.tz(a.appointment_at, timezone);
      const servicesDuration = a.services?.reduce((sum, s) => sum + (s.duration ?? 0), 0) ?? 0;
      const duration = servicesDuration > 0 ? servicesDuration : durationMinutes;
      const startMin = start.hour() * 60 + start.minute();
      return { start: startMin, end: startMin + duration };
    });

  const now = momentTz.tz(timezone);
  const isToday = momentTz.tz(date, timezone).isSame(now, "day");
  const nowMin = isToday ? now.hour() * 60 + now.minute() : -1;

  const slots: [string, string][] = [];
  let cursor = windowStart;
  let iterations = 0;
  const MAX_ITERATIONS = 200;

  while (cursor + durationMinutes <= windowEnd && iterations < MAX_ITERATIONS) {
    iterations++;
    const slotEnd = cursor + durationMinutes;

    if (isToday && cursor <= nowMin) {
      cursor += durationMinutes;
      continue;
    }

    const conflict = busy.find((b) => cursor < b.end && slotEnd > b.start);
    if (conflict) {
      // Salta al final del bloque en conflicto, alineado a 5 min.
      cursor = Math.ceil(conflict.end / 5) * 5;
      continue;
    }

    slots.push([minutesToTime(cursor), minutesToTime(slotEnd)]);
    cursor += durationMinutes;
  }

  return slots;
}
