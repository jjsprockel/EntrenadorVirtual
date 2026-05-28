import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { useExerciseStore } from '@/stores/exerciseStore';
import { useUserStore } from '@/stores/userStore';
import { useUsersStore } from '@/stores/usersStore';
import { getExercises } from '@/data/knowledgeBase';
import { hashPassword } from '@/lib/auth';

function AppBootstrap() {
  const setExercises = useExerciseStore((s) => s.setExercises);
  const legacyProfile = useUserStore((s) => s.profile);
  const { initialized, initAdmin, sessionUserId, hydrated } = useUsersStore();

  useEffect(() => {
    if (!initialized) {
      hashPassword('Admin1234').then((hash) => {
        initAdmin(legacyProfile, 'admin@entrenador.app', hash, 'Admin1234');
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setExercises(getExercises());
  }, [setExercises]);

  const activeUser = useUsersStore((s) => s.getActiveUser());
  const theme = activeUser?.profile.theme ?? legacyProfile.theme;

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

  // Wait for IDB rehydration before deciding on auth
  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!sessionUserId) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default function App() {
  return <AppBootstrap />;
}
