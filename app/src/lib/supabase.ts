import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Cloud auth / sync is switched off: the app is open to anyone and all data
// stays in the device's IndexedDB, even if the Supabase env vars are present.
// Set to true to re-enable Supabase auth + sync.
const CLOUD_ENABLED = false;

// isSupabaseConfigured controls whether cloud auth / sync is active.
// When false the app uses local profiles (usersStore) without passwords.
export const isSupabaseConfigured = CLOUD_ENABLED && !!(supabaseUrl && supabaseAnonKey);

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
