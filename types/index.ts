// Tipos compartidos del sitio. Toda la data (sucursales, servicios, equipo,
// reseñas, FAQ) debe tipar contra estas interfaces para mantener consistencia
// entre la home y las páginas de detalle.

export interface HorarioDia {
  /** Ej: "Lunes a viernes" */
  dias: string;
  /** Ej: "09:30 - 20:00" o "Cerrado" */
  horas: string;
}

export interface GeoCoords {
  lat: number;
  lng: number;
}

export interface Sucursal {
  slug: string;
  nombre: string;
  /** Comuna o barrio, usado en badges cortos (ej. "Providencia") */
  comuna: string;
  direccion: string;
  ciudad: string;
  region: string;
  codigoPostal?: string;
  telefono: string;
  /** Número en formato internacional sin '+' para wa.me, ej. "56912345678" */
  whatsapp: string;
  referenciaMetro: string;
  horario: HorarioDia[];
  rating: number;
  numeroResenas: number;
  numeroBarberos: number;
  descripcionCorta: string;
  imagenPortada: string;
  imagenPortadaAlt: string;
  galeria: { src: string; alt: string }[];
  geo: GeoCoords;
  fechaApertura: string;
  urlReserva: string;
  destacada?: boolean;
  /** Place ID de Google Maps de esta sucursal (ficha propia) — usado para
   * traer rating/reseñas reales vía lib/google/reviews.ts. Sin esto, esta
   * sucursal no aporta al agregado de reseñas del Hero. */
  googlePlaceId?: string;
}

export type CategoriaServicio = "corte" | "barba" | "combo" | "color" | "spa";

export interface Servicio {
  slug: string;
  nombre: string;
  categoria: CategoriaServicio;
  descripcionCorta: string;
  descripcionLarga: string;
  precioDesde: number;
  moneda: "CLP";
  duracionMinutos: number;
  imagen: string;
  imagenAlt: string;
  incluye: string[];
  insignia?: boolean;
  sucursalesDisponibles: string[];
}

export interface Barbero {
  slug: string;
  nombre: string;
  rol: string;
  sucursalPrincipal: string;
  especialidades: string[];
  anosExperiencia: number;
  foto: string;
  fotoAlt: string;
  instagram?: string;
}

export interface Resena {
  id: string;
  nombreCliente: string;
  /** Ausente en reseñas reales de Google — no tienen equivalente de servicio. */
  servicioConsumido?: string;
  sucursal: string;
  rating: number;
  texto: string;
  fecha: string;
  foto?: string;
  fotoAlt?: string;
}

export interface FAQItem {
  id: string;
  pregunta: string;
  respuesta: string;
}

export interface StatItem {
  id: string;
  valor: string;
  etiqueta: string;
}
