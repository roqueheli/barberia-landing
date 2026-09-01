import Image from "next/image";
import { siteConfig } from "@/data/site";
import { getSiteContent } from "@/lib/sanity/site-content";

const DEFAULT_FOTOS_GALERIA = [
  { src: "https://picsum.photos/seed/barberia-galeria-1/800/800", alt: "Barbero terminando un corte con secador y peine" },
  { src: "https://picsum.photos/seed/barberia-galeria-2/800/800", alt: "Detalle de tijeras y peines profesionales sobre paño" },
  { src: "https://picsum.photos/seed/barberia-galeria-3/800/800", alt: "Cliente sonriendo frente al espejo tras su corte" },
  { src: "https://picsum.photos/seed/barberia-galeria-4/800/800", alt: "Barbero aplicando espuma de afeitar con brocha" },
  { src: "https://picsum.photos/seed/barberia-galeria-5/800/800", alt: `Fachada iluminada de una sucursal ${siteConfig.nombreCorto} de noche` },
  { src: "https://picsum.photos/seed/barberia-galeria-6/800/800", alt: "Repisa con productos de grooming de la casa" },
];
const DEFAULT_GALERIA_EYEBROW = "Galería";
const DEFAULT_GALERIA_TITLE = "El ambiente, en imágenes";

export default async function GaleriaSection() {
  const siteContent = await getSiteContent();
  const fotosGaleria = siteContent?.galleryPhotos.length
    ? siteContent.galleryPhotos.map((p) => ({ src: p.url, alt: p.alt }))
    : DEFAULT_FOTOS_GALERIA;
  const galeriaEyebrow = siteContent?.galeriaEyebrow || DEFAULT_GALERIA_EYEBROW;
  const galeriaTitle = siteContent?.galeriaTitle || DEFAULT_GALERIA_TITLE;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">{galeriaEyebrow}</p>
        <h2 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
          {galeriaTitle}
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {fotosGaleria.map((foto) => (
          <div key={foto.src} className="relative aspect-square overflow-hidden rounded-2xl">
            <Image
              src={foto.src}
              alt={foto.alt}
              fill
              loading="lazy"
              sizes="(min-width: 768px) 33vw, 50vw"
              className="object-cover transition duration-500 hover:scale-105"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
