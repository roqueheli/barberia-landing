import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import { sucursales } from "@/data/sucursales";
import { getOrganizationContent } from "@/lib/klipper/organization";
import { liveServicios } from "@/lib/organization-content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;

  const home: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const sucursalUrls: MetadataRoute.Sitemap = sucursales.map((s) => ({
    url: `${base}/sucursales/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Servicios SOLO desde Klipper (mismo esquema de slug que las cards y la
  // página de detalle). Si Klipper no responde, no se emiten URLs de
  // servicio en vez de apuntar a slugs curados que ya no existen.
  const content = await getOrganizationContent();
  const servicioUrls: MetadataRoute.Sitemap = liveServicios(content?.services ?? null).map((s) => ({
    url: `${base}/servicios/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...home, ...sucursalUrls, ...servicioUrls];
}
