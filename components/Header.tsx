"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { navLinks, siteConfig } from "@/data/site";
import ReservarButton from "@/components/ReservarButton";
import type { Logo } from "@/lib/branding";

export default function Header({ logo }: { logo: Logo }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-colors duration-300 ${
        scrolled
          ? "border-white/10 bg-background/85 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/#inicio" className="flex items-center" aria-label={siteConfig.nombreCorto}>
          {logo.url ? (
            logo.enVivo ? (
              // eslint-disable-next-line @next/next/no-img-element -- logo en vivo de Klipper, dominio de imagen no confirmado para next/image
              <img
                src={logo.url}
                alt={logo.alt ?? siteConfig.nombreCorto}
                className="h-14 w-auto object-contain sm:h-16"
              />
            ) : (
              <Image
                src={logo.url}
                alt={logo.alt ?? siteConfig.nombreCorto}
                width={256}
                height={64}
                priority
                className="h-14 w-auto object-contain sm:h-16"
              />
            )
          ) : (
            <span className="font-display text-xl font-bold tracking-wide text-white sm:text-2xl">
              {siteConfig.nombreCorto}
            </span>
          )}
        </Link>

        <nav aria-label="Navegación principal" className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-neutral-300 transition-colors hover:text-accent"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <ReservarButton
            analyticsSource="header-desktop"
            className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Reservar hora
          </ReservarButton>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white lg:hidden"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`overflow-hidden border-t border-white/10 bg-background/98 backdrop-blur-md transition-[max-height] duration-300 ease-in-out lg:hidden ${
          menuOpen ? "max-h-[28rem]" : "max-h-0"
        }`}
      >
        <nav aria-label="Navegación mobile" className="flex flex-col gap-1 px-4 py-4 sm:px-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3 text-base font-medium text-neutral-200 transition hover:bg-white/5 hover:text-accent"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-2 px-3">
            <ReservarButton
              analyticsSource="header-mobile"
              className="inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-strong"
            >
              Reservar hora
            </ReservarButton>
          </div>
        </nav>
      </div>
    </header>
  );
}
