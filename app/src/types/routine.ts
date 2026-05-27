import type { MuscleGroup, Level } from './exercise';
export type { Level } from './exercise';

export type Objective = 'hipertrofia' | 'fuerza' | 'mixto' | 'resistencia';
export type Structure = 'fullbody' | 'torso_pierna' | 'ppl' | 'weider' | 'custom';
export type PeriodizationType = 'ninguna' | 'lineal' | 'ondulante' | 'bloques';
export type SetType = 'normal' | 'piramide' | 'dropset' | 'superset';

export interface ExerciseSlot {
  id: string;
  exerciseCode: string;
  alternativeCodes: string[];
  sets: number;
  repsTarget: { min: number; max: number };
  rirTarget?: number;
  percentage1RM?: number;
  restSeconds: number;
  setType: SetType;
  notes?: string;
}

export interface RoutineDay {
  id: string;
  dayName: string;
  dayOfWeek?: number;
  muscleGroups: MuscleGroup[];
  exercises: ExerciseSlot[];
}

export interface PeriodizationBlock {
  id: string;
  name: string;
  weeks: number;
  repRange: { min: number; max: number };
  percentageRange: { min: number; max: number };
  volumeMultiplier: number;
}

export interface Routine {
  id: string;
  name: string;
  objective: Objective;
  level: Level;
  structure: Structure;
  daysPerWeek: number;
  durationWeeks: number;
  periodization: {
    type: PeriodizationType;
    weeklyIncrementKg?: number;
    blocks?: PeriodizationBlock[];
  };
  days: RoutineDay[];
  active: boolean;
  createdAt: Date;
  startedAt?: Date;
}
