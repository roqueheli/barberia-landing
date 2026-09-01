// Matching de nombres puro, sin dependencias de servidor — separado de
// lib/organization-content.ts para poder importarlo también desde
// componentes cliente (ese otro módulo reexporta getOrganizationContent,
// que trae "server-only" y rompe el build si se importa desde el cliente).
const COMBINING_DIACRITICS = /[\u0300-\u036f]/g;

export function normalizeForMatch(value: string): string {
  return value
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Empareja un nombre+slug curado con un registro en vivo por coincidencia
 * de nombre normalizado — no hay un id compartido entre el contenido
 * curado y Klipper (este sitio es una plantilla reutilizable por cliente,
 * no se puede asumir ningún id fijo de antemano). Best-effort, misma idea
 * que components/booking/helpers.ts:matchBranchByName.
 */
export function matchByName<T extends { name: string }>(
  nombre: string,
  slug: string,
  liveItems: T[]
): T | null {
  const target = normalizeForMatch(nombre);
  const slugFragment = normalizeForMatch(slug.replace(/-/g, " "));
  return (
    liveItems.find((item) => {
      const liveName = normalizeForMatch(item.name);
      return target.includes(liveName) || liveName.includes(slugFragment);
    }) ?? null
  );
}
