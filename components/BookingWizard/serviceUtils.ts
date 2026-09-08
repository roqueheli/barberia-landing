import type { BookingService } from "@/types/klipper";

// Klipper puede representar un precio por sucursal de dos formas: (a) un
// registro de servicio separado con su propio `branch_id` (nunca
// observado en datos reales — se conserva el manejo por si acaso), o (b)
// el mecanismo real verificado contra la respuesta de landing_by_slug
// (org better-barber-club, servicio "Corte de Cabello"): overrides en
// `branchPrices` sobre el MISMO registro (`price` es el precio base/
// default). Estas utilidades resuelven, para la sucursal elegida en el
// wizard, qué precio corresponde mostrar — aplicando ambos mecanismos.

// Clave lógica de un servicio (lo que el cliente percibe como "un servicio",
// más allá de en qué sucursal esté configurado). Se usa el nombre porque los
// registros por sucursal comparten nombre pero tienen ids distintos.
function serviceKey(service: BookingService): string {
  return service.name.trim().toLowerCase();
}

// Aplica el override de branchPrices correspondiente a `branchId`, si
// existe. Nunca muta el servicio original.
function withBranchPrice(service: BookingService, branchId: number | null): BookingService {
  if (branchId == null) return service;
  const override = service.branchPrices?.find((bp) => bp.branchId === branchId);
  if (override == null) return service;
  return { ...service, price: override.price };
}

/**
 * Devuelve un único servicio por clave lógica, eligiendo para `branchId` el
 * registro específico de esa sucursal cuando existe (mecanismo por
 * registro duplicado) y cayendo al global (branch_id === null) en caso
 * contrario — y aplicando después el override de `branchPrices` de esa
 * sucursal sobre el registro resuelto (mecanismo real). El resultado
 * conserva el orden de primera aparición en `services`.
 */
export function resolveServicesForBranch(
  services: BookingService[],
  branchId: number | null
): BookingService[] {
  const byKey = new Map<string, BookingService>();

  for (const service of services) {
    const key = serviceKey(service);
    const current = byKey.get(key);

    if (!current) {
      byKey.set(key, service);
      continue;
    }

    // Preferir el registro específico de la sucursal elegida por sobre
    // cualquier otro (global o de otra sucursal).
    const currentIsExactBranch = branchId != null && current.branchId === branchId;
    const candidateIsExactBranch = branchId != null && service.branchId === branchId;

    if (candidateIsExactBranch && !currentIsExactBranch) {
      byKey.set(key, service);
    }
  }

  return Array.from(byKey.values()).map((service) => withBranchPrice(service, branchId));
}

/**
 * Resuelve, para la sucursal elegida, el registro de servicio que
 * corresponde al `selectedServiceId` (que puede apuntar al registro global o
 * a uno de otra sucursal), con el precio de esa sucursal ya aplicado
 * (branchPrices, o el registro específico por branch_id si existe).
 */
export function resolveSelectedService(
  services: BookingService[],
  selectedServiceId: number | null,
  branchId: number | null
): BookingService | undefined {
  if (selectedServiceId == null) return undefined;
  const selected = services.find((s) => s.id === selectedServiceId);
  if (!selected) return undefined;

  if (branchId == null) return selected;

  const key = serviceKey(selected);
  const branchSpecific = services.find(
    (s) => s.name.trim().toLowerCase() === key && s.branchId === branchId
  );
  return withBranchPrice(branchSpecific ?? selected, branchId);
}
