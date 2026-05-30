import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isConfigured: boolean;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,
  isConfigured: isSupabaseConfigured,

  initialize: async () => {
    if (!supabase) {
      set({ loading: false });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null, loading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
  },

  signIn: async (email, password) => {
    if (!supabase) return { error: 'Supabase no configurado' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  },

  signUp: async (email, password, displayName) => {
    if (!supabase) return { error: 'Supabase no configurado' };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error?.message ?? null };
  },

  signOut: async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    // Clear local IndexedDB on logout so shared-device users start clean
    try {
      const dbs = await indexedDB.databases?.() ?? [];
      for (const db of dbs) {
        if (db.name) indexedDB.deleteDatabase(db.name);
      }
    } catch {
      // indexedDB.databases() not available in all browsers — safe to ignore
    }
  },

  resetPassword: async (email) => {
    if (!supabase) return { error: 'Supabase no configurado' };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error: error?.message ?? null };
  },

  updatePassword: async (newPassword) => {
    if (!supabase) return { error: 'Supabase no configurado' };
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error?.message ?? null };
  },
}));
