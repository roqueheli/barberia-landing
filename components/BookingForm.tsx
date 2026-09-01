"use client";

import { useEffect, useId, useState } from "react";
import { matchByName } from "@/lib/match-by-name";
import { buildWhatsAppLink, mensajeReservaDesdeFormulario, toWhatsAppNumber } from "@/lib/whatsapp";
import { siteConfig } from "@/data/site";
import type { BookingLanding } from "@/types/klipper";

// El slug de servicio es determinista (`nombre-{id}`); resolver por el id
// numérico final es exacto, a diferencia del match por nombre que falla con
// acentos y con el id pegado al final del slug.
function servicioIdDesdeSlug(slug: string | undefined): number | null {
  const match = slug?.match(/-(\d+)$/);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isFinite(id) ? id : null;
}

interface BookingFormProps {
  sucursalSlugInicial?: string;
  servicioSlugInicial?: string;
  /** Se llama justo antes de redirigir a WhatsApp, útil para cerrar un modal contenedor. */
  onSubmitted?: () => void;
}

/**
 * Último recurso cuando el wizard de reserva en vivo no está disponible:
 * arma un mensaje prellenado y redirige a WhatsApp. Sucursales/servicios y
 * el número de destino se traen de Klipper (mismo endpoint que el wizard),
 * no de contenido curado — así, aunque solo se muestre este formulario en
 * una caída puntual, siempre apunta a la sucursal y número reales. Si ni
 * siquiera esto logra cargar, degrada a un formulario sin sucursal/servicio
 * que escribe al WhatsApp general del negocio.
 */
export default function BookingForm({
  sucursalSlugInicial,
  servicioSlugInicial,
  onSubmitted,
}: BookingFormProps) {
  const formId = useId();
  const [landing, setLanding] = useState<BookingLanding | null>(null);
  const [loading, setLoading] = useState(true);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [sucursalId, setSucursalId] = useState<number | null>(null);
  const [servicioId, setServicioId] = useState<number | null>(null);
  const [fecha, setFecha] = useState("");
  const [errores, setErrores] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/klipper/landing")
      .then((res) => (res.ok ? (res.json() as Promise<BookingLanding>) : Promise.reject(new Error("landing_failed"))))
      .then((data) => {
        if (cancelled) return;
        setLanding(data);
        const branchMatch = sucursalSlugInicial
          ? matchByName(sucursalSlugInicial.replace(/-/g, " "), sucursalSlugInicial, data.branches)
          : null;
        setSucursalId((branchMatch ?? data.branches[0])?.id ?? null);
        const servicioIdHint = servicioIdDesdeSlug(servicioSlugInicial);
        const serviceMatch =
          (servicioIdHint != null ? data.services.find((s) => s.id === servicioIdHint) : undefined) ??
          (servicioSlugInicial
            ? matchByName(servicioSlugInicial.replace(/-/g, " "), servicioSlugInicial, data.services)
            : null);
        setServicioId((serviceMatch ?? data.services[0])?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) setLanding(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sucursalSlugInicial, servicioSlugInicial]);

  const sucursales = landing?.branches ?? [];
  const servicios = landing?.services ?? [];
  const tieneDatosReales = sucursales.length > 0;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!nombre.trim() || !telefono.trim()) {
      setErrores("Por favor completa tu nombre y teléfono para poder contactarte.");
      return;
    }
    setErrores(null);

    const sucursal = sucursales.find((s) => s.id === sucursalId);
    const servicio = servicios.find((s) => s.id === servicioId);

    const mensaje = mensajeReservaDesdeFormulario({
      nombre,
      telefono,
      sucursal: sucursal?.name ?? "Por confirmar",
      servicio: servicio?.name ?? "Por confirmar",
      fecha: fecha || "A coordinar",
    });

    const numeroWhatsapp = toWhatsAppNumber(sucursal?.phone) ?? siteConfig.whatsappGeneral;
    const link = buildWhatsAppLink(numeroWhatsapp, mensaje);

    onSubmitted?.();
    window.open(link, "_blank", "noopener,noreferrer");
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-2" aria-busy="true" aria-label="Cargando formulario">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${formId}-nombre`} className="text-sm font-medium text-neutral-200">
            Nombre completo
          </label>
          <input
            id={`${formId}-nombre`}
            name="nombre"
            type="text"
            autoComplete="name"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Juan Pérez"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/30"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${formId}-telefono`} className="text-sm font-medium text-neutral-200">
            Teléfono de contacto
          </label>
          <input
            id={`${formId}-telefono`}
            name="telefono"
            type="tel"
            autoComplete="tel"
            required
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="+56 9 1234 5678"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/30"
          />
        </div>

        {tieneDatosReales && (
          <>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${formId}-sucursal`} className="text-sm font-medium text-neutral-200">
                Sucursal
              </label>
              <select
                id={`${formId}-sucursal`}
                name="sucursal"
                value={sucursalId ?? ""}
                onChange={(e) => setSucursalId(Number(e.target.value))}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/30"
              >
                {sucursales.map((s) => (
                  <option key={s.id} value={s.id} className="bg-neutral-900">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${formId}-servicio`} className="text-sm font-medium text-neutral-200">
                Servicio
              </label>
              <select
                id={`${formId}-servicio`}
                name="servicio"
                value={servicioId ?? ""}
                onChange={(e) => setServicioId(Number(e.target.value))}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/30"
              >
                {servicios.map((s) => (
                  <option key={s.id} value={s.id} className="bg-neutral-900">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className={`flex flex-col gap-1.5 ${tieneDatosReales ? "sm:col-span-2" : ""}`}>
          <label htmlFor={`${formId}-fecha`} className="text-sm font-medium text-neutral-200">
            Fecha y hora preferida
          </label>
          <input
            id={`${formId}-fecha`}
            name="fecha"
            type="datetime-local"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/30 [color-scheme:dark]"
          />
        </div>
      </div>

      {errores && (
        <p role="alert" className="text-sm text-red-400">
          {errores}
        </p>
      )}

      <button
        type="submit"
        data-analytics-event="reserva_whatsapp_click"
        data-analytics-source="booking-form"
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3.5 text-sm font-semibold text-neutral-950 transition hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
      >
        Agendar cita
      </button>
      <p className="text-center text-xs text-neutral-500">
        Al confirmar se abrirá WhatsApp con tu solicitud prellenada. Un barbero te responderá para
        confirmar disponibilidad.
      </p>
    </form>
  );
}
