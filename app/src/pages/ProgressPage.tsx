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
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Trophy, BarChart2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useSessionStore } from '@/stores/sessionStore';
import { useExerciseStore } from '@/stores/exerciseStore';
import {
  getWeeklyVolume,
  getExerciseProgress,
  getPersonalRecords,
  getSummaryStats,
  getLoggedExerciseCodes,
} from '@/lib/statsEngine';

// ── Chart theme constants ─────────────────────────────────────────────────────
// Hex approximations matching the CSS oklch values defined in index.css
const C = {
  primary:   '#FF6B35',  // oklch(0.66 0.21 35)  — orange
  secondary: '#3B82F6',  // oklch(0.6 0.2 265)   — blue
  success:   '#10B981',  // oklch(0.7 0.17 160)  — green
  muted:     '#737373',  // oklch(0.49 0 0)
  grid:      'rgba(255,255,255,0.07)',
  tooltip:   '#1c1c1c',
} as const;

// ── Custom tooltip factory ────────────────────────────────────────────────────
// Returns a render function accepted by recharts Tooltip `content` prop.
// Using `any` avoids the complex recharts generic type mismatch.
function makeTooltip(unit: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function TooltipContent(props: any) {
    if (!props.active || !props.payload?.length) return null;
    return (
      <div
        className="rounded-lg border border-border px-3 py-2 shadow-xl text-xs"
        style={{ background: C.tooltip }}
      >
        <p className="text-muted-foreground mb-1">{props.label}</p>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {props.payload.map((p: any) => (
          <p key={p.name} className="font-semibold" style={{ color: p.color }}>
            {typeof p.value === 'number' ? p.value.toLocaleString() : p.value} {unit}
          </p>
        ))}
      </div>
    );
  };
}

// ── Stat card ─────────────────────────────────────────────────────────────────
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
  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up'
      ? 'text-success'
      : trend === 'down'
      ? 'text-destructive'
      : 'text-muted-foreground';

  return (
    <div className="rounded-xl border border-border bg-card p-3 space-y-1">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
        {label}
      </p>
      <p className="text-xl font-bold font-mono tabular-nums leading-none">{value}</p>
      {sub && (
        <div className={`flex items-center gap-1 text-[10px] ${trendColor}`}>
          {trend && <TrendIcon className="h-3 w-3 shrink-0" />}
          <span>{sub}</span>
        </div>
      )}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <BarChart2 className="h-10 w-10 opacity-20" />
      <p className="text-sm text-center">{message}</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProgressPage() {
  const sessions = useSessionStore((s) => s.sessions);
  const { getByCode } = useExerciseStore();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const stats = useMemo(() => getSummaryStats(sessions), [sessions]);
  const weeklyVolume = useMemo(() => getWeeklyVolume(sessions), [sessions]);
  const prs = useMemo(() => getPersonalRecords(sessions), [sessions]);
  const loggedCodes = useMemo(() => getLoggedExerciseCodes(sessions), [sessions]);

  const activeCode = selectedCode ?? loggedCodes[0] ?? null;
  const exerciseProgress = useMemo(
    () => (activeCode ? getExerciseProgress(sessions, activeCode) : []),
    [sessions, activeCode],
  );

  const noData = stats.totalSessions === 0;

  const weekTrend: 'up' | 'down' | 'flat' =
    stats.weekVolume > stats.prevWeekVolume
      ? 'up'
      : stats.weekVolume < stats.prevWeekVolume
      ? 'down'
      : 'flat';

  const weekDiff =
    stats.prevWeekVolume > 0
      ? Math.round(
          ((stats.weekVolume - stats.prevWeekVolume) / stats.prevWeekVolume) * 100,
        )
      : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <h1 className="font-bold text-base">Progreso</h1>
        {!noData && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {stats.totalSessions} sesiones · {stats.totalVolume.toLocaleString()} kg acumulados
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {noData ? (
          <EmptyState message="Completa tu primera sesión para ver estadísticas aquí." />
        ) : (
          <Tabs defaultValue="resumen" className="flex flex-col h-full">
            <TabsList className="mx-4 mt-4 grid grid-cols-3 shrink-0">
              <TabsTrigger value="resumen">Resumen</TabsTrigger>
              <TabsTrigger value="ejercicios">Ejercicios</TabsTrigger>
              <TabsTrigger value="records">Récords</TabsTrigger>
            </TabsList>

            {/* ── Tab 1: Resumen ──────────────────────────────────────── */}
            <TabsContent value="resumen" className="flex-1 overflow-y-auto px-4 pb-6 space-y-5 mt-4">
              {/* Stat grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <StatCard
                  label="Sesiones totales"
                  value={stats.totalSessions.toString()}
                  sub={`${stats.uniqueExercises} ejercicios distintos`}
                />
                <StatCard
                  label="Volumen total"
                  value={`${(stats.totalVolume / 1000).toFixed(1)} t`}
                  sub={`Ø ${stats.avgSessionVolume.toLocaleString()} kg/sesión`}
                />
                <StatCard
                  label="Esta semana"
                  value={`${stats.weekVolume.toLocaleString()} kg`}
                  sub={
                    weekDiff !== null
                      ? `${weekDiff > 0 ? '+' : ''}${weekDiff}% vs semana anterior`
                      : 'Primera semana'
                  }
                  trend={weekTrend}
                />
                <StatCard
                  label="Semana anterior"
                  value={`${stats.prevWeekVolume.toLocaleString()} kg`}
                />
              </div>

              {/* Weekly volume chart */}
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mb-3">
                  Volumen semanal (últimas 8 semanas)
                </p>
                <div className="rounded-xl border border-border bg-card p-3">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={weeklyVolume}
                      margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid vertical={false} stroke={C.grid} />
                      <XAxis
                        dataKey="week"
                        tick={{ fill: C.muted, fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: C.muted, fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}t`}
                      />
                      <Tooltip
                        content={makeTooltip("kg")}
                        cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                      />
                      <Bar
                        dataKey="volume"
                        fill={C.primary}
                        radius={[4, 4, 0, 0]}
                        name="Volumen"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sessions per week */}
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mb-3">
                  Sesiones por semana
                </p>
                <div className="rounded-xl border border-border bg-card p-3">
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart
                      data={weeklyVolume}
                      margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid vertical={false} stroke={C.grid} />
                      <XAxis
                        dataKey="week"
                        tick={{ fill: C.muted, fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: C.muted, fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        content={makeTooltip("sesiones")}
                        cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                      />
                      <Bar
                        dataKey="sessions"
                        fill={C.secondary}
                        radius={[4, 4, 0, 0]}
                        name="Sesiones"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            {/* ── Tab 2: Ejercicios ───────────────────────────────────── */}
            <TabsContent value="ejercicios" className="flex-1 overflow-y-auto px-4 pb-6 space-y-4 mt-4">
              {loggedCodes.length === 0 ? (
                <EmptyState message="Aún no hay ejercicios registrados." />
              ) : (
                <>
                  {/* Exercise selector chips */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4">
                    {loggedCodes.map((code) => {
                      const ex = getByCode(code);
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => setSelectedCode(code)}
                          className={`shrink-0 text-[11px] px-2.5 py-1.5 rounded-full border transition-colors ${
                            activeCode === code
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-border text-muted-foreground hover:border-primary/50'
                          }`}
                        >
                          <span className="font-mono mr-1">{code}</span>
                          {ex?.nameEs ?? code}
                        </button>
                      );
                    })}
                  </div>

                  {activeCode && (
                    <>
                      {exerciseProgress.length < 2 ? (
                        <EmptyState message="Se necesitan al menos 2 sesiones con este ejercicio para mostrar progresión." />
                      ) : (
                        <>
                          {/* Max weight progression */}
                          <div>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mb-3">
                              Peso máximo por sesión
                            </p>
                            <div className="rounded-xl border border-border bg-card p-3">
                              <ResponsiveContainer width="100%" height={200}>
                                <LineChart
                                  data={exerciseProgress}
                                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                                >
                                  <CartesianGrid stroke={C.grid} strokeDasharray="3 3" />
                                  <XAxis
                                    dataKey="date"
                                    tick={{ fill: C.muted, fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                  />
                                  <YAxis
                                    tick={{ fill: C.muted, fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => `${v}kg`}
                                    domain={['auto', 'auto']}
                                  />
                                  <Tooltip
                                    content={makeTooltip("kg")}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="maxWeight"
                                    stroke={C.primary}
                                    strokeWidth={2.5}
                                    dot={{ r: 4, fill: C.primary, strokeWidth: 0 }}
                                    activeDot={{ r: 6 }}
                                    name="Peso máximo"
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Volume per session */}
                          <div>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mb-3">
                              Volumen por sesión
                            </p>
                            <div className="rounded-xl border border-border bg-card p-3">
                              <ResponsiveContainer width="100%" height={160}>
                                <BarChart
                                  data={exerciseProgress}
                                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                                >
                                  <CartesianGrid vertical={false} stroke={C.grid} />
                                  <XAxis
                                    dataKey="date"
                                    tick={{ fill: C.muted, fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                  />
                                  <YAxis
                                    tick={{ fill: C.muted, fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                  />
                                  <Tooltip
                                    content={makeTooltip("kg")}
                                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                                  />
                                  <Bar
                                    dataKey="totalVolume"
                                    fill={C.secondary}
                                    radius={[4, 4, 0, 0]}
                                    name="Volumen"
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Session log */}
                          <div>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mb-2">
                              Historial
                            </p>
                            <div className="space-y-1.5">
                              {[...exerciseProgress].reverse().map((pt, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/30 border border-border/50"
                                >
                                  <p className="text-xs text-muted-foreground w-16 shrink-0">
                                    {pt.date}
                                  </p>
                                  <p className="flex-1 text-sm font-mono font-semibold">
                                    {pt.bestSet}
                                  </p>
                                  <p className="text-xs text-muted-foreground shrink-0">
                                    {pt.totalVolume.toLocaleString()} kg vol.
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </TabsContent>

            {/* ── Tab 3: Récords ──────────────────────────────────────── */}
            <TabsContent value="records" className="flex-1 overflow-y-auto px-4 pb-6 space-y-4 mt-4">
              {prs.length === 0 ? (
                <EmptyState message="Aún no hay récords registrados." />
              ) : (
                <>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
                    Mejor marca personal por ejercicio
                  </p>
                  <div className="space-y-2">
                    {prs.map((pr, i) => {
                      const exercise = getByCode(pr.exerciseCode);
                      return (
                        <div
                          key={pr.exerciseCode}
                          className="rounded-xl border border-border bg-card p-3.5 flex items-center gap-3"
                        >
                          {/* Rank */}
                          <div
                            className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              i === 0
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : i === 1
                                ? 'bg-slate-400/20 text-slate-300'
                                : i === 2
                                ? 'bg-orange-700/20 text-orange-400'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {i < 3 ? <Trophy className="h-3.5 w-3.5" /> : i + 1}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] text-primary shrink-0">
                                {pr.exerciseCode}
                              </span>
                              <span className="text-sm font-medium truncate">
                                {exercise?.nameEs ?? pr.exerciseCode}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {pr.date.toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>

                          {/* Weight + e1RM */}
                          <div className="shrink-0 text-right">
                            <p className="font-mono font-bold text-base tabular-nums">
                              {pr.maxWeight} kg
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              × {pr.repsAtMax} · 1RM ~{pr.e1rm} kg
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
