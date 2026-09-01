"use client";

import { useBooking } from "@/components/BookingProvider";

interface ReservarButtonProps {
  className?: string;
  children?: React.ReactNode;
  sucursalSlug?: string;
  servicioSlug?: string;
  analyticsSource: string;
}

/**
 * Botón "Reservar hora" reutilizable en todo el sitio. Abre el modal de
 * reserva global y deja atributos data-* listos para conectar analytics
 * (Google Analytics, Plausible, etc.) sin tocar la lógica del componente.
 */
export default function ReservarButton({
  className,
  children = "Reservar hora",
  sucursalSlug,
  servicioSlug,
  analyticsSource,
}: ReservarButtonProps) {
  const { openBooking } = useBooking();

  return (
    <button
      type="button"
      onClick={() => openBooking({ sucursalSlug, servicioSlug })}
      data-analytics-event="reservar_click"
      data-analytics-source={analyticsSource}
      className={className}
    >
      {children}
    </button>
  );
}
