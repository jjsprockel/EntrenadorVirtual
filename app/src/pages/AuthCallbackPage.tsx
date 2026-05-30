import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function handleCallback() {
      if (!supabase) {
        navigate('/', { replace: true });
        return;
      }

      // Supabase puts tokens in the URL hash after email verification / OAuth
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setErrorMsg(error.message);
        setStatus('error');
        return;
      }

      if (data.session) {
        setStatus('ok');
        setTimeout(() => navigate('/', { replace: true }), 1500);
      } else {
        setErrorMsg('No se pudo verificar la sesión. El enlace puede haber expirado.');
        setStatus('error');
      }
    }

    handleCallback();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Dumbbell className="h-7 w-7 text-primary" strokeWidth={2} />
        </div>

        {status === 'loading' && (
          <>
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">Verificando sesión…</p>
          </>
        )}

        {status === 'ok' && (
          <>
            <CheckCircle className="h-10 w-10 text-green-500" />
            <p className="font-medium">¡Verificado! Redirigiendo…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-10 w-10 text-destructive" />
            <p className="font-medium">Error de verificación</p>
            <p className="text-sm text-muted-foreground max-w-xs">{errorMsg}</p>
            <button
              className="mt-2 text-sm text-primary underline underline-offset-4"
              onClick={() => navigate('/auth/forgot-password', { replace: true })}
            >
              Solicitar un nuevo enlace
            </button>
          </>
        )}
      </div>
    </div>
  );
}
