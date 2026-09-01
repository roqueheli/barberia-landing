import type { Barbero } from "@/types";
import { siteConfig } from "@/data/site";

export const equipo: Barbero[] = [
  {
    slug: "matias-rojas",
    nombre: "Matías Rojas",
    rol: "Fundador y Master Barber",
    sucursalPrincipal: "providencia",
    especialidades: ["Afeitado clásico", "Diseño de barba", "Cortes ejecutivos"],
    anosExperiencia: 14,
    foto: "https://picsum.photos/seed/barberia-equipo-matias/600/700",
    fotoAlt: `Retrato de Matías Rojas, fundador y master barber de ${siteConfig.nombreCorto}`,
    instagram: siteConfig.instagram,
  },
  {
    slug: "javiera-soto",
    nombre: "Javiera Soto",
    rol: "Barbera senior",
    sucursalPrincipal: "providencia",
    especialidades: ["Degradados", "Color y canas", "Texturizado"],
    anosExperiencia: 8,
    foto: "https://picsum.photos/seed/barberia-equipo-javiera/600/700",
    fotoAlt: `Retrato de Javiera Soto, barbera senior de ${siteConfig.nombreCorto}`,
    instagram: siteConfig.instagram,
  },
  {
    slug: "benjamin-diaz",
    nombre: "Benjamín Díaz",
    rol: "Barbero senior",
    sucursalPrincipal: "las-condes",
    especialidades: ["Cortes clásicos", "Afeitado a navaja", "Bigote"],
    anosExperiencia: 10,
    foto: "https://picsum.photos/seed/barberia-equipo-benjamin/600/700",
    fotoAlt: `Retrato de Benjamín Díaz, barbero senior de ${siteConfig.nombreCorto}`,
  },
  {
    slug: "camila-fuentes",
    nombre: "Camila Fuentes",
    rol: "Barbera y colorista",
    sucursalPrincipal: "las-condes",
    especialidades: ["Coloración", "Tratamientos capilares", "Styling"],
    anosExperiencia: 6,
    foto: "https://picsum.photos/seed/barberia-equipo-camila/600/700",
    fotoAlt: `Retrato de Camila Fuentes, barbera y colorista de ${siteConfig.nombreCorto}`,
  },
  {
    slug: "ignacio-perez",
    nombre: "Ignacio Pérez",
    rol: "Barbero",
    sucursalPrincipal: "vicuna-mackenna",
    especialidades: ["Cortes juveniles", "Diseños", "Fade"],
    anosExperiencia: 5,
    foto: "https://picsum.photos/seed/barberia-equipo-ignacio/600/700",
    fotoAlt: `Retrato de Ignacio Pérez, barbero de ${siteConfig.nombreCorto}`,
  },
  {
    slug: "florencia-castro",
    nombre: "Florencia Castro",
    rol: "Barbera y encargada spa facial",
    sucursalPrincipal: "providencia",
    especialidades: ["Spa facial", "Perfilado de barba", "Cuidado de la piel"],
    anosExperiencia: 7,
    foto: "https://picsum.photos/seed/barberia-equipo-florencia/600/700",
    fotoAlt: `Retrato de Florencia Castro, barbera y encargada del spa facial de ${siteConfig.nombreCorto}`,
  },
];

export function getBarberoPorSlug(slug: string): Barbero | undefined {
  return equipo.find((b) => b.slug === slug);
}
