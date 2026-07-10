import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  Trophy,
  ZoomIn,
  Plus,
  Minus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSessionStore } from '@/stores/sessionStore';
import { useExerciseStore } from '@/stores/exerciseStore';
import { useUsersStore } from '@/stores/usersStore';
import { suggestWeight } from '@/lib/overloadEngine';
import ExerciseThumb from '@/components/exercise/ExerciseThumb';
import ExerciseLightbox from '@/components/exercise/ExerciseLightbox';
import ExercisePicker from '@/components/routine/ExercisePicker';
import SetLogger from './SetLogger';
import RestTimer from './RestTimer';
import type { CompletedSet, SessionExercise } from '@/types/session';
import type { ExerciseSlot } from '@/types/routine';

export default function ActiveSession() {
  const activeSession = useSessionStore((s) => s.activeSession);
  const { logSet, completeSession, cancelSession, updateExercise, updateActiveSession } =
    useSessionStore();
  const sessions = useSessionStore((s) => s.sessions);
  const { getByCode } = useExerciseStore();
  const preferRestTimer = useUsersStore((s) => s.getActiveUser()?.profile.preferRestTimer ?? true);

  // Which exercise card is expanded (free navigation)
  const [expandedIdx, setExpandedIdx] = useState<number>(() => {
    if (!activeSession) return 0;
    const idx = activeSession.exercises.findIndex(
      (e) => e.completedSets.length < e.plannedSets,
    );
    return idx >= 0 ? idx : 0;
  });

  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [removingCode, setRemovingCode] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [lightboxCode, setLightboxCode] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(() =>
    activeSession
      ? Math.floor((Date.now() - new Date(activeSession.startedAt).getTime()) / 1000)
      : 0,
  );

  const expandedRef = useRef<HTMLDivElement | null>(null);
  const currentExIdxRef = useRef(0);

  const currentExIdx =
    activeSession?.exercises.findIndex(
      (e) => e.completedSets.length < e.plannedSets,
    ) ?? -1;

  currentExIdxRef.current = currentExIdx;

  const isComplete = activeSession != null && currentExIdx === -1;

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Scroll expanded card into view when expandedIdx changes
  useEffect(() => {
    expandedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [expandedIdx]);

  if (!activeSession) return null;

  const totalVolume = activeSession.exercises.reduce(
    (total, ex) =>
      total + ex.completedSets.reduce((s, set) => s + set.weight * set.reps, 0),
    0,
  );

  const elapsedMins = Math.floor(elapsed / 60);
  const elapsedSecs = elapsed % 60;

  function handleLogSet(exerciseCode: string, restSecs: number, set: CompletedSet) {
    logSet(exerciseCode, set);

    const exercises = activeSession!.exercises;
    const exIdx = exercises.findIndex((e) => e.exerciseCode === exerciseCode);
    const ex = exercises[exIdx];
    const newCount = ex.completedSets.length + 1;
    const exWillBeDone = newCount >= ex.plannedSets;

    const hasMoreWork = exWillBeDone
      ? exercises.some((e, i) => i !== exIdx && e.completedSets.length < e.plannedSets)
      : true;

    if (hasMoreWork && preferRestTimer) {
      setTimerSeconds(restSecs);
      setShowTimer(true);
    }

    // Auto-advance to next incomplete exercise after this one finishes
    if (exWillBeDone) {
      const nextIdx = exercises.findIndex(
        (e, i) => i !== exIdx && e.completedSets.length < e.plannedSets,
      );
      if (nextIdx !== -1) {
        if (preferRestTimer && hasMoreWork) {
          // Will advance after timer completes
        } else {
          setExpandedIdx(nextIdx);
        }
      }
    }
  }

  function handleTimerDone() {
    setShowTimer(false);
    // Move focus to the current suggested exercise
    const idx = currentExIdxRef.current;
    if (idx >= 0) setExpandedIdx(idx);
  }

  function adjustSets(exerciseCode: string, delta: number) {
    const ex = activeSession!.exercises.find((e) => e.exerciseCode === exerciseCode);
    if (!ex) return;
    const newCount = Math.max(ex.completedSets.length + 1, ex.plannedSets + delta);
    updateExercise(exerciseCode, { plannedSets: newCount });
  }

  function handleRemoveExercise(exerciseCode: string) {
    updateActiveSession({
      exercises: activeSession!.exercises.filter((e) => e.exerciseCode !== exerciseCode),
    });
    setRemovingCode(null);
    const newIdx = Math.max(0, expandedIdx - 1);
    setExpandedIdx(newIdx);
  }

  function handleAddExercise(code: string) {
    const fakeSlot: ExerciseSlot = {
      id: '',
      exerciseCode: code,
      alternativeCodes: [],
      sets: 3,
      repsTarget: { min: 8, max: 12 },
      restSeconds: 90,
      setType: 'normal',
    };
    const newEx: SessionExercise = {
      exerciseCode: code,
      originalCode: code,
      plannedSets: 3,
      plannedReps: { min: 8, max: 12 },
      rirTarget: 2,
      restSeconds: 90,
      suggestedWeight: suggestWeight(code, fakeSlot, sessions),
      completedSets: [],
    };
    updateActiveSession({
      exercises: [...activeSession!.exercises, newEx],
    });
    setExpandedIdx(activeSession!.exercises.length); // new exercise index
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">
            {activeSession.dayName ?? 'Sesión activa'}
          </p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Clock className="h-3 w-3 shrink-0" />
            <span className="tabular-nums">
              {elapsedMins > 0 ? `${elapsedMins}m ` : ''}
              {elapsedSecs}s
            </span>
            {totalVolume > 0 && (
              <>
                <span>·</span>
                <span className="font-mono">
                  {Math.round(totalVolume).toLocaleString()} kg
                </span>
              </>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConfirmCancel(true)}
          className="shrink-0 text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
        >
          <XCircle className="h-4 w-4" />
          Cancelar
        </button>
      </div>

      {/* Exercise list */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-2.5 ${showTimer ? 'pb-72' : 'pb-32'}`}>
        {activeSession.exercises.map((ex, idx) => {
          const exercise = getByCode(ex.exerciseCode);
          const isExpanded = expandedIdx === idx;
          const isDone = ex.completedSets.length >= ex.plannedSets;
          const isSuggested = idx === currentExIdx && !isComplete;
          const previousSet =
            ex.completedSets.length > 0
              ? ex.completedSets[ex.completedSets.length - 1]
              : undefined;
          const nextSetNumber = ex.completedSets.length + 1;

          return (
            <div
              key={ex.exerciseCode}
              ref={isExpanded ? expandedRef : null}
              className={`rounded-xl border overflow-hidden transition-all ${
                isExpanded
                  ? 'border-primary shadow-md shadow-primary/10'
                  : isDone
                  ? 'border-border/40 opacity-60'
                  : 'border-border'
              }`}
            >
              {/* Card header — always tappable */}
              <button
                type="button"
                onClick={() => setExpandedIdx(isExpanded ? -1 : idx)}
                className="w-full flex items-center gap-2.5 px-3 py-3 text-left"
              >
                {/* Thumbnail with badge */}
                <div className="relative shrink-0">
                  <ExerciseThumb
                    code={ex.exerciseCode}
                    name={exercise?.nameEs}
                    size="md"
                  />
                  <div
                    className={`absolute -top-1 -left-1 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center text-[9px] font-bold ${
                      isDone
                        ? 'bg-success/80 text-white'
                        : isSuggested
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-2.5 w-2.5" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                </div>

                {/* Exercise info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-primary shrink-0">
                      {ex.exerciseCode}
                    </span>
                    <span className="text-sm font-medium truncate">
                      {exercise?.nameEs ?? ex.exerciseCode}
                    </span>
                  </div>
                  {/* Set progress dots */}
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: ex.plannedSets }).map((_, si) => (
                      <div
                        key={si}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          si < ex.completedSets.length
                            ? 'w-5 bg-primary'
                            : si === ex.completedSets.length && isSuggested
                            ? 'w-4 bg-primary/30'
                            : 'w-3 bg-muted'
                        }`}
                      />
                    ))}
                    <span className="text-[10px] text-muted-foreground ml-1 tabular-nums">
                      {ex.completedSets.length}/{ex.plannedSets}
                    </span>
                  </div>
                </div>

                {/* Image popup + chevron */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxCode(ex.exerciseCode);
                    }}
                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Ver imagen"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded body */}
              {isExpanded && (
                <div className="border-t border-border/50 px-3 pb-3">
                  {/* Completed sets */}
                  {ex.completedSets.length > 0 && (
                    <div className="pt-2 space-y-1 mb-1">
                      {ex.completedSets.map((s) => (
                        <div
                          key={s.setNumber}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <span className="font-mono shrink-0 w-14 text-[11px]">
                            Serie {s.setNumber}
                          </span>
                          <span className="font-mono font-semibold text-foreground">
                            {s.weight} kg × {s.reps}
                          </span>
                          {s.rir !== undefined && (
                            <span className="text-[10px]">RIR {s.rir}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SetLogger (visible for any exercise, even out of order) */}
                  {!isDone && !showTimer && (
                    <SetLogger
                      setNumber={nextSetNumber}
                      plannedReps={ex.plannedReps}
                      rirTarget={ex.rirTarget}
                      suggestedWeight={ex.suggestedWeight}
                      previousSet={previousSet}
                      onLog={(set) =>
                        handleLogSet(ex.exerciseCode, ex.restSeconds, set)
                      }
                    />
                  )}
                  {!isDone && showTimer && idx === expandedIdx && (
                    <p className="mt-2 py-2 text-xs text-center text-muted-foreground">
                      Descansando… siguiente serie lista en breve.
                    </p>
                  )}

                  {/* Exercise controls */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/40">
                    {/* Adjust series */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => adjustSets(ex.exerciseCode, -1)}
                        disabled={ex.plannedSets <= ex.completedSets.length + 1}
                        className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Quitar una serie"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-[11px] text-muted-foreground px-1 tabular-nums">
                        {ex.plannedSets} series
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustSets(ex.exerciseCode, 1)}
                        className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Añadir una serie"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex-1" />

                    {/* Remove exercise */}
                    <button
                      type="button"
                      onClick={() => setRemovingCode(ex.exerciseCode)}
                      className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-md"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Quitar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Add exercise button */}
        {!isComplete && (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/50 py-3 text-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Añadir ejercicio
          </button>
        )}

        {/* Session complete */}
        {isComplete && (
          <div className="rounded-xl border border-success/30 bg-success/5 p-6 text-center space-y-4">
            <Trophy className="h-12 w-12 text-success mx-auto" />
            <div className="space-y-1">
              <p className="font-bold text-base">¡Entrenamiento completado!</p>
              <p className="text-sm text-muted-foreground">
                Volumen total:{' '}
                <span className="font-mono font-semibold text-foreground">
                  {Math.round(totalVolume).toLocaleString()} kg
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Duración:{' '}
                <span className="font-mono">
                  {elapsedMins}m {elapsedSecs}s
                </span>
              </p>
            </div>
            <Button onClick={completeSession} className="w-full h-11 gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Guardar sesión
            </Button>
          </div>
        )}
      </div>

      {/* Rest timer */}
      {showTimer && (
        <RestTimer
          seconds={timerSeconds}
          onComplete={handleTimerDone}
          onSkip={handleTimerDone}
        />
      )}

      {/* Exercise picker for adding */}
      <ExercisePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAddExercise}
        selectedCodes={activeSession.exercises.map((e) => e.exerciseCode)}
      />

      {/* Confirm remove exercise */}
      <AlertDialog
        open={removingCode !== null}
        onOpenChange={(v) => !v && setRemovingCode(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Quitar ejercicio?</AlertDialogTitle>
            <AlertDialogDescription>
              {removingCode && (
                <>
                  Se quitará{' '}
                  <span className="font-semibold">
                    {getByCode(removingCode)?.nameEs ?? removingCode}
                  </span>{' '}
                  de esta sesión. Las series ya registradas se perderán.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removingCode && handleRemoveExercise(removingCode)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Quitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel session dialog */}
      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Se perderá todo el progreso de esta sesión. Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar entrenando</AlertDialogCancel>
            <AlertDialogAction
              onClick={cancelSession}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancelar sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exercise image lightbox */}
      {lightboxCode && (() => {
        const lbEx = getByCode(lightboxCode);
        return (
          <ExerciseLightbox
            open
            imagePath={`/images/ejercicios/${lightboxCode}.png`}
            name={lbEx?.nameEs ?? lightboxCode}
            code={lightboxCode}
            onClose={() => setLightboxCode(null)}
          />
        );
      })()}
    </div>
  );
}
