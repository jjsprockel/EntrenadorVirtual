import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Zap, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import DayEditor from './DayEditor';
import { ROUTINE_TEMPLATES } from '@/lib/routineTemplates';
import { isLowFrequencyDays } from '@/lib/periodization';
import { getDeloadInterval } from '@/lib/overloadEngine';
import { useRoutineStore } from '@/stores/routineStore';
import { useUsersStore } from '@/stores/usersStore';
import type { Routine, RoutineDay, PeriodizationType } from '@/types/routine';
import type { Level } from '@/types/exercise';

// ── Shared chip selector ─────────────────────────────────────────────────────

function Chips<T extends string | number>({
  options,
  labels,
  value,
  onChange,
}: {
  options: readonly T[];
  labels: Record<string | number, string>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={String(opt)}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
            value === opt
              ? 'bg-primary border-primary text-primary-foreground'
              : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
          }`}
        >
          {labels[opt as string | number]}
        </button>
      ))}
    </div>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors font-bold"
        >
          −
        </button>
        <span className="font-mono text-base font-bold w-8 text-center">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors font-bold"
        >
          +
        </button>
      </div>
    </div>
  );
}

// ── Wizard state ──────────────────────────────────────────────────────────────

interface WizardState {
  name: string;
  objective: Routine['objective'];
  level: Level;
  daysPerWeek: number;
  durationWeeks: number;
  structure: Routine['structure'];
  days: RoutineDay[];
  periodizationType: PeriodizationType;
  weeklyIncrementKg: number;
}

const DURATION_OPTIONS = [4, 8, 12, 16, 0] as const;
const DURATION_LABELS: Record<number, string> = {
  4: '4 sem', 8: '8 sem', 12: '12 sem', 16: '16 sem', 0: 'Indefinido',
};

// ── Step indicators ───────────────────────────────────────────────────────────

const STEPS = ['Config', 'Estructura', 'Días', 'Periodización', 'Revisar'];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1">
      {STEPS.map((_label, i) => (
        <div key={i} className="flex items-center gap-1">
          <div
            className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold transition-colors ${
              i < current
                ? 'bg-primary/20 text-primary'
                : i === current
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            {i < current ? <Check className="h-3 w-3" /> : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`h-px w-4 transition-colors ${i < current ? 'bg-primary/40' : 'bg-border'}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Steps ─────────────────────────────────────────────────────────────────────

function Step1({
  state,
  onChange,
}: {
  state: WizardState;
  onChange: (p: Partial<WizardState>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>Nombre del programa</Label>
        <Input
          autoFocus
          value={state.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Ej: PPL Verano 2026"
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label>Objetivo principal</Label>
        <Chips
          options={['hipertrofia', 'fuerza', 'mixto', 'resistencia'] as const}
          labels={{ hipertrofia: 'Hipertrofia', fuerza: 'Fuerza', mixto: 'Mixto', resistencia: 'Resistencia' }}
          value={state.objective}
          onChange={(v) => onChange({ objective: v })}
        />
      </div>

      <div className="space-y-2">
        <Label>Nivel</Label>
        <Chips
          options={['principiante', 'intermedio', 'avanzado'] as const}
          labels={{ principiante: 'Principiante', intermedio: 'Intermedio', avanzado: 'Avanzado' }}
          value={state.level}
          onChange={(v) => onChange({ level: v })}
        />
      </div>

      <Stepper
        label="Días por semana"
        value={state.daysPerWeek}
        min={2}
        max={7}
        onChange={(v) => onChange({ daysPerWeek: v })}
      />

      <div className="space-y-2">
        <Label>Duración del programa</Label>
        <Chips
          options={DURATION_OPTIONS}
          labels={DURATION_LABELS}
          value={state.durationWeeks}
          onChange={(v) => onChange({ durationWeeks: v })}
        />
      </div>
    </div>
  );
}

function Step2({
  state,
  onChange,
}: {
  state: WizardState;
  onChange: (p: Partial<WizardState>) => void;
}) {
  function selectTemplate(tpl: (typeof ROUTINE_TEMPLATES)[number]) {
    onChange({
      structure: tpl.structure,
      days: tpl.days(),
      daysPerWeek: tpl.daysPerWeek,
      ...(tpl.periodizationType !== undefined && { periodizationType: tpl.periodizationType }),
      ...(tpl.weeklyIncrementKg !== undefined && { weeklyIncrementKg: tpl.weeklyIncrementKg }),
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Selecciona una plantilla o empieza desde cero.
      </p>
      {ROUTINE_TEMPLATES.map((tpl) => {
        const active = state.structure === tpl.structure;
        return (
          <button
            key={tpl.id}
            type="button"
            onClick={() => selectTemplate(tpl)}
            className={`w-full text-left rounded-xl border p-4 transition-all ${
              active
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/40 bg-card'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className={`font-semibold text-sm ${active ? 'text-primary' : 'text-foreground'}`}>
                  {tpl.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{tpl.description}</p>
                <div className="flex gap-2 mt-1.5">
                  <span className="text-[10px] font-medium text-muted-foreground border border-border rounded px-1.5 py-0.5">
                    {tpl.daysPerWeek} días/sem
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground border border-border rounded px-1.5 py-0.5 capitalize">
                    {tpl.level}
                  </span>
                </div>
              </div>
              {active && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function Step3({
  state,
  onChange,
}: {
  state: WizardState;
  onChange: (p: Partial<WizardState>) => void;
}) {
  function updateDay(index: number, updated: RoutineDay) {
    const days = [...state.days];
    days[index] = updated;
    onChange({ days });
  }

  function addDay() {
    onChange({
      days: [
        ...state.days,
        {
          id: crypto.randomUUID(),
          dayName: `Día ${state.days.length + 1}`,
          muscleGroups: [],
          exercises: [],
        },
      ],
    });
  }

  function removeDay(index: number) {
    onChange({ days: state.days.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Configura cada día. Toca un día para editarlo.
      </p>
      {state.days.map((d, i) => (
        <div key={d.id} className="relative">
          <DayEditor
            day={d}
            onChange={(updated) => updateDay(i, updated)}
            defaultOpen={state.days.length === 1}
          />
          {state.days.length > 1 && (
            <button
              type="button"
              onClick={() => removeDay(i)}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive/80 text-white flex items-center justify-center text-xs hover:bg-destructive transition-colors"
              aria-label="Eliminar día"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        className="w-full h-10 border-dashed text-muted-foreground hover:text-foreground"
        onClick={addDay}
      >
        + Añadir día
      </Button>
    </div>
  );
}

function Step4({
  state,
  onChange,
}: {
  state: WizardState;
  onChange: (p: Partial<WizardState>) => void;
}) {
  const INCREMENT_OPTIONS = [0.5, 1, 1.25, 2.5, 5] as const;

  const isLowFreq = isLowFrequencyDays(state.days);
  const deload = getDeloadInterval(isLowFreq);

  type BadgeVariant = 'green' | 'yellow';
  const BADGES: Partial<Record<PeriodizationType, { text: string; variant: BadgeVariant }>> = isLowFreq
    ? {
        lineal:    { text: 'Recomendada',          variant: 'green'  },
        ondulante: { text: 'No ideal para 3 días', variant: 'yellow' },
        bloques:   { text: 'Recomendada',          variant: 'green'  },
      }
    : {};

  const badgeClass: Record<BadgeVariant, string> = {
    green:  'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30',
    yellow: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Tipo de periodización</Label>
        <div className="space-y-2">
          {(
            [
              { id: 'ninguna',   label: 'Sin periodización', desc: 'Subir peso cuando puedas, sin estructura fija.' },
              { id: 'lineal',    label: 'Lineal',             desc: 'Incremento fijo de peso cada semana o cuando se alcanza el rango de reps.' },
              { id: 'ondulante', label: 'Ondulante (DUP)',    desc: 'Variar rep range entre sesiones (fuerza / hipertrofia / resistencia).' },
              { id: 'bloques',   label: 'Por bloques',        desc: 'Macrociclo en bloques: acumulación → intensificación → realización.' },
            ] as { id: PeriodizationType; label: string; desc: string }[]
          ).map(({ id, label, desc }) => {
            const badge = BADGES[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange({ periodizationType: id })}
                className={`w-full text-left rounded-xl border p-3.5 transition-all ${
                  state.periodizationType === id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 ${
                      state.periodizationType === id
                        ? 'border-primary bg-primary'
                        : 'border-border'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-medium ${state.periodizationType === id ? 'text-primary' : 'text-foreground'}`}>
                        {label}
                      </p>
                      {badge && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${badgeClass[badge.variant]}`}>
                          {badge.text}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    {id === 'ondulante' && badge?.variant === 'yellow' && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 leading-snug">
                        DUP funciona mejor con 2+ sesiones por grupo muscular. Para rutinas de 3 días considera Ondulante Semanal.
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {state.periodizationType === 'lineal' && (
        <div className="space-y-2">
          <Label>Incremento semanal de peso</Label>
          <Chips
            options={INCREMENT_OPTIONS}
            labels={{ 0.5: '0.5 kg', 1: '1 kg', 1.25: '1.25 kg', 2.5: '2.5 kg', 5: '5 kg' }}
            value={state.weeklyIncrementKg}
            onChange={(v) => onChange({ weeklyIncrementKg: v })}
          />
          <p className="text-xs text-muted-foreground">
            Usa 2.5 kg para press/curl y 5 kg para sentadilla/peso muerto como punto de partida.
          </p>
        </div>
      )}

      {state.periodizationType === 'ondulante' && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <p className="text-sm font-medium">Patrón DUP sugerido</p>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p><span className="text-foreground font-medium">Sesión A:</span> 4–6 reps @ ~85% 1RM — Fuerza</p>
            <p><span className="text-foreground font-medium">Sesión B:</span> 8–12 reps @ ~70% 1RM — Hipertrofia</p>
            <p><span className="text-foreground font-medium">Sesión C:</span> 12–20 reps @ ~60% 1RM — Resistencia</p>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            Podrás configurar el rep range de cada sesión en el editor de días.
          </p>
        </div>
      )}

      {state.periodizationType === 'bloques' && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <p className="text-sm font-medium">Estructura de bloques</p>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p><span className="text-foreground font-medium">Bloque 1 — Acumulación:</span> 4–6 sem, 12–20 reps, 60–70% 1RM</p>
            <p><span className="text-foreground font-medium">Bloque 2 — Intensificación:</span> 3–4 sem, 6–10 reps, 75–85% 1RM</p>
            <p><span className="text-foreground font-medium">Bloque 3 — Realización:</span> 2–3 sem, 1–5 reps, 88–100% 1RM</p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
        <p className="text-xs font-semibold text-foreground">Deload sugerido</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Programa un descanso activo cada{' '}
          <span className="font-semibold text-foreground">{deload.min}–{deload.max} semanas</span>.
          {isLowFreq
            ? ' Con 1 sesión por músculo/semana, la fatiga se acumula más lento — puedes alargar el ciclo.'
            : ' Con alta frecuencia de entrenamiento, los ciclos cortos previenen la fatiga acumulada.'}
        </p>
      </div>
    </div>
  );
}

function Step5({
  state,
  onActivate,
}: {
  state: WizardState;
  onActivate: () => void;
}) {
  const PERIODIZATION_LABELS: Record<PeriodizationType, string> = {
    ninguna: 'Sin periodización',
    lineal: 'Lineal',
    ondulante: 'Ondulante (DUP)',
    bloques: 'Por bloques',
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-primary" />
          <p className="font-bold text-base">{state.name || '(sin nombre)'}</p>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Objetivo</p>
            <p className="font-medium capitalize">{state.objective}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Nivel</p>
            <p className="font-medium capitalize">{state.level}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Días / semana</p>
            <p className="font-mono font-medium">{state.daysPerWeek}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Duración</p>
            <p className="font-mono font-medium">
              {state.durationWeeks > 0 ? `${state.durationWeeks} semanas` : 'Indefinido'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estructura</p>
            <p className="font-medium capitalize">{state.structure.replace('_', '/')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Periodización</p>
            <p className="font-medium">{PERIODIZATION_LABELS[state.periodizationType]}</p>
          </div>
        </div>
      </div>

      {/* Days summary */}
      <div className="space-y-2">
        {state.days.map((d, i) => (
          <div
            key={d.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
          >
            <div className="w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-bold font-mono flex items-center justify-center shrink-0">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{d.dayName}</p>
              <p className="text-xs text-muted-foreground">
                {d.exercises.length} ejercicio{d.exercises.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        className="w-full h-12 text-base font-semibold gap-2"
        onClick={onActivate}
      >
        <Zap className="h-4 w-4" />
        Activar rutina
      </Button>
    </div>
  );
}

// ── Main wizard ───────────────────────────────────────────────────────────────

interface Props {
  editRoutine?: Routine;
}

export default function RoutineBuilder({ editRoutine }: Props) {
  const navigate = useNavigate();
  const { addRoutine, updateRoutine, setActiveRoutine } = useRoutineStore();
  const activeUserId = useUsersStore((s) => s.activeUserId);

  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(() => {
    if (editRoutine) {
      return {
        name: editRoutine.name,
        objective: editRoutine.objective,
        level: editRoutine.level,
        daysPerWeek: editRoutine.daysPerWeek,
        durationWeeks: editRoutine.durationWeeks,
        structure: editRoutine.structure,
        days: editRoutine.days,
        periodizationType: editRoutine.periodization.type,
        weeklyIncrementKg: editRoutine.periodization.weeklyIncrementKg ?? 2.5,
      };
    }
    return {
      name: '',
      objective: 'hipertrofia',
      level: 'intermedio',
      daysPerWeek: 4,
      durationWeeks: 8,
      structure: 'custom',
      days: [],
      periodizationType: 'ninguna',
      weeklyIncrementKg: 2.5,
    };
  });

  function update(partial: Partial<WizardState>) {
    setState((s) => ({ ...s, ...partial }));
  }

  function canAdvance(): boolean {
    if (step === 0) return state.name.trim().length > 0;
    if (step === 2) return state.days.length > 0;
    return true;
  }

  function handleActivate() {
    const routine: Routine = {
      id: editRoutine?.id ?? crypto.randomUUID(),
      userId: editRoutine?.userId ?? (activeUserId ?? undefined),
      name: state.name,
      objective: state.objective,
      level: state.level,
      structure: state.structure,
      daysPerWeek: state.daysPerWeek,
      durationWeeks: state.durationWeeks,
      days: state.days,
      periodization: {
        type: state.periodizationType,
        weeklyIncrementKg: state.periodizationType === 'lineal' ? state.weeklyIncrementKg : undefined,
      },
      active: true,
      createdAt: editRoutine?.createdAt ?? new Date(),
      startedAt: new Date(),
    };

    if (editRoutine) {
      updateRoutine(routine.id, routine);
    } else {
      addRoutine(routine);
    }
    setActiveRoutine(routine.id);
    navigate('/rutinas');
  }

  const stepContent = [
    <Step1 key={0} state={state} onChange={update} />,
    <Step2 key={1} state={state} onChange={update} />,
    <Step3 key={2} state={state} onChange={update} />,
    <Step4 key={3} state={state} onChange={update} />,
    <Step5 key={4} state={state} onActivate={handleActivate} />,
  ];

  return (
    <div className="flex flex-col max-w-lg mx-auto w-full h-full">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => (step === 0 ? navigate('/rutinas') : setStep(step - 1))}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Atrás"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold">
            {editRoutine ? 'Editar rutina' : 'Nueva rutina'}
          </p>
          <p className="text-xs text-muted-foreground">{STEPS[step]}</p>
        </div>
        <StepIndicator current={step} />
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {stepContent[step]}
      </div>

      {/* Bottom nav */}
      {step < 4 && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 max-w-lg mx-auto px-4 py-3 bg-background/95 backdrop-blur-sm border-t border-border">
          <div className="flex gap-3">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11"
                onClick={() => setStep(step - 1)}
              >
                Anterior
              </Button>
            )}
            <Button
              type="button"
              className="flex-1 h-11 gap-2"
              onClick={() => setStep(step + 1)}
              disabled={!canAdvance()}
            >
              {step === 3 ? 'Revisar' : 'Siguiente'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
