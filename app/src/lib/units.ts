import { useUsersStore } from '@/stores/usersStore';

// Weights are always stored in kilograms. Pounds are only an input/display unit.

export type WeightUnit = 'kg' | 'lb';

export const LB_PER_KG = 2.2046226218;

/** Stepper increment per unit (smallest common plate pair). */
export const WEIGHT_STEP: Record<WeightUnit, number> = { kg: 2.5, lb: 5 };

const round = (n: number, decimals: number) => {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
};

/** Converts a stored kg value to the display unit (rounded to 0.1). */
export function fromKg(kg: number, unit: WeightUnit): number {
  return round(unit === 'lb' ? kg * LB_PER_KG : kg, 1);
}

/** Converts a value entered in `unit` to kg for storage (2 decimals keeps lb round-trips exact). */
export function toKg(value: number, unit: WeightUnit): number {
  return round(unit === 'lb' ? value / LB_PER_KG : value, 2);
}

/** "61.2 kg" / "135 lb" */
export function formatWeight(kg: number, unit: WeightUnit): string {
  return `${fromKg(kg, unit)} ${unit}`;
}

/** Active user's preferred weight unit, and a setter that saves it to the profile. */
export function useWeightUnit(): [WeightUnit, (unit: WeightUnit) => void] {
  const activeUserId = useUsersStore((s) => s.activeUserId);
  const unit = useUsersStore((s) => s.getActiveUser()?.profile.units ?? 'kg');
  const updateUserProfile = useUsersStore((s) => s.updateUserProfile);
  const setUnit = (u: WeightUnit) => {
    if (activeUserId) updateUserProfile(activeUserId, { units: u });
  };
  return [unit, setUnit];
}
