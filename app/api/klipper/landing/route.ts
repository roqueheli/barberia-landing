import { NextResponse } from "next/server";
import { getLanding } from "@/lib/klipper/client";
import { mapLandingToBookingLanding } from "@/lib/klipper/mappers";
import { KlipperApiError, KlipperNotFoundError } from "@/lib/klipper/errors";
import { getSanitySucursales } from "@/lib/sanity/sucursales";
import type { ExternalBookingBranch } from "@/types/klipper";

// Proxy de organizations/landing_by_slug. Importante: esa respuesta trae un
// UserSerializer completo si incluye `users`; acá se mapea a BookingLanding
// (sin usuarios) antes de devolver nada al navegador — la data de
// profesionales sale siempre por /api/klipper/availability, ya filtrada.
export async function GET() {
  const slug = process.env.KLIPPER_ORG_SLUG;
  if (!slug) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  try {
    const landing = await getLanding(slug);
    // Sucursales creadas 100% en Sanity (sin sucursal real en Klipper
    // detrás): se listan junto a las reales en el paso "branch" del
    // wizard, elegirlas abre agendaUrl en vez de continuar la reserva.
    const externalBranches: ExternalBookingBranch[] = (await getSanitySucursales())
      .filter((s) => s.agendaUrl)
      .map((s) => ({ nombre: s.nombre, agendaUrl: s.agendaUrl as string }));
    return NextResponse.json({ ...mapLandingToBookingLanding(landing), externalBranches });
  } catch (err) {
    if (err instanceof KlipperNotFoundError) {
      return NextResponse.json({ error: "organization_not_found" }, { status: 404 });
    }
    // No loguear el payload crudo de landing_by_slug (puede traer datos
    // sensibles de usuarios); solo el mensaje de error.
    const message = err instanceof KlipperApiError ? err.message : "unknown error";
    console.error("[klipper/landing]", message);
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }
}
