// Cliente a la API pública de Klipper. Server-only: KLIPPER_API_BASE_URL y
// KLIPPER_ORG_SLUG nunca deben llegar al bundle del navegador, así que este
// módulo solo debe importarse desde Route Handlers (app/api/klipper/*).
import "server-only";

import type {
  CreateAppointmentPayload,
  CreateAppointmentResponse,
  KlipperAppointmentDataResponse,
  KlipperLandingResponse,
  KlipperStatus,
  KlipperUserCalendarResponse,
  KlipperUsersToAppointmentResponse,
} from "@/types/klipper";
import type { Offer } from "@/types/offer";
import {
  KlipperApiError,
  KlipperNonJsonResponseError,
  KlipperNotFoundError,
  KlipperTimeoutError,
  TimeSlotTakenError,
  ValidationError,
} from "./errors";

function getBaseUrl(): string {
  const url = process.env.KLIPPER_API_BASE_URL;
  if (!url) {
    throw new Error("KLIPPER_API_BASE_URL no está configurada");
  }
  return url.replace(/\/+$/, "");
}

function getTimeoutMs(): number {
  const raw = process.env.KLIPPER_API_TIMEOUT_MS;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 8000;
}

export interface KlipperCacheOptions {
  revalidate?: number | false;
  tags?: string[];
}

async function fetchKlipper(
  path: string,
  init?: RequestInit,
  cacheOptions?: KlipperCacheOptions
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getTimeoutMs());

  try {
    return await fetch(`${getBaseUrl()}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },
      ...(cacheOptions ? { next: cacheOptions } : {}),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new KlipperTimeoutError(`Timeout al llamar a Klipper: ${path}`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

async function parseJsonSafely<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new KlipperNonJsonResponseError(
      "Respuesta inesperada del servidor de Klipper (no es JSON)",
      res.status
    );
  }
  return (await res.json()) as T;
}

export async function getStatus(slug: string): Promise<KlipperStatus | null> {
  const res = await fetchKlipper(`/api/v1/status_by_slug/${encodeURIComponent(slug)}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new KlipperApiError(`status_by_slug falló con status ${res.status}`, res.status);
  }
  return parseJsonSafely<KlipperStatus>(res);
}

export async function getLanding(
  slug: string,
  cacheOptions?: KlipperCacheOptions
): Promise<KlipperLandingResponse> {
  const res = await fetchKlipper(
    `/api/v1/organizations/landing_by_slug/${encodeURIComponent(slug)}`,
    undefined,
    cacheOptions
  );
  if (res.status === 404) {
    throw new KlipperNotFoundError("Organización no encontrada");
  }
  if (!res.ok) {
    throw new KlipperApiError(`landing_by_slug falló con status ${res.status}`, res.status);
  }
  return parseJsonSafely<KlipperLandingResponse>(res);
}

export interface AppointmentDataParams {
  startDate: string;
  endDate: string;
  serviceId?: number;
  serviceIds?: number[];
}

export async function getAppointmentData(
  slug: string,
  params: AppointmentDataParams
): Promise<KlipperAppointmentDataResponse> {
  const search = new URLSearchParams();
  search.set("start_date", params.startDate);
  search.set("end_date", params.endDate);
  if (params.serviceId != null) {
    search.set("service_id", String(params.serviceId));
  }
  for (const id of params.serviceIds ?? []) {
    search.append("service_ids[]", String(id));
  }

  const res = await fetchKlipper(
    `/api/v1/organizations/appointment_data/${encodeURIComponent(slug)}?${search.toString()}`
  );
  if (res.status === 404) {
    throw new KlipperNotFoundError("Organización no encontrada");
  }
  if (!res.ok) {
    throw new KlipperApiError(`appointment_data falló con status ${res.status}`, res.status);
  }
  return parseJsonSafely<KlipperAppointmentDataResponse>(res);
}

export async function getUsersToAppointment(
  slug: string,
  organizationId?: number,
  cacheOptions?: KlipperCacheOptions
): Promise<KlipperUsersToAppointmentResponse> {
  // organization_id es el único parámetro que Klipper realmente usa para
  // filtrar este endpoint — organization_slug se acepta pero se ignora
  // (verificado contra el backend real: con solo el slug devuelve usuarios
  // de decenas de organizaciones distintas mezclados; con organization_id
  // filtra correctamente). Se manda igual el slug como fallback por si en
  // algún caso no se conoce el id numérico todavía.
  const search = new URLSearchParams(
    organizationId != null ? { organization_id: String(organizationId) } : { organization_slug: slug }
  );
  const res = await fetchKlipper(
    `/api/v1/users_to_appointment?${search.toString()}`,
    undefined,
    cacheOptions
  );
  if (!res.ok) {
    throw new KlipperApiError(`users_to_appointment falló con status ${res.status}`, res.status);
  }
  return parseJsonSafely<KlipperUsersToAppointmentResponse>(res);
}

// GET /offers?organization_id={id}: ofertas/promociones públicas de la
// organización (sin auth — verificado contra el backend real; la variante
// /offers/public responde 401). organization_id es el filtro real: sin él
// no se puede consultar de forma confiable. Devuelve un array plano de
// Offer; el filtrado por vigencia/activa se hace en el cliente (ver
// lib/offers-api.ts). El caller (route handler) degrada a [] ante cualquier
// error para nunca romper la landing.
export async function getOffers(
  organizationId: number,
  cacheOptions?: KlipperCacheOptions
): Promise<Offer[]> {
  const search = new URLSearchParams({ organization_id: String(organizationId) });
  const res = await fetchKlipper(`/api/v1/offers?${search.toString()}`, undefined, cacheOptions);
  if (!res.ok) {
    throw new KlipperApiError(`offers falló con status ${res.status}`, res.status);
  }
  const data = await parseJsonSafely<unknown>(res);
  return Array.isArray(data) ? (data as Offer[]) : [];
}

export interface UserCalendarParams {
  userId: number;
  date: string; // "YYYY-MM-DD"
  timezone: string;
}

// GET /user_calendar: calendario crudo (turno del día + citas ya tomadas)
// de UN profesional puntual. A diferencia de appointment_data, funciona
// para cualquier rol (verificado con usuarios role: "admin") — es lo que
// permite calcular horarios reales para profesionales que Klipper no
// considera "agent". No requiere autenticación (a diferencia de
// /attendances, que devuelve 401 sin sesión de administrador).
export async function getUserCalendar(params: UserCalendarParams): Promise<KlipperUserCalendarResponse> {
  const search = new URLSearchParams({
    user_id: String(params.userId),
    date: params.date,
    timezone: params.timezone,
  });
  const res = await fetchKlipper(`/api/v1/user_calendar?${search.toString()}`);
  if (!res.ok) {
    throw new KlipperApiError(`user_calendar falló con status ${res.status}`, res.status);
  }
  return parseJsonSafely<KlipperUserCalendarResponse>(res);
}

function findTimeSlotTakenMessage(data: unknown, depth = 0): string | null {
  if (depth > 3 || !data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  if ("time_slot_taken" in record) {
    const value = record.time_slot_taken;
    if (Array.isArray(value)) return value.join(", ") || "Ese horario se acaba de ocupar, elige otro.";
    if (typeof value === "string") return value;
    return "Ese horario se acaba de ocupar, elige otro.";
  }
  for (const value of Object.values(record)) {
    if (value && typeof value === "object") {
      const found = findTimeSlotTakenMessage(value, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

function extractFieldErrors(data: unknown): Record<string, string[]> {
  if (!data || typeof data !== "object") return {};
  const record = data as Record<string, unknown>;
  const candidate =
    record.errors && typeof record.errors === "object"
      ? (record.errors as Record<string, unknown>)
      : record;

  const result: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(candidate)) {
    if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
      result[key] = value as string[];
    }
  }
  return result;
}

export async function createAppointment(
  payload: CreateAppointmentPayload
): Promise<CreateAppointmentResponse> {
  // El backend responde 500 sin mensaje (verificado directo, incluso con
  // profesionales/horarios reales válidos) si branch_id/attended_by no
  // vienen — nunca confiar solo en el backend para esto: validar antes de
  // salir a la red.
  if (!payload.branch_id || !payload.attended_by) {
    throw new ValidationError(
      "branch_id y attended_by son obligatorios",
      400,
      { branch_id: ["branch_id y attended_by son obligatorios"] }
    );
  }

  const res = await fetchKlipper(`/api/v1/attendances/appointment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new KlipperNonJsonResponseError(
      "No pudimos procesar tu reserva, intenta de nuevo o escríbenos por WhatsApp.",
      res.status
    );
  }

  const data = (await res.json()) as unknown;

  // Éxito es 200, no 201.
  if (res.status === 200) {
    return data as CreateAppointmentResponse;
  }

  if (res.status === 404) {
    const message =
      (data as { error?: string } | null)?.error ?? "Organización no encontrada";
    throw new KlipperNotFoundError(message);
  }

  if (res.status === 422) {
    const timeSlotTaken = findTimeSlotTakenMessage(data);
    if (timeSlotTaken) {
      throw new TimeSlotTakenError(timeSlotTaken);
    }
    throw new ValidationError(
      "Hay errores de validación en la reserva",
      422,
      extractFieldErrors(data)
    );
  }

  throw new KlipperApiError(`attendances/appointment falló con status ${res.status}`, res.status);
}
