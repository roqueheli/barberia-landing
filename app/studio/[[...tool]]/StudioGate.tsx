"use client";

import dynamic from "next/dynamic";

// Carga el Studio (paquete `sanity`) solo en el cliente y bajo demanda. Al
// estar el import dinámico dentro de un componente cliente con ssr:false, el
// paquete pesado no entra al bundle del servidor de Cloudflare. Este módulo
// solo se renderiza cuando la ruta está habilitada (ver page.tsx), así que en
// producción (Studio deshabilitado) nunca se monta.
const StudioClient = dynamic(() => import("./StudioClient"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center text-sm text-neutral-500">
      Cargando editor…
    </div>
  ),
});

export default function StudioGate() {
  return <StudioClient />;
}
