import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '@/lib/db';
import type { AppUser, UserProfile } from '@/types/user';
import { AVATAR_COLORS } from '@/types/user';

interface UsersState {
  users: AppUser[];
  activeUserId: string | null;
  initialized: boolean;

  initAdmin: (profile: UserProfile) => void;
  addUser: (profile: UserProfile) => void;
  updateUser: (id: string, partial: Partial<Pick<AppUser, 'role' | 'avatarColor'>>) => void;
  updateUserProfile: (id: string, profilePartial: Partial<UserProfile>) => void;
  deleteUser: (id: string) => void;
  setActiveUser: (id: string) => void;
  getActiveUser: () => AppUser | undefined;
}

export const useUsersStore = create<UsersState>()(
  persist(
    (set, get) => ({
      users: [],
      activeUserId: null,
      initialized: false,

      initAdmin: (profile) => {
        const admin: AppUser = {
          id: crypto.randomUUID(),
          role: 'admin',
          avatarColor: AVATAR_COLORS[0],
          createdAt: new Date(),
          profile,
        };
        set({ users: [admin], activeUserId: admin.id, initialized: true });
      },

      addUser: (profile) => {
        const { users } = get();
        const colorIdx = users.length % AVATAR_COLORS.length;
        const user: AppUser = {
          id: crypto.randomUUID(),
          role: 'user',
          avatarColor: AVATAR_COLORS[colorIdx],
          createdAt: new Date(),
          profile,
        };
        set((state) => ({ users: [...state.users, user] }));
      },

      updateUser: (id, partial) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...partial } : u)),
        })),

      updateUserProfile: (id, profilePartial) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, profile: { ...u.profile, ...profilePartial } } : u,
          ),
        })),

      deleteUser: (id) =>
        set((state) => {
          const adminId = state.users.find((u) => u.role === 'admin')?.id ?? null;
          return {
            users: state.users.filter((u) => u.id !== id),
            activeUserId: state.activeUserId === id ? adminId : state.activeUserId,
          };
        }),

      setActiveUser: (id) => set({ activeUserId: id }),

      getActiveUser: () => {
        const { users, activeUserId } = get();
        return users.find((u) => u.id === activeUserId);
      },
    }),
    {
      name: 'app-users',
      storage: createJSONStorage(() => idbStorage),
    },
  ),
);
