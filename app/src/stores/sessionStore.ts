import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '@/lib/db';
import { syncEngine } from '@/lib/syncEngine';
import type { Session, SessionExercise, CompletedSet, CardioEntry } from '@/types/session';

interface CompleteOpts {
  cardioEntries?: CardioEntry[];
  totalCalories?: number;
}

interface SessionState {
  sessions: Session[];
  activeSession: Session | null;
  // Rest timer target is an absolute timestamp (not a countdown) so it survives
  // route navigation, backgrounding, and even a full app close/reopen.
  restTimerEndAt: number | null;
  restTimerTotalSeconds: number | null;
  startSession: (session: Session) => void;
  updateActiveSession: (partial: Partial<Session>) => void;
  logSet: (exerciseCode: string, set: CompletedSet) => void;
  updateExercise: (exerciseCode: string, partial: Partial<SessionExercise>) => void;
  completeSession: (opts?: CompleteOpts) => void;
  cancelSession: () => void;
  startRestTimer: (seconds: number) => void;
  adjustRestTimer: (deltaSeconds: number) => void;
  clearRestTimer: () => void;
  getUserSessions: (userId: string, isAdmin: boolean) => Session[];
  getSessionsByUser: (userId: string) => Session[];
  getAllSessions: () => Session[];
  bulkAddSessions: (newSessions: Session[]) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSession: null,
      restTimerEndAt: null,
      restTimerTotalSeconds: null,

      startSession: (session) => set({ activeSession: session }),

      updateActiveSession: (partial) =>
        set((state) => ({
          activeSession: state.activeSession ? { ...state.activeSession, ...partial } : null,
        })),

      logSet: (exerciseCode, completedSet) =>
        set((state) => {
          if (!state.activeSession) return state;
          return {
            activeSession: {
              ...state.activeSession,
              exercises: state.activeSession.exercises.map((ex) =>
                ex.exerciseCode === exerciseCode
                  ? { ...ex, completedSets: [...ex.completedSets, completedSet] }
                  : ex,
              ),
            },
          };
        }),

      updateExercise: (exerciseCode, partial) =>
        set((state) => {
          if (!state.activeSession) return state;
          return {
            activeSession: {
              ...state.activeSession,
              exercises: state.activeSession.exercises.map((ex) =>
                ex.exerciseCode === exerciseCode ? { ...ex, ...partial } : ex,
              ),
            },
          };
        }),

      completeSession: (opts) => {
        const { activeSession, sessions } = get();
        if (!activeSession) return;
        const volume = activeSession.exercises.reduce(
          (total, ex) =>
            total + ex.completedSets.reduce((s, set) => s + set.weight * set.reps, 0),
          0,
        );
        const completed: Session = {
          ...activeSession,
          completedAt: new Date(),
          totalVolume: volume,
          cardioEntries: opts?.cardioEntries ?? activeSession.cardioEntries,
          totalCalories: opts?.totalCalories,
        };
        set({
          activeSession: null,
          sessions: [...sessions, completed],
          restTimerEndAt: null,
          restTimerTotalSeconds: null,
        });
        syncEngine.enqueueSession(completed).catch(console.error);
      },

      cancelSession: () =>
        set({ activeSession: null, restTimerEndAt: null, restTimerTotalSeconds: null }),

      startRestTimer: (seconds) =>
        set({ restTimerEndAt: Date.now() + seconds * 1000, restTimerTotalSeconds: seconds }),

      adjustRestTimer: (deltaSeconds) =>
        set((state) => {
          if (state.restTimerEndAt == null || state.restTimerTotalSeconds == null) return state;
          const now = Date.now();
          const currentRemaining = Math.max(0, Math.round((state.restTimerEndAt - now) / 1000));
          const nextRemaining = Math.max(5, currentRemaining + deltaSeconds);
          return {
            restTimerEndAt: now + nextRemaining * 1000,
            restTimerTotalSeconds: Math.max(state.restTimerTotalSeconds, nextRemaining),
          };
        }),

      clearRestTimer: () => set({ restTimerEndAt: null, restTimerTotalSeconds: null }),

      getUserSessions: (userId, isAdmin) => {
        const { sessions } = get();
        return sessions.filter((s) => s.userId === userId || (isAdmin && !s.userId));
      },

      getSessionsByUser: (userId) => get().sessions.filter((s) => s.userId === userId),

      getAllSessions: () => get().sessions,

      bulkAddSessions: (newSessions) =>
        set((state) => ({ sessions: [...state.sessions, ...newSessions] })),
    }),
    {
      name: 'sessions',
      storage: createJSONStorage(() => idbStorage),
      // Persist activeSession so Android kills don't lose mid-workout progress.
      // On rehydrate we check if it's stale (> 8 hours) and discard it.
      partialize: (state) => ({
        sessions: state.sessions,
        activeSession: state.activeSession,
        restTimerEndAt: state.restTimerEndAt,
        restTimerTotalSeconds: state.restTimerTotalSeconds,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state?.activeSession) {
          if (state) {
            state.restTimerEndAt = null;
            state.restTimerTotalSeconds = null;
          }
          return;
        }
        const startedAt = new Date(state.activeSession.startedAt).getTime();
        const hours8 = 8 * 60 * 60 * 1000;
        if (Date.now() - startedAt > hours8) {
          // Session is stale — discard it silently
          state.activeSession = null;
          state.restTimerEndAt = null;
          state.restTimerTotalSeconds = null;
        }
      },
    },
  ),
);
