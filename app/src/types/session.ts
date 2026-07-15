export type SetStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface CompletedSet {
  setNumber: number;
  weight: number;
  reps: number;
  rir?: number;
  status: SetStatus;
  timestamp: Date;
}

export interface SessionExercise {
  exerciseCode: string;
  originalCode: string;
  plannedSets: number;
  plannedReps: { min: number; max: number };
  rirTarget?: number;
  restSeconds: number;
  suggestedWeight?: number;
  completedSets: CompletedSet[];
  notes?: string;
}

export type CardioType =
  | 'caminadora'
  | 'eliptica'
  | 'bicicleta_estatica'
  | 'remo'
  | 'escaladora'
  | 'natacion'
  | 'otro';

export const CARDIO_LABELS: Record<CardioType, string> = {
  caminadora: 'Caminadora',
  eliptica: 'Elíptica',
  bicicleta_estatica: 'Bicicleta estática',
  remo: 'Remo',
  escaladora: 'Escaladora',
  natacion: 'Natación',
  otro: 'Otro',
};

export interface CardioEntry {
  id: string;
  type: CardioType;
  durationMinutes: number;
  distanceKm?: number;
  watts?: number;
  calories?: number;
}

export interface Session {
  id: string;
  userId?: string;
  routineId: string;
  dayId: string;
  dayName?: string;
  date: Date;
  exercises: SessionExercise[];
  startedAt: Date;
  completedAt?: Date;
  totalVolume?: number;
  notes?: string;
  cardioEntries?: CardioEntry[];
  totalCalories?: number;
}
