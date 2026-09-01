"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { createAppointment, fetchCalendar } from "@/lib/booking-api";
import {
  buildServiceIds,
  computeAppointmentDuration,
  computeAvailableSlots,
  filterProfessionalsForBranch,
  filterServicesForBranch,
  selectedBusinessTypeIds,
} from "./helpers";
import type {
  BookingModalProps,
  BookingStepId,
  CalendarAttendance,
  ContactInfo,
  SelectedService,
  TimeSlot,
  User,
} from "./types";

const CONTACT_STORAGE_KEY = "klipper_booking_contact";
const EMPTY_CONTACT: ContactInfo = { name: "", email: "", phone: "" };

function loadStoredContact(): ContactInfo {
  if (typeof window === "undefined") return EMPTY_CONTACT;
  try {
    const raw = window.localStorage.getItem(CONTACT_STORAGE_KEY);
    if (!raw) return EMPTY_CONTACT;
    const parsed = JSON.parse(raw) as Partial<ContactInfo>;
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      email: typeof parsed.email === "string" ? parsed.email : "",
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
    };
  } catch {
    return EMPTY_CONTACT;
  }
}

function storeContact(contact: ContactInfo) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(contact));
  } catch {
    // localStorage puede fallar (modo privado, cuota llena); no es crítico.
  }
}

const STEPS: BookingStepId[] = ["services", "professional", "datetime", "contact", "confirm"];

export function useBookingModal(props: BookingModalProps) {
  const { organization, services, professionals, initialBranch, isOpen, onSuccess, onClose } = props;

  const [stepIndex, setStepIndex] = useState(0);
  const stepId = STEPS[stepIndex];

  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [attendances, setAttendances] = useState<CalendarAttendance[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);

  const [contact, setContact] = useState<ContactInfo>(EMPTY_CONTACT);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset del wizard cada vez que se abre (o si cambia la sucursal de origen).
  useEffect(() => {
    if (!isOpen) return;
    function resetWizard() {
      setStepIndex(0);
      setSelectedServices([]);
      setSelectedProfessional(null);
      setSelectedDate("");
      setSelectedSlot(null);
      setAttendances([]);
      setCalendarError(null);
      setSubmitError(null);
      setSuccess(false);
      setContact(loadStoredContact());
    }
    resetWizard();
  }, [isOpen, initialBranch.id]);

  const timezone = organization.metadata?.time_zone || "America/Santiago";

  const availableServices = useMemo(
    () => filterServicesForBranch(services, initialBranch),
    [services, initialBranch]
  );

  const availableProfessionals = useMemo(
    () => filterProfessionalsForBranch(professionals, initialBranch.id, selectedServices),
    [professionals, initialBranch.id, selectedServices]
  );

  const durationMinutes = useMemo(
    () => computeAppointmentDuration(organization, selectedServices),
    [organization, selectedServices]
  );

  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    return computeAvailableSlots({
      date: selectedDate,
      timezone,
      weeklySchedule: initialBranch.weekly_schedule,
      attendances,
      durationMinutes,
    });
  }, [selectedDate, timezone, initialBranch.weekly_schedule, attendances, durationMinutes]);

  const setServiceQuantity = useCallback(
    (serviceId: number, quantity: number) => {
      setSelectedServices((prev) => {
        const service = availableServices.find((s) => s.id === serviceId);
        if (!service) return prev;
        const withoutThis = prev.filter((s) => s.service.id !== serviceId);
        if (quantity <= 0) return withoutThis;
        return [...withoutThis, { service, quantity }];
      });
    },
    [availableServices]
  );

  const goNext = useCallback(() => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1)), []);
  const goBack = useCallback(() => setStepIndex((i) => Math.max(i - 1, 0)), []);

  const selectProfessional = useCallback((user: User) => {
    setSelectedProfessional(user);
    setSelectedDate("");
    setSelectedSlot(null);
    setAttendances([]);
    setCalendarError(null);
  }, []);

  const selectDate = useCallback(
    async (date: string) => {
      setSelectedDate(date);
      setSelectedSlot(null);
      if (!selectedProfessional) return;
      setCalendarLoading(true);
      setCalendarError(null);
      try {
        const data = await fetchCalendar({ userId: selectedProfessional.id, date, timezone });
        setAttendances(data.attendances ?? []);
      } catch (err) {
        setAttendances([]);
        setCalendarError(err instanceof Error ? err.message : "No pudimos cargar la disponibilidad.");
      } finally {
        setCalendarLoading(false);
      }
    },
    [selectedProfessional, timezone]
  );

  const updateContact = useCallback((next: ContactInfo) => {
    setContact(next);
    storeContact(next);
  }, []);

  const submit = useCallback(async () => {
    if (!selectedProfessional || !selectedDate || !selectedSlot || selectedServices.length === 0) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const businessTypeIds = selectedBusinessTypeIds(selectedServices);
      await createAppointment({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        organization_id: organization.id,
        branch_id: initialBranch.id,
        service_ids: buildServiceIds(selectedServices),
        attended_by: selectedProfessional.id,
        appointment_at: `${selectedDate}T${selectedSlot.start}:00`,
        business_type_id: businessTypeIds[0],
      });
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "No pudimos crear tu cita, intenta de nuevo.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }, [
    selectedProfessional,
    selectedDate,
    selectedSlot,
    selectedServices,
    contact,
    organization.id,
    initialBranch.id,
    onSuccess,
  ]);

  return {
    stepId,
    stepIndex,
    totalSteps: STEPS.length,
    goNext,
    goBack,

    availableServices,
    selectedServices,
    setServiceQuantity,
    canGoNextFromServices: selectedServices.length > 0,

    availableProfessionals,
    selectedProfessional,
    selectProfessional,
    canGoNextFromProfessional: selectedProfessional != null,

    selectedDate,
    selectDate,
    availableSlots,
    selectedSlot,
    selectSlot: setSelectedSlot,
    calendarLoading,
    calendarError,
    canGoNextFromDateTime: selectedSlot != null,
    timezone,
    durationMinutes,

    contact,
    updateContact,
    canSubmit:
      contact.name.trim().length > 0 && contact.email.trim().length > 0 && contact.phone.trim().length > 0,

    submitting,
    submitError,
    success,
    submit,
    close: onClose,
  };
}

export type UseBookingModalReturn = ReturnType<typeof useBookingModal>;
