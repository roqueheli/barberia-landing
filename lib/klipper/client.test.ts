import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAppointment,
  getAppointmentData,
  getStatus,
  getUsersToAppointment,
} from "./client";
import {
  KlipperNonJsonResponseError,
  KlipperNotFoundError,
  TimeSlotTakenError,
  ValidationError,
} from "./errors";
import { mapAppointmentDataToPublic, mapUsersToAppointmentToPublic } from "./mappers";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function htmlResponse(body: string, status = 400) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html" },
  });
}

describe("klipper client env config", () => {
  beforeEach(() => {
    vi.stubEnv("KLIPPER_API_BASE_URL", "https://api.klipperapp.test");
    vi.stubEnv("KLIPPER_ORG_SLUG", "oficio-barberia");
    vi.stubEnv("KLIPPER_API_TIMEOUT_MS", "8000");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("trata allow_appointments === null como falso, nunca como truthy por accidente", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        active: true,
        subscription_status: "active",
        is_active_until_valid: true,
        allow_appointments: null,
        appointment_average_time: 30,
        appointment_consent: false,
        appointment_security_validation: false,
        skip_branch_step: false,
        skip_service_step: false,
        military_time: true,
        use_average_time: true,
        time_zone: "America/Santiago",
      })
    );

    const status = await getStatus("oficio-barberia");
    expect(status).not.toBeNull();
    expect(Boolean(status?.allow_appointments)).toBe(false);
  });

  it("status_by_slug con 404 devuelve null (no error) para caer al fallback de WhatsApp", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 404 }));
    const status = await getStatus("slug-inexistente");
    expect(status).toBeNull();
  });

  it("appointment_data con users: [] permite el fallback a users_to_appointment", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ users: [] }));

    const data = await getAppointmentData("oficio-barberia", {
      startDate: "2026-09-01",
      endDate: "2026-09-08",
    });
    const professionals = mapAppointmentDataToPublic(data);
    expect(professionals).toHaveLength(0);

    // users_to_appointment devuelve un array plano, no {users: [...]}.
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse([
        {
          id: 1,
          name: "Matías Rojas",
          email: "matias@oficio.cl",
          photo_url: "https://example.com/matias.jpg",
          role_id: 1,
          role: { id: 1, name: "admin" },
          is_owner: true,
          can_charge: true,
          email_verified: true,
          contract_info: { secret: "no-deberia-salir" },
        },
      ])
    );
    const fallback = await getUsersToAppointment("oficio-barberia");
    const publicProfessionals = mapUsersToAppointmentToPublic(fallback);
    expect(publicProfessionals).toEqual([
      { id: 1, name: "Matías Rojas", photo_url: "https://example.com/matias.jpg", role_name: "admin" },
    ]);
    // El mapper nunca debe filtrar campos sensibles hacia afuera.
    expect(publicProfessionals[0]).not.toHaveProperty("email");
    expect(publicProfessionals[0]).not.toHaveProperty("contract_info");
    expect(publicProfessionals[0]).not.toHaveProperty("can_charge");
  });

  it("createAppointment: un 400 con Content-Type text/html no lanza una excepción de parseo sin controlar", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      htmlResponse("<html><body>ActionController::ParameterMissing</body></html>", 400)
    );

    await expect(
      createAppointment({
        organization_id: 1,
        name: "Juan Pérez",
        email: "juan@example.com",
        phone: "+56912345678",
        appointment_at: "2026-09-10T15:00:00",
        service_ids: [10],
        branch_id: 1,
        attended_by: 2,
      })
    ).rejects.toBeInstanceOf(KlipperNonJsonResponseError);
  });

  it("createAppointment valida branch_id/attended_by antes de salir a la red si faltan", async () => {
    const fetchMock = vi.mocked(fetch);
    await expect(
      createAppointment({
        organization_id: 1,
        name: "Juan Pérez",
        email: "juan@example.com",
        phone: "+56912345678",
        appointment_at: "2026-09-10T15:00:00",
        service_ids: [10],
        branch_id: 1,
        // @ts-expect-error -- probando el caso de attended_by faltante
        attended_by: undefined,
      })
    ).rejects.toBeInstanceOf(ValidationError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("createAppointment mapea 422 con time_slot_taken a TimeSlotTakenError", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ errors: { time_slot_taken: ["ese horario ya fue tomado"] } }, 422)
    );

    await expect(
      createAppointment({
        organization_id: 1,
        name: "Juan Pérez",
        email: "juan@example.com",
        phone: "+56912345678",
        appointment_at: "2026-09-10T15:00:00",
        service_ids: [10],
        branch_id: 1,
        attended_by: 2,
      })
    ).rejects.toBeInstanceOf(TimeSlotTakenError);
  });

  it("createAppointment mapea 422 genérico (ActiveModel errors) a ValidationError con fieldErrors", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ attended_by: ["can't be blank"] }, 422)
    );

    await expect(
      createAppointment({
        organization_id: 1,
        name: "Juan Pérez",
        email: "juan@example.com",
        phone: "+56912345678",
        appointment_at: "2026-09-10T15:00:00",
        service_ids: [10],
        branch_id: 1,
        attended_by: 2,
      })
    ).rejects.toMatchObject({
      fieldErrors: { attended_by: ["can't be blank"] },
    });
  });

  it("createAppointment trata 200 (no 201) como éxito", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(
        {
          id: 99,
          status: "pending",
          appointment_at: "2026-09-10T15:00:00",
          attended_by_user: { id: 2, name: "Barbero", photo_url: null },
          profile: { id: 5, name: "Juan Pérez" },
          services: [],
          child_attendances: [],
        },
        200
      )
    );

    const result = await createAppointment({
      organization_id: 1,
      name: "Juan Pérez",
      email: "juan@example.com",
      phone: "+56912345678",
      appointment_at: "2026-09-10T15:00:00",
      service_ids: [10],
      branch_id: 1,
      attended_by: 2,
    });
    expect(result.id).toBe(99);
  });

  it("createAppointment con 404 lanza KlipperNotFoundError", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ error: "Organización no encontrada" }, 404)
    );

    await expect(
      createAppointment({
        organization_id: 999,
        name: "Juan Pérez",
        email: "juan@example.com",
        phone: "+56912345678",
        appointment_at: "2026-09-10T15:00:00",
        service_ids: [10],
        branch_id: 1,
        attended_by: 2,
      })
    ).rejects.toBeInstanceOf(KlipperNotFoundError);
  });
});
