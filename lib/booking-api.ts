// Cliente para el flujo de reserva de components/booking/* (GET
// /api/v1/organizations/landing_by_slug/:slug, GET/POST /api/appointment/:slug).
// Originalmente pensado para llamarse directo desde el navegador al dominio
// de Klipper (son endpoints públicos, sin auth) — pero en producción el
// dominio real no devuelve Access-Control-Allow-Origin, así que el
// navegador bloquea la respuesta por CORS aunque el backend responda 200.
// Por eso estas llamadas van a app/api/booking/* (Route Handlers same-origin
// que hacen de proxy server-side, mismo patrón que lib/klipper/client.ts),
// no directo al dominio de Klipper.
import type {
  CalendarData,
  CreateAppointmentPayload,
  CreateAppointmentResponse,
  LandingData,
} from "@/components/booking/types";

// El backend real observado no siempre setea Content-Type: application/json
// (un 404 de ejemplo llegó como text/plain con un body JSON válido), así que
// acá se intenta parsear igual y solo se cae a un mensaje genérico si el
// parseo realmente falla — no se puede confiar en el header como en otras
// integraciones.
async function parseJsonLenient(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return undefined; // marca "no es JSON parseable"
  }
}

function extractErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (typeof record.error === "string") return record.error;
    if (typeof record.message === "string") return record.message;
  }
  return fallback;
}

export async function fetchLandingData(): Promise<LandingData> {
  const res = await fetch("/api/booking/landing");
  const data = await parseJsonLenient(res);
  if (!res.ok || data === undefined || data === null) {
    throw new Error(
      extractErrorMessage(data, "No pudimos cargar la información de la sucursal. Intenta de nuevo.")
    );
  }
  return data as LandingData;
}

export interface FetchCalendarParams {
  userId: number;
  date: string; // YYYY-MM-DD
  timezone: string;
}

export async function fetchCalendar(params: FetchCalendarParams): Promise<CalendarData> {
  const search = new URLSearchParams({
    user_id: String(params.userId),
    date: params.date,
    timezone: params.timezone,
  });
  const res = await fetch(`/api/booking/calendar?${search.toString()}`);
  const data = await parseJsonLenient(res);
  if (!res.ok || data === undefined || data === null) {
    throw new Error(extractErrorMessage(data, "No pudimos cargar la disponibilidad. Intenta de nuevo."));
  }
  return data as CalendarData;
}

export async function createAppointment(
  payload: CreateAppointmentPayload
): Promise<CreateAppointmentResponse> {
  const res = await fetch("/api/booking/appointment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonLenient(res);
  if (!res.ok || data === undefined || data === null) {
    throw new Error(
      extractErrorMessage(data, "No pudimos crear tu cita, intenta de nuevo o escríbenos por WhatsApp.")
    );
  }
  return data as CreateAppointmentResponse;
}
