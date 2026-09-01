// Contratos de Places API (New) — la versión vigente de Google (la legacy
// que usa el frontend real de Klipper está congelada desde marzo 2025).
// Solo se pide el campo mask rating,userRatingCount,reviews — Places API
// (New) exige field mask explícito, no hay lista de campos por defecto.
export interface GooglePlaceReviewAuthorAttribution {
  displayName?: string;
  photoUri?: string;
}

export interface GooglePlaceReviewRaw {
  rating?: number;
  text?: { text?: string };
  authorAttribution?: GooglePlaceReviewAuthorAttribution;
  relativePublishTimeDescription?: string;
  publishTime?: string; // RFC 3339
}

export interface GooglePlaceDetailsRaw {
  rating?: number;
  userRatingCount?: number;
  reviews?: GooglePlaceReviewRaw[];
}

// --- DTOs seguros, producidos por lib/google/aggregate.ts ------------------

export interface GoogleReview {
  id: string;
  authorName: string;
  authorPhotoUrl: string | null;
  rating: number;
  text: string;
  relativeTime: string | null;
  publishTime: string | null;
  sucursalNombre: string;
}
