import Image from "next/image";
import { siteConfig, stats as DEFAULT_STATS } from "@/data/site";
import { sucursales } from "@/data/sucursales";
import { equipo } from "@/data/equipo";
import ReservarButton from "@/components/ReservarButton";
import { getOrganizationContent } from "@/lib/klipper/organization";
import { mergeSucursales, mergeEquipo, aggregateBranchRatings } from "@/lib/organization-content";
import { getSiteContent } from "@/lib/sanity/site-content";
import type { StatItem } from "@/types";

const DEFAULT_HERO_IMAGE = "https://picsum.photos/seed/estudio-belleza-hero/2000/1250";
const DEFAULT_HERO_TITLE_MAIN = "Belleza y cuidado con";
const DEFAULT_HERO_TITLE_ACCENT = "atención personalizada";
const DEFAULT_HERO_SUBTITLE =
  "Reserva tu hora exacta, sin esperas ni apuros. Uñas, color, tratamientos capilares y faciales en un espacio cálido pensado para que te relajes de verdad.";
const DEFAULT_HERO_PRIMARY_CTA = "Reservar hora";
const DEFAULT_HERO_SECONDARY_CTA = "Ver servicios y precios";

const numeroReseñasFormatter = new Intl.NumberFormat("es-CL");

// Las 4 stats por defecto vienen de data/site.ts (mismo copy que existe
// hoy). rating/reseñas se reemplazan por el agregado real de
// google_rating/google_review_count que Klipper ya trae por sucursal (ver
// lib/organization-content.ts:aggregateBranchRatings — no requiere llamar
// a la API de Google); barberos/sucursales por los conteos reales de
// Klipper — cada una cae a su valor por defecto individualmente si falta
// el dato en vivo correspondiente.
function computeLiveStats(params: {
  ratingReal: number | null;
  reseñasReal: number | null;
  barberosReal: number;
  sucursalesReal: number;
}): StatItem[] {
  const { ratingReal, reseñasReal, barberosReal, sucursalesReal } = params;
  return DEFAULT_STATS.map((stat) => {
    if (stat.id === "rating" && ratingReal != null) {
      return { ...stat, valor: `${ratingReal.toFixed(1)}/5` };
    }
    if (stat.id === "resenas" && reseñasReal != null) {
      return { ...stat, valor: numeroReseñasFormatter.format(reseñasReal) };
    }
    if (stat.id === "barberos" && barberosReal > 0) {
      return { ...stat, valor: String(barberosReal) };
    }
    if (stat.id === "sucursales" && sucursalesReal > 0) {
      return { ...stat, valor: String(sucursalesReal) };
    }
    return stat;
  });
}

export default async function Hero() {
  const content = await getOrganizationContent();
  const sucursalesView = mergeSucursales(content?.branches ?? null, sucursales);
  const sucursalesTexto = sucursalesView.map((s) => s.nombre).join(" · ");
  const equipoView = mergeEquipo(content?.professionals ?? null, equipo);
  const { rating: ratingReal, totalResenas: reseñasReal } = aggregateBranchRatings(sucursalesView);
  const siteContent = await getSiteContent();
  const heroImage = siteContent?.heroImage ?? DEFAULT_HERO_IMAGE;
  const heroImageAlt =
    siteContent?.heroImageAlt ||
    `Interior del ${siteConfig.nombreCorto}, un estudio de belleza con iluminación cálida y ambiente acogedor`;
  const heroTitleMain = siteContent?.heroTitleMain || DEFAULT_HERO_TITLE_MAIN;
  const heroTitleAccent = siteContent?.heroTitleAccent || DEFAULT_HERO_TITLE_ACCENT;
  const heroSubtitle = siteContent?.heroSubtitle || DEFAULT_HERO_SUBTITLE;
  const heroPrimaryCta = siteContent?.heroPrimaryCta || DEFAULT_HERO_PRIMARY_CTA;
  const heroSecondaryCta = siteContent?.heroSecondaryCta || DEFAULT_HERO_SECONDARY_CTA;
  const heroStats = siteContent?.heroStats.length
    ? siteContent.heroStats
    : computeLiveStats({
        ratingReal,
        reseñasReal,
        barberosReal: equipoView.length,
        sucursalesReal: sucursalesView.length,
      });

  return (
    <section id="inicio" className="relative flex min-h-[92vh] items-end overflow-hidden">
      <Image
        src={heroImage}
        alt={heroImageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Capa base uniforme: garantiza un mínimo de oscurecido sobre toda la
          foto para que el texto sea legible aunque la imagen tenga zonas
          claras o reflejos detrás del título. */}
      <div aria-hidden="true" className="absolute inset-0 bg-black/45" />
      {/* Refuerzo vertical (más oscuro abajo, donde están las stats) y
          horizontal (cubre la columna izquierda del texto, no solo el borde). */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/45"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-16 pt-40 sm:px-6 sm:pb-20 lg:px-8">
        <div className="max-w-3xl">
          {sucursalesTexto && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-neutral-200 backdrop-blur-sm">
              {sucursalesTexto}
            </span>
          )}

          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.6)] sm:text-6xl lg:text-7xl">
            {heroTitleMain}{" "}
            <span className="text-accent">{heroTitleAccent}</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-neutral-100 [text-shadow:0_1px_10px_rgba(0,0,0,0.55)] sm:text-xl">
            {heroSubtitle}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ReservarButton
              analyticsSource="hero-primary"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-4 text-base font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition hover:bg-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {heroPrimaryCta}
            </ReservarButton>
            <a
              href="#servicios"
              data-analytics-event="ver_servicios_click"
              data-analytics-source="hero-secondary"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              {heroSecondaryCta}
            </a>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/15 pt-8 sm:grid-cols-4">
          {heroStats.map((stat, i) => (
            <div key={`${stat.etiqueta}-${i}`}>
              <dt className="sr-only">{stat.etiqueta}</dt>
              <dd className="font-display text-3xl font-bold text-white sm:text-4xl">
                {stat.valor}
              </dd>
              <p className="mt-1 text-sm text-neutral-300">{stat.etiqueta}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
