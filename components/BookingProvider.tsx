"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import BookingModal from "@/components/BookingModal";

interface BookingContextValue {
  isOpen: boolean;
  sucursalSlugInicial?: string;
  servicioSlugInicial?: string;
  openBooking: (opts?: { sucursalSlug?: string; servicioSlug?: string }) => void;
  closeBooking: () => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error("useBooking debe usarse dentro de <BookingProvider>");
  }
  return ctx;
}

export default function BookingProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sucursalSlugInicial, setSucursalSlugInicial] = useState<string | undefined>(undefined);
  const [servicioSlugInicial, setServicioSlugInicial] = useState<string | undefined>(undefined);
  // Cambia en cada apertura para forzar un remount completo de BookingModal
  // (ver comentario en ese componente): así el flujo de reserva siempre
  // arranca desde cero, sin arrastrar un wizardFailed/status de un intento
  // anterior en la misma sesión.
  const [bookingKey, setBookingKey] = useState(0);

  const openBooking = useCallback(
    (opts?: { sucursalSlug?: string; servicioSlug?: string }) => {
      setSucursalSlugInicial(opts?.sucursalSlug);
      setServicioSlugInicial(opts?.servicioSlug);
      setIsOpen(true);
      setBookingKey((k) => k + 1);
    },
    []
  );

  const closeBooking = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, sucursalSlugInicial, servicioSlugInicial, openBooking, closeBooking }),
    [isOpen, sucursalSlugInicial, servicioSlugInicial, openBooking, closeBooking]
  );

  return (
    <BookingContext.Provider value={value}>
      {children}
      <BookingModal
        key={bookingKey}
        open={isOpen}
        onClose={closeBooking}
        sucursalSlugInicial={sucursalSlugInicial}
        servicioSlugInicial={servicioSlugInicial}
      />
    </BookingContext.Provider>
  );
}
