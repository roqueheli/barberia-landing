import { NextResponse } from "next/server";
import { getBaseUrl, getOrgSlug, parseJsonLenient } from "@/lib/booking-proxy";

// Proxy same-origin de GET /api/v1/organizations/landing_by_slug/:slug para
// el flujo de components/booking/* — ver lib/booking-proxy.ts para el
// porqué (CORS bloqueado en el dominio real de Klipper). A diferencia de
// /api/klipper/landing (lib/klipper/client.ts), acá se reenvía la
// respuesta tal cual: este endpoint es explícitamente público/sin auth y
// components/booking/* ya está diseñado para consumir su shape completo
// (weekly_schedule, business_types, products) sin un mapeo de seguridad.
export async function GET() {
  let base: string;
  let slug: string;
  try {
    base = getBaseUrl();
    slug = getOrgSlug();
  } catch {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const res = await fetch(`${base}/api/v1/organizations/landing_by_slug/${encodeURIComponent(slug)}`);
  const data = await parseJsonLenient(res);
  if (data === undefined) {
    console.error("[booking/landing] respuesta no parseable como JSON, status", res.status);
    return NextResponse.json(
      { error: "No pudimos cargar la información de la sucursal. Intenta de nuevo." },
      { status: 502 }
    );
  }
  // Passthrough fiel del status/body reales (incluye shapes de error propios
  // de Klipper, ej. {error:"..."}) — el cliente ya sabe leerlos.
  return NextResponse.json(data, { status: res.status });
}
