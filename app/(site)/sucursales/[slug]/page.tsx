import type { Metadata } from "next";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { sucursales } from "@/data/sucursales";
import { siteConfig } from "@/data/site";
import ReservarButton from "@/components/ReservarButton";
import JsonLd from "@/components/JsonLd";
import { buildSucursalJsonLd } from "@/lib/jsonld";
import { getSucursalView } from "@/lib/organization-content";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Contenido en vivo de Klipper cacheado 300s (ver lib/klipper/organization.ts).
export const revalidate = 300;

export function generateStaticParams() {
  return sucursales.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sucursal = await getSucursalView(slug, sucursales);
  if (!sucursal) return {};

  const title = sucursal.comuna ? `${sucursal.nombre} — ${sucursal.comuna}` : sucursal.nombre;
  const description = sucursal.descripcionCorta ?? sucursal.direccion;

  return {
    title,
    description,
    alternates: { canonical: `${siteConfig.url}/sucursales/${sucursal.slug}` },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/sucursales/${sucursal.slug}`,
      ...(sucursal.imagenPortada
        ? {
            images: [
              { url: sucursal.imagenPortada, width: 1600, height: 1000, alt: sucursal.imagenPortadaAlt ?? sucursal.nombre },
            ],
          }
        : {}),
    },
  };
}

export default async function SucursalPage({ params }: PageProps) {
  const { slug } = await params;
  const sucursal = await getSucursalView(slug, sucursales);
  if (!sucursal) notFound();

  return (
    <main id="main-content" className="flex-1">
      <JsonLd data={buildSucursalJsonLd(sucursal)} />

      <section className="relative flex min-h-[60vh] items-end overflow-hidden bg-background-elevated">
        {sucursal.imagenPortada && sucursal.imagenPortadaEnVivo ? (
          // eslint-disable-next-line @next/next/no-img-element -- foto en vivo de Klipper, dominio de imagen no confirmado para next/image
          <img
            src={sucursal.imagenPortada}
            alt={sucursal.imagenPortadaAlt ?? sucursal.nombre}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : sucursal.imagenPortada ? (
          <Image
            src={sucursal.imagenPortada}
            alt={sucursal.imagenPortadaAlt ?? sucursal.nombre}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-700">
            <MapPin className="h-16 w-16" aria-hidden="true" />
          </div>
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
        <div className="relative mx-auto w-full max-w-5xl px-4 pb-14 pt-32 sm:px-6 lg:px-8">
          {sucursal.comuna && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-neutral-200 backdrop-blur-sm">
              {sucursal.comuna}
              {sucursal.ciudad ? ` · ${sucursal.ciudad}` : ""}
            </span>
          )}
          <h1 className="mt-4 font-display text-4xl font-bold text-white sm:text-6xl">
            {sucursal.nombre}
          </h1>
          {sucursal.rating != null && (
            <div className="mt-4 flex items-center gap-2 text-accent">
              <span className="font-semibold text-white">{sucursal.rating}</span>
              <span className="text-neutral-300">({sucursal.numeroResenas} reseñas)</span>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {sucursal.descripcionCorta && (
              <p className="text-lg text-neutral-300">{sucursal.descripcionCorta}</p>
            )}

            {sucursal.galeria.length > 0 && (
              <>
                <h2 className="mt-10 font-display text-2xl font-semibold text-white">Galería</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {sucursal.galeria.map((foto) => (
                    <div key={foto.src} className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                      <Image
                        src={foto.src}
                        alt={foto.alt}
                        fill
                        loading="lazy"
                        sizes="(min-width: 640px) 33vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <aside className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-background-elevated p-6 h-fit">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
                Dirección
              </h2>
              {sucursal.mapsUrl ? (
                <a
                  href={sucursal.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-analytics-event="ver_en_maps_click"
                  data-analytics-source={`sucursal-detail-${sucursal.slug}`}
                  className="mt-2 block text-neutral-200 underline-offset-2 hover:text-white hover:underline"
                >
                  {sucursal.direccion}
                </a>
              ) : (
                <p className="mt-2 text-neutral-200">{sucursal.direccion}</p>
              )}
              {sucursal.referenciaMetro && (
                <p className="text-sm text-neutral-400">{sucursal.referenciaMetro}</p>
              )}
            </div>

            {sucursal.horario.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
                  Horario
                </h2>
                <ul className="mt-2 flex flex-col gap-1 text-sm text-neutral-300">
                  {sucursal.horario.map((h) => (
                    <li key={h.dias} className="flex justify-between gap-4">
                      <span>{h.dias}</span>
                      <span className="text-neutral-400">{h.horas}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
                Contacto
              </h2>
              <p className="mt-2 text-sm text-neutral-300">{sucursal.telefono}</p>
            </div>

            <ReservarButton
              sucursalSlug={sucursal.slug}
              analyticsSource={`sucursal-detail-${sucursal.slug}`}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-strong"
            >
              Reservar en {sucursal.nombre}
            </ReservarButton>
          </aside>
        </div>
      </section>
    </main>
  );
}
