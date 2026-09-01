import { NextResponse } from "next/server";
import { getStatus } from "@/lib/klipper/client";

export interface StatusApiResponse {
  allowAppointments: boolean;
  skipBranchStep: boolean;
  skipServiceStep: boolean;
  appointmentConsent: boolean;
  militaryTime: boolean;
  timeZone: string;
}

// Siempre responde 200: si el slug no existe, Klipper no responde, o hay
// timeout, el contrato con el cliente es "el flujo de citas no está
// disponible ahora mismo", no un error genérico. El wizard debe caer al
// fallback de WhatsApp en cualquiera de esos casos.
export async function GET() {
  const slug = process.env.KLIPPER_ORG_SLUG;
  if (!slug) {
    return NextResponse.json({ allowAppointments: false });
  }

  try {
    const status = await getStatus(slug);
    if (!status) {
      // 404: el slug configurado no existe en Klipper.
      return NextResponse.json({ allowAppointments: false });
    }

    const body: StatusApiResponse = {
      allowAppointments: Boolean(status.allow_appointments),
      skipBranchStep: Boolean(status.skip_branch_step),
      skipServiceStep: Boolean(status.skip_service_step),
      appointmentConsent: Boolean(status.appointment_consent),
      militaryTime: Boolean(status.military_time),
      timeZone: status.time_zone || "America/Santiago",
    };
    return NextResponse.json(body);
  } catch (err) {
    console.error("[klipper/status]", err instanceof Error ? err.message : "unknown error");
    return NextResponse.json({ allowAppointments: false });
  }
}
