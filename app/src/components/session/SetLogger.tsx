import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CompletedSet } from '@/types/session';

function NumStepper({
  value,
  step = 1,
  min,
  max,
  onChange,
}: {
  value: number;
  step?: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, +(value - step).toFixed(4)))}
        className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 font-bold text-base transition-colors"
      >
        −
      </button>
      <span className="w-14 text-center font-mono text-base font-semibold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, +(value + step).toFixed(4)))}
        className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 font-bold text-base transition-colors"
      >
        +
      </button>
    </div>
  );
}

interface Props {
  setNumber: number;
  plannedReps: { min: number; max: number };
  rirTarget?: number;
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
  const [weight, setWeight] = useState(
    previousSet?.weight ?? suggestedWeight ?? 0,
  );
  const [reps, setReps] = useState(previousSet?.reps ?? plannedReps.min);
  const [rir, setRir] = useState(rirTarget ?? 2);

  function handleLog() {
    onLog({ setNumber, weight, reps, rir, status: 'completed', timestamp: new Date() });
  }

  return (
    <div className="mt-2 rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-3">
      {previousSet && (
        <p className="text-[11px] text-muted-foreground">
          Serie anterior:{' '}
          <span className="font-mono font-semibold">
            {previousSet.weight} kg × {previousSet.reps} reps
          </span>
          {previousSet.rir !== undefined && ` · RIR ${previousSet.rir}`}
        </p>
      )}
      {!previousSet && suggestedWeight !== undefined && (
        <p className="text-[11px] text-primary/80">
          Sugerido:{' '}
          <span className="font-mono font-semibold">{suggestedWeight} kg</span>
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <p className="text-[10px] uppercase text-muted-foreground tracking-wide font-medium">
            Peso (kg)
          </p>
          <NumStepper value={weight} step={2.5} min={0} max={500} onChange={setWeight} />
        </div>
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

      <Button onClick={handleLog} className="w-full h-10 gap-2">
        <CheckCircle2 className="h-4 w-4" />
        Registrar serie {setNumber}
      </Button>
    </div>
  );
}
