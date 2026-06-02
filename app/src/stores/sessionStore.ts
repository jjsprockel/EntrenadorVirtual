import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '@/lib/db';
import { syncEngine } from '@/lib/syncEngine';
import type { Session, SessionExercise, CompletedSet } from '@/types/session';

interface SessionState {
  sessions: Session[];
  activeSession: Session | null;
  startSession: (session: Session) => void;
  updateActiveSession: (partial: Partial<Session>) => void;
  logSet: (exerciseCode: string, set: CompletedSet) => void;
  updateExercise: (exerciseCode: string, partial: Partial<SessionExercise>) => void;
  completeSession: () => void;
  cancelSession: () => void;
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

      completeSession: () => {
        const { activeSession, sessions } = get();
        if (!activeSession) return;
        const volume = activeSession.exercises.reduce(
          (total, ex) =>
            total + ex.completedSets.reduce((s, set) => s + set.weight * set.reps, 0),
          0,
        );
        const completed = { ...activeSession, completedAt: new Date(), totalVolume: volume };
        set({ activeSession: null, sessions: [...sessions, completed] });
        syncEngine.enqueueSession(completed).catch(console.error);
      },

      cancelSession: () => set({ activeSession: null }),

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
      // Don't persist active session across page reloads
      partialize: (state) => ({ sessions: state.sessions }),
    },
  ),
);
