import type { Sucursal } from "@/types";
import { siteConfig } from "@/data/site";

/**
 * Sucursal curada de respaldo. nombre/dirección/teléfono/geo/horario se
 * sobreescriben en vivo desde Klipper cuando hay match por nombre (ver
 * lib/organization-content.ts) — esta lista solo aporta el copy de marketing
 * que Klipper no entrega (galería, descripción). El slug debe coincidir con
 * el usado en servicios/equipo para el cruce interno.
 *
 * imagenPortada/galeria usan fotos de stock (picsum) como placeholder.
 * Reemplaza por fotos reales del estudio en cuanto las tengas, o cárgalas en
 * Klipper (photo_url) para que se muestren en vivo.
 */
export const sucursales: Sucursal[] = [
  {
    slug: "estudio",
    nombre: `${siteConfig.nombreCorto}`,
    comuna: "Santiago",
    direccion: "",
    ciudad: "Santiago",
    region: "Región Metropolitana",
    codigoPostal: "",
    telefono: siteConfig.telefonoGeneral,
    whatsapp: siteConfig.whatsappGeneral,
    referenciaMetro: "",
    horario: [
      { dias: "Lunes a viernes", horas: "09:00 - 21:00" },
      { dias: "Sábado", horas: "09:00 - 19:00" },
      { dias: "Domingo", horas: "Cerrado" },
    ],
    rating: 4.9,
    numeroResenas: 0,
    numeroBarberos: 0,
    descripcionCorta:
      "Nuestro estudio de belleza: atención personalizada y un ambiente cálido para tu cuidado y bienestar.",
    imagenPortada: "https://picsum.photos/seed/estudio-belleza-cover/1600/1000",
    imagenPortadaAlt: `Interior del ${siteConfig.nombreCorto}`,
    galeria: [
      {
        src: "https://picsum.photos/seed/estudio-belleza-1/900/700",
        alt: "Estación de trabajo del estudio de belleza",
      },
      {
        src: "https://picsum.photos/seed/estudio-belleza-2/900/700",
        alt: "Ambiente cálido del estudio de belleza",
      },
    ],
    geo: { lat: -33.4489, lng: -70.6693 },
    fechaApertura: "2019-01-01",
    urlReserva: `https://wa.me/${siteConfig.whatsappGeneral}`,
    googlePlaceId: "",
  },
];

export function getSucursalPorSlug(slug: string): Sucursal | undefined {
  return sucursales.find((s) => s.slug === slug);
}
