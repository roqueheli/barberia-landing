import type { Servicio } from "@/types";

export const servicios: Servicio[] = [
  {
    slug: "corte-clasico",
    nombre: "Corte clásico",
    categoria: "corte",
    descripcionCorta: "Corte a tijera y máquina, lavado y styling final.",
    descripcionLarga:
      "Diagnóstico de forma de rostro, corte a tijera y máquina según el estilo que busques, lavado con productos profesionales y styling final con los productos de la casa. Incluye repaso de contornos con navaja.",
    precioDesde: 12000,
    moneda: "CLP",
    duracionMinutos: 40,
    imagen: "https://picsum.photos/seed/barberia-servicio-corte/900/700",
    imagenAlt: "Barbero realizando un corte clásico a tijera a un cliente",
    incluye: [
      "Diagnóstico y asesoría de estilo",
      "Corte a tijera y máquina",
      "Lavado con shampoo profesional",
      "Styling final",
    ],
    sucursalesDisponibles: ["vicuna-mackenna", "macul", "walker-martinez"],
  },
  {
    slug: "afeitado-clasico",
    nombre: "Afeitado clásico a navaja",
    categoria: "barba",
    descripcionCorta: "Ritual de toallas calientes, navaja y masaje facial.",
    descripcionLarga:
      "Nuestro servicio insignia: toallas calientes para abrir el poro, aplicación de aceite pre-afeitado, afeitado completo a navaja siguiendo el sentido del vello, toalla fría para cerrar y masaje facial con bálsamo hidratante.",
    precioDesde: 14000,
    moneda: "CLP",
    duracionMinutos: 35,
    imagen: "https://picsum.photos/seed/barberia-servicio-afeitado/900/700",
    imagenAlt: "Barbero aplicando toalla caliente antes de un afeitado clásico a navaja",
    incluye: [
      "Toallas calientes",
      "Aceite pre-afeitado",
      "Afeitado completo a navaja",
      "Masaje facial con bálsamo",
    ],
    insignia: true,
    sucursalesDisponibles: ["vicuna-mackenna", "macul", "walker-martinez"],
  },
  {
    slug: "perfilado-barba",
    nombre: "Perfilado de barba",
    categoria: "barba",
    descripcionCorta: "Diseño y definición de contornos con máquina y navaja.",
    descripcionLarga:
      "Definimos el contorno de tu barba según la estructura de tu rostro, parejamos densidad con máquina y afinamos los bordes con navaja. Cerramos con aceite para barba y peinado final.",
    precioDesde: 9000,
    moneda: "CLP",
    duracionMinutos: 25,
    imagen: "https://picsum.photos/seed/barberia-servicio-barba/900/700",
    imagenAlt: "Barbero perfilando el contorno de una barba con navaja",
    incluye: [
      "Diseño de contorno según rostro",
      "Parejo de densidad",
      "Definición de bordes a navaja",
      "Aceite para barba",
    ],
    sucursalesDisponibles: ["vicuna-mackenna", "macul", "walker-martinez"],
  },
  {
    slug: "combo-corte-barba",
    nombre: "Combo corte + barba",
    categoria: "combo",
    descripcionCorta: "Nuestro combo más pedido: corte completo y perfilado de barba.",
    descripcionLarga:
      "La combinación perfecta para salir listo de todo: corte clásico completo más perfilado de barba en la misma sesión, con lavado y styling incluidos. Ahorra tiempo y precio frente a contratarlos por separado.",
    precioDesde: 19000,
    moneda: "CLP",
    duracionMinutos: 60,
    imagen: "https://picsum.photos/seed/barberia-servicio-combo/900/700",
    imagenAlt: "Cliente recibiendo corte y perfilado de barba en la misma sesión",
    incluye: [
      "Corte clásico completo",
      "Perfilado de barba",
      "Lavado y styling",
      "Precio preferente vs. servicios separados",
    ],
    sucursalesDisponibles: ["vicuna-mackenna", "macul", "walker-martinez"],
  },
  {
    slug: "color-canas",
    nombre: "Coloración y disimulo de canas",
    categoria: "color",
    descripcionCorta: "Tratamiento de color profesional para cabello y barba.",
    descripcionLarga:
      "Aplicación de coloración semipermanente formulada para hombre, pensada para disimular canas de forma natural en cabello y/o barba. Incluye prueba de tono y asesoría de mantención.",
    precioDesde: 22000,
    moneda: "CLP",
    duracionMinutos: 50,
    imagen: "https://picsum.photos/seed/barberia-servicio-color/900/700",
    imagenAlt: "Barbero aplicando tratamiento de color en barba de un cliente",
    incluye: [
      "Prueba de tono",
      "Aplicación de color profesional",
      "Asesoría de mantención",
      "Lavado post-tratamiento",
    ],
    sucursalesDisponibles: ["vicuna-mackenna", "macul", "walker-martinez"],
  },
  {
    slug: "spa-facial",
    nombre: "Spa facial exprés",
    categoria: "spa",
    descripcionCorta: "Limpieza facial profunda, exfoliación y mascarilla.",
    descripcionLarga:
      "Limpieza facial profunda con vapor, exfoliación, extracción suave de puntos negros y mascarilla calmante. Ideal para complementar tu corte o afeitado y salir con la piel renovada.",
    precioDesde: 16000,
    moneda: "CLP",
    duracionMinutos: 30,
    imagen: "https://picsum.photos/seed/barberia-servicio-spa/900/700",
    imagenAlt: "Cliente recibiendo tratamiento facial con mascarilla en camilla",
    incluye: [
      "Limpieza facial con vapor",
      "Exfoliación",
      "Extracción suave de impurezas",
      "Mascarilla calmante",
    ],
    sucursalesDisponibles: ["vicuna-mackenna", "macul", "walker-martinez"],
  },
];

export function getServicioPorSlug(slug: string): Servicio | undefined {
  return servicios.find((s) => s.slug === slug);
}
