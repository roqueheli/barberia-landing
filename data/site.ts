import type { StatItem } from "@/types";

export const siteConfig = {
  // Al reutilizar esta landing para otro cliente, basta con setear
  // NEXT_PUBLIC_SITE_NAME / NEXT_PUBLIC_SITE_SHORT_NAME en el .env — no hace
  // falta tocar código.
  nombre: process.env.NEXT_PUBLIC_SITE_NAME || "Better Barber Club",
  nombreCorto: process.env.NEXT_PUBLIC_SITE_SHORT_NAME || "Better Barber Club",
  descripcion:
    "Barbería premium en Santiago con estándar de servicio de hotel 5 estrellas. Reserva tu hora en Providencia, Las Condes o La Florida.",
  url: "https://www.oficio-barberia.cl",
  whatsappGeneral: "56912345678",
  telefonoGeneral: "+56 2 2345 6789",
  email: "hola@oficio-barberia.cl",
  instagram: "https://instagram.com/oficio.barberia",
  facebook: "https://facebook.com/oficio.barberia",
  tiktok: "https://tiktok.com/@oficio.barberia",
  fundacion: "2019",
  horarioGeneral: [
    { dias: "Lunes a viernes", horas: "09:00 - 21:00" },
    { dias: "Sábado", horas: "09:00 - 19:00" },
    { dias: "Domingo", horas: "10:00 - 15:00 (solo La Florida cerrado)" },
  ],
};

export const navLinks = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/#sucursales", label: "Sucursales" },
  { href: "/#equipo", label: "Equipo" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/#blog", label: "Blog" },
  { href: "/#contacto", label: "Contacto" },
];

export const stats: StatItem[] = [
  { id: "rating", valor: "4.9/5", etiqueta: "Calificación promedio" },
  { id: "resenas", valor: "1.000+", etiqueta: "Reseñas verificadas" },
  { id: "barberos", valor: "18", etiqueta: "Barberos profesionales" },
  { id: "sucursales", valor: "3", etiqueta: "Sucursales en Santiago" },
];

export const promo = {
  titulo: "Martes de estudiante",
  descripcion:
    "Todos los martes, presentando tu credencial de estudiante vigente, obtienes 20% de descuento en corte clásico en nuestra sucursal Vicuña Mackenna.",
  descuento: "20% OFF",
  sucursalSlug: "vicuna-mackenna",
  condiciones: "Válido solo los martes, presentando credencial de estudiante vigente. No acumulable con otras promociones.",
};

export const experiencia = {
  titulo: "Una casa, un oficio, un estándar",
  parrafos: [
    `${siteConfig.nombreCorto} nació en 2019 en un local de 40 metros cuadrados en Providencia, con la idea simple de que ir a cortarse el pelo no tenía por qué sentirse apurado ni impersonal. Hoy, siete años después, seguimos cronometrando cada servicio al minuto para que nunca esperes de más ni sientas que te apuran.`,
    "Cada barbero de la casa pasa por un proceso de formación interno antes de tomar su primera silla, y cada sucursal nueva abre solo cuando podemos garantizar el mismo estándar que el primer local. Eso es lo que llamamos 'servicio de hotel 5 estrellas': previsibilidad, atención al detalle y un ambiente donde te puedes relajar de verdad.",
  ],
  incluyeTodoServicio: [
    "Diagnóstico y asesoría personalizada antes de empezar",
    "Productos profesionales de grado salón",
    "Bebida de cortesía (café, agua o cerveza artesanal)",
    "Toallas calientes en todos los servicios de barba",
    "Repaso de contornos sin costo adicional los 7 días siguientes",
  ],
  imagen: "https://picsum.photos/seed/barberia-nosotros/1200/1400",
  imagenAlt: `Matías Rojas, fundador de ${siteConfig.nombreCorto}, atendiendo a un cliente en el local original de Providencia`,
};

export const procesoDemo = {
  titulo: "El ritual del afeitado clásico, paso a paso",
  descripcion:
    "Grabamos el proceso completo de nuestro servicio insignia para que sepas exactamente qué esperar antes de sentarte en la silla.",
  pasos: [
    "Toallas calientes para abrir el poro y suavizar el vello",
    "Aplicación de aceite y espuma pre-afeitado",
    "Afeitado completo a navaja en el sentido del vello",
    "Toalla fría y masaje facial con bálsamo hidratante",
  ],
  videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  videoPoster: "https://picsum.photos/seed/barberia-video-poster/1200/700",
  instagramUrl: "https://instagram.com/oficio.barberia",
};
