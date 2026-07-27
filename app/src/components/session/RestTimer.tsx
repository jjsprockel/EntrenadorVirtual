import { useEffect, useState, useRef } from 'react';
import { X, Plus, Minus, Volume2, VolumeX } from 'lucide-react';
import { useSessionStore } from '@/stores/sessionStore';

// ── SVG circular progress ─────────────────────────────────────────────────────
const RADIUS = 48;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 301.6

// ── Completion sound (Web Audio API — no external files) ─────────────────────
// Louder, longer four-tone rising sequence so it's noticeable even if the
// phone is in a pocket or across the room.
function playBeep() {
  try {
    // @ts-expect-error webkitAudioContext is non-standard
    const Ctx: typeof AudioContext = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();

    const schedule = (freq: number, startOffset: number, dur: number, gainLevel: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + startOffset;
      gain.gain.setValueAtTime(gainLevel, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    };

    // Four-tone rising sequence, louder and more prolonged than a single beep.
    schedule(523, 0,    0.18, 0.5); // C5
    schedule(659, 0.22, 0.18, 0.5); // E5
    schedule(784, 0.44, 0.18, 0.5); // G5
    schedule(1047, 0.66, 0.55, 0.55); // C6 — held longer for a clear "finish" tone

    // Close the context once everything has finished playing.
    setTimeout(() => ctx.close().catch(() => {}), 1400);
  } catch {
    // AudioContext unavailable — silently skip
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  onComplete: () => void;
  onSkip: () => void;
}

function computeRemaining(endAt: number | null): number {
  if (!endAt) return 0;
  return Math.max(0, Math.round((endAt - Date.now()) / 1000));
}

export default function RestTimer({ onComplete, onSkip }: Props) {
  const restTimerEndAt = useSessionStore((s) => s.restTimerEndAt);
  const restTimerTotalSeconds = useSessionStore((s) => s.restTimerTotalSeconds);
  const adjustRestTimer = useSessionStore((s) => s.adjustRestTimer);

  const [remaining, setRemaining] = useState(() => computeRemaining(restTimerEndAt));
  const [muted, setMuted] = useState(() => localStorage.getItem('restTimerMuted') === '1');

  const doneRef = useRef(onComplete);
  doneRef.current = onComplete;
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const firedRef = useRef(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Recompute from the absolute end timestamp (wall clock), not a decrementing
  // counter — this survives background tab throttling, since every tick just
  // re-derives "how much time is actually left" instead of trusting that the
  // interval ticked exactly once per second.
  useEffect(() => {
    firedRef.current = false;

    function tick() {
      const next = computeRemaining(restTimerEndAt);
      setRemaining(next);
      if (next <= 0 && !firedRef.current) {
        firedRef.current = true;
        if (!mutedRef.current) playBeep();
        if (!mutedRef.current && navigator.vibrate) navigator.vibrate([250, 100, 250]);
        setTimeout(() => doneRef.current(), 80);
      }
    }

    tick();
    const interval = setInterval(tick, 250);

    function handleVisibility() {
      if (document.visibilityState === 'visible') tick();
    }
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [restTimerEndAt]);

  // Keep the screen awake (Android/Chrome) while the rest timer is running.
  // Wake locks auto-release when the tab is hidden, so re-acquire on return.
  useEffect(() => {
    if (!('wakeLock' in navigator)) return;

    async function acquire() {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      } catch {
        // Permission denied or unsupported — timer still works, screen may sleep
      }
    }

    if (remaining > 0 && document.visibilityState === 'visible') acquire();

    function handleVisibility() {
      if (document.visibilityState === 'visible' && remaining > 0) acquire();
    }
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
    };
  }, [remaining > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleMute() {
    setMuted((m) => {
      const next = !m;
      localStorage.setItem('restTimerMuted', next ? '1' : '0');
      return next;
    });
  }

  function adjust(delta: number) {
    adjustRestTimer(delta);
  }

  function handleSkip() {
    firedRef.current = true;
    onSkip();
  }

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const total = restTimerTotalSeconds || 1;
  const progress = remaining / total;
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
              onClick={handleSkip}
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
