"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { buildWhatsAppLink, mensajeReservaSucursal } from "@/lib/whatsapp";

interface BookingEntryModalProps {
  onClose: () => void;
  /** "loading" mientras se resuelve la data en vivo de Klipper; "unavailable"
   * si terminó de cargar pero no hay match/datos utilizables para esta
   * sucursal — nunca se debe dejar el botón "Agendar" sin reacción. */
  status: "loading" | "unavailable";
  sucursalNombre: string;
  whatsappNumero: string;
}

export default function BookingEntryModal({
  onClose,
  status,
  sucursalNombre,
  whatsappNumero,
}: BookingEntryModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const whatsappLink = buildWhatsAppLink(whatsappNumero, mensajeReservaSucursal(sucursalNombre));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-entry-title"
        className="w-full max-w-md rounded-t-3xl border border-border bg-background p-6 shadow-2xl motion-safe:animate-[slideUp_0.25s_ease-out] sm:rounded-3xl sm:p-8"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="booking-entry-title" className="font-display text-xl text-foreground">
            Agendar en {sucursalNombre}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground-muted transition hover:bg-background-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {status === "loading" ? (
          <div className="flex flex-col gap-2" aria-busy="true" aria-label="Cargando disponibilidad">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-background-elevated" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-foreground-muted">
              Por ahora no pudimos cargar la disponibilidad de horarios en línea para esta sucursal.
              Escríbenos por WhatsApp y coordinamos tu hora directamente.
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-strong"
            >
              Escribir por WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
