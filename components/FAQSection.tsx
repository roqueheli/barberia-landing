import { faq } from "@/data/faq";
import FAQAccordion from "@/components/FAQAccordion";
import { getSiteContent } from "@/lib/sanity/site-content";

const DEFAULT_FAQ_EYEBROW = "Preguntas frecuentes";
const DEFAULT_FAQ_TITLE = "¿Tienes dudas?";

export default async function FAQSection() {
  const siteContent = await getSiteContent();
  const faqEyebrow = siteContent?.faqEyebrow || DEFAULT_FAQ_EYEBROW;
  const faqTitle = siteContent?.faqTitle || DEFAULT_FAQ_TITLE;

  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          {faqEyebrow}
        </p>
        <h2 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
          {faqTitle}
        </h2>
      </div>

      <div className="mt-12">
        <FAQAccordion items={faq} />
      </div>
    </section>
  );
}
