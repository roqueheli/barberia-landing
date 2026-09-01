"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  BookingAvailability,
  BookingLanding,
  BookingService,
  CreateAppointmentResponse,
} from "@/types/klipper";
import type { StatusApiResponse } from "@/app/api/klipper/status/route";
import { buildWhatsAppLink, mensajeReservaSucursal, toInternationalPhone } from "@/lib/whatsapp";
import { addDaysIso, toIsoDate } from "./dateUtils";
import { resolveSelectedService, resolveServicesForBranch } from "./serviceUtils";
import StepBranch from "./StepBranch";
import StepService from "./StepService";
import StepProfessionalSlot, { type SelectedSlot } from "./StepProfessionalSlot";
import StepContact, { type ContactData } from "./StepContact";
import StepConfirm from "./StepConfirm";

type StepId = "branch" | "service" | "professional" | "contact" | "confirm";

interface BookingWizardProps {
  status: StatusApiResponse;
  sucursalHint?: string;
  servicioHint?: string;
  onSubmitted: () => void;
  /** Se llama cuando el wizard no puede continuar (landing/disponibilidad no
   * cargó, o no hay profesionales); el contenedor debe caer al fallback de
   * WhatsApp (BookingForm) en vez de dejar al usuario en un dead-end. */
  onFatalError: () => void;
}

const GENERIC_ERROR_MESSAGE =
  "No pudimos procesar tu reserva, intenta de nuevo o escríbenos por WhatsApp.";

function matchesHint(hint: string | undefined, name: string): boolean {
  if (!hint) return false;
  const normalizedHint = hint.replace(/-/g, " ").toLowerCase();
  return name.toLowerCase().includes(normalizedHint);
}

// El slug de servicio que llega como hint es determinista: `nombre-{id}` (ej.
// "corte-premium-anti-caida-3287"), con el id numérico de Klipper como último
// segmento. Ese id es la forma exacta y confiable de resolver el servicio —
// el match por nombre falla con acentos y con el id pegado al final.
function serviceIdFromHint(hint: string | undefined): number | null {
  if (!hint) return null;
  const match = hint.match(/-(\d+)$/);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isFinite(id) ? id : null;
}

// Resuelve el servicio al que apunta el hint: primero por id embebido en el
// slug (exacto), con fallback al match por nombre para hints antiguos/curados.
function resolveServiceFromHint(
  services: BookingService[],
  hint: string | undefined
): BookingService | undefined {
  const id = serviceIdFromHint(hint);
  if (id != null) {
    const byId = services.find((s) => s.id === id);
    if (byId) return byId;
  }
  return services.find((s) => matchesHint(hint, s.name));
}

export default function BookingWizard({
  status,
  sucursalHint,
  servicioHint,
  onSubmitted,
  onFatalError,
}: BookingWizardProps) {
  const [landing, setLanding] = useState<BookingLanding | null>(null);
  const [landingLoading, setLandingLoading] = useState(true);
  // true cuando el servicio llegó preseleccionado desde una página de
  // servicio (hint): en ese caso no tiene sentido volver a pedir que lo
  // elija, así que se omite el paso "service".
  const [serviceLockedFromHint, setServiceLockedFromHint] = useState(false);

  const steps: StepId[] = useMemo(() => {
    const arr: StepId[] = [];
    if (!status.skipBranchStep) arr.push("branch");
    if (!status.skipServiceStep && !serviceLockedFromHint) arr.push("service");
    arr.push("professional", "contact", "confirm");
    return arr;
  }, [status.skipBranchStep, status.skipServiceStep, serviceLockedFromHint]);

  const [stepIndex, setStepIndex] = useState(0);
  const stepId = steps[stepIndex];

  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);

  const [weekStart, setWeekStart] = useState(() => toIsoDate(new Date()));
  const [availability, setAvailability] = useState<BookingAvailability | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityNotice, setAvailabilityNotice] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);

  const [contact, setContact] = useState<ContactData>({ name: "", email: "", phone: "", consent: false });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<{ message: string } | null>(null);
  const [success, setSuccess] = useState<CreateAppointmentResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/klipper/landing")
      .then(async (res) => {
        if (!res.ok) throw new Error("landing_failed");
        return (await res.json()) as BookingLanding;
      })
      .then((data) => {
        if (cancelled) return;
        if (data.branches.length === 0 || data.services.length === 0) {
          onFatalError();
          return;
        }
        setLanding(data);
        const branchMatch = data.branches.find((b) => matchesHint(sucursalHint, b.name));
        setSelectedBranchId((branchMatch ?? data.branches[0]).id);
        const serviceMatch = resolveServiceFromHint(data.services, servicioHint);
        setSelectedServiceId((serviceMatch ?? data.services[0]).id);
        // Si el hint resolvió a un servicio real, viene de su página de
        // detalle: se bloquea la selección y se omite el paso "service".
        setServiceLockedFromHint(serviceMatch != null);
      })
      .catch(() => {
        if (!cancelled) onFatalError();
      })
      .finally(() => {
        if (!cancelled) setLandingLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (stepId !== "professional" || selectedServiceId == null) return;
    let cancelled = false;

    async function loadAvailability() {
      setAvailabilityLoading(true);
      // Resolver el servicio a su registro específico de la sucursal elegida
      // (Klipper modela el precio por sucursal como registros separados con
      // su propio id) para pedir disponibilidad del servicio correcto.
      const resolvedService = resolveSelectedService(
        landing?.services ?? [],
        selectedServiceId,
        selectedBranchId
      );
      const serviceIdForBranch = resolvedService?.id ?? selectedServiceId;
      const params = new URLSearchParams({
        start_date: weekStart,
        end_date: addDaysIso(weekStart, 7),
        service_id: String(serviceIdForBranch),
      });
      if (selectedBranchId != null) {
        params.set("branch_id", String(selectedBranchId));
      }
      try {
        const res = await fetch(`/api/klipper/availability?${params.toString()}`);
        if (!res.ok) throw new Error("availability_failed");
        const data = (await res.json()) as BookingAvailability;
        if (cancelled) return;
        if (data.professionals.length === 0) {
          onFatalError();
          return;
        }
        setAvailability(data);
      } catch {
        if (!cancelled) setAvailabilityNotice("No pudimos cargar la disponibilidad. Intenta de nuevo.");
      } finally {
        if (!cancelled) setAvailabilityLoading(false);
      }
    }

    loadAvailability();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepId, selectedServiceId, selectedBranchId, weekStart, refreshKey]);

  function goNext() {
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }
  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }
  function goToStepId(id: StepId) {
    const idx = steps.indexOf(id);
    if (idx >= 0) setStepIndex(idx);
  }

  async function handleSubmit() {
    if (!landing || selectedBranchId == null || selectedServiceId == null || !selectedSlot) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const appointmentAt = `${selectedSlot.date}T${selectedSlot.time}:00`;
      // Reservar el registro de servicio de la sucursal elegida (precio y id
      // correctos), no el genérico, cuando la sucursal tiene su propio precio.
      const selectedService = resolveSelectedService(
        landing.services,
        selectedServiceId,
        selectedBranchId
      );
      const serviceIdForBranch = selectedService?.id ?? selectedServiceId;
      const res = await fetch("/api/klipper/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: landing.organization.id,
          name: contact.name,
          email: contact.email,
          phone: toInternationalPhone(contact.phone),
          appointmentAt,
          serviceIds: [serviceIdForBranch],
          branchId: selectedBranchId,
          attendedBy: selectedSlot.professionalId,
          ...(selectedService?.businessTypeId != null
            ? { businessTypeId: selectedService.businessTypeId }
            : {}),
        }),
      });

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        setSubmitError({ message: GENERIC_ERROR_MESSAGE });
        return;
      }
      const data = await res.json();

      if (res.ok) {
        setSuccess(data as CreateAppointmentResponse);
        return;
      }

      if (data.code === "time_slot_taken") {
        setSelectedSlot(null);
        setAvailabilityNotice("Ese horario se acaba de ocupar, elige otro.");
        setRefreshKey((k) => k + 1);
        goToStepId("professional");
        return;
      }

      if (data.code === "validation_error") {
        setSubmitError({
          message: "Revisa los datos de tu reserva: " + Object.values(data.fieldErrors ?? {}).flat().join(", "),
        });
        return;
      }

      setSubmitError({ message: data.message || GENERIC_ERROR_MESSAGE });
    } catch {
      setSubmitError({ message: GENERIC_ERROR_MESSAGE });
    } finally {
      setSubmitting(false);
    }
  }

  if (landingLoading || !landing) {
    return (
      <div className="flex flex-col gap-2" aria-busy="true" aria-label="Cargando reserva">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
    );
  }

  const selectedBranch = landing.branches.find((b) => b.id === selectedBranchId);
  // Servicios de-duplicados y resueltos al precio de la sucursal elegida, y
  // el servicio seleccionado con su precio/id específico de esa sucursal.
  const branchServices = resolveServicesForBranch(landing.services, selectedBranchId);
  const selectedService = resolveSelectedService(landing.services, selectedServiceId, selectedBranchId);

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <p className="text-lg font-medium text-white">¡Listo, tu hora quedó reservada!</p>
        <p className="text-sm text-neutral-400">
          Te contactaremos a {contact.email || contact.phone} para confirmar cualquier detalle.
        </p>
        <button
          type="button"
          onClick={onSubmitted}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-amber-300"
        >
          Cerrar
        </button>
      </div>
    );
  }

  const whatsappFallbackHref = (() => {
    if (!selectedBranch?.phone) return null;
    const digits = selectedBranch.phone.replace(/[^\d]/g, "");
    if (!digits) return null;
    return buildWhatsAppLink(digits, mensajeReservaSucursal(selectedBranch.name));
  })();

  switch (stepId) {
    case "branch":
      return (
        <StepBranch
          branches={landing.branches}
          selectedId={selectedBranchId}
          onSelect={setSelectedBranchId}
          onNext={goNext}
        />
      );
    case "service":
      return (
        <StepService
          services={branchServices}
          selectedId={selectedService?.id ?? selectedServiceId}
          onSelect={setSelectedServiceId}
          onNext={goNext}
          onBack={stepIndex > 0 ? goBack : undefined}
        />
      );
    case "professional":
      return (
        <StepProfessionalSlot
          mode={availability?.mode ?? "slots"}
          professionals={availability?.professionals ?? []}
          loading={availabilityLoading}
          error={availabilityNotice}
          weekStart={weekStart}
          onChangeWeekStart={(next) => {
            setWeekStart(next);
            setAvailabilityNotice(null);
          }}
          selected={selectedSlot}
          onSelect={setSelectedSlot}
          timeZoneLabel={status.timeZone}
          weeklySchedule={selectedBranch?.weeklySchedule}
          durationMinutes={selectedService?.duration}
          onNext={goNext}
          onBack={stepIndex > 0 ? goBack : undefined}
        />
      );
    case "contact":
      return (
        <StepContact
          data={contact}
          onChange={setContact}
          requireConsent={status.appointmentConsent}
          onNext={goNext}
          onBack={goBack}
        />
      );
    case "confirm":
      if (!selectedBranch || !selectedService || !selectedSlot) return null;
      return (
        <StepConfirm
          summary={{
            branchName: selectedBranch.name,
            serviceName: selectedService.name,
            servicePrice: selectedService.price,
            professionalName:
              availability?.professionals.find((p) => p.user.id === selectedSlot.professionalId)?.user.name ??
              "",
            date: selectedSlot.date,
            time: selectedSlot.time,
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
          }}
          submitting={submitting}
          error={submitError}
          whatsappFallbackHref={whatsappFallbackHref}
          onSubmit={handleSubmit}
          onBack={goBack}
        />
      );
    default:
      return null;
  }
}
