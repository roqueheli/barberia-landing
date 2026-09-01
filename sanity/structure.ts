import type { StructureResolver } from "sanity/structure";

// siteContent es un singleton: un único documento con id fijo, sin lista ni
// botón de "crear nuevo" (el template global se filtra en sanity.config.ts)
// — sin esto un editor podría crear un segundo documento por accidente y
// la query `[0]` de lib/sanity/site-content.ts elegiría uno arbitrario.
export const SITE_CONTENT_DOC_ID = "siteContent";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Contenido")
    .items([
      S.listItem()
        .title("Contenido del sitio")
        .id("siteContent")
        .child(
          S.document().schemaType("siteContent").documentId(SITE_CONTENT_DOC_ID)
        ),
    ]);
