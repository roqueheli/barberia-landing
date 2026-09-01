import type { Resena } from "@/types";
import { siteConfig } from "@/data/site";

// Reseñas curadas de respaldo. Si hay GOOGLE_PLACES_API_KEY y Place IDs, se
// muestran las reales de Google (ver lib/google/reviews.ts); estas son el
// fallback cuando no hay reseñas en vivo.
export const resenas: Resena[] = [
  {
    id: "resena-1",
    nombreCliente: "Camila R.",
    servicioConsumido: "Coloración",
    sucursal: siteConfig.nombreCorto,
    rating: 5,
    texto:
      "Amé cómo quedó mi color, justo lo que buscaba. Me asesoraron con paciencia y el ambiente es súper acogedor. Salí feliz y renovada.",
    fecha: "2026-06-12",
    foto: "https://picsum.photos/seed/estudio-resena-camila/200/200",
    fotoAlt: `Foto de perfil de Camila R., clienta de ${siteConfig.nombreCorto}`,
  },
  {
    id: "resena-2",
    nombreCliente: "Valentina A.",
    servicioConsumido: "Manicure",
    sucursal: siteConfig.nombreCorto,
    rating: 5,
    texto:
      "Siempre me atienden a la hora exacta que reservé, cero espera. El trabajo en las uñas es impecable y me dura muchísimo. Mi lugar favorito.",
    fecha: "2026-05-28",
    foto: "https://picsum.photos/seed/estudio-resena-valentina/200/200",
    fotoAlt: `Foto de perfil de Valentina A., clienta de ${siteConfig.nombreCorto}`,
  },
  {
    id: "resena-3",
    nombreCliente: "Francisca P.",
    servicioConsumido: "Spa facial",
    sucursal: siteConfig.nombreCorto,
    rating: 5,
    texto:
      "El spa facial fue una experiencia increíble, salí con la piel radiante. Se nota el cuidado y la dedicación en cada detalle. Totalmente recomendado.",
    fecha: "2026-07-03",
    foto: "https://picsum.photos/seed/estudio-resena-francisca/200/200",
    fotoAlt: `Foto de perfil de Francisca P., clienta de ${siteConfig.nombreCorto}`,
  },
];
