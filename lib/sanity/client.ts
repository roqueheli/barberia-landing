// Cliente de lectura de Sanity para las fotos curadas que NO vienen de
// Klipper (Hero, Nosotros, Proceso, Galería). Dataset público, sin token —
// las tres env vars son NEXT_PUBLIC porque no hay ningún secreto que
// proteger (projectId/dataset son de por sí visibles en cualquier request
// al CDN de Sanity).
import { createClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

export const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-30";

// createClient() valida projectId de forma SÍNCRONA en el constructor y
// lanza si viene vacío — con un cliente nuevo del template (todavía sin
// configurar Sanity) o en tests sin .env.local, eso rompía el import de
// este módulo para CUALQUIER caller, antes de llegar siquiera a los guards
// de SANITY_PROJECT_ID en getSiteContent()/getSanitySucursales(). Se pasa
// un placeholder cuando falta la env var: el cliente queda construido
// pero nunca se usa de verdad, porque esos guards cortan antes de llamar
// a sanityClient.fetch(...).
export const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID || "unconfigured",
  dataset,
  apiVersion,
  useCdn: true,
});

const builder = createImageUrlBuilder(sanityClient);

export function urlForImage(source: SanityImageSource): string {
  return builder.image(source).width(2000).auto("format").url();
}
