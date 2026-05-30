import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Eye, EyeOff, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUsersStore } from '@/stores/usersStore';

// ── Demo credentials for quick testing ───────────────────────────────────────

const DEMO_ACCOUNTS = [
  { label: 'Admin',  email: 'admin@entrenador.app', password: 'Admin1234', color: '#FF6B35' },
  { label: 'Carlos', email: 'carlos@demo.com',       password: 'Entrena123', color: '#3B82F6' },
  { label: 'María',  email: 'maria@demo.com',         password: 'Entrena123', color: '#EC4899' },
  { label: 'Lucas',  email: 'lucas@demo.com',         password: 'Entrena123', color: '#10B981' },
  { label: 'Sofía',  email: 'sofia@demo.com',         password: 'Entrena123', color: '#F59E0B' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const login = useUsersStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);

  // Core login logic — called from both button onClick and form onSubmit (Enter key)
  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Completa el correo y la contraseña.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const ok = await login(email.trim(), password);
      if (!ok) setError('Correo o contraseña incorrectos.');
    } catch (err) {
      console.error('[Login]', err);
      setError('Error al iniciar sesión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  // Form onSubmit handles Enter key in inputs
  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    handleLogin();
  }

  async function handleQuickLogin(acc: typeof DEMO_ACCOUNTS[number]) {
    setLoading(true);
    setError('');
    try {
      const ok = await login(acc.email, acc.password);
      if (!ok) {
        setError(`"${acc.label}" no existe aún. Carga los datos demo desde el Panel Admin primero.`);
        setShowDemo(true);
      }
    } catch (err) {
      console.error('[QuickLogin]', err);
      setError('Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Dumbbell className="h-7 w-7 text-primary" strokeWidth={2} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">EntrenadorVirtual</h1>
            <p className="text-sm text-muted-foreground mt-1">Inicia sesión para continuar</p>
          </div>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="usuario@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 pr-10"
                required
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center leading-snug">{error}</p>
          )}

          {/* Base UI Button forces type="button" internally, so onClick is required for click support.
              The form's onSubmit still handles the Enter-key path. */}
          <Button
            className="w-full h-11 text-base font-semibold"
            disabled={loading}
            onClick={handleLogin}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                Verificando…
              </span>
            ) : (
              'Iniciar sesión'
            )}
          </Button>

          <div className="text-center">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>

        {/* Quick-access demo panel */}
        <div className="border border-dashed border-border rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDemo((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Acceso rápido — modo demo
            </span>
            {showDemo
              ? <ChevronUp className="h-4 w-4" />
              : <ChevronDown className="h-4 w-4" />}
          </button>

          {showDemo && (
            <div className="px-4 pb-4 space-y-2">
              <p className="text-[11px] text-muted-foreground">
                Carga los datos demo desde el Panel Admin (cuenta de admin) antes de usar las cuentas de usuario.
              </p>
              <div className="grid grid-cols-1 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    disabled={loading}
                    onClick={() => handleQuickLogin(acc)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors text-left disabled:opacity-50"
                  >
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ backgroundColor: acc.color }}
                    >
                      {acc.label.charAt(0)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none">{acc.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-mono truncate">{acc.email}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">{acc.password}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
