import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '@/lib/db';
import type { Routine } from '@/types/routine';

interface RoutineState {
  routines: Routine[];
  activeRoutineId: string | null;
  addRoutine: (routine: Routine) => void;
  updateRoutine: (id: string, partial: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  setActiveRoutine: (id: string | null) => void;
  getActiveRoutine: () => Routine | undefined;
  getUserRoutines: (userId: string, isAdmin: boolean) => Routine[];
}

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set, get) => ({
      routines: [],
      activeRoutineId: null,

      addRoutine: (routine) =>
        set((state) => ({ routines: [...state.routines, routine] })),

      updateRoutine: (id, partial) =>
        set((state) => ({
          routines: state.routines.map((r) => (r.id === id ? { ...r, ...partial } : r)),
        })),

      deleteRoutine: (id) =>
        set((state) => ({
          routines: state.routines.filter((r) => r.id !== id),
          activeRoutineId: state.activeRoutineId === id ? null : state.activeRoutineId,
        })),

      setActiveRoutine: (id) =>
        set((state) => ({
          activeRoutineId: id,
          routines: state.routines.map((r) => ({ ...r, active: r.id === id })),
        })),

      getActiveRoutine: () => {
        const { routines, activeRoutineId } = get();
        return routines.find((r) => r.id === activeRoutineId);
      },

      getUserRoutines: (userId, isAdmin) => {
        const { routines } = get();
        return routines.filter((r) => r.userId === userId || (isAdmin && !r.userId));
      },
    }),
    {
      name: 'routines',
      storage: createJSONStorage(() => idbStorage),
    },
  ),
);
