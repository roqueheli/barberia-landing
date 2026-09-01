import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      // "server-only" solo funciona vía el aliasing especial del webpack de
      // Next.js; en Vitest (Node puro) su implementación real siempre tira
      // un throw, así que se reemplaza por un no-op solo para los tests.
      "server-only": path.resolve(__dirname, "test/stubs/server-only.ts"),
    },
  },
});
