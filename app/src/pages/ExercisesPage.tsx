import { useState, useMemo } from 'react';
import { Search, Plus, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ExerciseCard from '@/components/exercise/ExerciseCard';
import { MUSCLE_GROUP_LABELS } from '@/components/exercise/MuscleGroupBadge';
import { useExerciseStore } from '@/stores/exerciseStore';
import type { MuscleGroup, Level, Equipment } from '@/types/exercise';

const LEVELS: Level[] = ['principiante', 'intermedio', 'avanzado'];
const LEVEL_LABEL: Record<Level, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};
const EQUIPMENT_LABEL: Record<Equipment, string> = {
  barra: 'Barra',
  mancuernas: 'Mancuernas',
  maquina: 'Máquina',
  polea: 'Polea',
  peso_corporal: 'Peso corporal',
  kettlebell: 'Kettlebell',
  banco: 'Banco',
};
const ALL_GROUPS = Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[];
const ALL_EQUIPMENT = Object.keys(EQUIPMENT_LABEL) as Equipment[];

export default function ExercisesPage() {
  const { exercises, isLoaded } = useExerciseStore();

  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<MuscleGroup[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<Level[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([]);

  const activeFilterCount =
    selectedGroups.length + selectedLevels.length + selectedEquipment.length;

  function toggleFilter<T>(
    value: T,
    current: T[],
    setter: React.Dispatch<React.SetStateAction<T[]>>,
  ) {
    setter(current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  }

  const filtered = useMemo(() => {
    let result = exercises;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (e) =>
          e.nameEs.toLowerCase().includes(q) ||
          e.nameEn.some((n) => n.toLowerCase().includes(q)) ||
          e.code.toLowerCase().includes(q),
      );
    }
    if (selectedGroups.length)
      result = result.filter((e) => selectedGroups.includes(e.muscleGroup));
    if (selectedLevels.length)
      result = result.filter((e) => selectedLevels.includes(e.level));
    if (selectedEquipment.length)
      result = result.filter((e) => e.equipment.some((eq) => selectedEquipment.includes(eq)));
    return result;
  }, [exercises, query, selectedGroups, selectedLevels, selectedEquipment]);

  function clearFilters() {
    setSelectedGroups([]);
    setSelectedLevels([]);
    setSelectedEquipment([]);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ejercicio…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-muted/50 border-transparent focus:border-primary/50 h-10"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="icon"
            onClick={() => setShowFilters((v) => !v)}
            className={`h-10 w-10 shrink-0 relative ${showFilters ? 'bg-primary text-primary-foreground' : ''}`}
            aria-label="Filtros"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="space-y-3 pb-1">
            {/* Muscle groups */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Grupo muscular
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_GROUPS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleFilter(g, selectedGroups, setSelectedGroups)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      selectedGroups.includes(g)
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    {MUSCLE_GROUP_LABELS[g]}
                  </button>
                ))}
              </div>
            </div>

            {/* Level */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Nivel
              </p>
              <div className="flex gap-1.5">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => toggleFilter(l, selectedLevels, setSelectedLevels)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      selectedLevels.includes(l)
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    {LEVEL_LABEL[l]}
                  </button>
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Equipamiento
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_EQUIPMENT.map((eq) => (
                  <button
                    key={eq}
                    type="button"
                    onClick={() => toggleFilter(eq, selectedEquipment, setSelectedEquipment)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      selectedEquipment.includes(eq)
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    {EQUIPMENT_LABEL[eq]}
                  </button>
                ))}
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-primary hover:underline"
              >
                Limpiar filtros ({activeFilterCount})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="px-4 py-2 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {isLoaded ? `${filtered.length} ejercicio${filtered.length !== 1 ? 's' : ''}` : ''}
        </p>
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-primary">
          <Plus className="h-3.5 w-3.5" />
          Crear ejercicio
        </Button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {!isLoaded ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-border">
                <Skeleton className="aspect-video w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <Search className="h-10 w-10 opacity-20" />
            <p className="text-sm">No se encontraron ejercicios</p>
            {activeFilterCount > 0 && (
              <button type="button" onClick={clearFilters} className="text-xs text-primary hover:underline">
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((exercise) => (
              <ExerciseCard key={exercise.code} exercise={exercise} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
