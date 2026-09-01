import type { BookingService } from "@/types/klipper";

interface StepServiceProps {
  services: BookingService[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onNext: () => void;
  onBack?: () => void;
}

const formatCLP = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

function offerBadgeLabel(oferta: NonNullable<BookingService["priceWithOffer"]>): string {
  if (oferta.discount_type === "percentage") return `${String(oferta.discount)}% OFF`;
  return `${formatCLP.format(oferta.discount)} OFF`;
}

export default function StepService({ services, selectedId, onSelect, onNext, onBack }: StepServiceProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium text-neutral-200">Elige tu servicio</h3>
      {/* Scroll interno: con muchos servicios (Klipper puede devolver decenas),
          la lista scrollea sola y el título del paso y los botones de abajo
          quedan siempre visibles, en vez de empujar todo el modal. El padding
          y el margin negativo evitan que el foco/borde de las tarjetas quede
          cortado por el borde del área con overflow. */}
      <div className="-mx-1 max-h-[45vh] overflow-y-auto px-1 flex flex-col gap-2">
        {services.map((service) => {
          const oferta = service.priceWithOffer ?? null;
          const selected = selectedId === service.id;
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onSelect(service.id)}
              className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                selected
                  ? "border-amber-400/60 bg-amber-400/10 text-white"
                  : oferta
                    ? "border-emerald-500/50 bg-emerald-500/10 text-neutral-100 hover:bg-emerald-500/15"
                    : "border-white/10 bg-white/5 text-neutral-200 hover:bg-white/10"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-medium">{service.name}</span>
                {oferta ? (
                  <span className="flex items-baseline gap-1.5">
                    <span className="text-xs text-neutral-500 line-through">
                      {formatCLP.format(service.price)}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400">
                      {formatCLP.format(oferta.price)}
                    </span>
                  </span>
                ) : (
                  <span className="text-xs text-neutral-400">{formatCLP.format(service.price)}</span>
                )}
              </span>
              <span className="mt-0.5 flex items-center gap-2">
                <span className="text-xs text-neutral-400">{service.duration} min</span>
                {oferta && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    <span aria-hidden="true">🏷️</span>
                    {offerBadgeLabel(oferta)}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-neutral-200 transition hover:bg-white/10"
          >
            Atrás
          </button>
        )}
        <button
          type="button"
          disabled={selectedId == null}
          onClick={onNext}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
