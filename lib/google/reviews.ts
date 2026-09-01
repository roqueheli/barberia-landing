// Contenido real de reseñas de Google, combinado desde todas las
// sucursales con googlePlaceId (en vivo desde Klipper, con fallback a lo
// curado — ver lib/organization-content.ts). El rating/conteo de reseñas
// NO se piden acá: Klipper ya los trae directo por sucursal
// (google_rating/google_review_count), así que Hero.tsx los usa
// directamente desde sucursalesView sin pasar por este módulo.
//
// Mismo patrón que lib/klipper/organization.ts/lib/sanity/site-content.ts:
// cache() para dedup entre Server Components, nunca lanza — sin
// GOOGLE_PLACES_API_KEY, sin ninguna sucursal con Place ID, o si todas las
// llamadas fallan, devuelve null y ResenasSection cae a sus reseñas
// curadas actuales.
import "server-only";
import { cache } from "react";
import { sucursales } from "@/data/sucursales";
import { getOrganizationContent } from "@/lib/klipper/organization";
import { mergeSucursales } from "@/lib/organization-content";
import { getPlaceDetails } from "./client";
import { combineReviews, type BranchPlaceDetails } from "./aggregate";
import type { GoogleReview } from "@/types/google";

export const getBusinessReviews = cache(async (): Promise<GoogleReview[] | null> => {
  if (!process.env.GOOGLE_PLACES_API_KEY) return null;

  const content = await getOrganizationContent();
  const sucursalesView = mergeSucursales(content?.branches ?? null, sucursales);
  const branchesWithPlaceId = sucursalesView.filter((s) => s.googlePlaceId);
  if (branchesWithPlaceId.length === 0) return null;

  const results = await Promise.allSettled(
    branchesWithPlaceId.map(async (s) => ({
      sucursalNombre: s.nombre,
      details: await getPlaceDetails(s.googlePlaceId as string),
    }))
  );

  const succeeded: BranchPlaceDetails[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      succeeded.push(result.value);
    } else {
      console.error("[google/reviews]", result.reason instanceof Error ? result.reason.message : result.reason);
    }
  }

  if (succeeded.length === 0) return null;
  return combineReviews(succeeded);
});
