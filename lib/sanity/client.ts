// Cliente de lectura de Sanity para las fotos curadas que NO vienen de
// Klipper (Hero, Nosotros, Proceso, Galería). Dataset público, sin token —
// las tres env vars son NEXT_PUBLIC porque no hay ningún secreto que
// proteger (projectId/dataset son de por sí visibles en cualquier request
// al CDN de Sanity).
import { createClient, type SanityClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

export const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-30";

// El cliente solo se crea si hay projectId. createClient() lanza
// "Configuration must contain projectId" si está vacío, y eso rompía el build
// en entornos donde NEXT_PUBLIC_SANITY_PROJECT_ID no está disponible en tiempo
// de build (p. ej. cuando la var vive como runtime var del Worker y no como
// build var). Con Sanity sin configurar, sanityClient es null y getSiteContent
// degrada a null (cada sección cae a su contenido curado por defecto).
export const sanityClient: SanityClient | null = SANITY_PROJECT_ID
  ? createClient({
      projectId: SANITY_PROJECT_ID,
      dataset,
      apiVersion,
      useCdn: true,
    })
  : null;

const builder = sanityClient ? createImageUrlBuilder(sanityClient) : null;

export function urlForImage(source: SanityImageSource): string {
  // Sin cliente (Sanity no configurado) no hay URL que construir. No debería
  // llamarse en ese caso porque getSiteContent devuelve null antes, pero se
  // protege igual para no lanzar.
  if (!builder) return "";
  return builder.image(source).width(2000).auto("format").url();
}
