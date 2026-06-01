import type { RoutineDay } from '@/types/routine';
import type { MuscleGroup } from '@/types/exercise';

/**
 * Returns true when the average weekly frequency per muscle group is ≤ 1.5.
 * Covers all 3-day splits where each muscle appears once per week.
 */
export function isLowFrequencyDays(days: RoutineDay[]): boolean {
  if (days.length === 0) return false;

  const freq = new Map<MuscleGroup, number>();
  for (const d of days) {
    for (const mg of d.muscleGroups) {
      freq.set(mg, (freq.get(mg) ?? 0) + 1);
    }
  }

  if (freq.size === 0) return false;

  let total = 0;
  freq.forEach((count) => { total += count; });
  return total / freq.size <= 1.5;
}
