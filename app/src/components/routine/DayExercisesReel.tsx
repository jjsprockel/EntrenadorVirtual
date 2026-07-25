import { useState, useEffect } from 'react';
import type { TouchEvent } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react';
import { useExerciseStore } from '@/stores/exerciseStore';
import type { ExerciseSlot } from '@/types/routine';

interface Props {
  open: boolean;
  onClose: () => void;
  dayName: string;
  exercises: ExerciseSlot[];
}

export default function DayExercisesReel({ open, onClose, dayName, exercises }: Props) {
  const { getByCode } = useExerciseStore();
  const [index, setIndex] = useState(0);
  const [imgErr, setImgErr] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setIndex(0);
      setImgErr(false);
    }
  }, [open]);

  if (!open || exercises.length === 0) return null;

  const total = exercises.length;
  const current = exercises[index];
  const exercise = getByCode(current.exerciseCode);

  function goTo(i: number) {
    setIndex(((i % total) + total) % total);
    setImgErr(false);
  }

  function handleTouchStart(e: TouchEvent) {
    setTouchStartX(e.touches[0].clientX);
  }

  function handleTouchEnd(e: TouchEvent) {
    if (touchStartX === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) {
      goTo(index + (delta < 0 ? 1 : -1));
    }
    setTouchStartX(null);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className="text-sm font-semibold text-white/90">{dayName}</p>
          <p className="text-xs text-white/50">
            {index + 1} / {total}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Image area */}
      <div
        className="flex-1 flex items-center justify-center relative px-4 min-h-0"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          className="absolute left-1 sm:left-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Ejercicio anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {!imgErr ? (
          <img
            src={exercise?.imagePath ?? `/images/ejercicios/${current.exerciseCode}.png`}
            alt={exercise?.nameEs ?? current.exerciseCode}
            className="max-w-full max-h-[60dvh] object-contain rounded-lg shadow-2xl"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-white/40">
            <Dumbbell className="h-16 w-16" />
            <p className="text-sm">Imagen no disponible</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => goTo(index + 1)}
          className="absolute right-1 sm:right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Siguiente ejercicio"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Exercise name + dots */}
      <div className="px-4 pb-6 pt-2 space-y-3" onClick={(e) => e.stopPropagation()}>
        <p className="text-center text-sm text-white/70">
          <span className="font-mono text-primary/80">{current.exerciseCode}</span>
          {exercise?.nameEs && <> · {exercise.nameEs}</>}
        </p>
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {exercises.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-5 bg-primary' : 'w-1.5 bg-white/25'
              }`}
              aria-label={`Ir a ejercicio ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
