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
  if (cantidad === 0) return "Nuestras casas, un mismo estándar";
  if (cantidad === 1) return "Una casa, un mismo estándar";
  const palabra = NUMEROS_TEXTO[cantidad] ?? String(cantidad);
  const capitalizada = palabra.charAt(0).toUpperCase() + palabra.slice(1);
  return `${capitalizada} casas, un mismo estándar`;
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
        <h2 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
          {tituloSucursales(sucursalesView.length)}
        </h2>
        <p className="mt-4 text-lg text-neutral-400">
          Elige la sucursal más cercana a ti. Todas comparten el mismo protocolo de servicio y
          equipo de barberos certificados.
        </p>
      </div>

      <SucursalesGrid sucursales={sucursalesView} />
    </section>
  );
}
