// Marca del sitio (logo + Instagram) — combina Sanity (editorial) y lo que
// Klipper ya trae en vivo (metadata.media_configs), con el mismo orden de
// prioridad confirmado con el usuario para el logo, aplicado también al
// handle de Instagram: Sanity manda si está cargado, si no cae a lo en
// vivo de Klipper, si tampoco hay eso cae al valor curado de
// data/site.ts — nunca null sin fallback.
import "server-only";
import { cache } from "react";
import { siteConfig } from "@/data/site";
import { getSiteContent } from "@/lib/sanity/site-content";
import { getOrganizationContent } from "@/lib/klipper/organization";

export interface Logo {
  url: string | null;
  alt: string | null;
  /** true si `url` viene del logo_url en vivo de Klipper (dominio no
   * confirmado — renderizar con <img>, no next/image, mismo criterio que
   * EquipoSection/SucursalCard para fotos en vivo de Klipper). */
  enVivo: boolean;
}

export interface Branding {
  logo: Logo;
  /** URL completa de Instagram, siempre resuelta (nunca null) — cae a
   * siteConfig.instagram si ni Sanity ni Klipper traen un handle. */
  instagramUrl: string;
}

export const getBranding = cache(async (): Promise<Branding> => {
  const [siteContent, orgContent] = await Promise.all([
    getSiteContent(),
    getOrganizationContent(),
  ]);

  const logo: Logo = siteContent?.logoImage
    ? { url: siteContent.logoImage, alt: siteContent.logoImageAlt, enVivo: false }
    : orgContent?.organizationLogoUrl
      ? { url: orgContent.organizationLogoUrl, alt: null, enVivo: true }
      : { url: null, alt: null, enVivo: false };

  const instagramHandle =
    siteContent?.instagramHandle || orgContent?.organizationInstagramHandle || null;
  const instagramUrl = instagramHandle
    ? `https://instagram.com/${instagramHandle.replace(/^@/, "")}`
    : siteConfig.instagram;

  return { logo, instagramUrl };
});
