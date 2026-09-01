import { NextRequest, NextResponse } from "next/server";
import { getAppointmentData, getLanding, getUsersToAppointment } from "@/lib/klipper/client";
import { mapAppointmentDataToPublic, mapUsersToAppointmentToPublic } from "@/lib/klipper/mappers";
import { KlipperApiError, KlipperNotFoundError } from "@/lib/klipper/errors";
import type { BookingAvailability } from "@/types/klipper";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function plusDaysIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// appointment_data responde 400 si falta start_date/end_date: nunca se llama
// al cliente sin ambos, así que si el wizard no los manda, se completan acá
// con el default documentado (hoy → hoy + 7 días).
export async function GET(request: NextRequest) {
  const slug = process.env.KLIPPER_ORG_SLUG;
  if (!slug) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("start_date") || todayIso();
  const endDate = searchParams.get("end_date") || plusDaysIso(7);
  const serviceIdParam = searchParams.get("service_id");
  const serviceId = serviceIdParam ? Number(serviceIdParam) : undefined;
  const branchIdParam = searchParams.get("branch_id");
  const branchId = branchIdParam ? Number(branchIdParam) : undefined;

  try {
    const data = await getAppointmentData(slug, {
      startDate,
      endDate,
      serviceId: Number.isFinite(serviceId) ? serviceId : undefined,
    });

    // branchId filtra a los profesionales de la sucursal elegida — sin esto
    // se mostraban los de TODA la organización, sin importar cuál sucursal
    // seleccionó el cliente.
    const professionals = mapAppointmentDataToPublic(data, Number.isFinite(branchId) ? branchId : undefined);

    // appointment_data filtra role: agent sin bypass de owner. Si la
    // organización solo tiene al dueño activo (sin agentes), `users` viene
    // vacío aunque sí existan profesionales según landing/users_to_appointment.
    if (professionals.length === 0) {
      // users_to_appointment no filtra por organización del lado del
      // backend (devuelve usuarios de todas las organizaciones mezclados),
      // así que hace falta el id numérico real de la org para filtrar acá
      // — sin esto se mostraban profesionales de negocios completamente
      // ajenos al de este sitio.
      const landing = await getLanding(slug);
      const fallback = await getUsersToAppointment(slug, landing.organization.id);
      const fallbackProfessionals = mapUsersToAppointmentToPublic(
        fallback,
        Number.isFinite(branchId) ? branchId : undefined,
        landing.organization.id
      );
      const body: BookingAvailability = {
        mode: "manual",
        professionals: fallbackProfessionals.map((user) => ({ user, available_slots: {} })),
      };
      return NextResponse.json(body);
    }

    const body: BookingAvailability = { mode: "slots", professionals };
    return NextResponse.json(body);
  } catch (err) {
    if (err instanceof KlipperNotFoundError) {
      return NextResponse.json({ error: "organization_not_found" }, { status: 404 });
    }
    const message = err instanceof KlipperApiError ? err.message : "unknown error";
    console.error("[klipper/availability]", message);
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }
}
