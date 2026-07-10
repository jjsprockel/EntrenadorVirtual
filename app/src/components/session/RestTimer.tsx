import { useEffect, useState, useRef } from 'react';
import { X, Plus, Minus, Volume2, VolumeX } from 'lucide-react';

// ── SVG circular progress ─────────────────────────────────────────────────────
const RADIUS = 48;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 301.6

// ── Completion sound (Web Audio API — no external files) ─────────────────────
function playBeep() {
  try {
    // @ts-expect-error webkitAudioContext is non-standard
    const Ctx: typeof AudioContext = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();

    const schedule = (freq: number, startOffset: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + startOffset;
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    };

    // Two-tone beep: low → high = "done!"
    schedule(660, 0,    0.12);
    schedule(880, 0.18, 0.22);
  } catch {
    // AudioContext unavailable — silently skip
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  seconds: number;
  onComplete: () => void;
  onSkip: () => void;
}

export default function RestTimer({ seconds, onComplete, onSkip }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const [muted, setMuted] = useState(() => localStorage.getItem('restTimerMuted') === '1');

  // Tracks the highest value remaining has reached so the arc always starts full
  // and re-fills when the user adds time.
  const maxRef = useRef(seconds);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef(onComplete);
  doneRef.current = onComplete;
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          if (!mutedRef.current) playBeep();
          // Small delay so the beep starts before the component unmounts
          setTimeout(() => doneRef.current(), 80);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function toggleMute() {
    setMuted((m) => {
      const next = !m;
      localStorage.setItem('restTimerMuted', next ? '1' : '0');
      return next;
    });
  }

  function adjust(delta: number) {
    setRemaining((r) => {
      const next = Math.max(5, r + delta);
      if (next > maxRef.current) maxRef.current = next;
      return next;
    });
  }

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = remaining / maxRef.current;
  const strokeOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="mx-auto max-w-sm pointer-events-auto px-4 pb-3">
        <div className="bg-card border border-primary/20 rounded-2xl shadow-2xl shadow-black/60 px-5 pt-4 pb-4">

          <p className="text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            Descansando
          </p>

          {/* Circular timer */}
          <div className="flex justify-center mb-4">
            <div className="relative w-[130px] h-[130px]">
              <svg viewBox="0 0 110 110" className="w-full h-full -rotate-90">
                {/* Track */}
                <circle
                  cx="55" cy="55" r={RADIUS}
                  fill="none"
                  strokeWidth="7"
                  className="stroke-muted/40"
                />
                {/* Progress arc */}
                <circle
                  cx="55" cy="55" r={RADIUS}
                  fill="none"
                  strokeWidth="7"
                  strokeLinecap="round"
                  className="stroke-primary"
                  style={{
                    strokeDasharray: CIRCUMFERENCE,
                    strokeDashoffset: strokeOffset,
                    transition: 'stroke-dashoffset 1s linear',
                  }}
                />
              </svg>
              {/* Center countdown */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-3xl font-bold text-primary tabular-nums leading-none">
                  {mins > 0
                    ? `${mins}:${secs.toString().padStart(2, '0')}`
                    : `${secs}s`}
                </span>
              </div>
            </div>
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-2">
            {/* −15 s */}
            <button
              type="button"
              onClick={() => adjust(-15)}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground border border-border hover:border-primary/40 rounded-lg px-3 py-2.5 transition-colors shrink-0"
            >
              <Minus className="h-3.5 w-3.5" />
              15s
            </button>

            {/* Skip */}
            <button
              type="button"
              onClick={onSkip}
              className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground border border-border hover:border-primary/40 rounded-xl py-2.5 transition-colors"
            >
              <X className="h-4 w-4" />
              Saltar
            </button>

            {/* +15 s */}
            <button
              type="button"
              onClick={() => adjust(15)}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground border border-border hover:border-primary/40 rounded-lg px-3 py-2.5 transition-colors shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              15s
            </button>

            {/* Mute toggle */}
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Activar sonido' : 'Silenciar'}
              className={`p-2.5 rounded-lg border transition-colors shrink-0 ${
                muted
                  ? 'border-border text-muted-foreground/40 hover:text-muted-foreground'
                  : 'border-primary/30 text-primary hover:text-primary/70'
              }`}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
