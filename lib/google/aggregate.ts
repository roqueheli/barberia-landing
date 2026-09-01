// Lógica pura de combinación de reseñas — separada de lib/google/reviews.ts
// (que hace las llamadas de red) para poder testearla sin mockear fetch,
// mismo criterio que lib/klipper/mappers.ts vs lib/klipper/client.ts.
//
// Solo combina el CONTENIDO de las reseñas (texto/autor/foto): el rating
// y el conteo de reseñas ya vienen directo de Klipper por sucursal
// (google_rating/google_review_count, verificado contra la respuesta real
// de landing_by_slug) — no hace falta llamar a la Places API de Google
// para esos dos números, solo para el texto de las reseñas en sí.
import type { GooglePlaceDetailsRaw, GoogleReview } from "@/types/google";

export interface BranchPlaceDetails {
  sucursalNombre: string;
  details: GooglePlaceDetailsRaw;
}

const MAX_COMBINED_REVIEWS = 6;

function mapReviews(sucursalNombre: string, details: GooglePlaceDetailsRaw): GoogleReview[] {
  const reviews: GoogleReview[] = [];
  (details.reviews ?? []).forEach((r, i) => {
    const rating = r.rating;
    const text = r.text?.text;
    if (rating == null || !text) return;
    reviews.push({
      id: `google-${sucursalNombre}-${i}`,
      authorName: r.authorAttribution?.displayName ?? "Cliente de Google",
      authorPhotoUrl: r.authorAttribution?.photoUri ?? null,
      rating,
      text,
      relativeTime: r.relativePublishTimeDescription ?? null,
      publishTime: r.publishTime ?? null,
      sucursalNombre,
    });
  });
  return reviews;
}

// Combina las reseñas de todas las sucursales, ordenadas por más reciente,
// con un tope para no desbordar la grilla de ResenasSection.
export function combineReviews(branches: BranchPlaceDetails[]): GoogleReview[] {
  const allReviews = branches.flatMap(({ sucursalNombre, details }) =>
    mapReviews(sucursalNombre, details)
  );
  allReviews.sort((a, b) => (b.publishTime ?? "").localeCompare(a.publishTime ?? ""));
  return allReviews.slice(0, MAX_COMBINED_REVIEWS);
}
