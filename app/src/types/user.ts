import type { Level, Objective } from './routine';

export const AVATAR_COLORS = [
  '#FF6B35', '#3B82F6', '#10B981', '#F59E0B',
  '#EC4899', '#8B5CF6', '#14B8A6', '#EF4444',
];

export type UserRole = 'admin' | 'user';

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

export interface AppUser {
  id: string;
  role: UserRole;
  avatarColor: string;
  createdAt: Date;
  profile: UserProfile;
  email?: string;
  passwordHash?: string;
  tempPassword?: string; // initial/reset password visible to admin until user changes it
}
