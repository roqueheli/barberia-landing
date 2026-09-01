import { procesoDemo } from "@/data/site";
import { getSiteContent } from "@/lib/sanity/site-content";
import { getBranding } from "@/lib/branding";
import ProcesoVideo from "@/components/ProcesoVideo";

const DEFAULT_PROCESO_EYEBROW = "El proceso";
const DEFAULT_PROCESO_INSTAGRAM_CTA = "Ver más videos en Instagram →";
const DEFAULT_VIDEO_TYPE = "video/mp4";

export default async function ProcesoSection() {
  const siteContent = await getSiteContent();
  const { instagramUrl } = await getBranding();
  const videoPoster = siteContent?.procesoPosterImage ?? procesoDemo.videoPoster;
  const videoUrl = siteContent?.procesoVideo ?? procesoDemo.videoUrl;
  const videoType = siteContent?.procesoVideo
    ? siteContent.procesoVideoType || DEFAULT_VIDEO_TYPE
    : DEFAULT_VIDEO_TYPE;
  const procesoEyebrow = siteContent?.procesoEyebrow || DEFAULT_PROCESO_EYEBROW;
  const procesoTitle = siteContent?.procesoTitle || procesoDemo.titulo;
  const procesoDescription = siteContent?.procesoDescription || procesoDemo.descripcion;
  const procesoPasos = siteContent?.procesoPasos.length ? siteContent.procesoPasos : procesoDemo.pasos;
  const procesoInstagramCta = siteContent?.procesoInstagramCta || DEFAULT_PROCESO_INSTAGRAM_CTA;

  return (
    <section className="border-y border-white/10 bg-background-elevated/50 py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <ProcesoVideo src={videoUrl} type={videoType} poster={videoPoster} />

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            {procesoEyebrow}
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
            {procesoTitle}
          </h2>
          <p className="mt-4 text-neutral-300">{procesoDescription}</p>

          <ol className="mt-8 flex flex-col gap-4">
            {procesoPasos.map((paso, i) => (
              <li key={paso} className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/40 font-display text-sm font-semibold text-accent">
                  {i + 1}
                </span>
                <span className="pt-1 text-neutral-200">{paso}</span>
              </li>
            ))}
          </ol>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics-event="instagram_click"
            data-analytics-source="proceso-section"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white underline decoration-accent decoration-2 underline-offset-4 transition hover:text-accent"
          >
            {procesoInstagramCta}
          </a>
        </div>
      </div>
    </section>
  );
}
