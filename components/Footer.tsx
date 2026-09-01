import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/data/site";
import { sucursales } from "@/data/sucursales";
import { getOrganizationContent } from "@/lib/klipper/organization";
import { mergeSucursales, liveServicios } from "@/lib/organization-content";
import { getBranding } from "@/lib/branding";

export default async function Footer() {
  const year = new Date().getFullYear();
  const content = await getOrganizationContent();
  const sucursalesView = mergeSucursales(content?.branches ?? null, sucursales);
  const serviciosView = liveServicios(content?.services ?? null);
  const { logo, instagramUrl } = await getBranding();

  return (
    <footer className="border-t border-white/10 bg-background-elevated/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            {logo.url ? (
              logo.enVivo ? (
                // eslint-disable-next-line @next/next/no-img-element -- logo en vivo de Klipper, dominio de imagen no confirmado para next/image
                <img
                  src={logo.url}
                  alt={logo.alt ?? siteConfig.nombreCorto}
                  className="h-9 w-auto object-contain"
                />
              ) : (
                <Image
                  src={logo.url}
                  alt={logo.alt ?? siteConfig.nombreCorto}
                  width={160}
                  height={40}
                  className="h-9 w-auto object-contain"
                />
              )
            ) : (
              <p className="font-display text-2xl font-bold text-white">{siteConfig.nombreCorto}</p>
            )}
            <p className="mt-3 max-w-sm text-sm text-neutral-400">{siteConfig.descripcion}</p>

            <div className="mt-6 flex items-center gap-4">
              <SocialLink href={instagramUrl} label="Instagram">
                <InstagramIcon />
              </SocialLink>
              <SocialLink href={siteConfig.facebook} label="Facebook">
                <FacebookIcon />
              </SocialLink>
              <SocialLink href={siteConfig.tiktok} label="TikTok">
                <TikTokIcon />
              </SocialLink>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
              Sucursales
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {sucursalesView.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/sucursales/${s.slug}`}
                    className="text-sm text-neutral-300 transition hover:text-accent"
                  >
                    {s.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
              Servicios
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {serviciosView.slice(0, 5).map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/servicios/${s.slug}`}
                    className="text-sm text-neutral-300 transition hover:text-accent"
                  >
                    {s.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
              Contacto
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-neutral-300">
              <li>{siteConfig.telefonoGeneral}</li>
              <li>{siteConfig.email}</li>
            </ul>

            <h3 className="mt-6 text-sm font-semibold uppercase tracking-widest text-neutral-500">
              Horario general
            </h3>
            <ul className="mt-3 flex flex-col gap-1.5 text-sm text-neutral-400">
              {siteConfig.horarioGeneral.map((h) => (
                <li key={h.dias}>
                  {h.dias}: {h.horas}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-neutral-500">
            © {year} {siteConfig.nombre}. Todos los derechos reservados.
          </p>
          <p className="text-xs text-neutral-600">
            Fundada en {siteConfig.fundacion} · Santiago, Chile
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-neutral-300 transition hover:border-accent/50 hover:text-accent"
    >
      {children}
    </a>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.7}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
      <path d="M13.5 21v-7.4h2.5l.4-2.9h-2.9V8.8c0-.85.24-1.43 1.46-1.43h1.56V4.77C16.2 4.7 15.3 4.6 14.24 4.6c-2.2 0-3.7 1.34-3.7 3.8v2.3H8v2.9h2.54V21h2.96Z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
      <path d="M16.6 3c.4 2.2 1.9 3.9 4.4 4.1v2.7c-1.5 0-2.9-.5-4-1.3v6.4c0 3.2-2.6 5.6-5.7 5.6-3.2 0-5.7-2.5-5.7-5.6 0-3.1 2.6-5.6 5.7-5.6.3 0 .6 0 .9.1v2.8a3 3 0 0 0-.9-.1 2.9 2.9 0 1 0 2.9 2.9V3h2.4Z" />
    </svg>
  );
}
