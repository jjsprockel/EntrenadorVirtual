import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Dumbbell,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import MuscleGroupBadge from '@/components/exercise/MuscleGroupBadge';
import AlternativesModal from '@/components/exercise/AlternativesModal';
import { useExerciseStore } from '@/stores/exerciseStore';

const LEVEL_LABEL = { principiante: 'Principiante', intermedio: 'Intermedio', avanzado: 'Avanzado' };
const LEVEL_COLOR = {
  principiante: 'bg-green-500/15 text-green-400 border-green-500/30',
  intermedio: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  avanzado: 'bg-red-500/15 text-red-400 border-red-500/30',
};
const PATTERN_LABEL: Record<string, string> = {
  empuje_horizontal: 'Empuje horizontal',
  empuje_vertical: 'Empuje vertical',
  traccion_horizontal: 'Tracción horizontal',
  traccion_vertical: 'Tracción vertical',
  sentadilla: 'Sentadilla',
  bisagra: 'Bisagra',
  aislamiento: 'Aislamiento',
  core: 'Core',
};

export default function ExerciseDetailPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { getByCode, getAlternatives } = useExerciseStore();
  const [imgError, setImgError] = useState(false);
  const [showAlts, setShowAlts] = useState(false);

  const exercise = code ? getByCode(code) : undefined;
  const alternatives = exercise ? getAlternatives(exercise.code) : [];

  if (!exercise) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
        <Dumbbell className="h-12 w-12 text-muted-foreground opacity-30" />
        <p className="text-muted-foreground">Ejercicio no encontrado</p>
        <Button variant="outline" onClick={() => navigate('/ejercicios')}>
          Volver a ejercicios
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-2xl mx-auto w-full">
      {/* Back button */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-3 flex items-center gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="h-4 w-4" />
          Ejercicios
        </button>
        <span className="text-muted-foreground/40 mx-1">/</span>
        <span className="text-sm font-medium text-foreground truncate">{exercise.code}</span>
      </div>

      {/* Hero image */}
      <div className="relative aspect-video w-full bg-muted overflow-hidden">
        {!imgError ? (
          <img
            src={exercise.imagePath}
            alt={exercise.nameEs}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Dumbbell className="h-16 w-16 opacity-20" />
            <p className="text-sm opacity-40">Imagen no disponible</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <span className="font-mono text-xs text-primary font-bold">{exercise.code}</span>
          <h1 className="text-xl font-bold text-foreground leading-tight mt-0.5">
            {exercise.nameEs}
          </h1>
          {exercise.nameEn[0] && (
            <p className="text-sm text-muted-foreground mt-0.5">{exercise.nameEn.join(' · ')}</p>
          )}
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Meta chips */}
        <div className="flex flex-wrap gap-2">
          <MuscleGroupBadge group={exercise.muscleGroup} />
          <span
            className={`text-[10px] font-medium border px-2 py-0.5 rounded-full ${LEVEL_COLOR[exercise.level]}`}
          >
            {LEVEL_LABEL[exercise.level]}
          </span>
          <span className="text-[10px] font-medium border border-border text-muted-foreground px-2 py-0.5 rounded-full">
            {PATTERN_LABEL[exercise.pattern] ?? exercise.pattern}
          </span>
          {exercise.equipment.map((eq) => (
            <span
              key={eq}
              className="text-[10px] font-medium border border-border text-muted-foreground px-2 py-0.5 rounded-full capitalize"
            >
              {eq.replace('_', ' ')}
            </span>
          ))}
        </div>

        {/* Muscles */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Músculos
          </p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-muted-foreground text-xs mr-1.5">Primarios:</span>
              {exercise.primaryMuscles.join(', ')}
            </p>
            {exercise.secondaryMuscles.length > 0 && (
              <p className="text-sm text-muted-foreground">
                <span className="text-xs mr-1.5">Secundarios:</span>
                {exercise.secondaryMuscles.join(', ')}
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Execution */}
        {exercise.execution.length > 0 && (
          <div className="space-y-2.5">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Técnica paso a paso
            </p>
            <ol className="space-y-2.5">
              {exercise.execution.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold font-mono flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-sm text-foreground/90 leading-relaxed pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Tips */}
        {exercise.tips.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-yellow-400" />
                Tips prácticos
              </p>
              <ul className="space-y-2">
                {exercise.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground/90 leading-relaxed">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Pitfalls */}
        {exercise.pitfalls.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <XCircle className="h-3.5 w-3.5 text-destructive" />
                Errores comunes
              </p>
              <ul className="space-y-2">
                {exercise.pitfalls.map((pitfall, i) => (
                  <li key={i} className="flex gap-2.5">
                    <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground/90 leading-relaxed">{pitfall}</p>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Alternatives */}
        {alternatives.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Ejercicios alternativos
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {alternatives.map((alt) => (
                  <button
                    key={alt.code}
                    type="button"
                    onClick={() => navigate(`/ejercicios/${alt.code}`)}
                    className="flex-shrink-0 flex flex-col rounded-lg border border-border bg-muted/30 overflow-hidden hover:border-primary/50 transition-colors active:scale-[0.98] w-28"
                  >
                    <div className="aspect-video w-full bg-muted overflow-hidden">
                      <img
                        src={alt.imagePath}
                        alt={alt.nameEs}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="p-1.5">
                      <p className="text-[10px] font-mono text-primary">{alt.code}</p>
                      <p className="text-[11px] font-medium text-foreground leading-tight line-clamp-2">
                        {alt.nameEs}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowAlts(true)}
                className="flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <RefreshCw className="h-3 w-3" />
                Ver todas las alternativas
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </>
        )}
      </div>

      <AlternativesModal
        exercise={exercise}
        open={showAlts}
        onClose={() => setShowAlts(false)}
      />
    </div>
  );
}
