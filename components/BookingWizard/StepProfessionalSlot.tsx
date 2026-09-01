"use client";

import { useEffect, useState } from "react";
import type { KlipperAppointmentDataUser, KlipperWeeklySchedule } from "@/types/klipper";
import { computeSlotsFromCalendar } from "@/lib/klipper/slots";
import { addDaysIso, formatDayLabel, isoDateRange } from "./dateUtils";

function initials(name: string): string {
  const palabras = name.trim().split(/\s+/).filter(Boolean);
  const letras = palabras.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return letras.join("") || "?";
}

export interface SelectedSlot {
  professionalId: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
}

interface StepProfessionalSlotProps {
  mode: "slots" | "manual";
  professionals: KlipperAppointmentDataUser[];
  loading: boolean;
  error: string | null;
  weekStart: string;
  onChangeWeekStart: (nextWeekStart: string) => void;
  selected: SelectedSlot | null;
  onSelect: (slot: SelectedSlot | null) => void;
  timeZoneLabel: string;
  /** Requeridos solo en modo "manual": para calcular horarios reales desde
   * /api/klipper/calendar en vez de pedir fecha/hora a mano. */
  weeklySchedule?: KlipperWeeklySchedule;
  durationMinutes?: number;
  onNext: () => void;
  onBack?: () => void;
}

export default function StepProfessionalSlot({
  mode,
  professionals,
  loading,
  error,
  weekStart,
  onChangeWeekStart,
  selected,
  onSelect,
  timeZoneLabel,
  weeklySchedule,
  durationMinutes,
  onNext,
  onBack,
}: StepProfessionalSlotProps) {
  const [activeProfessionalId, setActiveProfessionalId] = useState<number | null>(
    selected?.professionalId ?? null
  );
  const [activeDay, setActiveDay] = useState<string>(selected?.date ?? weekStart);
  const days = isoDateRange(weekStart, 7);

  const activeProfessional = professionals.find((p) => p.user.id === activeProfessionalId) ?? null;

  // Modo "manual": Klipper no calculó slots server-side (profesional sin
  // role "agent") — se calculan acá cruzando /api/klipper/calendar con el
  // horario de la sucursal (ver lib/klipper/slots.ts).
  const [manualSlots, setManualSlots] = useState<[string, string][]>([]);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  useEffect(() => {
    // No hay nada que resetear acá: effectiveSlots solo lee manualSlots
    // cuando mode === "manual" (más abajo), así que un valor stale de una
    // selección anterior nunca llega a mostrarse fuera de ese caso.
    if (mode !== "manual" || activeProfessionalId == null || !weeklySchedule || !durationMinutes) {
      return;
    }
    // Capturados en constantes locales: TS no propaga el null-check de
    // arriba hacia adentro de la función anidada.
    const professionalId = activeProfessionalId;
    const schedule = weeklySchedule;
    const duration = durationMinutes;
    let cancelled = false;

    async function loadManualSlots() {
      setManualLoading(true);
      setManualError(null);
      try {
        const params = new URLSearchParams({
          user_id: String(professionalId),
          date: activeDay,
          timezone: timeZoneLabel,
        });
        const res = await fetch(`/api/klipper/calendar?${params.toString()}`);
        if (!res.ok) throw new Error("calendar_failed");
        const calendar = await res.json();
        if (cancelled) return;
        const slots = computeSlotsFromCalendar({
          date: activeDay,
          timezone: timeZoneLabel,
          professionalId,
          weeklySchedule: schedule,
          calendar,
          durationMinutes: duration,
        });
        setManualSlots(slots);
      } catch {
        if (!cancelled) setManualError("No pudimos cargar los horarios de este profesional.");
      } finally {
        if (!cancelled) setManualLoading(false);
      }
    }

    loadManualSlots();
    return () => {
      cancelled = true;
    };
  }, [mode, activeProfessionalId, activeDay, timeZoneLabel, weeklySchedule, durationMinutes]);

  const effectiveSlots: [string, string][] =
    mode === "slots" ? (activeProfessional?.available_slots[activeDay] ?? []) : manualSlots;
  const effectiveLoading = mode === "manual" && manualLoading;
  const effectiveError = mode === "manual" ? manualError : null;

  function selectProfessional(id: number) {
    setActiveProfessionalId(id);
    onSelect(null);
  }

  function selectSlot(time: string) {
    if (activeProfessionalId == null) return;
    onSelect({ professionalId: activeProfessionalId, date: activeDay, time });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-medium text-neutral-200">Elige profesional y horario</h3>
        <p className="mt-1 text-xs text-neutral-500">
          Los horarios se muestran en la hora de la sucursal ({timeZoneLabel}), no necesariamente la de tu
          dispositivo.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex flex-col gap-2" aria-busy="true" aria-label="Cargando disponibilidad">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : professionals.length === 0 ? (
        <p className="text-sm text-neutral-400">
          No encontramos profesionales disponibles para esta sucursal/servicio. Escríbenos por WhatsApp y te
          ayudamos a coordinar.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {professionals.map(({ user }) => (
              <button
                key={user.id}
                type="button"
                onClick={() => selectProfessional(user.id)}
                className={`flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 text-xs font-medium transition ${
                  activeProfessionalId === user.id
                    ? "border-amber-400/60 bg-amber-400/10 text-white"
                    : "border-white/10 bg-white/5 text-neutral-200 hover:bg-white/10"
                }`}
              >
                {user.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- foto en vivo de Klipper, dominio de imagen no confirmado para next/image
                  <img
                    src={user.photo_url}
                    alt=""
                    className="h-7 w-7 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-neutral-300"
                  >
                    {initials(user.name)}
                  </span>
                )}
                <span>{user.name}</span>
              </button>
            ))}
          </div>

          {activeProfessionalId != null && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onChangeWeekStart(addDaysIso(weekStart, -7))}
                  className="text-xs text-neutral-400 hover:text-white"
                >
                  ← Semana anterior
                </button>
                <button
                  type="button"
                  onClick={() => onChangeWeekStart(addDaysIso(weekStart, 7))}
                  className="text-xs text-neutral-400 hover:text-white"
                >
                  Semana siguiente →
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {days.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setActiveDay(day)}
                    className={`shrink-0 rounded-lg border px-3 py-2 text-xs capitalize transition ${
                      activeDay === day
                        ? "border-amber-400/60 bg-amber-400/10 text-white"
                        : "border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10"
                    }`}
                  >
                    {formatDayLabel(day)}
                  </button>
                ))}
              </div>

              {effectiveError && (
                <p role="alert" className="text-xs text-red-400">
                  {effectiveError}
                </p>
              )}

              {effectiveLoading ? (
                <div className="flex flex-wrap gap-2" aria-busy="true" aria-label="Cargando horarios">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-9 w-16 animate-pulse rounded-lg bg-white/5" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {effectiveSlots.length === 0 ? (
                    <p className="text-xs text-neutral-500">Sin horarios disponibles este día.</p>
                  ) : (
                    effectiveSlots.map(([start]) => (
                      <button
                        key={start}
                        type="button"
                        onClick={() => selectSlot(start)}
                        className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                          selected?.date === activeDay && selected?.time === start
                            ? "border-amber-400/60 bg-amber-400/10 text-white"
                            : "border-white/10 bg-white/5 text-neutral-200 hover:bg-white/10"
                        }`}
                      >
                        {start}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

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
          disabled={!selected}
          onClick={onNext}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
