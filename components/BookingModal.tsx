"use client";

import { useEffect, useRef, useState } from "react";
import BookingForm from "@/components/BookingForm";
import BookingWizard from "@/components/BookingWizard/BookingWizard";
import type { StatusApiResponse } from "@/app/api/klipper/status/route";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  sucursalSlugInicial?: string;
  servicioSlugInicial?: string;
}

// Solo un render condicional en el cliente (wizard vs. WhatsApp), no un
// secreto: puede llevar el prefijo NEXT_PUBLIC_.
const APPOINTMENTS_ENABLED = process.env.NEXT_PUBLIC_APPOINTMENTS_ENABLED !== "false";

// BookingProvider monta este componente con una `key` que cambia en cada
// apertura, así que un `wizardFailed`/status de un intento anterior nunca
// sobrevive al remount: cada apertura arranca el flujo desde cero, con
// useState/useRef en su valor inicial — sin esto, una falla puntual (ej. un
// servicio sin profesionales) dejaba al usuario atascado en el formulario
// de WhatsApp para el resto de la sesión, incluso cerrando y reabriendo.
export default function BookingModal({
  open,
  onClose,
  sucursalSlugInicial,
  servicioSlugInicial,
}: BookingModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [status, setStatus] = useState<StatusApiResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState(APPOINTMENTS_ENABLED);
  const [wizardFailed, setWizardFailed] = useState(false);
  const statusFetchedRef = useRef(false);

  useEffect(() => {
    if (!open || !APPOINTMENTS_ENABLED || statusFetchedRef.current) return;
    statusFetchedRef.current = true;
    fetch("/api/klipper/status")
      .then((res) => res.json())
      .then((data: StatusApiResponse) => setStatus(data))
      .catch(() => setStatus({ allowAppointments: false } as StatusApiResponse))
      .finally(() => setStatusLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const showWizard =
    APPOINTMENTS_ENABLED && !wizardFailed && !statusLoading && Boolean(status?.allowAppointments);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        className="hero-dark max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-neutral-950 p-6 shadow-2xl motion-safe:animate-[slideUp_0.25s_ease-out] sm:rounded-3xl sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="booking-modal-title" className="font-display text-2xl text-white">
              Reserva tu hora
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              {showWizard
                ? "Elige sucursal, servicio y horario, y confirmamos tu cita al instante."
                : "Completa tus datos y te confirmamos por WhatsApp en minutos."}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario de reserva"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-neutral-300 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {APPOINTMENTS_ENABLED && statusLoading ? (
          <div className="flex flex-col gap-2" aria-busy="true" aria-label="Cargando reserva">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : showWizard ? (
          <BookingWizard
            status={status as StatusApiResponse}
            sucursalHint={sucursalSlugInicial}
            servicioHint={servicioSlugInicial}
            onSubmitted={onClose}
            onFatalError={() => setWizardFailed(true)}
          />
        ) : (
          <BookingForm
            sucursalSlugInicial={sucursalSlugInicial}
            servicioSlugInicial={servicioSlugInicial}
            onSubmitted={onClose}
          />
        )}
      </div>
    </div>
  );
}
