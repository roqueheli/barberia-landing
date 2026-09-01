export interface ConfirmSummary {
  branchName: string;
  serviceName: string;
  servicePrice: number;
  professionalName: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
}

interface SubmitError {
  message: string;
}

interface StepConfirmProps {
  summary: ConfirmSummary;
  submitting: boolean;
  error: SubmitError | null;
  whatsappFallbackHref: string | null;
  onSubmit: () => void;
  onBack: () => void;
}

const formatCLP = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

export default function StepConfirm({
  summary,
  submitting,
  error,
  whatsappFallbackHref,
  onSubmit,
  onBack,
}: StepConfirmProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium text-neutral-200">Confirma tu reserva</h3>

      <dl className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-neutral-200">
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-400">Sucursal</dt>
          <dd className="text-right">{summary.branchName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-400">Servicio</dt>
          <dd className="text-right">
            {summary.serviceName} · {formatCLP.format(summary.servicePrice)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-400">Profesional</dt>
          <dd className="text-right">{summary.professionalName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-400">Fecha y hora</dt>
          <dd className="text-right">
            {summary.date} · {summary.time}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-400">Contacto</dt>
          <dd className="text-right">
            {summary.name}
            <br />
            {summary.email}
            <br />
            {summary.phone}
          </dd>
        </div>
      </dl>

      {error && (
        <div role="alert" className="flex flex-col gap-2 rounded-xl border border-red-400/30 bg-red-400/10 p-3">
          <p className="text-sm text-red-300">{error.message}</p>
          {whatsappFallbackHref && (
            <a
              href={whatsappFallbackHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-amber-300 underline underline-offset-2"
            >
              O escríbenos directo por WhatsApp
            </a>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-neutral-200 transition hover:bg-white/10 disabled:opacity-50"
        >
          Atrás
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={onSubmit}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Agendando…" : "Agendar cita"}
        </button>
      </div>
    </div>
  );
}
