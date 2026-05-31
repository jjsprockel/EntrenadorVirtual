import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Eye, EyeOff, ChevronDown, ChevronUp, Zap, Cloud, HardDrive, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUsersStore } from '@/stores/usersStore';
import { useAuthStore } from '@/stores/authStore';
import { isSupabaseConfigured } from '@/lib/supabase';
import { clearAllData } from '@/lib/db';

// ── Demo credentials (local mode only) ───────────────────────────────────────

const DEMO_ACCOUNTS = [
  { label: 'Admin',  email: 'jjsprockel@hotmail.com', password: 'Admin1234',  color: '#FF6B35' },
  { label: 'Carlos', email: 'carlos@demo.com',         password: 'Entrena123', color: '#3B82F6' },
  { label: 'María',  email: 'maria@demo.com',           password: 'Entrena123', color: '#EC4899' },
  { label: 'Lucas',  email: 'lucas@demo.com',           password: 'Entrena123', color: '#10B981' },
  { label: 'Sofía',  email: 'sofia@demo.com',           password: 'Entrena123', color: '#F59E0B' },
];

// Maps raw Supabase error strings to user-friendly Spanish messages
function mapSupabaseError(err: string): string {
  if (err.includes('Invalid login credentials') || err.includes('User not found')) {
    return 'Correo o contraseña incorrectos.';
  }
  if (err.includes('Email not confirmed')) {
    return 'Debes confirmar tu correo electrónico antes de entrar. Revisa tu bandeja de entrada.';
  }
  if (err.includes('Too many requests') || err.includes('rate limit')) {
    return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
  }
  if (err.includes('network') || err.includes('fetch')) {
    return 'Error de conexión. Verifica tu internet e inténtalo de nuevo.';
  }
  return err;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const login  = useUsersStore((s) => s.login);
  const signIn = useAuthStore((s) => s.signIn);

  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showDemo, setShowDemo] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Completa el correo y la contraseña.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isSupabaseConfigured) {
        // Supabase mode: onAuthStateChange fires on success → supabaseSession updates → App.tsx gate opens
        const { error: err } = await signIn(email.trim(), password);
        if (err) setError(mapSupabaseError(err));
      } else {
        // Local mode: sets sessionUserId in usersStore → App.tsx gate opens
        const ok = await login(email.trim(), password);
        if (!ok) setError('Correo o contraseña incorrectos.');
      }
    } catch (err) {
      console.error('[Login]', err);
      setError('Error al iniciar sesión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  // Form onSubmit handles Enter key
  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    handleLogin();
  }

  // Quick login — only available in local mode; in Supabase mode the buttons are disabled
  async function handleQuickLogin(acc: typeof DEMO_ACCOUNTS[number]) {
    if (isSupabaseConfigured) return; // guard — buttons should already be disabled
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

        {/* Logo + auth mode badge */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Dumbbell className="h-7 w-7 text-primary" strokeWidth={2} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">EntrenadorVirtual</h1>
            <p className="text-sm text-muted-foreground mt-1">Inicia sesión para continuar</p>
          </div>

          {/* Diagnostic badge — shows which auth system is active */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono font-medium ${
              isSupabaseConfigured
                ? 'border-blue-500/40 text-blue-500 bg-blue-500/10'
                : 'border-amber-500/40 text-amber-600 bg-amber-500/10 dark:text-amber-400'
            }`}
          >
            {isSupabaseConfigured
              ? <><Cloud className="h-3 w-3" /> Modo: Supabase</>
              : <><HardDrive className="h-3 w-3" /> Modo: Local</>}
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
            <div className="space-y-1.5">
              <p className="text-sm text-destructive text-center leading-snug">{error}</p>
              {/* Recovery option — only in local mode, lets the user wipe stale IDB state */}
              {!isSupabaseConfigured && (
                <p className="text-center">
                  <button
                    type="button"
                    onClick={async () => {
                      await clearAllData();
                      window.location.reload();
                    }}
                    className="text-[11px] text-muted-foreground hover:text-destructive underline underline-offset-2 transition-colors inline-flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reiniciar datos locales y empezar desde cero
                  </button>
                </p>
              )}
            </div>
          )}

          {/* Base UI Button forces type="button" internally — onClick handles click; form onSubmit handles Enter */}
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

          {/* Forgot password — always visible; ForgotPasswordPage explains no-Supabase case */}
          <div className="text-center">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>

        {/* Quick-access demo panel — functional only in local mode */}
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
            {showDemo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showDemo && (
            <div className="px-4 pb-4 space-y-2">
              {isSupabaseConfigured ? (
                /* Supabase mode: demo accounts are local-only, disable them */
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 space-y-1.5">
                  <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                    Modo Supabase activo
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Las cuentas demo solo funcionan en <strong>modo local</strong> (sin variables Supabase).
                    En modo Supabase, las cuentas deben crearse manualmente en el Panel Admin
                    y existir en Supabase Auth.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-muted-foreground">
                    Solo modo local. Carga los datos demo desde el Panel Admin (cuenta admin) antes de usar Carlos, María, Lucas o Sofía.
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
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
