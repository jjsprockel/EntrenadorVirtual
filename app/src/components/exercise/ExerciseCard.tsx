import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import type { Exercise } from '@/types/exercise';
import MuscleGroupBadge from './MuscleGroupBadge';

const LEVEL_LABEL = { principiante: 'Principiante', intermedio: 'Intermedio', avanzado: 'Avanzado' };
const LEVEL_COLOR = {
  principiante: 'text-green-400',
  intermedio: 'text-yellow-400',
  avanzado: 'text-red-400',
};

interface Props {
  exercise: Exercise;
}

export default function ExerciseCard({ exercise }: Props) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onClick={() => navigate(`/ejercicios/${exercise.code}`)}
      className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden text-left transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]"
    >
      {/* Image area */}
      <div className="relative aspect-video w-full bg-muted overflow-hidden">
        {!imgError ? (
          <img
            src={exercise.imagePath}
            alt={exercise.nameEs}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Dumbbell className="h-8 w-8 opacity-30" />
            <span className="text-xs opacity-50">{exercise.code}</span>
          </div>
        )}
        {/* Code badge */}
        <span className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
          {exercise.code}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 p-3">
        <p className="font-semibold text-sm text-foreground leading-tight line-clamp-2">
          {exercise.nameEs}
        </p>
        {exercise.nameEn[0] && (
          <p className="text-[11px] text-muted-foreground line-clamp-1">{exercise.nameEn[0]}</p>
        )}
        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
          <MuscleGroupBadge group={exercise.muscleGroup} />
          <span className={`text-[10px] font-medium ${LEVEL_COLOR[exercise.level]}`}>
            {LEVEL_LABEL[exercise.level]}
          </span>
        </div>
      </div>
    </button>
  );
}
