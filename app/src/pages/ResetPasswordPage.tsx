import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

function PasswordStrengthBar({ password }: { password: string }) {
  const score = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[a-z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const colors = ['bg-destructive', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const labels = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Excelente'];

  if (!password) return null;

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? colors[score - 1] : 'bg-muted'}`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{labels[score - 1] ?? ''}</p>
    </div>
  );
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const updatePassword = useAuthStore((s) => s.updatePassword);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase puts the recovery token in the URL hash; getSession picks it up automatically
    if (!supabase) {
      navigate('/', { replace: true });
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else navigate('/auth/forgot-password', { replace: true });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setLoading(true);
    setError('');
    const { error: err } = await updatePassword(password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setDone(true);
      setTimeout(() => navigate('/', { replace: true }), 2000);
    }
  }

  if (!ready) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8">

        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Dumbbell className="h-7 w-7 text-primary" strokeWidth={2} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Nueva contraseña</h1>
            <p className="text-sm text-muted-foreground mt-1">Elige una contraseña segura</p>
          </div>
        </div>

        {done ? (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-center">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              ¡Contraseña actualizada! Redirigiendo…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPw((v) => !v)}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <PasswordStrengthBar password={password} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirmar contraseña</Label>
              <Input
                id="confirm"
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repite la contraseña"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading || !password || !confirm}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Guardando…
                </span>
              ) : (
                'Guardar nueva contraseña'
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
