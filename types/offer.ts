// Contratos de las ofertas/promociones de Klipper. Los nombres de campo se
// dejan tal cual los devuelve el backend (snake_case). El frontend NUNCA
// calcula el descuento: el backend entrega `price_with_offer` ya resuelto en
// cada servicio (respetando vigencia, applies_to, att_type_condition, etc.);
// acá solo se tipa y se pinta.

export type OfferType = "discount" | "informative";
export type DiscountType = "percentage" | "amount";
export type AppliesTo = "all" | "service_ids";
export type AttTypeCondition = "appointment" | "onsite" | "sale" | null;

export interface Offer {
  id: number;
  organization_id: number;
  active: boolean;
  /** "YYYY-MM-DD" o null (sin vencimiento). */
  active_until: string | null;
  /** informative = solo anuncio, sin descuento. Puede venir ausente. */
  offer_type?: OfferType;
  discount_type: DiscountType;
  discount: number;
  /** % del descuento que asume la organización (0-100). */
  discount_org_absorption: number;
  title: string;
  description?: string | null;
  image_url?: string | null;
  applies_to: AppliesTo;
  service_ids: number[];
  att_type_condition: AttTypeCondition;
}

// Overlay que el backend agrega a cada Service cuando hay una oferta
// aplicable. `price` es el precio YA rebajado.
export interface PriceWithOffer {
  price: number;
  offer_id: number;
  offer_title: string;
  discount_type: DiscountType;
  discount: number;
}
