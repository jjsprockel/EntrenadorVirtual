import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  Calendar,
  Play,
  ChevronRight,
  ChevronDown,
  Pencil,
  ExternalLink,
  Zap,
  Activity,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRoutineStore } from '@/stores/routineStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useExerciseStore } from '@/stores/exerciseStore';
import { useUsersStore } from '@/stores/usersStore';
import { suggestWeight } from '@/lib/overloadEngine';
import { MUSCLE_GROUP_LABELS } from '@/components/exercise/MuscleGroupBadge';
import ExerciseThumb from '@/components/exercise/ExerciseThumb';
import ActiveSession from '@/components/session/ActiveSession';
import CardioTimerScreen from '@/components/session/CardioTimerScreen';
import DayEditModal from '@/components/routine/DayEditModal';
import type { RoutineDay } from '@/types/routine';
import type { Session, SessionExercise } from '@/types/session';

const PREVIEW_LIMIT = 4;

export default function TodayPage() {
  const navigate = useNavigate();
  const { getActiveRoutine } = useRoutineStore();
  const { activeSession, startSession, getUserSessions } = useSessionStore();
  const { getByCode } = useExerciseStore();
  const activeUserId = useUsersStore((s) => s.activeUserId);
  const isAdmin = useUsersStore((s) => s.getActiveUser()?.role === 'admin');
  const sessions = getUserSessions(activeUserId ?? '', isAdmin ?? false);

  const [editingDay, setEditingDay] = useState<RoutineDay | null>(null);
  const [showAllDays, setShowAllDays] = useState(false);

  // Handle active sessions
  if (activeSession) {
    const isCardioOnly =
      activeSession.exercises.length === 0 &&
      (activeSession.cardioEntries?.length ?? 0) > 0;
    return isCardioOnly ? <CardioTimerScreen /> : <ActiveSession />;
  }

  const routine = getActiveRoutine();

  // Determine suggested day
  const recentDayIds = [...sessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, (routine?.days.length ?? 0))
    .map((s) => s.dayId);

  const suggestedDayIdx =
    routine?.days.findIndex((d) => !recentDayIds.includes(d.id)) ?? -1;
  const effectiveSuggestedIdx = suggestedDayIdx === -1 ? 0 : suggestedDayIdx;
  const suggestedDay = routine?.days[effectiveSuggestedIdx];

  const today = new Date();
  const dayLabel = today.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Last 9 sessions across all types
  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 9);

  function startDay(day: RoutineDay) {
    if (!routine) return;
    const exercises: SessionExercise[] = day.exercises.map((slot) => ({
      exerciseCode: slot.exerciseCode,
      originalCode: slot.exerciseCode,
      plannedSets: slot.sets,
      plannedReps: slot.repsTarget,
      rirTarget: slot.rirTarget,
      restSeconds: slot.restSeconds,
      suggestedWeight: suggestWeight(slot.exerciseCode, slot, sessions),
      completedSets: [],
      notes: slot.notes,
    }));
    const session: Session = {
      id: crypto.randomUUID(),
      userId: activeUserId ?? undefined,
      routineId: routine.id,
      dayId: day.id,
      dayName: day.dayName,
      date: new Date(),
      startedAt: new Date(),
      exercises,
    };
    startSession(session);
  }

  function sessionIcon(s: Session) {
    const isCardio =
      s.exercises.length === 0 && (s.cardioEntries?.length ?? 0) > 0;
    if (isCardio) return { Icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' };
    if (s.routineId === 'libre') return { Icon: Zap, color: 'text-violet-400', bg: 'bg-violet-500/10' };
    return { Icon: Dumbbell, color: 'text-primary', bg: 'bg-primary/10' };
  }

  function sessionSubtitle(s: Session): string {
    const isCardio =
      s.exercises.length === 0 && (s.cardioEntries?.length ?? 0) > 0;
    if (isCardio) {
      const mins = (s.cardioEntries ?? []).reduce(
        (sum, e) => sum + e.durationMinutes,
        0,
      );
      const kcal =
        s.totalCalories ??
        (s.cardioEntries ?? []).reduce((sum, e) => sum + (e.calories ?? 0), 0);
      return `${mins} min${kcal ? ` · ${kcal} kcal` : ''}`;
    }
    return s.totalVolume
      ? `${Math.round(s.totalVolume).toLocaleString()} kg volumen`
      : `${s.exercises.length} ejercicio${s.exercises.length !== 1 ? 's' : ''}`;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <h1 className="font-bold text-base capitalize">{dayLabel}</h1>
        {routine && (
          <p className="text-xs text-muted-foreground mt-0.5">{routine.name}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* ── Tarjeta: Entrenamiento diario ───────────────────────────────── */}
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mb-2.5">
            Elige tu entrenamiento
          </p>

          {/* Diario card */}
          {!routine ? (
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3 mb-2.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Dumbbell className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Entrenamiento diario</p>
                  <p className="text-xs text-muted-foreground">Sin rutina activa</p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/rutinas')}
                variant="outline"
                className="w-full h-9 gap-2 text-sm"
              >
                <Calendar className="h-4 w-4" />
                Crear o activar rutina
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 overflow-hidden mb-2.5">
              {/* Suggested day */}
              {suggestedDay && (
                <div className="p-4 space-y-3">
                  {/* Header row */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Dumbbell className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{suggestedDay.dayName}</p>
                        <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0">
                          Sugerido
                        </span>
                      </div>
                      {suggestedDay.muscleGroups.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {suggestedDay.muscleGroups.map((mg) => (
                            <span
                              key={mg}
                              className="text-[10px] text-muted-foreground bg-background/60 px-1.5 py-0.5 rounded-md"
                            >
                              {MUSCLE_GROUP_LABELS[mg]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingDay(suggestedDay)}
                      className="shrink-0 p-1.5 text-muted-foreground hover:text-foreground hover:bg-background/60 rounded-lg transition-colors"
                      aria-label="Editar día"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Exercise preview */}
                  {suggestedDay.exercises.length > 0 && (
                    <div className="space-y-0.5">
                      {suggestedDay.exercises.slice(0, PREVIEW_LIMIT).map((slot) => {
                        const exercise = getByCode(slot.exerciseCode);
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => navigate(`/ejercicios/${slot.exerciseCode}`)}
                            className="flex items-center gap-2.5 w-full rounded-lg px-1.5 py-1.5 hover:bg-background/50 transition-colors group text-left"
                          >
                            <ExerciseThumb code={slot.exerciseCode} name={exercise?.nameEs} size="sm" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                {exercise?.nameEs ?? slot.exerciseCode}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {slot.sets} × {slot.repsTarget.min}–{slot.repsTarget.max} reps
                              </p>
                            </div>
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                          </button>
                        );
                      })}
                      {suggestedDay.exercises.length > PREVIEW_LIMIT && (
                        <p className="text-[11px] text-muted-foreground px-1.5 py-1">
                          + {suggestedDay.exercises.length - PREVIEW_LIMIT} más
                        </p>
                      )}
                    </div>
                  )}

                  {/* Last session */}
                  {(() => {
                    const last = sessions
                      .filter((s) => s.dayId === suggestedDay.id)
                      .sort(
                        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
                      )[0];
                    return last ? (
                      <p className="text-[10px] text-muted-foreground">
                        Último:{' '}
                        {new Date(last.date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                        })}
                        {last.totalVolume
                          ? ` · ${Math.round(last.totalVolume).toLocaleString()} kg`
                          : ''}
                      </p>
                    ) : null;
                  })()}

                  <Button onClick={() => startDay(suggestedDay)} className="w-full h-10 gap-2">
                    <Play className="h-4 w-4" />
                    Iniciar entrenamiento
                  </Button>
                </div>
              )}

              {/* Other days toggle */}
              {routine.days.length > 1 && (
                <>
                  <div className="border-t border-primary/15" />
                  <button
                    type="button"
                    onClick={() => setShowAllDays((v) => !v)}
                    className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>
                      {showAllDays
                        ? 'Ocultar otros días'
                        : `Ver todos los días (${routine.days.length})`}
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${showAllDays ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {showAllDays && (
                    <div className="px-3 pb-3 space-y-2">
                      {routine.days
                        .filter((d) => d.id !== suggestedDay?.id)
                        .map((day) => {
                          const last = sessions
                            .filter((s) => s.dayId === day.id)
                            .sort(
                              (a, b) =>
                                new Date(b.date).getTime() - new Date(a.date).getTime(),
                            )[0];
                          return (
                            <div
                              key={day.id}
                              className="rounded-xl border border-border bg-background p-3 space-y-2.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium">{day.dayName}</p>
                                  {day.muscleGroups.length > 0 && (
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                      {day.muscleGroups
                                        .map((mg) => MUSCLE_GROUP_LABELS[mg])
                                        .join(', ')}
                                    </p>
                                  )}
                                  {last && (
                                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                                      Último:{' '}
                                      {new Date(last.date).toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'short',
                                      })}
                                    </p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setEditingDay(day)}
                                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors shrink-0"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <Button
                                onClick={() => startDay(day)}
                                variant="outline"
                                className="w-full h-9 gap-2 text-sm"
                              >
                                <Play className="h-3.5 w-3.5" />
                                Iniciar {day.dayName}
                              </Button>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Libre + Cardio ─────────────────────── */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Libre */}
            <button
              type="button"
              onClick={() => navigate('/sesion-libre')}
              className="flex flex-col items-start gap-2.5 rounded-2xl border border-border bg-card p-4 text-left hover:border-violet-500/40 hover:bg-violet-500/5 transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Zap className="h-4.5 w-4.5 text-violet-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">Libre</p>
                <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                  Elige tus ejercicios a tu ritmo
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 self-end group-hover:text-violet-400 transition-colors" />
            </button>

            {/* Cardio */}
            <button
              type="button"
              onClick={() => navigate('/sesion-libre', { state: { mode: 'cardio' } })}
              className="flex flex-col items-start gap-2.5 rounded-2xl border border-border bg-card p-4 text-left hover:border-blue-500/40 hover:bg-blue-500/5 transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Activity className="h-4.5 w-4.5 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-sm">Cardio</p>
                <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                  Caminadora, bicicleta, elíptica…
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 self-end group-hover:text-blue-400 transition-colors" />
            </button>
          </div>
        </div>

        {/* ── Últimas sesiones ─────────────────────────────────────────────── */}
        {recentSessions.length > 0 && (
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mb-2.5">
              Últimas sesiones
            </p>
            <div className="space-y-1.5">
              {recentSessions.map((s) => {
                const { Icon, color, bg } = sessionIcon(s);
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/20 border border-border/40"
                  >
                    <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {s.dayName ?? 'Sesión'}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(s.date).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                        {' · '}
                        {sessionSubtitle(s)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Routine needs setup */}
        {routine && routine.days.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-6 text-center text-muted-foreground">
            <Dumbbell className="h-8 w-8 opacity-20" />
            <p className="text-sm">Esta rutina no tiene días configurados.</p>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => navigate(`/rutinas/${routine.id}/editar`)}
            >
              <Plus className="h-3.5 w-3.5" />
              Editar rutina
            </Button>
          </div>
        )}
      </div>

      {/* Day edit modal */}
      {editingDay && (
        <DayEditModal
          key={editingDay.id}
          open={true}
          onClose={() => setEditingDay(null)}
          routineId={routine!.id}
          day={editingDay}
        />
      )}
    </div>
  );
}
