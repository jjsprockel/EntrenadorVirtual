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

export interface Session {
  id: string;
  routineId: string;
  dayId: string;
  dayName?: string;
  date: Date;
  exercises: SessionExercise[];
  startedAt: Date;
  completedAt?: Date;
  totalVolume?: number;
  notes?: string;
}
