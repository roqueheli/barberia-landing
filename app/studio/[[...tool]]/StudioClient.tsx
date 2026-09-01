"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

// Aislado en su propio módulo cliente para que el import del paquete `sanity`
// (Studio completo, ~20 MB) solo se incluya en el bundle cuando la página lo
// carga dinámicamente con el flag activado. En producción en Cloudflare
// Workers el Studio se deshabilita (excede el límite de tamaño del Worker) y
// este módulo nunca se importa.
export default function StudioClient() {
  return <NextStudio config={config} />;
}
