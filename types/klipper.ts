// Contratos de la API pública de Klipper. Los nombres de campo se dejan tal
// cual los devuelve el backend (snake_case) para que lib/klipper/client.ts
// pueda tipar la respuesta cruda sin transformarla. La transformación hacia
// los tipos que consume la UI vive en lib/klipper/mappers.ts.

import type { PriceWithOffer } from "@/types/offer";

export interface KlipperStatus {
  active: boolean;
  subscription_status: string;
  is_active_until_valid: boolean;
  allow_appointments: boolean | null;
  appointment_average_time: number;
  appointment_consent: boolean;
  appointment_security_validation: boolean;
  skip_branch_step: boolean;
  skip_service_step: boolean;
  military_time: boolean;
  use_average_time: boolean;
  time_zone: string;
}

export interface KlipperOrganization {
  id: number;
  name: string;
  slug: string;
  metadata?: {
    time_zone?: string;
    // Verificado contra la respuesta real de landing_by_slug: el logo
    // vive acá, no en un logo_url de nivel superior.
    media_configs?: {
      logo_url?: string | null;
      favicon?: string | null;
      // Handle sin "@" ni URL (ej. "better.barber.club") — verificado
      // contra la respuesta real de landing_by_slug.
      social_media?: {
        instagram?: string | null;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
    appointment?: {
      appointment_confirmation_mail?: boolean;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Nombres de campo verificados contra la respuesta real de
// organizations/landing_by_slug — Klipper no entrega `address`/`phone`
// sueltos, sino `address_line1`/`address_line2` (line2 se usa en la
// práctica como comuna/localidad) y `phone_number`.
export interface KlipperWeeklyScheduleDay {
  start_time: string; // "09:00"
  end_time: string; // "21:00"
  is_working_day: boolean;
  [key: string]: unknown;
}

export type KlipperWeekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type KlipperWeeklySchedule = Partial<Record<KlipperWeekday, KlipperWeeklyScheduleDay>>;

export interface KlipperBranch {
  id: number;
  name: string;
  active: boolean;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  phone_number?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  photo_url?: string | null;
  google_maps_url?: string | null;
  // Verificado contra la respuesta real de landing_by_slug: Klipper ya
  // trae el Place ID y el rating/conteo de reseñas de Google por
  // sucursal (sincronizados del lado de Klipper) — no hace falta pedirlos
  // aparte, solo el contenido de las reseñas en sí requiere llamar a la
  // Places API de Google (ver lib/google/*).
  google_place_id?: string | null;
  google_rating?: number | string | null;
  google_review_count?: number | null;
  weekly_schedule?: KlipperWeeklySchedule;
  [key: string]: unknown;
}

export interface KlipperService {
  id: number;
  name: string;
  // Verificado contra la respuesta real de landing_by_slug: `price` llega
  // como string ("15000.0"), no como number. Los mappers lo coercionan.
  price: number | string;
  duration: number;
  available_online: boolean;
  description?: string | null;
  photo_url?: string | null;
  business_type_id?: number | null;
  // null = servicio con precio global (sin sucursal fija). Cuando una
  // organización configura precios por sucursal, aparece un registro de
  // servicio adicional con branch_id apuntando a la sucursal.
  branch_id?: number | null;
  // Overlay que el backend agrega cuando hay una oferta aplicable a este
  // servicio: precio ya rebajado + metadatos de la oferta. El front no
  // calcula el descuento, solo lo pinta.
  price_with_offer?: PriceWithOffer | null;
  [key: string]: unknown;
}

// UserSerializer crudo tal cual lo devuelve landing_by_slug / appointment_data.
// NUNCA se debe reenviar este objeto completo a un componente de cliente:
// trae contract_info, can_charge, email_verified, signature_url, stamp_url,
// role_id, email, etc. Usar KlipperProfessionalPublic + los mappers.
export interface KlipperUserRaw {
  id: number;
  name: string;
  email?: string;
  photo_url?: string | null;
  role_id?: number;
  role?: { id: number; name: string } | null;
  is_owner?: boolean;
  // null observado en el dueño (sin sucursal fija asignada).
  branch_id?: number | null;
  // users_to_appointment NO filtra por organization_slug del lado del
  // backend (verificado: devuelve usuarios de decenas de organizaciones
  // distintas mezclados) — este campo es la única forma confiable de
  // filtrar a los de la organización correcta antes de mostrarlos.
  organization_id?: number;
  contract_info?: unknown;
  can_charge?: boolean;
  email_verified?: boolean;
  signature_url?: string | null;
  stamp_url?: string | null;
  [key: string]: unknown;
}

export interface KlipperLandingResponse {
  organization: KlipperOrganization;
  branches: KlipperBranch[];
  services: KlipperService[];
  users?: KlipperUserRaw[];
  [key: string]: unknown;
}

export interface KlipperAvailableSlots {
  [isoDate: string]: [string, string][]; // [["09:00","09:45"], ...]
}

// Forma cruda de GET appointment_data: `user` es el UserSerializer completo.
export interface KlipperAppointmentDataUserRaw {
  user: KlipperUserRaw;
  available_slots: KlipperAvailableSlots;
}

export interface KlipperAppointmentDataResponse {
  users: KlipperAppointmentDataUserRaw[];
}

// Ojo: a diferencia de appointment_data (que sí envuelve en {users: [...]}),
// este endpoint devuelve un array plano directamente — verificado contra el
// backend real. Asumir la forma envuelta hace que el mapper siempre calcule
// una lista vacía sin lanzar ningún error.
export type KlipperUsersToAppointmentResponse = KlipperUserRaw[];

// Evento del calendario propio del profesional para un día puntual (ej.
// "Jornada" 09:00-18:00, o un bloqueo con is_day_off: true). No confundir
// con una cita — eso está en KlipperCalendarAttendance.
export interface KlipperCalendarScheduleEvent {
  id: number;
  user_id: number;
  branch_id?: number | null;
  date: string; // "YYYY-MM-DD"
  start_time: string;
  end_time: string;
  is_day_off: boolean;
  [key: string]: unknown;
}

// Cita ya tomada para ese profesional/día — se resta de la ventana de
// trabajo al calcular horarios libres.
export interface KlipperCalendarAttendance {
  id: number;
  appointment_at: string; // "YYYY-MM-DDTHH:mm:ss", sin offset
  attended_by: number;
  status?: string;
  services?: { duration?: number }[];
  [key: string]: unknown;
}

// GET /api/v1/user_calendar — el backend real tolera devolver esto
// envuelto en `data`, plano, o (documentado, no verificado directamente)
// un array de schedules a secas; normalizar siempre con
// lib/klipper/slots.ts:extractUserCalendar.
export interface KlipperUserCalendarResponse {
  success?: boolean;
  data?: {
    schedules?: KlipperCalendarScheduleEvent[];
    attendances?: KlipperCalendarAttendance[];
  };
  schedules?: KlipperCalendarScheduleEvent[];
  attendances?: KlipperCalendarAttendance[];
}

// --- DTOs seguros, producidos por lib/klipper/mappers.ts -------------------

// DTO mínimo y seguro para exponer al cliente — NO el UserSerializer crudo.
export interface KlipperProfessionalPublic {
  id: number;
  name: string;
  photo_url: string | null;
  role_name?: string;
}

export interface KlipperAppointmentDataUser {
  user: KlipperProfessionalPublic;
  available_slots: KlipperAvailableSlots;
}

// Sucursal/servicio recortados a lo que el wizard de reserva necesita. No se
// mapean a los tipos Sucursal/Servicio de types/index.ts porque esos tipos
// cargan campos de marketing (galería, rating, reseñas, etc.) que la API
// pública de Klipper no entrega; inventar esos valores sería engañoso.
export interface BookingBranch {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  weeklySchedule?: KlipperWeeklySchedule;
}

// Igual que BookingBranch pero con coordenadas — el wizard de reserva no las
// necesita, pero el contenido de marketing (mapa, JSON-LD BarberShop.geo) sí.
export interface MarketingBranch {
  id: number;
  name: string;
  address: string | null;
  comuna: string | null;
  ciudad: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  photoUrl: string | null;
  googleMapsUrl: string | null;
  googlePlaceId: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  // Horario semanal real por sucursal (Klipper lo trae en weekly_schedule,
  // verificado contra la respuesta real de landing_by_slug). El contenido de
  // marketing lo convierte a HorarioDia[] para las cards; sin esto, el
  // horario mostrado quedaba fijo al curado local y no coincidía con Klipper.
  weeklySchedule?: KlipperWeeklySchedule;
}

export interface BookingService {
  id: number;
  name: string;
  price: number;
  duration: number;
  businessTypeId?: number | null;
  /** Overlay de oferta ya resuelto por Klipper (precio rebajado + metadatos)
   * o null. El wizard/tarjetas solo lo pintan. */
  priceWithOffer?: PriceWithOffer | null;
  // Klipper representa los precios por sucursal como registros de servicio
  // separados, cada uno con su propio `branch_id` (null = precio global, sin
  // sucursal fija). El wizard debe resolver, para la sucursal elegida, el
  // registro con branch_id === selectedBranchId y caer al global si no existe.
  branchId?: number | null;
}

// Igual que BookingService pero con foto/descripción — el wizard de reserva
// no las necesita, pero el contenido de marketing sí.
export interface MarketingService {
  id: number;
  name: string;
  price: number;
  duration: number;
  description: string | null;
  photoUrl: string | null;
  /** Overlay de oferta ya resuelto por el backend (precio rebajado + metadatos)
   * o null si el servicio no tiene oferta aplicable. */
  priceWithOffer: PriceWithOffer | null;
}

export interface BookingOrganization {
  id: number;
  name: string;
  timeZone: string;
}

export interface BookingLanding {
  organization: BookingOrganization;
  branches: BookingBranch[];
  services: BookingService[];
}

export interface BookingAvailability {
  mode: "slots" | "manual";
  professionals: KlipperAppointmentDataUser[];
}

// --- Creación de citas -------------------------------------------------

// Nombres de campo verificados contra el frontend real de Klipper
// (useAppointmentModal.ts): branch_id/attended_by van PLANOS en el nivel
// superior, no anidados bajo "attendance" — con la forma anidada el
// backend responde 500 sin mensaje (probado directo, incluso con un
// profesional real con slot confirmado).
export interface CreateAppointmentPayload {
  organization_id: number;
  name: string;
  email: string;
  phone: string;
  appointment_at: string; // sin offset, hora local de la organización
  service_ids: number[];
  branch_id: number;
  attended_by: number;
  business_type_id?: number;
}

export interface CreateAppointmentResponse {
  id: number;
  status: string;
  appointment_at: string;
  attended_by_user: KlipperProfessionalPublic;
  profile: { id: number; name: string; [key: string]: unknown };
  services: KlipperService[];
  child_attendances: unknown[];
}
