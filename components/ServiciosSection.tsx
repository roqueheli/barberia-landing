import ServiciosPaginados from "@/components/ServiciosPaginados";
import { getOrganizationContent } from "@/lib/klipper/organization";
import { liveServicios } from "@/lib/organization-content";
import { getSiteContent } from "@/lib/sanity/site-content";

const DEFAULT_SERVICIOS_EYEBROW = "Servicios y precios";
const DEFAULT_SERVICIOS_TITLE = "Elige tu servicio";
const DEFAULT_SERVICIOS_DESCRIPTION =
  "Precios transparentes, sin letra chica. Haz clic en cualquier servicio para ver el detalle completo.";
const DEFAULT_SERVICIOS_CTA = "Ver la carta completa";

export default async function ServiciosSection() {
  const content = await getOrganizationContent();
  const serviciosView = liveServicios(content?.services ?? null);
  const siteContent = await getSiteContent();
  const serviciosEyebrow = siteContent?.serviciosEyebrow || DEFAULT_SERVICIOS_EYEBROW;
  const serviciosTitle = siteContent?.serviciosTitle || DEFAULT_SERVICIOS_TITLE;
  const serviciosDescription = siteContent?.serviciosDescription || DEFAULT_SERVICIOS_DESCRIPTION;
  const serviciosCta = siteContent?.serviciosCta || DEFAULT_SERVICIOS_CTA;

  return (
    <section
      id="servicios"
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
    >
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          {serviciosEyebrow}
        </p>
        <h2 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
          {serviciosTitle}
        </h2>
        <p className="mt-4 text-lg text-neutral-400">{serviciosDescription}</p>
      </div>

      <ServiciosPaginados
        servicios={serviciosView}
        businessTypes={content?.businessTypes ?? []}
        porPagina={9}
      />

      {serviciosView.length === 0 && (
        <p className="mt-12 text-center text-neutral-400">
          Estamos actualizando nuestra carta de servicios. Vuelve pronto.
        </p>
      )}

      <div className="mt-12 text-center">
        <a
          href="#contacto"
          data-analytics-event="ver_carta_completa_click"
          data-analytics-source="servicios-section"
          className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          {serviciosCta}
        </a>
      </div>
    </section>
  );
}
