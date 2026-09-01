"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

// Fuera del route group app/(site), así que solo hereda el layout raíz
// mínimo (html/body/fuentes) — nunca el header/footer/BookingProvider del
// sitio de marketing, que romperían el viewport de Sanity Studio.
export const dynamic = "force-static";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
