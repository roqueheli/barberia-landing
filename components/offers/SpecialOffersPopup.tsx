"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, Tag, CalendarDays, ChevronRight } from "lucide-react";
import type { Offer } from "@/types/offer";
import { filterActiveOffers } from "@/lib/offers-api";

interface SpecialOffersPopupProps {
  offers: Offer[];
  organizationName?: string;
  organizationLogo?: string;
}

// Se muestra una sola vez por sesión de render (mientras el módulo viva en
// memoria): evita que el popup reaparezca al navegar entre secciones de la
// SPA. Es un flag de módulo a propósito, no de estado, para que sobreviva a
// remounts del componente dentro de la misma sesión.
let hasShown = false;

const APPEAR_DELAY_MS = 800;
const ANIM_MS = 250;

// 20.0 -> "20", 12.5 -> "12.5". String() ya omite los decimales cuando el
// número es entero, así que muestra decimales solo si existen.
function formatDiscountNumber(value: number): string {
  return String(value);
}

function formatCLP(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function discountBadgeLabel(offer: Offer): string | null {
  // Solo las ofertas de tipo "discount" muestran badge de descuento; las
  // "informative" son solo un anuncio.
  if (offer.offer_type != null && offer.offer_type !== "discount") return null;
  if (offer.discount_type === "percentage") {
    return `${formatDiscountNumber(offer.discount)}% OFF`;
  }
  return `${formatCLP(offer.discount)} de descuento`;
}

function formatExpiry(activeUntil: string | null): string | null {
  if (!activeUntil) return null;
  const match = activeUntil.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, y, m, d] = match;
  return `hasta ${d}/${m}/${y}`;
}

export default function SpecialOffersPopup({
  offers,
  organizationName,
  organizationLogo,
}: SpecialOffersPopupProps) {
  const activeOffers = useMemo(() => filterActiveOffers(offers), [offers]);

  // visible controla el render; entered controla las animaciones de fade +
  // scale (se monta oculto y se pasa a "entered" en el próximo frame para
  // disparar la transición de entrada). visible solo se activa dentro de un
  // efecto (client-only), así que document ya existe cuando se usa el portal.
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (activeOffers.length === 0 || hasShown) return;
    const timer = setTimeout(() => {
      hasShown = true;
      setVisible(true);
      // Doble rAF: asegura que el nodo ya está en el DOM en su estado inicial
      // (opacity 0/scale 95) antes de togglear a la clase "entered".
      requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
    }, APPEAR_DELAY_MS);
    return () => clearTimeout(timer);
  }, [activeOffers.length]);

  function handleClose() {
    // Anima la salida y luego desmonta.
    setEntered(false);
    setTimeout(() => {
      setVisible(false);
      // Scroll a servicios para que "cerrar" encamine a la conversión.
      document.getElementById("servicios")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, ANIM_MS);
  }

  function handleNext() {
    setIndex((i) => (i + 1) % activeOffers.length);
  }

  if (!visible || activeOffers.length === 0 || typeof document === "undefined") return null;

  const offer = activeOffers[Math.min(index, activeOffers.length - 1)];
  const badge = discountBadgeLabel(offer);
  const expiry = formatExpiry(offer.active_until);
  const hasMultiple = activeOffers.length > 1;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="offers-popup-title"
      className={`fixed inset-0 z-[110] flex items-center justify-center p-4 transition-opacity duration-200 ${
        entered ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Cerrar promociones"
        onClick={handleClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/70 backdrop-blur-sm"
      />

      <div
        className={`relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-background-elevated shadow-2xl transition-all duration-200 motion-reduce:transition-none ${
          entered ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/60 text-foreground transition hover:bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Imagen o fondo degradado con logo/nombre */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-accent/30 via-background-elevated to-background-elevated">
          {offer.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- imagen de oferta de Klipper, dominio no confirmado para next/image
            <img
              src={offer.image_url}
              alt={offer.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
              {organizationLogo ? (
                // eslint-disable-next-line @next/next/no-img-element -- logo en vivo de Klipper
                <img src={organizationLogo} alt={organizationName ?? "Logo"} className="h-14 w-auto object-contain" />
              ) : (
                <span className="font-display text-2xl font-bold text-foreground">
                  {organizationName ?? "Promoción"}
                </span>
              )}
            </div>
          )}

          {badge && (
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-sm font-bold text-accent-foreground shadow-lg">
              <Tag className="h-3.5 w-3.5" aria-hidden="true" />
              {badge}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 p-6">
          {expiry && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-foreground-muted">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {expiry}
            </span>
          )}

          <h2 id="offers-popup-title" className="font-display text-2xl font-bold text-foreground">
            {offer.title}
          </h2>

          {offer.description && (
            <p className="text-sm text-foreground-muted">{offer.description}</p>
          )}

          {hasMultiple && (
            <div className="mt-1 flex items-center justify-between gap-3">
              <ul className="flex items-center gap-1.5" aria-label="Navegación de promociones">
                {activeOffers.map((o, i) => (
                  <li key={o.id}>
                    <button
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Ver promoción ${i + 1}`}
                      aria-current={i === index ? "true" : undefined}
                      className={`h-2 rounded-full transition-all ${
                        i === index ? "w-6 bg-accent" : "w-2 bg-foreground-muted/40 hover:bg-foreground-muted/70"
                      }`}
                    />
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1 text-sm font-semibold text-accent transition hover:text-accent-strong"
              >
                Ver siguiente
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleClose}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            ¡Agendar ahora!
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
