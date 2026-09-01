import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export default defineConfig({
  name: "default",
  title: "Fotos del sitio",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [structureTool({ structure })],
  schema: {
    types: schemaTypes,
    // Evita el botón global "+ Crear" para siteContent — es un singleton
    // (id fijo, ver sanity/structure.ts), solo se edita desde ahí.
    templates: (templates) =>
      templates.filter((template) => template.schemaType !== "siteContent"),
  },
});
