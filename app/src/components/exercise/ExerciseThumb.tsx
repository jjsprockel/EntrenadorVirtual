import { useState } from 'react';
import { Dumbbell } from 'lucide-react';

interface Props {
  code: string;
  name?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export default function ExerciseThumb({ code, name, size = 'md', className = '' }: Props) {
  const [err, setErr] = useState(false);
  const dim = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';
  const iconDim = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <div
      className={`${dim} rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0 ${className}`}
    >
      {!err ? (
        <img
          src={`/images/ejercicios/${code}.png`}
          alt={name ?? code}
          className="w-full h-full object-cover"
          onError={() => setErr(true)}
        />
      ) : (
        <Dumbbell className={`${iconDim} text-muted-foreground/40`} />
      )}
    </div>
  );
}
