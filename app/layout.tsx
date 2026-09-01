import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/data/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.nombre} — Barbería premium en Santiago`,
    template: `%s | ${siteConfig.nombre}`,
  },
  description: siteConfig.descripcion,
  keywords: [
    "barbería",
    "barbería Santiago",
    "corte de pelo hombre",
    "afeitado clásico",
    "barbería Providencia",
    "barbería Las Condes",
    "barbería La Florida",
  ],
  authors: [{ name: siteConfig.nombre }],
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: siteConfig.url,
    siteName: siteConfig.nombre,
    title: `${siteConfig.nombre} — Barbería premium en Santiago`,
    description: siteConfig.descripcion,
    images: [
      {
        url: "https://picsum.photos/seed/barberia-og/1200/630",
        width: 1200,
        height: 630,
        alt: `${siteConfig.nombre} — barbería premium`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.nombre} — Barbería premium en Santiago`,
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
      data-theme="dark"
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
