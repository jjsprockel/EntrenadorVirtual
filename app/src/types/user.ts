import type { Level, Objective } from './routine';

export interface UserProfile {
  name: string;
  age?: number;
  bodyWeightKg?: number;
  level: Level;
  primaryObjective: Objective;
  units: 'kg' | 'lb';
  minWeightIncrement: number;
  preferRestTimer: boolean;
  theme: 'light' | 'dark' | 'system';
  oneRMEstimates: Record<string, number>;
}
