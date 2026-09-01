import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl, getOrgSlug, parseJsonLenient } from "@/lib/booking-proxy";

// Proxy same-origin de GET /api/appointment/:slug?type=calendar&... — ver
// lib/booking-proxy.ts para el porqué (CORS bloqueado en el dominio real).
export async function GET(request: NextRequest) {
  let base: string;
  let slug: string;
  try {
    base = getBaseUrl();
    slug = getOrgSlug();
  } catch {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");
  const date = searchParams.get("date");
  const timezone = searchParams.get("timezone");
  if (!userId || !date || !timezone) {
    return NextResponse.json(
      { error: "user_id, date y timezone son obligatorios" },
      { status: 400 }
    );
  }

  const search = new URLSearchParams({ type: "calendar", user_id: userId, date, timezone });
  const res = await fetch(`${base}/api/appointment/${encodeURIComponent(slug)}?${search.toString()}`);
  const data = await parseJsonLenient(res);
  if (data === undefined) {
    console.error("[booking/calendar] respuesta no parseable como JSON, status", res.status);
    return NextResponse.json(
      { error: "No pudimos cargar la disponibilidad. Intenta de nuevo." },
      { status: 502 }
    );
  }
  return NextResponse.json(data, { status: res.status });
}
