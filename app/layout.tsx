import type { Metadata } from "next";
import { Poppins, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/data/site";

// Cuerpo: Poppins (sans suave y moderna). Se expone como --font-geist-sans
// para no tener que renombrar la variable en todo el CSS/tema.
const geistSans = Poppins({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Títulos: Cormorant Garamond (serif elegante de alto contraste, ideal para
// un estudio de belleza). Se expone como --font-playfair, la variable que ya
// usa --font-display en el tema.
const playfair = Cormorant_Garamond({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.nombre} — Estudio de belleza`,
    template: `%s | ${siteConfig.nombre}`,
  },
  description: siteConfig.descripcion,
  keywords: [
    "estudio de belleza",
    "salón de belleza",
    "belleza mujer",
    "manicure",
    "pedicure",
    "coloración",
    "tratamientos capilares",
    "spa facial",
  ],
  authors: [{ name: siteConfig.nombre }],
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: siteConfig.url,
    siteName: siteConfig.nombre,
    title: `${siteConfig.nombre} — Estudio de belleza`,
    description: siteConfig.descripcion,
    images: [
      {
        url: "https://picsum.photos/seed/estudio-belleza-og/1200/630",
        width: 1200,
        height: 630,
        alt: `${siteConfig.nombre} — estudio de belleza`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.nombre} — Estudio de belleza`,
    description: siteConfig.descripcion,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      data-theme="light"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-accent-foreground"
        >
          Saltar al contenido principal
        </a>
        {children}
      </body>
    </html>
  );
}
