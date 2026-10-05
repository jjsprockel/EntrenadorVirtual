import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ClipboardCheck, Info, Ruler, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import BodyFigure from '@/components/measurements/BodyFigure';
import { useMeasurementStore } from '@/stores/measurementStore';
import { useUsersStore } from '@/stores/usersStore';
import {
  MEASUREMENT_PROTOCOL,
  MEASUREMENT_SITES,
  READING_TOLERANCE_CM,
  SIDE_LABELS,
  fmtMeasurementDate,
  localISODate,
  parseCm,
  readingsValue,
  sidesForSite,
  siteValue,
} from '@/types/measurement';
import type {
  BodyMeasurement,
  MeasurementSide,
  MeasurementSiteDef,
  MeasurementSiteId,
} from '@/types/measurement';

// Inputs are kept as strings while editing: [toma 1, toma 2, toma 3]
type Draft = Partial<Record<MeasurementSiteId, Partial<Record<MeasurementSide, string[]>>>>;

const EMPTY_READINGS = ['', '', ''];

function toDraft(m: BodyMeasurement): Draft {
  const draft: Draft = {};
  for (const [site, sides] of Object.entries(m.values) as [MeasurementSiteId, Record<string, number[]>][]) {
    draft[site] = {};
    for (const [side, readings] of Object.entries(sides) as [MeasurementSide, number[]][]) {
      draft[site]![side] = [0, 1, 2].map((i) => (readings[i] != null ? String(readings[i]) : ''));
    }
  }
  return draft;
}

function draftReadings(draft: Draft, site: MeasurementSiteId, side: MeasurementSide): number[] {
  return (draft[site]?.[side] ?? EMPTY_READINGS)
    .map(parseCm)
    .filter((n): n is number => n != null);
}

/** Whether the first two readings differ enough to require a third. */
function needsThird(raw: string[]): boolean {
  const [a, b] = [parseCm(raw[0] ?? ''), parseCm(raw[1] ?? '')];
  return a != null && b != null && Math.abs(a - b) > READING_TOLERANCE_CM;
}

function fmtCm(v: number | undefined): string {
  return v == null ? '—' : `${v.toFixed(1)} cm`;
}

// ── Step: protocol, date and weight ───────────────────────────────────────────

function IntroStep({
  date,
  onDate,
  weight,
  onWeight,
  lastWeight,
}: {
  date: string;
  onDate: (v: string) => void;
  weight: string;
  onWeight: (v: string) => void;
  lastWeight?: number;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Para que tus medidas sean comparables</p>
        </div>
        <ul className="space-y-2">
          {MEASUREMENT_PROTOCOL.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Fecha</Label>
          <Input
            type="date"
            value={date}
            max={localISODate()}
            onChange={(e) => onDate(e.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Peso (kg)</Label>
          <Input
            type="text"
            inputMode="decimal"
            value={weight}
            placeholder={lastWeight != null ? String(lastWeight) : '—'}
            onChange={(e) => onWeight(e.target.value)}
            className="h-11 font-mono"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground flex gap-2">
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        Todas las medidas son opcionales: registra solo las que quieras seguir y deja el resto en
        blanco.
      </p>
    </div>
  );
}

// ── Step: one measurement site ────────────────────────────────────────────────

function ReadingInputs({
  label,
  raw,
  onChange,
}: {
  label?: string;
  raw: string[];
  onChange: (index: number, value: string) => void;
}) {
  const third = needsThird(raw) || (raw[2] ?? '') !== '';
  const value = readingsValue(raw.map(parseCm).filter((n): n is number => n != null));
  const count = third ? 3 : 2;

  return (
    <div className="rounded-xl border border-border bg-card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label ?? 'Medida'}
        </p>
        <p className="text-sm font-bold font-mono text-primary">{fmtCm(value)}</p>
      </div>
      <div className={`grid gap-2 ${count === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="space-y-1">
            <p className="text-[10px] text-muted-foreground">Toma {i + 1}</p>
            <Input
              type="text"
              inputMode="decimal"
              value={raw[i] ?? ''}
              placeholder="cm"
              onChange={(e) => onChange(i, e.target.value)}
              className="h-11 font-mono text-center"
            />
          </div>
        ))}
      </div>
      {needsThird(raw) && (
        <p className="text-[11px] text-amber-500">
          Las dos tomas difieren más de 5 mm: haz una tercera. Se usará la mediana.
        </p>
      )}
    </div>
  );
}

function SiteStep({
  def,
  draft,
  onChange,
  previous,
}: {
  def: MeasurementSiteDef;
  draft: Draft;
  onChange: (side: MeasurementSide, index: number, value: string) => void;
  previous?: BodyMeasurement;
}) {
  const prevValue = previous ? siteValue(previous, def.id) : undefined;

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="h-56 shrink-0 rounded-xl bg-muted/30 border border-border flex items-center justify-center px-2">
          <BodyFigure
            bands={[{ site: def.id }]}
            pose={def.id === 'brazo_contraido' ? 'flexed' : 'relaxed'}
          />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <span
              className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                def.tier === 'basica' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
              }`}
            >
              {def.tier === 'basica' ? 'Básica' : 'Opcional'}
            </span>
            <h2 className="text-lg font-bold leading-tight mt-1">{def.label}</h2>
            <p className="text-xs text-muted-foreground">{def.reflects}</p>
          </div>
          <ol className="space-y-1.5">
            {def.steps.map((s, i) => (
              <li key={s} className="flex gap-2 text-[13px] leading-snug">
                <span className="shrink-0 h-4.5 w-4.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center mt-px">
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <p className="text-xs text-muted-foreground flex gap-2 rounded-lg bg-muted/40 px-3 py-2">
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
        {def.tip}
      </p>

      <div className="space-y-2.5">
        {sidesForSite(def).map((side) => (
          <ReadingInputs
            key={side}
            label={def.bilateral ? (side === 'left' ? 'Izquierdo' : 'Derecho') : undefined}
            raw={draft[def.id]?.[side] ?? EMPTY_READINGS}
            onChange={(i, v) => onChange(side, i, v)}
          />
        ))}
      </div>

      {prevValue != null && previous && (
        <p className="text-xs text-muted-foreground text-center">
          Medición anterior ({fmtMeasurementDate(previous.date)}): {fmtCm(prevValue)}
        </p>
      )}
    </div>
  );
}

// ── Step: summary ─────────────────────────────────────────────────────────────

function SummaryStep({
  draft,
  date,
  weight,
  notes,
  onNotes,
  onJump,
}: {
  draft: Draft;
  date: string;
  weight?: number;
  notes: string;
  onNotes: (v: string) => void;
  onJump: (siteIndex: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{fmtMeasurementDate(date, { dateStyle: 'long' })}</span>
        <span className="font-mono font-semibold">{weight != null ? `${weight} kg` : 'Sin peso'}</span>
      </div>

      <div className="rounded-xl border border-border divide-y divide-border bg-card">
        {MEASUREMENT_SITES.map((def, i) => {
          const sides = sidesForSite(def);
          const vals = sides.map((side) => readingsValue(draftReadings(draft, def.id, side)));
          const empty = vals.every((v) => v == null);
          return (
            <button
              key={def.id}
              type="button"
              onClick={() => onJump(i)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-muted/40 transition-colors"
            >
              <span className={`text-sm ${empty ? 'text-muted-foreground' : 'font-medium'}`}>
                {def.label}
              </span>
              <span className="text-sm font-mono">
                {empty
                  ? <span className="text-muted-foreground text-xs">Omitida</span>
                  : def.bilateral
                  ? sides.map((side, j) => `${SIDE_LABELS[side]} ${vals[j] != null ? vals[j]!.toFixed(1) : '—'}`).join(' · ')
                  : fmtCm(vals[0])}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Notas (opcional)</Label>
        <Textarea
          value={notes}
          onChange={(e) => onNotes(e.target.value)}
          placeholder="Ej.: medido por la tarde, tras una semana de descarga…"
          rows={3}
        />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const SUMMARY_STEP = MEASUREMENT_SITES.length + 1;

export default function MeasurementWizardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const editing = useMeasurementStore((s) => (id ? s.measurements.find((m) => m.id === id) : undefined));

  // Deep link to a measurement that doesn't exist (or the store is still hydrating)
  if (id && !editing) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 text-sm text-muted-foreground">
        <p>Medición no encontrada.</p>
        <Button type="button" variant="outline" onClick={() => navigate('/progreso?tab=cuerpo')}>
          Volver a Progreso
        </Button>
      </div>
    );
  }

  // Remount when switching measurement so the draft is re-initialised
  return <MeasurementWizard key={editing?.id ?? 'new'} editing={editing} />;
}

function MeasurementWizard({ editing }: { editing?: BodyMeasurement }) {
  const id = editing?.id;
  const navigate = useNavigate();
  const activeUserId = useUsersStore((s) => s.activeUserId);
  const isAdmin = useUsersStore((s) => s.getActiveUser()?.role === 'admin');
  const profileWeight = useUsersStore((s) => s.getActiveUser()?.profile.bodyWeightKg);
  const updateUserProfile = useUsersStore((s) => s.updateUserProfile);
  const { measurements, addMeasurement, updateMeasurement, deleteMeasurement, getUserMeasurements } =
    useMeasurementStore();

  const [step, setStep] = useState(0);
  const [date, setDate] = useState(editing?.date ?? localISODate());
  const [weight, setWeight] = useState(editing?.weightKg != null ? String(editing.weightKg) : '');
  const [notes, setNotes] = useState(editing?.notes ?? '');
  const [draft, setDraft] = useState<Draft>(() => (editing ? toDraft(editing) : {}));

  const history = useMemo(
    () => (activeUserId ? getUserMeasurements(activeUserId, isAdmin) : []),
    [activeUserId, isAdmin, getUserMeasurements, measurements], // eslint-disable-line react-hooks/exhaustive-deps
  );
  // Most recent measurement before this one, for reference values
  const previous = useMemo(
    () => [...history].reverse().find((m) => m.id !== id && m.date <= date),
    [history, id, date],
  );

  const weightKg = parseCm(weight);
  const siteDef = step >= 1 && step < SUMMARY_STEP ? MEASUREMENT_SITES[step - 1] : undefined;
  const siteHasData =
    siteDef != null && sidesForSite(siteDef).some((side) => draftReadings(draft, siteDef.id, side).length > 0);

  function setReading(site: MeasurementSiteId, side: MeasurementSide, index: number, value: string) {
    setDraft((d) => {
      const readings = [...(d[site]?.[side] ?? EMPTY_READINGS)];
      readings[index] = value;
      return { ...d, [site]: { ...d[site], [side]: readings } };
    });
  }

  const hasAnyData =
    weightKg != null ||
    MEASUREMENT_SITES.some((def) =>
      sidesForSite(def).some((side) => draftReadings(draft, def.id, side).length > 0),
    );

  function handleSave() {
    if (!activeUserId) return;
    const values: BodyMeasurement['values'] = {};
    for (const def of MEASUREMENT_SITES) {
      for (const side of sidesForSite(def)) {
        const readings = draftReadings(draft, def.id, side);
        if (readings.length > 0) values[def.id] = { ...values[def.id], [side]: readings };
      }
    }

    const data = {
      date,
      weightKg,
      values,
      notes: notes.trim() || undefined,
    };
    if (editing) {
      updateMeasurement(editing.id, data);
    } else {
      addMeasurement({
        id: crypto.randomUUID(),
        userId: activeUserId,
        createdAt: new Date().toISOString(),
        ...data,
      });
    }

    // Keep the profile weight in sync when this is the latest weigh-in
    const latestOther = history.filter((m) => m.id !== id).at(-1);
    if (weightKg != null && (!latestOther || date >= latestOther.date)) {
      updateUserProfile(activeUserId, { bodyWeightKg: weightKg });
    }

    navigate('/progreso?tab=cuerpo');
  }

  function handleDelete() {
    if (!editing) return;
    if (!window.confirm('¿Eliminar esta medición? No se puede deshacer.')) return;
    deleteMeasurement(editing.id);
    navigate('/progreso?tab=cuerpo');
  }

  const stepTitle =
    step === 0 ? 'Preparación' : step === SUMMARY_STEP ? 'Resumen' : `${step} de ${MEASUREMENT_SITES.length}`;

  return (
    <div className="flex flex-col max-w-lg mx-auto w-full h-full">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 space-y-2.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => (step === 0 ? navigate('/progreso?tab=cuerpo') : setStep(step - 1))}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Atrás"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <p className="text-sm font-semibold flex items-center gap-1.5">
              <Ruler className="h-3.5 w-3.5 text-primary" />
              {editing ? 'Editar medición' : 'Nueva medición'}
            </p>
            <p className="text-xs text-muted-foreground">{stepTitle}</p>
          </div>
          {editing && (
            <button
              type="button"
              onClick={handleDelete}
              className="text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Eliminar medición"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(step / SUMMARY_STEP) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {step === 0 && (
          <IntroStep
            date={date}
            onDate={setDate}
            weight={weight}
            onWeight={setWeight}
            lastWeight={previous?.weightKg ?? profileWeight}
          />
        )}
        {siteDef && (
          <SiteStep
            key={siteDef.id}
            def={siteDef}
            draft={draft}
            onChange={(side, i, v) => setReading(siteDef.id, side, i, v)}
            previous={previous}
          />
        )}
        {step === SUMMARY_STEP && (
          <SummaryStep
            draft={draft}
            date={date}
            weight={weightKg}
            notes={notes}
            onNotes={setNotes}
            onJump={(i) => setStep(i + 1)}
          />
        )}
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 max-w-lg mx-auto px-4 py-3 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="flex gap-3">
          {step > 0 && step < SUMMARY_STEP && (
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11"
              onClick={() => setStep(SUMMARY_STEP)}
            >
              Ir al resumen
            </Button>
          )}
          {step < SUMMARY_STEP ? (
            <Button
              type="button"
              className="flex-1 h-11 gap-2"
              onClick={() => setStep(step + 1)}
              disabled={step === 0 && !date}
            >
              {step === 0 ? 'Empezar' : siteHasData ? 'Siguiente' : 'Omitir'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              className="flex-1 h-11 gap-2"
              onClick={handleSave}
              disabled={!hasAnyData || !date}
            >
              <Check className="h-4 w-4" />
              {editing ? 'Guardar cambios' : 'Guardar medición'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
