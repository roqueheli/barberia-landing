import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

// Cache incremental real entre requests (auditoría de TTFB: antes CADA
// request recomputaba desde cero Klipper + Sanity + Google porque no había
// ningún store persistente entre isolates de Worker — los `revalidate` de
// cada fetch eran configuración muerta en producción).
//
// - r2IncrementalCache: guarda las entradas de fetch/ISR cache en el bucket
//   R2 (binding NEXT_INC_CACHE_R2_BUCKET, ver wrangler.jsonc). Requiere que
//   el bucket exista antes del próximo deploy — ver el comentario del
//   binding en wrangler.jsonc para el comando exacto.
// - withRegionalCache("long-lived"): además cachea en el Cache API local del
//   datacenter, así los hits no le pegan a R2 en cada request.
// - doQueue: cola de revalidación en background respaldada por un Durable
//   Object (binding NEXT_CACHE_DO_QUEUE). Es obligatoria para que la
//   revalidación por tiempo (`next:{revalidate}`, usada en todo este sitio)
//   funcione en producción — el modo "direct" alternativo solo corre bajo
//   `wrangler dev`, nunca en un deploy real.
// - Sin tagCache: este sitio nunca llama a revalidateTag()/revalidatePath()
//   (toda la revalidación es por tiempo), así que no hace falta — ver
//   https://opennext.js.org/cloudflare/caching.
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(r2IncrementalCache, { mode: "long-lived" }),
  queue: doQueue,
});
