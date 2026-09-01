"use client";

import { User as UserIcon } from "lucide-react";
import type { User } from "../types";

interface ProfessionalStepProps {
  professionals: User[];
  selected: User | null;
  onSelect: (user: User) => void;
  onNext: () => void;
  onBack: () => void;
  canGoNext: boolean;
}

export default function ProfessionalStep({
  professionals,
  selected,
  onSelect,
  onNext,
  onBack,
  canGoNext,
}: ProfessionalStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium text-foreground">Elige tu profesional</h3>

      {professionals.length === 0 ? (
        <p className="text-sm text-foreground-muted">
          No hay profesionales disponibles para este servicio en esta sucursal. Escríbenos y te ayudamos a
          coordinar.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {professionals.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => onSelect(user)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                selected?.id === user.id
                  ? "border-accent/60 bg-accent/10"
                  : "border-border bg-background-elevated hover:bg-background"
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground-muted">
                <UserIcon className="h-4 w-4" />
              </span>
              <span className="font-medium text-foreground">{user.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-background-elevated"
        >
          Atrás
        </button>
        <button
          type="button"
          disabled={!canGoNext}
          onClick={onNext}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
