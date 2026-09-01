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

export interface OrganizationContent {
  organization: BookingOrganization;
  branches: MarketingBranch[];
  services: MarketingService[];
  professionals: KlipperProfessionalPublic[];
  /** logo_url/instagram en vivo de metadata.media_configs — separados de
   * BookingOrganization (deliberadamente mínimo, solo lo que el wizard de
   * reserva necesita) porque son campos puramente de marketing. */
  organizationLogoUrl: string | null;
  /** Handle sin "@" ni URL (ej. "better.barber.club"). */
  organizationInstagramHandle: string | null;
}

// 60s en vez de 300s: mientras se carga contenido real en Klipper (fotos,
// sucursales nuevas), 5 minutos de espera para ver el cambio reflejado es
// demasiado. Para producción con contenido ya estable, subir este valor
// reduce llamadas a Klipper sin costo perceptible para un visitante real.
const CACHE_OPTIONS = { revalidate: 60, tags: ["klipper-org"] };

export const getOrganizationContent = cache(async (): Promise<OrganizationContent | null> => {
  const slug = process.env.KLIPPER_ORG_SLUG;
  if (!slug) return null;

  let organization: BookingOrganization;
  let branches: MarketingBranch[];
  let services: MarketingService[];
  let organizationLogoUrl: string | null;
  let organizationInstagramHandle: string | null;

  try {
    const landing = await getLanding(slug, CACHE_OPTIONS);
    organization = {
      id: landing.organization.id,
      name: landing.organization.name,
      timeZone: landing.organization.metadata?.time_zone ?? "America/Santiago",
    };
    organizationLogoUrl = landing.organization.metadata?.media_configs?.logo_url || null;
    organizationInstagramHandle =
      landing.organization.metadata?.media_configs?.social_media?.instagram || null;
    branches = (landing.branches ?? []).filter((b) => b.active).map(mapMarketingBranch);
    services = (landing.services ?? []).filter((s) => s.available_online).map(mapMarketingService);
  } catch (err) {
    const message = err instanceof KlipperApiError ? err.message : "unknown error";
    console.error("[klipper/organization]", message);
    return null;
  }

  let professionals: KlipperProfessionalPublic[] = [];
  try {
    // organization_id (no el slug) es lo que de verdad filtra este
    // endpoint del lado del servidor — ver el comentario en
    // lib/klipper/client.ts:getUsersToAppointment.
    const users = await getUsersToAppointment(slug, organization.id, CACHE_OPTIONS);
    // Solo profesionales de sucursales activas (branches ya viene filtrado
    // por b.active más arriba). Los sin sucursal fija (branch_id null, ej. el
    // dueño) se conservan igual.
    const activeBranchIds = branches.map((b) => b.id);
    professionals = mapUsersToAppointmentToPublic(users, undefined, organization.id, activeBranchIds);
  } catch (err) {
    const message = err instanceof KlipperApiError ? err.message : "unknown error";
    console.error("[klipper/organization] professionals", message);
  }

  return {
    organization,
    branches,
    services,
    professionals,
    organizationLogoUrl,
    organizationInstagramHandle,
  };
});
