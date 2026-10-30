import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, Check, Info, PieChart, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMeasurementStore } from '@/stores/measurementStore';
import {
  COMPOSITION_METHOD_LABELS,
  COMPOSITION_PROTOCOL,
  FAT_PCT_RANGE,
  MUSCLE_PCT_RANGE,
  fmtMeasurementDate,
  localISODate,
  measurementsInRange,
  parseCm,
} from '@/types/measurement';
import type { BodyComposition, CompositionMethod } from '@/types/measurement';

const FAT_COLOR = '#F59E0B';
const MUSCLE_COLOR = '#10B981';
const GRID = 'rgba(255,255,255,0.07)';
const MUTED = '#737373';

function fmtPts(delta: number | undefined): string | undefined {
  if (delta == null) return undefined;
  return `${delta > 0 ? '+' : ''}${delta.toFixed(1)} pts vs. anterior`;
}

/** Previous entry (before `index`) that recorded the given field. */
function previousValue(list: BodyComposition[], index: number, key: 'fatPct' | 'musclePct') {
  for (let i = index - 1; i >= 0; i--) {
    const v = list[i][key];
    if (v != null) return { value: v, entry: list[i] };
  }
  return undefined;
}

// ── Form dialog ───────────────────────────────────────────────────────────────

function CompositionDialog({
  open,
  onClose,
  editing,
  userId,
  defaultMethod,
  lastWeight,
}: {
  open: boolean;
  onClose: () => void;
  editing?: BodyComposition;
  userId: string;
  defaultMethod: CompositionMethod;
  lastWeight?: number;
}) {
  const { addComposition, updateComposition, deleteComposition } = useMeasurementStore();
  const [date, setDate] = useState(editing?.date ?? localISODate());
  const [method, setMethod] = useState<CompositionMethod>(editing?.method ?? defaultMethod);
  const [fat, setFat] = useState(editing?.fatPct != null ? String(editing.fatPct) : '');
  const [muscle, setMuscle] = useState(editing?.musclePct != null ? String(editing.musclePct) : '');
  // New entries start from the latest known weight; the user can change it
  const [weight, setWeight] = useState(() => {
    const w = editing ? editing.weightKg : lastWeight;
    return w != null ? String(w) : '';
  });
  const [notes, setNotes] = useState(editing?.notes ?? '');
  const [showProtocol, setShowProtocol] = useState(!editing);

  const fatPct = parseCm(fat);
  const musclePct = parseCm(muscle);
  const weightKg = parseCm(weight);

  const fatError =
    fat !== '' && (fatPct == null || fatPct < FAT_PCT_RANGE.min || fatPct > FAT_PCT_RANGE.max)
      ? `Entre ${FAT_PCT_RANGE.min} y ${FAT_PCT_RANGE.max} %`
      : undefined;
  const muscleError =
    muscle !== '' &&
    (musclePct == null || musclePct < MUSCLE_PCT_RANGE.min || musclePct > MUSCLE_PCT_RANGE.max)
      ? `Entre ${MUSCLE_PCT_RANGE.min} y ${MUSCLE_PCT_RANGE.max} %`
      : undefined;
  const sumError =
    fatPct != null && musclePct != null && fatPct + musclePct > 100
      ? 'Grasa y músculo no pueden sumar más de 100 %'
      : undefined;
  const canSave =
    !!date && (fatPct != null || musclePct != null) && !fatError && !muscleError && !sumError;

  function handleSave() {
    if (!canSave) return;
    const data = {
      date,
      method,
      fatPct,
      musclePct,
      weightKg,
      notes: notes.trim() || undefined,
    };
    if (editing) {
      updateComposition(editing.id, data);
    } else {
      addComposition({
        id: crypto.randomUUID(),
        userId,
        createdAt: new Date().toISOString(),
        ...data,
      });
    }
    onClose();
  }

  function handleDelete() {
    if (!editing) return;
    if (!window.confirm('¿Eliminar este registro? No se puede deshacer.')) return;
    deleteComposition(editing.id);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm mx-auto max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar composición' : 'Registrar composición'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted/40 px-3 py-2">
            <button
              type="button"
              onClick={() => setShowProtocol((v) => !v)}
              className="w-full flex items-center gap-2 text-xs font-medium text-left"
            >
              <Info className="h-3.5 w-3.5 text-primary shrink-0" />
              Cómo medir para poder comparar
            </button>
            {showProtocol && (
              <ul className="mt-2 space-y-1">
                {COMPOSITION_PROTOCOL.map((p) => (
                  <li key={p} className="flex gap-2 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary mt-px" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Método</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {(Object.keys(COMPOSITION_METHOD_LABELS) as CompositionMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-medium border transition-colors truncate ${
                    method === m
                      ? 'bg-primary/15 border-primary text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {COMPOSITION_METHOD_LABELS[m]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Grasa (%)</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={fat}
                placeholder="—"
                onChange={(e) => setFat(e.target.value)}
                aria-invalid={!!fatError}
                className="h-11 font-mono"
              />
              {fatError && <p className="text-xs text-destructive">{fatError}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Músculo (%)</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={muscle}
                placeholder="—"
                onChange={(e) => setMuscle(e.target.value)}
                aria-invalid={!!muscleError}
                className="h-11 font-mono"
              />
              {muscleError && <p className="text-xs text-destructive">{muscleError}</p>}
            </div>
          </div>
          {sumError && <p className="text-xs text-destructive -mt-2">{sumError}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Fecha</Label>
              <Input
                type="date"
                value={date}
                max={localISODate()}
                onChange={(e) => setDate(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Peso (kg)</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={weight}
                placeholder="—"
                onChange={(e) => setWeight(e.target.value)}
                className="h-11 font-mono"
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground -mt-2">
            Con el peso se calculan los kilos de grasa y de músculo.
          </p>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Notas (opcional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej.: báscula del gimnasio, modelo…"
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-1">
            {editing && (
              <Button
                type="button"
                variant="outline"
                className="h-11 px-3 text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
                aria-label="Eliminar registro"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button type="button" className="flex-1 h-11 gap-2" onClick={handleSave} disabled={!canSave}>
              <Check className="h-4 w-4" />
              {editing ? 'Guardar cambios' : 'Guardar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

function ValueTile({
  label,
  pct,
  kg,
  delta,
  color,
}: {
  label: string;
  pct?: number;
  kg?: number;
  delta?: number;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 flex flex-col gap-1">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        {label}
      </p>
      <p className="font-bold text-lg leading-none font-mono">
        {pct != null ? `${pct.toFixed(1)} %` : '—'}
      </p>
      {kg != null && <p className="text-xs font-mono text-muted-foreground">{kg.toFixed(1)} kg</p>}
      {delta != null && <p className="text-xs text-muted-foreground">{fmtPts(delta)}</p>}
    </div>
  );
}

function ChartTooltip(props: {
  active?: boolean;
  label?: string;
  payload?: { name: string; value: number; color: string }[];
}) {
  if (!props.active || !props.payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs border border-white/10 shadow-xl space-y-1 bg-[#1c1c1c]">
      <p className="text-muted-foreground mb-1">{props.label}</p>
      {props.payload.map((p) => (
        <p key={p.name} className="font-mono" style={{ color: p.color }}>
          {p.name}: {p.value.toFixed(1)} %
        </p>
      ))}
    </div>
  );
}

export default function BodyCompositionSection({
  userId,
  isAdmin,
  weeksBack,
  canEdit,
  lastWeight,
}: {
  userId: string;
  /** Include legacy untagged entries (admin viewing own data) */
  isAdmin: boolean;
  weeksBack: number;
  canEdit: boolean;
  lastWeight?: number;
}) {
  const getUserCompositions = useMeasurementStore((s) => s.getUserCompositions);
  const all = useMeasurementStore((s) => s.compositions);
  const entries = useMemo(
    () => getUserCompositions(userId, isAdmin),
    [userId, isAdmin, getUserCompositions, all], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const inRange = useMemo(() => measurementsInRange(entries, weeksBack), [entries, weeksBack]);

  // Dialog state: undefined = closed, null = new entry, entry = editing
  const [dialog, setDialog] = useState<BodyComposition | null | undefined>(undefined);

  const lastIndex = entries.length - 1;
  const latest = entries[lastIndex];
  const prevFat = latest ? previousValue(entries, lastIndex, 'fatPct') : undefined;
  const prevMuscle = latest ? previousValue(entries, lastIndex, 'musclePct') : undefined;
  const latestWeight = latest?.weightKg;
  const methodChanged =
    latest != null &&
    [prevFat?.entry, prevMuscle?.entry].some((e) => e != null && e.method !== latest.method);

  const chartData = inRange.map((c) => ({
    period: fmtMeasurementDate(c.date, { day: 'numeric', month: 'short' }),
    fat: c.fatPct,
    muscle: c.musclePct,
  }));

  return (
    <div className="px-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-1.5">
          <PieChart className="h-3.5 w-3.5" />
          Composición corporal
        </p>
        {canEdit && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => setDialog(null)}
          >
            <Plus className="h-3.5 w-3.5" />
            Registrar
          </Button>
        )}
      </div>

      {!latest ? (
        <div className="rounded-xl border border-dashed border-border p-4 text-center space-y-1">
          <p className="text-sm font-medium">% de grasa y % de músculo</p>
          <p className="text-xs text-muted-foreground">
            Registra los valores de tu báscula de bioimpedancia, DEXA o medición de pliegues para
            ver su evolución.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5">
            <ValueTile
              label="Grasa"
              pct={latest.fatPct}
              kg={latest.fatPct != null && latestWeight != null ? (latestWeight * latest.fatPct) / 100 : undefined}
              delta={latest.fatPct != null && prevFat ? latest.fatPct - prevFat.value : undefined}
              color={FAT_COLOR}
            />
            <ValueTile
              label="Músculo"
              pct={latest.musclePct}
              kg={latest.musclePct != null && latestWeight != null ? (latestWeight * latest.musclePct) / 100 : undefined}
              delta={latest.musclePct != null && prevMuscle ? latest.musclePct - prevMuscle.value : undefined}
              color={MUSCLE_COLOR}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Último registro: {fmtMeasurementDate(latest.date)} · {COMPOSITION_METHOD_LABELS[latest.method]}
            {latestWeight != null ? ` · ${latestWeight} kg` : ''}
          </p>
          {methodChanged && (
            <p className="text-[11px] text-amber-500 flex gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-px" />
              El registro anterior usó otro método: la diferencia puede deberse al método y no a un
              cambio real.
            </p>
          )}

          {chartData.length >= 2 ? (
            <ResponsiveContainer width="100%" height={170}>
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis
                  dataKey="period"
                  tick={{ fill: MUTED, fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: MUTED, fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[(min: number) => Math.max(0, Math.floor(min - 2)), (max: number) => Math.ceil(max + 2)]}
                  allowDecimals={false}
                  unit="%"
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="fat" name="Grasa" stroke={FAT_COLOR} strokeWidth={2} dot={{ fill: FAT_COLOR, r: 3 }} connectNulls />
                <Line type="monotone" dataKey="muscle" name="Músculo" stroke={MUSCLE_COLOR} strokeWidth={2} dot={{ fill: MUSCLE_COLOR, r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              {inRange.length === 0
                ? 'Sin registros en este período.'
                : 'Registra al menos dos veces para ver la evolución.'}
            </p>
          )}

          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {[...entries].reverse().map((c) => (
              <button
                key={c.id}
                type="button"
                disabled={!canEdit}
                onClick={() => setDialog(c)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left enabled:hover:bg-muted/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{fmtMeasurementDate(c.date, { dateStyle: 'medium' })}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {COMPOSITION_METHOD_LABELS[c.method]}
                    {c.notes ? ` · ${c.notes}` : ''}
                  </p>
                </div>
                <div className="text-right font-mono text-xs shrink-0 space-y-0.5">
                  <p style={{ color: FAT_COLOR }}>{c.fatPct != null ? `${c.fatPct.toFixed(1)} %` : '—'}</p>
                  <p style={{ color: MUSCLE_COLOR }}>{c.musclePct != null ? `${c.musclePct.toFixed(1)} %` : '—'}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {dialog !== undefined && (
        <CompositionDialog
          key={dialog?.id ?? 'new'}
          open
          onClose={() => setDialog(undefined)}
          editing={dialog ?? undefined}
          userId={userId}
          defaultMethod={latest?.method ?? 'bioimpedancia'}
          lastWeight={latestWeight ?? lastWeight}
        />
      )}
    </div>
  );
}
