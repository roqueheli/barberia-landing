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

export const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset,
  apiVersion,
  useCdn: true,
});

const builder = createImageUrlBuilder(sanityClient);

export function urlForImage(source: SanityImageSource): string {
  return builder.image(source).width(2000).auto("format").url();
}
