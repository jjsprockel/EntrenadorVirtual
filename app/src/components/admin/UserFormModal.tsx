import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save } from 'lucide-react';
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
import { AVATAR_COLORS } from '@/types/user';
import type { AppUser, UserProfile } from '@/types/user';

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
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

export default function UserFormModal({ open, onClose, editUser }: Props) {
  const { addUser, updateUser, updateUserProfile } = useUsersStore();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: editUser?.profile.name ?? '',
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
        level: editUser?.profile.level ?? 'principiante',
        primaryObjective: editUser?.profile.primaryObjective ?? 'hipertrofia',
        units: editUser?.profile.units ?? 'kg',
        preferRestTimer: editUser?.profile.preferRestTimer ?? true,
        avatarColor: editUser?.avatarColor ?? AVATAR_COLORS[0],
      });
    }
  }, [open, editUser, reset]);

  function onSubmit(data: FormData) {
    if (editUser) {
      updateUser(editUser.id, { avatarColor: data.avatarColor });
      updateUserProfile(editUser.id, {
        name: data.name,
        level: data.level,
        primaryObjective: data.primaryObjective,
        units: data.units,
        preferRestTimer: data.preferRestTimer,
      });
    } else {
      addUser({
        ...DEFAULT_PROFILE,
        name: data.name,
        level: data.level,
        primaryObjective: data.primaryObjective,
        units: data.units,
        preferRestTimer: data.preferRestTimer,
      });
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm mx-auto">
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
