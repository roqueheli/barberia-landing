import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import SucursalesSection from "@/components/SucursalesSection";
import AboutSection from "@/components/AboutSection";
import ServiciosSection from "@/components/ServiciosSection";
import ProcesoSection from "@/components/ProcesoSection";
import EquipoSection from "@/components/EquipoSection";
import ResenasSection from "@/components/ResenasSection";
import PromoBanner from "@/components/PromoBanner";
import CTAFinal from "@/components/CTAFinal";
import JsonLd from "@/components/JsonLd";
import OffersPopupLoader from "@/components/offers/OffersPopupLoader";
import { buildOrganizationJsonLd, buildSucursalJsonLd } from "@/lib/jsonld";
import { sucursales } from "@/data/sucursales";
import { siteConfig } from "@/data/site";
import { getOrganizationContent } from "@/lib/klipper/organization";
import { mergeSucursales } from "@/lib/organization-content";
import { getBranding } from "@/lib/branding";

// Secciones no críticas para el primer render (debajo del pliegue, con
// contenido pesado en imágenes o interactividad): se cargan diferidas para
// no bloquear el LCP del hero.
const GaleriaSection = dynamic(() => import("@/components/GaleriaSection"));
const FAQSection = dynamic(() => import("@/components/FAQSection"));

// Contenido de sucursales/servicios/equipo depende de datos en vivo de
// Klipper (ver lib/klipper/organization.ts, cacheados 300s) — se declara
// acá para que el intent de revalidación quede explícito a nivel de ruta.
export const revalidate = 300;

export default async function Home() {
  const content = await getOrganizationContent();
  const sucursalesView = mergeSucursales(content?.branches ?? null, sucursales);
  const { logo, instagramUrl } = await getBranding();
  const organizationName = content?.organization.name ?? siteConfig.nombre;

  return (
    <>
      <OffersPopupLoader
        organizationName={organizationName}
        organizationLogo={logo.url ?? undefined}
      />
      <JsonLd data={buildOrganizationJsonLd({ logoUrl: logo.url, instagramUrl })} />
      {sucursalesView.map((sucursal) => (
        <JsonLd key={sucursal.slug} data={buildSucursalJsonLd(sucursal)} />
      ))}

      <main id="main-content" className="flex-1">
        <Hero />
        <SucursalesSection />
        <AboutSection />
        <ServiciosSection />
        <ProcesoSection />
        <EquipoSection />
        <ResenasSection />
        <PromoBanner />
        <GaleriaSection />
        <FAQSection />
        <CTAFinal />
      </main>
    </>
  );
}
