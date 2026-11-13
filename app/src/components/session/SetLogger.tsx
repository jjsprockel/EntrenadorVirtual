import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WEIGHT_STEP, formatWeight, fromKg, toKg, useWeightUnit } from '@/lib/units';
import type { WeightUnit } from '@/lib/units';
import type { CompletedSet } from '@/types/session';

function NumStepper({
  value,
  step = 1,
  min,
  max,
  onChange,
  editable = false,
  snap = false,
  wide = false,
}: {
  value: number;
  step?: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  /** Allows typing the value directly (e.g. 47.5 or 102,5) */
  editable?: boolean;
  /** −/+ move to the previous/next multiple of `step` (e.g. 132.3 lb → 135) */
  snap?: boolean;
  wide?: boolean;
}) {
  // Text being typed; null when not focused so the value prop is shown
  const [draft, setDraft] = useState<string | null>(null);
  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  function stepBy(dir: 1 | -1) {
    const eps = 1e-6;
    const next = snap
      ? dir > 0
        ? (Math.floor(value / step + eps) + 1) * step
        : (Math.ceil(value / step - eps) - 1) * step
      : value + dir * step;
    setDraft(null);
    onChange(clamp(+next.toFixed(4)));
  }

  // Update the value on every keystroke so tapping "Registrar" right after
  // typing never logs a stale value (blur and click run in the same tick).
  function handleType(text: string) {
    setDraft(text);
    const n = parseFloat(text.replace(',', '.'));
    if (Number.isFinite(n)) onChange(clamp(+n.toFixed(2)));
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => stepBy(-1)}
        className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 font-bold text-base transition-colors"
      >
        −
      </button>
      {editable ? (
        <input
          type="text"
          inputMode="decimal"
          value={draft ?? String(value)}
          onFocus={(e) => { setDraft(String(value)); e.target.select(); }}
          onChange={(e) => handleType(e.target.value)}
          onBlur={() => setDraft(null)}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          className={`${wide ? 'w-20' : 'w-14'} h-9 rounded-md bg-transparent text-center font-mono text-base font-semibold tabular-nums outline-none focus:bg-background focus:ring-1 focus:ring-primary/50`}
          aria-label="Peso"
        />
      ) : (
        <span className="w-14 text-center font-mono text-base font-semibold tabular-nums">
          {value}
        </span>
      )}
      <button
        type="button"
        onClick={() => stepBy(1)}
        className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 font-bold text-base transition-colors"
      >
        +
      </button>
    </div>
  );
}

const MAX_WEIGHT_KG = 500;

interface Props {
  setNumber: number;
  plannedReps: { min: number; max: number };
  rirTarget?: number;
  /** kg */
  suggestedWeight?: number;
  previousSet?: CompletedSet;
  onLog: (set: CompletedSet) => void;
}

export default function SetLogger({
  setNumber,
  plannedReps,
  rirTarget,
  suggestedWeight,
  previousSet,
  onLog,
}: Props) {
  const [unit, setUnit] = useWeightUnit();
  // kg is the source of truth; the stepper shows/edits it in the chosen unit.
  // An untouched weight is therefore logged exactly (no kg→lb→kg rounding).
  const [weightKg, setWeightKg] = useState(previousSet?.weight ?? suggestedWeight ?? 0);
  const weight = fromKg(weightKg, unit);
  const [reps, setReps] = useState(previousSet?.reps ?? plannedReps.min);
  const [rir, setRir] = useState(rirTarget ?? 2);

  function changeUnit(next: WeightUnit) {
    if (next !== unit) setUnit(next);
  }

  function handleLog() {
    onLog({
      setNumber,
      weight: weightKg,
      reps,
      rir,
      status: 'completed',
      timestamp: new Date(),
    });
  }

  return (
    <div className="mt-2 rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-3">
      {previousSet && (
        <p className="text-[11px] text-muted-foreground">
          Serie anterior:{' '}
          <span className="font-mono font-semibold">
            {formatWeight(previousSet.weight, unit)} × {previousSet.reps} reps
          </span>
          {previousSet.rir !== undefined && ` · RIR ${previousSet.rir}`}
        </p>
      )}
      {!previousSet && suggestedWeight !== undefined && (
        <p className="text-[11px] text-primary/80">
          Sugerido:{' '}
          <span className="font-mono font-semibold">{formatWeight(suggestedWeight, unit)}</span>
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1">
          <p className="text-[10px] uppercase text-muted-foreground tracking-wide font-medium">
            Peso
          </p>
          <div className="inline-flex rounded-lg border border-border p-0.5" role="group" aria-label="Unidad de peso">
            {(['kg', 'lb'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => changeUnit(u)}
                aria-pressed={unit === u}
                className={`w-9 py-1 rounded-md text-xs font-semibold transition-colors ${
                  unit === u
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        <NumStepper
          value={weight}
          step={WEIGHT_STEP[unit]}
          min={0}
          max={fromKg(MAX_WEIGHT_KG, unit)}
          onChange={(v) => setWeightKg(toKg(v, unit))}
          editable
          snap
          wide
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <p className="text-[10px] uppercase text-muted-foreground tracking-wide font-medium">
            Reps
          </p>
          <NumStepper value={reps} step={1} min={1} max={50} onChange={setReps} />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] uppercase text-muted-foreground tracking-wide font-medium">
            RIR
          </p>
          <NumStepper value={rir} step={1} min={0} max={5} onChange={setRir} />
        </div>
      </div>

      {unit === 'lb' && weightKg > 0 && (
        <p className="text-[10px] text-muted-foreground -mt-1">
          Se guarda como {+weightKg.toFixed(2)} kg
        </p>
      )}

      <Button onClick={handleLog} className="w-full h-10 gap-2">
        <CheckCircle2 className="h-4 w-4" />
        Registrar serie {setNumber}
      </Button>
    </div>
  );
}
