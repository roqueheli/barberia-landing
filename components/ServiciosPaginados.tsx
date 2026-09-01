"use client";

import { useMemo, useState } from "react";
import ServicioCard from "@/components/ServicioCard";
import type { ServicioView } from "@/lib/organization-content";

interface ServiciosPaginadosProps {
  servicios: ServicioView[];
  /** Servicios por página. Klipper puede devolver decenas de servicios, así
   * que se paginan para no renderizar una grilla interminable. */
  porPagina?: number;
}

export default function ServiciosPaginados({ servicios, porPagina = 9 }: ServiciosPaginadosProps) {
  const [pagina, setPagina] = useState(0);

  const totalPaginas = Math.max(1, Math.ceil(servicios.length / porPagina));
  // Si la lista cambia (revalidación) y la página actual queda fuera de
  // rango, se acota al máximo disponible.
  const paginaActual = Math.min(pagina, totalPaginas - 1);

  const visibles = useMemo(() => {
    const inicio = paginaActual * porPagina;
    return servicios.slice(inicio, inicio + porPagina);
  }, [servicios, paginaActual, porPagina]);

  if (servicios.length === 0) return null;

  const irA = (siguiente: number) => {
    setPagina(Math.min(Math.max(siguiente, 0), totalPaginas - 1));
    // Reposiciona al inicio de la sección para que el usuario no quede a
    // mitad de scroll al cambiar de página.
    if (typeof document !== "undefined") {
      document.getElementById("servicios")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="mt-12">
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
