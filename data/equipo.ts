import type { Barbero } from "@/types";
import { siteConfig } from "@/data/site";

// Equipo curado de respaldo. El equipo real se muestra en vivo desde Klipper
// cuando hay match por nombre (ver lib/organization-content.ts:mergeEquipo);
// esta lista aporta rol/especialidades/foto de marketing como fallback.
export const equipo: Barbero[] = [
  {
    slug: "genesis-silva",
    nombre: "Génesis Silva",
    rol: "Fundadora y estilista",
    sucursalPrincipal: "estudio",
    especialidades: ["Coloración", "Corte de dama", "Asesoría de imagen"],
    anosExperiencia: 12,
    foto: "https://picsum.photos/seed/estudio-equipo-genesis/600/700",
    fotoAlt: `Retrato de Génesis Silva, fundadora y estilista de ${siteConfig.nombreCorto}`,
    instagram: siteConfig.instagram,
  },
  {
    slug: "manicurista",
    nombre: "Manicurista",
    rol: "Especialista en uñas",
    sucursalPrincipal: "estudio",
    especialidades: ["Manicure", "Pedicure", "Uñas permanentes"],
    anosExperiencia: 7,
    foto: "https://picsum.photos/seed/estudio-equipo-unas/600/700",
    fotoAlt: `Retrato de la especialista en uñas de ${siteConfig.nombreCorto}`,
  },
  {
    slug: "esteticista",
    nombre: "Esteticista",
    rol: "Especialista en tratamientos faciales",
    sucursalPrincipal: "estudio",
    especialidades: ["Spa facial", "Limpieza facial", "Cuidado de la piel"],
    anosExperiencia: 8,
    foto: "https://picsum.photos/seed/estudio-equipo-facial/600/700",
    fotoAlt: `Retrato de la esteticista de ${siteConfig.nombreCorto}`,
  },
];

export function getBarberoPorSlug(slug: string): Barbero | undefined {
  return equipo.find((b) => b.slug === slug);
}
