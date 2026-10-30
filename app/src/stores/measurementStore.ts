import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '@/lib/db';
import type { BodyComposition, BodyMeasurement } from '@/types/measurement';

// Local-only for now: there is no Supabase table for body measurements yet,
// so nothing is enqueued in the sync engine.

interface MeasurementState {
  measurements: BodyMeasurement[];
  addMeasurement: (m: BodyMeasurement) => void;
  updateMeasurement: (id: string, partial: Partial<BodyMeasurement>) => void;
  deleteMeasurement: (id: string) => void;
  /** Sorted oldest → newest. Admin also sees legacy untagged entries. */
  getUserMeasurements: (userId: string, isAdmin: boolean) => BodyMeasurement[];

  compositions: BodyComposition[];
  addComposition: (c: BodyComposition) => void;
  updateComposition: (id: string, partial: Partial<BodyComposition>) => void;
  deleteComposition: (id: string) => void;
  /** Sorted oldest → newest. Admin also sees legacy untagged entries. */
  getUserCompositions: (userId: string, isAdmin: boolean) => BodyComposition[];
}

const byDate = (a: { date: string; createdAt: string }, b: { date: string; createdAt: string }) =>
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

      compositions: [],

      addComposition: (c) => set((state) => ({ compositions: [...state.compositions, c] })),

      updateComposition: (id, partial) =>
        set((state) => ({
          compositions: state.compositions.map((c) => (c.id === id ? { ...c, ...partial } : c)),
        })),

      deleteComposition: (id) =>
        set((state) => ({ compositions: state.compositions.filter((c) => c.id !== id) })),

      getUserCompositions: (userId, isAdmin) =>
        get()
          .compositions.filter((c) => c.userId === userId || (isAdmin && !c.userId))
          .sort(byDate),
    }),
    {
      name: 'body-measurements',
      storage: createJSONStorage(() => idbStorage),
    },
  ),
);
