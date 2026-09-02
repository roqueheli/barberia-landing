"use client";

import { useMemo, useState } from "react";
import ServicioCard from "@/components/ServicioCard";
import type { ServicioView } from "@/lib/organization-content";
import type { BusinessType } from "@/types/klipper";

interface ServiciosPaginadosProps {
  servicios: ServicioView[];
  /** Tipos de negocio (id+name) para los chips de filtro. Solo los que usa
   * algún servicio (ver lib/klipper/organization.ts). Si viene vacío, no se
   * muestran filtros. */
  businessTypes?: BusinessType[];
  /** Servicios por página. Klipper puede devolver decenas de servicios, así
   * que se paginan para no renderizar una grilla interminable. */
  porPagina?: number;
}

export default function ServiciosPaginados({
  servicios,
  businessTypes = [],
  porPagina = 9,
}: ServiciosPaginadosProps) {
  const [pagina, setPagina] = useState(0);
  // null = "Todos". Filtro por business_type_id.
  const [tipoActivo, setTipoActivo] = useState<number | null>(null);

  // Solo se ofrecen chips de tipos que tienen al menos un servicio en la lista
  // actual, para no mostrar filtros que dejarían la grilla vacía.
  const tiposDisponibles = useMemo(() => {
    const idsConServicios = new Set(
      servicios.map((s) => s.businessTypeId).filter((id): id is number => id != null)
    );
    return businessTypes.filter((bt) => idsConServicios.has(bt.id));
  }, [servicios, businessTypes]);

  const serviciosFiltrados = useMemo(
    () => (tipoActivo == null ? servicios : servicios.filter((s) => s.businessTypeId === tipoActivo)),
    [servicios, tipoActivo]
  );

  const totalPaginas = Math.max(1, Math.ceil(serviciosFiltrados.length / porPagina));
  // Si la lista cambia (revalidación o filtro) y la página actual queda fuera
  // de rango, se acota al máximo disponible.
  const paginaActual = Math.min(pagina, totalPaginas - 1);

  const visibles = useMemo(() => {
    const inicio = paginaActual * porPagina;
    return serviciosFiltrados.slice(inicio, inicio + porPagina);
  }, [serviciosFiltrados, paginaActual, porPagina]);

  if (servicios.length === 0) return null;

  const scrollAInicio = () => {
    if (typeof document !== "undefined") {
      document.getElementById("servicios")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const irA = (siguiente: number) => {
    setPagina(Math.min(Math.max(siguiente, 0), totalPaginas - 1));
    scrollAInicio();
  };

  const filtrarPor = (id: number | null) => {
    setTipoActivo(id);
    // Al cambiar de filtro, volver a la primera página.
    setPagina(0);
  };

  const chipBase =
    "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition";
  const chipActivo = "bg-accent text-accent-foreground";
  const chipInactivo = "border border-white/15 text-neutral-300 hover:bg-white/10";

  return (
    <div className="mt-10">
      {tiposDisponibles.length > 0 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2" role="group" aria-label="Filtrar servicios por tipo">
          <button
            type="button"
            onClick={() => filtrarPor(null)}
            aria-pressed={tipoActivo == null}
            className={`${chipBase} ${tipoActivo == null ? chipActivo : chipInactivo}`}
          >
            Todos
          </button>
          {tiposDisponibles.map((bt) => (
            <button
              key={bt.id}
              type="button"
              onClick={() => filtrarPor(bt.id)}
              aria-pressed={tipoActivo === bt.id}
              className={`${chipBase} ${tipoActivo === bt.id ? chipActivo : chipInactivo}`}
            >
              {bt.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibles.map((servicio) => (
          <ServicioCard key={servicio.slug} servicio={servicio} />
        ))}
      </div>

      {totalPaginas > 1 && (
        <nav
          className="mt-10 flex items-center justify-center gap-2"
          aria-label="Paginación de servicios"
        >
          <button
            type="button"
            onClick={() => irA(paginaActual - 1)}
            disabled={paginaActual === 0}
            className="inline-flex h-10 items-center justify-center rounded-full border border-white/15 px-4 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>

          <ul className="flex items-center gap-1.5">
            {Array.from({ length: totalPaginas }, (_, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => irA(i)}
                  aria-current={i === paginaActual ? "page" : undefined}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${
                    i === paginaActual
                      ? "bg-accent text-accent-foreground"
                      : "border border-white/15 text-neutral-300 hover:bg-white/10"
                  }`}
                >
                  {i + 1}
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => irA(paginaActual + 1)}
            disabled={paginaActual === totalPaginas - 1}
            className="inline-flex h-10 items-center justify-center rounded-full border border-white/15 px-4 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
          </button>
        </nav>
      )}
    </div>
  );
}
