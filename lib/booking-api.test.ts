import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAppointment, fetchLandingData } from "./booking-api";

function textResponse(body: string, status: number, contentType: string) {
  return new Response(body, { status, headers: { "content-type": contentType } });
}

describe("booking-api", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("llama al proxy same-origin /api/booking/landing, no directo al dominio de Klipper", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      textResponse(JSON.stringify({ organization: { id: 1 }, branches: [], users: [], services: [], products: [] }), 200, "application/json")
    );
    await fetchLandingData();
    expect(fetch).toHaveBeenCalledWith("/api/booking/landing");
  });

  it("parsea JSON válido aunque el Content-Type mienta (observado en el backend real)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      textResponse(
        JSON.stringify({ error: "Organization get failure", status: 404 }),
        404,
        "text/plain;charset=UTF-8"
      )
    );
    await expect(fetchLandingData()).rejects.toThrow("Organization get failure");
  });

  it("cae a un mensaje genérico si el body no es JSON parseable", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(textResponse("<html>500</html>", 500, "text/html"));
    await expect(fetchLandingData()).rejects.toThrow(/No pudimos cargar/);
  });

  it("createAppointment devuelve la respuesta cuando el POST es exitoso", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      textResponse(JSON.stringify({ id: 42, status: "pending" }), 200, "application/json")
    );
    const result = await createAppointment({
      name: "Juan Pérez",
      email: "juan@example.com",
      phone: "+56912345678",
      organization_id: 1,
      branch_id: 2,
      service_ids: [10],
      attended_by: 5,
      appointment_at: "2026-09-10T15:00:00",
    });
    expect(result.id).toBe(42);
  });

  it("createAppointment llama al proxy same-origin /api/booking/appointment", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      textResponse(JSON.stringify({ id: 1 }), 200, "application/json")
    );
    await createAppointment({
      name: "Juan Pérez",
      email: "juan@example.com",
      phone: "+56912345678",
      organization_id: 1,
      branch_id: 2,
      service_ids: [10],
      attended_by: 5,
      appointment_at: "2026-09-10T15:00:00",
    });
    expect(fetch).toHaveBeenCalledWith(
      "/api/booking/appointment",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("createAppointment lanza con el mensaje del backend si falla", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      textResponse(JSON.stringify({ error: "time_slot_taken" }), 422, "text/plain")
    );
    await expect(
      createAppointment({
        name: "Juan Pérez",
        email: "juan@example.com",
        phone: "+56912345678",
        organization_id: 1,
        branch_id: 2,
        service_ids: [10],
        attended_by: 5,
        appointment_at: "2026-09-10T15:00:00",
      })
    ).rejects.toThrow("time_slot_taken");
  });
});
