import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useUsersStore } from '@/stores/usersStore';
import { hashPassword } from '@/lib/auth';
import { sendWelcomeEmail, isEmailConfigured } from '@/lib/emailService';
import { AVATAR_COLORS } from '@/types/user';
import type { AppUser, UserProfile } from '@/types/user';

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Correo inválido'),
  password: z.string(),
  level: z.enum(['principiante', 'intermedio', 'avanzado']),
  primaryObjective: z.enum(['hipertrofia', 'fuerza', 'mixto', 'resistencia']),
  units: z.enum(['kg', 'lb']),
  preferRestTimer: z.boolean(),
  avatarColor: z.string(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  editUser?: AppUser;
}

function ChipGroup<T extends string>({
  options,
  labels,
  value,
  onChange,
}: {
  options: readonly T[];
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

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  level: 'principiante',
  primaryObjective: 'hipertrofia',
  units: 'kg',
  minWeightIncrement: 2.5,
  preferRestTimer: true,
  theme: 'dark',
  oneRMEstimates: {},
};

const DEFAULT_PASSWORD = 'Entrena123';

export default function UserFormModal({ open, onClose, editUser }: Props) {
  const { addUser, updateUser, updateUserProfile } = useUsersStore();
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: editUser?.profile.name ?? '',
      email: editUser?.email ?? '',
      password: DEFAULT_PASSWORD,
      level: editUser?.profile.level ?? 'principiante',
      primaryObjective: editUser?.profile.primaryObjective ?? 'hipertrofia',
      units: editUser?.profile.units ?? 'kg',
      preferRestTimer: editUser?.profile.preferRestTimer ?? true,
      avatarColor: editUser?.avatarColor ?? AVATAR_COLORS[0],
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: editUser?.profile.name ?? '',
        email: editUser?.email ?? '',
        password: DEFAULT_PASSWORD,
        level: editUser?.profile.level ?? 'principiante',
        primaryObjective: editUser?.profile.primaryObjective ?? 'hipertrofia',
        units: editUser?.profile.units ?? 'kg',
        preferRestTimer: editUser?.profile.preferRestTimer ?? true,
        avatarColor: editUser?.avatarColor ?? AVATAR_COLORS[0],
      });
      setShowPw(false);
    }
  }, [open, editUser, reset]);

  async function onSubmit(data: FormData) {
    if (editUser) {
      updateUser(editUser.id, { avatarColor: data.avatarColor, email: data.email });
      updateUserProfile(editUser.id, {
        name: data.name,
        level: data.level,
        primaryObjective: data.primaryObjective,
        units: data.units,
        preferRestTimer: data.preferRestTimer,
      });
    } else {
      if (data.password.length < 6) {
        setError('password', { message: 'Mínimo 6 caracteres' });
        return;
      }
      const hash = await hashPassword(data.password);
      addUser(
        { ...DEFAULT_PROFILE, name: data.name, level: data.level, primaryObjective: data.primaryObjective, units: data.units, preferRestTimer: data.preferRestTimer },
        data.email,
        hash,
        data.password,
        data.avatarColor,
      );
      if (isEmailConfigured()) {
        sendWelcomeEmail({ toName: data.name, toEmail: data.email, initialPassword: data.password })
          .catch((e) => console.warn('[Email] Welcome email failed:', e));
      }
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm mx-auto max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editUser ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label>Nombre</Label>
            <Input {...register('name')} placeholder="Nombre del usuario" className="h-11" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label>Correo electrónico</Label>
            <Input {...register('email')} type="email" placeholder="usuario@ejemplo.com" className="h-11" />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          {/* Password — only for new users */}
          {!editUser && (
            <div className="space-y-1.5">
              <Label>Contraseña inicial</Label>
              <div className="relative">
                <Input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              <p className="text-[10px] text-muted-foreground">
                El usuario puede cambiarla desde su perfil.
              </p>
            </div>
          )}

          {/* Avatar color */}
          <div className="space-y-1.5">
            <Label>Color de avatar</Label>
            <Controller
              name="avatarColor"
              control={control}
              render={({ field }) => (
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => field.onChange(color)}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        field.value === color ? 'scale-125 ring-2 ring-white/60' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            />
          </div>

          {/* Level */}
          <div className="space-y-1.5">
            <Label>Nivel</Label>
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
          </div>

          {/* Objective */}
          <div className="space-y-1.5">
            <Label>Objetivo</Label>
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
          </div>

          {/* Units */}
          <div className="space-y-1.5">
            <Label>Unidades</Label>
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
          </div>

          {/* Rest timer */}
          <div className="flex items-center justify-between gap-4">
            <Label className="text-sm">Timer de descanso</Label>
            <Controller
              name="preferRestTimer"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>

          <Button type="submit" className="w-full h-11 gap-2">
            <Save className="h-4 w-4" />
            {editUser ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
