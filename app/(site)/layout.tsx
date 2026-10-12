import { Toaster } from "react-hot-toast";
import BookingProvider from "@/components/BookingProvider";
import WhatsAppButton from "@/components/WhatsAppButton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getBranding } from "@/lib/branding";
import { getAllSucursalesView } from "@/lib/organization-content";
import { sucursales } from "@/data/sucursales";

// Chrome del sitio de marketing (header/footer/booking/toaster). Vive en
// este grupo de rutas y no en app/layout.tsx (raíz) para que /studio, que
// sí cuelga de la raíz, no herede este header/footer — Sanity Studio
// necesita control del viewport completo.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [{ logo }, sucursalesView] = await Promise.all([
    getBranding(),
    getAllSucursalesView(sucursales),
  ]);

  return (
    <BookingProvider sucursales={sucursalesView}>
      <Header logo={logo} />
      {children}
      <Footer />
      <WhatsAppButton />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "var(--color-bg-elevated)",
            color: "var(--color-fg)",
            border: "1px solid var(--color-border)",
          },
        }}
      />
    </BookingProvider>
  );
}
