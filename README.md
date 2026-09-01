# Better Barber Club — Landing page

Landing page de una sola página (single-page scroll) para una barbería premium
con múltiples sucursales, construida con Next.js 14+ (App Router),
TypeScript estricto y Tailwind CSS. Optimizada para conversión: reservar hora
o escribir por WhatsApp en menos de 30 segundos.

## Empezar

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). El build de producción
(`npm run build`) requiere acceso a internet para descargar las fuentes de
Google Fonts (Geist y Playfair Display) la primera vez.

## Cómo actualizar el contenido

Todo el contenido del sitio vive en archivos tipados dentro de `/data`, para
que puedas actualizar precios, sucursales o el equipo sin tocar componentes:

- `data/site.ts` — nombre de marca, WhatsApp general, redes sociales, stats
  del hero, promoción destacada y el bloque "Sobre la experiencia".
- `data/sucursales.ts` — una entrada por sucursal (dirección, horario,
  rating, galería, coordenadas para el JSON-LD, etc).
- `data/servicios.ts` — catálogo de servicios con precio, duración e incluye.
- `data/equipo.ts` — barberos y barberas del equipo.
- `data/resenas.ts` — testimonios destacados.
- `data/faq.ts` — preguntas frecuentes del acordeón.

Cada archivo tipa contra las interfaces en `/types/index.ts`
(`Sucursal`, `Servicio`, `Barbero`, `Resena`, `FAQItem`, `StatItem`), así que
el editor te va a avisar si falta un campo obligatorio.

Las imágenes de ejemplo usan `picsum.photos` como placeholder. Reemplázalas
por tus propias fotos (ideal: subirlas a `/public` o a tu proveedor de
imágenes) y actualiza `next.config.ts` → `images.remotePatterns` si usas un
dominio externo distinto.

## Estructura del proyecto

```
app/
  page.tsx                 → home: ensambla las 14 secciones del brief
  layout.tsx                → fuentes, metadata global, Header/Footer/WhatsApp
  sitemap.ts / robots.ts    → SEO generado con la Metadata API
  sucursales/[slug]/        → página de detalle por sucursal (JSON-LD BarberShop)
  servicios/[slug]/         → página de detalle por servicio
components/                → Header, Hero, cards, FAQAccordion, BookingForm, etc.
data/                      → contenido tipado (ver arriba)
types/                     → interfaces TypeScript compartidas
lib/                       → helpers de WhatsApp y de JSON-LD
```

## Formulario de reserva

`components/BookingForm.tsx` es un formulario propio (nombre, teléfono,
sucursal, servicio, fecha) que hoy arma un mensaje prellenado y redirige a
WhatsApp (`lib/whatsapp.ts`). Está pensado para conectarse a un backend real:
basta con reemplazar el `handleSubmit` por un `fetch` a tu API de reservas.
Se abre desde cualquier botón "Reservar hora" a través del contexto
`useBooking()` (`components/BookingProvider.tsx`).

## Modo claro/oscuro

El tema por defecto es oscuro. Las variables de color viven en
`app/globals.css` bajo `:root` / `[data-theme="dark"]` y `[data-theme="light"]`.
Para agregar un toggle, basta con alternar el atributo `data-theme` en el
`<html>` (ver `app/layout.tsx`).

## Analytics

Los botones de conversión (Reservar, WhatsApp, ver servicios, etc.) llevan
atributos `data-analytics-event` y `data-analytics-source` listos para
conectar Google Analytics, Plausible o cualquier tracker por delegación de
eventos (`document.addEventListener("click", ...)`).

## Accesibilidad y SEO

- Acordeón de FAQ con roles ARIA (`aria-expanded`, `aria-controls`, `region`).
- `alt` descriptivo en todas las imágenes.
- Navegación completa por teclado y `focus-visible` en elementos interactivos.
- `prefers-reduced-motion` respetado (animaciones y scroll suave se desactivan).
- Metadata por página con la Metadata API de Next.js.
- JSON-LD `BarberShop` por sucursal + `Organization` global.
- `sitemap.xml` y `robots.txt` generados automáticamente desde `/data`.
