import { resenas } from "@/data/resenas";
import TestimonioCard from "@/components/TestimonioCard";
import { getSiteContent } from "@/lib/sanity/site-content";
import { getBusinessReviews } from "@/lib/google/reviews";
import type { GoogleReview } from "@/types/google";
import type { Resena } from "@/types";

const DEFAULT_RESENAS_EYEBROW = "Reseñas";
const DEFAULT_RESENAS_TITLE = "Lo que dicen nuestros clientes";

function toResena(review: GoogleReview): Resena {
  return {
    id: review.id,
    nombreCliente: review.authorName,
    sucursal: review.sucursalNombre,
    rating: review.rating,
    texto: review.text,
    fecha: review.publishTime ?? "",
    foto: review.authorPhotoUrl ?? undefined,
    fotoAlt: `Foto de perfil de ${review.authorName}`,
  };
}

export default async function ResenasSection() {
  const siteContent = await getSiteContent();
  const resenasEyebrow = siteContent?.resenasEyebrow || DEFAULT_RESENAS_EYEBROW;
  const resenasTitle = siteContent?.resenasTitle || DEFAULT_RESENAS_TITLE;
  const googleReviews = await getBusinessReviews();
  const reviewsToShow = googleReviews?.length ? googleReviews.map(toResena) : resenas;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">{resenasEyebrow}</p>
        <h2 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
          {resenasTitle}
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reviewsToShow.map((resena) => (
          <TestimonioCard key={resena.id} resena={resena} />
        ))}
      </div>
    </section>
  );
}
