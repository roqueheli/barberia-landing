import { NextRequest, NextResponse } from "next/server";
import { getUserCalendar } from "@/lib/klipper/client";
import { KlipperApiError } from "@/lib/klipper/errors";

// Proxy same-origin de GET /api/v1/user_calendar — calendario crudo (turno
// del día + citas ya tomadas) de un profesional puntual. A diferencia de
// /api/v1/attendances, no requiere autenticación. El body que reenvía no
// trae PII sensible (solo horarios y appointment_at/attended_by), así que
// se pasa tal cual — el cálculo de slots libres vive en
// lib/klipper/slots.ts y corre en el cliente (mismo patrón que el otro
// flujo de reserva).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userIdParam = searchParams.get("user_id");
  const date = searchParams.get("date");
  const timezone = searchParams.get("timezone");
  const userId = userIdParam ? Number(userIdParam) : NaN;

  if (!Number.isFinite(userId) || !date || !timezone) {
    return NextResponse.json(
      { error: "user_id, date y timezone son obligatorios" },
      { status: 400 }
    );
  }

  try {
    const calendar = await getUserCalendar({ userId, date, timezone });
    return NextResponse.json(calendar);
  } catch (err) {
    const message = err instanceof KlipperApiError ? err.message : "unknown error";
    console.error("[klipper/calendar]", message);
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }
}
