import { defineField, defineType } from "sanity";

// Único documento (singleton, forzado en sanity/structure.ts +
// schema.templates en sanity.config.ts) con las fotos y textos curados que
// NO vienen de Klipper. Barberos/servicios/sucursales siguen mostrando su
// foto/nombre/precio desde la API pública de Klipper — acá va el logo del
// header/footer y el copy editorial de Hero, Nosotros, Proceso, Galería y
// los encabezados de las demás secciones. Cada campo es opcional —
// lib/sanity/site-content.ts cae al texto/foto actual de cada componente
// si falta (el logo además tiene un segundo fallback al logo_url en vivo
// de Klipper antes de caer al nombre en texto — ver lib/branding.ts).
//
// La H2 de Sucursales ("Tres casas, un mismo estándar") se calcula en vivo
// según la cantidad real de sucursales (SucursalesSection.tsx) y a
// propósito NO tiene campo acá — un texto estático lo pisaría.
// Los ítems de FAQ (data/faq.ts) y el contenido de reseñas
// (data/resenas.ts) tampoco están acá — fuera de alcance por decisión
// explícita.
export default defineType({
  name: "siteContent",
  title: "Contenido del sitio",
  type: "document",
  groups: [
    { name: "marca", title: "Marca (logo)" },
    { name: "hero", title: "Hero" },
    { name: "about", title: "Nosotros" },
    { name: "proceso", title: "Proceso" },
    { name: "galeria", title: "Galería" },
    { name: "servicios", title: "Servicios" },
    { name: "sucursales", title: "Sucursales" },
    { name: "equipo", title: "Equipo" },
    { name: "resenas", title: "Reseñas" },
    { name: "promo", title: "Promo" },
    { name: "faq", title: "FAQ" },
    { name: "ctaFinal", title: "CTA final" },
  ],
  fields: [
    // --- Marca (header/footer) --------------------------------------------
    // Prioridad: este logo (si se carga) > logo_url en vivo de Klipper
    // (metadata.media_configs.logo_url) > nombre en texto (siteConfig).
    defineField({
      name: "logoImage",
      title: "Logo",
      description: "Se usa en el header y el footer. Si se deja vacío, se usa el logo en vivo de Klipper (si lo trae) o el nombre en texto.",
      type: "image",
      options: { hotspot: true },
      group: "marca",
    }),
    defineField({ name: "logoImageAlt", title: "Texto alternativo del logo", type: "string", group: "marca" }),
    // Prioridad: este handle > el que trae en vivo Klipper
    // (metadata.media_configs.social_media.instagram) > el de siteConfig.
    defineField({
      name: "instagramHandle",
      title: "Cuenta de Instagram",
      description: 'Solo el nombre de usuario, sin "@" ni URL. Ej: "better.barber.club". Se usa en el botón de Instagram de la sección Proceso y en el ícono del footer.',
      type: "string",
      group: "marca",
    }),

    // --- Hero ---------------------------------------------------------
    defineField({
      name: "heroImage",
      title: "Foto de fondo",
      type: "image",
      options: { hotspot: true },
      group: "hero",
    }),
    defineField({ name: "heroImageAlt", title: "Texto alternativo de la foto", type: "string", group: "hero" }),
    defineField({
      name: "heroTitleMain",
      title: "Título — parte principal",
      description: 'Ej: "Barbería con estándar de"',
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "heroTitleAccent",
      title: "Título — parte destacada",
      description: 'Ej: "servicio 5 estrellas" (se muestra en el color de acento)',
      type: "string",
      group: "hero",
    }),
    defineField({ name: "heroSubtitle", title: "Subtítulo", type: "text", rows: 3, group: "hero" }),
    defineField({ name: "heroPrimaryCta", title: "Botón principal", type: "string", group: "hero" }),
    defineField({ name: "heroSecondaryCta", title: "Botón secundario", type: "string", group: "hero" }),
    defineField({
      name: "heroStats",
      title: "Estadísticas",
      type: "array",
      group: "hero",
      of: [
        {
          type: "object",
          name: "stat",
          fields: [
            defineField({ name: "valor", title: "Valor", type: "string" }),
            defineField({ name: "etiqueta", title: "Etiqueta", type: "string" }),
          ],
          preview: { select: { title: "valor", subtitle: "etiqueta" } },
        },
      ],
    }),

    // --- Nosotros -------------------------------------------------------
    defineField({
      name: "aboutImage",
      title: "Foto",
      type: "image",
      options: { hotspot: true },
      group: "about",
    }),
    defineField({ name: "aboutImageAlt", title: "Texto alternativo de la foto", type: "string", group: "about" }),
    defineField({ name: "aboutEyebrow", title: "Antetítulo", type: "string", group: "about" }),
    defineField({ name: "aboutTitle", title: "Título", type: "string", group: "about" }),
    defineField({
      name: "aboutParagraphs",
      title: "Párrafos",
      type: "array",
      of: [{ type: "text", rows: 3 }],
      group: "about",
    }),
    defineField({
      name: "aboutIncluye",
      title: "Qué incluye todo servicio",
      type: "array",
      of: [{ type: "string" }],
      group: "about",
    }),
    defineField({ name: "aboutCta", title: "Botón", type: "string", group: "about" }),

    // --- Proceso ----------------------------------------------------------
    defineField({
      name: "procesoVideo",
      title: "Video",
      description: "Reemplaza el video de ejemplo. Sube un .mp4 (otros formatos pueden no reproducirse en todos los navegadores).",
      type: "file",
      options: { accept: "video/*" },
      group: "proceso",
    }),
    defineField({
      name: "procesoPosterImage",
      title: "Imagen de portada del video",
      type: "image",
      options: { hotspot: true },
      group: "proceso",
    }),
    defineField({
      name: "procesoPosterImageAlt",
      title: "Texto alternativo de la portada",
      type: "string",
      group: "proceso",
    }),
    defineField({ name: "procesoEyebrow", title: "Antetítulo", type: "string", group: "proceso" }),
    defineField({ name: "procesoTitle", title: "Título", type: "string", group: "proceso" }),
    defineField({ name: "procesoDescription", title: "Descripción", type: "text", rows: 3, group: "proceso" }),
    defineField({
      name: "procesoPasos",
      title: "Pasos",
      type: "array",
      of: [{ type: "string" }],
      group: "proceso",
    }),
    defineField({ name: "procesoInstagramCta", title: "Botón de Instagram", type: "string", group: "proceso" }),

    // --- Galería ----------------------------------------------------------
    defineField({
      name: "galleryPhotos",
      title: "Fotos",
      type: "array",
      group: "galeria",
      of: [
        {
          type: "object",
          name: "galleryPhoto",
          fields: [
            defineField({ name: "image", title: "Foto", type: "image", options: { hotspot: true } }),
            defineField({ name: "alt", title: "Texto alternativo", type: "string" }),
          ],
          preview: { select: { title: "alt", media: "image" } },
        },
      ],
    }),
    defineField({ name: "galeriaEyebrow", title: "Antetítulo", type: "string", group: "galeria" }),
    defineField({ name: "galeriaTitle", title: "Título", type: "string", group: "galeria" }),

    // --- Servicios --------------------------------------------------------
    defineField({ name: "serviciosEyebrow", title: "Antetítulo", type: "string", group: "servicios" }),
    defineField({ name: "serviciosTitle", title: "Título", type: "string", group: "servicios" }),
    defineField({ name: "serviciosDescription", title: "Descripción", type: "text", rows: 2, group: "servicios" }),
    defineField({ name: "serviciosCta", title: "Botón", type: "string", group: "servicios" }),

    // --- Sucursales -------------------------------------------------------
    defineField({ name: "sucursalesEyebrow", title: "Antetítulo", type: "string", group: "sucursales" }),

    // --- Equipo -------------------------------------------------------------
    defineField({ name: "equipoEyebrow", title: "Antetítulo", type: "string", group: "equipo" }),
    defineField({ name: "equipoTitle", title: "Título", type: "string", group: "equipo" }),
    defineField({ name: "equipoDescription", title: "Descripción", type: "text", rows: 2, group: "equipo" }),

    // --- Reseñas ----------------------------------------------------------
    defineField({ name: "resenasEyebrow", title: "Antetítulo", type: "string", group: "resenas" }),
    defineField({ name: "resenasTitle", title: "Título", type: "string", group: "resenas" }),

    // --- Promo --------------------------------------------------------------
    defineField({ name: "promoTitulo", title: "Título", type: "string", group: "promo" }),
    defineField({ name: "promoDescripcion", title: "Descripción", type: "text", rows: 3, group: "promo" }),
    defineField({ name: "promoDescuento", title: "Etiqueta de descuento", type: "string", group: "promo" }),
    defineField({ name: "promoCondiciones", title: "Condiciones", type: "text", rows: 2, group: "promo" }),

    // --- FAQ ------------------------------------------------------------
    defineField({ name: "faqEyebrow", title: "Antetítulo", type: "string", group: "faq" }),
    defineField({ name: "faqTitle", title: "Título", type: "string", group: "faq" }),

    // --- CTA final --------------------------------------------------------
    defineField({ name: "ctaFinalTitle", title: "Título", type: "string", group: "ctaFinal" }),
    defineField({ name: "ctaFinalDescription", title: "Descripción", type: "text", rows: 2, group: "ctaFinal" }),
    defineField({ name: "ctaFinalPrimaryCta", title: "Botón de reserva", type: "string", group: "ctaFinal" }),
    defineField({ name: "ctaFinalWhatsappCta", title: "Botón de WhatsApp", type: "string", group: "ctaFinal" }),
  ],
  preview: {
    prepare() {
      return { title: "Contenido del sitio" };
    },
  },
});
