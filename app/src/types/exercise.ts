export type MuscleGroup =
  | 'pecho'
  | 'espalda'
  | 'hombros'
  | 'biceps'
  | 'triceps'
  | 'cuadriceps'
  | 'isquiotibiales_gluteos'
  | 'pantorrillas'
  | 'core';

export type MovementPattern =
  | 'empuje_horizontal'
  | 'empuje_vertical'
  | 'traccion_horizontal'
  | 'traccion_vertical'
  | 'sentadilla'
  | 'bisagra'
  | 'aislamiento'
  | 'core';

export type Equipment =
  | 'barra'
  | 'mancuernas'
  | 'maquina'
  | 'polea'
  | 'peso_corporal'
  | 'kettlebell'
  | 'banco';

export type Level = 'principiante' | 'intermedio' | 'avanzado';

export interface Exercise {
  code: string;
  nameEs: string;
  nameEn: string[];
  muscleGroup: MuscleGroup;
  pattern: MovementPattern;
  equipment: Equipment[];
  level: Level;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  execution: string[];
  tips: string[];
  pitfalls: string[];
  alternativeCodes: string[];
  imagePath: string;
  isCustom?: boolean;
}
