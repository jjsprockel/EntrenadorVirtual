import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Zap, Edit, Trash2, Calendar, Dumbbell, ChevronDown, Sparkles, Save, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRoutineStore } from '@/stores/routineStore';
import { useUsersStore } from '@/stores/usersStore';
import { SUGGESTED_ROUTINES } from '@/lib/suggestedRoutines';
import type { SuggestedRoutine } from '@/lib/suggestedRoutines';
import DayEditor from '@/components/routine/DayEditor';
import type { Routine, RoutineDay } from '@/types/routine';

const OBJECTIVE_LABELS: Record<Routine['objective'], string> = {
  hipertrofia: 'Hipertrofia',
  fuerza: 'Fuerza',
  mixto: 'Mixto',
  resistencia: 'Resistencia',
};
const OBJECTIVE_COLOR: Record<Routine['objective'], string> = {
  hipertrofia: 'text-blue-400',
  fuerza: 'text-orange-400',
  mixto: 'text-purple-400',
  resistencia: 'text-green-400',
};
const STRUCTURE_LABELS: Record<Routine['structure'], string> = {
  fullbody: 'Fullbody',
  torso_pierna: 'Torso / Pierna',
  ppl: 'PPL',
  weider: 'Weider',
  custom: 'Personalizada',
  ppl_3dias: 'PPL 3 días',
  antagonista_3dias: 'Antagonista 3 días',
};

function RoutineCard({ routine }: { routine: Routine }) {
  const navigate = useNavigate();
  const { deleteRoutine, setActiveRoutine, activeRoutineId, updateRoutine } = useRoutineStore();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isActive = routine.id === activeRoutineId;

  function updateDay(index: number, updated: RoutineDay) {
    const days = routine.days.map((d, i) => (i === index ? updated : d));
    updateRoutine(routine.id, { days });
  }

  return (
    <>
      <div
        className={`relative rounded-xl border bg-card p-4 space-y-3 transition-all ${
          isActive ? 'border-primary shadow-lg shadow-primary/10' : 'border-border'
        }`}
      >
        {/* Active badge */}
        {isActive && (
          <div className="absolute -top-2.5 left-4 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Zap className="h-2.5 w-2.5" />
            ACTIVA
          </div>
        )}

        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base leading-tight">{routine.name}</p>
            <p className={`text-xs font-medium mt-0.5 ${OBJECTIVE_COLOR[routine.objective]}`}>
              {OBJECTIVE_LABELS[routine.objective]}
            </p>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {routine.daysPerWeek} días/sem
          </span>
          <span className="flex items-center gap-1">
            <Dumbbell className="h-3.5 w-3.5" />
            {STRUCTURE_LABELS[routine.structure]}
          </span>
          <span>
            {routine.durationWeeks > 0 ? `${routine.durationWeeks} sem` : 'Indefinida'}
          </span>
        </div>

        {/* Days preview */}
        <div className="flex flex-wrap gap-1.5">
          {routine.days.map((d) => (
            <span
              key={d.id}
              className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-md"
            >
              {d.dayName}
            </span>
          ))}
        </div>

        {/* Expand + edit days */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
          {expanded ? 'Ocultar y editar días' : `Ver y editar ${routine.days.length} días`}
        </button>

        {expanded && (
          <div className="space-y-2">
            {routine.days.map((d, i) => (
              <DayEditor key={d.id} day={d} onChange={(updated) => updateDay(i, updated)} />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!isActive && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs gap-1.5"
              onClick={() => setActiveRoutine(routine.id)}
            >
              <Zap className="h-3.5 w-3.5" />
              Activar
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className={`${isActive ? 'flex-1' : ''} h-8 text-xs gap-1.5`}
            onClick={() => navigate(`/rutinas/${routine.id}/editar`)}
          >
            <Edit className="h-3.5 w-3.5" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => setConfirmDelete(true)}
            aria-label="Eliminar rutina"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar rutina?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borrará "{routine.name}" y todos sus días configurados. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRoutine(routine.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function SaveSuggestedDialog({
  open,
  onClose,
  suggested,
  modified,
  activate,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  suggested: SuggestedRoutine;
  modified: boolean;
  /** Pre-selects "activar" (opened from the Activar button) */
  activate: boolean;
  onSave: (name: string, activate: boolean) => void;
}) {
  const activeUserId = useUsersStore((s) => s.activeUserId);
  const isAdmin = useUsersStore((s) => s.getActiveUser()?.role === 'admin');
  const routines = useRoutineStore((s) => s.routines);
  const getUserRoutines = useRoutineStore((s) => s.getUserRoutines);
  const [name, setName] = useState(modified ? `${suggested.name} (personalizada)` : suggested.name);
  const [andActivate, setAndActivate] = useState(activate);

  const taken = useMemo(
    () => new Set(getUserRoutines(activeUserId ?? '', isAdmin ?? false).map((r) => r.name.trim().toLowerCase())),
    [getUserRoutines, activeUserId, isAdmin, routines], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const trimmed = name.trim();
  const error = !trimmed
    ? 'Escribe un nombre para la rutina.'
    : taken.has(trimmed.toLowerCase())
    ? 'Ya tienes una rutina con ese nombre.'
    : '';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>Guardar en mis rutinas</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => { e.preventDefault(); if (!error) onSave(trimmed, andActivate); }}
          className="space-y-4"
        >
          <p className="text-xs text-muted-foreground">
            Basada en <strong>{suggested.name}</strong>
            {modified ? ', con los cambios que hiciste.' : '.'} La rutina sugerida original no
            cambia.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="routine-name">Nombre</Label>
            <Input
              id="routine-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
              autoFocus
              aria-invalid={!!error}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>Activarla ahora</span>
            <Switch checked={andActivate} onCheckedChange={setAndActivate} />
          </label>
          {/* Base UI Button forces type="button" — onClick handles click; form onSubmit handles Enter */}
          <Button
            className="w-full h-11 gap-2"
            disabled={!!error}
            onClick={() => onSave(trimmed, andActivate)}
          >
            {andActivate ? <Zap className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {andActivate ? 'Guardar y activar' : 'Guardar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SuggestedRoutineCard({ suggested }: { suggested: SuggestedRoutine }) {
  const { addRoutine, setActiveRoutine } = useRoutineStore();
  const activeUserId = useUsersStore((s) => s.activeUserId);
  const [expanded, setExpanded] = useState(false);
  // undefined = closed; otherwise whether "activar" starts selected
  const [saveDialog, setSaveDialog] = useState<{ activate: boolean } | undefined>(undefined);
  const [days, setDays] = useState<RoutineDay[]>(() => suggested.days());
  const [modified, setModified] = useState(false);
  const [savedAs, setSavedAs] = useState<string | null>(null);

  function updateDay(index: number, updated: RoutineDay) {
    setDays((prev) => prev.map((d, i) => (i === index ? updated : d)));
    setModified(true);
  }

  function resetDays() {
    setDays(suggested.days());
    setModified(false);
  }

  function handleSave(name: string, activate: boolean) {
    const routine: Routine = {
      id: crypto.randomUUID(),
      userId: activeUserId ?? undefined,
      name,
      objective: suggested.objective,
      level: suggested.level,
      structure: 'custom',
      daysPerWeek: suggested.daysPerWeek,
      durationWeeks: suggested.durationWeeks,
      days,
      periodization: { type: 'ninguna' },
      active: activate,
      createdAt: new Date(),
      startedAt: activate ? new Date() : undefined,
    };
    addRoutine(routine);
    if (activate) setActiveRoutine(routine.id);
    setSaveDialog(undefined);
    // The suggestion goes back to its original form, ready to be reused
    resetDays();
    setExpanded(false);
    setSavedAs(name);
    setTimeout(() => setSavedAs(null), 4000);
  }

  return (
    <>
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base leading-tight flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              {suggested.name}
              {modified && (
                <span className="text-[10px] font-semibold bg-amber-500/15 text-amber-500 px-1.5 py-0.5 rounded-md">
                  Modificada
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{suggested.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {suggested.daysPerWeek} días/sem
          </span>
          <span className="capitalize">{suggested.level}</span>
          <span className="capitalize">{suggested.objective}</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
            {expanded ? 'Ocultar y editar días' : `Ver y editar ${days.length} días`}
          </button>
          {modified && (
            <button
              type="button"
              onClick={resetDays}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Deshacer cambios
            </button>
          )}
        </div>

        {expanded && (
          <div className="space-y-2">
            {days.map((d, i) => (
              <DayEditor key={d.id} day={d} onChange={(updated) => updateDay(i, updated)} />
            ))}
          </div>
        )}

        {savedAs && (
          <p className="text-xs text-success flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5" />
            Guardada en Mis rutinas como "{savedAs}"
          </p>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs gap-1.5"
            onClick={() => setSaveDialog({ activate: false })}
          >
            <Save className="h-3.5 w-3.5" />
            Guardar como…
          </Button>
          <Button
            size="sm"
            className="flex-1 h-9 text-xs gap-1.5"
            onClick={() => setSaveDialog({ activate: true })}
          >
            <Zap className="h-3.5 w-3.5" />
            Activar rutina
          </Button>
        </div>
      </div>

      {saveDialog && (
        <SaveSuggestedDialog
          open
          onClose={() => setSaveDialog(undefined)}
          suggested={suggested}
          modified={modified}
          activate={saveDialog.activate}
          onSave={handleSave}
        />
      )}
    </>
  );
}

export default function RoutinesPage() {
  const navigate = useNavigate();
  const { getUserRoutines } = useRoutineStore();
  const activeUserId = useUsersStore((s) => s.activeUserId);
  const isAdmin = useUsersStore((s) => s.getActiveUser()?.role === 'admin');
  const routines = getUserRoutines(activeUserId ?? '', isAdmin ?? false);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-base">Rutinas</h1>
        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={() => navigate('/rutinas/nueva')}
        >
          <Plus className="h-3.5 w-3.5" />
          Nueva
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* User's own routines */}
        <div className="space-y-2.5">
          {routines.length > 0 && (
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
              Mis rutinas
            </p>
          )}
          {routines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-muted-foreground">
              <Dumbbell className="h-12 w-12 opacity-20" />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">No tienes rutinas todavía</p>
                <p className="text-xs">Crea tu primera rutina o activa una sugerida</p>
              </div>
              <Button className="gap-2" onClick={() => navigate('/rutinas/nueva')}>
                <Plus className="h-4 w-4" />
                Crear rutina
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {routines.map((r) => <RoutineCard key={r.id} routine={r} />)}
            </div>
          )}
        </div>

        {/* Suggested routines library — always available, one-tap activation */}
        {SUGGESTED_ROUTINES.length > 0 && (
          <div className="space-y-2.5">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Rutinas sugeridas
            </p>
            <div className="space-y-3">
              {SUGGESTED_ROUTINES.map((s) => (
                <SuggestedRoutineCard key={s.id} suggested={s} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
