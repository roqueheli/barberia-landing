import { notFound } from "next/navigation";
import StudioGate from "./StudioGate";

// Sanity Studio (paquete `sanity`, ~20 MB) NO se puede bundlear en un
// Cloudflare Worker: excede el límite de tamaño del Worker. Por eso el Studio
// solo se habilita cuando NEXT_PUBLIC_ENABLE_STUDIO === "true" (desarrollo
// local o un deploy sin esa restricción). En producción en Cloudflare la ruta
// responde 404 y el paquete pesado se carga solo bajo demanda (next/dynamic
// con ssr:false dentro de StudioGate), no en el bundle del servidor.
//
// Para editar contenido: correr en local (`npm run dev` -> /studio) o alojar
// el Studio aparte en sanity.studio (hosting gratuito de Sanity).
const STUDIO_ENABLED = process.env.NEXT_PUBLIC_ENABLE_STUDIO === "true";

export default function StudioPage() {
  if (!STUDIO_ENABLED) notFound();
  return <StudioGate />;
}
