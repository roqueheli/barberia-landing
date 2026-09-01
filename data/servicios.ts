import type { Servicio } from "@/types";

// Servicios curados de respaldo. Los servicios reales se muestran en vivo
// desde Klipper (ver components/ServiciosSection.tsx / lib/organization-content.ts);
// esta lista solo aporta copy/imágenes de marketing cuando hay match por
// nombre. Categorías reutilizan el enum existente (corte/color/spa) de forma
// semántica para un estudio de belleza.
export const servicios: Servicio[] = [
  {
    slug: "manicure",
    nombre: "Manicure",
    categoria: "spa",
    descripcionCorta: "Cuidado y esmaltado de uñas de manos con acabado profesional.",
    descripcionLarga:
      "Limado y forma a elección, cuidado de cutículas, hidratación de manos y esmaltado tradicional o permanente. Un acabado prolijo y duradero, con asesoría de color.",
    precioDesde: 12000,
    moneda: "CLP",
    duracionMinutos: 45,
    imagen: "https://picsum.photos/seed/estudio-manicure/900/700",
    imagenAlt: "Manicure profesional con esmaltado permanente",
    incluye: [
      "Limado y forma a elección",
      "Cuidado de cutículas",
      "Hidratación de manos",
      "Esmaltado tradicional o permanente",
    ],
    sucursalesDisponibles: ["estudio"],
  },
  {
    slug: "pedicure",
    nombre: "Pedicure",
    categoria: "spa",
    descripcionCorta: "Cuidado completo de pies con exfoliación y esmaltado.",
    descripcionLarga:
      "Baño relajante, exfoliación, cuidado de cutículas y talones, hidratación y esmaltado a elección. Ideal para lucir pies suaves y prolijos.",
    precioDesde: 15000,
    moneda: "CLP",
    duracionMinutos: 50,
    imagen: "https://picsum.photos/seed/estudio-pedicure/900/700",
    imagenAlt: "Pedicure con baño relajante y esmaltado",
    incluye: [
      "Baño relajante de pies",
      "Exfoliación",
      "Cuidado de cutículas y talones",
      "Esmaltado a elección",
    ],
    sucursalesDisponibles: ["estudio"],
  },
  {
    slug: "coloracion",
    nombre: "Coloración",
    categoria: "color",
    descripcionCorta: "Color profesional personalizado para tu cabello.",
    descripcionLarga:
      "Asesoría de color según tu tono y estilo, aplicación de coloración profesional, lavado y cuidado post-color. Resultados parejos y con brillo.",
    precioDesde: 30000,
    moneda: "CLP",
    duracionMinutos: 90,
    imagen: "https://picsum.photos/seed/estudio-coloracion/900/700",
    imagenAlt: "Aplicación de coloración profesional en cabello",
    incluye: [
      "Asesoría de color personalizada",
      "Aplicación profesional",
      "Lavado y acondicionado",
      "Cuidado post-color",
    ],
    sucursalesDisponibles: ["estudio"],
  },
  {
    slug: "tratamiento-capilar",
    nombre: "Tratamiento capilar",
    categoria: "color",
    descripcionCorta: "Nutrición e hidratación profunda para el cabello.",
    descripcionLarga:
      "Diagnóstico capilar, aplicación de tratamiento nutritivo o reparador según tu tipo de cabello, masaje y sellado. Devuelve suavidad, brillo y manejabilidad.",
    precioDesde: 18000,
    moneda: "CLP",
    duracionMinutos: 45,
    imagen: "https://picsum.photos/seed/estudio-tratamiento-capilar/900/700",
    imagenAlt: "Tratamiento capilar nutritivo con masaje",
    incluye: [
      "Diagnóstico capilar",
      "Tratamiento nutritivo o reparador",
      "Masaje de cuero cabelludo",
      "Sellado y peinado",
    ],
    sucursalesDisponibles: ["estudio"],
  },
  {
    slug: "corte-peinado",
    nombre: "Corte y peinado",
    categoria: "corte",
    descripcionCorta: "Corte a tu medida, lavado y peinado con acabado profesional.",
    descripcionLarga:
      "Asesoría de estilo según tu rostro y preferencias, corte a tijera, lavado con productos profesionales y peinado o brushing final para un look impecable.",
    precioDesde: 16000,
    moneda: "CLP",
    duracionMinutos: 50,
    imagen: "https://picsum.photos/seed/estudio-corte-peinado/900/700",
    imagenAlt: "Corte y peinado de dama con acabado profesional",
    incluye: [
      "Asesoría de estilo",
      "Corte a tijera",
      "Lavado profesional",
      "Peinado o brushing final",
    ],
    sucursalesDisponibles: ["estudio"],
  },
  {
    slug: "spa-facial",
    nombre: "Spa facial",
    categoria: "spa",
    descripcionCorta: "Limpieza facial profunda, exfoliación y mascarilla.",
    descripcionLarga:
      "Limpieza facial profunda con vapor, exfoliación, extracción suave de impurezas y mascarilla según tu tipo de piel. Sales con la piel renovada y luminosa.",
    precioDesde: 20000,
    moneda: "CLP",
    duracionMinutos: 45,
    imagen: "https://picsum.photos/seed/estudio-spa-facial/900/700",
    imagenAlt: "Spa facial con mascarilla en camilla",
    incluye: [
      "Limpieza facial con vapor",
      "Exfoliación",
      "Extracción suave de impurezas",
      "Mascarilla según tipo de piel",
    ],
    sucursalesDisponibles: ["estudio"],
  },
];

export function getServicioPorSlug(slug: string): Servicio | undefined {
  return servicios.find((s) => s.slug === slug);
}
