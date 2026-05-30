# SISTEMA DE GESTIÓN DE USUARIOS — EntrenadorVirtual
## Plan completo de migración a multi-usuario con autenticación, sincronización y estadísticas

> **Cómo usar este documento:** Guárdalo como `docs/USER_MANAGEMENT_PLAN.md` en el repo y úsalo como referencia para Claude Code o para implementarlo manualmente. Cubre todas las decisiones técnicas, esquema SQL completo, código de auth, sincronización offline, estadísticas agregadas y consideraciones de seguridad.

---

## 1. CONTEXTO Y OBJETIVOS

### 1.1 Estado actual

La app es single-user con persistencia local en IndexedDB. Esto significa:
- Cada dispositivo es un universo aparte
- No hay backup ante pérdida o limpieza del navegador
- No hay cuentas, contraseñas ni recuperación
- No se puede compartir un perfil entre celular y desktop

### 1.2 Objetivos del nuevo sistema

1. **Cuentas reales:** registro con email/password, login, recuperación, logout
2. **Perfiles personales:** datos básicos, preferencias, avatar opcional
3. **Multi-dispositivo:** lo que entrenas en el gym desde el celular aparece en tu desktop al llegar a casa
4. **Backup automático:** los datos viven en la nube, nunca se pierden
5. **Estadísticas agregadas:** queries SQL para PRs, racha, volumen total, evolución mensual
6. **Offline-first conservado:** la sesión activa DEBE funcionar sin internet (caso de uso principal: gimnasio con WiFi malo)
7. **Privacidad:** cada usuario solo ve sus propios datos (Row Level Security)
8. **GDPR ready:** exportar datos, eliminar cuenta

---

## 2. STACK PROPUESTO

| Componente | Solución | Razón |
|---|---|---|
| Auth | Supabase Auth | Built-in, email/password + OAuth |
| Base de datos | Supabase Postgres | SQL real para queries agregadas |
| Storage (avatares) | Supabase Storage | Free 1 GB, integrado con Auth |
| Caché local | IndexedDB (existente) | Mantiene offline-first |
| Sync layer | Custom (TanStack Query + lógica propia) | Control granular |
| Cliente | `@supabase/supabase-js` v2 | SDK oficial |

### 2.1 Dependencias nuevas a instalar

```bash
npm install @supabase/supabase-js
npm install @tanstack/react-query        # Para manejo de estado servidor
npm install @tanstack/react-query-devtools --save-dev
```

### 2.2 Variables de entorno

```env
# .env.local
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhb...     # Clave pública, segura para el cliente
```

> Nota: la `anon key` es segura en el frontend porque las políticas RLS controlan qué puede leer/escribir cada usuario. Nunca uses la `service_role key` en el cliente.

---

## 3. ESQUEMA DE BASE DE DATOS

Ejecuta este SQL en el editor de Supabase tras crear el proyecto.

### 3.1 Tabla `profiles` (extensión de auth.users)

```sql
-- Supabase ya crea auth.users (gestionado por el servicio de auth)
-- Creamos profiles para datos públicos/aplicación
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  display_name text,
  avatar_url text,
  age int check (age > 0 and age < 120),
  body_weight_kg numeric(5,2) check (body_weight_kg > 0 and body_weight_kg < 500),
  height_cm int check (height_cm > 0 and height_cm < 300),
  sex text check (sex in ('M', 'F', 'X', null)),
  level text check (level in ('principiante', 'intermedio', 'avanzado')) default 'principiante',
  primary_objective text check (primary_objective in ('hipertrofia', 'fuerza', 'mixto', 'resistencia')) default 'hipertrofia',
  units text check (units in ('kg', 'lb')) default 'kg',
  min_weight_increment numeric(4,2) default 2.5,
  prefer_rest_timer boolean default true,
  theme text check (theme in ('light', 'dark', 'system')) default 'dark',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger para actualizar updated_at automáticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Trigger para crear profile automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### 3.2 Tabla `routines` y `routine_days`

```sql
create table public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  objective text not null check (objective in ('hipertrofia', 'fuerza', 'mixto', 'resistencia')),
  level text not null check (level in ('principiante', 'intermedio', 'avanzado')),
  structure text not null check (structure in ('fullbody', 'torso_pierna', 'ppl', 'weider', 'custom')),
  days_per_week int not null check (days_per_week between 1 and 7),
  duration_weeks int,
  periodization jsonb not null default '{"type": "ninguna"}'::jsonb,
  active boolean default false,
  started_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index routines_user_id_idx on public.routines(user_id);
create index routines_user_active_idx on public.routines(user_id, active) where active = true;

create trigger routines_updated_at
  before update on public.routines
  for each row execute function public.handle_updated_at();

-- Sólo una rutina activa por usuario
create unique index one_active_routine_per_user
  on public.routines(user_id) where active = true;

create table public.routine_days (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid references public.routines(id) on delete cascade not null,
  day_name text not null,
  day_order int not null,
  muscle_groups text[] not null default '{}',
  exercises jsonb not null default '[]'::jsonb,  -- Array de ExerciseSlot
  created_at timestamptz default now()
);

create index routine_days_routine_id_idx on public.routine_days(routine_id);
```

### 3.3 Tabla `sessions` y `session_sets`

```sql
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  routine_id uuid references public.routines(id) on delete set null,
  routine_day_id uuid references public.routine_days(id) on delete set null,
  session_date date not null default current_date,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_seconds int,
  total_volume_kg numeric(10,2),
  notes text,
  created_at timestamptz default now()
);

create index sessions_user_date_idx on public.sessions(user_id, session_date desc);
create index sessions_user_completed_idx on public.sessions(user_id, completed_at desc) where completed_at is not null;

create table public.session_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,  -- Desnormalizado para queries rápidas
  exercise_code text not null,  -- "P-01", "E-03", etc.
  original_exercise_code text,  -- Si se usó alternativa
  set_number int not null,
  weight_kg numeric(6,2),
  reps int,
  rir int check (rir between 0 and 10),
  status text not null check (status in ('completed', 'failed', 'skipped')) default 'completed',
  completed_at timestamptz default now()
);

create index session_sets_user_exercise_idx on public.session_sets(user_id, exercise_code, completed_at desc);
create index session_sets_session_idx on public.session_sets(session_id);
```

### 3.4 Tabla `one_rep_max_estimates`

```sql
create table public.one_rep_max_estimates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  exercise_code text not null,
  estimated_1rm_kg numeric(6,2) not null,
  source text check (source in ('manual', 'calculated', 'tested')) default 'calculated',
  calculated_at timestamptz default now(),
  unique(user_id, exercise_code)
);

create index orm_user_idx on public.one_rep_max_estimates(user_id);
```

### 3.5 Tabla `custom_exercises`

```sql
create table public.custom_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  code text not null,                  -- Ej: "CUSTOM-001"
  name_es text not null,
  name_en text[] default '{}',
  muscle_group text not null,
  pattern text,
  equipment text[],
  level text default 'intermedio',
  primary_muscles text[] default '{}',
  secondary_muscles text[] default '{}',
  execution text[] default '{}',
  tips text[] default '{}',
  pitfalls text[] default '{}',
  alternative_codes text[] default '{}',
  image_path text,
  created_at timestamptz default now(),
  unique(user_id, code)
);
```

### 3.6 Vistas materializadas para estadísticas

```sql
-- Récords personales (PRs) por usuario y ejercicio
create materialized view public.user_personal_records as
select
  user_id,
  exercise_code,
  max(weight_kg) as max_weight_kg,
  max(weight_kg * (1 + reps::numeric / 30)) as estimated_1rm,  -- Fórmula de Epley
  max(reps * weight_kg) as max_volume_per_set,
  count(*) as total_sets,
  max(completed_at) as last_performed_at
from public.session_sets
where status = 'completed' and weight_kg > 0 and reps > 0
group by user_id, exercise_code;

create unique index user_pr_idx on public.user_personal_records(user_id, exercise_code);

-- Resumen semanal de volumen por usuario
create materialized view public.user_weekly_volume as
select
  ss.user_id,
  date_trunc('week', s.session_date)::date as week_start,
  count(distinct s.id) as sessions_count,
  sum(ss.weight_kg * ss.reps) as total_volume_kg,
  count(distinct ss.exercise_code) as unique_exercises
from public.session_sets ss
join public.sessions s on s.id = ss.session_id
where ss.status = 'completed'
group by ss.user_id, week_start;

create unique index user_weekly_idx on public.user_weekly_volume(user_id, week_start);

-- Función para refrescar las vistas (llamar tras cierre de sesión)
create or replace function public.refresh_user_stats()
returns void as $$
begin
  refresh materialized view concurrently public.user_personal_records;
  refresh materialized view concurrently public.user_weekly_volume;
end;
$$ language plpgsql;
```

---

## 4. ROW LEVEL SECURITY (CRÍTICO)

Sin esto, cualquier usuario podría leer los datos de otros. Aplica TODAS estas políticas.

```sql
-- Activar RLS en todas las tablas
alter table public.profiles enable row level security;
alter table public.routines enable row level security;
alter table public.routine_days enable row level security;
alter table public.sessions enable row level security;
alter table public.session_sets enable row level security;
alter table public.one_rep_max_estimates enable row level security;
alter table public.custom_exercises enable row level security;

-- PROFILES: usuario puede leer su propio profile + todos los username/avatar (para futuras features sociales)
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ROUTINES: CRUD solo del propio usuario
create policy "routines_all_own" on public.routines
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ROUTINE_DAYS: a través de la rutina padre
create policy "routine_days_all_own" on public.routine_days
  for all using (
    exists (
      select 1 from public.routines r
      where r.id = routine_id and r.user_id = auth.uid()
    )
  );

-- SESSIONS: CRUD solo del propio usuario
create policy "sessions_all_own" on public.sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- SESSION_SETS: CRUD solo del propio usuario
create policy "session_sets_all_own" on public.session_sets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ONE_REP_MAX_ESTIMATES: idem
create policy "orm_all_own" on public.one_rep_max_estimates
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CUSTOM_EXERCISES: idem
create policy "custom_exercises_all_own" on public.custom_exercises
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

---

## 5. CLIENTE DE SUPABASE EN LA APP

### 5.1 Inicialización

`app/src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env.local');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,  // Sesiones aquí; data sigue en IndexedDB
  },
});
```

### 5.2 Generar tipos desde el schema

Una vez creado el schema en Supabase, generar los tipos TypeScript:

```bash
npx supabase gen types typescript --project-id <tu-project-id> > app/src/types/database.types.ts
```

Esto da autocomplete y type-checking en TODAS las queries.

---

## 6. SISTEMA DE AUTENTICACIÓN

### 6.1 Auth Store con Zustand

`app/src/stores/authStore.ts`:

```typescript
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;

  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null, loading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
  },

  signUp: async (email, password, displayName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  },

  signInWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    // Limpiar IndexedDB local al hacer logout
    const dbs = await indexedDB.databases();
    dbs.forEach(db => db.name && indexedDB.deleteDatabase(db.name));
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error };
  },
}));
```

### 6.2 Páginas de auth

Páginas necesarias:

- `/auth/login` — Login con email/password + botón "Sign in with Google"
- `/auth/signup` — Registro con validación de password
- `/auth/forgot-password` — Solicitar email de recuperación
- `/auth/reset-password` — Establecer nueva password (con token de URL)
- `/auth/callback` — Procesa el callback de OAuth y verificación de email

### 6.3 Validación de password (zod)

```typescript
import { z } from 'zod';

export const passwordSchema = z.string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Debe incluir una mayúscula')
  .regex(/[a-z]/, 'Debe incluir una minúscula')
  .regex(/[0-9]/, 'Debe incluir un número');

export const signupSchema = z.object({
  email: z.string().email('Email no válido'),
  password: passwordSchema,
  displayName: z.string().min(2, 'Mínimo 2 caracteres').max(50),
});
```

**Sobre el hashing de passwords:** Supabase Auth usa **bcrypt** internamente. **NUNCA** envíes passwords sin TLS ni las hashees en el cliente — eso es contraproducente y abre vectores de ataque. Confía en el TLS + bcrypt server-side.

### 6.4 Indicador de fuerza de password

Implementar con `zxcvbn`:

```bash
npm install @zxcvbn-ts/core @zxcvbn-ts/language-common @zxcvbn-ts/language-es
```

Visual: barra de 4 segmentos de rojo → verde según `score` de 0 a 4.

### 6.5 Protección de rutas

`app/src/components/ProtectedRoute.tsx`:

```tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function ProtectedRoute() {
  const { session, loading } = useAuthStore();
  if (loading) return <div>Cargando...</div>;
  if (!session) return <Navigate to="/auth/login" replace />;
  return <Outlet />;
}
```

En el router envolver todas las rutas de la app (excepto las de `/auth/*`) con `<ProtectedRoute />`.

---

## 7. SINCRONIZACIÓN OFFLINE-FIRST

Este es el patrón crítico para mantener el caso de uso del gimnasio sin internet.

### 7.1 Estrategia

```
┌─────────────┐       sync       ┌──────────────┐
│  IndexedDB  │ ←──────────────→ │   Supabase   │
│  (local)    │   bidireccional  │   (cloud)    │
└─────────────┘                  └──────────────┘
       ↑                                  ↑
       │                                  │
   Lectura/escritura                 Sólo cuando
   inmediata (sesión)                hay conexión
```

**Reglas:**
1. Todas las escrituras van **primero a IndexedDB** (instantáneo, funciona offline)
2. Cada registro local tiene `synced: boolean` y `updated_at: number`
3. Un **sync queue** intenta subir los registros no sincronizados cuando hay conexión
4. Al detectar conexión nueva: pull de cambios remotos + push de cambios locales
5. **Conflict resolution:** last-write-wins por `updated_at` (suficiente para single-user multi-device)

### 7.2 Implementación de la cola de sync

`app/src/lib/syncEngine.ts`:

```typescript
import { db } from './db';  // IndexedDB existente
import { supabase } from './supabase';

interface SyncQueueItem {
  id: string;
  table: 'sessions' | 'session_sets' | 'routines' | 'profiles';
  operation: 'insert' | 'update' | 'delete';
  payload: any;
  createdAt: number;
  attempts: number;
}

class SyncEngine {
  private syncing = false;
  private onlineListener: (() => void) | null = null;

  async enqueue(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'attempts'>) {
    await db.add('sync_queue', {
      ...item,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      attempts: 0,
    });

    if (navigator.onLine) {
      this.processSyncQueue();
    }
  }

  async processSyncQueue() {
    if (this.syncing || !navigator.onLine) return;
    this.syncing = true;

    try {
      const items = await db.getAll('sync_queue');

      for (const item of items) {
        try {
          await this.syncItem(item);
          await db.delete('sync_queue', item.id);
        } catch (error) {
          console.error('Sync failed for', item, error);
          item.attempts += 1;
          if (item.attempts < 5) {
            await db.put('sync_queue', item);
          } else {
            // Mover a dead-letter queue para investigación manual
            await db.add('sync_dead_letter', item);
            await db.delete('sync_queue', item.id);
          }
        }
      }
    } finally {
      this.syncing = false;
    }
  }

  private async syncItem(item: SyncQueueItem) {
    const { table, operation, payload } = item;

    if (operation === 'insert' || operation === 'update') {
      const { error } = await supabase.from(table).upsert(payload);
      if (error) throw error;
    } else if (operation === 'delete') {
      const { error } = await supabase.from(table).delete().eq('id', payload.id);
      if (error) throw error;
    }
  }

  async pullChanges(since: number) {
    // Trae los cambios remotos desde la última sync exitosa
    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .gt('updated_at', new Date(since).toISOString());

    if (sessions) {
      for (const s of sessions) {
        await db.put('sessions', s);
      }
    }
    // Repetir para session_sets, routines, etc.
  }

  start() {
    if (this.onlineListener) return;
    this.onlineListener = () => this.processSyncQueue();
    window.addEventListener('online', this.onlineListener);

    // Intento inicial
    if (navigator.onLine) this.processSyncQueue();

    // Sync periódico cada 60 segundos si está online
    setInterval(() => {
      if (navigator.onLine) this.processSyncQueue();
    }, 60_000);
  }

  stop() {
    if (this.onlineListener) {
      window.removeEventListener('online', this.onlineListener);
      this.onlineListener = null;
    }
  }
}

export const syncEngine = new SyncEngine();
```

### 7.3 Integración en los stores existentes

Cambio en `sessionStore.ts`:

```typescript
// ANTES (single-user, sólo IndexedDB):
async completeSession(sessionId: string) {
  await db.put('sessions', { ...session, completedAt: new Date() });
}

// DESPUÉS (multi-user, con sync):
async completeSession(sessionId: string) {
  const updated = { ...session, completed_at: new Date().toISOString(), user_id: currentUser.id };
  await db.put('sessions', updated);                  // 1. Local primero
  await syncEngine.enqueue({                          // 2. Encolar sync
    table: 'sessions',
    operation: 'update',
    payload: updated,
  });
}
```

### 7.4 Indicador visual de sync

En el AppShell, mostrar en la esquina superior:
- 🟢 "Sincronizado" — todo subido
- 🟡 "X cambios pendientes" — hay cola
- 🔴 "Sin conexión" — offline, cambios locales esperando

---

## 8. ESTADÍSTICAS E HISTORIAL

### 8.1 Queries clave

`app/src/lib/statsQueries.ts`:

```typescript
import { supabase } from './supabase';

// Récords personales del usuario
export async function getUserPersonalRecords(userId: string) {
  const { data, error } = await supabase
    .from('user_personal_records')
    .select('*')
    .eq('user_id', userId)
    .order('estimated_1rm', { ascending: false });
  return { data, error };
}

// Volumen semanal de las últimas 12 semanas
export async function getWeeklyVolume(userId: string, weeks = 12) {
  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);

  const { data, error } = await supabase
    .from('user_weekly_volume')
    .select('*')
    .eq('user_id', userId)
    .gte('week_start', since.toISOString().split('T')[0])
    .order('week_start', { ascending: true });
  return { data, error };
}

// Historial de un ejercicio específico
export async function getExerciseHistory(userId: string, exerciseCode: string, limit = 50) {
  const { data, error } = await supabase
    .from('session_sets')
    .select('weight_kg, reps, rir, completed_at, session:sessions(session_date)')
    .eq('user_id', userId)
    .eq('exercise_code', exerciseCode)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(limit);
  return { data, error };
}

// Racha actual (días consecutivos entrenando)
export async function getCurrentStreak(userId: string) {
  const { data } = await supabase.rpc('calculate_streak', { p_user_id: userId });
  return data ?? 0;
}
```

### 8.2 Función de racha en Postgres

```sql
create or replace function public.calculate_streak(p_user_id uuid)
returns int as $$
declare
  v_streak int := 0;
  v_current_date date := current_date;
  v_has_session boolean;
begin
  loop
    select exists(
      select 1 from public.sessions
      where user_id = p_user_id
        and session_date = v_current_date
        and completed_at is not null
    ) into v_has_session;

    if not v_has_session then
      -- Si no entrenó hoy pero sí ayer, la racha sigue
      if v_current_date = current_date and v_streak = 0 then
        v_current_date := v_current_date - 1;
        continue;
      end if;
      exit;
    end if;

    v_streak := v_streak + 1;
    v_current_date := v_current_date - 1;
  end loop;

  return v_streak;
end;
$$ language plpgsql stable;
```

### 8.3 Hook personalizado con TanStack Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import * as statsQueries from '@/lib/statsQueries';

export function useUserStats() {
  const userId = useAuthStore(s => s.user?.id);

  const prsQuery = useQuery({
    queryKey: ['stats', 'prs', userId],
    queryFn: () => statsQueries.getUserPersonalRecords(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,  // 5 minutos
  });

  const volumeQuery = useQuery({
    queryKey: ['stats', 'volume', userId],
    queryFn: () => statsQueries.getWeeklyVolume(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const streakQuery = useQuery({
    queryKey: ['stats', 'streak', userId],
    queryFn: () => statsQueries.getCurrentStreak(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000,  // 1 minuto (racha cambia con cada sesión)
  });

  return { prsQuery, volumeQuery, streakQuery };
}
```

### 8.4 Refrescar vistas materializadas

Las vistas materializadas se actualizan cuando llamas a `refresh_user_stats()`. Estrategia:

- **Tras completar una sesión:** invocar la función RPC.
- **Diariamente:** Supabase tiene cron jobs (pg_cron) para refrescar automáticamente.

```sql
-- Cron diario a las 3am UTC
select cron.schedule('refresh_stats', '0 3 * * *', $$
  select public.refresh_user_stats();
$$);
```

---

## 9. MIGRACIÓN DESDE INDEXEDDB EXISTENTE

Los usuarios actuales tienen datos en IndexedDB sin asociar a una cuenta. Hay que ofrecerles migrar.

### 9.1 Flujo propuesto

```
Usuario abre la app → tiene datos en IndexedDB → no está autenticado
       ↓
Modal: "Tienes 47 sesiones guardadas en este dispositivo.
        Crea una cuenta para nunca perderlas y sincronizarlas con tus otros dispositivos."
        [Crear cuenta] [Más tarde]
       ↓
Si elige crear cuenta:
  1. Sign up estándar
  2. Tras confirmar email, app detecta datos locales sin user_id
  3. Asigna user_id a todos los registros locales
  4. Encola TODO al sync engine
  5. Toast: "✅ Tus 47 sesiones se están sincronizando"
```

### 9.2 Código de migración

```typescript
async function migrateLocalDataToUser(userId: string) {
  const localSessions = await db.getAll('sessions');
  const localRoutines = await db.getAll('routines');
  const localSets = await db.getAll('session_sets');

  // Asignar user_id a cada registro
  for (const session of localSessions) {
    if (!session.user_id) {
      session.user_id = userId;
      await db.put('sessions', session);
      await syncEngine.enqueue({ table: 'sessions', operation: 'insert', payload: session });
    }
  }
  // Repetir para routines, sets, etc.

  toast.success(`Migrando ${localSessions.length} sesiones a tu cuenta...`);
}
```

---

## 10. SEGURIDAD Y PRIVACIDAD

### 10.1 Checklist de seguridad

- [x] **RLS activado en TODAS las tablas** (sin excepción)
- [x] **HTTPS obligatorio** (Supabase fuerza TLS)
- [x] **Sólo `anon key` en el cliente** (nunca `service_role`)
- [x] **Password hashing server-side** (Supabase usa bcrypt)
- [x] **Validación cliente Y servidor** (zod en front, constraints SQL atrás)
- [x] **Rate limiting** en login (Supabase lo tiene built-in: 30 intentos/hora por IP)
- [x] **Tokens con expiración** (JWT 1 hora por default, refresh token 7 días)
- [x] **Logout limpia tokens locales** + IndexedDB si es PC compartido

### 10.2 GDPR / Privacidad

Endpoints obligatorios en el menú de Perfil:

**Exportar datos** (UI: botón "Descargar mis datos"):
```typescript
async function exportUserData(userId: string) {
  const [profile, routines, sessions, sets, customExercises] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('routines').select('*').eq('user_id', userId),
    supabase.from('sessions').select('*').eq('user_id', userId),
    supabase.from('session_sets').select('*').eq('user_id', userId),
    supabase.from('custom_exercises').select('*').eq('user_id', userId),
  ]);

  const data = {
    exported_at: new Date().toISOString(),
    profile: profile.data,
    routines: routines.data,
    sessions: sessions.data,
    session_sets: sets.data,
    custom_exercises: customExercises.data,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `entrenadorvirtual-export-${Date.now()}.json`;
  a.click();
}
```

**Eliminar cuenta** (UI: botón rojo con doble confirmación):
```typescript
async function deleteAccount() {
  if (!confirm('Esto eliminará TODOS tus datos. Esta acción es irreversible.')) return;

  // 1. La cascada en SQL ya borra routines, sessions, sets, etc.
  const { error } = await supabase.rpc('delete_user_account');
  if (error) throw error;

  // 2. Limpiar local
  await supabase.auth.signOut();
  const dbs = await indexedDB.databases();
  dbs.forEach(db => db.name && indexedDB.deleteDatabase(db.name));
  window.location.href = '/';
}
```

```sql
create or replace function public.delete_user_account()
returns void as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$ language plpgsql security definer;
```

### 10.3 Optional: 2FA

Para usuarios power, Supabase soporta TOTP. Implementación posterior:

```typescript
const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
// Mostrar QR code para Google Authenticator / Authy
// Verificar con código
const { error: verifyError } = await supabase.auth.mfa.verify({
  factorId: data.id,
  challengeId: '...',
  code: '123456',
});
```

---

## 11. PLAN DE IMPLEMENTACIÓN POR FASES

### Fase A — Backend (1 día)

- [ ] Crear proyecto en supabase.com
- [ ] Ejecutar todo el SQL del schema (secciones 3 y 4)
- [ ] Configurar Auth: habilitar email/password + Google OAuth
- [ ] Configurar templates de email (verificación, recuperación)
- [ ] Generar tipos: `npx supabase gen types`

### Fase B — Auth en el cliente (2 días)

- [ ] Instalar dependencias (`@supabase/supabase-js`, `@tanstack/react-query`)
- [ ] Crear `lib/supabase.ts`
- [ ] Crear `authStore`
- [ ] Crear páginas: Login, Signup, ForgotPassword, ResetPassword
- [ ] Implementar `ProtectedRoute`
- [ ] Añadir botón logout en Perfil
- [ ] Validación con zod + zxcvbn

### Fase C — Migración del modelo de datos (2 días)

- [ ] Actualizar todos los tipos TS (`exercise.ts`, `routine.ts`, etc.) para incluir `user_id`
- [ ] Refactorizar stores para usar el `userId` de `authStore`
- [ ] Cambiar lecturas/escrituras directas de IndexedDB para incluir `user_id`
- [ ] Modal de migración para datos existentes

### Fase D — Sync engine (2-3 días)

- [ ] Implementar `syncEngine.ts`
- [ ] Añadir cola de sync en IndexedDB
- [ ] Integrar `enqueue()` en todos los puntos de escritura
- [ ] Pull periódico de cambios remotos
- [ ] Indicador visual de estado de sync
- [ ] Manejo de conflictos (last-write-wins)

### Fase E — Estadísticas (2 días)

- [ ] Implementar las queries de `statsQueries.ts`
- [ ] Hook `useUserStats` con TanStack Query
- [ ] Refactorizar `ProgressDashboard` para usar datos remotos cuando hay conexión, local cuando no
- [ ] Función SQL `calculate_streak`
- [ ] Refresh manual + cron de vistas materializadas

### Fase F — Privacidad y polish (1 día)

- [ ] Exportar datos (JSON)
- [ ] Eliminar cuenta (con confirmación)
- [ ] Términos y condiciones + Política de privacidad básica
- [ ] Email templates personalizados con marca de la app
- [ ] Testing en producción con cuenta real

**Total estimado: ~10 días de trabajo.**

---

## 12. COSTOS Y LÍMITES

### Free tier de Supabase (suficiente para MVP)

| Recurso | Límite |
|---|---|
| Database | 500 MB |
| Storage | 1 GB |
| Bandwidth | 5 GB/mes |
| Usuarios autenticados | 50.000 MAU |
| Edge functions | 500k invocaciones/mes |

**Cuándo te quedarías corto:**
- Si superas 50k usuarios activos → upgrade a Pro ($25/mes)
- Si superas 500 MB DB → upgrade o limpieza de sesiones antiguas
- Para uso personal o beta con <100 usuarios: **sobra free tier durante años**

### Optimizaciones para mantenerse en free tier

1. Eliminar sesiones de hace más de 1 año comprimiendo a resúmenes mensuales
2. Reducir bandwidth comprimiendo respuestas (gzip automático en Supabase)
3. Usar vistas materializadas en lugar de queries pesadas en cada render

---

## 13. ANTI-PATRONES A EVITAR

| ❌ NO hagas esto | ✅ Hazlo así |
|---|---|
| Hashear password en el cliente | Confiar en bcrypt server-side de Supabase |
| Guardar `service_role` key en `.env` del front | Solo `anon key` en el cliente |
| Hacer queries sin filtrar `user_id` | RLS lo aplica, pero hazlo explícito por claridad |
| Sincronizar IndexedDB ↔ Supabase en cada cambio sin cola | Usar la cola de sync con reintentos |
| Bloquear la UI esperando sync | Optimistic UI: actualiza local primero, sync en background |
| Mostrar todos los errores de Supabase al usuario | Mensajes amigables; logs detallados en consola |
| Permitir password "12345678" porque cumple `min 8` | Validar con zxcvbn (score >= 2) |
| Olvidar el caso "logout en PC compartido" | Limpiar IndexedDB en logout |

---

## 14. SIGUIENTES PASOS RECOMENDADOS

1. **Crear proyecto en Supabase** (10 minutos)
2. **Pegar todo el SQL** de las secciones 3 y 4 en el editor (5 minutos)
3. **Decidir el flujo de auth:**
   - ¿Solo email/password? ✅ recomendado para MVP
   - ¿O añadir Google OAuth desde el inicio? Recomendado si target = usuarios casuales
4. **Comenzar por la Fase B** (auth en cliente) antes de tocar el modelo de datos
5. **Testear cada fase en aislado** antes de avanzar — añadir migrations rotas es difícil de revertir

---

*Documento generado el 27 mayo 2026*
*Para EntrenadorVirtual — github.com/jjsprockel/EntrenadorVirtual*
