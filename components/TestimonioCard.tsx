import Image from "next/image";
import type { Resena } from "@/types";

export default function TestimonioCard({ resena }: { resena: Resena }) {
  return (
    <figure className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-background-elevated p-6">
      <div className="flex gap-0.5 text-accent" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} filled={i < resena.rating} />
        ))}
      </div>
      <span className="sr-only">{resena.rating} de 5 estrellas</span>

      <blockquote className="flex-1 text-neutral-200">
        <p>&ldquo;{resena.texto}&rdquo;</p>
      </blockquote>

      <figcaption className="flex items-center gap-3 pt-2">
        {resena.foto && (
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
            <Image
              src={resena.foto}
              alt={resena.fotoAlt ?? `Foto de perfil de ${resena.nombreCliente}`}
              fill
              sizes="44px"
              className="object-cover"
            />
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-white">{resena.nombreCliente}</p>
          <p className="text-xs text-neutral-500">
            {[resena.servicioConsumido, resena.sucursal].filter(Boolean).join(" · ")}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`h-4 w-4 ${filled ? "fill-current" : "fill-none stroke-current stroke-1"}`}
    >
      <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.9l-5.2 2.61.99-5.79-4.21-4.1 5.82-.85L10 1.5Z" />
    </svg>
  );
}
