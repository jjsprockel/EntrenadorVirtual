import exercisesDoc from '../../docs/01_ejercicios_por_grupo_muscular.md?raw';
import { parseExercises } from '@/lib/markdownParser';
import type { Exercise } from '@/types/exercise';

let _exercises: Exercise[] | null = null;

export function getExercises(): Exercise[] {
  if (!_exercises) {
    _exercises = parseExercises(exercisesDoc);
    if (import.meta.env.DEV) {
      console.log(`[KnowledgeBase] Parsed ${_exercises.length} exercises`);
    }
  }
  return _exercises;
}
