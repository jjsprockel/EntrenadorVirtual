import type { Session, CompletedSet } from '@/types/session';

// ── Metric & time-range types ─────────────────────────────────────────────────

export type MetricType = 'volume' | 'maxWeight' | 'reps';

export interface TimeRangeOption {
  key: string;
  label: string;
  weeks: number; // 0 = all time
}

export const TIME_RANGES: TimeRangeOption[] = [
  { key: '4w',  label: '4 sem',   weeks: 4  },
  { key: '8w',  label: '8 sem',   weeks: 8  },
  { key: '13w', label: '3 meses', weeks: 13 },
  { key: '26w', label: '6 meses', weeks: 26 },
  { key: '52w', label: '1 año',   weeks: 52 },
  { key: 'all', label: 'Todo',    weeks: 0  },
];

export const METRIC_LABELS: Record<MetricType, string> = {
  volume:    'Volumen',
  maxWeight: 'Peso máx',
  reps:      'Repeticiones',
};

export const METRIC_UNITS: Record<MetricType, string> = {
  volume:    'kg',
  maxWeight: 'kg',
  reps:      'reps',
};

// ── Chart data types ──────────────────────────────────────────────────────────

export interface ChartBar {
  period: string;
  value: number;
  sessions: number;
}

export interface ExercisePoint {
  date: string;
  volume: number;
  maxWeight: number;
  totalReps: number;
  bestSet: string;
}

// ── Legacy types (kept for backward compat) ───────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function isoMonthKey(date: Date): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function shortDate(date: Date): string {
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function shortMonth(date: Date): string {
  return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
}

function completed(sessions: Session[]) {
  return sessions.filter((s) => s.completedAt != null);
}

// ── Core: generic chart data ──────────────────────────────────────────────────

/**
 * Returns bucketed chart data (weekly if weeksBack ≤ 13, monthly otherwise).
 * Pass `codeFilter` to restrict which exercises count (undefined = all).
 */
export function getChartData(
  sessions: Session[],
  metric: MetricType,
  weeksBack: number,
  codeFilter?: string[],
): ChartBar[] {
  const done = completed(sessions);
  if (done.length === 0) return [];

  const codeSet = codeFilter ? new Set(codeFilter) : null;

  let effectiveWeeks = weeksBack;
  if (weeksBack === 0) {
    const earliest = done.reduce(
      (min, s) => Math.min(min, new Date(s.date).getTime()),
      Date.now(),
    );
    effectiveWeeks = Math.ceil((Date.now() - earliest) / (7 * 86_400_000)) + 1;
    if (effectiveWeeks < 1) effectiveWeeks = 1;
  }

  return effectiveWeeks > 13
    ? buildMonthlyBars(done, metric, effectiveWeeks, codeSet)
    : buildWeeklyBars(done, metric, effectiveWeeks, codeSet);
}

function buildWeeklyBars(
  done: Session[],
  metric: MetricType,
  weeksBack: number,
  codeSet: Set<string> | null,
): ChartBar[] {
  const now = new Date();
  type Slot = ChartBar & { _key: string; _maxVal: number };

  const slots: Slot[] = [];
  for (let i = weeksBack - 1; i >= 0; i--) {
    const anchor = new Date(now);
    anchor.setDate(anchor.getDate() - i * 7);
    slots.push({
      _key: isoWeekKey(anchor),
      period: shortDate(startOfWeek(anchor)),
      value: 0,
      sessions: 0,
      _maxVal: 0,
    });
  }

  for (const s of done) {
    const key = isoWeekKey(new Date(s.date));
    const slot = slots.find((w) => w._key === key);
    if (!slot) continue;

    const exList = codeSet
      ? s.exercises.filter((e) => codeSet.has(e.exerciseCode))
      : s.exercises;
    const sets = exList.flatMap((e) =>
      e.completedSets.filter((cs) => cs.status === 'completed'),
    );
    if (sets.length === 0) continue;

    slot.sessions += 1;
    if (metric === 'volume') {
      slot.value += sets.reduce((sum, cs) => sum + cs.weight * cs.reps, 0);
    } else if (metric === 'maxWeight') {
      const max = Math.max(...sets.map((cs) => cs.weight));
      slot._maxVal = Math.max(slot._maxVal, max);
    } else {
      slot.value += sets.reduce((sum, cs) => sum + cs.reps, 0);
    }
  }

  return slots.map(({ period, value, sessions: sess, _maxVal }) => ({
    period,
    value: Math.round(metric === 'maxWeight' ? _maxVal : value),
    sessions: sess,
  }));
}

function buildMonthlyBars(
  done: Session[],
  metric: MetricType,
  weeksBack: number,
  codeSet: Set<string> | null,
): ChartBar[] {
  const now = new Date();
  const monthsBack = Math.ceil(weeksBack / 4.33);

  type Slot = ChartBar & { _key: string; _maxVal: number };
  const slots: Slot[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const anchor = new Date(now.getFullYear(), now.getMonth() - i, 1);
    slots.push({
      _key: isoMonthKey(anchor),
      period: shortMonth(anchor),
      value: 0,
      sessions: 0,
      _maxVal: 0,
    });
  }

  for (const s of done) {
    const key = isoMonthKey(new Date(s.date));
    const slot = slots.find((m) => m._key === key);
    if (!slot) continue;

    const exList = codeSet
      ? s.exercises.filter((e) => codeSet.has(e.exerciseCode))
      : s.exercises;
    const sets = exList.flatMap((e) =>
      e.completedSets.filter((cs) => cs.status === 'completed'),
    );
    if (sets.length === 0) continue;

    slot.sessions += 1;
    if (metric === 'volume') {
      slot.value += sets.reduce((sum, cs) => sum + cs.weight * cs.reps, 0);
    } else if (metric === 'maxWeight') {
      const max = Math.max(...sets.map((cs) => cs.weight));
      slot._maxVal = Math.max(slot._maxVal, max);
    } else {
      slot.value += sets.reduce((sum, cs) => sum + cs.reps, 0);
    }
  }

  return slots.map(({ period, value, sessions: sess, _maxVal }) => ({
    period,
    value: Math.round(metric === 'maxWeight' ? _maxVal : value),
    sessions: sess,
  }));
}

// ── Exercise-level time series ────────────────────────────────────────────────

/** Per-session data points for a single exercise, filtered by time range. */
export function getExercisePoints(
  sessions: Session[],
  exerciseCode: string,
  weeksBack: number,
): ExercisePoint[] {
  const done = completed(sessions);
  const now = Date.now();
  const cutoff = weeksBack === 0 ? 0 : now - weeksBack * 7 * 86_400_000;

  return done
    .filter((s) => cutoff === 0 || new Date(s.date).getTime() >= cutoff)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .flatMap((s) => {
      const ex = s.exercises.find((e) => e.exerciseCode === exerciseCode);
      if (!ex) return [];
      const sets = ex.completedSets.filter((cs) => cs.status === 'completed');
      if (sets.length === 0) return [];

      const maxWeight = Math.max(...sets.map((cs) => cs.weight));
      const best = sets.find((cs) => cs.weight === maxWeight)!;
      const totalVolume = sets.reduce((sum, cs) => sum + cs.weight * cs.reps, 0);
      const totalReps = sets.reduce((sum, cs) => sum + cs.reps, 0);

      return [
        {
          date: shortDate(new Date(s.date)),
          volume: Math.round(totalVolume),
          maxWeight,
          totalReps,
          bestSet: `${best.weight} kg × ${best.reps}`,
        },
      ];
    });
}

// ── Per-set exercise history (for the "last sessions" panel during a workout) ──

export interface ExerciseSessionHistory {
  date: Date;
  sets: CompletedSet[];
}

/**
 * Returns, most-recent-first, the completed sets logged for `exerciseCode` in
 * each of the last `limit` sessions that included it — full per-set detail
 * (weight, reps, RIR), not aggregated like getExercisePoints.
 */
export function getExerciseSetHistory(
  sessions: Session[],
  exerciseCode: string,
  limit = 6,
): ExerciseSessionHistory[] {
  const done = completed(sessions)
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const history: ExerciseSessionHistory[] = [];

  for (const s of done) {
    if (history.length >= limit) break;
    const ex = s.exercises.find((e) => e.exerciseCode === exerciseCode);
    if (!ex) continue;
    const sets = ex.completedSets.filter((cs) => cs.status === 'completed');
    if (sets.length === 0) continue;
    history.push({ date: new Date(s.date), sets });
  }

  return history;
}

// ── Legacy exports (unchanged) ────────────────────────────────────────────────

export function getWeeklyVolume(sessions: Session[], weeksBack = 8): WeeklyVolume[] {
  const done = completed(sessions);
  const now = new Date();

  type Slot = WeeklyVolume & { _key: string };
  const slots: Slot[] = [];
  for (let i = weeksBack - 1; i >= 0; i--) {
    const anchor = new Date(now);
    anchor.setDate(anchor.getDate() - i * 7);
    const sw = startOfWeek(anchor);
    slots.push({ _key: isoWeekKey(anchor), week: shortDate(sw), volume: 0, sessions: 0 });
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
