import type { StatItem } from "@/types";

export const siteConfig = {
  // Al reutilizar esta landing para otro cliente, basta con setear
  // NEXT_PUBLIC_SITE_NAME / NEXT_PUBLIC_SITE_SHORT_NAME en el .env — no hace
  // falta tocar código.
  nombre: process.env.NEXT_PUBLIC_SITE_NAME || "Estudio de Belleza Génesis Silva",
  nombreCorto: process.env.NEXT_PUBLIC_SITE_SHORT_NAME || "Génesis Silva",
  descripcion:
    "Estudio de belleza para mujeres: manicure, pedicure, coloración, tratamientos capilares y faciales, en un espacio cálido y personalizado. Reserva tu hora online.",
  url: "https://www.oficio-barberia.cl",
  whatsappGeneral: "56940713421",
  telefonoGeneral: "+56 9 4071 3421",
  email: "betterbarberclub1@gmail.com",
  instagram: "https://instagram.com/oficio.barberia",
  facebook: "https://www.facebook.com/profile.php?id=100092622857920",
  tiktok: "https://tiktok.com/@better.barber.club1",
  fundacion: "2019",
  horarioGeneral: [
    { dias: "Lunes a viernes", horas: "09:00 - 21:00" },
    { dias: "Sábado", horas: "09:00 - 19:00" },
    { dias: "Domingo", horas: "Cerrado" },
  ],
};

export const navLinks = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/#sucursales", label: "Sucursales" },
  { href: "/#equipo", label: "Equipo" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/#contacto", label: "Contacto" },
];

export const stats: StatItem[] = [
  { id: "rating", valor: "4.9/5", etiqueta: "Calificación promedio" },
  { id: "resenas", valor: "500+", etiqueta: "Reseñas verificadas" },
  { id: "barberos", valor: "6", etiqueta: "Especialistas en belleza" },
  { id: "sucursales", valor: "1", etiqueta: "Estudio en Los Angeles" },
];

export const promo = {
  titulo: "Martes de spa",
  descripcion:
    "Todos los martes, presentando este anuncio, obtienes 20% de descuento en tu spa facial exprés.",
  descuento: "20% OFF",
  sucursalSlug: "estudio",
  condiciones: "Válido solo los martes. No acumulable con otras promociones.",
};

export const experiencia = {
  titulo: "Un espacio pensado para ti",
  parrafos: [
    `${siteConfig.nombreCorto} es un estudio de belleza donde cada detalle está pensado para que te sientas cuidada y a gusto. Tomamos el tiempo que cada servicio necesita, con asesoría personalizada y productos profesionales, para que salgas sintiéndote renovada.`,
    "Nuestro equipo se especializa en realzar tu belleza natural con técnicas actuales y un trato cercano. Reservas online, atención puntual y un ambiente relajado: esa es nuestra manera de entender la belleza.",
  ],
  incluyeTodoServicio: [
    "Diagnóstico y asesoría personalizada antes de empezar",
    "Productos profesionales de grado salón",
    "Bebida de cortesía (café, té o agua)",
    "Ambiente cálido y relajado",
    "Reserva online con atención puntual",
  ],
  imagen: "https://picsum.photos/seed/estudio-belleza-nosotros/1200/1400",
  imagenAlt: `Interior del ${siteConfig.nombreCorto}, un espacio cálido para el cuidado de la belleza`,
};

export const procesoDemo = {
  titulo: "Tu experiencia, paso a paso",
  descripcion:
    "Así cuidamos cada detalle de tu visita, desde que llegas hasta que sales sintiéndote renovada.",
  pasos: [
    "Recepción y diagnóstico personalizado de lo que buscas",
    "Preparación con productos profesionales de grado salón",
    "Realización del servicio con técnicas actuales y precisión",
    "Toques finales, asesoría de mantención y bebida de cortesía",
  ],
  videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  videoPoster: "https://picsum.photos/seed/estudio-belleza-video-poster/1200/700",
  instagramUrl: "https://instagram.com/oficio.barberia",
};
