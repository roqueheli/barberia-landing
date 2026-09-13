// BookingProvider remonta BookingWizard por completo en cada apertura del
// modal de reserva (a propósito, para resetear la selección de sucursal/
// servicio/horario de un intento anterior) — pero eso no debería obligar a
// re-pedir /api/klipper/landing desde cero cada vez: esa respuesta
// (sucursales, servicios, precios) no cambia segundo a segundo, y cada
// re-fetch puede disparar una llamada real a la Places API de Google para
// las sucursales de Sanity con googlePlaceId (ver
// lib/sanity/sucursales.ts) — sin este caché, cada clic en cualquier botón
// "Reservar" del sitio es una llamada real a Google, sin límite.
//
// Caché en memoria del módulo (dura mientras la pestaña esté abierta), con
// TTL corto para que un cambio real de precios/sucursales en Klipper o
// Sanity se refleje rápido igual. Dedup de requests en vuelo para el caso
// de doble clic / apertura simultánea del modal.
import type { BookingLanding } from "@/types/klipper";

const TTL_MS = 60_000;

let cached: { data: BookingLanding; fetchedAt: number } | null = null;
let inFlight: Promise<BookingLanding> | null = null;

export async function fetchBookingLanding(): Promise<BookingLanding> {
  if (cached && Date.now() - cached.fetchedAt < TTL_MS) {
    return cached.data;
  }
  if (inFlight) return inFlight;

  inFlight = fetch("/api/klipper/landing")
    .then(async (res) => {
      if (!res.ok) throw new Error("landing_failed");
      return (await res.json()) as BookingLanding;
    })
    .then((data) => {
      cached = { data, fetchedAt: Date.now() };
      return data;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}
