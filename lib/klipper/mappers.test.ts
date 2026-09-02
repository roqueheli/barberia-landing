import { describe, expect, it } from "vitest";
import {
  isBookableKlipperUser,
  mapAppointmentDataToPublic,
  mapLandingToBookingLanding,
  mapMarketingBranch,
  mapMarketingService,
  mapUserToPublicProfessional,
  mapUsersToAppointmentToPublic,
} from "./mappers";
import type {
  KlipperAppointmentDataResponse,
  KlipperBranch,
  KlipperLandingResponse,
  KlipperService,
  KlipperUserRaw,
} from "@/types/klipper";

describe("mapUserToPublicProfessional", () => {
  it("nunca reenvía campos sensibles del UserSerializer crudo", () => {
    const raw: KlipperUserRaw = {
      id: 1,
      name: "Matías Rojas",
      email: "matias@oficio.cl",
      photo_url: "https://example.com/matias.jpg",
      role_id: 3,
      role: { id: 3, name: "agent" },
      contract_info: { salary: 1000000 },
      can_charge: true,
      email_verified: true,
      signature_url: "https://example.com/sig.png",
      stamp_url: "https://example.com/stamp.png",
    };

    const publicProfessional = mapUserToPublicProfessional(raw);

    expect(publicProfessional).toEqual({
      id: 1,
      name: "Matías Rojas",
      photo_url: "https://example.com/matias.jpg",
      role_name: "agent",
    });
    expect(Object.keys(publicProfessional)).toEqual(["id", "name", "photo_url", "role_name"]);
  });
});

describe("isBookableKlipperUser", () => {
  it("es true para role agent", () => {
    expect(isBookableKlipperUser({ id: 1, name: "A", role: { id: 2, name: "agent" } })).toBe(true);
  });

  it("es true para is_owner, sin importar el rol", () => {
    expect(
      isBookableKlipperUser({ id: 1, name: "A", role: { id: 1, name: "admin" }, is_owner: true })
    ).toBe(true);
  });

  it("es false para admin sin is_owner", () => {
    expect(isBookableKlipperUser({ id: 1, name: "A", role: { id: 1, name: "admin" } })).toBe(false);
  });
});

describe("mapAppointmentDataToPublic", () => {
  const data: KlipperAppointmentDataResponse = {
    users: [
      { user: { id: 1, name: "Agent sucursal 1", branch_id: 34 }, available_slots: {} },
      { user: { id: 2, name: "Agent sucursal 2", branch_id: 1 }, available_slots: {} },
      { user: { id: 3, name: "Dueño sin sucursal fija", branch_id: null }, available_slots: {} },
    ],
  };

  it("sin branchId, no filtra (devuelve a todos)", () => {
    expect(mapAppointmentDataToPublic(data).map((p) => p.user.id)).toEqual([1, 2, 3]);
  });

  it("con branchId, solo deja a los de esa sucursal y a los sin sucursal fija", () => {
    expect(mapAppointmentDataToPublic(data, 34).map((p) => p.user.id)).toEqual([1, 3]);
  });
});

describe("mapUsersToAppointmentToPublic", () => {
  const users: KlipperUserRaw[] = [
    { id: 1, name: "Agent sucursal 1", branch_id: 34, role: { id: 2, name: "agent" } },
    { id: 2, name: "Agent sucursal 2", branch_id: 1, role: { id: 2, name: "agent" } },
    { id: 3, name: "Dueño sin sucursal fija", branch_id: null, role: { id: 1, name: "admin" }, is_owner: true },
    { id: 4, name: "Admin sin is_owner", branch_id: 34, role: { id: 1, name: "admin" } },
  ];

  it("excluye a quien no es agent ni is_owner, y filtra por sucursal cuando se pasa branchId", () => {
    const result = mapUsersToAppointmentToPublic(users, 34);
    expect(result.map((p) => p.id)).toEqual([1, 3]);
  });

  it("acepta el array plano tal cual lo devuelve el backend real (no {users: [...]})", () => {
    expect(mapUsersToAppointmentToPublic(users).map((p) => p.id)).toEqual([1, 2, 3]);
  });

  it("filtra por organizationId — users_to_appointment mezcla usuarios de otras organizaciones (verificado contra el backend real)", () => {
    const mixed: KlipperUserRaw[] = [
      { id: 10, name: "Agent org correcta", role: { id: 2, name: "agent" }, organization_id: 1 },
      { id: 11, name: "Agent org ajena", role: { id: 2, name: "agent" }, organization_id: 999 },
      { id: 12, name: "Owner org ajena", role: { id: 1, name: "admin" }, is_owner: true, organization_id: 999 },
    ];
    expect(mapUsersToAppointmentToPublic(mixed, undefined, 1).map((p) => p.id)).toEqual([10]);
  });

  it("excluye profesionales de sucursales inactivas cuando se pasa activeBranchIds; conserva los sin sucursal fija", () => {
    // Solo la sucursal 34 está activa (la 1 quedó inactiva). El agente de la
    // sucursal 1 se excluye; el de la 34 y el dueño (branch_id null) quedan.
    const result = mapUsersToAppointmentToPublic(users, undefined, undefined, [34]);
    expect(result.map((p) => p.id)).toEqual([1, 3]);
  });

  it("sin activeBranchIds no filtra por sucursal activa (comportamiento previo)", () => {
    expect(mapUsersToAppointmentToPublic(users, undefined, undefined, undefined).map((p) => p.id)).toEqual([
      1, 2, 3,
    ]);
  });
});

describe("mapMarketingBranch", () => {
  it("combina address_line1/2, city y phone_number; coerciona lat/lng y google_rating string a number", () => {
    const branch: KlipperBranch = {
      id: 1,
      name: "Providencia",
      active: true,
      address_line1: "Av. Providencia 1810",
      address_line2: "Providencia",
      city: "Santiago",
      phone_number: "+56912345678",
      latitude: "-33.4263",
      longitude: -70.6122,
      photo_url: "https://cdn.jsdelivr.net/gh/example/fachada.jpg",
      google_maps_url: "https://maps.google.com/?cid=123",
      google_place_id: "ChIJp2lHrLDRYpYRWrWXfFtfg3M",
      google_rating: "4.9",
      google_review_count: 128,
    };

    expect(mapMarketingBranch(branch)).toEqual({
      id: 1,
      name: "Providencia",
      address: "Av. Providencia 1810",
      comuna: "Providencia",
      ciudad: "Santiago",
      phone: "+56912345678",
      latitude: -33.4263,
      longitude: -70.6122,
      photoUrl: "https://cdn.jsdelivr.net/gh/example/fachada.jpg",
      googleMapsUrl: "https://maps.google.com/?cid=123",
      googlePlaceId: "ChIJp2lHrLDRYpYRWrWXfFtfg3M",
      googleRating: 4.9,
      googleReviewCount: 128,
      weeklySchedule: undefined,
    });
  });

  it("conserva weekly_schedule tal cual para que el contenido de marketing lo convierta a horario", () => {
    const branch: KlipperBranch = {
      id: 3,
      name: "Con horario",
      active: true,
      weekly_schedule: {
        monday: { start_time: "10:00", end_time: "21:00", is_working_day: true },
      },
    };
    expect(mapMarketingBranch(branch).weeklySchedule).toEqual({
      monday: { start_time: "10:00", end_time: "21:00", is_working_day: true },
    });
  });

  it("devuelve null para campos ausentes o vacíos, sin lanzar", () => {
    const branch: KlipperBranch = { id: 2, name: "Sin geo", active: true };
    expect(mapMarketingBranch(branch)).toEqual({
      id: 2,
      name: "Sin geo",
      address: null,
      comuna: null,
      ciudad: null,
      phone: null,
      latitude: null,
      longitude: null,
      photoUrl: null,
      googleMapsUrl: null,
      googlePlaceId: null,
      googleRating: null,
      googleReviewCount: null,
    });
  });
});

describe("mapMarketingService", () => {
  it("mapea description y photo_url reales de Klipper", () => {
    const service: KlipperService = {
      id: 1,
      name: "Corte de cabello",
      price: 8000,
      duration: 30,
      available_online: true,
      description: "Corte clásico o moderno",
      photo_url: "https://cdn.jsdelivr.net/gh/example/corte.jpg",
    };

    expect(mapMarketingService(service)).toEqual({
      id: 1,
      name: "Corte de cabello",
      price: 8000,
      duration: 30,
      description: "Corte clásico o moderno",
      photoUrl: "https://cdn.jsdelivr.net/gh/example/corte.jpg",
      priceWithOffer: null,
      businessTypeId: null,
    });
  });

  it("devuelve null para description/photo_url ausentes o vacías", () => {
    const service: KlipperService = {
      id: 2,
      name: "Barba",
      price: 5000,
      duration: 20,
      available_online: true,
      description: "",
    };

    expect(mapMarketingService(service)).toEqual({
      id: 2,
      name: "Barba",
      price: 5000,
      duration: 20,
      description: null,
      photoUrl: null,
      priceWithOffer: null,
      businessTypeId: null,
    });
  });
});

describe("mapLandingToBookingLanding", () => {
  it("filtra sucursales inactivas y servicios no disponibles online, y no expone usuarios", () => {
    const landing: KlipperLandingResponse = {
      organization: {
        id: 42,
        name: "OFICIO Barbería",
        slug: "oficio-barberia",
        metadata: { time_zone: "America/Santiago" },
      },
      branches: [
        { id: 1, name: "Providencia", active: true, address_line1: "Av. Providencia 1810" },
        { id: 2, name: "Sucursal cerrada", active: false },
      ],
      services: [
        { id: 10, name: "Corte clásico", price: 12000, duration: 40, available_online: true },
        { id: 11, name: "Solo en local", price: 5000, duration: 15, available_online: false },
      ],
      users: [
        {
          id: 1,
          name: "Matías Rojas",
          email: "matias@oficio.cl",
          contract_info: { secret: true },
        },
      ],
    };

    const result = mapLandingToBookingLanding(landing);

    expect(result.branches).toEqual([
      { id: 1, name: "Providencia", address: "Av. Providencia 1810", phone: null },
    ]);
    expect(result.services).toEqual([
      { id: 10, name: "Corte clásico", price: 12000, duration: 40, businessTypeId: null, branchId: null, priceWithOffer: null },
    ]);
    expect(result.organization).toEqual({
      id: 42,
      name: "OFICIO Barbería",
      timeZone: "America/Santiago",
    });
    expect(result).not.toHaveProperty("users");
  });

  it("coerciona price string a number y conserva branch_id por servicio", () => {
    const landing: KlipperLandingResponse = {
      organization: { id: 1, name: "Org", slug: "org" },
      branches: [{ id: 10, name: "Sucursal A", active: true }],
      services: [
        { id: 1, name: "Corte", price: "8000.0", duration: 30, available_online: true, branch_id: null },
        { id: 2, name: "Corte", price: "10000.0", duration: 30, available_online: true, branch_id: 10 },
      ],
    };
    const result = mapLandingToBookingLanding(landing);
    expect(result.services).toEqual([
      { id: 1, name: "Corte", price: 8000, duration: 30, businessTypeId: null, branchId: null, priceWithOffer: null },
      { id: 2, name: "Corte", price: 10000, duration: 30, businessTypeId: null, branchId: 10, priceWithOffer: null },
    ]);
  });

  it("usa America/Santiago como default de timeZone si el metadata no la trae", () => {
    const landing: KlipperLandingResponse = {
      organization: { id: 1, name: "Org", slug: "org" },
      branches: [],
      services: [],
    };
    const result = mapLandingToBookingLanding(landing);
    expect(result.organization.timeZone).toBe("America/Santiago");
  });
});
