// Helpers compartidos por app/api/booking/* — Route Handlers same-origin
// que hacen de proxy hacia los endpoints "públicos" de Klipper que en la
// práctica SÍ tienen CORS bloqueado desde este origen (confirmado en
// producción: la respuesta llega 200 pero sin Access-Control-Allow-Origin,
// así que el navegador la descarta antes de que el JS del cliente pueda
// leerla). Server-to-server no está sujeto a CORS, así que proxyar acá
// evita depender de que Klipper habilite el header algún día.
import "server-only";

export function getBaseUrl(): string {
  const url = process.env.KLIPPER_API_BASE_URL;
  if (!url) {
    throw new Error("KLIPPER_API_BASE_URL no está configurada");
  }
  return url.replace(/\/+$/, "");
}

export function getOrgSlug(): string {
  const slug = process.env.KLIPPER_ORG_SLUG;
  if (!slug) {
    throw new Error("KLIPPER_ORG_SLUG no está configurada");
  }
  return slug;
}

// El backend real observado no siempre setea Content-Type: application/json
// (un 404 de ejemplo llegó como text/plain con un body JSON válido), así que
// acá se intenta parsear igual y solo se cae a un mensaje genérico si el
// parseo realmente falla — no se puede confiar en el header como en otras
// integraciones.
export async function parseJsonLenient(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return undefined; // marca "no es JSON parseable"
  }
}
