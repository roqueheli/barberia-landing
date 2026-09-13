import { describe, expect, it } from "vitest";
import { isServiceAvailableInBranch, resolveSelectedService, resolveServicesForBranch } from "./serviceUtils";
import type { BookingService } from "@/types/klipper";

const svc = (over: Partial<BookingService> & Pick<BookingService, "id" | "name" | "price">): BookingService => ({
  duration: 30,
  branchId: null,
  ...over,
});

describe("isServiceAvailableInBranch", () => {
  it("sin branchId elegido, siempre disponible", () => {
    expect(isServiceAvailableInBranch(svc({ id: 1, name: "Corte", price: 1 }), null)).toBe(true);
  });

  it("branchIds undefined = servicio no migrado, disponible en todas", () => {
    expect(isServiceAvailableInBranch(svc({ id: 1, name: "Corte", price: 1 }), 10)).toBe(true);
  });

  it("branchIds vacío = no asignado a ninguna sucursal", () => {
    expect(isServiceAvailableInBranch(svc({ id: 1, name: "Corte", price: 1, branchIds: [] }), 10)).toBe(false);
  });

  it("branchIds con ids = disponible solo en esas sucursales", () => {
    const service = svc({ id: 1, name: "Corte", price: 1, branchIds: [12, 45] });
    expect(isServiceAvailableInBranch(service, 12)).toBe(true);
    expect(isServiceAvailableInBranch(service, 45)).toBe(true);
    expect(isServiceAvailableInBranch(service, 99)).toBe(false);
  });
});

describe("resolveServicesForBranch", () => {
  it("sin registros por sucursal, devuelve los servicios globales tal cual", () => {
    const services = [
      svc({ id: 1, name: "Corte", price: 8000 }),
      svc({ id: 2, name: "Barba", price: 5000 }),
    ];
    expect(resolveServicesForBranch(services, 10).map((s) => s.id)).toEqual([1, 2]);
  });

  it("prefiere el registro específico de la sucursal elegida por sobre el global", () => {
    const services = [
      svc({ id: 1, name: "Corte", price: 8000, branchId: null }),
      svc({ id: 2, name: "Corte", price: 10000, branchId: 10 }),
      svc({ id: 3, name: "Corte", price: 9000, branchId: 20 }),
    ];
    const resolved = resolveServicesForBranch(services, 10);
    expect(resolved).toHaveLength(1);
    expect(resolved[0]).toMatchObject({ id: 2, price: 10000 });
  });

  it("cae al global cuando la sucursal elegida no tiene un registro propio", () => {
    const services = [
      svc({ id: 1, name: "Corte", price: 8000, branchId: null }),
      svc({ id: 2, name: "Corte", price: 10000, branchId: 10 }),
    ];
    const resolved = resolveServicesForBranch(services, 99);
    expect(resolved).toHaveLength(1);
    expect(resolved[0]).toMatchObject({ id: 1, price: 8000 });
  });

  it("de-duplica por nombre (case/espacios) manteniendo el orden de aparición", () => {
    const services = [
      svc({ id: 1, name: "Corte", price: 8000 }),
      svc({ id: 2, name: " corte ", price: 8500, branchId: 10 }),
      svc({ id: 3, name: "Barba", price: 5000 }),
    ];
    const resolved = resolveServicesForBranch(services, 10);
    expect(resolved.map((s) => s.name)).toEqual([" corte ", "Barba"]);
  });

  // Mecanismo real verificado contra Klipper (org better-barber-club,
  // servicio "Corte de Cabello"): un único registro con branch_id null,
  // precio base 15000, y branchPrices con overrides por sucursal — no
  // registros duplicados con su propio branch_id.
  it("aplica el override de branchPrices de la sucursal elegida sobre el precio base", () => {
    const services = [
      svc({
        id: 1,
        name: "Corte de Cabello",
        price: 15000,
        branchPrices: [
          { branchId: 2412, price: 13000 },
          { branchId: 2411, price: 15000 },
        ],
      }),
    ];
    expect(resolveServicesForBranch(services, 2412)[0]).toMatchObject({ price: 13000 });
    expect(resolveServicesForBranch(services, 2411)[0]).toMatchObject({ price: 15000 });
  });

  it("sin override de branchPrices para la sucursal elegida, mantiene el precio base", () => {
    const services = [
      svc({
        id: 1,
        name: "Corte de Cabello",
        price: 15000,
        branchPrices: [{ branchId: 2412, price: 13000 }],
      }),
    ];
    expect(resolveServicesForBranch(services, 999)[0]).toMatchObject({ price: 15000 });
  });

  it("filtra por branch_ids: oculta servicios no asignados a la sucursal elegida", () => {
    const services = [
      svc({ id: 1, name: "Corte", price: 8000, branchIds: [10] }),
      svc({ id: 2, name: "Barba", price: 5000, branchIds: [20] }),
      svc({ id: 3, name: "Cejas", price: 3000 }), // sin branchIds = disponible en todas
    ];
    expect(resolveServicesForBranch(services, 10).map((s) => s.id)).toEqual([1, 3]);
    expect(resolveServicesForBranch(services, 20).map((s) => s.id)).toEqual([2, 3]);
  });

  it("branch_ids vacío no muestra el servicio en ninguna sucursal", () => {
    const services = [svc({ id: 1, name: "Servicio nuevo", price: 5000, branchIds: [] })];
    expect(resolveServicesForBranch(services, 10)).toEqual([]);
  });

  it("una sucursal sin servicios asignados devuelve lista vacía, no lanza", () => {
    const services = [svc({ id: 1, name: "Corte", price: 8000, branchIds: [10] })];
    expect(resolveServicesForBranch(services, 999)).toEqual([]);
  });
});

describe("resolveSelectedService", () => {
  const services = [
    svc({ id: 1, name: "Corte", price: 8000, branchId: null, businessTypeId: 1 }),
    svc({ id: 2, name: "Corte", price: 10000, branchId: 10, businessTypeId: 1 }),
  ];

  it("resuelve el registro de la sucursal aunque el id seleccionado sea el global", () => {
    expect(resolveSelectedService(services, 1, 10)).toMatchObject({ id: 2, price: 10000 });
  });

  it("mantiene el registro global cuando la sucursal no tiene precio propio", () => {
    expect(resolveSelectedService(services, 1, 99)).toMatchObject({ id: 1, price: 8000 });
  });

  it("sin sucursal, devuelve el servicio seleccionado tal cual", () => {
    expect(resolveSelectedService(services, 1, null)).toMatchObject({ id: 1 });
  });

  it("devuelve undefined si no hay servicio seleccionado o no existe", () => {
    expect(resolveSelectedService(services, null, 10)).toBeUndefined();
    expect(resolveSelectedService(services, 999, 10)).toBeUndefined();
  });

  it("aplica el override de branchPrices al registro seleccionado", () => {
    const servicesWithBranchPrices = [
      svc({
        id: 1,
        name: "Corte de Cabello",
        price: 15000,
        branchPrices: [
          { branchId: 2412, price: 13000 },
          { branchId: 2411, price: 15000 },
        ],
      }),
    ];
    expect(resolveSelectedService(servicesWithBranchPrices, 1, 2412)).toMatchObject({ price: 13000 });
    expect(resolveSelectedService(servicesWithBranchPrices, 1, 2411)).toMatchObject({ price: 15000 });
  });
});
