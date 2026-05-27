import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '@/lib/db';
import type { Exercise } from '@/types/exercise';

interface ExerciseState {
  exercises: Exercise[];
  customExercises: Exercise[];
  isLoaded: boolean;
  // Built-in exercises are loaded at runtime from the markdown — not persisted
  setExercises: (exercises: Exercise[]) => void;
  addCustomExercise: (exercise: Exercise) => void;
  removeCustomExercise: (code: string) => void;
  getByCode: (code: string) => Exercise | undefined;
  getAlternatives: (code: string) => Exercise[];
  getAllExercises: () => Exercise[];
}

export const useExerciseStore = create<ExerciseState>()(
  persist(
    (set, get) => ({
      exercises: [],
      customExercises: [],
      isLoaded: false,

      setExercises: (exercises) => set({ exercises, isLoaded: true }),

      addCustomExercise: (exercise) =>
        set((state) => ({
          customExercises: [
            ...state.customExercises.filter((e) => e.code !== exercise.code),
            exercise,
          ],
        })),

      removeCustomExercise: (code) =>
        set((state) => ({
          customExercises: state.customExercises.filter((e) => e.code !== code),
        })),

      getAllExercises: () => [...get().exercises, ...get().customExercises],

      getByCode: (code) => get().getAllExercises().find((e) => e.code === code),

      getAlternatives: (code) => {
        const exercise = get().getByCode(code);
        if (!exercise) return [];
        return exercise.alternativeCodes
          .map((c) => get().getByCode(c))
          .filter((e): e is Exercise => e !== undefined);
      },
    }),
    {
      name: 'custom-exercises',
      storage: createJSONStorage(() => idbStorage),
      // Only persist user-created exercises; built-ins reload from markdown
      partialize: (state) => ({ customExercises: state.customExercises }),
    },
  ),
);
