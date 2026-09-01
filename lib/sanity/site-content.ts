// Fotos y textos curados que NO vienen de Klipper (Hero, Nosotros,
// Proceso, Galería, y los encabezados del resto de las secciones) —
// barberos/servicios/sucursales siguen viniendo de lib/klipper/*. Mismo
// patrón que lib/klipper/organization.ts: cache() para dedup entre Server
// Components, degrade a null (nunca throw) si Sanity no está configurado o
// la llamada falla, para que cada sección pueda caer a su copy/foto por
// defecto sin romper el render.
import "server-only";
import { cache } from "react";
import { sanityClient, urlForImage, SANITY_PROJECT_ID } from "./client";
import type { SiteContent, SiteContentRaw } from "@/types/sanity";

const SITE_CONTENT_QUERY = `*[_type == "siteContent"][0]{
  logoImage, logoImageAlt, instagramHandle,

  heroImage, heroImageAlt, heroTitleMain, heroTitleAccent, heroSubtitle,
  heroPrimaryCta, heroSecondaryCta, heroStats[]{ valor, etiqueta },

  aboutImage, aboutImageAlt, aboutEyebrow, aboutTitle, aboutParagraphs,
  aboutIncluye, aboutCta,

  procesoVideo{ "url": asset->url, "mimeType": asset->mimeType }, procesoPosterImage, procesoPosterImageAlt,
  procesoEyebrow, procesoTitle, procesoDescription, procesoPasos, procesoInstagramCta,

  galleryPhotos[]{ image, alt }, galeriaEyebrow, galeriaTitle,

  serviciosEyebrow, serviciosTitle, serviciosDescription, serviciosCta,

  sucursalesEyebrow,

  equipoEyebrow, equipoTitle, equipoDescription,

  resenasEyebrow, resenasTitle,

  promoTitulo, promoDescripcion, promoDescuento, promoCondiciones,

  faqEyebrow, faqTitle,

  ctaFinalTitle, ctaFinalDescription, ctaFinalPrimaryCta, ctaFinalWhatsappCta
}`;

function strings(values: (string | null | undefined)[] | undefined): string[] {
  return (values ?? []).filter((v): v is string => Boolean(v && v.trim().length > 0));
}

function mapSiteContent(raw: SiteContentRaw | null): SiteContent {
  return {
    logoImage: raw?.logoImage ? urlForImage(raw.logoImage) : null,
    logoImageAlt: raw?.logoImageAlt ?? null,
    instagramHandle: raw?.instagramHandle ?? null,

    heroImage: raw?.heroImage ? urlForImage(raw.heroImage) : null,
    heroImageAlt: raw?.heroImageAlt ?? null,
    heroTitleMain: raw?.heroTitleMain ?? null,
    heroTitleAccent: raw?.heroTitleAccent ?? null,
    heroSubtitle: raw?.heroSubtitle ?? null,
    heroPrimaryCta: raw?.heroPrimaryCta ?? null,
    heroSecondaryCta: raw?.heroSecondaryCta ?? null,
    heroStats: (raw?.heroStats ?? [])
      .filter((s): s is { valor: string; etiqueta: string } => Boolean(s.valor && s.etiqueta))
      .map((s) => ({ valor: s.valor, etiqueta: s.etiqueta })),

    aboutImage: raw?.aboutImage ? urlForImage(raw.aboutImage) : null,
    aboutImageAlt: raw?.aboutImageAlt ?? null,
    aboutEyebrow: raw?.aboutEyebrow ?? null,
    aboutTitle: raw?.aboutTitle ?? null,
    aboutParagraphs: strings(raw?.aboutParagraphs),
    aboutIncluye: strings(raw?.aboutIncluye),
    aboutCta: raw?.aboutCta ?? null,

    procesoVideo: raw?.procesoVideo?.url ?? null,
    procesoVideoType: raw?.procesoVideo?.mimeType ?? null,
    procesoPosterImage: raw?.procesoPosterImage ? urlForImage(raw.procesoPosterImage) : null,
    procesoPosterImageAlt: raw?.procesoPosterImageAlt ?? null,
    procesoEyebrow: raw?.procesoEyebrow ?? null,
    procesoTitle: raw?.procesoTitle ?? null,
    procesoDescription: raw?.procesoDescription ?? null,
    procesoPasos: strings(raw?.procesoPasos),
    procesoInstagramCta: raw?.procesoInstagramCta ?? null,

    galleryPhotos: (raw?.galleryPhotos ?? [])
      .filter((p): p is { image: NonNullable<typeof p.image>; alt?: string | null } => Boolean(p.image))
      .map((p) => ({ url: urlForImage(p.image), alt: p.alt ?? "" })),
    galeriaEyebrow: raw?.galeriaEyebrow ?? null,
    galeriaTitle: raw?.galeriaTitle ?? null,

    serviciosEyebrow: raw?.serviciosEyebrow ?? null,
    serviciosTitle: raw?.serviciosTitle ?? null,
    serviciosDescription: raw?.serviciosDescription ?? null,
    serviciosCta: raw?.serviciosCta ?? null,

    sucursalesEyebrow: raw?.sucursalesEyebrow ?? null,

    equipoEyebrow: raw?.equipoEyebrow ?? null,
    equipoTitle: raw?.equipoTitle ?? null,
    equipoDescription: raw?.equipoDescription ?? null,

    resenasEyebrow: raw?.resenasEyebrow ?? null,
    resenasTitle: raw?.resenasTitle ?? null,

    promoTitulo: raw?.promoTitulo ?? null,
    promoDescripcion: raw?.promoDescripcion ?? null,
    promoDescuento: raw?.promoDescuento ?? null,
    promoCondiciones: raw?.promoCondiciones ?? null,

    faqEyebrow: raw?.faqEyebrow ?? null,
    faqTitle: raw?.faqTitle ?? null,

    ctaFinalTitle: raw?.ctaFinalTitle ?? null,
    ctaFinalDescription: raw?.ctaFinalDescription ?? null,
    ctaFinalPrimaryCta: raw?.ctaFinalPrimaryCta ?? null,
    ctaFinalWhatsappCta: raw?.ctaFinalWhatsappCta ?? null,
  };
}

export const getSiteContent = cache(async (): Promise<SiteContent | null> => {
  if (!SANITY_PROJECT_ID) return null;

  try {
    const raw = await sanityClient.fetch<SiteContentRaw | null>(
      SITE_CONTENT_QUERY,
      {},
      { next: { revalidate: 300, tags: ["sanity-site-content"] } }
    );
    return mapSiteContent(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("[sanity/site-content]", message);
    return null;
  }
});
