"use client";

import { useId } from "react";
import type { ContactInfo } from "../types";

interface ContactStepProps {
  contact: ContactInfo;
  onChange: (contact: ContactInfo) => void;
  onNext: () => void;
  onBack: () => void;
  canGoNext: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Validación liviana en formato internacional (E.164-ish): sin librería extra
// de teléfonos, ya que no está en las dependencias permitidas del proyecto.
const PHONE_RE = /^\+?[1-9]\d{7,14}$/;

export default function ContactStep({ contact, onChange, onNext, onBack, canGoNext }: ContactStepProps) {
  const formId = useId();
  const phoneDigits = contact.phone.replace(/[\s()-]/g, "");
  const emailValid = contact.email.length === 0 || EMAIL_RE.test(contact.email);
  const phoneValid = phoneDigits.length === 0 || PHONE_RE.test(phoneDigits);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium text-foreground">Tus datos de contacto</h3>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${formId}-nombre`} className="text-sm font-medium text-foreground">
            Nombre completo
          </label>
          <input
            id={`${formId}-nombre`}
            type="text"
            autoComplete="name"
            required
            value={contact.name}
            onChange={(e) => onChange({ ...contact, name: e.target.value })}
            placeholder="Ej. Juan Pérez"
            className="rounded-xl border border-border bg-background-elevated px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${formId}-email`} className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id={`${formId}-email`}
            type="email"
            autoComplete="email"
            required
            value={contact.email}
            onChange={(e) => onChange({ ...contact, email: e.target.value })}
            placeholder="juan@example.com"
            className="rounded-xl border border-border bg-background-elevated px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/30"
          />
          {!emailValid && <p className="text-xs text-red-400">Ingresa un email válido.</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${formId}-telefono`} className="text-sm font-medium text-foreground">
            Teléfono (formato internacional)
          </label>
          <input
            id={`${formId}-telefono`}
            type="tel"
            autoComplete="tel"
            required
            value={contact.phone}
            onChange={(e) => onChange({ ...contact, phone: e.target.value })}
            placeholder="+56 9 1234 5678"
            className="rounded-xl border border-border bg-background-elevated px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/30"
          />
          {!phoneValid && <p className="text-xs text-red-400">Ingresa un teléfono válido con código de país.</p>}
        </div>
      </div>

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
          disabled={!canGoNext || !emailValid || !phoneValid}
          onClick={onNext}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
