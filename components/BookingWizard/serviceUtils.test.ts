import { describe, expect, it } from "vitest";
import { resolveSelectedService, resolveServicesForBranch } from "./serviceUtils";
import type { BookingService } from "@/types/klipper";

const svc = (over: Partial<BookingService> & Pick<BookingService, "id" | "name" | "price">): BookingService => ({
  duration: 30,
  branchId: null,
  ...over,
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
});
