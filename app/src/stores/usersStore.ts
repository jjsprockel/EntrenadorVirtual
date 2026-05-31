import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { idbStorage } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth';
import type { AppUser, UserProfile } from '@/types/user';
import { AVATAR_COLORS } from '@/types/user';

interface UsersState {
  users: AppUser[];
  activeUserId: string | null;
  sessionUserId: string | null;
  initialized: boolean;
  hydrated: boolean;

  initAdmin: (profile: UserProfile, email: string, passwordHash: string, tempPassword?: string) => void;
  addUser: (profile: UserProfile, email: string, passwordHash: string, tempPassword?: string) => void;
  updateUser: (id: string, partial: Partial<Pick<AppUser, 'role' | 'avatarColor' | 'email'>>) => void;
  updateUserProfile: (id: string, profilePartial: Partial<UserProfile>) => void;
  deleteUser: (id: string) => void;
  setActiveUser: (id: string) => void;
  getActiveUser: () => AppUser | undefined;
  bulkAddUsers: (newUsers: AppUser[]) => void;

  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  checkCredentials: (email: string, password: string) => Promise<string | null>;
  setSession: (userId: string) => void;
  logout: () => void;
  changePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<boolean>;
  resetUserPassword: (userId: string, newPassword: string) => Promise<void>;
}

export const useUsersStore = create<UsersState>()(
  persist(
    (set, get) => ({
      users: [],
      activeUserId: null,
      sessionUserId: null,
      initialized: false,
      hydrated: false,

      initAdmin: (profile, email, passwordHash, tempPassword) => {
        const admin: AppUser = {
          id: crypto.randomUUID(),
          role: 'admin',
          avatarColor: AVATAR_COLORS[0],
          createdAt: new Date(),
          profile,
          email,
          passwordHash,
          tempPassword,
        };
        set({ users: [admin], activeUserId: admin.id, sessionUserId: admin.id, initialized: true });
      },

      addUser: (profile, email, passwordHash, tempPassword) => {
        const { users } = get();
        const colorIdx = users.length % AVATAR_COLORS.length;
        const user: AppUser = {
          id: crypto.randomUUID(),
          role: 'user',
          avatarColor: AVATAR_COLORS[colorIdx],
          createdAt: new Date(),
          profile,
          email,
          passwordHash,
          tempPassword,
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

      bulkAddUsers: (newUsers) =>
        set((state) => ({ users: [...state.users, ...newUsers] })),

      login: async (email, password) => {
        const { users } = get();
        const user = users.find((u) => u.email?.toLowerCase() === email.trim().toLowerCase());
        if (!user || !user.passwordHash) return false;
        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return false;
        set({ sessionUserId: user.id, activeUserId: user.id });
        return true;
      },

      // Verify credentials without touching state — use with startTransition + setSession
      checkCredentials: async (email, password) => {
        const { users } = get();
        const user = users.find((u) => u.email?.toLowerCase() === email.trim().toLowerCase());
        if (!user || !user.passwordHash) return null;
        const valid = await verifyPassword(password, user.passwordHash);
        return valid ? user.id : null;
      },

      // Set session after credentials have been verified — safe to wrap in startTransition
      setSession: (userId) => set({ sessionUserId: userId, activeUserId: userId }),

      logout: () => set({ sessionUserId: null }),

      changePassword: async (userId, currentPassword, newPassword) => {
        const { users } = get();
        const user = users.find((u) => u.id === userId);
        if (!user || !user.passwordHash) return false;
        const valid = await verifyPassword(currentPassword, user.passwordHash);
        if (!valid) return false;
        const newHash = await hashPassword(newPassword);
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, passwordHash: newHash, tempPassword: undefined } : u,
          ),
        }));
        return true;
      },

      resetUserPassword: async (userId, newPassword) => {
        const newHash = await hashPassword(newPassword);
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, passwordHash: newHash, tempPassword: newPassword } : u,
          ),
        }));
      },
    }),
    {
      name: 'app-users',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        users: state.users,
        activeUserId: state.activeUserId,
        sessionUserId: state.sessionUserId,
        initialized: state.initialized,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // hydrated is not in partialize so we must set it imperatively after hydration
        useUsersStore.setState({ hydrated: true });

        // Pre-auth migration: if users exist but no active session, restore the admin session.
        // This ensures users who existed before the auth system was added are not locked out.
        if (state.initialized && !state.sessionUserId && state.users.length > 0) {
          const admin = state.users.find((u) => u.role === 'admin');
          if (admin) {
            useUsersStore.setState({ sessionUserId: admin.id, activeUserId: admin.id });
          }
        }
      },
    },
  ),
);
