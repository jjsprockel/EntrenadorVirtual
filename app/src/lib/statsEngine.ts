import type { Session } from '@/types/session';

// ── Types ────────────────────────────────────────────────────────────────────

export interface WeeklyVolume {
  week: string;
  volume: number;
  sessions: number;
}

export interface ExerciseDataPoint {
  date: string;
  maxWeight: number;
  totalVolume: number;
  bestSet: string;
}

export interface PREntry {
  exerciseCode: string;
  maxWeight: number;
  repsAtMax: number;
  date: Date;
  e1rm: number;
}

export interface SummaryStats {
  totalSessions: number;
  totalVolume: number;
  weekVolume: number;
  prevWeekVolume: number;
  avgSessionVolume: number;
  uniqueExercises: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function isoWeekKey(date: Date): string {
  return startOfWeek(date).toISOString().slice(0, 10);
}

function shortDate(date: Date): string {
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function completed(sessions: Session[]) {
  return sessions.filter((s) => s.completedAt != null);
}

// ── Exports ──────────────────────────────────────────────────────────────────

export function getWeeklyVolume(sessions: Session[], weeksBack = 8): WeeklyVolume[] {
  const done = completed(sessions);
  const now = new Date();

  // Build slots for last N weeks
  type Slot = WeeklyVolume & { _key: string };
  const slots: Slot[] = [];
  for (let i = weeksBack - 1; i >= 0; i--) {
    const anchor = new Date(now);
    anchor.setDate(anchor.getDate() - i * 7);
    const sw = startOfWeek(anchor);
    slots.push({
      _key: isoWeekKey(anchor),
      week: shortDate(sw),
      volume: 0,
      sessions: 0,
    });
  }

  for (const s of done) {
    const key = isoWeekKey(new Date(s.date));
    const slot = slots.find((w) => w._key === key);
    if (slot) {
      slot.volume += s.totalVolume ?? 0;
      slot.sessions += 1;
    }
  }

  return slots.map(({ week, volume, sessions: sess }) => ({
    week,
    volume: Math.round(volume),
    sessions: sess,
  }));
}

export function getExerciseProgress(
  sessions: Session[],
  exerciseCode: string,
): ExerciseDataPoint[] {
  return completed(sessions)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .flatMap((s) => {
      const ex = s.exercises.find((e) => e.exerciseCode === exerciseCode);
      if (!ex) return [];
      const doneSets = ex.completedSets.filter((cs) => cs.status === 'completed');
      if (doneSets.length === 0) return [];

      const maxWeight = Math.max(...doneSets.map((cs) => cs.weight));
      const best = doneSets.find((cs) => cs.weight === maxWeight)!;
      const totalVolume = doneSets.reduce((sum, cs) => sum + cs.weight * cs.reps, 0);

      return [
        {
          date: shortDate(new Date(s.date)),
          maxWeight,
          totalVolume: Math.round(totalVolume),
          bestSet: `${best.weight} kg × ${best.reps}`,
        },
      ];
    });
}

export function getPersonalRecords(sessions: Session[]): PREntry[] {
  const prMap = new Map<string, PREntry>();

  for (const s of completed(sessions)) {
    for (const ex of s.exercises) {
      for (const cs of ex.completedSets) {
        if (cs.status !== 'completed' || cs.weight === 0) continue;
        const existing = prMap.get(ex.exerciseCode);
        if (!existing || cs.weight > existing.maxWeight) {
          // Epley formula: e1RM = w × (1 + r/30)
          const e1rm = Math.round(cs.weight * (1 + cs.reps / 30));
          prMap.set(ex.exerciseCode, {
            exerciseCode: ex.exerciseCode,
            maxWeight: cs.weight,
            repsAtMax: cs.reps,
            date: new Date(s.date),
            e1rm,
          });
        }
      }
    }
  }

  return Array.from(prMap.values()).sort((a, b) => b.maxWeight - a.maxWeight);
}

export function getSummaryStats(sessions: Session[]): SummaryStats {
  const done = completed(sessions);
  const totalVolume = done.reduce((sum, s) => sum + (s.totalVolume ?? 0), 0);

  const now = new Date();
  const thisWeekStart = startOfWeek(now).getTime();
  const prevWeekStart = thisWeekStart - 7 * 86_400_000;

  const weekVolume = done
    .filter((s) => new Date(s.date).getTime() >= thisWeekStart)
    .reduce((sum, s) => sum + (s.totalVolume ?? 0), 0);

  const prevWeekVolume = done
    .filter((s) => {
      const t = new Date(s.date).getTime();
      return t >= prevWeekStart && t < thisWeekStart;
    })
    .reduce((sum, s) => sum + (s.totalVolume ?? 0), 0);

  const codes = new Set<string>();
  done.forEach((s) => s.exercises.forEach((e) => codes.add(e.exerciseCode)));

  return {
    totalSessions: done.length,
    totalVolume: Math.round(totalVolume),
    weekVolume: Math.round(weekVolume),
    prevWeekVolume: Math.round(prevWeekVolume),
    avgSessionVolume: done.length ? Math.round(totalVolume / done.length) : 0,
    uniqueExercises: codes.size,
  };
}

/** All exercise codes that appear at least once in logged sessions. */
export function getLoggedExerciseCodes(sessions: Session[]): string[] {
  const codes = new Set<string>();
  completed(sessions).forEach((s) =>
    s.exercises.forEach((e) => {
      if (e.completedSets.some((cs) => cs.status === 'completed')) {
        codes.add(e.exerciseCode);
      }
    }),
  );
  return Array.from(codes).sort();
}
