import type { SucursalView } from "@/lib/organization-content";
import { siteConfig } from "@/data/site";

const diaMap: Record<string, string[]> = {
  "Lunes a viernes": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "Sábado": ["Saturday"],
  "Domingo": ["Sunday"],
};

// sucursal puede venir de una fusión con Klipper: los campos de marketing
// (imagen, rating, dirección postal, horario) son opcionales cuando Klipper
// trae una sucursal real sin curación local todavía — se omiten del JSON-LD
// en vez de inventarlos.
export function buildSucursalJsonLd(sucursal: SucursalView) {
  const openingHours = sucursal.horario
    .filter((h) => h.horas.toLowerCase() !== "cerrado")
    .flatMap((h) => {
      const dias = diaMap[h.dias] ?? [];
      const [opens, closes] = h.horas.split(" - ").map((s) => s.trim());
      return dias.map((dia) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${dia}`,
        opens,
        closes,
      }));
    });

  return {
    "@context": "https://schema.org",
    "@type": "BarberShop",
    name: sucursal.nombre,
    ...(sucursal.imagenPortada ? { image: sucursal.imagenPortada } : {}),
    url: `${siteConfig.url}/sucursales/${sucursal.slug}`,
    telephone: sucursal.telefono,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: sucursal.direccion,
      addressLocality: sucursal.comuna,
      addressRegion: sucursal.region,
      postalCode: sucursal.codigoPostal,
      addressCountry: "CL",
    },
    ...(sucursal.geo
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: sucursal.geo.lat,
            longitude: sucursal.geo.lng,
          },
        }
      : {}),
    ...(sucursal.rating != null && sucursal.numeroResenas != null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: sucursal.rating,
            reviewCount: sucursal.numeroResenas,
          },
        }
      : {}),
    openingHoursSpecification: openingHours,
    parentOrganization: {
      "@type": "Organization",
      name: siteConfig.nombre,
      url: siteConfig.url,
    },
  };
}

// logoUrl/instagramUrl opcionales: cuando el caller ya resolvió
// lib/branding.ts:getBranding() (logo/Instagram real, con la misma
// prioridad Sanity > Klipper en vivo > curado que usan Header/Footer), se
// pasan acá para que el JSON-LD no quede desincronizado de lo que el sitio
// realmente muestra. Sin eso, cae al favicon/Instagram curados de siempre.
export function buildOrganizationJsonLd(params?: { logoUrl?: string | null; instagramUrl?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.nombre,
    url: siteConfig.url,
    logo: params?.logoUrl ?? `${siteConfig.url}/favicon.ico`,
    sameAs: [params?.instagramUrl ?? siteConfig.instagram, siteConfig.facebook, siteConfig.tiktok],
  };
}
