import type { Resena } from "@/types";
import { siteConfig } from "@/data/site";

export const resenas: Resena[] = [
  {
    id: "resena-1",
    nombreCliente: "Rodrigo M.",
    servicioConsumido: "Afeitado clásico a navaja",
    sucursal: `${siteConfig.nombreCorto} Vicuña Mackenna`,
    rating: 5,
    texto:
      "Entré sin saber qué esperar y salí sintiéndome otra persona. El ritual de las toallas calientes y el masaje final es otro nivel, se nota que lo tienen absolutamente cronometrado.",
    fecha: "2026-06-12",
    foto: "https://picsum.photos/seed/barberia-resena-rodrigo/200/200",
    fotoAlt: `Foto de perfil de Rodrigo M., cliente de ${siteConfig.nombreCorto} Vicuña Mackenna`,
  },
  {
    id: "resena-2",
    nombreCliente: "Felipe A.",
    servicioConsumido: "Combo corte + barba",
    sucursal: `${siteConfig.nombreCorto} Macul`,
    rating: 5,
    texto:
      "Voy cada tres semanas y siempre me atienden a la hora exacta que reservé. Eso para mí vale más que cualquier otra cosa: cero espera, cero apuro.",
    fecha: "2026-05-28",
    foto: "https://picsum.photos/seed/barberia-resena-felipe/200/200",
    fotoAlt: `Foto de perfil de Felipe A., cliente de ${siteConfig.nombreCorto} Macul`,
  },
  {
    id: "resena-3",
    nombreCliente: "Diego P.",
    servicioConsumido: "Corte clásico",
    sucursal: `${siteConfig.nombreCorto} Walker Martínez`,
    rating: 5,
    texto:
      "Llevé a mi hijo de 6 años y lo trataron increíble, tienen hasta un rincón para que espere entretenido. El corte le quedó perfecto y el precio muy justo.",
    fecha: "2026-07-03",
    foto: "https://picsum.photos/seed/barberia-resena-diego/200/200",
    fotoAlt: `Foto de perfil de Diego P., cliente de ${siteConfig.nombreCorto} Walker Martínez`,
  },
];
