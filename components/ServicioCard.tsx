import Image from "next/image";
import Link from "next/link";
import { Scissors } from "lucide-react";
import type { ServicioView } from "@/lib/organization-content";

function formatCLP(valor: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor);
}

function offerBadgeLabel(oferta: NonNullable<ServicioView["priceWithOffer"]>): string {
  if (oferta.discount_type === "percentage") {
    // 20.0 -> "20", 12.5 -> "12.5" (String omite decimales si es entero).
    return `${String(oferta.discount)}% OFF`;
  }
  return `${formatCLP(oferta.discount)} OFF`;
}

export default function ServicioCard({ servicio }: { servicio: ServicioView }) {
  // El backend entrega price_with_offer ya resuelto (precio rebajado +
  // metadatos); el front solo lo pinta, nunca calcula el descuento.
  const oferta = servicio.priceWithOffer ?? null;

  return (
    <Link
      href={`/servicios/${servicio.slug}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        oferta
          ? "border-emerald-500/50 bg-emerald-500/5 hover:border-emerald-400/70"
          : "border-white/10 bg-background-elevated hover:border-accent/40"
      }`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-white/5">
        {servicio.imagen && servicio.imagenEnVivo ? (
          // eslint-disable-next-line @next/next/no-img-element -- foto en vivo de Klipper, dominio de imagen no confirmado para next/image
          <img
            src={servicio.imagen}
            alt={servicio.imagenAlt ?? servicio.nombre}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : servicio.imagen ? (
          <Image
            src={servicio.imagen}
            alt={servicio.imagenAlt ?? servicio.nombre}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-600">
            <Scissors className="h-10 w-10" aria-hidden="true" />
          </div>
        )}
        {servicio.insignia && (
          <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            Servicio insignia
          </span>
        )}
        {oferta && (
          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
            <span aria-hidden="true">🏷️</span>
            {offerBadgeLabel(oferta)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-6">
        <h3 className="font-display text-xl font-semibold text-white">{servicio.nombre}</h3>
        {servicio.descripcionCorta && (
          <p className="line-clamp-2 text-sm text-neutral-400">{servicio.descripcionCorta}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-4">
          {oferta ? (
            <span className="flex items-baseline gap-2">
              <span className="text-sm text-neutral-500 line-through">
                {formatCLP(servicio.precioDesde)}
              </span>
              <span className="text-lg font-bold text-emerald-400">
                {formatCLP(oferta.price)}
              </span>
            </span>
          ) : (
            <span className="text-lg font-bold text-accent">
              Desde {formatCLP(servicio.precioDesde)}
            </span>
          )}
          <span className="text-sm text-neutral-500">{servicio.duracionMinutos} min</span>
        </div>
      </div>
    </Link>
  );
}
