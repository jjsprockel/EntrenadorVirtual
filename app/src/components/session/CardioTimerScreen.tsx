import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Trophy, CheckCircle2, XCircle } from 'lucide-react';
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
import type { CardioEntry } from '@/types/session';
import { CARDIO_LABELS } from '@/types/session';

const RADIUS = 48;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Phase = 'running' | 'paused' | 'done';

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function CardioTimerScreen() {
  const activeSession = useSessionStore((s) => s.activeSession);
  const { completeSession, cancelSession } = useSessionStore();

  const entries = activeSession?.cardioEntries ?? [];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [completedEntries, setCompletedEntries] = useState<CardioEntry[]>([]);

  // Timer
  const [phase, setPhase] = useState<Phase>('running');
  const [elapsed, setElapsed] = useState(0);
  const [goalReached, setGoalReached] = useState(false);
  const goalReachedRef = useRef(false);

  // Completion form
  const [finalMinutes, setFinalMinutes] = useState('');
  const [distance, setDistance] = useState('');
  const [watts, setWatts] = useState('');
  const [calories, setCalories] = useState('');

  const [confirmCancel, setConfirmCancel] = useState(false);

  const entry = entries[currentIdx];
  const plannedSeconds = (entry?.durationMinutes ?? 0) * 60;

  useEffect(() => {
    if (phase !== 'running') return;
    const interval = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (!goalReachedRef.current && plannedSeconds > 0 && next >= plannedSeconds) {
          goalReachedRef.current = true;
          setGoalReached(true);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, plannedSeconds]);

  if (!activeSession || !entry) return null;

  const remaining = Math.max(0, plannedSeconds - elapsed);
  const overtime = elapsed > plannedSeconds ? elapsed - plannedSeconds : 0;
  const progress = plannedSeconds > 0 ? Math.min(1, elapsed / plannedSeconds) : 0;
  const strokeOffset = CIRCUMFERENCE * (1 - progress);

  const arcClass =
    phase === 'paused'
      ? 'stroke-muted-foreground/40'
      : goalReached
      ? 'stroke-success'
      : 'stroke-blue-500';

  function handleDone() {
    setPhase('done');
    setFinalMinutes(String(Math.max(1, Math.round(elapsed / 60))));
  }

  function handleSaveEntry() {
    const mins = parseInt(finalMinutes, 10);
    if (isNaN(mins) || mins < 1) return;

    const updated: CardioEntry = {
      ...entry,
      durationMinutes: mins,
      distanceKm: distance ? parseFloat(distance) : undefined,
      watts: watts ? parseInt(watts, 10) : undefined,
      calories: calories ? parseInt(calories, 10) : undefined,
    };

    const allDone = [...completedEntries, updated];

    if (currentIdx + 1 >= entries.length) {
      const totalKcal = allDone.reduce((sum, e) => sum + (e.calories ?? 0), 0);
      completeSession({
        cardioEntries: allDone,
        totalCalories: totalKcal > 0 ? totalKcal : undefined,
      });
    } else {
      setCompletedEntries(allDone);
      setCurrentIdx((i) => i + 1);
      setPhase('running');
      setElapsed(0);
      setGoalReached(false);
      goalReachedRef.current = false;
      setFinalMinutes('');
      setDistance('');
      setWatts('');
      setCalories('');
    }
  }

  // ── Completion form ───────────────────────────────────────────────────────
  if (phase === 'done') {
    const elapsedMins = Math.floor(elapsed / 60);
    const elapsedSecs = elapsed % 60;
    const isLast = currentIdx + 1 >= entries.length;
    const nextEntry = entries[currentIdx + 1];

    return (
      <div className="flex flex-col h-full">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
          <p className="font-bold text-sm">{CARDIO_LABELS[entry.type]}</p>
          {entries.length > 1 && (
            <p className="text-xs text-muted-foreground">
              {currentIdx + 1} de {entries.length}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="rounded-xl border border-success/30 bg-success/5 p-6 space-y-5">
            <div className="text-center space-y-1">
              <Trophy className="h-12 w-12 text-success mx-auto" />
              <p className="font-bold text-base">
                ¡{CARDIO_LABELS[entry.type]} completado!
              </p>
              <p className="text-sm text-muted-foreground">
                Tiempo real:{' '}
                <span className="font-mono">{elapsedMins}m {elapsedSecs}s</span>
              </p>
            </div>

            <div className="space-y-3">
              {/* Editable duration */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Duración a registrar <span className="font-normal normal-case">(min)</span>
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={finalMinutes}
                  onChange={(e) => setFinalMinutes(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Optional fields */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold leading-tight">
                    Dist. (km)
                  </p>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="—"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="w-full h-10 px-2 rounded-lg border border-border bg-background text-sm text-center font-mono focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold leading-tight">
                    Vatios (W)
                  </p>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="—"
                    value={watts}
                    onChange={(e) => setWatts(e.target.value)}
                    className="w-full h-10 px-2 rounded-lg border border-border bg-background text-sm text-center font-mono focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold leading-tight">
                    Calorías
                  </p>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="—"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full h-10 px-2 rounded-lg border border-border bg-background text-sm text-center font-mono focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleSaveEntry}
              disabled={!finalMinutes || parseInt(finalMinutes, 10) < 1}
              className="w-full h-11 gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isLast ? 'Guardar sesión' : `Siguiente: ${CARDIO_LABELS[nextEntry.type]}`}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Active timer (running / paused) ───────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">{CARDIO_LABELS[entry.type]}</p>
          <p className="text-xs text-muted-foreground">
            Meta: {entry.durationMinutes} min
            {entries.length > 1 && ` · ${currentIdx + 1}/${entries.length}`}
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

      {/* Timer body */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        {/* Goal reached badge */}
        {goalReached && (
          <div className="px-4 py-1.5 rounded-full bg-success/15 border border-success/25 text-success text-xs font-semibold">
            ¡Meta alcanzada! +{fmt(overtime)}
          </div>
        )}

        {/* Circular dial */}
        <div className="relative w-[220px] h-[220px]">
          <svg viewBox="0 0 110 110" className="w-full h-full -rotate-90">
            <circle
              cx="55" cy="55" r={RADIUS}
              fill="none"
              strokeWidth="6"
              className="stroke-muted/30"
            />
            <circle
              cx="55" cy="55" r={RADIUS}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              className={arcClass}
              style={{
                strokeDasharray: CIRCUMFERENCE,
                strokeDashoffset: strokeOffset,
                transition: 'stroke-dashoffset 1s linear',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            {goalReached ? (
              <>
                <span className="font-mono text-4xl font-bold tabular-nums leading-none text-success">
                  {fmt(elapsed)}
                </span>
                <span className="text-[11px] text-muted-foreground mt-1">transcurrido</span>
              </>
            ) : (
              <>
                <span className="font-mono text-4xl font-bold tabular-nums leading-none text-blue-400">
                  {fmt(remaining)}
                </span>
                <span className="text-[11px] text-muted-foreground mt-1">restante</span>
                <span className="font-mono text-xs text-muted-foreground/50 mt-0.5">
                  {fmt(elapsed)}
                </span>
              </>
            )}
          </div>
        </div>

        {phase === 'paused' && (
          <p className="text-sm font-semibold text-muted-foreground -mt-4">En pausa</p>
        )}

        {/* Controls */}
        <div className="flex gap-3 w-full max-w-xs">
          <button
            type="button"
            onClick={() => setPhase((p) => (p === 'running' ? 'paused' : 'running'))}
            className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border text-sm font-semibold transition-colors ${
              phase === 'paused'
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-border text-foreground hover:border-primary/40 hover:bg-muted/30'
            }`}
          >
            {phase === 'paused' ? (
              <><Play className="h-4 w-4" /> Reanudar</>
            ) : (
              <><Pause className="h-4 w-4" /> Pausar</>
            )}
          </button>

          <button
            type="button"
            onClick={handleDone}
            className="flex items-center justify-center gap-2 h-12 px-5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            <Square className="h-4 w-4" />
            Terminar
          </button>
        </div>
      </div>

      {/* Cancel dialog */}
      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Se perderá el tiempo transcurrido. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar</AlertDialogCancel>
            <AlertDialogAction
              onClick={cancelSession}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancelar sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
