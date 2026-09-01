import { promo } from "@/data/site";
import { sucursales } from "@/data/sucursales";
import ReservarButton from "@/components/ReservarButton";
import { getSucursalView } from "@/lib/organization-content";
import { getSiteContent } from "@/lib/sanity/site-content";

export default async function PromoBanner() {
  const sucursal = await getSucursalView(promo.sucursalSlug, sucursales);
  const siteContent = await getSiteContent();
  const promoTitulo = siteContent?.promoTitulo || promo.titulo;
  const promoDescripcion = siteContent?.promoDescripcion || promo.descripcion;
  const promoDescuento = siteContent?.promoDescuento || promo.descuento;
  const promoCondiciones = siteContent?.promoCondiciones || promo.condiciones;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/15 via-background-elevated to-background-elevated p-8 sm:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl"
        />
        <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-accent px-4 py-1 text-xs font-bold uppercase tracking-wide text-accent-foreground">
              {promoDescuento}
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
              {promoTitulo}
            </h2>
            <p className="mt-3 text-neutral-300">{promoDescripcion}</p>
            <p className="mt-2 text-xs text-neutral-500">{promoCondiciones}</p>
          </div>

          <ReservarButton
            sucursalSlug={promo.sucursalSlug}
            analyticsSource="promo-banner"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-accent px-7 py-4 text-sm font-semibold text-accent-foreground transition hover:bg-accent-strong"
          >
            Reservar en {sucursal?.nombre ?? "esta sucursal"}
          </ReservarButton>
        </div>
      </div>
    </section>
  );
}
