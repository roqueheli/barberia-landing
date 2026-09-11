import { defineField, defineType } from "sanity";

// Sucursales creadas 100% en Sanity — sin sucursal real en Klipper detrás
// (ej. una sucursal que agenda con Agenda Pro en vez del wizard interno de
// Klipper). Se muestran igual que cualquier otra sucursal (misma card,
// misma página de detalle — ver lib/organization-content.ts:
// getAllSucursalesView/getSucursalView), la única diferencia es el botón
// de reserva: si `agendaUrl` está cargado, apunta a ese link externo en
// vez de abrir el wizard de reserva interno (ver
// components/SucursalReservarCta.tsx). Rating/reseñas: con googlePlaceId
// cargado, se traen en vivo de Google (mismo mecanismo que ya usan las
// sucursales de Klipper) — ver lib/sanity/sucursales.ts.
export default defineType({
  name: "sucursal",
  title: "Sucursales (fuera de Klipper)",
  type: "document",
  fields: [
    defineField({ name: "nombre", title: "Nombre", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "nombre", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "agendaUrl",
      title: "Link de agenda (externo)",
      description: "URL de agenda externa (ej. Agenda Pro) — no es la agenda de Klipper. El botón \"Reservar\" de esta sucursal abre este link en vez del wizard interno.",
      type: "url",
      validation: (r) => r.required().uri({ scheme: ["http", "https"] }),
    }),
    defineField({ name: "comuna", title: "Comuna", type: "string" }),
    defineField({ name: "direccion", title: "Dirección", type: "string" }),
    defineField({ name: "ciudad", title: "Ciudad", type: "string" }),
    defineField({ name: "region", title: "Región", type: "string" }),
    defineField({ name: "codigoPostal", title: "Código postal", type: "string" }),
    defineField({ name: "telefono", title: "Teléfono", type: "string" }),
    defineField({
      name: "whatsapp",
      title: "WhatsApp",
      description: "Número en formato internacional sin '+' (ej. 56912345678).",
      type: "string",
    }),
    defineField({ name: "referenciaMetro", title: "Referencia (metro, etc.)", type: "string" }),
    defineField({
      name: "horario",
      title: "Horario",
      type: "array",
      of: [
        {
          type: "object",
          name: "tramoHorario",
          fields: [
            defineField({ name: "dias", title: 'Días (ej. "Lunes a viernes")', type: "string" }),
            defineField({ name: "horas", title: 'Horas (ej. "09:30 - 20:00" o "Cerrado")', type: "string" }),
          ],
          preview: { select: { title: "dias", subtitle: "horas" } },
        },
      ],
    }),
    defineField({
      name: "googlePlaceId",
      title: "Place ID de Google",
      description:
        'Rating, número de reseñas y las reseñas mismas se traen en vivo desde Google con este ID — no hay que cargarlos a mano. Se obtiene con el buscador oficial de Google (buscas el nombre del local, click en el pin, copias el ID que empieza con "ChIJ"): developers.google.com/maps/documentation/javascript/examples/places-placeid-finder — un link de Google Maps o de resultados de búsqueda (con un CID en hex, ej. "#lrd=0x...") NO sirve acá, es un identificador distinto.',
      type: "string",
    }),
    defineField({
      name: "rating",
      title: "Rating (respaldo manual)",
      description: "Solo se usa si no hay Place ID de Google, o si Google no responde.",
      type: "number",
      validation: (r) => r.min(0).max(5),
    }),
    defineField({
      name: "numeroResenas",
      title: "Número de reseñas (respaldo manual)",
      description: "Solo se usa si no hay Place ID de Google, o si Google no responde.",
      type: "number",
    }),
    defineField({ name: "numeroBarberos", title: "Número de barberos", type: "number" }),
    defineField({ name: "descripcionCorta", title: "Descripción corta", type: "text", rows: 3 }),
    defineField({
      name: "imagenPortada",
      title: "Foto de portada",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({ name: "imagenPortadaAlt", title: "Texto alternativo de la portada", type: "string" }),
    defineField({
      name: "galeria",
      title: "Galería",
      type: "array",
      of: [
        {
          type: "object",
          name: "fotoGaleria",
          fields: [
            defineField({ name: "image", title: "Foto", type: "image", options: { hotspot: true } }),
            defineField({ name: "alt", title: "Texto alternativo", type: "string" }),
          ],
          preview: { select: { title: "alt", media: "image" } },
        },
      ],
    }),
    defineField({
      name: "mapsUrl",
      title: "Link de Google Maps",
      type: "url",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
    }),
    defineField({ name: "geoLat", title: "Latitud", type: "number" }),
    defineField({ name: "geoLng", title: "Longitud", type: "number" }),
    defineField({ name: "destacada", title: "Destacada (\"Casa matriz\")", type: "boolean" }),
  ],
  preview: {
    select: { title: "nombre", subtitle: "direccion", media: "imagenPortada" },
  },
});
