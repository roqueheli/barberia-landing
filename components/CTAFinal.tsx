import { siteConfig } from "@/data/site";
import { buildWhatsAppLink, mensajeReservaGenerico } from "@/lib/whatsapp";
import ReservarButton from "@/components/ReservarButton";
import { getSiteContent } from "@/lib/sanity/site-content";

const DEFAULT_CTA_FINAL_TITLE = "Tu próxima hora, en menos de 30 segundos";
const DEFAULT_CTA_FINAL_DESCRIPTION =
  "Reserva tu hora online o escríbenos directo por WhatsApp. Te confirmamos al instante.";
const DEFAULT_CTA_FINAL_PRIMARY_CTA = "Reservar hora";
const DEFAULT_CTA_FINAL_WHATSAPP_CTA = "Escríbenos por WhatsApp";

export default async function CTAFinal() {
  const whatsappLink = buildWhatsAppLink(siteConfig.whatsappGeneral, mensajeReservaGenerico());
  const siteContent = await getSiteContent();
  const ctaFinalTitle = siteContent?.ctaFinalTitle || DEFAULT_CTA_FINAL_TITLE;
  const ctaFinalDescription = siteContent?.ctaFinalDescription || DEFAULT_CTA_FINAL_DESCRIPTION;
  const ctaFinalPrimaryCta = siteContent?.ctaFinalPrimaryCta || DEFAULT_CTA_FINAL_PRIMARY_CTA;
  const ctaFinalWhatsappCta = siteContent?.ctaFinalWhatsappCta || DEFAULT_CTA_FINAL_WHATSAPP_CTA;

  return (
    <section id="contacto" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-background-elevated to-background px-6 py-14 text-center sm:px-12 sm:py-20">
        <h2 className="font-display text-4xl font-bold text-white sm:text-5xl">
          {ctaFinalTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-400">{ctaFinalDescription}</p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ReservarButton
            analyticsSource="cta-final"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition hover:bg-accent-strong"
          >
            {ctaFinalPrimaryCta}
          </ReservarButton>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics-event="whatsapp_click"
            data-analytics-source="cta-final"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
          >
            {ctaFinalWhatsappCta}
          </a>
        </div>
      </div>
    </section>
  );
}
