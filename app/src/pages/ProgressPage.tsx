import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Trophy, BarChart2, Dumbbell, ChevronDown, Activity } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useSessionStore } from '@/stores/sessionStore';
import { useExerciseStore } from '@/stores/exerciseStore';
import { useUsersStore } from '@/stores/usersStore';
import UserAvatar from '@/components/admin/UserAvatar';
import type { AppUser } from '@/types/user';
import {
  getChartData,
  getExercisePoints,
  getPersonalRecords,
  getSummaryStats,
  getLoggedExerciseCodes,
  TIME_RANGES,
  METRIC_LABELS,
  METRIC_UNITS,
} from '@/lib/statsEngine';
import type { MetricType } from '@/lib/statsEngine';
import type { MuscleGroup } from '@/types/exercise';
import type { Session, CardioType } from '@/types/session';
import { CARDIO_LABELS } from '@/types/session';

// ── Chart theme ───────────────────────────────────────────────────────────────

const C = {
  primary:   '#FF6B35',
  secondary: '#3B82F6',
  success:   '#10B981',
  warning:   '#F59E0B',
  purple:    '#8B5CF6',
  pink:      '#EC4899',
  teal:      '#14B8A6',
  red:       '#EF4444',
  muted:     '#737373',
  grid:      'rgba(255,255,255,0.07)',
  tooltip:   '#1c1c1c',
};

// ── PPL config ────────────────────────────────────────────────────────────────

type PPLKey = 'push' | 'pull' | 'legs';

const PPL_CONFIG: Record<PPLKey, { label: string; color: string; muscleGroups: MuscleGroup[] }> = {
  push: {
    label: 'Push',
    color: C.primary,
    muscleGroups: ['pecho', 'hombros', 'triceps'],
  },
  pull: {
    label: 'Pull',
    color: C.secondary,
    muscleGroups: ['espalda', 'biceps'],
  },
  legs: {
    label: 'Piernas',
    color: C.success,
    muscleGroups: ['cuadriceps', 'isquiotibiales_gluteos', 'pantorrillas', 'core'],
  },
};

// ── Muscle group config ───────────────────────────────────────────────────────

const MG_CONFIG: Record<MuscleGroup, { label: string; color: string }> = {
  pecho:                   { label: 'Pecho',           color: C.primary   },
  espalda:                 { label: 'Espalda',         color: C.secondary },
  hombros:                 { label: 'Hombros',         color: C.success   },
  biceps:                  { label: 'Bíceps',          color: C.warning   },
  triceps:                 { label: 'Tríceps',         color: C.purple    },
  cuadriceps:              { label: 'Cuádriceps',      color: C.pink      },
  isquiotibiales_gluteos:  { label: 'Isquios/Glúteos', color: C.teal      },
  pantorrillas:            { label: 'Pantorrillas',    color: C.red       },
  core:                    { label: 'Core',            color: C.muted     },
  trapecio:                { label: 'Trapecio',        color: '#D97706'   },
  antebrazos:              { label: 'Antebrazos',      color: '#84CC16'   },
};

// ── Custom tooltip ────────────────────────────────────────────────────────────

function makeTooltip(unit: string) {
  return (props: any) => {
    if (!props.active || !props.payload?.length) return null;
    const val = props.payload[0]?.value;
    return (
      <div
        style={{ background: C.tooltip }}
        className="rounded-lg px-3 py-2 text-xs border border-white/10 shadow-xl"
      >
        <p className="text-muted-foreground mb-1">{props.label}</p>
        <p className="font-mono font-bold text-white">
          {typeof val === 'number' ? val.toLocaleString() : '—'} {unit}
        </p>
        {props.payload[0]?.payload?.sessions != null && (
          <p className="text-muted-foreground">
            {props.payload[0].payload.sessions} sesión{props.payload[0].payload.sessions !== 1 ? 'es' : ''}
          </p>
        )}
      </div>
    );
  };
}

function makeMultiTooltip(unit: string) {
  return (props: any) => {
    if (!props.active || !props.payload?.length) return null;
    return (
      <div
        style={{ background: C.tooltip }}
        className="rounded-lg px-3 py-2 text-xs border border-white/10 shadow-xl space-y-1"
      >
        <p className="text-muted-foreground mb-1">{props.label}</p>
        {props.payload.map((p: any) => (
          <p key={p.name} className="font-mono" style={{ color: p.color }}>
            {p.name}: {p.value?.toLocaleString() ?? '—'} {unit}
          </p>
        ))}
      </div>
    );
  };
}

// ── Shared small components ───────────────────────────────────────────────────

function TimeRangeSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (k: string) => void;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none px-4">
      {TIME_RANGES.map((r) => (
        <button
          key={r.key}
          type="button"
          onClick={() => onChange(r.key)}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            value === r.key
              ? 'bg-primary border-primary text-primary-foreground'
              : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

function MetricSelector({
  value,
  onChange,
}: {
  value: MetricType;
  onChange: (m: MetricType) => void;
}) {
  const opts: MetricType[] = ['volume', 'maxWeight', 'reps'];
  return (
    <div className="flex gap-1.5 px-4">
      {opts.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            value === m
              ? 'bg-primary/15 border-primary text-primary'
              : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
          }`}
        >
          {METRIC_LABELS[m]}
        </button>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down' | 'flat';
}) {
  const Icon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up'
      ? 'text-success'
      : trend === 'down'
      ? 'text-destructive'
      : 'text-muted-foreground';

  return (
    <div className="bg-card border border-border rounded-xl p-3 flex flex-col gap-1">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
        {label}
      </p>
      <p className="font-bold text-lg leading-none font-mono">{value}</p>
      {sub && (
        <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
          {trend && <Icon className="h-3 w-3" />}
          <span>{sub}</span>
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
      <Dumbbell className="h-10 w-10 opacity-20" />
      <p className="text-sm text-center">{text}</p>
    </div>
  );
}

function BarOrLineChart({
  data,
  metric,
  color,
  useLine = false,
}: {
  data: { period: string; value: number }[];
  metric: MetricType;
  color: string;
  useLine?: boolean;
}) {
  const unit = METRIC_UNITS[metric];
  const tooltip = makeTooltip(unit);
  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="h-36 flex items-center justify-center text-xs text-muted-foreground">
        Sin datos en este período
      </div>
    );
  }

  const common = {
    data,
    margin: { top: 4, right: 4, left: -18, bottom: 0 },
  };

  const axisProps = {
    xAxis: (
      <XAxis
        dataKey="period"
        tick={{ fill: C.muted, fontSize: 9 }}
        axisLine={false}
        tickLine={false}
        interval="preserveStartEnd"
      />
    ),
    yAxis: (
      <YAxis
        tick={{ fill: C.muted, fontSize: 9 }}
        axisLine={false}
        tickLine={false}
        tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
      />
    ),
    grid: <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />,
  };

  if (useLine || metric === 'maxWeight') {
    return (
      <ResponsiveContainer width="100%" height={180}>
        <LineChart {...common}>
          {axisProps.grid}
          {axisProps.xAxis}
          {axisProps.yAxis}
          <Tooltip content={tooltip} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart {...common} barSize={Math.max(6, Math.floor(300 / data.length) - 4)}>
        {axisProps.grid}
        {axisProps.xAxis}
        {axisProps.yAxis}
        <Tooltip content={tooltip} />
        <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Cardio helpers ────────────────────────────────────────────────────────────

function getSessionCalories(s: Session): number {
  if (s.totalCalories) return s.totalCalories;
  return (s.cardioEntries ?? []).reduce((sum, e) => sum + (e.calories ?? 0), 0);
}

function getSessionDurationMinutes(s: Session): number {
  if (!s.completedAt) return 0;
  const ms = new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime();
  return Math.max(0, Math.round(ms / 60000));
}

function fmtDuration(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${minutes} min`;
}

function getWeeklySessionMetric(
  sessions: Session[],
  weeksBack: number,
  valueFn: (s: Session) => number,
): { period: string; value: number }[] {
  const effective = weeksBack === 0 ? 26 : weeksBack;
  const MS_WEEK = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  return Array.from({ length: effective }, (_, i) => {
    const weekOffset = effective - 1 - i;
    const weekEnd = now - weekOffset * MS_WEEK;
    const weekStart = weekEnd - MS_WEEK;

    const value = sessions
      .filter((s) => {
        const d = new Date(s.date).getTime();
        return d >= weekStart && d < weekEnd;
      })
      .reduce((sum, s) => sum + valueFn(s), 0);

    const period = new Date(weekStart).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
    return { period, value };
  });
}

function getCardioWeeklyData(
  sessions: Session[],
  weeksBack: number,
): { period: string; minutes: number }[] {
  const effective = weeksBack === 0 ? 26 : weeksBack;
  const MS_WEEK = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  return Array.from({ length: effective }, (_, i) => {
    const weekOffset = effective - 1 - i;
    const weekEnd = now - weekOffset * MS_WEEK;
    const weekStart = weekEnd - MS_WEEK;

    const minutes = sessions
      .filter((s) => {
        const d = new Date(s.date).getTime();
        return d >= weekStart && d < weekEnd;
      })
      .reduce(
        (sum, s) =>
          sum + (s.cardioEntries ?? []).reduce((m, e) => m + e.durationMinutes, 0),
        0,
      );

    const period = new Date(weekStart).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
    return { period, minutes };
  });
}

// ── Tab: Resumen ──────────────────────────────────────────────────────────────

function ResumenTab({
  sessions,
  metric,
  onMetricChange,
  weeksBack,
}: {
  sessions: Parameters<typeof getChartData>[0];
  metric: MetricType;
  onMetricChange: (m: MetricType) => void;
  weeksBack: number;
}) {
  const stats = useMemo(() => getSummaryStats(sessions), [sessions]);
  const chartData = useMemo(
    () => getChartData(sessions, metric, weeksBack),
    [sessions, metric, weeksBack],
  );
  const prs = useMemo(() => getPersonalRecords(sessions), [sessions]);
  const { getByCode } = useExerciseStore();

  const totalCalories = useMemo(
    () => sessions.reduce((sum, s) => sum + getSessionCalories(s), 0),
    [sessions],
  );
  const weekCalories = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return sessions
      .filter((s) => new Date(s.date).getTime() >= cutoff)
      .reduce((sum, s) => sum + getSessionCalories(s), 0);
  }, [sessions]);

  const totalDurationMinutes = useMemo(
    () => sessions.reduce((sum, s) => sum + getSessionDurationMinutes(s), 0),
    [sessions],
  );
  const avgDurationMinutes = useMemo(
    () => (sessions.length > 0 ? Math.round(totalDurationMinutes / sessions.length) : 0),
    [sessions, totalDurationMinutes],
  );

  const recentSessions = useMemo(
    () =>
      [...sessions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10),
    [sessions],
  );

  const caloriesWeeklyData = useMemo(
    () => getWeeklySessionMetric(sessions, weeksBack, getSessionCalories),
    [sessions, weeksBack],
  );
  const durationWeeklyData = useMemo(
    () => getWeeklySessionMetric(sessions, weeksBack, getSessionDurationMinutes),
    [sessions, weeksBack],
  );
  const hasCaloriesData = caloriesWeeklyData.some((d) => d.value > 0);
  const hasDurationData = durationWeeklyData.some((d) => d.value > 0);

  const weekDiff = stats.prevWeekVolume
    ? Math.round(((stats.weekVolume - stats.prevWeekVolume) / stats.prevWeekVolume) * 100)
    : null;
  const weekTrend =
    weekDiff === null ? undefined : weekDiff > 0 ? 'up' : weekDiff < 0 ? 'down' : 'flat';

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="px-4 grid grid-cols-2 gap-2.5">
        <StatCard
          label="Sesiones totales"
          value={String(stats.totalSessions)}
          sub="completadas"
        />
        <StatCard
          label="Volumen promedio"
          value={
            stats.avgSessionVolume > 0
              ? `${(stats.avgSessionVolume / 1000).toFixed(1)}k kg`
              : '—'
          }
          sub="por sesión"
        />
        <StatCard
          label="Volumen esta semana"
          value={
            stats.weekVolume > 0
              ? `${(stats.weekVolume / 1000).toFixed(1)}k kg`
              : '—'
          }
          sub={weekDiff !== null ? `${weekDiff > 0 ? '+' : ''}${weekDiff}% vs sem. ant.` : undefined}
          trend={weekTrend}
        />
        <StatCard
          label="Ejercicios únicos"
          value={String(stats.uniqueExercises)}
          sub="en el historial"
        />
        {totalCalories > 0 && (
          <StatCard
            label="Calorías totales"
            value={`${totalCalories.toLocaleString()} kcal`}
            sub="registradas"
          />
        )}
        {weekCalories > 0 && (
          <StatCard
            label="Calorías esta semana"
            value={`${weekCalories.toLocaleString()} kcal`}
            sub="últimos 7 días"
          />
        )}
        {totalDurationMinutes > 0 && (
          <StatCard
            label="Tiempo total entrenado"
            value={fmtDuration(totalDurationMinutes)}
            sub="acumulado"
          />
        )}
        {avgDurationMinutes > 0 && (
          <StatCard
            label="Duración promedio"
            value={fmtDuration(avgDurationMinutes)}
            sub="por sesión"
          />
        )}
      </div>

      {/* Metric + chart */}
      <MetricSelector value={metric} onChange={onMetricChange} />
      <div className="px-4">
        <BarOrLineChart data={chartData} metric={metric} color={C.primary} />
      </div>

      {/* Calories per week */}
      {hasCaloriesData && (
        <div className="px-4 space-y-2">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
            Calorías por semana
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={caloriesWeeklyData}
              margin={{ top: 4, right: 4, left: -18, bottom: 0 }}
              barSize={Math.max(6, Math.floor(300 / caloriesWeeklyData.length) - 4)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis
                dataKey="period"
                tick={{ fill: C.muted, fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: C.muted, fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={makeTooltip('kcal')} />
              <Bar dataKey="value" fill={C.warning} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Training duration per week */}
      {hasDurationData && (
        <div className="px-4 space-y-2">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
            Duración de entrenamiento por semana
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={durationWeeklyData}
              margin={{ top: 4, right: 4, left: -18, bottom: 0 }}
              barSize={Math.max(6, Math.floor(300 / durationWeeklyData.length) - 4)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis
                dataKey="period"
                tick={{ fill: C.muted, fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: C.muted, fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={makeTooltip('min')} />
              <Bar dataKey="value" fill={C.teal} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent sessions — duration + calories per session */}
      {recentSessions.length > 0 && (
        <div className="px-4 space-y-2">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
            Últimas sesiones
          </p>
          <div className="space-y-1.5">
            {recentSessions.map((s) => {
              const durationMin = getSessionDurationMinutes(s);
              const kcal = getSessionCalories(s);
              const vol = s.totalVolume ?? 0;
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card border border-border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {s.dayName ?? 'Sesión'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(s.date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right shrink-0 space-y-0.5">
                    <p className="text-sm font-bold font-mono text-primary">
                      {durationMin > 0 ? fmtDuration(durationMin) : '—'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {[
                        vol > 0 ? `${vol.toLocaleString()} kg` : null,
                        kcal > 0 ? `${kcal.toLocaleString()} kcal` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ') || '—'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PRs */}
      {prs.length > 0 && (
        <div className="px-4 space-y-2">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-warning" />
            Récords personales
          </p>
          <div className="space-y-1.5">
            {prs.slice(0, 5).map((pr) => {
              const ex = getByCode(pr.exerciseCode);
              return (
                <div
                  key={pr.exerciseCode}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card border border-border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {ex?.nameEs ?? pr.exerciseCode}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(pr.date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold font-mono text-primary">
                      {pr.maxWeight} kg × {pr.repsAtMax}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      e1RM ~{pr.e1rm} kg
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Ejercicio ────────────────────────────────────────────────────────────

function EjercicioTab({
  sessions,
  metric,
  onMetricChange,
  weeksBack,
}: {
  sessions: Parameters<typeof getChartData>[0];
  metric: MetricType;
  onMetricChange: (m: MetricType) => void;
  weeksBack: number;
}) {
  const { getByCode } = useExerciseStore();
  const loggedCodes = useMemo(() => getLoggedExerciseCodes(sessions), [sessions]);
  const [selectedCode, setSelectedCode] = useState<string | null>(() => loggedCodes[0] ?? null);

  const activeCode = selectedCode ?? loggedCodes[0] ?? null;

  const points = useMemo(
    () => (activeCode ? getExercisePoints(sessions, activeCode, weeksBack) : []),
    [sessions, activeCode, weeksBack],
  );

  const chartData = points.map((p) => ({
    period: p.date,
    value:
      metric === 'volume'
        ? p.volume
        : metric === 'maxWeight'
        ? p.maxWeight
        : p.totalReps,
    sessions: 1,
  }));

  if (loggedCodes.length === 0) {
    return <EmptyState text="Completa sesiones para ver el progreso por ejercicio." />;
  }

  return (
    <div className="space-y-4">
      {/* Exercise picker chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none px-4">
        {loggedCodes.map((code) => {
          const ex = getByCode(code);
          const isActive = code === activeCode;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setSelectedCode(code)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isActive
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
              }`}
            >
              {ex?.nameEs ?? code}
            </button>
          );
        })}
      </div>

      <MetricSelector value={metric} onChange={onMetricChange} />

      <div className="px-4">
        <BarOrLineChart data={chartData} metric={metric} color={C.secondary} useLine />
      </div>

      {/* History list */}
      {points.length > 0 && (
        <div className="px-4 space-y-2">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
            Historial
          </p>
          <div className="space-y-1.5">
            {[...points].reverse().map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card border border-border"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{p.date}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Mejor: {p.bestSet} · Vol: {p.volume.toLocaleString()} kg
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold font-mono text-primary">
                    {metric === 'volume'
                      ? `${p.volume.toLocaleString()} kg`
                      : metric === 'maxWeight'
                      ? `${p.maxWeight} kg`
                      : `${p.totalReps} reps`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Grupo Muscular ───────────────────────────────────────────────────────

function MuscularTab({
  sessions,
  metric,
  onMetricChange,
  weeksBack,
}: {
  sessions: Parameters<typeof getChartData>[0];
  metric: MetricType;
  onMetricChange: (m: MetricType) => void;
  weeksBack: number;
}) {
  const { getAllExercises } = useExerciseStore();
  const allExercises = getAllExercises();

  // Only show muscle groups that appear in sessions
  const loggedCodes = useMemo(() => new Set(getLoggedExerciseCodes(sessions)), [sessions]);
  const activeGroups = useMemo((): MuscleGroup[] => {
    const groups = new Set<MuscleGroup>();
    allExercises.forEach((e) => {
      if (loggedCodes.has(e.code)) groups.add(e.muscleGroup);
    });
    return (Object.keys(MG_CONFIG) as MuscleGroup[]).filter((g) => groups.has(g));
  }, [allExercises, loggedCodes]);

  const [selectedMG, setSelectedMG] = useState<MuscleGroup>(
    () => activeGroups[0] ?? 'pecho',
  );

  const mgCodes = useMemo(
    () => allExercises.filter((e) => e.muscleGroup === selectedMG).map((e) => e.code),
    [allExercises, selectedMG],
  );

  const chartData = useMemo(
    () => getChartData(sessions, metric, weeksBack, mgCodes),
    [sessions, metric, weeksBack, mgCodes],
  );

  // Compare all groups
  const compareData = useMemo(() => {
    const barsByPeriod: Record<string, Record<string, number>> = {};
    activeGroups.forEach((mg) => {
      const codes = allExercises.filter((e) => e.muscleGroup === mg).map((e) => e.code);
      getChartData(sessions, metric, weeksBack, codes).forEach((bar) => {
        if (!barsByPeriod[bar.period]) barsByPeriod[bar.period] = {};
        barsByPeriod[bar.period][MG_CONFIG[mg].label] = bar.value;
      });
    });
    return Object.entries(barsByPeriod).map(([period, values]) => ({ period, ...values }));
  }, [sessions, metric, weeksBack, activeGroups, allExercises]);

  if (activeGroups.length === 0) {
    return <EmptyState text="Completa sesiones para ver estadísticas por grupo muscular." />;
  }

  const color = MG_CONFIG[selectedMG]?.color ?? C.primary;

  return (
    <div className="space-y-4">
      {/* Group chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none px-4">
        {activeGroups.map((mg) => (
          <button
            key={mg}
            type="button"
            onClick={() => setSelectedMG(mg)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              mg === selectedMG
                ? 'border-transparent text-primary-foreground'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
            }`}
            style={mg === selectedMG ? { backgroundColor: color, borderColor: color } : {}}
          >
            {MG_CONFIG[mg].label}
          </button>
        ))}
      </div>

      <MetricSelector value={metric} onChange={onMetricChange} />

      <div className="px-4">
        <BarOrLineChart data={chartData} metric={metric} color={color} />
      </div>

      {/* Multi-group stacked comparison */}
      {activeGroups.length > 1 && compareData.length > 0 && (
        <div className="px-4 space-y-2">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
            Comparación por grupo
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={compareData}
              margin={{ top: 4, right: 4, left: -18, bottom: 0 }}
              barSize={Math.max(4, Math.floor(280 / compareData.length) - 2)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis
                dataKey="period"
                tick={{ fill: C.muted, fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: C.muted, fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                }
              />
              <Tooltip content={makeMultiTooltip(METRIC_UNITS[metric])} />
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: 10, paddingTop: 8, color: C.muted }}
              />
              {activeGroups.map((mg) => (
                <Bar
                  key={mg}
                  dataKey={MG_CONFIG[mg].label}
                  stackId="mg"
                  fill={MG_CONFIG[mg].color}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ── Tab: PPL ──────────────────────────────────────────────────────────────────

function PPLTab({
  sessions,
  metric,
  onMetricChange,
  weeksBack,
}: {
  sessions: Parameters<typeof getChartData>[0];
  metric: MetricType;
  onMetricChange: (m: MetricType) => void;
  weeksBack: number;
}) {
  const { getAllExercises } = useExerciseStore();
  const allExercises = getAllExercises();
  const [selectedPPL, setSelectedPPL] = useState<PPLKey>('push');

  const pplCodes = useMemo(
    () =>
      allExercises
        .filter((e) => PPL_CONFIG[selectedPPL].muscleGroups.includes(e.muscleGroup))
        .map((e) => e.code),
    [allExercises, selectedPPL],
  );

  const chartData = useMemo(
    () => getChartData(sessions, metric, weeksBack, pplCodes),
    [sessions, metric, weeksBack, pplCodes],
  );

  // Comparison: push vs pull vs legs
  const compareData = useMemo(() => {
    const results: Record<string, { Push: number; Pull: number; Piernas: number }> = {};

    (Object.entries(PPL_CONFIG) as [PPLKey, typeof PPL_CONFIG[PPLKey]][]).forEach(
      ([_key, cfg]) => {
        const codes = allExercises
          .filter((e) => cfg.muscleGroups.includes(e.muscleGroup))
          .map((e) => e.code);
        getChartData(sessions, metric, weeksBack, codes).forEach((bar) => {
          if (!results[bar.period]) results[bar.period] = { Push: 0, Pull: 0, Piernas: 0 };
          const mapKey = cfg.label as 'Push' | 'Pull' | 'Piernas';
          results[bar.period][mapKey] = bar.value;
        });
      },
    );

    return Object.entries(results).map(([period, vals]) => ({ period, ...vals }));
  }, [sessions, metric, weeksBack, allExercises]);

  const hasAnyData = compareData.some(
    (d) => (d as any).Push > 0 || (d as any).Pull > 0 || (d as any).Piernas > 0,
  );

  if (!hasAnyData) {
    return <EmptyState text="Completa sesiones para ver la distribución Push / Pull / Piernas." />;
  }

  return (
    <div className="space-y-4">
      {/* PPL selector */}
      <div className="flex gap-2 px-4">
        {(Object.entries(PPL_CONFIG) as [PPLKey, typeof PPL_CONFIG[PPLKey]][]).map(
          ([key, cfg]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedPPL(key)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                key === selectedPPL
                  ? 'text-white border-transparent'
                  : 'text-muted-foreground border-border hover:border-primary/40'
              }`}
              style={key === selectedPPL ? { backgroundColor: cfg.color, borderColor: cfg.color } : {}}
            >
              {cfg.label}
            </button>
          ),
        )}
      </div>

      <MetricSelector value={metric} onChange={onMetricChange} />

      <div className="px-4">
        <BarOrLineChart
          data={chartData}
          metric={metric}
          color={PPL_CONFIG[selectedPPL].color}
        />
      </div>

      {/* Push vs Pull vs Legs comparison */}
      {compareData.length > 0 && (
        <div className="px-4 space-y-2">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
            Comparación Push · Pull · Piernas
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={compareData}
              margin={{ top: 4, right: 4, left: -18, bottom: 0 }}
              barSize={Math.max(6, Math.floor(280 / compareData.length / 3) - 2)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis
                dataKey="period"
                tick={{ fill: C.muted, fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: C.muted, fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                }
              />
              <Tooltip content={makeMultiTooltip(METRIC_UNITS[metric])} />
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: 10, paddingTop: 8, color: C.muted }}
              />
              <Bar dataKey="Push"     fill={C.primary}   radius={[2, 2, 0, 0]} />
              <Bar dataKey="Pull"     fill={C.secondary} radius={[2, 2, 0, 0]} />
              <Bar dataKey="Piernas"  fill={C.success}   radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ── Tab: Cardio ───────────────────────────────────────────────────────────────

function CardioTab({
  sessions,
  weeksBack,
}: {
  sessions: Session[];
  weeksBack: number;
}) {
  const cardioSessions = useMemo(
    () => sessions.filter((s) => (s.cardioEntries?.length ?? 0) > 0),
    [sessions],
  );

  const allTypes = useMemo(() => {
    const types = new Set<CardioType>();
    cardioSessions.forEach((s) => s.cardioEntries?.forEach((e) => types.add(e.type)));
    return [...types];
  }, [cardioSessions]);

  const [selectedType, setSelectedType] = useState<CardioType | 'all'>('all');

  const totalMinutes = useMemo(
    () =>
      cardioSessions.reduce(
        (sum, s) => sum + (s.cardioEntries ?? []).reduce((m, e) => m + e.durationMinutes, 0),
        0,
      ),
    [cardioSessions],
  );
  const totalCalories = useMemo(
    () => cardioSessions.reduce((sum, s) => sum + getSessionCalories(s), 0),
    [cardioSessions],
  );
  const totalKm = useMemo(
    () =>
      cardioSessions.reduce(
        (sum, s) => sum + (s.cardioEntries ?? []).reduce((m, e) => m + (e.distanceKm ?? 0), 0),
        0,
      ),
    [cardioSessions],
  );

  const weeklyData = useMemo(
    () => getCardioWeeklyData(cardioSessions, weeksBack),
    [cardioSessions, weeksBack],
  );

  const filteredSessions = useMemo(() => {
    const base =
      selectedType === 'all'
        ? cardioSessions
        : cardioSessions.filter((s) => s.cardioEntries?.some((e) => e.type === selectedType));
    return [...base].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [cardioSessions, selectedType]);

  if (cardioSessions.length === 0) {
    return <EmptyState text="Completa sesiones de cardio para ver las estadísticas." />;
  }

  const hasChartData = weeklyData.some((d) => d.minutes > 0);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="px-4 grid grid-cols-2 gap-2.5">
        <StatCard
          label="Sesiones cardio"
          value={String(cardioSessions.length)}
          sub="completadas"
        />
        <StatCard
          label="Tiempo total"
          value={
            totalMinutes >= 60
              ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
              : `${totalMinutes} min`
          }
          sub="acumulado"
        />
        {totalCalories > 0 && (
          <StatCard
            label="Calorías quemadas"
            value={`${totalCalories.toLocaleString()} kcal`}
            sub="total registrado"
          />
        )}
        {totalKm > 0.01 && (
          <StatCard
            label="Distancia total"
            value={`${totalKm.toFixed(1)} km`}
            sub="acumulada"
          />
        )}
      </div>

      {/* Weekly chart */}
      {hasChartData && (
        <div className="px-4 space-y-2">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
            Minutos por semana
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={weeklyData}
              margin={{ top: 4, right: 4, left: -18, bottom: 0 }}
              barSize={Math.max(6, Math.floor(300 / weeklyData.length) - 4)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis
                dataKey="period"
                tick={{ fill: C.muted, fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: C.muted, fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={makeTooltip('min')} />
              <Bar dataKey="minutes" fill={C.secondary} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Type filter chips */}
      {allTypes.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none px-4">
          <button
            type="button"
            onClick={() => setSelectedType('all')}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              selectedType === 'all'
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'border-border text-muted-foreground hover:border-blue-400/50 hover:text-foreground'
            }`}
          >
            Todos
          </button>
          {allTypes.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedType(t)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                selectedType === t
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'border-border text-muted-foreground hover:border-blue-400/50 hover:text-foreground'
              }`}
            >
              {CARDIO_LABELS[t]}
            </button>
          ))}
        </div>
      )}

      {/* Session history */}
      <div className="px-4 space-y-2">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
          Historial
        </p>
        <div className="space-y-1.5">
          {filteredSessions.map((s) => {
            const entries = s.cardioEntries ?? [];
            const mins = entries.reduce((m, e) => m + e.durationMinutes, 0);
            const km = entries.reduce((m, e) => m + (e.distanceKm ?? 0), 0);
            const kcal = getSessionCalories(s);
            const types = [...new Set(entries.map((e) => CARDIO_LABELS[e.type]))];
            const meta = [
              km > 0 ? `${km.toFixed(1)} km` : null,
              kcal > 0 ? `${kcal.toLocaleString()} kcal` : null,
            ]
              .filter(Boolean)
              .join(' · ');

            return (
              <div
                key={s.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-card border border-border"
              >
                <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{types.join(' + ')}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(s.date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: '2-digit',
                    })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold font-mono text-blue-400">{mins} min</p>
                  {meta && (
                    <p className="text-[10px] text-muted-foreground">{meta}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Admin user picker ─────────────────────────────────────────────────────────

const ALL_USERS_KEY = '__all__';

function AdminUserPicker({
  users,
  viewingId,
  onChange,
}: {
  users: AppUser[];
  viewingId: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected =
    viewingId === ALL_USERS_KEY
      ? null
      : users.find((u) => u.id === viewingId) ?? null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors text-sm"
      >
        {selected ? (
          <>
            <UserAvatar user={selected} size="sm" />
            <span className="font-medium max-w-[80px] truncate">{selected.profile.name}</span>
          </>
        ) : (
          <span className="text-muted-foreground font-medium">Todos</span>
        )}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-20 bg-popover border border-border rounded-xl shadow-xl overflow-hidden min-w-[160px]">
            <button
              type="button"
              onClick={() => { onChange(ALL_USERS_KEY); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors ${
                viewingId === ALL_USERS_KEY ? 'text-primary font-semibold' : 'text-foreground'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground font-bold shrink-0">
                ∑
              </div>
              Todos
            </button>
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => { onChange(u.id); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors ${
                  viewingId === u.id ? 'text-primary font-semibold' : 'text-foreground'
                }`}
              >
                <UserAvatar user={u} size="sm" />
                <div className="text-left min-w-0">
                  <p className="truncate">{u.profile.name || 'Sin nombre'}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{u.role}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const { getSessionsByUser, getAllSessions, getUserSessions } = useSessionStore();
  const activeUserId = useUsersStore((s) => s.activeUserId);
  const isAdmin = useUsersStore((s) => s.getActiveUser()?.role === 'admin');
  const activeUser = useUsersStore((s) => s.getActiveUser());
  const allUsers = useUsersStore((s) => s.users);

  // Admin can pick whose progress to view; default = own data
  const [viewingId, setViewingId] = useState<string>(activeUserId ?? ALL_USERS_KEY);

  const sessions = useMemo(() => {
    if (!isAdmin) return getUserSessions(activeUserId ?? '', false);
    if (viewingId === ALL_USERS_KEY) return getAllSessions();
    return getSessionsByUser(viewingId);
  }, [isAdmin, viewingId, activeUserId, getSessionsByUser, getAllSessions, getUserSessions]);

  const viewingUser = useMemo(
    () => (viewingId === ALL_USERS_KEY ? null : allUsers.find((u) => u.id === viewingId) ?? null),
    [viewingId, allUsers],
  );

  const [timeRangeKey, setTimeRangeKey] = useState('8w');
  const [metric, setMetric] = useState<MetricType>('volume');

  const weeksBack = TIME_RANGES.find((r) => r.key === timeRangeKey)?.weeks ?? 8;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-primary" />
          <h1 className="font-bold text-base">Progreso</h1>
        </div>

        {isAdmin ? (
          <AdminUserPicker
            users={allUsers}
            viewingId={viewingId}
            onChange={setViewingId}
          />
        ) : (
          activeUser && (
            <div className="flex items-center gap-2">
              <UserAvatar user={activeUser} size="sm" />
              <span className="text-xs text-muted-foreground hidden sm:block">
                {activeUser.profile.name}
              </span>
            </div>
          )
        )}
      </div>

      {/* Admin: who we're viewing */}
      {isAdmin && viewingUser && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-primary/5 border-b border-primary/20">
          <UserAvatar user={viewingUser} size="sm" />
          <div>
            <p className="text-xs font-semibold leading-none">{viewingUser.profile.name}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">
              {viewingUser.profile.level} · {viewingUser.profile.primaryObjective}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] text-muted-foreground">
              {sessions.length} sesiones registradas
            </p>
          </div>
        </div>
      )}

      {isAdmin && viewingId === ALL_USERS_KEY && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/30 border-b border-border">
          <div className="flex -space-x-1.5">
            {allUsers.slice(0, 5).map((u) => (
              <UserAvatar key={u.id} user={u} size="sm" className="ring-2 ring-background" />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Vista global · {allUsers.length} usuarios · {sessions.length} sesiones
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="resumen" className="flex flex-col h-full">
          {/* Time range */}
          <div className="pt-3 pb-1 border-b border-border">
            <TimeRangeSelector value={timeRangeKey} onChange={setTimeRangeKey} />
          </div>

          {/* Tab bar */}
          <div className="px-4 pt-3">
            <TabsList className="grid grid-cols-5 w-full h-8">
              <TabsTrigger value="resumen"   className="text-[10px]">Total</TabsTrigger>
              <TabsTrigger value="ejercicio" className="text-[10px]">Ejercicio</TabsTrigger>
              <TabsTrigger value="muscular"  className="text-[10px]">Muscular</TabsTrigger>
              <TabsTrigger value="ppl"       className="text-[10px]">PPL</TabsTrigger>
              <TabsTrigger value="cardio"    className="text-[10px]">Cardio</TabsTrigger>
            </TabsList>
          </div>

          {/* Tab contents */}
          <TabsContent value="resumen" className="pt-4 pb-8 space-y-4">
            <ResumenTab
              sessions={sessions}
              metric={metric}
              onMetricChange={setMetric}
              weeksBack={weeksBack}
            />
          </TabsContent>

          <TabsContent value="ejercicio" className="pt-4 pb-8">
            <EjercicioTab
              sessions={sessions}
              metric={metric}
              onMetricChange={setMetric}
              weeksBack={weeksBack}
            />
          </TabsContent>

          <TabsContent value="muscular" className="pt-4 pb-8">
            <MuscularTab
              sessions={sessions}
              metric={metric}
              onMetricChange={setMetric}
              weeksBack={weeksBack}
            />
          </TabsContent>

          <TabsContent value="ppl" className="pt-4 pb-8">
            <PPLTab
              sessions={sessions}
              metric={metric}
              onMetricChange={setMetric}
              weeksBack={weeksBack}
            />
          </TabsContent>

          <TabsContent value="cardio" className="pt-4 pb-8">
            <CardioTab sessions={sessions} weeksBack={weeksBack} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
