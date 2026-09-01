import type { Metadata } from "next";
import Image from "next/image";
import { Scissors } from "lucide-react";
import { notFound } from "next/navigation";
import { siteConfig } from "@/data/site";
import ReservarButton from "@/components/ReservarButton";
import { getOrganizationContent } from "@/lib/klipper/organization";
import { getLiveServicioView, liveServicios } from "@/lib/organization-content";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Contenido en vivo de Klipper cacheado 300s (ver lib/klipper/organization.ts).
export const revalidate = 300;

function formatCLP(valor: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor);
}

export async function generateStaticParams() {
  // Slugs SOLO desde Klipper (mismo esquema determinista que la card de la
  // home). Si Klipper no responde, se prerenderiza vacío y las páginas se
  // resuelven on-demand con dynamicParams (default de Next).
  const content = await getOrganizationContent();
  return liveServicios(content?.services ?? null).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const servicio = await getLiveServicioView(slug);
  if (!servicio) return {};

  const title = servicio.nombre;
  const description = servicio.descripcionCorta ?? `Desde ${formatCLP(servicio.precioDesde)}`;

  return {
    title,
    description,
    alternates: { canonical: `${siteConfig.url}/servicios/${servicio.slug}` },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/servicios/${servicio.slug}`,
      ...(servicio.imagen
        ? { images: [{ url: servicio.imagen, width: 900, height: 700, alt: servicio.imagenAlt ?? servicio.nombre }] }
        : {}),
    },
  };
}

export default async function ServicioPage({ params }: PageProps) {
  const { slug } = await params;
  const servicio = await getLiveServicioView(slug);
  if (!servicio) notFound();

  return (
    <main id="main-content" className="flex-1">
      <section className="mx-auto max-w-5xl px-4 py-14 pt-32 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-background-elevated">
            {servicio.imagen && servicio.imagenEnVivo ? (
              // eslint-disable-next-line @next/next/no-img-element -- foto en vivo de Klipper, dominio de imagen no confirmado para next/image
              <img
                src={servicio.imagen}
                alt={servicio.imagenAlt ?? servicio.nombre}
                fetchPriority="high"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : servicio.imagen ? (
              <Image
                src={servicio.imagen}
                alt={servicio.imagenAlt ?? servicio.nombre}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-neutral-700">
                <Scissors className="h-16 w-16" aria-hidden="true" />
              </div>
            )}
            {servicio.insignia && (
              <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                Servicio insignia
              </span>
            )}
          </div>

          <div>
            <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">
              {servicio.nombre}
            </h1>
            <div className="mt-4 flex items-center gap-4">
              <span className="text-2xl font-bold text-accent">
                Desde {formatCLP(servicio.precioDesde)}
              </span>
              <span className="text-sm text-neutral-500">{servicio.duracionMinutos} min</span>
            </div>

            {servicio.descripcionLarga && (
              <p className="mt-6 text-neutral-300">{servicio.descripcionLarga}</p>
            )}

            {servicio.incluye.length > 0 && (
              <>
                <h2 className="mt-8 text-sm font-semibold uppercase tracking-widest text-neutral-500">
                  Incluye
                </h2>
                <ul className="mt-3 flex flex-col gap-2">
                  {servicio.incluye.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-neutral-200">
                      <svg
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-accent/15 p-1 text-accent"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 10.5l4 4 8-9" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <ReservarButton
              servicioSlug={servicio.slug}
              analyticsSource={`servicio-detail-${servicio.slug}`}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition hover:bg-accent-strong"
            >
              Reservar este servicio
            </ReservarButton>
          </div>
        </div>
      </section>
    </main>
  );
}
