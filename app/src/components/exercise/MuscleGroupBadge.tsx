import { Badge } from '@/components/ui/badge';
import type { MuscleGroup } from '@/types/exercise';

const LABELS: Record<MuscleGroup, string> = {
  pecho: 'Pecho',
  espalda: 'Espalda',
  hombros: 'Hombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  cuadriceps: 'Cuádriceps',
  isquiotibiales_gluteos: 'Isquio / Glúteos',
  pantorrillas: 'Pantorrillas',
  core: 'Core',
  trapecio: 'Trapecio',
  antebrazos: 'Antebrazos',
};

const COLORS: Record<MuscleGroup, string> = {
  pecho: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  espalda: 'bg-green-500/15 text-green-400 border-green-500/30',
  hombros: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  biceps: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  triceps: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  cuadriceps: 'bg-red-500/15 text-red-400 border-red-500/30',
  isquiotibiales_gluteos: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  pantorrillas: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  core: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  trapecio: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  antebrazos: 'bg-lime-500/15 text-lime-400 border-lime-500/30',
};

interface Props {
  group: MuscleGroup;
  className?: string;
}

export default function MuscleGroupBadge({ group, className }: Props) {
  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-medium border ${COLORS[group]} ${className ?? ''}`}
    >
      {LABELS[group]}
    </Badge>
  );
}

export { LABELS as MUSCLE_GROUP_LABELS };
