import Image from "next/image";
import { UserRound } from "lucide-react";
import { equipo } from "@/data/equipo";
import { getOrganizationContent } from "@/lib/klipper/organization";
import { mergeEquipo } from "@/lib/organization-content";
import { getSiteContent } from "@/lib/sanity/site-content";

const DEFAULT_EQUIPO_EYEBROW = "Equipo";
const DEFAULT_EQUIPO_TITLE = "Manos con oficio";
const DEFAULT_EQUIPO_DESCRIPTION =
  "Barberos certificados, formados internamente bajo un mismo protocolo de servicio.";

export default async function EquipoSection() {
  const content = await getOrganizationContent();
  const equipoView = mergeEquipo(content?.professionals ?? null, equipo);

  // Klipper respondió pero no hay profesionales públicos: no se rellena
  // con el equipo curado (serían personas ficticias en un sitio real), así
  // que la sección completa se omite en vez de mostrar una grilla vacía.
  if (equipoView.length === 0) return null;

  const siteContent = await getSiteContent();
  const equipoEyebrow = siteContent?.equipoEyebrow || DEFAULT_EQUIPO_EYEBROW;
  const equipoTitle = siteContent?.equipoTitle || DEFAULT_EQUIPO_TITLE;
  const equipoDescription = siteContent?.equipoDescription || DEFAULT_EQUIPO_DESCRIPTION;

  return (
    <section id="equipo" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">{equipoEyebrow}</p>
        <h2 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
          {equipoTitle}
        </h2>
        <p className="mt-4 text-lg text-neutral-400">{equipoDescription}</p>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-6">
        {equipoView.map((barbero) => (
          <figure key={barbero.slug} className="group text-center">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-white/5">
              {barbero.foto && barbero.fotoEnVivo ? (
                // eslint-disable-next-line @next/next/no-img-element -- foto en vivo de Klipper, dominio de imagen no confirmado para next/image
                <img
                  src={barbero.foto}
                  alt={barbero.fotoAlt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : barbero.foto ? (
                <Image
                  src={barbero.foto}
                  alt={barbero.fotoAlt}
                  fill
                  sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-neutral-600">
                  <UserRound className="h-10 w-10" aria-hidden="true" />
                </div>
              )}
            </div>
            <figcaption className="mt-3">
              <p className="text-sm font-semibold text-white">{barbero.nombre}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
