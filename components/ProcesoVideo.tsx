"use client";

import { useState } from "react";

// Sanity no extrae dimensiones de archivos de video (a diferencia de
// imágenes, no hay metadata.dimensions — verificado contra el asset real
// subido: metadata llega null) — la única forma de saber si un video
// subido es horizontal o vertical es leerlo en el navegador una vez carga
// sus metadatos. Mientras se detecta, se asume 16:9 (lo que había antes de
// que existiera esta sección editable); si el video resulta vertical, el
// contenedor se ajusta a su proporción real sin recortar el encuadre.
export default function ProcesoVideo({
  src,
  type,
  poster,
}: {
  src: string;
  type: string;
  poster: string;
}) {
  const [aspectRatio, setAspectRatio] = useState(16 / 9);
  const isPortrait = aspectRatio < 1;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-white/10 ${
        isPortrait ? "mx-auto max-w-xs" : ""
      }`}
      style={{ aspectRatio }}
    >
      <video
        className="h-full w-full object-cover"
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-label="Video en loop mostrando el ritual de afeitado clásico a navaja"
        onLoadedMetadata={(e) => {
          const { videoWidth, videoHeight } = e.currentTarget;
          if (videoWidth && videoHeight) {
            setAspectRatio(videoWidth / videoHeight);
          }
        }}
      >
        <source src={src} type={type} />
      </video>
    </div>
  );
}
