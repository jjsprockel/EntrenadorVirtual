import { useEffect, useTransition } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import TodayPage from '@/pages/TodayPage';
import RoutinesPage from '@/pages/RoutinesPage';
import RoutineBuilderPage from '@/pages/RoutineBuilderPage';
import ExercisesPage from '@/pages/ExercisesPage';
import ExerciseDetailPage from '@/pages/ExerciseDetailPage';
import ProgressPage from '@/pages/ProgressPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminPage from '@/pages/AdminPage';
import LoginPage from '@/pages/LoginPage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import { useExerciseStore } from '@/stores/exerciseStore';
import { useUserStore } from '@/stores/userStore';
import { useUsersStore } from '@/stores/usersStore';
import { useAuthStore } from '@/stores/authStore';
import { getExercises } from '@/data/knowledgeBase';
import { hashPassword } from '@/lib/auth';
import { syncEngine } from '@/lib/syncEngine';
import { isSupabaseConfigured } from '@/lib/supabase';

function AppRoutes() {
  const location = useLocation();
  const legacyProfile = useUserStore((s) => s.profile);
  const { initialized, initAdmin, sessionUserId, hydrated } = useUsersStore();
  const { session: supabaseSession, loading: supabaseLoading, initialize: initAuth } = useAuthStore();
  const setExercises = useExerciseStore((s) => s.setExercises);
  const [, startTransition] = useTransition();

  // One-time admin bootstrap (local auth mode)
  useEffect(() => {
    if (!initialized) {
      hashPassword('Admin1234').then((hash) => {
        initAdmin(legacyProfile, 'admin@entrenador.app', hash, 'Admin1234');
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize Supabase auth listener (no-op when not configured)
  useEffect(() => {
    initAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Parse exercises from knowledge base (deferred so it doesn't block first paint)
  useEffect(() => {
    startTransition(() => setExercises(getExercises()));
  }, [setExercises]); // eslint-disable-line react-hooks/exhaustive-deps

  // Start sync engine (no-op when Supabase not configured)
  useEffect(() => {
    syncEngine.start();
    return () => syncEngine.stop();
  }, []);

  // Theme management
  const activeTheme = useUsersStore(
    (s) => s.users.find((u) => u.id === s.activeUserId)?.profile.theme,
  );
  const theme = activeTheme ?? legacyProfile.theme;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
  }, [theme]);

  // Auth callback and password-reset pages are always accessible (no login required)
  const isAuthRoute = location.pathname.startsWith('/auth/');
  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<AuthCallbackPage />} />
      </Routes>
    );
  }

  // Wait for persistence layer before deciding auth state
  const stillLoading = isSupabaseConfigured ? supabaseLoading : !hydrated;
  if (stillLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Auth gate: Supabase session (when configured) or local session token
  const isLoggedIn = isSupabaseConfigured ? !!supabaseSession : !!sessionUserId;
  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<TodayPage />} />
        <Route path="rutinas" element={<RoutinesPage />} />
        <Route path="rutinas/nueva" element={<RoutineBuilderPage />} />
        <Route path="rutinas/:id/editar" element={<RoutineBuilderPage />} />
        <Route path="ejercicios" element={<ExercisesPage />} />
        <Route path="ejercicios/:code" element={<ExerciseDetailPage />} />
        <Route path="progreso" element={<ProgressPage />} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
