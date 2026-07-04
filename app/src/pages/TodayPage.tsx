import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Dumbbell, Calendar, Play, ChevronRight, Pencil, ExternalLink, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRoutineStore } from '@/stores/routineStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useExerciseStore } from '@/stores/exerciseStore';
import { useUsersStore } from '@/stores/usersStore';
import { suggestWeight } from '@/lib/overloadEngine';
import { MUSCLE_GROUP_LABELS } from '@/components/exercise/MuscleGroupBadge';
import ExerciseThumb from '@/components/exercise/ExerciseThumb';
import ActiveSession from '@/components/session/ActiveSession';
import DayEditModal from '@/components/routine/DayEditModal';
import type { RoutineDay } from '@/types/routine';
import type { Session, SessionExercise } from '@/types/session';

const PREVIEW_LIMIT = 5;

export default function TodayPage() {
  const navigate = useNavigate();
  const { getActiveRoutine } = useRoutineStore();
  const { activeSession, startSession, getUserSessions } = useSessionStore();
  const { getByCode } = useExerciseStore();
  const activeUserId = useUsersStore((s) => s.activeUserId);
  const isAdmin = useUsersStore((s) => s.getActiveUser()?.role === 'admin');
  const sessions = getUserSessions(activeUserId ?? '', isAdmin ?? false);

  const [editingDay, setEditingDay] = useState<RoutineDay | null>(null);

  const routine = getActiveRoutine();

  if (activeSession) {
    return <ActiveSession />;
  }

  if (!routine) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
        <Dumbbell className="h-12 w-12 text-muted-foreground/20" />
        <div className="space-y-1">
          <p className="font-semibold">Sin rutina activa</p>
          <p className="text-sm text-muted-foreground">
            Crea o activa una rutina, o empieza una sesión libre
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-[200px]">
          <Button onClick={() => navigate('/rutinas')} className="gap-2 w-full">
            <Calendar className="h-4 w-4" />
            Ver rutinas
          </Button>
          <Button variant="outline" onClick={() => navigate('/sesion-libre')} className="gap-2 w-full">
            <Zap className="h-4 w-4" />
            Sesión libre
          </Button>
        </div>
      </div>
    );
  }

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

  const recentDayIds = [...sessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, routine.days.length)
    .map((s) => s.dayId);

  const suggestedDayIdx = routine.days.findIndex((d) => !recentDayIds.includes(d.id));
  const effectiveSuggested = suggestedDayIdx === -1 ? 0 : suggestedDayIdx;

  const today = new Date();
  const dayLabel = today.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <h1 className="font-bold text-base capitalize">{dayLabel}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{routine.name}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Day cards */}
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mb-3">
            Selecciona un entrenamiento
          </p>
          <div className="space-y-3">
            {routine.days.map((day, idx) => {
              const isSuggested = idx === effectiveSuggested;
              const lastSession = sessions
                .filter((s) => s.dayId === day.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
              const preview = day.exercises.slice(0, PREVIEW_LIMIT);
              const overflow = day.exercises.length - PREVIEW_LIMIT;

              return (
                <div
                  key={day.id}
                  className={`rounded-xl border overflow-hidden ${
                    isSuggested ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'
                  }`}
                >
                  {/* Card header */}
                  <div className="flex items-center gap-2 px-4 pt-4 pb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{day.dayName}</p>
                        {isSuggested && (
                          <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide shrink-0">
                            Sugerido
                          </span>
                        )}
                      </div>
                      {day.muscleGroups.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {day.muscleGroups.map((mg) => (
                            <span
                              key={mg}
                              className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md"
                            >
                              {MUSCLE_GROUP_LABELS[mg]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => setEditingDay(day)}
                      className="shrink-0 p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                      aria-label="Editar día"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Exercise preview list */}
                  {day.exercises.length > 0 && (
                    <div className="px-3 pb-1 space-y-0.5">
                      {preview.map((slot) => {
                        const exercise = getByCode(slot.exerciseCode);
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => navigate(`/ejercicios/${slot.exerciseCode}`)}
                            className="flex items-center gap-2.5 w-full rounded-lg px-1.5 py-1.5 hover:bg-muted/40 transition-colors group text-left"
                          >
                            <ExerciseThumb
                              code={slot.exerciseCode}
                              name={exercise?.nameEs}
                              size="sm"
                            />
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
                      {overflow > 0 && (
                        <button
                          type="button"
                          onClick={() => setEditingDay(day)}
                          className="w-full text-center text-[11px] text-muted-foreground hover:text-primary transition-colors py-1.5"
                        >
                          + {overflow} más
                        </button>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="px-4 pb-4 pt-2 space-y-2">
                    {lastSession && (
                      <p className="text-[10px] text-muted-foreground">
                        Último:{' '}
                        {new Date(lastSession.date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                        })}
                        {lastSession.totalVolume
                          ? ` · ${Math.round(lastSession.totalVolume).toLocaleString()} kg`
                          : ''}
                      </p>
                    )}

                    <Button
                      onClick={() => startDay(day)}
                      variant={isSuggested ? 'default' : 'outline'}
                      className="w-full h-10 gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Iniciar entrenamiento
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent sessions */}
        {recentSessions.length > 0 && (
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mb-3">
              Últimas sesiones
            </p>
            <div className="space-y-1.5">
              {recentSessions.map((s) => {
                const day = routine.days.find((d) => d.id === s.dayId);
                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {s.dayName ?? day?.dayName ?? 'Sesión'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(s.date).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                        {s.totalVolume
                          ? ` · ${Math.round(s.totalVolume).toLocaleString()} kg`
                          : ''}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty routine */}
        {routine.days.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-10 text-center text-muted-foreground">
            <Dumbbell className="h-10 w-10 opacity-20" />
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

        {/* Quick session shortcut */}
        <button
          type="button"
          onClick={() => navigate('/sesion-libre')}
          className="flex items-center gap-3 w-full rounded-xl border border-dashed border-border px-4 py-3 text-left hover:border-primary/50 hover:bg-muted/30 transition-colors group"
        >
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
            <Zap className="h-4.5 w-4.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Sesión libre</p>
            <p className="text-[11px] text-muted-foreground">Elige ejercicios individuales a tu ritmo</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>
      </div>

      {/* Day edit modal */}
      {editingDay && (
        <DayEditModal
          key={editingDay.id}
          open={true}
          onClose={() => setEditingDay(null)}
          routineId={routine.id}
          day={editingDay}
        />
      )}
    </div>
  );
}
