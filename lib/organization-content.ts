// Fusiona los datos reales de Klipper (organización, sucursales, servicios,
// profesionales) con el copy de marketing curado localmente (data/*.ts):
// los hechos (nombre, dirección, teléfono, geo, precio, duración, foto)
// siempre vienen en vivo cuando hay match; el copy que Klipper no entrega
// (galería, rating, "incluye", horario, bios) se mantiene curado. Puro y
// sin dependencias de Next/React aparte del tipo de entrada — fácil de
// testear. No lanza: ante datos en vivo ausentes (org sin configurar,
// Klipper caído), cada merge* degrada al contenido curado tal cual está
// hoy en producción.
import type { GeoCoords, HorarioDia, Sucursal, Servicio, Barbero } from "@/types";
import type { MarketingBranch, MarketingService, KlipperProfessionalPublic } from "@/types/klipper";
import type { PriceWithOffer } from "@/types/offer";
import type { OrganizationContent } from "./klipper/organization";
import { getOrganizationContent } from "./klipper/organization";
import { toWhatsAppNumber } from "./whatsapp";
import { matchByName, normalizeForMatch } from "./match-by-name";
import { weeklyScheduleToHorario } from "./klipper/schedule";

export interface SucursalView {
  slug: string;
  nombre: string;
  direccion: string;
  telefono: string;
  whatsapp?: string;
  geo?: GeoCoords;
  /** Link a Google Maps: el real de Klipper si está disponible, si no se
   * construye desde `geo` — nunca inventa una dirección sin geo/URL real. */
  mapsUrl?: string;
  comuna?: string;
  ciudad?: string;
  region?: string;
  codigoPostal?: string;
  referenciaMetro?: string;
  horario: HorarioDia[];
  rating?: number;
  numeroResenas?: number;
  numeroBarberos?: number;
  descripcionCorta?: string;
  imagenPortada?: string;
  /** true si `imagenPortada` viene de photo_url en vivo (dominio no
   * confirmado — no renderizar con next/image sin agregarlo a
   * remotePatterns; usar <img> como en EquipoSection). */
  imagenPortadaEnVivo: boolean;
  imagenPortadaAlt?: string;
  galeria: { src: string; alt: string }[];
  fechaApertura?: string;
  urlReserva?: string;
  destacada?: boolean;
  klipperBranchId?: number;
  /** Place ID de Google Maps de esta sucursal — Klipper ya lo trae por
   * sucursal (verificado contra la respuesta real), así que viene en vivo
   * con fallback a lo curado. Usado por lib/google/reviews.ts para pedir
   * el contenido de reseñas reales a la Places API de Google (rating y
   * numeroResenas YA vienen de Klipper directo, sin llamar a Google). */
  googlePlaceId?: string;
  enVivo: boolean;
}

export interface ServicioView {
  slug: string;
  nombre: string;
  categoria?: Servicio["categoria"];
  descripcionCorta?: string;
  descripcionLarga?: string;
  precioDesde: number;
  moneda: "CLP";
  duracionMinutos: number;
  imagen?: string;
  /** true si `imagen` viene de photo_url en vivo (mismo motivo que
   * SucursalView.imagenPortadaEnVivo). */
  imagenEnVivo: boolean;
  imagenAlt?: string;
  incluye: string[];
  insignia?: boolean;
  sucursalesDisponibles: string[];
  klipperServiceId?: number;
  /** business_type_id de Klipper (categoría), o null. Para filtrar por tipo. */
  businessTypeId?: number | null;
  /** Overlay de oferta ya resuelto por Klipper (precio rebajado + metadatos),
   * o null/undefined si el servicio no tiene oferta aplicable. El front solo
   * lo pinta; nunca calcula el descuento. */
  priceWithOffer?: PriceWithOffer | null;
  enVivo: boolean;
}

export interface BarberoView {
  slug: string;
  nombre: string;
  rol: string;
  sucursalPrincipal?: string;
  especialidades: string[];
  anosExperiencia?: number;
  foto?: string;
  /** true si `foto` viene de photo_url en vivo (dominio no confirmado —
   * no renderizar con next/image sin agregarlo a remotePatterns). */
  fotoEnVivo: boolean;
  fotoAlt: string;
  instagram?: string;
  klipperProfessionalId?: number;
  enVivo: boolean;
}

export { normalizeForMatch, matchByName } from "./match-by-name";

function slugify(value: string): string {
  return normalizeForMatch(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Para registros en vivo sin match curado: el slug generado desde el
// nombre puede colisionar (dos profesionales con el mismo nombre, dos
// servicios con nombre parecido tras normalizar) — el id de Klipper es
// siempre único, así que se agrega como sufijo para garantizar unicidad.
// Estos slugs nunca quedan expuestos en una URL con página propia (las
// páginas de detalle solo existen para slugs curados), así que no importa
// que sean menos prolijos.
function uniqueFallbackSlug(name: string, id: number): string {
  return `${slugify(name)}-${id}`;
}

function branchGeo(branch: MarketingBranch): GeoCoords | undefined {
  if (branch.latitude == null || branch.longitude == null) return undefined;
  return { lat: branch.latitude, lng: branch.longitude };
}

// Horario en vivo de Klipper convertido a HorarioDia[], o undefined si no
// hay schedule — así el merge con `??` puede caer al horario curado.
function liveHorario(branch: MarketingBranch): HorarioDia[] | undefined {
  const horario = weeklyScheduleToHorario(branch.weeklySchedule);
  return horario.length > 0 ? horario : undefined;
}

// Fallback cuando no hay google_maps_url real: un link de búsqueda de Google
// Maps por coordenadas (no requiere API key y siempre resuelve al punto
// exacto) — nunca se inventa una URL sin geo real detrás.
function mapsUrlFromGeo(geo: GeoCoords | undefined): string | undefined {
  if (!geo) return undefined;
  return `https://www.google.com/maps/search/?api=1&query=${geo.lat},${geo.lng}`;
}

function mergeOneSucursal(branch: MarketingBranch, curated: Sucursal | undefined): SucursalView {
  if (!curated) {
    // Sucursal real en Klipper sin curación local: se muestra igual, con
    // solo los hechos que Klipper entrega — nunca se inventa copy.
    return {
      slug: uniqueFallbackSlug(branch.name, branch.id),
      nombre: branch.name,
      direccion: branch.address ?? "",
      telefono: branch.phone ?? "",
      whatsapp: toWhatsAppNumber(branch.phone),
      geo: branchGeo(branch),
      mapsUrl: branch.googleMapsUrl ?? mapsUrlFromGeo(branchGeo(branch)),
      comuna: branch.comuna ?? undefined,
      ciudad: branch.ciudad ?? undefined,
      horario: weeklyScheduleToHorario(branch.weeklySchedule),
      descripcionCorta: undefined,
      imagenPortada: branch.photoUrl ?? undefined,
      imagenPortadaEnVivo: branch.photoUrl != null,
      imagenPortadaAlt: branch.photoUrl ? `Fachada de ${branch.name}` : undefined,
      galeria: [],
      klipperBranchId: branch.id,
      rating: branch.googleRating ?? undefined,
      numeroResenas: branch.googleReviewCount ?? undefined,
      googlePlaceId: branch.googlePlaceId ?? undefined,
      enVivo: true,
    };
  }
  return {
    slug: curated.slug,
    nombre: branch.name,
    direccion: branch.address ?? curated.direccion,
    telefono: branch.phone ?? curated.telefono,
    whatsapp: toWhatsAppNumber(branch.phone) ?? curated.whatsapp,
    geo: branchGeo(branch) ?? curated.geo,
    mapsUrl: branch.googleMapsUrl ?? mapsUrlFromGeo(branchGeo(branch) ?? curated.geo),
    comuna: branch.comuna ?? curated.comuna,
    ciudad: branch.ciudad ?? curated.ciudad,
    region: curated.region,
    codigoPostal: curated.codigoPostal,
    referenciaMetro: curated.referenciaMetro,
    // Horario real de Klipper (weekly_schedule) con prioridad; cae al curado
    // solo si Klipper no trae horario para esta sucursal.
    horario: liveHorario(branch) ?? curated.horario,
    rating: branch.googleRating ?? curated.rating,
    numeroResenas: branch.googleReviewCount ?? curated.numeroResenas,
    numeroBarberos: curated.numeroBarberos,
    googlePlaceId: branch.googlePlaceId ?? curated.googlePlaceId,
    descripcionCorta: curated.descripcionCorta,
    imagenPortada: branch.photoUrl ?? curated.imagenPortada,
    imagenPortadaEnVivo: branch.photoUrl != null,
    imagenPortadaAlt: branch.photoUrl ? `Fachada de ${branch.name}` : curated.imagenPortadaAlt,
    galeria: curated.galeria,
    fechaApertura: curated.fechaApertura,
    urlReserva: curated.urlReserva,
    destacada: curated.destacada,
    klipperBranchId: branch.id,
    enVivo: true,
  };
}

function curatedSucursalView(s: Sucursal): SucursalView {
  return { ...s, mapsUrl: mapsUrlFromGeo(s.geo), imagenPortadaEnVivo: false, enVivo: false };
}

export function mergeSucursales(
  liveBranches: MarketingBranch[] | null,
  curated: Sucursal[]
): SucursalView[] {
  if (liveBranches == null) {
    return curated.map(curatedSucursalView);
  }

  const usedCuratedSlugs = new Set<string>();
  return liveBranches.map((branch) => {
    const curatedMatch = curated.find(
      (s) => !usedCuratedSlugs.has(s.slug) && matchByName(s.nombre, s.slug, [branch])
    );
    if (curatedMatch) usedCuratedSlugs.add(curatedMatch.slug);
    return mergeOneSucursal(branch, curatedMatch);
  });
}

// Rating/reseñas agregados de todo el negocio para el Hero, a partir del
// rating/numeroResenas YA resuelto por sucursal (branch.googleRating/
// googleReviewCount cuando Klipper lo trae, si no lo curado). Promedio
// ponderado por cantidad de reseñas de cada sucursal — más correcto que
// un promedio plano cuando las sucursales tienen volúmenes muy distintos.
export function aggregateBranchRatings(
  sucursalesView: SucursalView[]
): { rating: number | null; totalResenas: number | null } {
  let weightedSum = 0;
  let weightTotal = 0;
  let totalResenas = 0;
  let hasAnyCount = false;

  for (const s of sucursalesView) {
    if (s.rating != null && s.numeroResenas != null) {
      weightedSum += s.rating * s.numeroResenas;
      weightTotal += s.numeroResenas;
    }
    if (s.numeroResenas != null) {
      totalResenas += s.numeroResenas;
      hasAnyCount = true;
    }
  }

  return {
    rating: weightTotal > 0 ? weightedSum / weightTotal : null,
    totalResenas: hasAnyCount ? totalResenas : null,
  };
}

function mergeOneServicio(service: MarketingService, curated: Servicio | undefined): ServicioView {
  if (!curated) {
    return {
      slug: uniqueFallbackSlug(service.name, service.id),
      nombre: service.name,
      descripcionCorta: service.description ?? undefined,
      precioDesde: service.price,
      moneda: "CLP",
      duracionMinutos: service.duration,
      imagen: service.photoUrl ?? undefined,
      imagenEnVivo: service.photoUrl != null,
      imagenAlt: service.photoUrl ? service.name : undefined,
      incluye: [],
      sucursalesDisponibles: [],
      klipperServiceId: service.id,
      enVivo: true,
    };
  }
  return {
    slug: curated.slug,
    nombre: service.name,
    categoria: curated.categoria,
    descripcionCorta: service.description ?? curated.descripcionCorta,
    descripcionLarga: curated.descripcionLarga,
    precioDesde: service.price,
    moneda: "CLP",
    duracionMinutos: service.duration,
    imagen: service.photoUrl ?? curated.imagen,
    imagenEnVivo: service.photoUrl != null,
    imagenAlt: service.photoUrl ? service.name : curated.imagenAlt,
    incluye: curated.incluye,
    insignia: curated.insignia,
    sucursalesDisponibles: curated.sucursalesDisponibles,
    klipperServiceId: service.id,
    enVivo: true,
  };
}

function curatedServicioView(s: Servicio): ServicioView {
  return { ...s, imagenEnVivo: false, enVivo: false };
}

// Construye un ServicioView usando SOLO lo que devuelve Klipper, sin mezclar
// copy curado. El slug es determinista (nombre + id de Klipper), así la card
// de la home y la página de detalle resuelven el mismo servicio sin volver a
// consultar la API por id — el detalle se arma con el objeto que ya vino en
// landing_by_slug.
function liveServicioView(service: MarketingService): ServicioView {
  return {
    slug: uniqueFallbackSlug(service.name, service.id),
    nombre: service.name,
    descripcionCorta: service.description ?? undefined,
    descripcionLarga: service.description ?? undefined,
    precioDesde: service.price,
    moneda: "CLP",
    duracionMinutos: service.duration,
    imagen: service.photoUrl ?? undefined,
    imagenEnVivo: service.photoUrl != null,
    imagenAlt: service.photoUrl ? service.name : undefined,
    incluye: [],
    sucursalesDisponibles: [],
    klipperServiceId: service.id,
    businessTypeId: service.businessTypeId,
    priceWithOffer: service.priceWithOffer,
    enVivo: true,
  };
}

// Lista de servicios SOLO desde Klipper. Devuelve [] si no hay datos en vivo
// (org sin configurar o Klipper caído) — a diferencia de mergeServicios, acá
// nunca se cae al contenido curado, porque el requerimiento es mostrar
// exclusivamente lo que responde Klipper.
export function liveServicios(liveServices: MarketingService[] | null): ServicioView[] {
  if (liveServices == null) return [];
  return liveServices.map(liveServicioView);
}

export function mergeServicios(
  liveServices: MarketingService[] | null,
  curated: Servicio[]
): ServicioView[] {
  if (liveServices == null) {
    return curated.map(curatedServicioView);
  }

  const usedCuratedSlugs = new Set<string>();
  return liveServices.map((service) => {
    const curatedMatch = curated.find(
      (s) => !usedCuratedSlugs.has(s.slug) && matchByName(s.nombre, s.slug, [service])
    );
    if (curatedMatch) usedCuratedSlugs.add(curatedMatch.slug);
    return mergeOneServicio(service, curatedMatch);
  });
}

function curatedBarberoView(b: Barbero): BarberoView {
  return { ...b, fotoEnVivo: false, enVivo: false };
}

export function mergeEquipo(
  liveProfessionals: KlipperProfessionalPublic[] | null,
  curated: Barbero[]
): BarberoView[] {
  if (liveProfessionals == null) {
    return curated.map(curatedBarberoView);
  }

  const usedCuratedSlugs = new Set<string>();
  const merged: BarberoView[] = [];

  for (const professional of liveProfessionals) {
    const curatedMatch = curated.find(
      (b) => !usedCuratedSlugs.has(b.slug) && matchByName(b.nombre, b.slug, [{ name: professional.name }])
    );

    if (curatedMatch) {
      usedCuratedSlugs.add(curatedMatch.slug);
      merged.push({
        slug: curatedMatch.slug,
        nombre: professional.name,
        rol: professional.role_name ?? curatedMatch.rol,
        sucursalPrincipal: curatedMatch.sucursalPrincipal,
        especialidades: curatedMatch.especialidades,
        anosExperiencia: curatedMatch.anosExperiencia,
        foto: professional.photo_url ?? curatedMatch.foto,
        fotoEnVivo: professional.photo_url != null,
        fotoAlt: curatedMatch.fotoAlt,
        instagram: curatedMatch.instagram,
        klipperProfessionalId: professional.id,
        enVivo: true,
      });
    } else {
      // Sin curación local: se muestra igual (con avatar placeholder si
      // Klipper no trae foto) — nunca se deja la grilla del equipo vacía
      // solo porque el profesional real no tiene foto cargada todavía.
      merged.push({
        slug: uniqueFallbackSlug(professional.name, professional.id),
        nombre: professional.name,
        rol: professional.role_name ?? "Barbero",
        especialidades: [],
        foto: professional.photo_url ?? undefined,
        fotoEnVivo: professional.photo_url != null,
        fotoAlt: `Retrato de ${professional.name}`,
        klipperProfessionalId: professional.id,
        enVivo: true,
      });
    }
  }

  return merged;
}

export async function getSucursalView(slug: string, curated: Sucursal[]): Promise<SucursalView | null> {
  const curatedMatch = curated.find((s) => s.slug === slug);
  if (!curatedMatch) return null;

  const content = await getOrganizationContent();
  if (!content) return curatedSucursalView(curatedMatch);

  const liveMatch = matchByName(curatedMatch.nombre, curatedMatch.slug, content.branches);
  return liveMatch ? mergeOneSucursal(liveMatch, curatedMatch) : curatedSucursalView(curatedMatch);
}

export async function getServicioView(slug: string, curated: Servicio[]): Promise<ServicioView | null> {
  const curatedMatch = curated.find((s) => s.slug === slug);
  if (!curatedMatch) return null;

  const content = await getOrganizationContent();
  if (!content) return curatedServicioView(curatedMatch);

  const liveMatch = matchByName(curatedMatch.nombre, curatedMatch.slug, content.services);
  return liveMatch ? mergeOneServicio(liveMatch, curatedMatch) : curatedServicioView(curatedMatch);
}

// Resuelve el detalle de un servicio SOLO desde Klipper, por slug, sin volver
// a consultar la API por id: reusa el landing ya cacheado (getOrganizationContent)
// y busca el servicio cuyo slug determinista coincide. Devuelve null si no
// hay datos en vivo o el slug no corresponde a ningún servicio de Klipper.
export async function getLiveServicioView(slug: string): Promise<ServicioView | null> {
  const content = await getOrganizationContent();
  if (!content) return null;
  return liveServicios(content.services).find((s) => s.slug === slug) ?? null;
}

export type { OrganizationContent };
