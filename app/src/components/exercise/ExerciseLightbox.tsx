import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Dumbbell } from 'lucide-react';

interface Props {
  imagePath: string;
  name: string;
  code: string;
  open: boolean;
  onClose: () => void;
}

export default function ExerciseLightbox({ imagePath, name, code, open, onClose }: Props) {
  const [imgErr, setImgErr] = useState(false);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        onClick={onClose}
        aria-label="Cerrar"
      >
        <X className="h-5 w-5" />
      </button>

      {!imgErr ? (
        <img
          src={imagePath}
          alt={name}
          className="max-w-full max-h-[80dvh] object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          onError={() => setImgErr(true)}
        />
      ) : (
        <div className="flex flex-col items-center gap-3 text-white/40" onClick={(e) => e.stopPropagation()}>
          <Dumbbell className="h-20 w-20" />
          <p className="text-sm">Imagen no disponible</p>
        </div>
      )}

      <p className="mt-3 text-center text-sm text-white/50 pointer-events-none">
        <span className="font-mono text-primary/70">{code}</span>
        {name && <> · {name}</>}
      </p>
    </div>,
    document.body,
  );
}
