import { supabase, isSupabaseConfigured } from './supabase';
import { useRoutineStore } from '@/stores/routineStore';
import { useSessionStore } from '@/stores/sessionStore';
import type { Routine, RoutineDay, ExerciseSlot } from '@/types/routine';
import type { Session, SessionExercise, CompletedSet, SetStatus } from '@/types/session';
import type { MuscleGroup } from '@/types/exercise';

// ── DB row shapes (subset of database.types.ts for internal use) ──────────────

interface DbRoutineRow {
  id: string; user_id: string; name: string; objective: string; level: string;
  structure: string; days_per_week: number; duration_weeks: number | null;
  periodization: unknown; active: boolean; started_at: string | null;
  routine_days?: DbRoutineDayRow[];
}

interface DbRoutineDayRow {
  id: string; routine_id: string; day_name: string; day_order: number;
  muscle_groups: string[]; exercises: unknown;
}

interface DbSessionRow {
  id: string; user_id: string; routine_id: string | null;
  routine_day_id: string | null; session_date: string; started_at: string;
  completed_at: string | null; total_volume_kg: number | null; notes: string | null;
  session_sets?: DbSessionSetRow[];
}

interface DbSessionSetRow {
  id: string; session_id: string; user_id: string; exercise_code: string;
  original_exercise_code: string | null; set_number: number;
  weight_kg: number | null; reps: number | null; rir: number | null;
  status: string; completed_at: string;
}

// ── Type mappers (DB row → local) ─────────────────────────────────────────────

function fromDbRoutineDay(row: DbRoutineDayRow): RoutineDay {
  return {
    id: row.id,
    dayName: row.day_name,
    dayOfWeek: row.day_order,
    muscleGroups: row.muscle_groups as MuscleGroup[],
    exercises: (row.exercises ?? []) as ExerciseSlot[],
  };
}

function fromDbRoutine(row: DbRoutineRow): Routine {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    objective: row.objective as Routine['objective'],
    level: row.level as Routine['level'],
    structure: row.structure as Routine['structure'],
    daysPerWeek: row.days_per_week,
    durationWeeks: row.duration_weeks ?? 8,
    periodization: row.periodization as Routine['periodization'],
    days: (row.routine_days ?? []).map(fromDbRoutineDay),
    active: row.active,
    createdAt: new Date(),
    startedAt: row.started_at ? new Date(row.started_at) : undefined,
  };
}

function fromDbSession(row: DbSessionRow): Session {
  const sets = row.session_sets ?? [];

  const exerciseMap = new Map<string, { original: string; sets: CompletedSet[] }>();
  for (const s of sets) {
    const code = s.exercise_code;
    if (!exerciseMap.has(code)) {
      exerciseMap.set(code, { original: s.original_exercise_code ?? code, sets: [] });
    }
    exerciseMap.get(code)!.sets.push({
      setNumber: s.set_number,
      weight: s.weight_kg ?? 0,
      reps: s.reps ?? 0,
      rir: s.rir ?? undefined,
      status: s.status as SetStatus,
      timestamp: new Date(s.completed_at),
    });
  }

  const exercises: SessionExercise[] = Array.from(exerciseMap.entries()).map(([code, data]) => ({
    exerciseCode: code,
    originalCode: data.original,
    plannedSets: data.sets.length,
    plannedReps: { min: 0, max: 0 },
    restSeconds: 90,
    completedSets: data.sets,
  }));

  return {
    id: row.id,
    userId: row.user_id,
    routineId: row.routine_id ?? '',
    dayId: row.routine_day_id ?? '',
    date: new Date(row.session_date),
    exercises,
    startedAt: new Date(row.started_at),
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    totalVolume: row.total_volume_kg ?? undefined,
    notes: row.notes ?? undefined,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function restoreForUser(userId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  const [routinesResult, sessionsResult] = await Promise.all([
    supabase.from('routines').select('*, routine_days(*)').eq('user_id', userId),
    supabase.from('sessions').select('*, session_sets(*)').eq('user_id', userId),
  ]);

  if (routinesResult.error) {
    console.error('[cloudSync] Failed to restore routines:', routinesResult.error);
  } else if (routinesResult.data?.length) {
    const routineStore = useRoutineStore.getState();
    const existingIds = new Set(routineStore.routines.map((r) => r.id));
    const toAdd = (routinesResult.data as DbRoutineRow[])
      .map(fromDbRoutine)
      .filter((r) => !existingIds.has(r.id));
    if (toAdd.length) routineStore.bulkAddRoutines(toAdd);
  }

  if (sessionsResult.error) {
    console.error('[cloudSync] Failed to restore sessions:', sessionsResult.error);
  } else if (sessionsResult.data?.length) {
    const sessionStore = useSessionStore.getState();
    const existingIds = new Set(sessionStore.sessions.map((s) => s.id));
    const toAdd = (sessionsResult.data as DbSessionRow[])
      .map(fromDbSession)
      .filter((s) => !existingIds.has(s.id));
    if (toAdd.length) sessionStore.bulkAddSessions(toAdd);
  }
}
