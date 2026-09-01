import { describe, expect, it } from "vitest";
import {
  buildServiceIds,
  computeAppointmentDuration,
  computeAvailableSlots,
  filterProfessionalsForBranch,
  filterServicesForBranch,
  isBranchClosed,
  matchBranchByName,
  servicesTotalPrice,
} from "./helpers";
import type { Branch, Organization, SelectedService, Service, User, WeeklySchedule } from "./types";

const TZ = "America/Santiago";

function makeService(overrides: Partial<Service> = {}): Service {
  return { id: 1, name: "Corte", price: 12000, duration: 40, business_type_id: null, ...overrides };
}

const OPEN_SCHEDULE: WeeklySchedule = {
  monday: { active: true, start: "09:00", end: "12:00" },
  tuesday: { active: true, start: "09:00", end: "12:00" },
  wednesday: { active: true, start: "09:00", end: "12:00" },
  thursday: { active: true, start: "09:00", end: "12:00" },
  friday: { active: true, start: "09:00", end: "12:00" },
  saturday: { active: true, start: "09:00", end: "12:00" },
  sunday: { active: false, start: "00:00", end: "00:00" },
};

describe("filterServicesForBranch", () => {
  it("devuelve todos los servicios si la branch no declara business_types", () => {
    const branch: Branch = { id: 1, name: "Providencia", active: true };
    const services = [makeService({ id: 1 }), makeService({ id: 2, business_type_id: 5 })];
    expect(filterServicesForBranch(services, branch)).toHaveLength(2);
  });

  it("filtra servicios cuyo business_type_id no está en la branch", () => {
    const branch: Branch = { id: 1, name: "Providencia", active: true, business_types: [{ id: 5, name: "Barbería" }] };
    const services = [
      makeService({ id: 1, business_type_id: 5 }),
      makeService({ id: 2, business_type_id: 9 }),
      makeService({ id: 3, business_type_id: null }),
    ];
    const result = filterServicesForBranch(services, branch);
    expect(result.map((s) => s.id)).toEqual([1, 3]);
  });
});

describe("filterProfessionalsForBranch", () => {
  const agentRole = { id: 2, name: "agent" };
  const adminRole = { id: 1, name: "admin" };

  const users: User[] = [
    { id: 1, name: "Matías", branch_id: 1, business_type_ids: [5], role: agentRole },
    { id: 2, name: "Javiera", branch_id: 1, business_type_ids: [5], role: adminRole },
    { id: 3, name: "Benjamín", branch_id: 2, business_type_ids: [5], role: agentRole },
    { id: 4, name: "Camila", branch_id: 1, business_type_ids: [9], role: agentRole },
    { id: 5, name: "Dueño", branch_id: null, role: adminRole, is_owner: true },
  ];

  it("incluye agents de la sucursal y al owner (sin importar su sucursal); excluye el resto", () => {
    const result = filterProfessionalsForBranch(users, 1, []);
    expect(result.map((u) => u.id)).toEqual([1, 4, 5]);
  });

  it("filtra además por business_type de los servicios elegidos", () => {
    const selectedServices: SelectedService[] = [
      { service: makeService({ id: 1, business_type_id: 5 }), quantity: 1 },
    ];
    const result = filterProfessionalsForBranch(users, 1, selectedServices);
    // Camila queda fuera (business_type 9, no calza); el owner sin
    // business_type_ids declarado sigue mostrándose (se asume compatible).
    expect(result.map((u) => u.id)).toEqual([1, 5]);
  });
});

describe("computeAppointmentDuration", () => {
  it("usa appointment_average_time cuando use_average_time es true", () => {
    const org: Organization = {
      id: 1,
      name: "Org",
      slug: "org",
      metadata: { appointment: { use_average_time: true, appointment_average_time: 45 } },
    };
    expect(computeAppointmentDuration(org, [])).toBe(45);
  });

  it("suma la duración de los servicios (por cantidad) cuando use_average_time es false", () => {
    const org: Organization = { id: 1, name: "Org", slug: "org", metadata: { appointment: { use_average_time: false } } };
    const selected: SelectedService[] = [
      { service: makeService({ duration: 30 }), quantity: 2 },
      { service: makeService({ id: 2, duration: 20 }), quantity: 1 },
    ];
    expect(computeAppointmentDuration(org, selected)).toBe(80);
  });

  it("cae a 60 si la suma de duraciones es 0", () => {
    const org: Organization = { id: 1, name: "Org", slug: "org" };
    expect(computeAppointmentDuration(org, [])).toBe(60);
  });
});

describe("buildServiceIds / servicesTotalPrice", () => {
  it("repite el id de servicio según la cantidad elegida", () => {
    const selected: SelectedService[] = [
      { service: makeService({ id: 1 }), quantity: 2 },
      { service: makeService({ id: 2 }), quantity: 1 },
    ];
    expect(buildServiceIds(selected)).toEqual([1, 1, 2]);
  });

  it("suma precio * cantidad", () => {
    const selected: SelectedService[] = [
      { service: makeService({ price: 10000 }), quantity: 2 },
      { service: makeService({ id: 2, price: 5000 }), quantity: 1 },
    ];
    expect(servicesTotalPrice(selected)).toBe(25000);
  });
});

describe("matchBranchByName", () => {
  const branches: Branch[] = [
    { id: 1, name: "Providencia", active: true },
    { id: 2, name: "Las Condes", active: true },
  ];

  it("matchea por nombre contenido en el nombre de marketing", () => {
    expect(matchBranchByName("Better Barber Club Providencia", "providencia", branches)?.id).toBe(1);
  });

  it("matchea por fragmento del slug contenido en el nombre real", () => {
    expect(matchBranchByName("Casa Las Condes", "las-condes", branches)?.id).toBe(2);
  });

  it("devuelve null si no hay match", () => {
    expect(matchBranchByName("La Florida", "la-florida", branches)).toBeNull();
  });
});

describe("isBranchClosed", () => {
  it("es true para un día sin schedule activo", () => {
    // 2026-08-30 es domingo
    expect(isBranchClosed("2026-08-30", TZ, OPEN_SCHEDULE)).toBe(true);
  });

  it("es false para un día con schedule activo", () => {
    // 2026-08-31 es lunes
    expect(isBranchClosed("2026-08-31", TZ, OPEN_SCHEDULE)).toBe(false);
  });
});

describe("computeAvailableSlots", () => {
  it("no devuelve horarios si la sucursal está cerrada ese día", () => {
    const slots = computeAvailableSlots({
      date: "2026-08-30", // domingo, cerrado
      timezone: TZ,
      weeklySchedule: OPEN_SCHEDULE,
      attendances: [],
      durationMinutes: 40,
    });
    expect(slots).toEqual([]);
  });

  it("genera slots dentro del horario que no superen el cierre", () => {
    const slots = computeAvailableSlots({
      date: "2026-08-31", // lunes, 09:00-12:00
      timezone: TZ,
      weeklySchedule: OPEN_SCHEDULE,
      attendances: [],
      durationMinutes: 60,
      stepMinutes: 60,
    });
    // 09:00, 10:00, 11:00 caben (11:00+60=12:00 == cierre, incluido)
    expect(slots.map((s) => s.start)).toEqual(["09:00", "10:00", "11:00"]);
  });

  it("excluye horarios que se solapan con una cita existente", () => {
    const slots = computeAvailableSlots({
      date: "2026-08-31",
      timezone: TZ,
      weeklySchedule: OPEN_SCHEDULE,
      attendances: [{ appointment_at: "2026-08-31T10:00:00", duration: 60 }],
      durationMinutes: 60,
      stepMinutes: 60,
    });
    expect(slots.map((s) => s.start)).toEqual(["09:00", "11:00"]);
  });

  it("no devuelve slots si la duración es 0 o negativa", () => {
    expect(
      computeAvailableSlots({
        date: "2026-08-31",
        timezone: TZ,
        weeklySchedule: OPEN_SCHEDULE,
        attendances: [],
        durationMinutes: 0,
      })
    ).toEqual([]);
  });
});
