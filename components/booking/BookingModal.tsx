"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useBookingModal } from "./useBookingModal";
import { servicesTotalPrice } from "./helpers";
import ServicesStep from "./steps/ServicesStep";
import ProfessionalStep from "./steps/ProfessionalStep";
import DateTimeStep from "./steps/DateTimeStep";
import ContactStep from "./steps/ContactStep";
import type { BookingModalProps } from "./types";

const formatCLP = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

export default function BookingModal(props: BookingModalProps) {
  const { isOpen, onClose, initialBranch, organization } = props;
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wizard = useBookingModal(props);

  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
        aria-labelledby="booking-modal-title"
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-background p-6 shadow-2xl motion-safe:animate-[slideUp_0.25s_ease-out] sm:rounded-3xl sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="booking-modal-title" className="font-display text-2xl text-foreground">
              Agendar en {initialBranch.name}
            </h2>
            <p className="mt-1 text-sm text-foreground-muted">
              {organization.name} · reserva tu hora al instante.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario de reserva"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground-muted transition hover:bg-background-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!wizard.success && (
          <div className="mb-6 flex gap-1.5" aria-hidden="true">
            {Array.from({ length: wizard.totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition ${
                  i <= wizard.stepIndex ? "bg-accent" : "bg-border"
                }`}
              />
            ))}
          </div>
        )}

        {wizard.success ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-accent" />
            <p className="text-lg font-medium text-foreground">¡Listo, tu hora quedó reservada!</p>
            <p className="text-sm text-foreground-muted">
              Te confirmaremos a {wizard.contact.email || wizard.contact.phone}.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-strong"
            >
              Cerrar
            </button>
          </div>
        ) : wizard.stepId === "services" ? (
          <ServicesStep
            services={wizard.availableServices}
            selectedServices={wizard.selectedServices}
            onSetQuantity={wizard.setServiceQuantity}
            onNext={wizard.goNext}
            canGoNext={wizard.canGoNextFromServices}
          />
        ) : wizard.stepId === "professional" ? (
          <ProfessionalStep
            professionals={wizard.availableProfessionals}
            selected={wizard.selectedProfessional}
            onSelect={wizard.selectProfessional}
            onNext={wizard.goNext}
            onBack={wizard.goBack}
            canGoNext={wizard.canGoNextFromProfessional}
          />
        ) : wizard.stepId === "datetime" ? (
          <DateTimeStep
            timezone={wizard.timezone}
            weeklySchedule={initialBranch.weekly_schedule}
            date={wizard.selectedDate}
            onSelectDate={wizard.selectDate}
            slots={wizard.availableSlots}
            selectedSlot={wizard.selectedSlot}
            onSelectSlot={wizard.selectSlot}
            loading={wizard.calendarLoading}
            error={wizard.calendarError}
            onNext={wizard.goNext}
            onBack={wizard.goBack}
            canGoNext={wizard.canGoNextFromDateTime}
          />
        ) : wizard.stepId === "contact" ? (
          <ContactStep
            contact={wizard.contact}
            onChange={wizard.updateContact}
            onNext={wizard.goNext}
            onBack={wizard.goBack}
            canGoNext={wizard.canSubmit}
          />
        ) : (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-medium text-foreground">Confirma tu cita</h3>

            <dl className="flex flex-col gap-2 rounded-xl border border-border bg-background-elevated p-4 text-sm text-foreground">
              <div className="flex justify-between gap-4">
                <dt className="text-foreground-muted">Sucursal</dt>
                <dd className="text-right">{initialBranch.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-foreground-muted">Servicios</dt>
                <dd className="text-right">
                  {wizard.selectedServices.map((s) => `${s.service.name} x${s.quantity}`).join(", ")}
                  <br />
                  {formatCLP.format(servicesTotalPrice(wizard.selectedServices))}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-foreground-muted">Profesional</dt>
                <dd className="text-right">{wizard.selectedProfessional?.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-foreground-muted">Fecha y hora</dt>
                <dd className="text-right">
                  {wizard.selectedDate} · {wizard.selectedSlot?.start}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-foreground-muted">Contacto</dt>
                <dd className="text-right">
                  {wizard.contact.name}
                  <br />
                  {wizard.contact.email}
                  <br />
                  {wizard.contact.phone}
                </dd>
              </div>
            </dl>

            {wizard.submitError && (
              <p role="alert" className="text-sm text-red-400">
                {wizard.submitError}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={wizard.goBack}
                disabled={wizard.submitting}
                className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-background-elevated disabled:opacity-50"
              >
                Atrás
              </button>
              <button
                type="button"
                disabled={wizard.submitting}
                onClick={wizard.submit}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
              >
                {wizard.submitting ? "Reservando…" : "Confirmar cita"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
