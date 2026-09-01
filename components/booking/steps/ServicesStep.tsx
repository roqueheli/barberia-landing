"use client";

import { Minus, Plus } from "lucide-react";
import type { Service, SelectedService } from "../types";

interface ServicesStepProps {
  services: Service[];
  selectedServices: SelectedService[];
  onSetQuantity: (serviceId: number, quantity: number) => void;
  onNext: () => void;
  canGoNext: boolean;
}

const formatCLP = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

export default function ServicesStep({
  services,
  selectedServices,
  onSetQuantity,
  onNext,
  canGoNext,
}: ServicesStepProps) {
  function quantityFor(serviceId: number): number {
    return selectedServices.find((s) => s.service.id === serviceId)?.quantity ?? 0;
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium text-foreground">¿Qué servicio(s) quieres agendar?</h3>

      {services.length === 0 ? (
        <p className="text-sm text-foreground-muted">
          Esta sucursal no tiene servicios disponibles para agendar online por ahora.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {services.map((service) => {
            const quantity = quantityFor(service.id);
            return (
              <div
                key={service.id}
                className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                  quantity > 0
                    ? "border-accent/60 bg-accent/10"
                    : "border-border bg-background-elevated"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{service.name}</p>
                  <p className="text-xs text-foreground-muted">
                    {formatCLP.format(service.price)} · {service.duration} min
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Quitar ${service.name}`}
                    disabled={quantity === 0}
                    onClick={() => onSetQuantity(service.id, quantity - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-4 text-center text-sm font-medium text-foreground">{quantity}</span>
                  <button
                    type="button"
                    aria-label={`Agregar ${service.name}`}
                    onClick={() => onSetQuantity(service.id, quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition hover:bg-background"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        disabled={!canGoNext}
        onClick={onNext}
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
      >
        Continuar
      </button>
    </div>
  );
}
