// Transforma las respuestas crudas de Klipper (types/klipper.ts, nombres de
// campo tal cual el backend) en los DTOs livianos que consume la UI del
// wizard de reserva. Este es también el punto donde se aplica el filtro de
// seguridad: un KlipperUserRaw completo (con contract_info, can_charge,
// email_verified, signature_url, stamp_url, role_id, email...) nunca debe
// cruzar hacia un componente de cliente — solo KlipperProfessionalPublic.
import type {
  BookingBranch,
  BookingLanding,
  BookingService,
  KlipperAppointmentDataResponse,
  KlipperAppointmentDataUser,
  KlipperBranch,
  KlipperLandingResponse,
  KlipperProfessionalPublic,
  KlipperService,
  KlipperUserRaw,
  KlipperUsersToAppointmentResponse,
  MarketingBranch,
  MarketingService,
} from "@/types/klipper";

function toNullableNumber(value: number | string | null | undefined): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

// Klipper devuelve `price` como string ("15000.0") en la respuesta real de
// landing_by_slug, aunque el tipo lo declare number — coercionar acá para
// que la UI no muestre "$15000.0" ni haga aritmética sobre un string.
function toNumber(value: number | string | null | undefined): number {
  return toNullableNumber(value) ?? 0;
}

function nonEmpty(value: string | null | undefined): string | null {
  return value != null && value.trim().length > 0 ? value : null;
}

// address_line2 se usa en la práctica como comuna/localidad, no como una
// segunda línea de dirección — se combina con address_line1 solo para el
// wizard de reserva (BookingBranch), que muestra un único string.
function combineAddress(branch: KlipperBranch): string | null {
  const parts = [nonEmpty(branch.address_line1), nonEmpty(branch.address_line2)];
  const joined = parts.filter((p): p is string => p != null).join(", ");
  return joined.length > 0 ? joined : null;
}

export function mapUserToPublicProfessional(user: KlipperUserRaw): KlipperProfessionalPublic {
  return {
    id: user.id,
    name: user.name,
    photo_url: user.photo_url ?? null,
    role_name: user.role?.name,
  };
}

// Un usuario es agendable si es agent (barbero que atiende) o el dueño de
// la organización (is_owner) — mismo criterio que
// components/booking/helpers.ts:isBookableProfessional para el otro flujo.
export function isBookableKlipperUser(user: KlipperUserRaw): boolean {
  return user.role?.name === "agent" || user.is_owner === true;
}

export function mapBranch(branch: KlipperBranch): BookingBranch {
  return {
    id: branch.id,
    name: branch.name,
    address: combineAddress(branch),
    phone: nonEmpty(branch.phone_number),
    weeklySchedule: branch.weekly_schedule,
  };
}

export function mapMarketingBranch(branch: KlipperBranch): MarketingBranch {
  return {
    id: branch.id,
    name: branch.name,
    address: nonEmpty(branch.address_line1),
    comuna: nonEmpty(branch.address_line2),
    ciudad: nonEmpty(branch.city),
    phone: nonEmpty(branch.phone_number),
    latitude: toNullableNumber(branch.latitude),
    longitude: toNullableNumber(branch.longitude),
    photoUrl: nonEmpty(branch.photo_url),
    googleMapsUrl: nonEmpty(branch.google_maps_url),
    googlePlaceId: nonEmpty(branch.google_place_id),
    googleRating: toNullableNumber(branch.google_rating),
    googleReviewCount: toNullableNumber(branch.google_review_count),
    weeklySchedule: branch.weekly_schedule,
  };
}

export function mapService(service: KlipperService): BookingService {
  return {
    id: service.id,
    name: service.name,
    price: toNumber(service.price),
    duration: service.duration,
    businessTypeId: service.business_type_id ?? null,
    branchId: service.branch_id ?? null,
    priceWithOffer: service.price_with_offer ?? null,
  };
}

export function mapMarketingService(service: KlipperService): MarketingService {
  return {
    id: service.id,
    name: service.name,
    price: toNumber(service.price),
    duration: service.duration,
    description: nonEmpty(service.description),
    photoUrl: nonEmpty(service.photo_url),
    // Overlay de oferta tal cual lo entrega el backend (precio ya rebajado).
    priceWithOffer: service.price_with_offer ?? null,
  };
}

export function mapLandingToBookingLanding(landing: KlipperLandingResponse): BookingLanding {
  return {
    organization: {
      id: landing.organization.id,
      name: landing.organization.name,
      timeZone: landing.organization.metadata?.time_zone ?? "America/Santiago",
    },
    branches: (landing.branches ?? []).filter((b) => b.active).map(mapBranch),
    services: (landing.services ?? []).filter((s) => s.available_online).map(mapService),
  };
}

// branchId opcional: cuando se pasa, solo se incluyen profesionales de esa
// sucursal (branch_id null = sin sucursal fija, ej. el dueño, se incluye
// siempre) — sin esto, la disponibilidad mostraba barberos de TODAS las
// sucursales de la organización sin importar cuál eligió el cliente.
export function mapAppointmentDataToPublic(
  data: KlipperAppointmentDataResponse,
  branchId?: number
): KlipperAppointmentDataUser[] {
  return (data.users ?? [])
    .filter((entry) => branchId == null || entry.user.branch_id == null || entry.user.branch_id === branchId)
    .map((entry) => ({
      user: mapUserToPublicProfessional(entry.user),
      available_slots: entry.available_slots,
    }));
}

// users_to_appointment no filtra ni por rol ni por organización del lado
// del backend (verificado contra el backend real: devuelve usuarios de
// decenas de organizaciones distintas mezclados) — acá hace falta aplicar
// isBookableKlipperUser Y organizationId explícitamente, o se muestran
// profesionales de negocios completamente ajenos.
export function mapUsersToAppointmentToPublic(
  data: KlipperUsersToAppointmentResponse,
  branchId?: number,
  organizationId?: number,
  // Ids de las sucursales activas. Cuando se pasa, se excluyen los usuarios
  // asignados a una sucursal inactiva (branch_id no incluido en la lista).
  // branch_id null (sin sucursal fija, ej. el dueño) se conserva siempre.
  // Sin este parámetro, un barbero de una sucursal desactivada en Klipper
  // seguía apareciendo en el equipo.
  activeBranchIds?: number[]
): KlipperProfessionalPublic[] {
  const activeSet = activeBranchIds != null ? new Set(activeBranchIds) : null;
  return (data ?? [])
    .filter(
      (user) =>
        (organizationId == null || user.organization_id === organizationId) &&
        isBookableKlipperUser(user) &&
        (branchId == null || user.branch_id == null || user.branch_id === branchId) &&
        (activeSet == null || user.branch_id == null || activeSet.has(user.branch_id))
    )
    .map(mapUserToPublicProfessional);
}
