// Convierte el weekly_schedule de Klipper (un objeto por día, con
// start_time/end_time/is_working_day) al formato HorarioDia[] que muestran
// las cards de sucursal: días contiguos con el mismo horario se agrupan en
// un solo rango ("Lunes a viernes: 10:00 - 21:00"). Puro y sin dependencias
// de Next/React — fácil de testear.
import type { HorarioDia } from "@/types";
import type { KlipperWeekday, KlipperWeeklySchedule } from "@/types/klipper";

// Orden fijo lunes → domingo (el objeto de Klipper no garantiza orden de
// claves; se recorre siempre en este orden para agrupar días contiguos).
const WEEK_ORDER: KlipperWeekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_LABELS: Record<KlipperWeekday, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

const CLOSED = "Cerrado";

// "10:00:00" → "10:00"; "10:00" se deja igual. Sin este recorte, Klipper a
// veces trae segundos y el rango se vería "10:00:00 - 21:00:00".
function normalizeTime(time: string): string {
  const match = time.match(/^(\d{1,2}:\d{2})/);
  return match ? match[1] : time.trim();
}

// Texto de horas de un día: "10:00 - 21:00" o "Cerrado". Un día se considera
// cerrado si is_working_day es false o si falta alguna de las horas.
function dayHoursText(schedule: KlipperWeeklySchedule, day: KlipperWeekday): string {
  const entry = schedule[day];
  if (!entry || entry.is_working_day === false) return CLOSED;
  const start = entry.start_time ? normalizeTime(entry.start_time) : "";
  const end = entry.end_time ? normalizeTime(entry.end_time) : "";
  if (!start || !end) return CLOSED;
  return `${start} - ${end}`;
}

function lower(label: string): string {
  return label.charAt(0).toLowerCase() + label.slice(1);
}

// Etiqueta de un tramo de días contiguos: un solo día ("Lunes"), dos días
// ("Sábado y domingo") o un rango ("Lunes a viernes"). Solo el primer día va
// capitalizado; el que sigue al conector va en minúscula, igual que el copy
// curado (data/sucursales.ts).
function rangeLabel(days: KlipperWeekday[]): string {
  if (days.length === 1) return DAY_LABELS[days[0]];
  if (days.length === 2) return `${DAY_LABELS[days[0]]} y ${lower(DAY_LABELS[days[1]])}`;
  return `${DAY_LABELS[days[0]]} a ${lower(DAY_LABELS[days[days.length - 1]])}`;
}

/**
 * Convierte el weekly_schedule de Klipper a HorarioDia[], agrupando días
 * contiguos que comparten el mismo horario. Devuelve [] si no hay schedule
 * o viene vacío, para que el llamador pueda caer al horario curado.
 */
export function weeklyScheduleToHorario(
  schedule: KlipperWeeklySchedule | undefined | null
): HorarioDia[] {
  if (!schedule || Object.keys(schedule).length === 0) return [];

  const result: HorarioDia[] = [];
  let currentDays: KlipperWeekday[] = [];
  let currentHoras: string | null = null;

  const flush = () => {
    if (currentDays.length > 0 && currentHoras != null) {
      result.push({ dias: rangeLabel(currentDays), horas: currentHoras });
    }
    currentDays = [];
    currentHoras = null;
  };

  for (const day of WEEK_ORDER) {
    const horas = dayHoursText(schedule, day);
    if (horas === currentHoras) {
      currentDays.push(day);
    } else {
      flush();
      currentDays = [day];
      currentHoras = horas;
    }
  }
  flush();

  // Si todos los días quedaron cerrados, no tiene sentido mostrar
  // "Lunes a domingo: Cerrado" — se trata como sin horario disponible.
  if (result.length === 1 && result[0].horas === CLOSED) return [];

  return result;
}
