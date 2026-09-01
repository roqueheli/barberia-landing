"use client";

import { useEffect, useState } from "react";
import { fetchLandingData } from "@/lib/booking-api";
import type { LandingData } from "./types";

interface UseLandingDataResult {
  data: LandingData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Trae una sola vez los datos públicos de Klipper (organización, sucursales,
 * servicios, profesionales) para poder abrir el BookingModal desde una
 * tarjeta de sucursal. Si falla (org no configurada, red caída, CORS), se
 * expone el error y quien la use debe degradar con gracia (ej. no mostrar el
 * botón "Agendar" y dejar el resto de la tarjeta intacto).
 */
export function useLandingData(): UseLandingDataResult {
  const [data, setData] = useState<LandingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLandingData()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "No pudimos cargar los datos de reserva.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
