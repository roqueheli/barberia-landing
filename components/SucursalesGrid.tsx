"use client";

import { useState } from "react";
import SucursalCard from "@/components/SucursalCard";
import BookingModal from "@/components/booking/BookingModal";
import BookingEntryModal from "@/components/booking/BookingEntryModal";
import { useLandingData } from "@/components/booking/useLandingData";
import { matchBranchByName } from "@/components/booking/helpers";
import type { SucursalView } from "@/lib/organization-content";

export default function SucursalesGrid({ sucursales }: { sucursales: SucursalView[] }) {
  const { data: landing, loading } = useLandingData();
  const [openSucursal, setOpenSucursal] = useState<SucursalView | null>(null);

  const liveBranch =
    openSucursal && landing ? matchBranchByName(openSucursal.nombre, openSucursal.slug, landing.branches) : null;
  const ready = !loading && landing != null && liveBranch != null;

  return (
    <>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sucursales.map((sucursal) => (
          <SucursalCard key={sucursal.slug} sucursal={sucursal} onAgendar={() => setOpenSucursal(sucursal)} />
        ))}
      </div>

      {/* El botón "Agendar" siempre abre algo: mientras se resuelve la data
          en vivo de Klipper se muestra loading, y si no hay match (org sin
          configurar, sucursal no encontrada, red caída) se cae al fallback
          de WhatsApp — nunca se queda sin reacción visible. */}
      {openSucursal && !ready && (
        <BookingEntryModal
          onClose={() => setOpenSucursal(null)}
          status={loading ? "loading" : "unavailable"}
          sucursalNombre={openSucursal.nombre}
          whatsappNumero={openSucursal.whatsapp ?? ""}
        />
      )}

      {openSucursal && ready && landing && liveBranch && (
        <BookingModal
          isOpen
          onClose={() => setOpenSucursal(null)}
          organization={landing.organization}
          branches={landing.branches}
          services={landing.services}
          professionals={landing.users}
          initialBranch={liveBranch}
        />
      )}
    </>
  );
}
