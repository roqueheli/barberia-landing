// Cliente a Places API (New) de Google. Server-only: GOOGLE_PLACES_API_KEY
// nunca debe llegar al bundle del navegador — a diferencia del código de
// referencia de Klipper (que usa una env var NEXT_PUBLIC_ aunque la llamada
// es server-side), acá el nombre de la variable no lleva ese prefijo a
// propósito, así Next.js ni siquiera la expone al cliente por error.
import "server-only";
import { cache } from "react";
import type { GooglePlaceDetailsRaw } from "@/types/google";

const PLACES_API_BASE_URL = "https://places.googleapis.com/v1";
const TIMEOUT_MS = 8000;

// Field masks separados por propósito — nunca combinar los dos. Verificado
// contra la documentación oficial de Places API (New): rating/
// userRatingCount son SKU "Enterprise", reviews es SKU
// "Enterprise + Atmosphere" (más caro, con límite gratuito menor). Google
// factura toda la llamada al SKU más alto de los campos pedidos, así que
// pedir reviews junto con rating/userRatingCount en el mismo mask hace que
// esos dos también se facturen como Enterprise + Atmosphere aunque por sí
// solos costarían menos — ver lib/sanity/sucursales.ts (solo necesita
// rating/userRatingCount) vs lib/google/reviews.ts (solo necesita reviews).
export const RATING_FIELD_MASK = "rating,userRatingCount";
export const REVIEWS_FIELD_MASK = "reviews";

function getApiKey(): string | null {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  return key && key.trim().length > 0 ? key : null;
}

// cache() de React: si el mismo placeId+fieldMask se pide más de una vez
// dentro del mismo render (ej. dos Server Components independientes que
// terminan necesitando el mismo dato), la llamada de red real se hace una
// sola vez — no depender solo de la deduplicación implícita de fetch().
export const getPlaceDetails = cache(
  async (placeId: string, fieldMask: string): Promise<GooglePlaceDetailsRaw> => {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("GOOGLE_PLACES_API_KEY no está configurada");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(
        `${PLACES_API_BASE_URL}/places/${encodeURIComponent(placeId)}?languageCode=es`,
        {
          signal: controller.signal,
          headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": fieldMask,
          },
          next: { revalidate: 3600, tags: ["google-place-details"] },
        }
      );
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error(`Timeout al llamar a Places API para place_id ${placeId}`);
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      throw new Error(`Places API falló con status ${res.status} para place_id ${placeId}`);
    }

    return (await res.json()) as GooglePlaceDetailsRaw;
  }
);
