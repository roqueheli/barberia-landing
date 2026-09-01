import type { BookingBranch } from "@/types/klipper";

interface StepBranchProps {
  branches: BookingBranch[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onNext: () => void;
}

export default function StepBranch({ branches, selectedId, onSelect, onNext }: StepBranchProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium text-neutral-200">Elige tu sucursal</h3>
      <div className="flex flex-col gap-2">
        {branches.map((branch) => (
          <button
            key={branch.id}
            type="button"
            onClick={() => onSelect(branch.id)}
            className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
              selectedId === branch.id
                ? "border-amber-400/60 bg-amber-400/10 text-white"
                : "border-white/10 bg-white/5 text-neutral-200 hover:bg-white/10"
            }`}
          >
            <span className="block font-medium">{branch.name}</span>
            {branch.address && <span className="block text-xs text-neutral-400">{branch.address}</span>}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={selectedId == null}
        onClick={onNext}
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Continuar
      </button>
    </div>
  );
}
