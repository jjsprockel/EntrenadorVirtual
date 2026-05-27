import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowUp, ArrowDown, Trash2, RefreshCw, Dumbbell, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import ExercisePicker from './ExercisePicker';
import ExerciseThumb from '@/components/exercise/ExerciseThumb';
import { useExerciseStore } from '@/stores/exerciseStore';
import { useRoutineStore } from '@/stores/routineStore';
import type { RoutineDay, ExerciseSlot } from '@/types/routine';

interface Props {
  open: boolean;
  onClose: () => void;
  routineId: string;
  day: RoutineDay;
}

export default function DayEditModal({ open, onClose, routineId, day }: Props) {
  const navigate = useNavigate();
  const { getByCode } = useExerciseStore();
  const { routines, updateRoutine } = useRoutineStore();

  const [exercises, setExercises] = useState<ExerciseSlot[]>(day.exercises);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [replacingSlotId, setReplacingSlotId] = useState<string | null>(null);

  // Sync local state whenever dialog re-opens
  useEffect(() => {
    if (open) setExercises(day.exercises);
  }, [open]);

  function move(index: number, dir: 'up' | 'down') {
    const arr = [...exercises];
    const target = dir === 'up' ? index - 1 : index + 1;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    setExercises(arr);
  }

  function remove(id: string) {
    setExercises((prev) => prev.filter((s) => s.id !== id));
  }

  function addOrReplace(code: string) {
    if (replacingSlotId) {
      setExercises((prev) =>
        prev.map((s) =>
          s.id === replacingSlotId ? { ...s, exerciseCode: code } : s,
        ),
      );
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
      setExercises((prev) => [...prev, newSlot]);
    }
  }

  function save() {
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;
    const updatedDays = routine.days.map((d) =>
      d.id === day.id ? { ...d, exercises } : d,
    );
    updateRoutine(routineId, { days: updatedDays });
    onClose();
  }

  function goToDetail(code: string) {
    onClose();
    navigate(`/ejercicios/${code}`);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-md w-full h-[85dvh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-4 pt-4 pb-3 border-b border-border shrink-0">
            <DialogTitle className="text-sm font-semibold">
              Editar — {day.dayName}
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Toca el nombre para ver la explicación del ejercicio
            </p>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {exercises.map((slot, idx) => {
                const exercise = getByCode(slot.exerciseCode);

                return (
                  <div
                    key={slot.id}
                    className="flex items-center gap-2 rounded-xl border border-border bg-card p-2.5"
                  >
                    {/* Thumbnail → detail */}
                    <button
                      type="button"
                      onClick={() => goToDetail(slot.exerciseCode)}
                      aria-label={`Ver ${exercise?.nameEs ?? slot.exerciseCode}`}
                    >
                      <ExerciseThumb
                        code={slot.exerciseCode}
                        name={exercise?.nameEs}
                        size="md"
                      />
                    </button>

                    {/* Name + detail link */}
                    <button
                      type="button"
                      onClick={() => goToDetail(slot.exerciseCode)}
                      className="flex-1 min-w-0 text-left group"
                    >
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[10px] text-primary shrink-0">
                          {slot.exerciseCode}
                        </span>
                        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {exercise?.nameEs ?? '(sin nombre)'}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {slot.sets} series · {slot.repsTarget.min}–{slot.repsTarget.max} reps
                      </p>
                    </button>

                    {/* Order controls */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => move(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        aria-label="Subir"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(idx, 'down')}
                        disabled={idx === exercises.length - 1}
                        className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        aria-label="Bajar"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Swap + Remove */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setReplacingSlotId(slot.id);
                          setPickerOpen(true);
                        }}
                        className="p-1 text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Cambiar ejercicio"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(slot.id)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Eliminar ejercicio"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {exercises.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
                  <Dumbbell className="h-10 w-10 opacity-20" />
                  <p className="text-sm">Sin ejercicios. Añade uno.</p>
                </div>
              )}

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
          </ScrollArea>

          <div className="px-4 py-3 border-t border-border shrink-0 flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 h-10">
              Cancelar
            </Button>
            <Button onClick={save} className="flex-1 h-10">
              Guardar cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ExercisePicker
        open={pickerOpen}
        onClose={() => {
          setPickerOpen(false);
          setReplacingSlotId(null);
        }}
        onSelect={addOrReplace}
        selectedCodes={exercises.map((s) => s.exerciseCode)}
      />
    </>
  );
}
