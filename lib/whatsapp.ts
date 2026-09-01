/**
 * Utilidades para construir links de WhatsApp con mensaje prellenado.
 * Centralizado acá para que el número/redacción se actualice en un solo lugar.
 */

import { siteConfig } from "@/data/site";

export function buildWhatsAppLink(numero: string, mensaje: string): string {
  const texto = encodeURIComponent(mensaje);
  return `https://wa.me/${numero}?text=${texto}`;
}

// Los teléfonos que trae Klipper (phone_number de sucursal/organización)
// vienen en formato local, sin código de país (ej. "9 8336 5087"), pero
// wa.me exige el número completo. Este sitio es específicamente para
// negocios en Chile (locale es-CL, moneda CLP, timezone America/Santiago
// en todo el resto del código), así que se asume +56 cuando el número no
// lo trae ya.
export function toWhatsAppNumber(phone: string | null | undefined): string | undefined {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return undefined;
  if (digits.startsWith("56")) return digits;
  return `56${digits}`;
}

// Klipper exige el teléfono de contacto en formato internacional (+56...)
// en el payload de creación de cita — mismo criterio de país que
// toWhatsAppNumber, solo que acá se antepone el "+" en vez de dejarlo en
// puros dígitos (formato que wa.me exige en cambio).
export function toInternationalPhone(phone: string | null | undefined): string {
  const digits = toWhatsAppNumber(phone);
  return digits ? `+${digits}` : (phone ?? "").trim();
}

export function mensajeReservaGenerico(): string {
  return `Hola! Quiero reservar hora en ${siteConfig.nombre}. ¿Me ayudan con la disponibilidad?`;
}

export function mensajeReservaDesdeFormulario(params: {
  nombre: string;
  telefono: string;
  sucursal: string;
  servicio: string;
  fecha: string;
}): string {
  const { nombre, telefono, sucursal, servicio, fecha } = params;
  return [
    `Hola! Quiero reservar hora en ${siteConfig.nombre}.`,
    `Nombre: ${nombre}`,
    `Teléfono de contacto: ${telefono}`,
    `Sucursal: ${sucursal}`,
    `Servicio: ${servicio}`,
    `Fecha/hora preferida: ${fecha}`,
  ].join("\n");
}

export function mensajeReservaSucursal(sucursalNombre: string): string {
  return `Hola! Quiero reservar hora en la sucursal ${sucursalNombre} de ${siteConfig.nombre}.`;
}
