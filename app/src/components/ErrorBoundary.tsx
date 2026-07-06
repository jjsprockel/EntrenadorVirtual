import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-background p-6 text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center text-2xl">
          ⚠️
        </div>
        <div className="space-y-1.5 max-w-xs">
          <p className="font-bold text-base">Algo salió mal</p>
          <p className="text-sm text-muted-foreground">
            Ocurrió un error inesperado. Tu progreso guardado está a salvo.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
        >
          Recargar app
        </button>
        <details className="text-left max-w-xs w-full">
          <summary className="text-xs text-muted-foreground cursor-pointer">
            Detalle del error
          </summary>
          <pre className="mt-2 text-[10px] text-destructive overflow-auto p-2 bg-muted rounded-lg max-h-32">
            {this.state.error.message}
          </pre>
        </details>
      </div>
    );
  }
}
