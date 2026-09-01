import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Config del adaptador OpenNext para desplegar Next.js en Cloudflare Workers.
// Sin caché incremental configurada por ahora (R2/KV): las páginas ISR/SSG se
// regeneran en cada isolate según su revalidate. Si más adelante se quiere
// caché persistente entre requests, ver https://opennext.js.org/cloudflare/caching
export default defineCloudflareConfig();
