import { NextRequest, NextResponse } from "next/server";
import { createAppointment } from "@/lib/klipper/client";
import {
  KlipperApiError,
  KlipperNonJsonResponseError,
  KlipperNotFoundError,
  TimeSlotTakenError,
  ValidationError,
} from "@/lib/klipper/errors";
import type { CreateAppointmentPayload } from "@/types/klipper";

interface CreateAppointmentRequestBody {
  organizationId: number;
  name: string;
  email: string;
  phone: string;
  appointmentAt: string;
  serviceIds: number[];
  branchId: number;
  attendedBy: number;
  businessTypeId?: number;
}

function isValidBody(body: unknown): body is CreateAppointmentRequestBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.organizationId === "number" &&
    typeof b.name === "string" &&
    b.name.trim().length > 0 &&
    typeof b.email === "string" &&
    b.email.trim().length > 0 &&
    typeof b.phone === "string" &&
    b.phone.trim().length > 0 &&
    typeof b.appointmentAt === "string" &&
    b.appointmentAt.trim().length > 0 &&
    Array.isArray(b.serviceIds) &&
    b.serviceIds.length > 0 &&
    b.serviceIds.every((id) => typeof id === "number") &&
    typeof b.branchId === "number" &&
    typeof b.attendedBy === "number" &&
    (b.businessTypeId === undefined || typeof b.businessTypeId === "number")
  );
}

// El body de Klipper exige organization_id, name, email, phone,
// appointment_at, service_ids, branch_id y attended_by PLANOS en el nivel
// superior (verificado contra el frontend real de Klipper) —
// business_type_id es opcional.
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_request" }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return NextResponse.json(
      { code: "invalid_request", message: "Faltan datos obligatorios para la reserva." },
      { status: 400 }
    );
  }

  const payload: CreateAppointmentPayload = {
    organization_id: body.organizationId,
    name: body.name,
    email: body.email,
    phone: body.phone,
    appointment_at: body.appointmentAt,
    service_ids: body.serviceIds,
    branch_id: body.branchId,
    attended_by: body.attendedBy,
    ...(body.businessTypeId != null ? { business_type_id: body.businessTypeId } : {}),
  };

  try {
    const result = await createAppointment(payload);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof TimeSlotTakenError) {
      return NextResponse.json({ code: "time_slot_taken", message: err.message }, { status: 422 });
    }
    if (err instanceof ValidationError) {
      return NextResponse.json(
        { code: "validation_error", message: err.message, fieldErrors: err.fieldErrors },
        { status: err.status }
      );
    }
    if (err instanceof KlipperNotFoundError) {
      return NextResponse.json({ code: "organization_not_found", message: err.message }, { status: 404 });
    }
    if (err instanceof KlipperNonJsonResponseError) {
      return NextResponse.json(
        {
          code: "server_error",
          message: "No pudimos procesar tu reserva, intenta de nuevo o escríbenos por WhatsApp.",
        },
        { status: 502 }
      );
    }
    const message = err instanceof KlipperApiError ? err.message : "unknown error";
    console.error("[klipper/appointments]", message);
    return NextResponse.json(
      {
        code: "server_error",
        message: "No pudimos procesar tu reserva, intenta de nuevo o escríbenos por WhatsApp.",
      },
      { status: 502 }
    );
  }
}
