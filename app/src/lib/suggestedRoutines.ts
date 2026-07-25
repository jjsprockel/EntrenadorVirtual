import type { Routine, RoutineDay, ExerciseSlot } from '@/types/routine';
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

function day(
  dayName: string,
  muscleGroups: MuscleGroup[],
  exercises: ExerciseSlot[],
): RoutineDay {
  return { id: crypto.randomUUID(), dayName, muscleGroups, exercises };
}

export interface SuggestedRoutine {
  id: string;
  name: string;
  description: string;
  objective: Routine['objective'];
  level: Routine['level'];
  daysPerWeek: number;
  durationWeeks: number;
  days: () => RoutineDay[];
}

// ── Rutina de Hellen — Split 5 días ──────────────────────────────────────────

const hellenLunes = (): RoutineDay =>
  day('Lunes — Glúteos y Femorales', ['isquiotibiales_gluteos', 'core'], [
    slot('I-03', 4, 8, 12, 120),
    slot('Q-07', 3, 10, 12, 90),
    slot('I-01', 4, 8, 10, 120),
    slot('I-06', 3, 12, 15, 60),
    slot('I-02', 3, 12, 15, 60),
    slot('C-01', 3, 1, 1, 45),
    slot('C-02', 3, 15, 20, 45),
  ]);

const hellenMartes = (): RoutineDay =>
  day('Martes — Espalda y Bíceps (Pull)', ['espalda', 'biceps', 'hombros'], [
    slot('E-02', 4, 8, 12, 120),
    slot('E-04', 3, 10, 12, 90),
    slot('E-10', 3, 12, 15, 60),
    slot('H-03', 3, 12, 15, 60),
    slot('B-03', 3, 10, 12, 60),
  ]);

const hellenMiercoles = (): RoutineDay =>
  day('Miércoles — Cuádriceps y Pantorrillas', ['cuadriceps', 'core'], [
    slot('Q-02', 4, 10, 12, 120),
    slot('Q-01', 4, 8, 10, 150),
    slot('Q-04', 3, 10, 12, 90),
    slot('Q-05', 3, 12, 15, 60),
    slot('C-01', 3, 1, 1, 45),
    slot('C-05', 3, 15, 20, 45),
  ]);

const hellenJueves = (): RoutineDay =>
  day('Jueves — Hombro, Pecho y Tríceps (Push)', ['hombros', 'pecho', 'triceps'], [
    slot('H-01', 4, 8, 10, 120),
    slot('H-04', 3, 12, 15, 60),
    slot('P-08', 3, 12, 15, 60),
    slot('H-03', 3, 12, 15, 60),
    slot('T-02', 3, 12, 15, 60),
  ]);

const hellenViernes = (): RoutineDay =>
  day('Viernes — Pierna Completa', ['cuadriceps', 'isquiotibiales_gluteos'], [
    slot('Q-01', 4, 8, 10, 150),
    slot('I-01', 4, 8, 10, 120),
    slot('I-03', 3, 10, 12, 90),
    slot('I-10', 3, 15, 20, 45),
    slot('I-09', 3, 15, 20, 45),
  ]);

// ── Registry ──────────────────────────────────────────────────────────────────

export const SUGGESTED_ROUTINES: SuggestedRoutine[] = [
  {
    id: 'hellen-5dias',
    name: 'Rutina de Hellen',
    description:
      'Split de 5 días: Piernas (glúteo/femoral), Pull, Cuádriceps/Pantorrillas, Push, Pierna completa.',
    objective: 'hipertrofia',
    level: 'intermedio',
    daysPerWeek: 5,
    durationWeeks: 0,
    days: () => [
      hellenLunes(),
      hellenMartes(),
      hellenMiercoles(),
      hellenJueves(),
      hellenViernes(),
    ],
  },
];
