import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CardioEntry, CardioType } from '@/types/session';
import { CARDIO_LABELS } from '@/types/session';

const CARDIO_TYPES: CardioType[] = [
  'caminadora',
  'eliptica',
  'bicicleta_estatica',
  'remo',
  'escaladora',
  'natacion',
  'otro',
];

interface Props {
  onAdd: (entry: CardioEntry) => void;
  onCancel: () => void;
}

export default function CardioEntryForm({ onAdd, onCancel }: Props) {
  const [type, setType] = useState<CardioType>('caminadora');
  const [minutes, setMinutes] = useState('30');
  const [distance, setDistance] = useState('');
  const [watts, setWatts] = useState('');
  const [calories, setCalories] = useState('');

  const minutesNum = parseInt(minutes, 10);
  const canAdd = !isNaN(minutesNum) && minutesNum >= 1;

  function handleAdd() {
    if (!canAdd) return;
    onAdd({
      id: crypto.randomUUID(),
      type,
      durationMinutes: minutesNum,
      distanceKm: distance ? parseFloat(distance) : undefined,
      watts: watts ? parseInt(watts, 10) : undefined,
      calories: calories ? parseInt(calories, 10) : undefined,
    });
  }

  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-4">
      {/* Tipo */}
      <div>
        <p className="text-[11px] text-muted-foreground font-semibold mb-2 uppercase tracking-wide">
          Tipo de ejercicio
        </p>
        <div className="flex flex-wrap gap-1.5">
          {CARDIO_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                type === t
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'border-border text-muted-foreground hover:border-blue-400/50 hover:text-foreground'
              }`}
            >
              {CARDIO_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Duración (requerida) */}
      <div className="space-y-1.5">
        <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">
          Duración <span className="text-blue-400 normal-case font-normal">(requerido)</span>
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="30"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="w-24 h-10 px-3 rounded-lg border border-border bg-background text-sm font-mono text-center focus:outline-none focus:border-blue-500 transition-colors"
          />
          <span className="text-sm text-muted-foreground">minutos</span>
        </div>
      </div>

      {/* Campos opcionales */}
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold leading-tight">
            Dist. (km)
          </p>
          <input
            type="number"
            inputMode="decimal"
            placeholder="—"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="w-full h-10 px-2 rounded-lg border border-border bg-background text-sm text-center font-mono focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold leading-tight">
            Vatios (W)
          </p>
          <input
            type="number"
            inputMode="numeric"
            placeholder="—"
            value={watts}
            onChange={(e) => setWatts(e.target.value)}
            className="w-full h-10 px-2 rounded-lg border border-border bg-background text-sm text-center font-mono focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold leading-tight">
            Calorías
          </p>
          <input
            type="number"
            inputMode="numeric"
            placeholder="—"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="w-full h-10 px-2 rounded-lg border border-border bg-background text-sm text-center font-mono focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 text-sm text-muted-foreground hover:text-foreground border border-border rounded-xl py-2.5 transition-colors"
        >
          Cancelar
        </button>
        <Button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className="flex-1 gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Añadir
        </Button>
      </div>
    </div>
  );
}
