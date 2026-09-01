// Contratos de los endpoints públicos de Klipper (GET /api/v1/organizations/landing_by_slug/:slug,
// GET /api/appointment/:slug, POST /api/appointment/:slug). Son endpoints sin
// auth pensados para consumo directo desde el navegador de terceros (por eso
// Klipper ofrece incluso un fallback JSONP), así que a diferencia de
// types/klipper.ts no hay aquí un filtro de seguridad que aplicar: lo que
// devuelven es lo que se puede mostrar tal cual.

export interface BusinessType {
  id: number;
  name: string;
}

export interface WeeklyScheduleDay {
  active: boolean;
  start: string; // "09:00"
  end: string; // "20:00"
}

// Asunción documentada: claves en inglés y minúscula ("monday".."sunday").
// TODO(backend): confirmar el shape real de weekly_schedule.
export interface WeeklySchedule {
  monday?: WeeklyScheduleDay;
  tuesday?: WeeklyScheduleDay;
  wednesday?: WeeklyScheduleDay;
  thursday?: WeeklyScheduleDay;
  friday?: WeeklyScheduleDay;
  saturday?: WeeklyScheduleDay;
  sunday?: WeeklyScheduleDay;
}

export interface Branch {
  id: number;
  name: string;
  address?: string | null;
  weekly_schedule?: WeeklySchedule;
  business_types?: BusinessType[];
  google_place_id?: string | null;
  [key: string]: unknown;
}

export interface OrganizationAppointmentMetadata {
  allow_appointments?: boolean;
  use_average_time?: boolean;
  appointment_average_time?: number;
  [key: string]: unknown;
}

export interface OrganizationMetadata {
  time_zone?: string;
  appointment?: OrganizationAppointmentMetadata;
  [key: string]: unknown;
}

export interface Organization {
  id: number;
  name: string;
  slug: string;
  photo_url?: string | null;
  metadata?: OrganizationMetadata;
}

export interface User {
  id: number;
  name: string;
  // null observado en el backend real para el dueño (no tiene una sucursal
  // fija asignada) — se lo trata como "puede atender en cualquier sucursal".
  branch_id: number | null;
  business_type_id?: number | null;
  business_type_ids?: number[];
  appointment_mode?: boolean;
  photo_url?: string | null;
  role?: { id: number; name: string } | null;
  is_owner?: boolean;
  [key: string]: unknown;
}

export interface Service {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  duration: number; // minutos
  business_type_id?: number | null;
  [key: string]: unknown;
}

export interface Product {
  id: number;
  name: string;
  price?: number;
  [key: string]: unknown;
}

export interface LandingData {
  organization: Organization;
  branches: Branch[];
  users: User[];
  services: Service[];
  products: Product[];
}

// Un bloque ya ocupado del calendario (cita existente).
export interface CalendarAttendance {
  appointment_at: string;
  duration?: number;
  [key: string]: unknown;
}

export interface CalendarData {
  schedules?: unknown;
  attendances?: CalendarAttendance[];
  [key: string]: unknown;
}

export interface TimeSlot {
  start: string; // "09:00"
  end: string; // "09:45"
}

export interface SelectedService {
  service: Service;
  quantity: number;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

export interface CreateAppointmentPayload {
  name: string;
  email: string;
  phone: string;
  organization_id: number;
  branch_id: number;
  service_ids: number[];
  attended_by: number;
  appointment_at: string; // sin offset, hora local de la organización
  business_type_id?: number;
}

export interface CreateAppointmentResponse {
  id: number;
  [key: string]: unknown;
}

export type BookingStepId = "services" | "professional" | "datetime" | "contact" | "confirm";

export interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization;
  branches: Branch[];
  services: Service[];
  professionals: User[];
  /** Sucursal preseleccionada — el modal omite el paso de selección de sucursal. */
  initialBranch: Branch;
  onSuccess?: () => void;
}
