import { NextResponse } from "next/server";
import { getOffers } from "@/lib/klipper/client";
import { getOrganizationContent } from "@/lib/klipper/organization";
import type { Offer } from "@/types/offer";

// Proxy público de las ofertas/promociones de Klipper. El slug NO se toma del
// query (server-only en este proyecto): se resuelve la organización desde la
// env vía getOrganizationContent, igual que el resto del contenido en vivo.
// Se acepta el query `slug` solo por compatibilidad con el contrato descrito,
// pero se ignora.
//
// Contrato: SIEMPRE responde 200 con un array. Ante slug no configurado,
// Klipper caído, timeout o cualquier error, devuelve [] — nunca rompe la
// landing (el popup simplemente no aparece si no hay ofertas).
export const revalidate = 60;

export async function GET(): Promise<NextResponse<Offer[]>> {
  try {
    const content = await getOrganizationContent();
    if (!content) return NextResponse.json([]);

    const offers = await getOffers(content.organization.id, { revalidate: 60, tags: ["klipper-offers"] });
    return NextResponse.json(offers);
  } catch (err) {
    console.error("[offers/public]", err instanceof Error ? err.message : "unknown error");
    return NextResponse.json([]);
  }
}
