import ReservarButton from "@/components/ReservarButton";
import type { SucursalView } from "@/lib/organization-content";

interface SucursalReservarCtaProps {
  sucursal: SucursalView;
  analyticsSource: string;
  className?: string;
  children?: React.ReactNode;
}

// Si la sucursal trae agendaUrl (creada 100% en Sanity, sin sucursal real
// en Klipper detrás — ver lib/sanity/sucursales.ts), el botón de reserva
// abre ese link externo (ej. Agenda Pro) en vez del wizard interno.
export default function SucursalReservarCta({
  sucursal,
  analyticsSource,
  className,
  children = "Reservar",
}: SucursalReservarCtaProps) {
  if (sucursal.agendaUrl) {
    return (
      <a
        href={sucursal.agendaUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-analytics-event="reservar_click"
        data-analytics-source={analyticsSource}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <ReservarButton sucursalSlug={sucursal.slug} analyticsSource={analyticsSource} className={className}>
      {children}
    </ReservarButton>
  );
}
