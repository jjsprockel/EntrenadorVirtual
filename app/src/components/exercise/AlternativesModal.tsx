import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import MuscleGroupBadge from './MuscleGroupBadge';
import { useExerciseStore } from '@/stores/exerciseStore';
import type { Exercise } from '@/types/exercise';

interface Props {
  exercise: Exercise;
  open: boolean;
  onClose: () => void;
  onSelect?: (code: string) => void;
}

function AltCard({
  exercise,
  onSelect,
  onClose,
}: {
  exercise: Exercise;
  onSelect?: (code: string) => void;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  function handleClick() {
    if (onSelect) {
      onSelect(exercise.code);
      onClose();
    } else {
      onClose();
      navigate(`/ejercicios/${exercise.code}`);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-3 w-full rounded-lg border border-border bg-muted/30 p-3 text-left hover:border-primary/50 hover:bg-muted/60 transition-colors active:scale-[0.98]"
    >
      <div className="w-16 h-12 rounded-md bg-muted overflow-hidden shrink-0">
        {!imgError ? (
          <img
            src={exercise.imagePath}
            alt={exercise.nameEs}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Dumbbell className="h-5 w-5 opacity-30" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground leading-tight truncate">
          {exercise.nameEs}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
          {exercise.equipment.join(', ')}
        </p>
        <div className="mt-1">
          <MuscleGroupBadge group={exercise.muscleGroup} />
        </div>
      </div>
      {onSelect && (
        <span className="text-xs text-primary font-medium shrink-0">Usar</span>
      )}
    </button>
  );
}

export default function AlternativesModal({ exercise, open, onClose, onSelect }: Props) {
  const { getAlternatives } = useExerciseStore();
  const alternatives = getAlternatives(exercise.code);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Alternativas para</DialogTitle>
          <p className="text-sm text-primary font-semibold mt-0.5">{exercise.nameEs}</p>
        </DialogHeader>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        {alternatives.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No hay alternativas registradas para este ejercicio.
          </p>
        ) : (
          <div className="flex flex-col gap-2 mt-2">
            {alternatives.map((alt) => (
              <AltCard
                key={alt.code}
                exercise={alt}
                onSelect={onSelect}
                onClose={onClose}
              />
            ))}
          </div>
        )}

        <Button variant="outline" className="w-full mt-2" onClick={onClose}>
          Cancelar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
