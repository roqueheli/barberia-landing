"use client";

import { siteConfig } from "@/data/site";
import { buildWhatsAppLink, mensajeReservaGenerico } from "@/lib/whatsapp";

/**
 * Botón flotante de WhatsApp, siempre visible en mobile y desktop.
 * Se mantiene por encima del contenido pero por debajo del modal de reserva.
 */
export default function WhatsAppButton() {
  const link = buildWhatsAppLink(siteConfig.whatsappGeneral, mensajeReservaGenerico());

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      data-analytics-event="whatsapp_click"
      data-analytics-source="floating-button"
      aria-label="Escríbenos por WhatsApp"
      className="group fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/40 transition-transform duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 sm:bottom-8 sm:right-8 sm:h-16 sm:w-16"
    >
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-7 w-7 sm:h-8 sm:w-8" fill="currentColor">
        <path d="M16.02 3C9.4 3 4.02 8.38 4.02 15c0 2.35.66 4.55 1.8 6.43L4 29l7.76-1.77A11.9 11.9 0 0 0 16.02 27C22.64 27 28 21.63 28 15S22.64 3 16.02 3Zm0 21.75c-1.95 0-3.77-.53-5.33-1.46l-.38-.22-4.6 1.05 1.08-4.48-.25-.4a9.68 9.68 0 0 1-1.52-5.24c0-5.36 4.36-9.72 9.72-9.72 5.36 0 9.72 4.36 9.72 9.72s-4.36 9.75-9.72 9.75Zm5.34-7.3c-.29-.15-1.73-.85-2-.95-.27-.1-.46-.15-.66.15-.2.29-.76.95-.93 1.14-.17.2-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.77-1.43-1.71-1.6-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.07-.15-.66-1.6-.91-2.19-.24-.57-.48-.5-.66-.51h-.56c-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.44 0 1.43 1.04 2.82 1.19 3.01.15.2 2.05 3.13 4.97 4.39.69.3 1.24.48 1.66.61.7.22 1.34.19 1.84.12.56-.08 1.73-.71 1.98-1.39.24-.68.24-1.27.17-1.39-.07-.13-.27-.2-.56-.35Z" />
      </svg>
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 sm:block">
        Escríbenos por WhatsApp
      </span>
    </a>
  );
}
