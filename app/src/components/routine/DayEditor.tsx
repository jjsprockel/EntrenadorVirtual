import { useState } from 'react';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ExerciseSlotCard from './ExerciseSlotCard';
import ExercisePicker from './ExercisePicker';
import type { RoutineDay, ExerciseSlot } from '@/types/routine';
import type { MuscleGroup } from '@/types/exercise';
import { MUSCLE_GROUP_LABELS } from '@/components/exercise/MuscleGroupBadge';

const ALL_GROUPS = Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[];

interface Props {
  day: RoutineDay;
  onChange: (updated: RoutineDay) => void;
  defaultOpen?: boolean;
}

export default function DayEditor({ day, onChange, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [replacingSlotId, setReplacingSlotId] = useState<string | null>(null);

  function updateDay(partial: Partial<RoutineDay>) {
    onChange({ ...day, ...partial });
  }

  function toggleGroup(g: MuscleGroup) {
    const groups = day.muscleGroups.includes(g)
      ? day.muscleGroups.filter((x) => x !== g)
      : [...day.muscleGroups, g];
    updateDay({ muscleGroups: groups });
  }

  function addExercise(code: string) {
    if (replacingSlotId) {
      // Replace existing slot's exercise
      updateDay({
        exercises: day.exercises.map((s) =>
          s.id === replacingSlotId ? { ...s, exerciseCode: code } : s,
        ),
      });
      setReplacingSlotId(null);
    } else {
      const newSlot: ExerciseSlot = {
        id: crypto.randomUUID(),
        exerciseCode: code,
        alternativeCodes: [],
        sets: 3,
        repsTarget: { min: 8, max: 12 },
        restSeconds: 90,
        setType: 'normal',
      };
      updateDay({ exercises: [...day.exercises, newSlot] });
    }
  }

  function updateSlot(id: string, updated: ExerciseSlot) {
    updateDay({ exercises: day.exercises.map((s) => (s.id === id ? updated : s)) });
  }

  function removeSlot(id: string) {
    updateDay({ exercises: day.exercises.filter((s) => s.id !== id) });
  }

  function moveSlot(index: number, direction: 'up' | 'down') {
    const exercises = [...day.exercises];
    const target = direction === 'up' ? index - 1 : index + 1;
    [exercises[index], exercises[target]] = [exercises[target], exercises[index]];
    updateDay({ exercises });
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Day header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">{day.dayName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {day.exercises.length} ejercicio{day.exercises.length !== 1 ? 's' : ''}
            {day.muscleGroups.length > 0 &&
              ` · ${day.muscleGroups.map((g) => MUSCLE_GROUP_LABELS[g]).join(', ')}`}
          </p>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {open && (
        <div className="border-t border-border p-4 space-y-4">
          {/* Day name */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase text-muted-foreground tracking-wide">
              Nombre del día
            </Label>
            <Input
              value={day.dayName}
              onChange={(e) => updateDay({ dayName: e.target.value })}
              placeholder="Ej: Push A, Pierna, Torso…"
              className="h-10"
            />
          </div>

          {/* Muscle groups */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase text-muted-foreground tracking-wide">
              Grupos musculares
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_GROUPS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGroup(g)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    day.muscleGroups.includes(g)
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {MUSCLE_GROUP_LABELS[g]}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise slots */}
          <div className="space-y-2">
            <Label className="text-[11px] uppercase text-muted-foreground tracking-wide">
              Ejercicios ({day.exercises.length})
            </Label>
            {day.exercises.map((slot, i) => (
              <ExerciseSlotCard
                key={slot.id}
                slot={slot}
                index={i}
                total={day.exercises.length}
                onChange={(updated) => updateSlot(slot.id, updated)}
                onRemove={() => removeSlot(slot.id)}
                onMoveUp={() => moveSlot(i, 'up')}
                onMoveDown={() => moveSlot(i, 'down')}
                onChangExercise={() => {
                  setReplacingSlotId(slot.id);
                  setPickerOpen(true);
                }}
              />
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full h-10 gap-2 border-dashed text-muted-foreground hover:text-foreground"
              onClick={() => {
                setReplacingSlotId(null);
                setPickerOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Añadir ejercicio
            </Button>
          </div>
        </div>
      )}

      <ExercisePicker
        open={pickerOpen}
        onClose={() => {
          setPickerOpen(false);
          setReplacingSlotId(null);
        }}
        onSelect={addExercise}
        selectedCodes={day.exercises.map((s) => s.exerciseCode)}
      />
    </div>
  );
}
