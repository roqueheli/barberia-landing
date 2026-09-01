import momentTz from "moment-timezone";
import type {
  Branch,
  CalendarAttendance,
  Organization,
  SelectedService,
  Service,
  TimeSlot,
  User,
  WeeklySchedule,
} from "./types";

export function filterServicesForBranch(services: Service[], branch: Branch): Service[] {
  const branchBusinessTypeIds = branch.business_types?.map((bt) => bt.id);
  if (!branchBusinessTypeIds || branchBusinessTypeIds.length === 0) return services;
  return services.filter(
    (service) => service.business_type_id == null || branchBusinessTypeIds.includes(service.business_type_id)
  );
}

export function selectedBusinessTypeIds(selectedServices: SelectedService[]): number[] {
  return Array.from(
    new Set(
      selectedServices
        .map((s) => s.service.business_type_id)
        .filter((id): id is number => id != null)
    )
  );
}

// Un usuario es agendable si es agent (barbero que atiende) o el dueño de
// la organización (is_owner) — el resto de roles (ej. admin sin ninguna de
// las dos marcas) no debe aparecer como profesional seleccionable.
function isBookableProfessional(user: User): boolean {
  return user.role?.name === "agent" || user.is_owner === true;
}

export function filterProfessionalsForBranch(
  users: User[],
  branchId: number,
  selectedServices: SelectedService[]
): User[] {
  const businessTypeIds = selectedBusinessTypeIds(selectedServices);
  return users.filter((user) => {
    if (!isBookableProfessional(user)) return false;
    // branch_id null = sin sucursal fija (observado en el dueño) — puede
    // atender en cualquiera, así que no se filtra por sucursal en ese caso.
    if (user.branch_id != null && user.branch_id !== branchId) return false;
    if (businessTypeIds.length === 0) return true;
    const userBusinessTypeIds = user.business_type_ids ?? (user.business_type_id != null ? [user.business_type_id] : []);
    if (userBusinessTypeIds.length === 0) return true;
    return userBusinessTypeIds.some((id) => businessTypeIds.includes(id));
  });
}

export function computeAppointmentDuration(
  organization: Organization,
  selectedServices: SelectedService[]
): number {
  const appointmentMeta = organization.metadata?.appointment;
  if (appointmentMeta?.use_average_time) {
    return appointmentMeta.appointment_average_time || 60;
  }
  const sum = selectedServices.reduce((total, s) => total + s.service.duration * s.quantity, 0);
  return sum > 0 ? sum : 60;
}

export function buildServiceIds(selectedServices: SelectedService[]): number[] {
  const ids: number[] = [];
  for (const { service, quantity } of selectedServices) {
    for (let i = 0; i < quantity; i++) ids.push(service.id);
  }
  return ids;
}

export function servicesTotalPrice(selectedServices: SelectedService[]): number {
  return selectedServices.reduce((total, s) => total + s.service.price * s.quantity, 0);
}

const WEEKDAY_KEYS: (keyof WeeklySchedule)[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

interface ComputeSlotsParams {
  date: string; // YYYY-MM-DD
  timezone: string;
  weeklySchedule: WeeklySchedule | undefined;
  attendances: CalendarAttendance[];
  durationMinutes: number;
  /** Granularidad entre horarios candidatos, en minutos. Default 15. */
  stepMinutes?: number;
}

/** true si la sucursal no atiende ese día según weekly_schedule. */
export function isBranchClosed(date: string, timezone: string, weeklySchedule: WeeklySchedule | undefined): boolean {
  const dayKey = WEEKDAY_KEYS[momentTz.tz(date, timezone).day()];
  const daySchedule = weeklySchedule?.[dayKey];
  return !daySchedule || daySchedule.active === false;
}

/**
 * Empareja una sucursal "de marketing" (types/index.ts, /data/sucursales.ts)
 * con una Branch real de Klipper por coincidencia de nombre — no hay un id
 * compartido entre ambos mundos. Best-effort: si no matchea nada, quien
 * llame debe degradar con gracia (ej. no mostrar el botón "Agendar").
 */
export function matchBranchByName(
  nombre: string,
  slug: string,
  branches: Branch[]
): Branch | null {
  const target = nombre.toLowerCase();
  const slugFragment = slug.replace(/-/g, " ").toLowerCase();
  return (
    branches.find((b) => {
      const branchName = b.name.toLowerCase();
      return target.includes(branchName) || branchName.includes(slugFragment);
    }) ?? null
  );
}

export function computeAvailableSlots(params: ComputeSlotsParams): TimeSlot[] {
  const { date, timezone, weeklySchedule, attendances, durationMinutes } = params;
  const stepMinutes = params.stepMinutes ?? 15;
  if (durationMinutes <= 0) return [];

  const dayKey = WEEKDAY_KEYS[momentTz.tz(date, timezone).day()];
  const daySchedule = weeklySchedule?.[dayKey];
  if (!daySchedule || daySchedule.active === false) return [];

  const dayStart = momentTz.tz(`${date}T${daySchedule.start}`, timezone);
  const dayEnd = momentTz.tz(`${date}T${daySchedule.end}`, timezone);
  if (!dayStart.isValid() || !dayEnd.isValid() || !dayStart.isBefore(dayEnd)) return [];

  const busyRanges = attendances
    .map((a) => {
      const start = momentTz.tz(a.appointment_at, timezone);
      const end = start.clone().add(a.duration ?? durationMinutes, "minutes");
      return { start, end };
    })
    .filter((r) => r.start.isValid());

  const now = momentTz.tz(timezone);
  const slots: TimeSlot[] = [];
  const cursor = dayStart.clone();
  while (cursor.clone().add(durationMinutes, "minutes").isSameOrBefore(dayEnd)) {
    const slotStart = cursor.clone();
    const slotEnd = slotStart.clone().add(durationMinutes, "minutes");
    const overlapsAttendance = busyRanges.some((r) => slotStart.isBefore(r.end) && slotEnd.isAfter(r.start));
    const isPast = slotStart.isBefore(now);
    if (!overlapsAttendance && !isPast) {
      slots.push({ start: slotStart.format("HH:mm"), end: slotEnd.format("HH:mm") });
    }
    cursor.add(stepMinutes, "minutes");
  }
  return slots;
}
