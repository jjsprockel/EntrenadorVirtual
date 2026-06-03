import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const isConfigured = useAuthStore((s) => s.isConfigured);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSend() {
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    const { error: err } = await resetPassword(email.trim());
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setSent(true);
    }
  }

  if (!isConfigured) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <Dumbbell className="h-8 w-8 text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">
            La recuperación de contraseña por correo requiere que Supabase esté configurado.
            <br />Contacta al administrador para que restablezca tu contraseña.
          </p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
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
            <h1 className="text-2xl font-bold tracking-tight">Recuperar contraseña</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Te enviamos un enlace para crear una nueva contraseña
            </p>
          </div>
        </div>

        {sent ? (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-center space-y-2">
            <Mail className="h-6 w-6 text-green-500 mx-auto" />
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Revisa tu correo
            </p>
            <p className="text-xs text-muted-foreground">
              Si <strong>{email}</strong> está registrado, recibirás un enlace en los próximos
              minutos. Revisa también la carpeta de spam.
            </p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate(-1)}>
              Volver al inicio de sesión
            </Button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="button" className="w-full" disabled={loading || !email.trim()} onClick={handleSend}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Enviando…
                </span>
              ) : (
                'Enviar enlace de recuperación'
              )}
            </Button>

            <button
              type="button"
              className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al inicio de sesión
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
