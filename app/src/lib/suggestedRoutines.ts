import type { Routine, RoutineDay, ExerciseSlot } from '@/types/routine';
import type { MuscleGroup } from '@/types/exercise';

function slot(
  exerciseCode: string,
  sets: number,
  repsMin: number,
  repsMax: number,
  restSeconds: number,
  notes?: string,
  alternativeCodes?: string[],
): ExerciseSlot {
  return {
    id: crypto.randomUUID(),
    exerciseCode,
    alternativeCodes: alternativeCodes ?? [],
    sets,
    repsTarget: { min: repsMin, max: repsMax },
    restSeconds,
    setType: 'normal',
    notes,
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

// ── PPL 6 días — Versión simple ──────────────────────────────────────────────

const pplSimplePushA = (): RoutineDay =>
  day('Push A', ['pecho', 'hombros', 'triceps'], [
    slot('P-01', 4, 6, 8, 150),
    slot('H-01', 3, 8, 10, 120),
    slot('P-02', 3, 10, 12, 90),
    slot('H-03', 3, 12, 15, 60),
    slot('T-06', 3, 8, 10, 90),
    slot('T-02', 2, 12, 15, 60),
  ]);

const pplSimplePullA = (): RoutineDay =>
  day('Pull A', ['espalda', 'biceps'], [
    slot('E-06', 4, 5, 6, 180),
    slot('E-02', 4, 10, 12, 120),
    slot('E-03', 3, 8, 10, 120),
    slot('E-09', 3, 15, 20, 60),
    slot('B-01', 3, 10, 12, 75),
  ]);

const pplSimpleLegsA = (): RoutineDay =>
  day('Legs A', ['cuadriceps', 'isquiotibiales_gluteos', 'pantorrillas', 'core'], [
    slot('Q-01', 4, 6, 8, 150),
    slot('I-01', 3, 8, 10, 120),
    slot('Q-02', 3, 10, 12, 90),
    slot('I-07', 3, 12, 15, 60),
    slot('PA-01', 3, 15, 20, 45),
    slot('C-09', 3, 12, 15, 45),
  ]);

const pplSimplePushB = (): RoutineDay =>
  day('Push B', ['pecho', 'hombros', 'triceps'], [
    slot('P-04', 4, 8, 12, 120),
    slot('H-02', 3, 10, 12, 90),
    slot('P-06', 3, 12, 15, 60),
    slot('H-03', 4, 15, 20, 45),
    slot('T-01', 3, 10, 12, 75),
    slot('T-02', 2, 15, 20, 45),
  ]);

const pplSimplePullB = (): RoutineDay =>
  day('Pull B', ['espalda', 'biceps', 'trapecio'], [
    slot('E-02', 4, 10, 12, 120),
    slot('E-05', 3, 10, 12, 90),
    slot('E-10', 3, 12, 15, 60),
    slot('TR-01', 3, 12, 15, 60),
    slot('B-06', 3, 10, 12, 75),
    slot('B-03', 2, 12, 15, 45),
  ]);

const pplSimpleLegsB = (): RoutineDay =>
  day('Legs B', ['isquiotibiales_gluteos', 'cuadriceps', 'pantorrillas'], [
    slot('I-03', 4, 10, 12, 120),
    slot('Q-07', 3, 10, 12, 90, 'Por pierna'),
    slot('Q-05', 3, 12, 15, 60),
    slot('I-02', 3, 12, 15, 60),
    slot('I-13', 3, 15, 20, 45, 'Por pierna'),
    slot('PA-02', 3, 15, 20, 45),
  ]);

// ── Rutina Weider — Un grupo muscular por día (6 días) ───────────────────────

const weiderPecho = (): RoutineDay =>
  day('Lunes — Pecho', ['pecho'], [
    slot('P-01', 4, 8, 10, 150),
    slot('P-02', 3, 10, 12, 120),
    slot('P-09', 3, 10, 12, 90, undefined, ['P-04']),
    slot('P-05', 3, 12, 15, 60),
    slot('P-06', 3, 12, 15, 60),
  ]);

const weiderEspalda = (): RoutineDay =>
  day('Martes — Espalda', ['espalda', 'trapecio'], [
    slot('E-06', 4, 6, 8, 180),
    slot('E-01', 4, 8, 10, 120, undefined, ['E-02']),
    slot('E-03', 4, 8, 10, 120),
    slot('E-05', 3, 10, 12, 90),
    slot('E-10', 3, 12, 15, 60),
    slot('TR-01', 3, 12, 15, 60),
    slot('E-09', 3, 15, 20, 45),
  ]);

const weiderPiernas = (): RoutineDay =>
  day('Miércoles — Piernas', ['cuadriceps', 'isquiotibiales_gluteos', 'pantorrillas'], [
    slot('Q-01', 4, 8, 10, 180),
    slot('I-01', 4, 10, 12, 120),
    slot('Q-02', 3, 12, 15, 120),
    slot('I-02', 3, 12, 15, 60),
    slot('Q-05', 3, 15, 15, 60),
    slot('PA-01', 4, 15, 20, 45),
  ]);

const weiderHombros = (): RoutineDay =>
  day('Jueves — Hombros', ['hombros', 'trapecio'], [
    slot('H-01', 4, 8, 10, 150),
    slot('H-02', 3, 10, 12, 120),
    slot('H-03', 4, 12, 15, 60),
    slot('H-05', 3, 15, 20, 60),
    slot('H-04', 3, 12, 15, 45),
    slot('TR-05', 3, 12, 15, 60),
  ]);

const weiderBrazos = (): RoutineDay =>
  day('Viernes — Brazos', ['biceps', 'triceps', 'antebrazos'], [
    slot('B-01', 4, 8, 10, 90),
    slot('T-01', 4, 8, 10, 90),
    slot('B-06', 3, 10, 12, 60),
    slot('T-04', 3, 10, 12, 60),
    slot('B-03', 3, 12, 15, 45),
    slot('T-02', 3, 12, 15, 45),
    slot('AN-01', 3, 15, 20, 45),
  ]);

const weiderGluteosCore = (): RoutineDay =>
  day('Sábado — Glúteos y Core', ['isquiotibiales_gluteos', 'core'], [
    slot('I-03', 4, 10, 12, 120),
    slot('Q-07', 3, 10, 12, 90, 'Por pierna'),
    slot('I-13', 3, 15, 20, 45, 'Por pierna'),
    slot('I-14', 3, 12, 15, 45, 'Por pierna'),
    slot('C-09', 3, 12, 15, 45),
    slot('C-10', 3, 15, 15, 45, 'Por lado'),
  ]);

// ── Torso-Pierna 4 días ───────────────────────────────────────────────────────

const torsoPiernaTorsoA = (): RoutineDay =>
  day('Torso A — Horizontal y Pesado', ['pecho', 'espalda', 'hombros', 'biceps', 'triceps'], [
    slot('P-01', 4, 6, 8, 150),
    slot('E-03', 4, 6, 8, 150),
    slot('H-01', 3, 8, 10, 120),
    slot('E-02', 3, 10, 12, 90),
    slot('H-03', 3, 12, 15, 60),
    slot('B-01', 3, 10, 12, 75),
    slot('T-02', 3, 12, 15, 45),
  ]);

const torsoPiernaPiernaA = (): RoutineDay =>
  day('Pierna A — Énfasis en Sentadilla', ['cuadriceps', 'isquiotibiales_gluteos', 'pantorrillas', 'core'], [
    slot('Q-01', 4, 6, 8, 180),
    slot('I-01', 3, 8, 10, 120),
    slot('Q-02', 3, 10, 12, 120),
    slot('I-02', 3, 12, 15, 60),
    slot('PA-01', 4, 15, 20, 45),
    slot('C-09', 3, 12, 15, 45),
  ]);

const torsoPiernaTorsoB = (): RoutineDay =>
  day('Torso B — Vertical y Volumen', ['espalda', 'pecho', 'hombros', 'trapecio', 'biceps', 'triceps'], [
    slot('E-01', 4, 8, 10, 150, undefined, ['E-02']),
    slot('P-04', 4, 10, 12, 120),
    slot('E-05', 3, 10, 12, 90),
    slot('H-02', 3, 10, 12, 90),
    slot('P-06', 3, 12, 15, 60),
    slot('TR-01', 3, 12, 15, 60),
    slot('B-06', 3, 10, 12, 75),
    slot('T-01', 3, 10, 12, 60),
  ]);

const torsoPiernaPiernaB = (): RoutineDay =>
  day('Pierna B — Bisagra y Glúteo', ['isquiotibiales_gluteos', 'cuadriceps', 'espalda'], [
    slot('I-03', 4, 10, 12, 120),
    slot('Q-07', 3, 10, 12, 90, 'Por pierna'),
    slot('I-07', 3, 12, 15, 60),
    slot('Q-05', 3, 12, 15, 60),
    slot('E-13', 3, 12, 15, 60),
    slot('I-13', 3, 15, 20, 45, 'Por pierna'),
    slot('PA-02', 3, 15, 20, 45),
  ]);

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

// ── Glúteo en Polea — 1 día ───────────────────────────────────────────────────

const gluteoPoleaDia = (): RoutineDay =>
  day('Glúteo en Polea', ['isquiotibiales_gluteos'], [
    slot('I-06', 3, 15, 20, 45, 'Por pierna'),
    slot('I-13', 3, 15, 20, 45, 'Por pierna'),
    slot('I-14', 3, 15, 20, 45, 'Por pierna'),
    slot('I-15', 3, 15, 20, 45, 'Por pierna'),
    slot('I-16', 3, 15, 20, 45, 'Por pierna'),
  ]);

// ── Glúteo-Femoral-Abdomen — 1 día ────────────────────────────────────────────

const gluteoFemoralAbdomenDia = (): RoutineDay =>
  day('Glúteo, Femoral y Abdomen', ['isquiotibiales_gluteos', 'cuadriceps', 'core'], [
    slot('C-16', 1, 20, 20, 30, 'Calentamiento'),
    slot('C-15', 1, 15, 15, 30, 'Calentamiento'),
    slot('C-01', 1, 1, 1, 30, 'Calentamiento'),
    slot('Q-04', 1, 20, 20, 30, 'Calentamiento'),
    slot('I-03', 4, 8, 12, 120),
    slot('I-20', 4, 10, 12, 90),
    slot('I-06', 3, 12, 15, 60),
    slot('I-01', 4, 8, 12, 120),
    slot('I-02', 4, 10, 15, 90),
    slot('I-04', 3, 10, 12, 90),
    slot('C-02', 4, 20, 20, 45),
    slot('C-12', 4, 15, 15, 45),
    slot('C-01', 3, 1, 1, 45),
  ]);

// ── Abdomen Minimalista — 1 día ───────────────────────────────────────────────

const abdomenMinimalistaDia = (): RoutineDay =>
  day('Sesión breve de Abdomen', ['core'], [
    slot('C-11', 3, 8, 12, 45),
    slot('C-13', 3, 8, 12, 45),
    slot('C-05', 3, 8, 12, 45),
  ]);

// ── Registry ──────────────────────────────────────────────────────────────────

export const SUGGESTED_ROUTINES: SuggestedRoutine[] = [
  {
    id: 'ppl-6dias-simple',
    name: 'PPL 6 días — Versión simple',
    description:
      'Push / Pull / Legs x2 con progresión clásica de fuerza-hipertrofia. Plantilla directa para intermedios.',
    objective: 'hipertrofia',
    level: 'intermedio',
    daysPerWeek: 6,
    durationWeeks: 0,
    days: () => [
      pplSimplePushA(),
      pplSimplePullA(),
      pplSimpleLegsA(),
      pplSimplePushB(),
      pplSimplePullB(),
      pplSimpleLegsB(),
    ],
  },
  {
    id: 'weider-6dias',
    name: 'Rutina Weider — Un grupo muscular por día',
    description:
      'División clásica de gimnasio (6 días): cada sesión se dedica a un solo grupo muscular con más volumen. Pecho, Espalda, Piernas, Hombros, Brazos y Glúteos/Core.',
    objective: 'hipertrofia',
    level: 'intermedio',
    daysPerWeek: 6,
    durationWeeks: 0,
    days: () => [
      weiderPecho(),
      weiderEspalda(),
      weiderPiernas(),
      weiderHombros(),
      weiderBrazos(),
      weiderGluteosCore(),
    ],
  },
  {
    id: 'torso-pierna-4dias',
    name: 'Torso-Pierna 4 días',
    description:
      'Cada grupo muscular se entrena 2x/semana. Los días A cargan más peso con menos reps; los B suben el volumen y cambian los ángulos.',
    objective: 'hipertrofia',
    level: 'intermedio',
    daysPerWeek: 4,
    durationWeeks: 0,
    days: () => [
      torsoPiernaTorsoA(),
      torsoPiernaPiernaA(),
      torsoPiernaTorsoB(),
      torsoPiernaPiernaB(),
    ],
  },
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
  {
    id: 'gluteo-polea-1dia',
    name: 'Rutina de Glúteo en Polea',
    description:
      'Día único de aislamiento de glúteo con 5 variantes de patada en polea: estándar, lateral, rodilla flexionada, cruzada y polea alta.',
    objective: 'hipertrofia',
    level: 'principiante',
    daysPerWeek: 1,
    durationWeeks: 0,
    days: () => [gluteoPoleaDia()],
  },
  {
    id: 'gluteo-femoral-abdomen-1dia',
    name: 'Glúteo-Femoral-Abdomen (1 día)',
    description:
      'Día único: activación con calentamiento (sentadilla, puente, plancha, zancada), trabajo pesado de glúteo/femoral y finalizador de abdomen.',
    objective: 'hipertrofia',
    level: 'intermedio',
    daysPerWeek: 1,
    durationWeeks: 0,
    days: () => [gluteoFemoralAbdomenDia()],
  },
  {
    id: 'abdomen-minimalista-1dia',
    name: 'Sesión breve de Abdomen',
    description:
      'Día único y directo: 3 ejercicios de core (recto abdominal inferior, superior y oblicuos) a 3 series de 8 a 12.',
    objective: 'hipertrofia',
    level: 'principiante',
    daysPerWeek: 1,
    durationWeeks: 0,
    days: () => [abdomenMinimalistaDia()],
  },
];
