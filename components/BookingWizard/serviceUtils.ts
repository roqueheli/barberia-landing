import type { BookingService } from "@/types/klipper";

// Klipper representa los precios por sucursal como registros de servicio
// separados: un servicio "global" con branch_id === null y, opcionalmente,
// uno o más registros del mismo servicio con branch_id apuntando a una
// sucursal concreta y su propio precio. Estas utilidades resuelven, para la
// sucursal elegida en el wizard, qué registro (y por lo tanto qué precio)
// corresponde mostrar.

// Clave lógica de un servicio (lo que el cliente percibe como "un servicio",
// más allá de en qué sucursal esté configurado). Se usa el nombre porque los
// registros por sucursal comparten nombre pero tienen ids distintos.
function serviceKey(service: BookingService): string {
  return service.name.trim().toLowerCase();
}

/**
 * Devuelve un único servicio por clave lógica, eligiendo para `branchId` el
 * registro específico de esa sucursal cuando existe y cayendo al global
 * (branch_id === null) en caso contrario. El resultado conserva el orden de
 * primera aparición en `services`.
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

  return Array.from(byKey.values());
}

/**
 * Resuelve, para la sucursal elegida, el registro de servicio que
 * corresponde al `selectedServiceId` (que puede apuntar al registro global o
 * a uno de otra sucursal). Devuelve el registro específico de la sucursal si
 * existe, o el propio servicio seleccionado como fallback.
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
  return branchSpecific ?? selected;
}
