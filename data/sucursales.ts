import type { Sucursal } from "@/types";
import { siteConfig } from "@/data/site";

/**
 * Sucursales reales de Better Barber Club (org "better-barber-club" en
 * Klipper). nombre/dirección/teléfono/geo se sobreescriben en vivo desde
 * Klipper cuando hay match (ver lib/organization-content.ts) — lo que
 * define esta lista es el copy de marketing que Klipper no entrega:
 * galería, descripción y horario. Los slugs deben coincidir 1:1 con el
 * nombre real de cada sucursal en Klipper para que el match automático
 * sea exacto (si agregas/renombras una sucursal ahí, actualiza esto).
 *
 * imagenPortada/galeria usan fotos de stock (picsum) como placeholder:
 * ninguna sucursal tiene photo_url cargada en Klipper todavía. Reemplaza
 * por fotos reales del local en cuanto las tengas.
 *
 * googlePlaceId vacío acá a propósito: Klipper ya trae el Place ID real de
 * cada sucursal (google_place_id, verificado contra la respuesta real de
 * landing_by_slug) y se usa en vivo con prioridad sobre este campo — ver
 * lib/organization-content.ts:mergeOneSucursal. Este campo solo sirve de
 * respaldo manual si alguna sucursal no lo trae desde Klipper.
 */
export const sucursales: Sucursal[] = [
  {
    slug: "vicuna-mackenna",
    nombre: `${siteConfig.nombreCorto} Vicuña Mackenna`,
    comuna: "La Florida",
    direccion: "Vicuña Mackenna Poniente 7075",
    ciudad: "Santiago",
    region: "Región Metropolitana",
    codigoPostal: "8240000",
    telefono: "+56 9 8336 5087",
    whatsapp: "56983365087",
    referenciaMetro: "",
    horario: [
      { dias: "Lunes a sábado", horas: "10:00 - 20:00" },
      { dias: "Domingo", horas: "11:00 - 15:00" },
    ],
    rating: 5.0,
    numeroResenas: 139,
    numeroBarberos: 0,
    descripcionCorta:
      "Nuestro local de Vicuña Mackenna Poniente: atención profesional y ambiente cómodo para tu corte o afeitado.",
    imagenPortada: "https://picsum.photos/seed/barberia-vicuna-mackenna-cover/1600/1000",
    imagenPortadaAlt: "Interior del local Vicuña Mackenna de Better Barber Club",
    galeria: [
      {
        src: "https://picsum.photos/seed/barberia-vicuna-mackenna-1/900/700",
        alt: "Barbero atendiendo a un cliente en el local Vicuña Mackenna",
      },
      {
        src: "https://picsum.photos/seed/barberia-vicuna-mackenna-2/900/700",
        alt: "Estación de trabajo con herramientas de barbería",
      },
    ],
    geo: { lat: -33.519238, lng: -70.603599 },
    fechaApertura: "2026-08-29",
    urlReserva: "https://wa.me/56983365087",
    googlePlaceId: "",
  },
  {
    slug: "macul",
    nombre: `${siteConfig.nombreCorto} Macul`,
    comuna: "Macul",
    direccion: "Avenida Macul 3735",
    ciudad: "Santiago",
    region: "Región Metropolitana",
    codigoPostal: "7830110",
    telefono: "+56 9 2230 2293",
    whatsapp: "56922302293",
    referenciaMetro: "",
    horario: [
      { dias: "Lunes a sábado", horas: "10:00 - 21:30" },
      { dias: "Domingo", horas: "10:00 - 20:00" },
    ],
    rating: 4.9,
    numeroResenas: 75,
    numeroBarberos: 0,
    descripcionCorta: "Nuestro local en Avenida Macul, con el horario más extendido de la casa.",
    imagenPortada: "https://picsum.photos/seed/barberia-macul-cover/1600/1000",
    imagenPortadaAlt: "Interior del local Macul de Better Barber Club",
    galeria: [
      {
        src: "https://picsum.photos/seed/barberia-macul-1/900/700",
        alt: "Barbero atendiendo a un cliente en el local Macul",
      },
      {
        src: "https://picsum.photos/seed/barberia-macul-2/900/700",
        alt: "Estación de trabajo con herramientas de barbería",
      },
    ],
    geo: { lat: -33.488222, lng: -70.599841 },
    fechaApertura: "2026-08-29",
    urlReserva: "https://wa.me/56922302293",
    googlePlaceId: "",
  },
  {
    slug: "walker-martinez",
    nombre: `${siteConfig.nombreCorto} Walker Martínez`,
    comuna: "La Florida",
    direccion: "Walker Martínez 1925",
    ciudad: "Santiago",
    region: "Región Metropolitana",
    codigoPostal: "8270979",
    telefono: "+56 9 4071 3421",
    whatsapp: "56940713421",
    referenciaMetro: "",
    horario: [
      { dias: "Lunes a viernes", horas: "09:00 - 19:00" },
      { dias: "Sábado", horas: "Cerrado" },
      { dias: "Domingo", horas: "Cerrado" },
    ],
    rating: 4.9,
    numeroResenas: 128,
    numeroBarberos: 0,
    descripcionCorta: "Nuestro local en Walker Martínez, ideal para reservar tu hora entre semana.",
    imagenPortada: "https://picsum.photos/seed/barberia-walker-cover/1600/1000",
    imagenPortadaAlt: "Interior del local Walker Martínez de Better Barber Club",
    galeria: [
      {
        src: "https://picsum.photos/seed/barberia-walker-1/900/700",
        alt: "Barbero atendiendo a un cliente en el local Walker Martínez",
      },
      {
        src: "https://picsum.photos/seed/barberia-walker-2/900/700",
        alt: "Estación de trabajo con herramientas de barbería",
      },
    ],
    geo: { lat: -33.522717, lng: -70.576529 },
    fechaApertura: "2026-08-29",
    urlReserva: "https://wa.me/56940713421",
    googlePlaceId: "",
  },
];

export function getSucursalPorSlug(slug: string): Sucursal | undefined {
  return sucursales.find((s) => s.slug === slug);
}
