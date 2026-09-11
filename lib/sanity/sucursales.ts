// Sucursales creadas 100% en Sanity, sin sucursal real en Klipper detrás
// (ej. una sucursal que agenda con Agenda Pro en vez del wizard interno).
// Se producen directamente como SucursalView (no como el tipo Sucursal
// curado/estricto de data/sucursales.ts) porque ese tipo exige campos que
// acá son opcionales — SucursalView ya tolera cualquiera de ellos ausente
// en toda la UI (SucursalCard, página de detalle, JSON-LD). Mismo patrón
// que lib/sanity/site-content.ts: cache() para dedup, nunca lanza, [] si
// Sanity no está configurado o la llamada falla — una sucursal de Sanity
// caída no debe tumbar la sección completa de sucursales.
import "server-only";
import { cache } from "react";
import { sanityClient, urlForImage, SANITY_PROJECT_ID } from "./client";
import { getPlaceDetails } from "@/lib/google/client";
import type { SucursalView } from "@/lib/organization-content";
import type { SanityImageSource } from "@sanity/image-url";

interface SanitySucursalRaw {
  _id: string;
  nombre?: string | null;
  slug?: { current?: string | null } | null;
  agendaUrl?: string | null;
  comuna?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  region?: string | null;
  codigoPostal?: string | null;
  telefono?: string | null;
  whatsapp?: string | null;
  referenciaMetro?: string | null;
  horario?: { dias?: string | null; horas?: string | null }[] | null;
  googlePlaceId?: string | null;
  // Respaldo manual: solo se usa si no hay googlePlaceId, o si Google no
  // responde (ver mapSucursal).
  rating?: number | null;
  numeroResenas?: number | null;
  numeroBarberos?: number | null;
  descripcionCorta?: string | null;
  imagenPortada?: SanityImageSource | null;
  imagenPortadaAlt?: string | null;
  galeria?: { image?: SanityImageSource | null; alt?: string | null }[] | null;
  mapsUrl?: string | null;
  geoLat?: number | null;
  geoLng?: number | null;
  destacada?: boolean | null;
}

const SUCURSALES_QUERY = `*[_type == "sucursal" && defined(slug.current) && defined(agendaUrl)]{
  _id, nombre, slug, agendaUrl, comuna, direccion, ciudad, region, codigoPostal,
  telefono, whatsapp, referenciaMetro, horario, googlePlaceId, rating, numeroResenas,
  numeroBarberos, descripcionCorta, imagenPortada, imagenPortadaAlt, galeria, mapsUrl,
  geoLat, geoLng, destacada
}`;

// Con googlePlaceId cargado, el rating/numeroResenas real se trae en vivo
// de Google (mismo mecanismo que ya usan las sucursales de Klipper —
// lib/klipper/organization.ts) en vez de depender de los campos manuales.
// Nunca lanza: si Google falla (ID inválido, red caída, sin
// GOOGLE_PLACES_API_KEY), cae a rating/numeroResenas manuales si los hay.
async function resolveGoogleRating(
  raw: SanitySucursalRaw
): Promise<{ rating: number | undefined; numeroResenas: number | undefined }> {
  const fallback = { rating: raw.rating ?? undefined, numeroResenas: raw.numeroResenas ?? undefined };
  if (!raw.googlePlaceId) return fallback;

  try {
    const details = await getPlaceDetails(raw.googlePlaceId);
    return {
      rating: details.rating ?? fallback.rating,
      numeroResenas: details.userRatingCount ?? fallback.numeroResenas,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("[sanity/sucursales] googlePlaceId", raw.googlePlaceId, message);
    return fallback;
  }
}

async function mapSucursal(raw: SanitySucursalRaw): Promise<SucursalView | null> {
  const slug = raw.slug?.current;
  if (!slug || !raw.nombre || !raw.agendaUrl) return null;

  const horario = (raw.horario ?? [])
    .filter((h): h is { dias: string; horas: string } => Boolean(h.dias && h.horas))
    .map((h) => ({ dias: h.dias, horas: h.horas }));

  const galeria = (raw.galeria ?? [])
    .filter((g): g is { image: SanityImageSource; alt?: string | null } => Boolean(g.image))
    .map((g) => ({ src: urlForImage(g.image), alt: g.alt ?? raw.nombre ?? "" }));

  const { rating, numeroResenas } = await resolveGoogleRating(raw);

  return {
    slug,
    nombre: raw.nombre,
    agendaUrl: raw.agendaUrl,
    direccion: raw.direccion ?? "",
    telefono: raw.telefono ?? "",
    whatsapp: raw.whatsapp ?? undefined,
    geo: raw.geoLat != null && raw.geoLng != null ? { lat: raw.geoLat, lng: raw.geoLng } : undefined,
    mapsUrl: raw.mapsUrl ?? undefined,
    comuna: raw.comuna ?? undefined,
    ciudad: raw.ciudad ?? undefined,
    region: raw.region ?? undefined,
    codigoPostal: raw.codigoPostal ?? undefined,
    referenciaMetro: raw.referenciaMetro ?? undefined,
    horario,
    rating,
    numeroResenas,
    numeroBarberos: raw.numeroBarberos ?? undefined,
    descripcionCorta: raw.descripcionCorta ?? undefined,
    imagenPortada: raw.imagenPortada ? urlForImage(raw.imagenPortada) : undefined,
    // Foto de Sanity, no de Klipper: dominio confirmado (cdn.sanity.io ya
    // está en next.config.ts) — se renderiza con next/image como el resto
    // del contenido de Sanity, no con <img> plano.
    imagenPortadaEnVivo: false,
    imagenPortadaAlt: raw.imagenPortadaAlt ?? (raw.imagenPortada ? raw.nombre : undefined),
    galeria,
    destacada: raw.destacada ?? undefined,
    // googlePlaceId ?? undefined: lib/google/reviews.ts:getBusinessReviews
    // lo usa para traer el CONTENIDO de reseñas (texto/autor/foto) de esta
    // misma sucursal para ResenasSection.
    googlePlaceId: raw.googlePlaceId ?? undefined,
    enVivo: false,
  };
}

export const getSanitySucursales = cache(async (): Promise<SucursalView[]> => {
  if (!SANITY_PROJECT_ID) return [];

  try {
    const raw = await sanityClient.fetch<SanitySucursalRaw[]>(
      SUCURSALES_QUERY,
      {},
      { next: { revalidate: 300, tags: ["sanity-sucursales"] } }
    );
    const mapped = await Promise.all(raw.map(mapSucursal));
    return mapped.filter((s): s is SucursalView => s != null);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("[sanity/sucursales]", message);
    return [];
  }
});
