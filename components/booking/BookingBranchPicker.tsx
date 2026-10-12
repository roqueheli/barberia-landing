import SucursalReservarCta from "@/components/SucursalReservarCta";
import type { SucursalView } from "@/lib/organization-content";

interface BookingBranchPickerProps {
  sucursales: SucursalView[];
}

// Reemplazo del wizard interno cuando Klipper no procesa reservas reales
// (BookingModal: `allowAppointments: false`, o un wizardFailed puntual) y
// el botón que abrió el modal no viene ya con una sucursal fija (esos casos
// pasan directo por SucursalReservarCta desde la card, sin llegar acá). En
// vez de forzar el formulario de WhatsApp, deja elegir la sucursal con el
// mismo CTA que usa SucursalCard — si la sucursal tiene agendaUrl, "Reservar"
// abre ese link externo en otra pestaña; si no, cae al formulario de
// WhatsApp ya scopeado a esa sucursal (mismo componente, mismo fallback).
export default function BookingBranchPicker({ sucursales }: BookingBranchPickerProps) {
  return (
    <div className="flex flex-col gap-3">
      {sucursales.map((sucursal) => (
        <div
          key={sucursal.slug}
          className="flex items-center justify-between gap-4 rounded-xl border border-white/10 p-4"
        >
          <div className="min-w-0">
            <p className="font-semibold text-white">{sucursal.nombre}</p>
            {sucursal.direccion && (
              <p className="truncate text-sm text-neutral-400">
                {sucursal.direccion}
                {sucursal.comuna ? `, ${sucursal.comuna}` : ""}
              </p>
            )}
          </div>
          <SucursalReservarCta
            sucursal={sucursal}
            analyticsSource="booking-modal-branch-picker"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-accent-strong"
          >
            Reservar
          </SucursalReservarCta>
        </div>
      ))}
    </div>
  );
}
