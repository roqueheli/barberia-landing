"use client";

import { useId } from "react";
import { siteConfig } from "@/data/site";

export interface ContactData {
  name: string;
  email: string;
  phone: string;
  consent: boolean;
}

interface StepContactProps {
  data: ContactData;
  onChange: (data: ContactData) => void;
  requireConsent: boolean;
  onNext: () => void;
  onBack: () => void;
}

export default function StepContact({ data, onChange, requireConsent, onNext, onBack }: StepContactProps) {
  const formId = useId();
  const isValid =
    data.name.trim().length > 0 &&
    data.email.trim().length > 0 &&
    data.phone.trim().length > 0 &&
    (!requireConsent || data.consent);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium text-neutral-200">Tus datos de contacto</h3>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${formId}-nombre`} className="text-sm font-medium text-neutral-200">
            Nombre completo
          </label>
          <input
            id={`${formId}-nombre`}
            type="text"
            autoComplete="name"
            required
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="Ej. Juan Pérez"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/30"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${formId}-email`} className="text-sm font-medium text-neutral-200">
            Email
          </label>
          <input
            id={`${formId}-email`}
            type="email"
            autoComplete="email"
            required
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            placeholder="juan@example.com"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/30"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${formId}-telefono`} className="text-sm font-medium text-neutral-200">
            Teléfono de contacto
          </label>
          <input
            id={`${formId}-telefono`}
            type="tel"
            autoComplete="tel"
            required
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            placeholder="+56 9 1234 5678"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/30"
          />
        </div>

        {requireConsent && (
          <label className="flex items-start gap-2 text-xs text-neutral-400">
            <input
              type="checkbox"
              checked={data.consent}
              onChange={(e) => onChange({ ...data, consent: e.target.checked })}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5"
            />
            <span>
              Acepto que {siteConfig.nombre} use mis datos de contacto para confirmar y recordarme esta cita.
            </span>
          </label>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-neutral-200 transition hover:bg-white/10"
        >
          Atrás
        </button>
        <button
          type="button"
          disabled={!isValid}
          onClick={onNext}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
