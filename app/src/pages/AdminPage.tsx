import { useState } from 'react';
import {
  Shield,
  Users,
  Dumbbell,
  UserPlus,
  Eye,
  EyeOff,
  KeyRound,
  Edit,
  Trash2,
  FlaskConical,
  CheckCircle2,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { isDemoDataLoaded, seedDemoData } from '@/lib/seedData';
import { sendWelcomeEmail, isEmailConfigured } from '@/lib/emailService';
import UserAvatar from '@/components/admin/UserAvatar';
import UserFormModal from '@/components/admin/UserFormModal';
import type { AppUser } from '@/types/user';

// ── Reset password dialog ─────────────────────────────────────────────────────

function ResetPasswordDialog({
  user,
  open,
  onClose,
}: {
  user: AppUser;
  open: boolean;
  onClose: () => void;
}) {
  const resetUserPassword = useUsersStore((s) => s.resetUserPassword);
  const [newPw, setNewPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(false);

  async function handleReset() {
    if (!newPw.trim()) return;
    await resetUserPassword(user.id, newPw.trim());
    setDone(true);
    setTimeout(() => {
      setDone(false);
      setNewPw('');
      onClose();
    }, 1200);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xs mx-auto">
        <DialogHeader>
          <DialogTitle>Resetear contraseña</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <p className="text-sm text-muted-foreground">
            Nueva contraseña para <strong>{user.profile.name}</strong>
          </p>
          <div className="space-y-1.5">
            <Label>Nueva contraseña</Label>
            <div className="relative">
              <Input
                type={showPw ? 'text' : 'password'}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Ingresa nueva contraseña"
                className="h-10 pr-10"
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
          </div>
          <Button
            className="w-full h-10 gap-2"
            onClick={handleReset}
            disabled={!newPw.trim() || done}
          >
            {done ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> Contraseña actualizada
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4" /> Resetear contraseña
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── User card ─────────────────────────────────────────────────────────────────

function UserCredentialCard({ user }: { user: AppUser }) {
  const { deleteUser } = useUsersStore();
  const { getSessionsByUser } = useSessionStore();
  const [showPw, setShowPw] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error' | 'unconfigured'>('idle');

  async function handleSendEmail() {
    if (!user.email) return;
    if (!isEmailConfigured()) {
      setEmailStatus('unconfigured');
      setTimeout(() => setEmailStatus('idle'), 5000);
      return;
    }
    setEmailStatus('sending');
    try {
      await sendWelcomeEmail({
        toName: user.profile.name,
        toEmail: user.email,
        initialPassword: user.tempPassword ?? '(contraseña configurada)',
      });
      setEmailStatus('sent');
      setTimeout(() => setEmailStatus('idle'), 4000);
    } catch {
      setEmailStatus('error');
      setTimeout(() => setEmailStatus('idle'), 4000);
    }
  }

  const sessions = getSessionsByUser(user.id);
  const lastSession = sessions.length > 0
    ? sessions.reduce((a, b) => (a.date > b.date ? a : b))
    : null;

  const daysSinceLastSession = lastSession
    ? Math.floor((Date.now() - new Date(lastSession.date).getTime()) / 86_400_000)
    : null;

  function lastSessionLabel() {
    if (daysSinceLastSession === null) return 'Sin sesiones';
    if (daysSinceLastSession === 0) return 'Hoy';
    if (daysSinceLastSession === 1) return 'Ayer';
    return `Hace ${daysSinceLastSession} días`;
  }

  const pwDisplay = user.tempPassword ?? null;

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <UserAvatar user={user} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold truncate">{user.profile.name || 'Sin nombre'}</p>
              {user.role === 'admin' && <Shield className="h-3.5 w-3.5 text-primary shrink-0" />}
            </div>
            <p className="text-[11px] text-muted-foreground capitalize">{user.role}</p>
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              title="Editar"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setResetOpen(true)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
              title="Resetear contraseña"
            >
              <KeyRound className="h-3.5 w-3.5" />
            </button>
            {user.role !== 'admin' && (
              <AlertDialog>
                <AlertDialogTrigger
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Se eliminará a "{user.profile.name}". Sus rutinas y sesiones no se borrarán.
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

        {/* Credentials */}
        <div className="rounded-lg bg-muted/40 p-3 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-20 shrink-0">Correo</span>
            <span className="font-mono truncate">{user.email ?? '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-20 shrink-0">Contraseña</span>
            {pwDisplay ? (
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <span className="font-mono">
                  {showPw ? pwDisplay : '•'.repeat(Math.min(pwDisplay.length, 10))}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  aria-label="Mostrar/ocultar"
                >
                  {showPw ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
              </div>
            ) : (
              <span className="text-muted-foreground italic">Contraseña actualizada ✓</span>
            )}
          </div>
        </div>

        {/* Stats + email action */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-1">
            <span className="flex items-center gap-1">
              <Dumbbell className="h-3 w-3" />
              {sessions.length} sesiones
            </span>
            <span>{lastSessionLabel()}</span>
          </div>
          {user.email && (
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={emailStatus === 'sending'}
              title="Enviar correo de bienvenida"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                emailStatus === 'sent'
                  ? 'border-green-500/40 text-green-500 bg-green-500/10'
                  : emailStatus === 'error' || emailStatus === 'unconfigured'
                  ? 'border-destructive/40 text-destructive bg-destructive/10'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5'
              }`}
            >
              {emailStatus === 'sending' ? (
                <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
              ) : emailStatus === 'sent' ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : emailStatus === 'error' ? (
                <AlertCircle className="h-3 w-3" />
              ) : emailStatus === 'unconfigured' ? (
                <AlertCircle className="h-3 w-3" />
              ) : (
                <Mail className="h-3 w-3" />
              )}
              {emailStatus === 'sent' ? 'Enviado' : emailStatus === 'error' ? 'Error' : emailStatus === 'unconfigured' ? 'Sin config' : 'Bienvenida'}
            </button>
          )}
        </div>
        {emailStatus === 'unconfigured' && (
          <p className="text-[10px] text-muted-foreground">
            Configura VITE_EMAILJS_* en las variables de entorno de Vercel para habilitar el envío de correos.
          </p>
        )}
      </div>

      <UserFormModal open={editOpen} onClose={() => setEditOpen(false)} editUser={user} />
      <ResetPasswordDialog user={user} open={resetOpen} onClose={() => setResetOpen(false)} />
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { users, sessionUserId } = useUsersStore();
  const { sessions } = useSessionStore();
  const { routines } = useRoutineStore();
  const [showAdd, setShowAdd] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(isDemoDataLoaded);

  const sessionUser = users.find((u) => u.id === sessionUserId);
  if (sessionUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full p-6 text-muted-foreground text-sm">
        Acceso restringido a administradores.
      </div>
    );
  }

  const sessionsLast30 = sessions.filter((s) => {
    const d = new Date(s.date);
    return Date.now() - d.getTime() < 30 * 86_400_000;
  }).length;

  async function handleLoadDemo() {
    await seedDemoData();
    setDemoLoaded(true);
  }

  return (
    <div className="flex flex-col max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="font-bold text-base">Panel de Administración</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={<Users className="h-4 w-4" />} label="Usuarios" value={users.length} />
          <StatCard icon={<Dumbbell className="h-4 w-4" />} label="Sesiones totales" value={sessions.length} />
          <StatCard icon={<Dumbbell className="h-4 w-4" />} label="Últimos 30 días" value={sessionsLast30} />
        </div>

        {/* Users section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Usuarios y credenciales
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              onClick={() => setShowAdd(true)}
            >
              <UserPlus className="h-3.5 w-3.5" />
              Nuevo usuario
            </Button>
          </div>

          <div className="space-y-3">
            {users.map((user) => (
              <UserCredentialCard key={user.id} user={user} />
            ))}
          </div>
        </div>

        {/* Demo data */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Datos de demostración
          </p>
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
            {demoLoaded ? 'Datos demo ya cargados' : 'Cargar 4 usuarios demo (3–6 meses)'}
          </button>
          {!demoLoaded && (
            <p className="text-[10px] text-muted-foreground text-center">
              Carlos · María · Lucas · Sofía — datos simulados para demostración
            </p>
          )}
        </div>

        {/* Routines count */}
        <p className="text-xs text-muted-foreground text-center">
          {routines.length} rutinas registradas en total
        </p>
      </div>

      <UserFormModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center space-y-1">
      <div className="flex justify-center text-primary">{icon}</div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
    </div>
  );
}
