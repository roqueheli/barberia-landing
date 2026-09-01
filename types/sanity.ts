import type { SanityImageSource } from "@sanity/image-url";

// DTO plano que consumen los componentes — nunca el shape crudo de Sanity
// (image refs, _key, _type, etc.), igual que los DTOs de lib/klipper/mappers.ts.
// Cada campo es independientemente opcional: si un editor todavía no
// completó un campo puntual, ese campo llega en null/[] y el componente
// cae a su valor por defecto (el copy/foto actual) sin que el resto de la
// página se vea afectado.
export interface SiteContentStat {
  valor: string;
  etiqueta: string;
}

export interface SiteContentGalleryPhoto {
  url: string;
  alt: string;
}

export interface SiteContent {
  // Marca (header/footer)
  logoImage: string | null;
  logoImageAlt: string | null;
  /** Solo el handle, sin "@" ni URL (ej. "better.barber.club"). */
  instagramHandle: string | null;
  // Hero
  heroImage: string | null;
  heroImageAlt: string | null;
  heroTitleMain: string | null;
  heroTitleAccent: string | null;
  heroSubtitle: string | null;
  heroPrimaryCta: string | null;
  heroSecondaryCta: string | null;
  heroStats: SiteContentStat[];
  // Nosotros
  aboutImage: string | null;
  aboutImageAlt: string | null;
  aboutEyebrow: string | null;
  aboutTitle: string | null;
  aboutParagraphs: string[];
  aboutIncluye: string[];
  aboutCta: string | null;
  // Proceso
  procesoVideo: string | null;
  procesoVideoType: string | null;
  procesoPosterImage: string | null;
  procesoPosterImageAlt: string | null;
  procesoEyebrow: string | null;
  procesoTitle: string | null;
  procesoDescription: string | null;
  procesoPasos: string[];
  procesoInstagramCta: string | null;
  // Galería
  galleryPhotos: SiteContentGalleryPhoto[];
  galeriaEyebrow: string | null;
  galeriaTitle: string | null;
  // Servicios
  serviciosEyebrow: string | null;
  serviciosTitle: string | null;
  serviciosDescription: string | null;
  serviciosCta: string | null;
  // Sucursales (solo el antetítulo — la H2 se calcula en vivo)
  sucursalesEyebrow: string | null;
  // Equipo
  equipoEyebrow: string | null;
  equipoTitle: string | null;
  equipoDescription: string | null;
  // Reseñas (solo encabezado — el contenido de reseñas viene de Google)
  resenasEyebrow: string | null;
  resenasTitle: string | null;
  // Promo
  promoTitulo: string | null;
  promoDescripcion: string | null;
  promoDescuento: string | null;
  promoCondiciones: string | null;
  // FAQ (solo encabezado — las preguntas siguen en data/faq.ts)
  faqEyebrow: string | null;
  faqTitle: string | null;
  // CTA final
  ctaFinalTitle: string | null;
  ctaFinalDescription: string | null;
  ctaFinalPrimaryCta: string | null;
  ctaFinalWhatsappCta: string | null;
}

// Forma cruda tal cual la devuelve la query GROQ de lib/sanity/site-content.ts
// — los campos imagen son el objeto completo (asset ref + hotspot/crop),
// sin dereferenciar el asset: @sanity/image-url solo necesita el _ref para
// construir la URL.
export interface SiteContentRaw {
  logoImage?: SanityImageSource | null;
  logoImageAlt?: string | null;
  instagramHandle?: string | null;
  heroImage?: SanityImageSource | null;
  heroImageAlt?: string | null;
  heroTitleMain?: string | null;
  heroTitleAccent?: string | null;
  heroSubtitle?: string | null;
  heroPrimaryCta?: string | null;
  heroSecondaryCta?: string | null;
  heroStats?: { valor?: string | null; etiqueta?: string | null }[];

  aboutImage?: SanityImageSource | null;
  aboutImageAlt?: string | null;
  aboutEyebrow?: string | null;
  aboutTitle?: string | null;
  aboutParagraphs?: (string | null)[];
  aboutIncluye?: (string | null)[];
  aboutCta?: string | null;

  // Dereferenciado en la query GROQ (asset->url) — un archivo no tiene
  // builder de URL como las imágenes, se resuelve directo del asset.
  procesoVideo?: { url?: string | null; mimeType?: string | null } | null;
  procesoPosterImage?: SanityImageSource | null;
  procesoPosterImageAlt?: string | null;
  procesoEyebrow?: string | null;
  procesoTitle?: string | null;
  procesoDescription?: string | null;
  procesoPasos?: (string | null)[];
  procesoInstagramCta?: string | null;

  galleryPhotos?: {
    image?: SanityImageSource | null;
    alt?: string | null;
  }[];
  galeriaEyebrow?: string | null;
  galeriaTitle?: string | null;

  serviciosEyebrow?: string | null;
  serviciosTitle?: string | null;
  serviciosDescription?: string | null;
  serviciosCta?: string | null;

  sucursalesEyebrow?: string | null;

  equipoEyebrow?: string | null;
  equipoTitle?: string | null;
  equipoDescription?: string | null;

  resenasEyebrow?: string | null;
  resenasTitle?: string | null;

  promoTitulo?: string | null;
  promoDescripcion?: string | null;
  promoDescuento?: string | null;
  promoCondiciones?: string | null;

  faqEyebrow?: string | null;
  faqTitle?: string | null;

  ctaFinalTitle?: string | null;
  ctaFinalDescription?: string | null;
  ctaFinalPrimaryCta?: string | null;
  ctaFinalWhatsappCta?: string | null;
}
