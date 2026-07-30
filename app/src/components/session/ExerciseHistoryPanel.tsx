import { useMemo, useState } from 'react';
import { ChevronDown, History } from 'lucide-react';
import { useSessionStore } from '@/stores/sessionStore';
import { useUsersStore } from '@/stores/usersStore';
import { getExerciseSetHistory } from '@/lib/statsEngine';

interface Props {
  exerciseCode: string;
}

export default function ExerciseHistoryPanel({ exerciseCode }: Props) {
  const [open, setOpen] = useState(false);
  const { getUserSessions } = useSessionStore();
  const sessions = useSessionStore((s) => s.sessions);
  const activeUserId = useUsersStore((s) => s.activeUserId);
  const isAdmin = useUsersStore((s) => s.getActiveUser()?.role === 'admin');

  const userSessions = useMemo(
    () => getUserSessions(activeUserId ?? '', isAdmin ?? false),
    [sessions, activeUserId, isAdmin, getUserSessions],
  );

  const history = useMemo(
    () => getExerciseSetHistory(userSessions, exerciseCode, 6),
    [userSessions, exerciseCode],
  );

  return (
    <div className="mt-2 rounded-lg border border-border/60 bg-muted/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left"
      >
        <History className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="flex-1 text-xs font-medium text-muted-foreground">
          {open ? 'Ocultar historial' : 'Ver historial de entrenamientos'}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-border/60 px-3 py-2.5 space-y-3">
          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground py-1">
              Sin historial previo para este ejercicio.
            </p>
          ) : (
            history.map((h, i) => (
              <div key={i} className="space-y-1">
                <p className="text-[11px] font-semibold text-foreground/80">
                  {h.date.toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: '2-digit',
                  })}
                </p>
                <div className="space-y-0.5">
                  {h.sets.map((s) => (
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
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
