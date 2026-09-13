import type { BookingService } from "@/types/klipper";

// landing_by_slug trae el catálogo COMPLETO de servicios en un solo fetch
// (no filtrado por sucursal) — el filtrado es intencionalmente client-side
// para poder cambiar de sucursal sin volver a pedirle nada al backend.
// Estas utilidades resuelven, para la sucursal elegida en el wizard:
//   - qué servicios están DISPONIBLES ahí (branch_ids, ver
//     isServiceAvailableInBranch), y
//   - qué PRECIO corresponde mostrar. Klipper puede representar un precio
//     por sucursal de dos formas: (a) un registro de servicio separado con
//     su propio `branch_id` (nunca observado en datos reales — se
//     conserva el manejo por si acaso), o (b) el mecanismo real verificado
//     contra la respuesta de landing_by_slug (org better-barber-club,
//     servicio "Corte de Cabello"): overrides en `branchPrices` sobre el
//     MISMO registro (`price` es el precio base/default).

// Clave lógica de un servicio (lo que el cliente percibe como "un servicio",
// más allá de en qué sucursal esté configurado). Se usa el nombre porque los
// registros por sucursal comparten nombre pero tienen ids distintos.
function serviceKey(service: BookingService): string {
  return service.name.trim().toLowerCase();
}

// Disponibilidad por sucursal (branch_ids) — documentado por Klipper,
// verificado contra landing_by_slug. OJO con la semántica: branchIds
// undefined/ausente NO es lo mismo que branchIds vacío.
//   - undefined  → servicio no migrado a esta funcionalidad → disponible
//     en TODAS las sucursales (nunca ocultarlo).
//   - []         → existe pero no está asignado a ninguna sucursal → no
//     mostrarlo en ninguna.
//   - [12, 45]   → disponible solo en esas sucursales.
export function isServiceAvailableInBranch(
  service: BookingService,
  branchId: number | null
): boolean {
  if (branchId == null) return true;
  if (service.branchIds == null) return true;
  return service.branchIds.includes(branchId);
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
 * Devuelve los servicios disponibles para `branchId` (filtrados por
 * `branchIds`, ver isServiceAvailableInBranch), un único registro por
 * clave lógica, eligiendo para `branchId` el registro específico de esa
 * sucursal cuando existe (mecanismo por registro duplicado) y cayendo al
 * global (branch_id === null) en caso contrario — y aplicando después el
 * override de `branchPrices` de esa sucursal sobre el registro resuelto
 * (mecanismo real). El resultado conserva el orden de primera aparición en
 * `services`. Puede devolver []: no es un error, esa sucursal simplemente
 * no tiene servicios asignados todavía — mostrar el estado vacío normal.
 */
export function resolveServicesForBranch(
  services: BookingService[],
  branchId: number | null
): BookingService[] {
  const byKey = new Map<string, BookingService>();

  for (const service of services) {
    if (!isServiceAvailableInBranch(service, branchId)) continue;
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
