import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// isSupabaseConfigured controls whether cloud auth / sync is active.
// When false the app uses local IndexedDB auth (usersStore) as before.
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// supabase is null until VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set.
// Never use the service_role key here — anon key + RLS is the correct pattern.
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
      },
    })
  : null;
