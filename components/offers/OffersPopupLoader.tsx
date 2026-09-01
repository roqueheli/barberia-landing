"use client";

import { useEffect, useState } from "react";
import type { Offer } from "@/types/offer";
import { fetchOffers } from "@/lib/offers-api";
import SpecialOffersPopup from "@/components/offers/SpecialOffersPopup";

interface OffersPopupLoaderProps {
  organizationName?: string;
  organizationLogo?: string;
}

/**
 * Carga las ofertas en el cliente (desde el proxy /api/offers/public) y
 * monta el popup. Se hace client-side a propósito: así el HTML inicial de la
 * landing no depende de la respuesta de ofertas, y si Klipper tarda o falla,
 * la página ya está pintada y el popup simplemente no aparece.
 */
export default function OffersPopupLoader({
  organizationName,
  organizationLogo,
}: OffersPopupLoaderProps) {
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchOffers(controller.signal).then((data) => setOffers(data));
    return () => controller.abort();
  }, []);

  if (offers.length === 0) return null;

  return (
    <SpecialOffersPopup
      offers={offers}
      organizationName={organizationName}
      organizationLogo={organizationLogo}
    />
  );
}
