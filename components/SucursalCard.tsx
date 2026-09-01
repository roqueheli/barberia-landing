import ReservarButton from "@/components/ReservarButton";
import type { SucursalView } from "@/lib/organization-content";
import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface SucursalCardProps {
  sucursal: SucursalView;
  /** Siempre visible: abre el wizard de agendamiento. El estado de carga y
   * el fallback si no hay datos en vivo se resuelven dentro del wizard, no
   * ocultando este botón (si no, no hay forma de llegar a él). */
  onAgendar: () => void;
}

export default function SucursalCard({ sucursal, onAgendar }: SucursalCardProps) {
  const direccionTexto = (
    <>
      {sucursal.direccion}
      {sucursal.comuna ? `, ${sucursal.comuna}` : ""}
      {sucursal.referenciaMetro && (
        <>
          <br />
          {sucursal.referenciaMetro}
        </>
      )}
    </>
  );

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-background-elevated transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl hover:shadow-black/30">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-white/5">
        {sucursal.imagenPortada && sucursal.imagenPortadaEnVivo ? (
          // eslint-disable-next-line @next/next/no-img-element -- foto en vivo de Klipper, dominio de imagen no confirmado para next/image
          <img
            src={sucursal.imagenPortada}
            alt={sucursal.imagenPortadaAlt ?? sucursal.nombre}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : sucursal.imagenPortada ? (
          <Image
            src={sucursal.imagenPortada}
            alt={sucursal.imagenPortadaAlt ?? sucursal.nombre}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-600">
            <MapPin className="h-10 w-10" aria-hidden="true" />
          </div>
        )}
        {sucursal.destacada && (
          <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            Casa matriz
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          {sucursal.rating != null && (
            <div className="flex items-center gap-1.5 text-sm text-accent">
              <StarIcon />
              <span className="font-semibold text-white">{sucursal.rating}</span>
              <span className="text-neutral-400">({sucursal.numeroResenas} reseñas)</span>
            </div>
          )}
          <h3 className="mt-2 font-display text-2xl font-semibold text-white">
            {sucursal.nombre}
          </h3>
        </div>

        {sucursal.descripcionCorta && (
          <p className="text-sm text-neutral-300">{sucursal.descripcionCorta}</p>
        )}

        <ul className="flex flex-col gap-2 text-sm text-neutral-400">
          <li className="flex items-start gap-2">
            <PinIcon />
            {sucursal.mapsUrl ? (
              <a
                href={sucursal.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics-event="ver_en_maps_click"
                data-analytics-source={`sucursal-card-${sucursal.slug}`}
                className="underline-offset-2 hover:text-white hover:underline"
              >
                {direccionTexto}
              </a>
            ) : (
              <span>{direccionTexto}</span>
            )}
          </li>
          {sucursal.horario.length > 0 && (
            <li className="flex items-start gap-2">
              <ClockIcon />
              <span className="flex flex-col gap-0.5">
                {sucursal.horario.map((tramo) => (
                  <span key={`${tramo.dias}-${tramo.horas}`}>
                    {tramo.dias}: {tramo.horas}
                  </span>
                ))}
              </span>
            </li>
          )}
        </ul>

        <div className="mt-auto flex flex-col gap-2 pt-2 sm:flex-row">
          <ReservarButton
            sucursalSlug={sucursal.slug}
            analyticsSource={`sucursal-card-${sucursal.slug}`}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-strong"
          >
            Reservar
          </ReservarButton>
          <Link
            href={`/sucursales/${sucursal.slug}`}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Ver sucursal
          </Link>
        </div>
      </div>
    </article>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.9l-5.2 2.61.99-5.79-4.21-4.1 5.82-.85L10 1.5Z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 fill-none stroke-current">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 18s6-5.686 6-10a6 6 0 1 0-12 0c0 4.314 6 10 6 10Z" />
      <circle cx="10" cy="8" r="2.25" strokeWidth={1.5} />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 fill-none stroke-current">
      <circle cx="10" cy="10" r="7.25" strokeWidth={1.5} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6v4l2.5 1.5" />
    </svg>
  );
}
