import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '@/lib/db';
import type { UserProfile } from '@/types/user';

interface UserState {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  resetProfile: () => void;
}

export const defaultProfile: UserProfile = {
  name: '',
  level: 'principiante',
  primaryObjective: 'hipertrofia',
  units: 'kg',
  minWeightIncrement: 2.5,
  preferRestTimer: true,
  theme: 'dark',
  oneRMEstimates: {},
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: defaultProfile,

      setProfile: (profile) => set({ profile }),

      updateProfile: (partial) =>
        set((state) => ({ profile: { ...state.profile, ...partial } })),

      resetProfile: () => set({ profile: defaultProfile }),
    }),
    {
      name: 'user-profile',
      storage: createJSONStorage(() => idbStorage),
    },
  ),
);
