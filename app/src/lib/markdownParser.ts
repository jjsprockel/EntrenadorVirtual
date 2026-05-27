import type {
  Exercise,
  MuscleGroup,
  MovementPattern,
  Equipment,
  Level,
} from '@/types/exercise';

// ── Helpers ──────────────────────────────────────────────────────────────────

function normStr(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function mapMuscleGroup(header: string): MuscleGroup {
  const n = normStr(header);
  if (n.includes('pecho')) return 'pecho';
  if (n.includes('espalda')) return 'espalda';
  if (n.includes('hombro')) return 'hombros';
  if (n.includes('bicep') || n.includes('biceps')) return 'biceps';
  if (n.includes('tricep') || n.includes('triceps')) return 'triceps';
  if (n.includes('cuadricep') || n.includes('cuadriceps')) return 'cuadriceps';
  if (n.includes('isquio') || n.includes('gluteo')) return 'isquiotibiales_gluteos';
  if (n.includes('pantorrilla')) return 'pantorrillas';
  if (n.includes('core') || n.includes('abdomen')) return 'core';
  return 'core';
}

function mapPattern(raw: string): MovementPattern {
  const n = normStr(raw);
  if (n.includes('empuje') && (n.includes('vertical'))) return 'empuje_vertical';
  if (n.includes('empuje')) return 'empuje_horizontal';
  if (n.includes('traccion') && (n.includes('vertical'))) return 'traccion_vertical';
  if (n.includes('traccion')) return 'traccion_horizontal';
  if (n.includes('sentadilla')) return 'sentadilla';
  if (n.includes('bisagra')) return 'bisagra';
  if (n.includes('core') || n.includes('estabiliz')) return 'core';
  return 'aislamiento';
}

function mapEquipment(raw: string): Equipment[] {
  const n = normStr(raw);
  const result: Equipment[] = [];
  if (n.includes('barra')) result.push('barra');
  if (n.includes('mancuerna')) result.push('mancuernas');
  if (n.includes('maquina') || n.includes('maquina')) result.push('maquina');
  if (n.includes('polea') || n.includes('cable') || n.includes('cuerda')) result.push('polea');
  if (n.includes('kettlebell')) result.push('kettlebell');
  if (n.includes('banco')) result.push('banco');
  if (
    n.includes('peso corporal') ||
    n.includes('sin equipo') ||
    n.includes('corporal') ||
    n.includes('suelo')
  )
    result.push('peso_corporal');
  return result.length ? result : ['peso_corporal'];
}

function mapLevel(raw: string): Level {
  const n = normStr(raw);
  if (n.includes('avanzado')) return 'avanzado';
  if (n.includes('intermedio')) return 'intermedio';
  return 'principiante';
}

function extractField(block: string, label: string): string {
  const re = new RegExp(`\\*\\*${label}[^*]*\\*\\*:?\\s*(.+)`);
  const m = block.match(re);
  return m ? m[1].trim() : '';
}

function extractList(block: string, label: string): string[] {
  const re = new RegExp(
    `\\*\\*${label}[^*]*\\*\\*:?\\s*\\n([\\s\\S]*?)(?=\\n\\*\\*|\\n---|\n$|$)`,
  );
  const m = block.match(re);
  if (!m) return [];
  return m[1]
    .split('\n')
    .map((l) => l.replace(/^[\s\-\d.❌✓•]+/, '').trim())
    .filter(Boolean);
}

function extractAlternativeCodes(block: string): string[] {
  const re = /\*\*Alternativas[^*]*\*\*:?\s*(.+)/;
  const m = block.match(re);
  if (!m) return [];
  const codes = m[1].match(/[A-Z]+-\d+/g);
  return codes ?? [];
}

function extractNameEn(block: string): string[] {
  const re = /\*\*EN:\*\*\s*(.+)/;
  const m = block.match(re);
  if (!m) return [];
  return m[1]
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
}

// ── Main parser ───────────────────────────────────────────────────────────────

export function parseExercises(markdown: string): Exercise[] {
  const exercises: Exercise[] = [];

  // Split on muscle group headers (# PECHO, # ESPALDA …)
  // The document uses both `# ` and `## ` for group headers
  const groupSections = markdown.split(/\n(?=# [A-ZÁÉÍÓÚÜÑ])/);

  for (const section of groupSections) {
    const groupHeaderMatch = section.match(/^# (.+)/m);
    if (!groupHeaderMatch) continue;
    const muscleGroup = mapMuscleGroup(groupHeaderMatch[1]);

    // Split on exercise headers  ### CODE · Name
    const exerciseParts = section.split(/\n(?=### [A-Z]+-\d+)/);

    for (const part of exerciseParts) {
      const headerMatch = part.match(/^### ([A-Z]+-\d+)\s*[·•]\s*(.+)/m);
      if (!headerMatch) continue;

      const code = headerMatch[1].trim();
      const nameEs = headerMatch[2].trim();

      // Pattern / Equipment / Level line
      const metaLine = extractField(part, 'Patrón');
      const patternRaw = metaLine.split('|')[0].trim();

      const equipLine = extractField(part, 'Equipamiento');
      const levelLine = extractField(part, 'Nivel');

      const pattern = mapPattern(patternRaw);
      const equipment = mapEquipment(equipLine);
      const level = mapLevel(levelLine);

      // Muscles
      const primaryRaw = extractField(part, 'Músculos primarios');
      const secondaryRaw = extractField(part, 'Músculos secundarios');
      const primaryMuscles = primaryRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const secondaryMuscles = secondaryRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      // Numbered execution steps
      const execRaw = part.match(
        /\*\*Ejecución[^*]*\*\*:?\s*\n([\s\S]*?)(?=\n\*\*|\n---|$)/,
      );
      const execution = execRaw
        ? execRaw[1]
            .split('\n')
            .map((l) => l.replace(/^\d+\.\s*/, '').trim())
            .filter(Boolean)
        : [];

      // Variant execution steps (some exercises have "Ejecución (Variante):")
      const variantExec = part.match(
        /\*\*Variante[^*]*\*\*:?\s*\n([\s\S]*?)(?=\n\*\*|\n---|$)/,
      );
      if (variantExec) {
        const varSteps = variantExec[1]
          .split('\n')
          .map((l) => l.replace(/^\d+\.\s*/, '').trim())
          .filter(Boolean);
        execution.push(...varSteps);
      }

      const tips = extractList(part, 'Tips prácticos');
      const pitfalls = extractList(part, 'Pitfalls');

      const alternativeCodes = extractAlternativeCodes(part);
      const nameEn = extractNameEn(part);

      const imagePath = `/images/ejercicios/${code}.png`;

      exercises.push({
        code,
        nameEs,
        nameEn,
        muscleGroup,
        pattern,
        equipment,
        level,
        primaryMuscles,
        secondaryMuscles,
        execution,
        tips,
        pitfalls,
        alternativeCodes,
        imagePath,
      });
    }
  }

  return exercises;
}
