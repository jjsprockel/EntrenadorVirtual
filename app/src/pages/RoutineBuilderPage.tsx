import { useParams } from 'react-router-dom';
import RoutineBuilder from '@/components/routine/RoutineBuilder';
import { useRoutineStore } from '@/stores/routineStore';

export default function RoutineBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const { routines } = useRoutineStore();
  const editRoutine = id ? routines.find((r) => r.id === id) : undefined;

  return <RoutineBuilder editRoutine={editRoutine} />;
}
