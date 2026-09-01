"use client";

import momentTz from "moment-timezone";
import { isBranchClosed } from "../helpers";
import type { TimeSlot, WeeklySchedule } from "../types";

interface DateTimeStepProps {
  timezone: string;
  weeklySchedule: WeeklySchedule | undefined;
  date: string;
  onSelectDate: (date: string) => void;
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  loading: boolean;
  error: string | null;
  onNext: () => void;
  onBack: () => void;
  canGoNext: boolean;
}

export default function DateTimeStep({
  timezone,
  weeklySchedule,
  date,
  onSelectDate,
  slots,
  selectedSlot,
  onSelectSlot,
  loading,
  error,
  onNext,
  onBack,
  canGoNext,
}: DateTimeStepProps) {
  const today = momentTz.tz(timezone).format("YYYY-MM-DD");
  const closed = date ? isBranchClosed(date, timezone, weeklySchedule) : false;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-medium text-foreground">Elige fecha y hora</h3>
        <p className="mt-1 text-xs text-foreground-muted">
          Los horarios se muestran en la hora de la sucursal ({timezone}).
        </p>
      </div>

      <input
        type="date"
        min={today}
        value={date}
        onChange={(e) => onSelectDate(e.target.value)}
        className="rounded-xl border border-border bg-background-elevated px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/30"
      />

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      {!date ? null : loading ? (
        <div className="flex flex-col gap-2" aria-busy="true" aria-label="Cargando horarios">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-xl bg-background-elevated" />
          ))}
        </div>
      ) : closed ? (
        <p className="text-sm text-foreground-muted">Esta sucursal no atiende ese día. Elige otra fecha.</p>
      ) : slots.length === 0 ? (
        <p className="text-sm text-foreground-muted">No quedan horarios disponibles ese día. Prueba otra fecha.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {slots.map((slot) => (
            <button
              key={slot.start}
              type="button"
              onClick={() => onSelectSlot(slot)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                selectedSlot?.start === slot.start
                  ? "border-accent/60 bg-accent/10 text-foreground"
                  : "border-border bg-background-elevated text-foreground hover:bg-background"
              }`}
            >
              {slot.start}
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
