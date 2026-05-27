import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Trash2,

  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useExerciseStore } from '@/stores/exerciseStore';
import type { ExerciseSlot, SetType } from '@/types/routine';

const SET_TYPE_LABELS: Record<SetType, string> = {
  normal: 'Normal',
  piramide: 'Pirámide',
  dropset: 'Drop set',
  superset: 'Superset',
};

function Stepper({
  value,
  min,
  max,
  step = 1,
  onChange,
  className,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1 ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-7 h-7 rounded border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors text-sm font-bold"
        aria-label="Reducir"
      >
        −
      </button>
      <span className="w-8 text-center font-mono text-sm font-semibold">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + step))}
        className="w-7 h-7 rounded border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors text-sm font-bold"
        aria-label="Aumentar"
      >
        +
      </button>
    </div>
  );
}

interface Props {
  slot: ExerciseSlot;
  index: number;
  total: number;
  onChange: (updated: ExerciseSlot) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onChangExercise: () => void;
}

export default function ExerciseSlotCard({
  slot,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  onChangExercise,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const { getByCode } = useExerciseStore();
  const exercise = getByCode(slot.exerciseCode);

  function update(partial: Partial<ExerciseSlot>) {
    onChange({ ...slot, ...partial });
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* Move handle / order buttons */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed"
            aria-label="Subir"
          >
            <ArrowUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed"
            aria-label="Bajar"
          >
            <ArrowDown className="h-3 w-3" />
          </button>
        </div>

        {/* Exercise info */}
        <button
          type="button"
          onClick={onChangExercise}
          className="flex-1 min-w-0 text-left group"
        >
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-primary shrink-0">{slot.exerciseCode}</span>
            <span className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {exercise?.nameEs ?? '(seleccionar)'}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {slot.sets} series · {slot.repsTarget.min}–{slot.repsTarget.max} reps ·{' '}
            {slot.restSeconds}s descanso
          </p>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={expanded ? 'Colapsar' : 'Expandir'}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Eliminar ejercicio"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expanded config */}
      {expanded && (
        <div className="border-t border-border px-3 py-3 space-y-3 bg-muted/20">
          {/* Sets / Reps */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-muted-foreground tracking-wide">
                Series
              </Label>
              <Stepper value={slot.sets} min={1} max={10} onChange={(v) => update({ sets: v })} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-muted-foreground tracking-wide">
                Reps mín.
              </Label>
              <Stepper
                value={slot.repsTarget.min}
                min={1}
                max={50}
                onChange={(v) =>
                  update({ repsTarget: { ...slot.repsTarget, min: v } })
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-muted-foreground tracking-wide">
                Reps máx.
              </Label>
              <Stepper
                value={slot.repsTarget.max}
                min={slot.repsTarget.min}
                max={50}
                onChange={(v) =>
                  update({ repsTarget: { ...slot.repsTarget, max: v } })
                }
              />
            </div>
          </div>

          {/* Rest / RIR */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-muted-foreground tracking-wide">
                Descanso (seg)
              </Label>
              <Stepper
                value={slot.restSeconds}
                min={15}
                max={600}
                step={15}
                onChange={(v) => update({ restSeconds: v })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-muted-foreground tracking-wide">
                RIR objetivo
              </Label>
              <Stepper
                value={slot.rirTarget ?? 2}
                min={0}
                max={5}
                onChange={(v) => update({ rirTarget: v })}
              />
            </div>
          </div>

          {/* Set type */}
          <div className="space-y-1">
            <Label className="text-[10px] uppercase text-muted-foreground tracking-wide">
              Tipo de serie
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(SET_TYPE_LABELS) as SetType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => update({ setType: t })}
                  className={`text-[11px] px-2 py-1 rounded-md border transition-colors ${
                    slot.setType === t
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {SET_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label className="text-[10px] uppercase text-muted-foreground tracking-wide">
              Notas (opcional)
            </Label>
            <Input
              value={slot.notes ?? ''}
              onChange={(e) => update({ notes: e.target.value || undefined })}
              placeholder="Ej: agarre neutro, pausa en el fondo…"
              className="h-9 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
