import Image from "next/image";
import { experiencia } from "@/data/site";
import { getSiteContent } from "@/lib/sanity/site-content";

const DEFAULT_ABOUT_EYEBROW = "Sobre la experiencia";
const DEFAULT_ABOUT_CTA = "Conoce la casa";

export default async function AboutSection() {
  const siteContent = await getSiteContent();
  const aboutImage = siteContent?.aboutImage ?? experiencia.imagen;
  const aboutImageAlt = siteContent?.aboutImageAlt || experiencia.imagenAlt;
  const aboutEyebrow = siteContent?.aboutEyebrow || DEFAULT_ABOUT_EYEBROW;
  const aboutTitle = siteContent?.aboutTitle || experiencia.titulo;
  const aboutParagraphs = siteContent?.aboutParagraphs.length
    ? siteContent.aboutParagraphs
    : experiencia.parrafos;
  const aboutIncluye = siteContent?.aboutIncluye.length
    ? siteContent.aboutIncluye
    : experiencia.incluyeTodoServicio;
  const aboutCta = siteContent?.aboutCta || DEFAULT_ABOUT_CTA;

  return (
    <section id="nosotros" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative order-2 aspect-[4/5] w-full overflow-hidden rounded-2xl lg:order-1">
          <Image
            src={aboutImage}
            alt={aboutImageAlt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="order-1 lg:order-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            {aboutEyebrow}
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
            {aboutTitle}
          </h2>

          <div className="mt-6 flex flex-col gap-4 text-neutral-300">
            {aboutParagraphs.map((parrafo, i) => (
              <p key={i}>{parrafo}</p>
            ))}
          </div>

          <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-neutral-400">
            Qué incluye todo servicio
          </h3>
          <ul className="mt-4 flex flex-col gap-3">
            {aboutIncluye.map((item) => (
              <li key={item} className="flex items-start gap-3 text-neutral-200">
                <CheckIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <a
            href="#equipo"
            data-analytics-event="conoce_la_casa_click"
            data-analytics-source="about-section"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {aboutCta}
          </a>
        </div>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-accent/15 p-1 text-accent"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10.5l4 4 8-9" />
    </svg>
  );
}
