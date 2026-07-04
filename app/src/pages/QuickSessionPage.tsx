import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Play,
  Dumbbell,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSessionStore } from '@/stores/sessionStore';
import { useExerciseStore } from '@/stores/exerciseStore';
import { useUsersStore } from '@/stores/usersStore';
import { suggestWeight } from '@/lib/overloadEngine';
import ExercisePicker from '@/components/routine/ExercisePicker';
import ExerciseThumb from '@/components/exercise/ExerciseThumb';
import ActiveSession from '@/components/session/ActiveSession';
import type { Session, SessionExercise } from '@/types/session';
import type { ExerciseSlot } from '@/types/routine';

interface QuickExercise {
  code: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
}

const REST_OPTIONS = [60, 90, 120, 180] as const;

function restLabel(s: number) {
  if (s < 60) return `${s}s`;
  if (s === 60) return '1 min';
  return `${s / 60} min`;
}

function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-lg text-muted-foreground hover:text-foreground hover:border-primary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        −
      </button>
      <span className="w-7 text-center font-mono font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-lg text-muted-foreground hover:text-foreground hover:border-primary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        +
      </button>
    </div>
  );
}

export default function QuickSessionPage() {
  const navigate = useNavigate();
  const { activeSession, startSession, sessions } = useSessionStore();
  const { getByCode } = useExerciseStore();
  const activeUserId = useUsersStore((s) => s.activeUserId);

  const [exercises, setExercises] = useState<QuickExercise[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  if (activeSession) {
    return <ActiveSession />;
  }

  function addExercise(code: string) {
    if (exercises.some((e) => e.code === code)) return;
    setExercises((prev) => [
      ...prev,
      { code, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 90 },
    ]);
    setExpandedCode(code);
  }

  function patch(code: string, update: Partial<Omit<QuickExercise, 'code'>>) {
    setExercises((prev) => prev.map((e) => (e.code === code ? { ...e, ...update } : e)));
  }

  function remove(code: string) {
    setExercises((prev) => prev.filter((e) => e.code !== code));
    if (expandedCode === code) setExpandedCode(null);
  }

  function handleStart() {
    if (exercises.length === 0) return;

    const pastSessions = sessions.filter(
      (s) => s.userId === activeUserId || !s.userId,
    );

    const sessionExercises: SessionExercise[] = exercises.map((qex) => {
      const slot: ExerciseSlot = {
        id: '',
        exerciseCode: qex.code,
        alternativeCodes: [],
        sets: qex.sets,
        repsTarget: { min: qex.repsMin, max: qex.repsMax },
        rirTarget: 2,
        restSeconds: qex.restSeconds,
        setType: 'normal',
      };
      return {
        exerciseCode: qex.code,
        originalCode: qex.code,
        plannedSets: qex.sets,
        plannedReps: { min: qex.repsMin, max: qex.repsMax },
        rirTarget: 2,
        restSeconds: qex.restSeconds,
        suggestedWeight: suggestWeight(qex.code, slot, pastSessions),
        completedSets: [],
      };
    });

    const session: Session = {
      id: crypto.randomUUID(),
      userId: activeUserId ?? undefined,
      routineId: 'libre',
      dayId: 'libre',
      dayName: 'Sesión libre',
      date: new Date(),
      startedAt: new Date(),
      exercises: sessionExercises,
    };

    startSession(session);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1.5 -ml-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-base">Sesión libre</h1>
          <p className="text-xs text-muted-foreground">
            Elige los ejercicios que quieres realizar hoy
          </p>
        </div>
        {exercises.length > 0 && (
          <span className="text-xs text-muted-foreground shrink-0">
            {exercises.length} ejercicio{exercises.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 pb-36">
        {/* Empty state */}
        {exercises.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-5 py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Dumbbell className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <div className="space-y-1.5">
              <p className="font-semibold">Sin ejercicios todavía</p>
              <p className="text-sm text-muted-foreground max-w-[240px]">
                Añade los ejercicios que quieres realizar y configura series, repeticiones y descanso.
              </p>
            </div>
            <Button onClick={() => setPickerOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Añadir ejercicio
            </Button>
          </div>
        )}

        {/* Exercise cards */}
        {exercises.map((qex) => {
          const ex = getByCode(qex.code);
          const isExpanded = expandedCode === qex.code;

          return (
            <div
              key={qex.code}
              className={`rounded-xl border overflow-hidden transition-all ${
                isExpanded
                  ? 'border-primary shadow-md shadow-primary/10'
                  : 'border-border'
              }`}
            >
              {/* Row header */}
              <button
                type="button"
                onClick={() => setExpandedCode(isExpanded ? null : qex.code)}
                className="w-full flex items-center gap-2.5 px-3 py-3 text-left"
              >
                <ExerciseThumb code={qex.code} name={ex?.nameEs} size="md" />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ex?.nameEs ?? qex.code}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {qex.sets} series · {qex.repsMin}–{qex.repsMax} reps · {restLabel(qex.restSeconds)} descanso
                  </p>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(qex.code);
                    }}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md"
                    aria-label="Quitar ejercicio"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded config */}
              {isExpanded && (
                <div className="border-t border-border/50 px-4 pb-4 pt-3 space-y-4">
                  {/* Sets */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Series</p>
                      <p className="text-[11px] text-muted-foreground">Cuántas series totales</p>
                    </div>
                    <Stepper
                      value={qex.sets}
                      min={1}
                      max={10}
                      onChange={(v) => patch(qex.code, { sets: v })}
                    />
                  </div>

                  {/* Reps min */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Reps mínimas</p>
                      <p className="text-[11px] text-muted-foreground">Objetivo bajo</p>
                    </div>
                    <Stepper
                      value={qex.repsMin}
                      min={1}
                      max={qex.repsMax}
                      onChange={(v) => patch(qex.code, { repsMin: v })}
                    />
                  </div>

                  {/* Reps max */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Reps máximas</p>
                      <p className="text-[11px] text-muted-foreground">Objetivo alto</p>
                    </div>
                    <Stepper
                      value={qex.repsMax}
                      min={qex.repsMin}
                      max={50}
                      onChange={(v) => patch(qex.code, { repsMax: v })}
                    />
                  </div>

                  {/* Rest time */}
                  <div>
                    <p className="text-sm font-medium mb-2">Tiempo de descanso</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {REST_OPTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => patch(qex.code, { restSeconds: s })}
                          className={`py-2 rounded-lg border text-xs font-semibold transition-colors ${
                            qex.restSeconds === s
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                          }`}
                        >
                          {restLabel(s)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Add more button */}
        {exercises.length > 0 && (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/50 py-3 text-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Añadir ejercicio
          </button>
        )}
      </div>

      {/* Start button (fixed bottom) */}
      {exercises.length > 0 && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
          <div className="max-w-lg mx-auto">
            <Button
              type="button"
              onClick={handleStart}
              className="w-full h-12 gap-2 text-base font-semibold"
            >
              <Play className="h-5 w-5" />
              Iniciar sesión
            </Button>
          </div>
        </div>
      )}

      {/* Exercise picker */}
      <ExercisePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={addExercise}
        selectedCodes={exercises.map((e) => e.code)}
      />
    </div>
  );
}
