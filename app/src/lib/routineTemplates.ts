import type { Routine, RoutineDay, ExerciseSlot, PeriodizationType } from '@/types/routine';
import type { MuscleGroup } from '@/types/exercise';

function slot(
  exerciseCode: string,
  sets: number,
  repsMin: number,
  repsMax: number,
  restSeconds: number,
): ExerciseSlot {
  return {
    id: crypto.randomUUID(),
    exerciseCode,
    alternativeCodes: [],
    sets,
    repsTarget: { min: repsMin, max: repsMax },
    restSeconds,
    setType: 'normal',
  };
}

function richSlot(
  exerciseCode: string,
  sets: number,
  repsMin: number,
  repsMax: number,
  restSeconds: number,
  opts?: { alternativeCodes?: string[]; rirTarget?: number; notes?: string },
): ExerciseSlot {
  return {
    id: crypto.randomUUID(),
    exerciseCode,
    alternativeCodes: opts?.alternativeCodes ?? [],
    sets,
    repsTarget: { min: repsMin, max: repsMax },
    restSeconds,
    setType: 'normal',
    rirTarget: opts?.rirTarget,
    notes: opts?.notes,
  };
}

function day(
  dayName: string,
  muscleGroups: MuscleGroup[],
  exercises: ExerciseSlot[],
): RoutineDay {
  return { id: crypto.randomUUID(), dayName, muscleGroups, exercises };
}

// ── Template A — Fullbody 3x/semana ──────────────────────────────────────────

const fullbodyDay = (): RoutineDay =>
  day('Fullbody', ['pecho', 'espalda', 'cuadriceps', 'isquiotibiales_gluteos', 'hombros'], [
    slot('Q-01', 3, 8, 12, 120),
    slot('P-01', 3, 8, 12, 120),
    slot('E-03', 3, 8, 12, 120),
    slot('I-01', 3, 10, 12, 120),
    slot('H-02', 2, 10, 12, 90),
    slot('B-01', 2, 12, 15, 60),
    slot('T-02', 2, 12, 15, 60),
    slot('C-01', 3, 1, 1, 45),
  ]);

// ── Template B — Torso / Pierna 4x/semana ────────────────────────────────────

const torsoA = (): RoutineDay =>
  day('Torso A', ['pecho', 'espalda', 'hombros', 'biceps', 'triceps'], [
    slot('P-01', 4, 6, 10, 150),
    slot('E-03', 4, 6, 10, 150),
    slot('H-01', 3, 8, 12, 120),
    slot('E-02', 3, 8, 12, 120),
    slot('H-03', 3, 12, 15, 60),
    slot('B-01', 3, 10, 12, 60),
    slot('T-02', 3, 10, 12, 60),
  ]);

const piernaA = (): RoutineDay =>
  day('Pierna A', ['cuadriceps', 'isquiotibiales_gluteos', 'pantorrillas'], [
    slot('Q-01', 4, 6, 10, 150),
    slot('I-01', 4, 8, 10, 150),
    slot('Q-02', 3, 10, 12, 120),
    slot('Q-07', 3, 10, 12, 90),
    slot('Q-05', 3, 12, 15, 60),
    slot('I-02', 3, 12, 15, 60),
    slot('PA-01', 4, 15, 20, 60),
  ]);

const torsoB = (): RoutineDay =>
  day('Torso B', ['pecho', 'espalda', 'hombros', 'biceps', 'triceps'], [
    slot('P-02', 4, 8, 12, 120),
    slot('E-04', 4, 8, 12, 120),
    slot('H-02', 3, 10, 12, 90),
    slot('E-01', 3, 6, 10, 150),
    slot('H-03', 4, 12, 20, 60),
    slot('B-02', 3, 12, 15, 60),
    slot('T-04', 3, 10, 12, 90),
  ]);

const piernaB = (): RoutineDay =>
  day('Pierna B', ['cuadriceps', 'isquiotibiales_gluteos', 'pantorrillas'], [
    slot('Q-03', 4, 6, 10, 150),
    slot('I-03', 4, 10, 15, 90),
    slot('Q-02', 3, 12, 15, 90),
    slot('Q-04', 3, 10, 12, 90),
    slot('Q-05', 3, 15, 20, 60),
    slot('I-02', 3, 15, 20, 60),
    slot('PA-01', 4, 15, 20, 60),
  ]);

// ── Template C — PPL 6x/semana ────────────────────────────────────────────────

const pushA = (): RoutineDay =>
  day('Push A', ['pecho', 'hombros', 'triceps'], [
    slot('P-01', 4, 6, 10, 150),
    slot('P-02', 3, 10, 12, 120),
    slot('H-01', 3, 8, 12, 120),
    slot('H-03', 4, 12, 20, 60),
    slot('T-01', 3, 10, 12, 90),
    slot('T-02', 3, 12, 15, 60),
  ]);

const pullA = (): RoutineDay =>
  day('Pull A', ['espalda', 'biceps'], [
    slot('E-01', 4, 6, 10, 150),
    slot('E-03', 4, 6, 10, 150),
    slot('E-05', 3, 10, 12, 90),
    slot('E-09', 3, 15, 20, 60),
    slot('B-01', 3, 10, 12, 60),
    slot('B-03', 3, 12, 15, 60),
  ]);

const legsA = (): RoutineDay =>
  day('Legs A', ['cuadriceps', 'isquiotibiales_gluteos', 'pantorrillas'], [
    slot('Q-01', 4, 6, 10, 180),
    slot('Q-02', 3, 10, 12, 120),
    slot('I-01', 4, 8, 12, 120),
    slot('Q-07', 3, 10, 12, 90),
    slot('Q-05', 3, 12, 15, 60),
    slot('I-02', 3, 12, 15, 60),
    slot('I-03', 3, 12, 15, 90),
    slot('PA-01', 4, 15, 20, 60),
  ]);

const pushB = (): RoutineDay =>
  day('Push B', ['pecho', 'hombros', 'triceps'], [
    slot('P-04', 4, 10, 12, 120),
    slot('P-07', 3, 12, 15, 90),
    slot('H-02', 3, 10, 12, 90),
    slot('H-03', 4, 15, 20, 60),
    slot('T-01', 3, 12, 15, 90),
    slot('T-02', 3, 15, 18, 60),
  ]);

const pullB = (): RoutineDay =>
  day('Pull B', ['espalda', 'biceps'], [
    slot('E-02', 4, 8, 12, 120),
    slot('E-04', 4, 10, 12, 90),
    slot('E-07', 3, 12, 15, 90),
    slot('E-09', 3, 15, 20, 60),
    slot('B-04', 3, 12, 15, 60),
    slot('B-05', 3, 10, 12, 60),
  ]);

const legsB = (): RoutineDay =>
  day('Legs B', ['cuadriceps', 'isquiotibiales_gluteos', 'pantorrillas'], [
    slot('Q-03', 4, 6, 10, 180),
    slot('Q-02', 3, 12, 15, 120),
    slot('I-01', 4, 10, 12, 120),
    slot('Q-04', 3, 10, 12, 90),
    slot('Q-05', 3, 15, 20, 60),
    slot('I-02', 3, 15, 20, 60),
    slot('I-03', 3, 15, 20, 90),
    slot('PA-02', 4, 15, 20, 60),
  ]);

// ── Template D — Antagonista 3 días ──────────────────────────────────────────

const antagonistaDay1 = (): RoutineDay => ({
  id: crypto.randomUUID(),
  dayName: 'Día 1 — Espalda + Tríceps',
  muscleGroups: ['espalda', 'triceps'],
  exercises: [
    richSlot('E-06', 4, 5,  8,  180, { alternativeCodes: ['I-01'],              rirTarget: 2 }),
    richSlot('E-01', 4, 8,  12, 120, { alternativeCodes: ['E-02'],              rirTarget: 2 }),
    richSlot('E-03', 4, 8,  10, 120, { alternativeCodes: ['E-04','E-05','E-07'],rirTarget: 2 }),
    richSlot('E-04', 3, 10, 12, 90,  { alternativeCodes: ['E-05','E-07'],       rirTarget: 2 }),
    richSlot('T-06', 3, 8,  10, 120, { alternativeCodes: ['T-01'],              rirTarget: 2 }),
    richSlot('T-01', 3, 10, 12, 90,  { alternativeCodes: ['T-04'],              rirTarget: 2 }),
    richSlot('T-02', 3, 12, 15, 60,  { alternativeCodes: ['T-05'],              rirTarget: 1 }),
    richSlot('E-09', 3, 15, 20, 60,  { alternativeCodes: ['H-05'],              rirTarget: 1 }),
  ],
});

const antagonistaDay2 = (): RoutineDay => ({
  id: crypto.randomUUID(),
  dayName: 'Día 2 — Bíceps + Pecho + Hombro',
  muscleGroups: ['biceps', 'pecho', 'hombros'],
  exercises: [
    richSlot('P-01', 4, 6,  10, 180, { alternativeCodes: ['P-04','P-07'],       rirTarget: 2 }),
    richSlot('H-01', 4, 6,  10, 180, { alternativeCodes: ['H-02'],              rirTarget: 2 }),
    richSlot('P-02', 3, 8,  12, 120, { alternativeCodes: ['P-07'],              rirTarget: 2 }),
    richSlot('H-03', 4, 12, 15, 60,  { alternativeCodes: [],                    rirTarget: 1, notes: 'Excelente con polea para tensión constante' }),
    richSlot('P-05', 3, 12, 15, 60,  { alternativeCodes: ['P-06','P-08'],       rirTarget: 1 }),
    richSlot('B-01', 4, 8,  12, 90,  { alternativeCodes: ['B-02','B-04'],       rirTarget: 2 }),
    richSlot('B-02', 3, 10, 12, 60,  { alternativeCodes: ['B-04','B-05'],       rirTarget: 1, notes: 'Supinar la muñeca durante el curl' }),
    richSlot('H-05', 3, 15, 20, 60,  { alternativeCodes: ['E-09'],              rirTarget: 1 }),
  ],
});

const antagonistaDay3 = (): RoutineDay => ({
  id: crypto.randomUUID(),
  dayName: 'Día 3 — Piernas',
  muscleGroups: ['cuadriceps', 'isquiotibiales_gluteos', 'pantorrillas'],
  exercises: [
    richSlot('Q-01',  4, 6,  10, 180, { alternativeCodes: ['Q-02','Q-03'],       rirTarget: 2 }),
    richSlot('I-01',  4, 8,  10, 120, { alternativeCodes: ['I-04'],              rirTarget: 2 }),
    richSlot('Q-02',  3, 10, 12, 120, { alternativeCodes: ['Q-06'],              rirTarget: 2 }),
    richSlot('Q-07',  3, 10, 12, 90,  { alternativeCodes: ['Q-04'],              rirTarget: 2, notes: 'Por lado' }),
    richSlot('Q-05',  3, 12, 15, 60,  {                                          rirTarget: 1 }),
    richSlot('I-02',  3, 12, 15, 60,  {                                          rirTarget: 1 }),
    richSlot('I-03',  3, 10, 15, 90,  { alternativeCodes: ['I-05'],              rirTarget: 2 }),
    richSlot('PA-01', 4, 15, 20, 60,  { alternativeCodes: ['PA-02','PA-03'],     rirTarget: 1 }),
  ],
});

// ── Template E — PPL 3 días Sinergista ────────────────────────────────────────

const ppl3Day1 = (): RoutineDay => ({
  id: crypto.randomUUID(),
  dayName: 'Día 1 — Pull (Espalda + Bíceps)',
  muscleGroups: ['espalda', 'biceps'],
  exercises: [
    richSlot('E-06', 4, 5,  8,  180, { alternativeCodes: ['I-01'],               rirTarget: 2 }),
    richSlot('E-01', 4, 8,  12, 120, { alternativeCodes: ['E-02'],               rirTarget: 2 }),
    richSlot('E-03', 4, 8,  10, 120, { alternativeCodes: ['E-04','E-05','E-07'], rirTarget: 2 }),
    richSlot('E-05', 3, 10, 12, 90,  { alternativeCodes: ['E-04','E-07'],        rirTarget: 2 }),
    richSlot('E-09', 3, 15, 20, 60,  { alternativeCodes: ['H-05'],               rirTarget: 1 }),
    richSlot('B-01', 4, 8,  12, 90,  { alternativeCodes: ['B-02','B-04'],        rirTarget: 2 }),
    richSlot('B-03', 3, 10, 12, 60,  { alternativeCodes: ['B-02','B-04'],        rirTarget: 1 }),
  ],
});

const ppl3Day2 = (): RoutineDay => ({
  id: crypto.randomUUID(),
  dayName: 'Día 2 — Push (Pecho + Hombro + Tríceps)',
  muscleGroups: ['pecho', 'hombros', 'triceps'],
  exercises: [
    richSlot('P-01', 4, 6,  10, 180, { alternativeCodes: ['P-04','P-07'],        rirTarget: 2 }),
    richSlot('H-01', 4, 6,  10, 180, { alternativeCodes: ['H-02'],               rirTarget: 2 }),
    richSlot('P-02', 3, 8,  12, 120, { alternativeCodes: ['P-04','P-07'],        rirTarget: 2 }),
    richSlot('H-03', 4, 12, 15, 60,  { alternativeCodes: [],                     rirTarget: 1 }),
    richSlot('P-05', 3, 12, 15, 60,  { alternativeCodes: ['P-06','P-08'],        rirTarget: 1 }),
    richSlot('T-06', 3, 8,  10, 120, { alternativeCodes: ['T-01'],               rirTarget: 2 }),
    richSlot('T-02', 3, 12, 15, 60,  { alternativeCodes: ['T-04','T-05'],        rirTarget: 1 }),
  ],
});

const ppl3Day3 = (): RoutineDay => ({
  id: crypto.randomUUID(),
  dayName: 'Día 3 — Piernas',
  muscleGroups: ['cuadriceps', 'isquiotibiales_gluteos', 'pantorrillas'],
  exercises: [
    richSlot('Q-01',  4, 6,  10, 180, { alternativeCodes: ['Q-02','Q-03'],       rirTarget: 2 }),
    richSlot('I-01',  4, 8,  10, 120, { alternativeCodes: ['I-04'],              rirTarget: 2 }),
    richSlot('Q-02',  3, 10, 12, 120, { alternativeCodes: ['Q-06'],              rirTarget: 2 }),
    richSlot('Q-07',  3, 10, 12, 90,  { alternativeCodes: ['Q-04'],              rirTarget: 2, notes: 'Por lado' }),
    richSlot('Q-05',  3, 12, 15, 60,  {                                          rirTarget: 1 }),
    richSlot('I-02',  3, 12, 15, 60,  {                                          rirTarget: 1 }),
    richSlot('I-03',  3, 10, 15, 90,  { alternativeCodes: ['I-05'],              rirTarget: 2 }),
    richSlot('PA-01', 4, 15, 20, 60,  { alternativeCodes: ['PA-02','PA-03'],     rirTarget: 1 }),
  ],
});

// ── Template registry ─────────────────────────────────────────────────────────

export interface RoutineTemplate {
  id: string;
  name: string;
  description: string;
  structure: Routine['structure'];
  daysPerWeek: number;
  level: Routine['level'];
  objective: Routine['objective'];
  periodizationType?: PeriodizationType;
  weeklyIncrementKg?: number;
  days: () => RoutineDay[];
}

export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    id: 'fullbody-3',
    name: 'Fullbody 3x/semana',
    description: 'Cuerpo completo cada sesión. Ideal para principiantes.',
    structure: 'fullbody',
    daysPerWeek: 3,
    level: 'principiante',
    objective: 'hipertrofia',
    days: () => [
      { ...fullbodyDay(), dayName: 'Fullbody A' },
      { ...fullbodyDay(), dayName: 'Fullbody B', id: crypto.randomUUID() },
      { ...fullbodyDay(), dayName: 'Fullbody C', id: crypto.randomUUID() },
    ],
  },
  {
    id: 'torso-pierna-4',
    name: 'Torso / Pierna 4x/semana',
    description: 'Divide tren superior e inferior. Principiante-Intermedio.',
    structure: 'torso_pierna',
    daysPerWeek: 4,
    level: 'intermedio',
    objective: 'hipertrofia',
    days: () => [torsoA(), piernaA(), torsoB(), piernaB()],
  },
  {
    id: 'ppl-6',
    name: 'PPL 6x/semana',
    description: 'Push / Pull / Legs x2. Máximo volumen para intermedios.',
    structure: 'ppl',
    daysPerWeek: 6,
    level: 'intermedio',
    objective: 'hipertrofia',
    days: () => [pushA(), pullA(), legsA(), pushB(), pullB(), legsB()],
  },
  {
    id: 'ppl-3',
    name: 'PPL 3 días (Sinergista)',
    description: 'Pull, Push, Piernas en 3 días. El split más clásico y respaldado por la ciencia.',
    structure: 'ppl_3dias',
    daysPerWeek: 3,
    level: 'principiante',
    objective: 'hipertrofia',
    periodizationType: 'lineal',
    weeklyIncrementKg: 2.5,
    days: () => [ppl3Day1(), ppl3Day2(), ppl3Day3()],
  },
  {
    id: 'antagonista-3',
    name: 'Antagonista 3 días',
    description: 'Tríceps con Espalda, Bíceps con Pecho+Hombro, Piernas. Combina músculos opuestos.',
    structure: 'antagonista_3dias',
    daysPerWeek: 3,
    level: 'intermedio',
    objective: 'hipertrofia',
    periodizationType: 'lineal',
    weeklyIncrementKg: 2.5,
    days: () => [antagonistaDay1(), antagonistaDay2(), antagonistaDay3()],
  },
  {
    id: 'custom',
    name: 'Personalizada',
    description: 'Empieza desde cero y configura todo a tu medida.',
    structure: 'custom',
    daysPerWeek: 4,
    level: 'intermedio',
    objective: 'hipertrofia',
    days: () => [],
  },
];
