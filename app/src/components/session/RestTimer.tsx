import { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';

interface Props {
  seconds: number;
  onComplete: () => void;
  onSkip: () => void;
}

export default function RestTimer({ seconds, onComplete, onSkip }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef(onComplete);
  doneRef.current = onComplete;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setTimeout(() => doneRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-0 right-0 z-50 px-4 pointer-events-none">
      <div className="mx-auto max-w-lg pointer-events-auto">
        <div className="bg-card border border-primary/30 rounded-xl p-3 shadow-2xl shadow-black/50 flex items-center gap-3">
          <div className="shrink-0 w-14 h-14 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
            <span className="font-mono text-lg font-bold text-primary tabular-nums leading-none">
              {mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`}
            </span>
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <p className="text-sm font-semibold leading-none">Descansando…</p>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(remaining / seconds) * 100}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onSkip}
            className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-primary/50 rounded-lg px-2.5 py-2 transition-colors"
            aria-label="Saltar descanso"
          >
            <X className="h-3.5 w-3.5" />
            Saltar
          </button>
        </div>
      </div>
    </div>
  );
}
