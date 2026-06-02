import { useState, useMemo } from 'react';
import { Search, X, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import MuscleGroupBadge, { MUSCLE_GROUP_LABELS } from '@/components/exercise/MuscleGroupBadge';
import { useExerciseStore } from '@/stores/exerciseStore';
import type { MuscleGroup } from '@/types/exercise';

const ALL_GROUPS = Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[];
const GROUP_ORDER: Record<MuscleGroup, number> = Object.fromEntries(
  ALL_GROUPS.map((g, i) => [g, i]),
) as Record<MuscleGroup, number>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (exerciseCode: string) => void;
  selectedCodes?: string[];
}

export default function ExercisePicker({ open, onClose, onSelect, selectedCodes = [] }: Props) {
  const { exercises } = useExerciseStore();
  const [query, setQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState<MuscleGroup | null>(null);

  const filtered = useMemo(() => {
    let result = exercises;
    if (filterGroup) {
      result = result.filter((e) => e.muscleGroup === filterGroup);
    } else {
      // Sort by canonical muscle group order so exercises from the same group
      // appear together regardless of the order they were parsed from the markdown.
      result = [...result].sort(
        (a, b) => GROUP_ORDER[a.muscleGroup] - GROUP_ORDER[b.muscleGroup] || a.code.localeCompare(b.code),
      );
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (e) =>
          e.nameEs.toLowerCase().includes(q) ||
          e.code.toLowerCase().includes(q) ||
          e.nameEn.some((n) => n.toLowerCase().includes(q)) ||
          MUSCLE_GROUP_LABELS[e.muscleGroup].toLowerCase().includes(q),
      );
    }
    return result;
  }, [exercises, query, filterGroup]);

  function handleSelect(code: string) {
    onSelect(code);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md w-full h-[80dvh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-2 border-b border-border shrink-0">
          <DialogTitle className="text-sm font-semibold">Seleccionar ejercicio</DialogTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Buscar…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-9 bg-muted/50"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {/* Group filter chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 pt-1 -mx-1 px-1">
            <button
              type="button"
              onClick={() => setFilterGroup(null)}
              className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                filterGroup === null
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-border text-muted-foreground'
              }`}
            >
              Todos
            </button>
            {ALL_GROUPS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setFilterGroup(filterGroup === g ? null : g)}
                className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                  filterGroup === g
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {MUSCLE_GROUP_LABELS[g]}
              </button>
            ))}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {filtered.map((exercise) => {
              const isSelected = selectedCodes.includes(exercise.code);
              return (
                <button
                  key={exercise.code}
                  type="button"
                  onClick={() => handleSelect(exercise.code)}
                  className={`flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                    isSelected
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted/60 text-foreground'
                  }`}
                >
                  <span className="font-mono text-[10px] text-muted-foreground w-10 shrink-0">
                    {exercise.code}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{exercise.nameEs}</p>
                  </div>
                  <MuscleGroupBadge group={exercise.muscleGroup} className="shrink-0" />
                  {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No se encontraron ejercicios
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
