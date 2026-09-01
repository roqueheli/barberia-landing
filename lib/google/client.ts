// Cliente a Places API (New) de Google. Server-only: GOOGLE_PLACES_API_KEY
// nunca debe llegar al bundle del navegador — a diferencia del código de
// referencia de Klipper (que usa una env var NEXT_PUBLIC_ aunque la llamada
// es server-side), acá el nombre de la variable no lleva ese prefijo a
// propósito, así Next.js ni siquiera la expone al cliente por error.
import "server-only";
import type { GooglePlaceDetailsRaw } from "@/types/google";

const PLACES_API_BASE_URL = "https://places.googleapis.com/v1";
const FIELD_MASK = "rating,userRatingCount,reviews";
const TIMEOUT_MS = 8000;

function getApiKey(): string | null {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  return key && key.trim().length > 0 ? key : null;
}

export async function getPlaceDetails(placeId: string): Promise<GooglePlaceDetailsRaw> {
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
          "X-Goog-FieldMask": FIELD_MASK,
        },
        next: { revalidate: 3600, tags: ["google-reviews"] },
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
