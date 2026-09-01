// Acceso cliente a las ofertas/promociones. El fetch va al proxy propio
// (/api/offers/public), no directo a Klipper: el slug/base de Klipper son
// server-only. El filtrado por vigencia se hace acá, en el cliente, tal como
// espera el contrato — el backend puede devolver ofertas inactivas o vencidas.
import type { Offer } from "@/types/offer";

/**
 * Trae las ofertas desde el proxy propio. Nunca lanza: ante cualquier error
 * (red, JSON inválido, forma inesperada) devuelve [] para no romper la
 * landing — el popup simplemente no aparece.
 */
export async function fetchOffers(signal?: AbortSignal): Promise<Offer[]> {
  try {
    const res = await fetch("/api/offers/public", { signal });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as Offer[]) : [];
  } catch {
    return [];
  }
}

// Parsea "YYYY-MM-DD" como fecha LOCAL con fin de día (23:59:59.999). Usar el
// constructor Date("YYYY-MM-DD") interpretaría el string como UTC medianoche,
// lo que en zonas al oeste de UTC (ej. Chile) adelanta el vencimiento un día.
// Acá se construye explícitamente en hora local para que la oferta siga
// vigente durante todo su último día.
function parseActiveUntilEndOfDayLocal(value: string): number | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 23, 59, 59, 999);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

/**
 * true si la oferta está activa y, si tiene vencimiento, aún no venció
 * (comparando contra `now`, por defecto el instante actual). Una oferta sin
 * `active_until` no vence nunca. Un `active_until` con formato inválido se
 * trata como sin vencimiento (no se descarta la oferta por un dato malo).
 */
export function isOfferActive(offer: Offer, now: number = Date.now()): boolean {
  if (!offer.active) return false;
  if (!offer.active_until) return true;
  const expiresAt = parseActiveUntilEndOfDayLocal(offer.active_until);
  if (expiresAt == null) return true;
  return now <= expiresAt;
}

/** Filtra la lista a solo las ofertas vigentes. */
export function filterActiveOffers(offers: Offer[], now: number = Date.now()): Offer[] {
  return offers.filter((offer) => isOfferActive(offer, now));
}
