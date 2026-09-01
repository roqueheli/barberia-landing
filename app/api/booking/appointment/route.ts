import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl, getOrgSlug, parseJsonLenient } from "@/lib/booking-proxy";

// Proxy same-origin de POST /api/appointment/:slug — ver lib/booking-proxy.ts
// para el porqué (CORS bloqueado en el dominio real). El body se reenvía
// tal cual: components/booking/BookingModal.tsx ya arma el payload en el
// shape que Klipper espera (CreateAppointmentPayload).
export async function POST(request: NextRequest) {
  let base: string;
  let slug: string;
  try {
    base = getBaseUrl();
    slug = getOrgSlug();
  } catch {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const res = await fetch(`${base}/api/appointment/${encodeURIComponent(slug)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": "es",
    },
    body: JSON.stringify(body),
  });
  const data = await parseJsonLenient(res);
  if (data === undefined) {
    console.error("[booking/appointment] respuesta no parseable como JSON, status", res.status);
    return NextResponse.json(
      { error: "No pudimos crear tu cita, intenta de nuevo o escríbenos por WhatsApp." },
      { status: 502 }
    );
  }
  return NextResponse.json(data, { status: res.status });
}
