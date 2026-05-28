/**
 * Demo data generator.
 * Creates 4 simulated users with 3–6 months of realistic training history.
 * Uses a deterministic pseudo-random function so results are reproducible.
 */

import { useUsersStore } from '@/stores/usersStore';
import { useRoutineStore } from '@/stores/routineStore';
import { useSessionStore } from '@/stores/sessionStore';
import { AVATAR_COLORS } from '@/types/user';
import type { AppUser, UserProfile } from '@/types/user';
import type { Routine, RoutineDay, ExerciseSlot } from '@/types/routine';
import type { Session, SessionExercise, CompletedSet } from '@/types/session';
import type { MuscleGroup } from '@/types/exercise';

// ── Deterministic pseudo-random ───────────────────────────────────────────────

function drand(n: number): number {
  return Math.abs(Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1;
}

function round25(v: number) {
  return Math.round(v / 2.5) * 2.5;
}

// ── Exercise seed config ──────────────────────────────────────────────────────

interface ExSeed {
  code: string;
  startWeight: number;   // kg at week 0 for this user
  incPerWeek: number;    // kg progression/week
  sets: number;
  repMin: number;
  repMax: number;
  rest: number;          // seconds
}

// ── User seed definitions ─────────────────────────────────────────────────────

interface DayDef {
  name: string;
  muscleGroups: MuscleGroup[];
  exercises: ExSeed[];
}

interface UserSeed {
  profile: Omit<UserProfile, 'oneRMEstimates'>;
  avatarColor: string;
  weeksBack: number;
  sessionsPerWeek: number;
  days: DayDef[];
}

// today = 2026-05-28
const TODAY = new Date('2026-05-28T12:00:00');

function daysAgo(d: number): Date {
  return new Date(TODAY.getTime() - d * 86_400_000);
}

const USER_SEEDS: UserSeed[] = [
  // ── Carlos — Intermedio, Hipertrofia, 22 semanas ───────────────────────────
  {
    profile: {
      name: 'Carlos',
      age: 26,
      bodyWeightKg: 80,
      level: 'intermedio',
      primaryObjective: 'hipertrofia',
      units: 'kg',
      minWeightIncrement: 2.5,
      preferRestTimer: true,
      theme: 'dark',
    },
    avatarColor: AVATAR_COLORS[1],  // blue
    weeksBack: 22,
    sessionsPerWeek: 5,
    days: [
      {
        name: 'Push',
        muscleGroups: ['pecho', 'hombros', 'triceps'],
        exercises: [
          { code: 'P-01', startWeight: 70,  incPerWeek: 1.25, sets: 4, repMin: 6,  repMax: 10, rest: 180 },
          { code: 'P-02', startWeight: 55,  incPerWeek: 1.0,  sets: 3, repMin: 8,  repMax: 12, rest: 120 },
          { code: 'H-01', startWeight: 45,  incPerWeek: 0.75, sets: 3, repMin: 8,  repMax: 12, rest: 120 },
          { code: 'P-05', startWeight: 14,  incPerWeek: 0.5,  sets: 3, repMin: 12, repMax: 15, rest: 90  },
          { code: 'T-01', startWeight: 25,  incPerWeek: 0.5,  sets: 3, repMin: 12, repMax: 15, rest: 90  },
        ],
      },
      {
        name: 'Pull',
        muscleGroups: ['espalda', 'biceps'],
        exercises: [
          { code: 'E-01', startWeight: 0,   incPerWeek: 0.75, sets: 4, repMin: 6,  repMax: 10, rest: 180 },
          { code: 'E-03', startWeight: 65,  incPerWeek: 1.0,  sets: 4, repMin: 6,  repMax: 10, rest: 150 },
          { code: 'E-04', startWeight: 22,  incPerWeek: 0.75, sets: 3, repMin: 8,  repMax: 12, rest: 120 },
          { code: 'E-09', startWeight: 12,  incPerWeek: 0.25, sets: 3, repMin: 15, repMax: 20, rest: 90  },
          { code: 'B-01', startWeight: 30,  incPerWeek: 0.5,  sets: 3, repMin: 8,  repMax: 12, rest: 90  },
        ],
      },
      {
        name: 'Piernas',
        muscleGroups: ['cuadriceps', 'isquiotibiales_gluteos'],
        exercises: [
          { code: 'Q-01', startWeight: 80,  incPerWeek: 1.5,  sets: 4, repMin: 6,  repMax: 10, rest: 240 },
          { code: 'E-06', startWeight: 100, incPerWeek: 1.5,  sets: 3, repMin: 5,  repMax: 8,  rest: 240 },
          { code: 'Q-02', startWeight: 120, incPerWeek: 1.5,  sets: 3, repMin: 10, repMax: 15, rest: 150 },
          { code: 'I-03', startWeight: 60,  incPerWeek: 1.25, sets: 3, repMin: 10, repMax: 15, rest: 120 },
          { code: 'I-02', startWeight: 70,  incPerWeek: 1.0,  sets: 3, repMin: 10, repMax: 12, rest: 120 },
        ],
      },
    ],
  },

  // ── María — Principiante, Mixto, 13 semanas ───────────────────────────────
  {
    profile: {
      name: 'María',
      age: 24,
      bodyWeightKg: 62,
      level: 'principiante',
      primaryObjective: 'mixto',
      units: 'kg',
      minWeightIncrement: 2.5,
      preferRestTimer: true,
      theme: 'dark',
    },
    avatarColor: AVATAR_COLORS[4],  // pink
    weeksBack: 13,
    sessionsPerWeek: 3,
    days: [
      {
        name: 'Fullbody A',
        muscleGroups: ['pecho', 'espalda', 'cuadriceps'],
        exercises: [
          { code: 'P-01', startWeight: 25,  incPerWeek: 2.5,  sets: 3, repMin: 8,  repMax: 12, rest: 150 },
          { code: 'E-02', startWeight: 30,  incPerWeek: 2.5,  sets: 3, repMin: 10, repMax: 15, rest: 120 },
          { code: 'Q-01', startWeight: 30,  incPerWeek: 2.5,  sets: 3, repMin: 10, repMax: 15, rest: 150 },
          { code: 'H-01', startWeight: 15,  incPerWeek: 1.25, sets: 3, repMin: 10, repMax: 15, rest: 120 },
          { code: 'I-03', startWeight: 40,  incPerWeek: 3.0,  sets: 3, repMin: 12, repMax: 15, rest: 90  },
        ],
      },
      {
        name: 'Fullbody B',
        muscleGroups: ['pecho', 'espalda', 'isquiotibiales_gluteos'],
        exercises: [
          { code: 'P-04', startWeight: 10,  incPerWeek: 1.0,  sets: 3, repMin: 10, repMax: 15, rest: 120 },
          { code: 'E-07', startWeight: 25,  incPerWeek: 2.0,  sets: 3, repMin: 10, repMax: 15, rest: 120 },
          { code: 'I-02', startWeight: 30,  incPerWeek: 2.5,  sets: 3, repMin: 12, repMax: 15, rest: 120 },
          { code: 'H-02', startWeight: 5,   incPerWeek: 0.5,  sets: 3, repMin: 12, repMax: 15, rest: 90  },
          { code: 'B-02', startWeight: 7.5, incPerWeek: 0.5,  sets: 3, repMin: 12, repMax: 15, rest: 90  },
        ],
      },
    ],
  },

  // ── Lucas — Avanzado, Fuerza, 26 semanas ──────────────────────────────────
  {
    profile: {
      name: 'Lucas',
      age: 32,
      bodyWeightKg: 92,
      level: 'avanzado',
      primaryObjective: 'fuerza',
      units: 'kg',
      minWeightIncrement: 2.5,
      preferRestTimer: true,
      theme: 'dark',
    },
    avatarColor: AVATAR_COLORS[2],  // green
    weeksBack: 26,
    sessionsPerWeek: 4,
    days: [
      {
        name: 'Torso Fuerza',
        muscleGroups: ['pecho', 'espalda'],
        exercises: [
          { code: 'P-01', startWeight: 110, incPerWeek: 0.5,  sets: 5, repMin: 3,  repMax: 5,  rest: 300 },
          { code: 'E-03', startWeight: 100, incPerWeek: 0.5,  sets: 4, repMin: 4,  repMax: 6,  rest: 240 },
          { code: 'P-02', startWeight: 85,  incPerWeek: 0.5,  sets: 3, repMin: 5,  repMax: 8,  rest: 180 },
          { code: 'E-04', startWeight: 45,  incPerWeek: 0.25, sets: 3, repMin: 6,  repMax: 8,  rest: 150 },
        ],
      },
      {
        name: 'Piernas Fuerza',
        muscleGroups: ['cuadriceps', 'isquiotibiales_gluteos'],
        exercises: [
          { code: 'Q-01', startWeight: 130, incPerWeek: 0.5,  sets: 5, repMin: 3,  repMax: 5,  rest: 360 },
          { code: 'E-06', startWeight: 160, incPerWeek: 0.5,  sets: 3, repMin: 3,  repMax: 5,  rest: 360 },
          { code: 'I-02', startWeight: 110, incPerWeek: 0.5,  sets: 3, repMin: 5,  repMax: 8,  rest: 240 },
          { code: 'Q-02', startWeight: 200, incPerWeek: 1.0,  sets: 3, repMin: 6,  repMax: 10, rest: 180 },
        ],
      },
      {
        name: 'Press y Tirón',
        muscleGroups: ['hombros', 'espalda', 'triceps', 'biceps'],
        exercises: [
          { code: 'H-01', startWeight: 75,  incPerWeek: 0.5,  sets: 4, repMin: 3,  repMax: 6,  rest: 300 },
          { code: 'E-01', startWeight: 20,  incPerWeek: 0.5,  sets: 4, repMin: 4,  repMax: 6,  rest: 240 },
          { code: 'E-09', startWeight: 20,  incPerWeek: 0.25, sets: 3, repMin: 15, repMax: 20, rest: 90  },
          { code: 'B-01', startWeight: 55,  incPerWeek: 0.25, sets: 3, repMin: 6,  repMax: 8,  rest: 120 },
        ],
      },
    ],
  },

  // ── Sofía — Intermedio, Resistencia, 17 semanas ───────────────────────────
  {
    profile: {
      name: 'Sofía',
      age: 28,
      bodyWeightKg: 68,
      level: 'intermedio',
      primaryObjective: 'resistencia',
      units: 'kg',
      minWeightIncrement: 2.5,
      preferRestTimer: false,
      theme: 'dark',
    },
    avatarColor: AVATAR_COLORS[3],  // yellow
    weeksBack: 17,
    sessionsPerWeek: 4,
    days: [
      {
        name: 'Pecho / Tríceps',
        muscleGroups: ['pecho', 'triceps'],
        exercises: [
          { code: 'P-01', startWeight: 45,  incPerWeek: 1.0,  sets: 4, repMin: 12, repMax: 15, rest: 90  },
          { code: 'P-02', startWeight: 35,  incPerWeek: 0.75, sets: 3, repMin: 12, repMax: 15, rest: 90  },
          { code: 'P-08', startWeight: 35,  incPerWeek: 0.5,  sets: 3, repMin: 12, repMax: 15, rest: 90  },
          { code: 'T-01', startWeight: 22,  incPerWeek: 0.5,  sets: 3, repMin: 15, repMax: 20, rest: 60  },
          { code: 'T-02', startWeight: 25,  incPerWeek: 0.5,  sets: 3, repMin: 12, repMax: 15, rest: 60  },
        ],
      },
      {
        name: 'Espalda / Bíceps',
        muscleGroups: ['espalda', 'biceps'],
        exercises: [
          { code: 'E-02', startWeight: 40,  incPerWeek: 0.75, sets: 4, repMin: 12, repMax: 15, rest: 90  },
          { code: 'E-07', startWeight: 40,  incPerWeek: 0.75, sets: 3, repMin: 12, repMax: 15, rest: 90  },
          { code: 'E-05', startWeight: 30,  incPerWeek: 0.5,  sets: 3, repMin: 12, repMax: 15, rest: 90  },
          { code: 'B-02', startWeight: 10,  incPerWeek: 0.25, sets: 3, repMin: 15, repMax: 20, rest: 60  },
          { code: 'E-09', startWeight: 10,  incPerWeek: 0.25, sets: 3, repMin: 15, repMax: 20, rest: 60  },
        ],
      },
      {
        name: 'Piernas',
        muscleGroups: ['cuadriceps', 'isquiotibiales_gluteos', 'pantorrillas'],
        exercises: [
          { code: 'Q-01', startWeight: 50,  incPerWeek: 1.0,  sets: 4, repMin: 12, repMax: 15, rest: 120 },
          { code: 'I-03', startWeight: 55,  incPerWeek: 1.0,  sets: 3, repMin: 15, repMax: 20, rest: 90  },
          { code: 'Q-03', startWeight: 30,  incPerWeek: 0.5,  sets: 3, repMin: 15, repMax: 20, rest: 60  },
          { code: 'I-01', startWeight: 25,  incPerWeek: 0.5,  sets: 3, repMin: 12, repMax: 15, rest: 90  },
        ],
      },
      {
        name: 'Hombros / Full',
        muscleGroups: ['hombros'],
        exercises: [
          { code: 'H-01', startWeight: 25,  incPerWeek: 0.75, sets: 4, repMin: 12, repMax: 15, rest: 90  },
          { code: 'H-02', startWeight: 7,   incPerWeek: 0.25, sets: 3, repMin: 15, repMax: 20, rest: 60  },
          { code: 'H-03', startWeight: 6,   incPerWeek: 0.25, sets: 3, repMin: 15, repMax: 20, rest: 60  },
          { code: 'E-09', startWeight: 8,   incPerWeek: 0.25, sets: 3, repMin: 15, repMax: 20, rest: 60  },
        ],
      },
    ],
  },
];

// ── Session generator ─────────────────────────────────────────────────────────

function generateSessions(
  userId: string,
  routineId: string,
  days: { dayId: string; name: string; exercises: ExSeed[] }[],
  weeksBack: number,
  sessionsPerWeek: number,
): Session[] {
  const sessions: Session[] = [];

  // Training day patterns (Mon=0 … Sun=6) per sessions-per-week target
  const DAY_PATTERNS: Record<number, number[][]> = {
    3: [[0, 2, 4], [1, 3, 5], [0, 2, 5]],
    4: [[0, 1, 3, 4], [0, 2, 3, 5], [1, 2, 4, 5]],
    5: [[0, 1, 2, 3, 4], [0, 1, 3, 4, 5], [1, 2, 3, 4, 6]],
  };
  const patterns = DAY_PATTERNS[sessionsPerWeek] ?? DAY_PATTERNS[4];

  let daySeqIdx = 0; // cycles through routine days

  for (let w = 0; w < weeksBack; w++) {
    // Week start (Monday)
    const weekStartMs =
      TODAY.getTime() - (weeksBack - w) * 7 * 86_400_000;

    // Skip ~12% of weeks entirely (vacation / sick)
    if (drand(userId.charCodeAt(0) + w * 31) < 0.12) continue;

    // Deload every 7 weeks: reduce session count to 3, lighter weights handled below
    const isDeloadWeek = w % 7 === 6;

    const pattern = patterns[w % patterns.length];
    const sessionDays = isDeloadWeek ? pattern.slice(0, Math.min(3, pattern.length)) : pattern;

    // Occasionally skip one session (fatigue/busy)
    const skipIdx =
      drand(w * 17 + userId.charCodeAt(1)) < 0.2
        ? Math.floor(drand(w * 13) * sessionDays.length)
        : -1;

    for (let sd = 0; sd < sessionDays.length; sd++) {
      if (sd === skipIdx) continue;

      const dayOffset = sessionDays[sd]; // 0=Mon
      const sessionDate = new Date(weekStartMs + dayOffset * 86_400_000);

      // Don't generate sessions in the future
      if (sessionDate > TODAY) continue;

      const routineDay = days[daySeqIdx % days.length];
      daySeqIdx++;

      const exercises = routineDay.exercises.map((ex) =>
        buildExercise(ex, w, isDeloadWeek, sd),
      );

      const totalVolume = exercises.reduce(
        (sum, ex) =>
          sum + ex.completedSets.reduce((s, cs) => s + cs.weight * cs.reps, 0),
        0,
      );

      const startedAt = new Date(sessionDate.getTime() + 8 * 3_600_000);
      const completedAt = new Date(startedAt.getTime() + (60 + drand(w + sd) * 30) * 60_000);

      sessions.push({
        id: crypto.randomUUID(),
        userId,
        routineId,
        dayId: routineDay.dayId,
        dayName: routineDay.name,
        date: sessionDate,
        startedAt,
        completedAt,
        totalVolume: Math.round(totalVolume),
        exercises,
      });
    }
  }

  return sessions;
}

function buildExercise(ex: ExSeed, weekIdx: number, isDeload: boolean, sessionSlot: number): SessionExercise {
  // Deload: 85% of progressive weight; normal: linear + small variance
  const rawWeight = ex.startWeight + weekIdx * ex.incPerWeek;
  const deloadFactor = isDeload ? 0.85 : 1;
  const variance = (drand(weekIdx * 11 + sessionSlot * 7 + ex.code.charCodeAt(0)) - 0.5) * 2.5;
  const sessionWeight = Math.max(ex.startWeight * 0.5, round25(rawWeight * deloadFactor + variance));

  const completedSets: CompletedSet[] = [];
  for (let s = 0; s < ex.sets; s++) {
    // Last set tends to have slightly fewer reps (fatigue)
    const fatiguePenalty = s === ex.sets - 1 ? Math.floor(drand(weekIdx + s) * 2) : 0;
    const reps = Math.max(
      ex.repMin,
      ex.repMax - fatiguePenalty - (isDeload ? Math.ceil((ex.repMax - ex.repMin) / 2) : 0),
    );
    const rir = isDeload ? 3 : s === ex.sets - 1 ? 1 : 2;

    completedSets.push({
      setNumber: s + 1,
      weight: sessionWeight,
      reps,
      rir,
      status: 'completed',
      timestamp: new Date(),
    });
  }

  return {
    exerciseCode: ex.code,
    originalCode: ex.code,
    plannedSets: ex.sets,
    plannedReps: { min: ex.repMin, max: ex.repMax },
    rirTarget: 2,
    restSeconds: ex.rest,
    completedSets,
  };
}

// ── Routine builder ───────────────────────────────────────────────────────────

function buildRoutine(userId: string, seed: UserSeed): Routine {
  const dayObjs: RoutineDay[] = seed.days.map((d) => ({
    id: crypto.randomUUID(),
    dayName: d.name,
    muscleGroups: d.muscleGroups,
    exercises: d.exercises.map(
      (ex): ExerciseSlot => ({
        id: crypto.randomUUID(),
        exerciseCode: ex.code,
        alternativeCodes: [],
        sets: ex.sets,
        repsTarget: { min: ex.repMin, max: ex.repMax },
        rirTarget: 2,
        restSeconds: ex.rest,
        setType: 'normal',
      }),
    ),
  }));

  return {
    id: crypto.randomUUID(),
    userId,
    name: `Rutina ${seed.profile.name}`,
    objective: seed.profile.primaryObjective,
    level: seed.profile.level,
    structure: seed.days.length >= 5 ? 'weider' : seed.days.length === 3 ? 'ppl' : 'torso_pierna',
    daysPerWeek: seed.sessionsPerWeek,
    durationWeeks: seed.weeksBack,
    periodization: { type: 'lineal', weeklyIncrementKg: seed.profile.level === 'avanzado' ? 0.5 : 1.25 },
    days: dayObjs,
    active: false,
    createdAt: daysAgo(seed.weeksBack * 7 + 3),
    startedAt: daysAgo(seed.weeksBack * 7),
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export function isDemoDataLoaded(): boolean {
  const { users } = useUsersStore.getState();
  return users.some((u) => ['Carlos', 'María', 'Lucas', 'Sofía'].includes(u.profile.name));
}

export function seedDemoData(): void {
  if (isDemoDataLoaded()) return;

  const { bulkAddUsers } = useUsersStore.getState();
  const { bulkAddRoutines } = useRoutineStore.getState();
  const { bulkAddSessions } = useSessionStore.getState();

  const newUsers: AppUser[] = [];
  const newRoutines: Routine[] = [];
  const newSessions: Session[] = [];

  USER_SEEDS.forEach((seed, i) => {
    const userId = crypto.randomUUID();

    const user: AppUser = {
      id: userId,
      role: 'user',
      avatarColor: seed.avatarColor,
      createdAt: daysAgo(seed.weeksBack * 7 + 5),
      profile: { ...seed.profile, oneRMEstimates: {} },
    };
    newUsers.push(user);

    const routine = buildRoutine(userId, seed);
    newRoutines.push(routine);

    const dayRefs = routine.days.map((d, di) => ({
      dayId: d.id,
      name: seed.days[di].name,
      exercises: seed.days[di].exercises,
    }));

    const userSessions = generateSessions(
      userId,
      routine.id,
      dayRefs,
      seed.weeksBack,
      seed.sessionsPerWeek,
    );
    newSessions.push(...userSessions);

    // Suppress unused variable warning for `i`
    void i;
  });

  bulkAddUsers(newUsers);
  bulkAddRoutines(newRoutines);
  bulkAddSessions(newSessions);
}
