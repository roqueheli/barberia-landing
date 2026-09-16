// Agregador server-only para contenido de marketing (home + páginas de
// detalle): organización, sucursales, servicios y profesionales reales de
// Klipper, cacheados por separado del flujo de reserva (que debe ser
// siempre fresco). Nunca lanza: si la org no está configurada o Klipper
// falla, devuelve null y quien llame debe degradar al contenido curado
// local — nunca romper la página.
import "server-only";
import { cache } from "react";

import { getLanding, getUsersToAppointment } from "./client";
import { mapMarketingBranch, mapMarketingService, mapUsersToAppointmentToPublic } from "./mappers";
import { KlipperApiError } from "./errors";
import type {
  BookingOrganization,
  KlipperProfessionalPublic,
  MarketingBranch,
  MarketingService,
} from "@/types/klipper";

export interface LandingContent {
  organization: BookingOrganization;
  branches: MarketingBranch[];
  services: MarketingService[];
  /** logo_url/instagram en vivo de metadata.media_configs — separados de
   * BookingOrganization (deliberadamente mínimo, solo lo que el wizard de
   * reserva necesita) porque son campos puramente de marketing. */
  organizationLogoUrl: string | null;
  /** Handle sin "@" ni URL (ej. "better.barber.club"). */
  organizationInstagramHandle: string | null;
}

export interface OrganizationContent extends LandingContent {
  professionals: KlipperProfessionalPublic[];
}

// 60s en vez de 300s: mientras se carga contenido real en Klipper (fotos,
// sucursales nuevas), 5 minutos de espera para ver el cambio reflejado es
// demasiado. Para producción con contenido ya estable, subir este valor
// reduce llamadas a Klipper sin costo perceptible para un visitante real.
const CACHE_OPTIONS = { revalidate: 60, tags: ["klipper-org"] };

// Separado de getOrganizationContent(): landing_by_slug es la ÚNICA llamada
// que necesitan sucursales/servicios/marca (SucursalesSection, ServiciosSection,
// Footer, getBranding, lib/google/reviews.ts). Antes, todos esos callers
// pasaban por getOrganizationContent(), que encadenaba landing_by_slug ->
// users_to_appointment de forma secuencial (el segundo necesita el
// organization.id del primero) — así que ninguno podía resolver hasta que
// AMBAS llamadas a Klipper terminaran, aunque solo necesitaran datos de la
// primera. Eso retrasaba ~0.7s (medido) el arranque de las reseñas de
// Google, que dependen de branches/googlePlaceId de este resultado.
export const getLandingContent = cache(async (): Promise<LandingContent | null> => {
  const slug = process.env.KLIPPER_ORG_SLUG;
  if (!slug) return null;

  try {
    const landing = await getLanding(slug, CACHE_OPTIONS);
    const organization: BookingOrganization = {
      id: landing.organization.id,
      name: landing.organization.name,
      timeZone: landing.organization.metadata?.time_zone ?? "America/Santiago",
    };
    const organizationLogoUrl = landing.organization.metadata?.media_configs?.logo_url || null;
    const organizationInstagramHandle =
      landing.organization.metadata?.media_configs?.social_media?.instagram || null;
    const branches = (landing.branches ?? []).filter((b) => b.active).map(mapMarketingBranch);
    // available_online solo no alcanza: hay servicios reales con
    // available_online=true pero active=false (deshabilitados por el
    // dueño sin borrarlos) — mismo criterio que
    // lib/klipper/mappers.ts:mapLandingToBookingLanding.
    const services = (landing.services ?? [])
      .filter((s) => s.available_online && s.active)
      .map(mapMarketingService);

    return { organization, branches, services, organizationLogoUrl, organizationInstagramHandle };
  } catch (err) {
    const message = err instanceof KlipperApiError ? err.message : "unknown error";
    console.error("[klipper/organization]", message);
    return null;
  }
});

// Solo lo necesitan Hero.tsx (stat "barberos") y EquipoSection.tsx — el
// resto del sitio no lee profesionales, así que separarlo evita que esas
// dos secciones sean las únicas que retrasen a todas las demás.
export const getProfessionals = cache(async (): Promise<KlipperProfessionalPublic[]> => {
  const slug = process.env.KLIPPER_ORG_SLUG;
  if (!slug) return [];

  const landing = await getLandingContent();
  if (!landing) return [];

  try {
    // organization_id (no el slug) es lo que de verdad filtra este
    // endpoint del lado del servidor — ver el comentario en
    // lib/klipper/client.ts:getUsersToAppointment.
    const users = await getUsersToAppointment(slug, landing.organization.id, CACHE_OPTIONS);
    // Solo profesionales de sucursales activas (branches ya viene filtrado
    // por b.active más arriba). Los sin sucursal fija (branch_id null, ej. el
    // dueño) se conservan igual.
    const activeBranchIds = landing.branches.map((b) => b.id);
    return mapUsersToAppointmentToPublic(users, undefined, landing.organization.id, activeBranchIds);
  } catch (err) {
    const message = err instanceof KlipperApiError ? err.message : "unknown error";
    console.error("[klipper/organization] professionals", message);
    return [];
  }
});

// Combinado, para los únicos dos callers que necesitan ambos a la vez.
// getLandingContent()/getProfessionals() ya están cache()-deduplicados, así
// que este Promise.all no dispara ninguna llamada de red extra.
export const getOrganizationContent = cache(async (): Promise<OrganizationContent | null> => {
  const [landing, professionals] = await Promise.all([getLandingContent(), getProfessionals()]);
  if (!landing) return null;
  return { ...landing, professionals };
});
