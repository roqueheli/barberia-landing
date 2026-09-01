import { sucursales } from "@/data/sucursales";
import SucursalesGrid from "@/components/SucursalesGrid";
import { getOrganizationContent } from "@/lib/klipper/organization";
import { mergeSucursales } from "@/lib/organization-content";
import { getSiteContent } from "@/lib/sanity/site-content";

const DEFAULT_SUCURSALES_EYEBROW = "Sucursales";

const NUMEROS_TEXTO = [
  "cero",
  "una",
  "dos",
  "tres",
  "cuatro",
  "cinco",
  "seis",
  "siete",
  "ocho",
  "nueve",
  "diez",
];

// "Tres casas, un mismo estándar" con el número real de sucursales que
// terminan mostrándose (curadas o en vivo) — nunca un conteo fijo.
function tituloSucursales(cantidad: number): string {
  if (cantidad === 0) return "Siempre el mismo estándar";
  if (cantidad === 1) return "Una sucursal, un solo estándar";
  const palabra = NUMEROS_TEXTO[cantidad] ?? String(cantidad);
  const capitalizada = palabra.charAt(0).toUpperCase() + palabra.slice(1);
  return `${capitalizada} sucursales, un mismo estándar`;
}

export default async function SucursalesSection() {
  const content = await getOrganizationContent();
  const sucursalesView = mergeSucursales(content?.branches ?? null, sucursales);
  const siteContent = await getSiteContent();
  const sucursalesEyebrow = siteContent?.sucursalesEyebrow || DEFAULT_SUCURSALES_EYEBROW;

  return (
    <section id="sucursales" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">{sucursalesEyebrow}</p>
        <h2 className="mt-3 whitespace-nowrap font-display text-3xl font-bold text-white sm:text-5xl">
          {tituloSucursales(sucursalesView.length)}
        </h2>
        <p className="mt-4 text-lg text-neutral-400">
          Visítanos en nuestro estudio. El mismo estándar de servicio y un equipo de
          especialistas dedicadas a tu cuidado.
        </p>
      </div>

      <SucursalesGrid sucursales={sucursalesView} />
    </section>
  );
}
