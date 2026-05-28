import { useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Download,
  Upload,
  Trash2,
  Save,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Shield,
  Users,
  Edit,
  UserPlus,
  FlaskConical,
  LogOut,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useUsersStore } from '@/stores/usersStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useRoutineStore } from '@/stores/routineStore';
import { exportAllData, importAllData, clearAllData } from '@/lib/db';
import { seedDemoData, isDemoDataLoaded } from '@/lib/seedData';
import UserAvatar from '@/components/admin/UserAvatar';
import UserFormModal from '@/components/admin/UserFormModal';
import UserSwitcherModal from '@/components/admin/UserSwitcherModal';
import type { Level } from '@/types/exercise';
import type { Objective } from '@/types/routine';
import type { AppUser } from '@/types/user';

// ── Schema ────────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  age: z.string().optional(),
  bodyWeightKg: z.string().optional(),
  level: z.enum(['principiante', 'intermedio', 'avanzado']),
  primaryObjective: z.enum(['hipertrofia', 'fuerza', 'mixto', 'resistencia']),
  units: z.enum(['kg', 'lb']),
  minWeightIncrement: z.number().min(0.5).max(10),
  preferRestTimer: z.boolean(),
  theme: z.enum(['dark', 'light', 'system']),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// ── Chip selector ─────────────────────────────────────────────────────────────

function ChipGroup<T extends string>({
  options,
  labels,
  value,
  onChange,
}: {
  options: T[];
  labels: Record<T, string>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
            value === opt
              ? 'bg-primary border-primary text-primary-foreground'
              : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
          }`}
        >
          {labels[opt]}
        </button>
      ))}
    </div>
  );
}

// ── 1RM Editor ────────────────────────────────────────────────────────────────

const MAIN_EXERCISES: { code: string; label: string }[] = [
  { code: 'Q-01', label: 'Sentadilla con barra' },
  { code: 'P-01', label: 'Press de banca' },
  { code: 'E-06', label: 'Peso muerto' },
  { code: 'H-01', label: 'Press militar' },
  { code: 'E-01', label: 'Dominadas (lastre)' },
  { code: 'I-03', label: 'Hip thrust' },
];

function OneRMEditor() {
  const activeUserId = useUsersStore((s) => s.activeUserId);
  const activeUser = useUsersStore((s) => s.getActiveUser());
  const { updateUserProfile } = useUsersStore();
  const [open, setOpen] = useState(false);

  const estimates = activeUser?.profile.oneRMEstimates ?? {};

  function handleChange(code: string, value: string) {
    if (!activeUserId) return;
    const num = parseFloat(value);
    const updated = { ...estimates };
    if (!value || isNaN(num)) {
      delete updated[code];
    } else {
      updated[code] = num;
    }
    updateUserProfile(activeUserId, { oneRMEstimates: updated });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Estimaciones de 1RM</span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="space-y-3 pt-1">
          <p className="text-xs text-muted-foreground">
            Ingresa tu máximo en 1 repetición (kg). Se usa para calcular cargas y sugerencias.
          </p>
          {MAIN_EXERCISES.map(({ code, label }) => (
            <div key={code} className="flex items-center gap-3">
              <Label className="flex-1 text-sm text-foreground/80">{label}</Label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={2.5}
                  value={estimates[code] ?? ''}
                  onChange={(e) => handleChange(code, e.target.value)}
                  placeholder="—"
                  className="w-20 text-right font-mono h-9 text-sm"
                />
                <span className="text-xs text-muted-foreground w-5">kg</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Data management ───────────────────────────────────────────────────────────

function DataManagement() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  async function handleExport() {
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `entrenador-virtual-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed', e);
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importAllData(data);
      setImportStatus('success');
      setTimeout(() => {
        setImportStatus('idle');
        window.location.reload();
      }, 1500);
    } catch {
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 3000);
    }
    e.target.value = '';
  }

  async function handleReset() {
    await clearAllData();
    window.location.reload();
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start gap-2 h-11"
        onClick={handleExport}
      >
        <Download className="h-4 w-4" />
        Exportar todos los datos (JSON)
      </Button>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-2 h-11"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          Importar backup (JSON)
        </Button>
        {importStatus === 'success' && (
          <p className="text-xs text-success mt-1.5">✓ Importación exitosa. Recargando…</p>
        )}
        {importStatus === 'error' && (
          <p className="text-xs text-destructive mt-1.5">✗ Archivo inválido.</p>
        )}
      </div>

      <AlertDialog>
        <AlertDialogTrigger className="flex w-full items-center justify-start gap-2 rounded-lg border border-destructive/50 bg-transparent px-4 text-sm font-medium text-destructive h-11 hover:bg-destructive/10 transition-colors">
          <Trash2 className="h-4 w-4" />
          Resetear la app
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Resetear la app?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borrarán todos tus datos: perfiles, rutinas, historial de sesiones y configuración.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, borrar todo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Admin: user list ──────────────────────────────────────────────────────────

function AdminUserList() {
  const { users, activeUserId, deleteUser } = useUsersStore();
  const [editUser, setEditUser] = useState<AppUser | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(isDemoDataLoaded);

  async function handleLoadDemo() {
    await seedDemoData();
    setDemoLoaded(true);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Gestión de usuarios</span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 text-xs"
          onClick={() => setShowAdd(true)}
        >
          <UserPlus className="h-3.5 w-3.5" />
          Agregar
        </Button>
      </div>

      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className={`flex items-center gap-3 p-3 rounded-xl border ${
              user.id === activeUserId ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'
            }`}
          >
            <UserAvatar user={user} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold truncate">
                  {user.profile.name || 'Sin nombre'}
                </p>
                {user.role === 'admin' && (
                  <Shield className="h-3 w-3 text-primary shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-muted-foreground capitalize">{user.role}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setEditUser(user)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                aria-label="Editar"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
              {user.role !== 'admin' && (
                <AlertDialog>
                  <AlertDialogTrigger
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Se eliminará a "{user.profile.name}" del sistema. Sus rutinas y sesiones no se borrarán automáticamente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteUser(user.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Demo data loader */}
      <div className="pt-1">
        <button
          type="button"
          disabled={demoLoaded}
          onClick={handleLoadDemo}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors ${
            demoLoaded
              ? 'border-border text-muted-foreground bg-muted/30 cursor-not-allowed'
              : 'border-dashed border-primary/50 text-primary hover:bg-primary/5'
          }`}
        >
          <FlaskConical className="h-4 w-4" />
          {demoLoaded ? 'Datos demo ya cargados' : 'Cargar 4 usuarios demo (3–6 meses de historial)'}
        </button>
        {!demoLoaded && (
          <p className="text-[10px] text-muted-foreground text-center mt-1">
            Carlos · María · Lucas · Sofía — datos simulados para demostración
          </p>
        )}
      </div>

      <UserFormModal open={showAdd} onClose={() => setShowAdd(false)} />
      {editUser && (
        <UserFormModal
          open={!!editUser}
          onClose={() => setEditUser(null)}
          editUser={editUser}
        />
      )}
    </div>
  );
}

// ── Change password ───────────────────────────────────────────────────────────

function ChangePassword() {
  const { sessionUserId, changePassword } = useUsersStore();
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'mismatch' | 'loading'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) { setStatus('mismatch'); return; }
    if (newPw.length < 6) { setStatus('error'); return; }
    setStatus('loading');
    const ok = await changePassword(sessionUserId!, curPw, newPw);
    if (ok) {
      setStatus('success');
      setCurPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-sm">Contraseña actual</Label>
        <div className="relative">
          <Input type={showCur ? 'text' : 'password'} value={curPw} onChange={e => setCurPw(e.target.value)} className="h-10 pr-10" placeholder="••••••••" />
          <button type="button" tabIndex={-1} onClick={() => setShowCur(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {showCur ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm">Nueva contraseña</Label>
        <div className="relative">
          <Input type={showNew ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} className="h-10 pr-10" placeholder="Mínimo 6 caracteres" />
          <button type="button" tabIndex={-1} onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {showNew ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm">Confirmar contraseña</Label>
        <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="h-10" placeholder="Repetir nueva contraseña" />
      </div>
      {status === 'mismatch' && <p className="text-xs text-destructive">Las contraseñas no coinciden.</p>}
      {status === 'error' && <p className="text-xs text-destructive">Contraseña actual incorrecta o nueva muy corta.</p>}
      {status === 'success' && <p className="text-xs text-green-500 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Contraseña actualizada.</p>}
      <Button type="submit" variant="outline" className="w-full h-10 gap-2" disabled={!curPw || !newPw || !confirmPw || status === 'loading'}>
        <KeyRound className="h-4 w-4" />
        {status === 'loading' ? 'Actualizando…' : 'Cambiar contraseña'}
      </Button>
    </form>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { activeUserId, getActiveUser, updateUserProfile, logout } = useUsersStore();
  const activeUser = getActiveUser();
  const profile = activeUser?.profile;

  const { getUserSessions } = useSessionStore();
  const { getUserRoutines } = useRoutineStore();
  const isAdmin = activeUser?.role === 'admin';
  const sessions = getUserSessions(activeUserId ?? '', isAdmin);
  const routines = getUserRoutines(activeUserId ?? '', isAdmin);

  const [saved, setSaved] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name ?? '',
      age: profile?.age != null ? String(profile.age) : '',
      bodyWeightKg: profile?.bodyWeightKg != null ? String(profile.bodyWeightKg) : '',
      level: profile?.level ?? 'principiante',
      primaryObjective: profile?.primaryObjective ?? 'hipertrofia',
      units: profile?.units ?? 'kg',
      minWeightIncrement: profile?.minWeightIncrement ?? 2.5,
      preferRestTimer: profile?.preferRestTimer ?? true,
      theme: profile?.theme ?? 'dark',
    },
  });

  function onSubmit(data: ProfileFormData) {
    if (!activeUserId) return;
    const age = data.age ? parseFloat(data.age) : undefined;
    const bodyWeightKg = data.bodyWeightKg ? parseFloat(data.bodyWeightKg) : undefined;
    updateUserProfile(activeUserId, {
      name: data.name,
      age: age && !isNaN(age) ? age : undefined,
      bodyWeightKg: bodyWeightKg && !isNaN(bodyWeightKg) ? bodyWeightKg : undefined,
      level: data.level as Level,
      primaryObjective: data.primaryObjective as Objective,
      units: data.units,
      minWeightIncrement: data.minWeightIncrement,
      preferRestTimer: data.preferRestTimer,
      theme: data.theme,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!activeUser || !profile) {
    return (
      <div className="flex items-center justify-center h-full p-6 text-muted-foreground text-sm">
        Cargando perfil…
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserAvatar user={activeUser} size="md" />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-base leading-tight">
                {profile.name || 'Mi perfil'}
              </h1>
              {isAdmin && <Shield className="h-3.5 w-3.5 text-primary" />}
            </div>
            <p className="text-[11px] text-muted-foreground capitalize">{activeUser.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:block">
            {sessions.length} ses · {routines.length} rut
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => setShowSwitcher(true)}
          >
            <Users className="h-3.5 w-3.5" />
            Cambiar
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
            onClick={logout}
            title="Cerrar sesión"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6">
        {/* ── Personal data ── */}
        <Section title="Datos personales">
          <FormField label="Nombre" error={errors.name?.message}>
            <Input
              {...register('name')}
              placeholder="Tu nombre"
              className="h-11"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Edad" error={errors.age?.message}>
              <Input
                {...register('age')}
                type="number"
                inputMode="numeric"
                placeholder="—"
                className="h-11 font-mono"
              />
            </FormField>
            <FormField label="Peso corporal (kg)" error={errors.bodyWeightKg?.message}>
              <Input
                {...register('bodyWeightKg')}
                type="number"
                inputMode="decimal"
                step={0.5}
                placeholder="—"
                className="h-11 font-mono"
              />
            </FormField>
          </div>
        </Section>

        <Separator />

        {/* ── Training ── */}
        <Section title="Entrenamiento">
          <FormField label="Nivel">
            <Controller
              name="level"
              control={control}
              render={({ field }) => (
                <ChipGroup
                  options={['principiante', 'intermedio', 'avanzado'] as const}
                  labels={{ principiante: 'Principiante', intermedio: 'Intermedio', avanzado: 'Avanzado' }}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FormField>

          <FormField label="Objetivo principal">
            <Controller
              name="primaryObjective"
              control={control}
              render={({ field }) => (
                <ChipGroup
                  options={['hipertrofia', 'fuerza', 'mixto', 'resistencia'] as const}
                  labels={{ hipertrofia: 'Hipertrofia', fuerza: 'Fuerza', mixto: 'Mixto', resistencia: 'Resistencia' }}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FormField>
        </Section>

        <Separator />

        {/* ── Equipment & units ── */}
        <Section title="Unidades y equipamiento">
          <FormField label="Unidades de peso">
            <Controller
              name="units"
              control={control}
              render={({ field }) => (
                <ChipGroup
                  options={['kg', 'lb'] as const}
                  labels={{ kg: 'Kilogramos (kg)', lb: 'Libras (lb)' }}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FormField>

          <FormField
            label="Incremento mínimo de peso"
            hint="Depende de los discos disponibles en tu gym"
            error={errors.minWeightIncrement?.message}
          >
            <Controller
              name="minWeightIncrement"
              control={control}
              render={({ field }) => (
                <ChipGroup
                  options={[0.5, 1, 1.25, 2.5, 5] as unknown as ('0.5' | '1' | '1.25' | '2.5' | '5')[]}
                  labels={{ '0.5': '0.5 kg', '1': '1 kg', '1.25': '1.25 kg', '2.5': '2.5 kg', '5': '5 kg' } as Record<string, string>}
                  value={String(field.value) as never}
                  onChange={(v) => field.onChange(Number(v))}
                />
              )}
            />
          </FormField>
        </Section>

        <Separator />

        {/* ── Preferences ── */}
        <Section title="Preferencias">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-sm font-medium">Timer de descanso</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Muestra el contador automáticamente al completar un set
              </p>
            </div>
            <Controller
              name="preferRestTimer"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="Timer de descanso"
                />
              )}
            />
          </div>

          <FormField label="Tema">
            <Controller
              name="theme"
              control={control}
              render={({ field }) => (
                <ChipGroup
                  options={['dark', 'light', 'system'] as const}
                  labels={{ dark: 'Oscuro', light: 'Claro', system: 'Sistema' }}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FormField>
        </Section>

        <Separator />

        {/* Security */}
        <Section title="Seguridad">
          <ChangePassword />
        </Section>

        {/* Save button */}
        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold gap-2"
        >
          <Save className="h-4 w-4" />
          {saved ? '¡Guardado!' : 'Guardar cambios'}
        </Button>
      </form>

      <div className="px-4 space-y-6 pb-8">
        <Separator />

        {/* 1RM */}
        <OneRMEditor />

        <Separator />

        {/* Admin: user management */}
        {isAdmin && (
          <>
            <AdminUserList />
            <Separator />
          </>
        )}

        {/* Data management */}
        <Section title="Gestión de datos">
          <DataManagement />
        </Section>
      </div>

      <UserSwitcherModal open={showSwitcher} onClose={() => setShowSwitcher(false)} />
    </div>
  );
}

// ── Small layout helpers ──────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </p>
      {children}
    </div>
  );
}

function FormField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {hint && <p className="text-xs text-muted-foreground -mt-0.5">{hint}</p>}
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
