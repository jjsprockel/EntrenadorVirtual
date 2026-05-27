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
import { useExerciseStore } from '@/stores/exerciseStore';
import { useUserStore } from '@/stores/userStore';
import { getExercises } from '@/data/knowledgeBase';

function AppBootstrap() {
  const setExercises = useExerciseStore((s) => s.setExercises);
  const theme = useUserStore((s) => s.profile.theme);

  useEffect(() => {
    setExercises(getExercises());
  }, [setExercises]);

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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return <AppBootstrap />;
}
