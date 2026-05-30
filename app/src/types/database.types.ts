// ── Supabase Database Types ────────────────────────────────────────────────────
// Placeholder types until the Supabase project is set up.
// Replace with auto-generated types by running:
//   npx supabase gen types typescript --project-id <YOUR_PROJECT_ID> > src/types/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          age: number | null;
          body_weight_kg: number | null;
          height_cm: number | null;
          sex: 'M' | 'F' | 'X' | null;
          level: 'principiante' | 'intermedio' | 'avanzado' | null;
          primary_objective: 'hipertrofia' | 'fuerza' | 'mixto' | 'resistencia' | null;
          units: 'kg' | 'lb' | null;
          min_weight_increment: number | null;
          prefer_rest_timer: boolean | null;
          theme: 'light' | 'dark' | 'system' | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      routines: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          objective: string;
          level: string;
          structure: string;
          days_per_week: number;
          duration_weeks: number | null;
          periodization: Json;
          active: boolean;
          started_at: string | null;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['routines']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['routines']['Row']>;
      };
      routine_days: {
        Row: {
          id: string;
          routine_id: string;
          day_name: string;
          day_order: number;
          muscle_groups: string[];
          exercises: Json;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['routine_days']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['routine_days']['Row']>;
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          routine_id: string | null;
          routine_day_id: string | null;
          session_date: string;
          started_at: string;
          completed_at: string | null;
          duration_seconds: number | null;
          total_volume_kg: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sessions']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['sessions']['Row']>;
      };
      session_sets: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          exercise_code: string;
          original_exercise_code: string | null;
          set_number: number;
          weight_kg: number | null;
          reps: number | null;
          rir: number | null;
          status: 'completed' | 'failed' | 'skipped';
          completed_at: string;
        };
        Insert: Omit<Database['public']['Tables']['session_sets']['Row'], never>;
        Update: Partial<Database['public']['Tables']['session_sets']['Row']>;
      };
      custom_exercises: {
        Row: {
          id: string;
          user_id: string;
          code: string;
          name_es: string;
          muscle_group: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['custom_exercises']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['custom_exercises']['Row']>;
      };
    };
    Views: {
      user_personal_records: {
        Row: {
          user_id: string;
          exercise_code: string;
          max_weight_kg: number;
          estimated_1rm: number;
          max_volume_per_set: number;
          total_sets: number;
          last_performed_at: string;
        };
      };
      user_weekly_volume: {
        Row: {
          user_id: string;
          week_start: string;
          sessions_count: number;
          total_volume_kg: number;
          unique_exercises: number;
        };
      };
    };
    Functions: {
      calculate_streak: { Args: { p_user_id: string }; Returns: number };
      refresh_user_stats: { Args: Record<never, never>; Returns: void };
      delete_user_account: { Args: Record<never, never>; Returns: void };
    };
  };
}
