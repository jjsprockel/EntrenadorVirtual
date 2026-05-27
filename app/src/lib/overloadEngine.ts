import type { Session } from '@/types/session';
import type { ExerciseSlot } from '@/types/routine';

/** Suggests next-session weight based on last performance for an exercise. */
export function suggestWeight(
  exerciseCode: string,
  slot: ExerciseSlot,
  sessions: Session[],
): number | undefined {
  const past = [...sessions]
    .filter((s) => s.completedAt != null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  for (const session of past) {
    const ex = session.exercises.find((e) => e.exerciseCode === exerciseCode);
    if (!ex) continue;

    const done = ex.completedSets.filter((s) => s.status === 'completed');
    if (done.length === 0) continue;

    const last = done[done.length - 1];
    const targetRIR = slot.rirTarget ?? 2;

    // Earned progression: hit max reps AND had remaining capacity
    if (last.reps >= slot.repsTarget.max && (last.rir ?? 3) <= targetRIR) {
      return +(last.weight + 2.5).toFixed(2);
    }
    return last.weight;
  }

  return undefined;
}
