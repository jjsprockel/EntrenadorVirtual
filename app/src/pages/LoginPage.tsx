import { useState } from 'react';
import { Dumbbell, HardDrive, Plus, RotateCcw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UserAvatar from '@/components/admin/UserAvatar';
import { useUsersStore } from '@/stores/usersStore';
import { defaultProfile, useUserStore } from '@/stores/userStore';
import { clearAllData } from '@/lib/db';
import type { Level, Objective } from '@/types/routine';

// Open access: anyone can create a local profile and train with it.
// Nothing leaves the device — profiles and data live in IndexedDB only.

const LEVELS: { value: Level; label: string }[] = [
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' },
];

const OBJECTIVES: { value: Objective; label: string }[] = [
  { value: 'hipertrofia', label: 'Hipertrofia' },
  { value: 'fuerza', label: 'Fuerza' },
  { value: 'mixto', label: 'Mixto' },
  { value: 'resistencia', label: 'Resistencia' },
];

function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            value === o.value
              ? 'bg-primary/15 border-primary text-primary'
              : 'border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function NewProfileForm({ onCancel, isFirst }: { onCancel?: () => void; isFirst: boolean }) {
  const createProfile = useUsersStore((s) => s.createProfile);
  // Pre-multiuser installs kept a single profile here; reuse it for the first profile only
  const storedLegacy = useUserStore((s) => s.profile);
  const legacyProfile = isFirst ? storedLegacy : defaultProfile;

  const [name, setName] = useState(legacyProfile.name ?? '');
  const [level, setLevel] = useState<Level>(legacyProfile.level ?? 'principiante');
  const [objective, setObjective] = useState<Objective>(legacyProfile.primaryObjective ?? 'hipertrofia');
  const [units, setUnits] = useState<'kg' | 'lb'>(legacyProfile.units ?? 'kg');
  const [error, setError] = useState('');

  function handleCreate() {
    if (!name.trim()) {
      setError('Escribe tu nombre para continuar.');
      return;
    }
    createProfile({
      ...defaultProfile,
      ...legacyProfile,
      name: name.trim(),
      level,
      primaryObjective: objective,
      units,
    });
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); handleCreate(); }}
      className="space-y-4 rounded-xl border border-border bg-card p-4"
    >
      <div className="flex items-center gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Volver"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <p className="text-sm font-semibold">Crear perfil</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          placeholder="¿Cómo te llamas?"
          autoComplete="given-name"
          className="h-11"
          autoFocus
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Nivel</Label>
        <Chips options={LEVELS} value={level} onChange={setLevel} />
      </div>

      <div className="space-y-1.5">
        <Label>Objetivo</Label>
        <Chips options={OBJECTIVES} value={objective} onChange={setObjective} />
      </div>

      <div className="space-y-1.5">
        <Label>Unidad de peso</Label>
        <Chips
          options={[{ value: 'kg', label: 'Kilogramos (kg)' }, { value: 'lb', label: 'Libras (lb)' }]}
          value={units}
          onChange={setUnits}
        />
      </div>

      {/* Base UI Button forces type="button" — onClick handles click; form onSubmit handles Enter */}
      <Button className="w-full h-11 text-base font-semibold" onClick={handleCreate}>
        Empezar a entrenar
      </Button>
    </form>
  );
}

export default function LoginPage() {
  const users = useUsersStore((s) => s.users);
  const setSession = useUsersStore((s) => s.setSession);
  const [creating, setCreating] = useState(false);

  const showForm = creating || users.length === 0;

  async function handleReset() {
    if (!window.confirm('Se borrarán todos los perfiles y datos guardados en este dispositivo. ¿Continuar?')) return;
    await clearAllData();
    // idbStorage mirrors every key to localStorage as a backup; clear it too
    try { localStorage.clear(); } catch { /* ignore */ }
    window.location.reload();
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Dumbbell className="h-7 w-7 text-primary" strokeWidth={2} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">EntrenadorVirtual</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {users.length === 0 ? 'Crea tu perfil para empezar' : '¿Quién entrena hoy?'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border text-[10px] font-medium text-muted-foreground">
            <HardDrive className="h-3 w-3" />
            Tus datos se guardan solo en este dispositivo
          </div>
        </div>

        {showForm ? (
          <NewProfileForm
            isFirst={users.length === 0}
            onCancel={users.length > 0 ? () => setCreating(false) : undefined}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setSession(u.id)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-muted/30 transition-all"
              >
                <UserAvatar user={u} size="lg" />
                <p className="text-sm font-semibold leading-tight truncate max-w-full">
                  {u.profile.name || 'Sin nombre'}
                </p>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
            >
              <span className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Plus className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium">Nuevo perfil</span>
            </button>
          </div>
        )}

        {users.length > 0 && (
          <p className="text-center">
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] text-muted-foreground hover:text-destructive underline underline-offset-2 transition-colors inline-flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Borrar datos de este dispositivo
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
