import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '@/lib/db';
import type { BodyMeasurement } from '@/types/measurement';

// Local-only for now: there is no Supabase table for body measurements yet,
// so nothing is enqueued in the sync engine.

interface MeasurementState {
  measurements: BodyMeasurement[];
  addMeasurement: (m: BodyMeasurement) => void;
  updateMeasurement: (id: string, partial: Partial<BodyMeasurement>) => void;
  deleteMeasurement: (id: string) => void;
  /** Sorted oldest → newest. Admin also sees legacy untagged entries. */
  getUserMeasurements: (userId: string, isAdmin: boolean) => BodyMeasurement[];
}

const byDate = (a: BodyMeasurement, b: BodyMeasurement) =>
  a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);

export const useMeasurementStore = create<MeasurementState>()(
  persist(
    (set, get) => ({
      measurements: [],

      addMeasurement: (m) => set((state) => ({ measurements: [...state.measurements, m] })),

      updateMeasurement: (id, partial) =>
        set((state) => ({
          measurements: state.measurements.map((m) => (m.id === id ? { ...m, ...partial } : m)),
        })),

      deleteMeasurement: (id) =>
        set((state) => ({ measurements: state.measurements.filter((m) => m.id !== id) })),

      getUserMeasurements: (userId, isAdmin) =>
        get()
          .measurements.filter((m) => m.userId === userId || (isAdmin && !m.userId))
          .sort(byDate),
    }),
    {
      name: 'body-measurements',
      storage: createJSONStorage(() => idbStorage),
    },
  ),
);
