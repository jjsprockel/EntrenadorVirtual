// ── Body circumference measurements ───────────────────────────────────────────
//
// Sites and protocols follow ISAK / ACSM circumference guidelines, simplified
// for self-measurement. Every value is optional: the user records only the
// sites they want. Raw readings are kept (up to 3 per side) so the averaged
// value can always be recomputed.

export type MeasurementSiteId =
  | 'cintura'
  | 'cadera'
  | 'pecho'
  | 'brazo_relajado'
  | 'brazo_contraido'
  | 'muslo'
  | 'pantorrilla'
  | 'hombros'
  | 'cuello'
  | 'antebrazo'
  | 'abdomen';

export type MeasurementSide = 'left' | 'right' | 'center';

/** Raw readings (cm) per side. Bilateral sites use left/right; the rest use center. */
export type SiteReadings = Partial<Record<MeasurementSide, number[]>>;

export interface BodyMeasurement {
  id: string;
  userId?: string;
  /** ISO date (yyyy-mm-dd) the measurement was taken */
  date: string;
  weightKg?: number;
  values: Partial<Record<MeasurementSiteId, SiteReadings>>;
  notes?: string;
  createdAt: string;
}

export interface MeasurementSiteDef {
  id: MeasurementSiteId;
  label: string;
  tier: 'basica' | 'opcional';
  bilateral: boolean;
  /** What the measurement reflects */
  reflects: string;
  /** Short, ordered steps to reproduce the measurement */
  steps: string[];
  /** Common mistake to avoid */
  tip: string;
}

export const MEASUREMENT_SITES: MeasurementSiteDef[] = [
  {
    id: 'cintura',
    label: 'Cintura',
    tier: 'basica',
    bilateral: false,
    reflects: 'Grasa abdominal y salud metabólica',
    steps: [
      'De pie, abdomen relajado, pies juntos.',
      'Busca el punto más estrecho entre la última costilla y la cresta ilíaca.',
      'Mide al final de una exhalación normal.',
    ],
    tip: 'No metas el abdomen ni contengas la respiración.',
  },
  {
    id: 'cadera',
    label: 'Cadera / glúteo',
    tier: 'basica',
    bilateral: false,
    reflects: 'Desarrollo de glúteos y grasa periférica',
    steps: [
      'De pie, pies juntos y glúteos relajados.',
      'Mírate de lado y ubica el punto de máxima protrusión de los glúteos.',
      'Pasa la cinta horizontal alrededor de ese punto.',
    ],
    tip: 'Mide con ropa interior delgada o sin ropa: la tela suma milímetros.',
  },
  {
    id: 'pecho',
    label: 'Pecho',
    tier: 'basica',
    bilateral: false,
    reflects: 'Pectorales y dorsales',
    steps: [
      'De pie, brazos relajados a los lados.',
      'Cinta a la altura de los pezones, pasando bajo las axilas.',
      'Mide al final de una exhalación normal.',
    ],
    tip: 'No infles el pecho ni abras los dorsales.',
  },
  {
    id: 'brazo_relajado',
    label: 'Brazo relajado',
    tier: 'basica',
    bilateral: true,
    reflects: 'Bíceps, tríceps y grasa del brazo',
    steps: [
      'Brazo colgando relajado junto al cuerpo.',
      'Ubica el punto medio entre el hombro (acromion) y el codo.',
      'Rodea el brazo en ese punto, perpendicular al hueso.',
    ],
    tip: 'Marca el punto medio la primera vez y mide siempre ahí.',
  },
  {
    id: 'brazo_contraido',
    label: 'Brazo contraído',
    tier: 'basica',
    bilateral: true,
    reflects: 'Masa muscular de bíceps y tríceps',
    steps: [
      'Brazo al frente a la altura del hombro, codo a 90°.',
      'Aprieta el puño y contrae el bíceps al máximo.',
      'Mide en la parte más gruesa del brazo.',
    ],
    tip: 'Nunca después de entrenar: el bombeo infla la medida.',
  },
  {
    id: 'muslo',
    label: 'Muslo medio',
    tier: 'basica',
    bilateral: true,
    reflects: 'Cuádriceps e isquiotibiales',
    steps: [
      'De pie, piernas ligeramente separadas, peso repartido en ambas.',
      'Ubica el punto medio entre el pliegue inguinal y el borde superior de la rótula.',
      'Pasa la cinta horizontal en ese punto.',
    ],
    tip: 'No cargues el peso en la pierna que mides.',
  },
  {
    id: 'pantorrilla',
    label: 'Pantorrilla',
    tier: 'basica',
    bilateral: true,
    reflects: 'Gemelos y sóleo',
    steps: [
      'De pie, peso repartido en ambas piernas.',
      'Desliza la cinta arriba y abajo hasta encontrar la parte más gruesa.',
      'Registra el valor máximo.',
    ],
    tip: 'Pies apoyados por completo, sin ponerte de puntillas.',
  },
  {
    id: 'hombros',
    label: 'Hombros',
    tier: 'opcional',
    bilateral: false,
    reflects: 'Amplitud de deltoides y espalda alta',
    steps: [
      'De pie, brazos relajados a los lados.',
      'Cinta alrededor del punto más ancho de los deltoides.',
      'Requiere ayuda de otra persona para mantenerla horizontal.',
    ],
    tip: 'No eleves los hombros ni abras los dorsales.',
  },
  {
    id: 'cuello',
    label: 'Cuello',
    tier: 'opcional',
    bilateral: false,
    reflects: 'Trapecio superior y grasa cervical',
    steps: [
      'De pie, mirada al frente, cuello relajado.',
      'Cinta justo debajo de la nuez (cartílago tiroides).',
      'Ligeramente inclinada hacia abajo por delante.',
    ],
    tip: 'No tenses el cuello ni bajes el mentón.',
  },
  {
    id: 'antebrazo',
    label: 'Antebrazo',
    tier: 'opcional',
    bilateral: true,
    reflects: 'Flexores y extensores del antebrazo',
    steps: [
      'Brazo colgando relajado, palma hacia delante.',
      'Desliza la cinta cerca del codo hasta encontrar la parte más gruesa.',
      'Registra el valor máximo.',
    ],
    tip: 'Mano abierta y relajada, sin cerrar el puño.',
  },
  {
    id: 'abdomen',
    label: 'Abdomen (ombligo)',
    tier: 'opcional',
    bilateral: false,
    reflects: 'Grasa abdominal baja',
    steps: [
      'De pie, abdomen relajado.',
      'Cinta horizontal a la altura del ombligo.',
      'Mide al final de una exhalación normal.',
    ],
    tip: 'Mismo punto que la cintura en algunas personas: mídelo igual por separado.',
  },
];

export const SITE_BY_ID: Record<MeasurementSiteId, MeasurementSiteDef> = Object.fromEntries(
  MEASUREMENT_SITES.map((s) => [s.id, s]),
) as Record<MeasurementSiteId, MeasurementSiteDef>;

export const SIDE_LABELS: Record<MeasurementSide, string> = {
  left: 'Izq.',
  right: 'Der.',
  center: '',
};

/** Protocol shown before every measurement session */
export const MEASUREMENT_PROTOCOL: string[] = [
  'Por la mañana, en ayunas, después de ir al baño y antes de entrenar.',
  'Cinta métrica que no se estire (idealmente con retracción automática).',
  'Cinta paralela al suelo, ajustada a la piel sin hundirla.',
  'Músculo relajado, salvo en el brazo contraído.',
  'Dos tomas por punto; si difieren más de 5 mm, haz una tercera.',
  'Repite cada 2 a 4 semanas: medir más seguido solo registra ruido.',
];

/** Differences smaller than this (cm) are likely measurement error */
export const MEASUREMENT_NOISE_CM = 0.5;

/** Readings differing by more than this (cm) call for a third reading */
export const READING_TOLERANCE_CM = 0.5;

/** Mean of 1–2 readings, median of 3. */
export function readingsValue(readings: number[] | undefined): number | undefined {
  const valid = (readings ?? []).filter((n) => Number.isFinite(n) && n > 0);
  if (valid.length === 0) return undefined;
  if (valid.length >= 3) {
    const sorted = [...valid].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  }
  return valid.reduce((s, n) => s + n, 0) / valid.length;
}

/** Final value per side for a site in a measurement (cm, rounded to 1 decimal). */
export function siteSideValue(
  m: BodyMeasurement,
  site: MeasurementSiteId,
  side: MeasurementSide,
): number | undefined {
  const v = readingsValue(m.values[site]?.[side]);
  return v == null ? undefined : Math.round(v * 10) / 10;
}

export function sidesForSite(def: MeasurementSiteDef): MeasurementSide[] {
  return def.bilateral ? ['left', 'right'] : ['center'];
}

/** Today's date as yyyy-mm-dd in local time. */
export function localISODate(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Measurements from the last `weeksBack` weeks (0 = all). */
export function measurementsInRange<T extends { date: string }>(list: T[], weeksBack: number): T[] {
  if (weeksBack === 0) return list;
  const cutoff = localISODate(new Date(Date.now() - weeksBack * 7 * 86_400_000));
  return list.filter((m) => m.date >= cutoff);
}

/** Formats a yyyy-mm-dd date (local) for display. */
export function fmtMeasurementDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(
    'es-ES',
    opts ?? { day: 'numeric', month: 'short', year: '2-digit' },
  );
}

/** Parses user input accepting both "35.5" and "35,5". */
export function parseCm(raw: string): number | undefined {
  const n = parseFloat(raw.replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** Single representative value: center, or mean of the available sides. */
export function siteValue(m: BodyMeasurement, site: MeasurementSiteId): number | undefined {
  const sides = sidesForSite(SITE_BY_ID[site]);
  const vals = sides
    .map((side) => siteSideValue(m, site, side))
    .filter((v): v is number => v != null);
  if (vals.length === 0) return undefined;
  return Math.round((vals.reduce((s, n) => s + n, 0) / vals.length) * 10) / 10;
}

// ── Body composition (fat % / muscle %) ───────────────────────────────────────
//
// Recorded separately from circumferences: values come from an external device
// or method (bioimpedance scale, DEXA, skinfolds…). Different methods are not
// comparable with each other, so the method is stored with each entry.

export type CompositionMethod = 'bioimpedancia' | 'dexa' | 'pliegues' | 'otro';

export const COMPOSITION_METHOD_LABELS: Record<CompositionMethod, string> = {
  bioimpedancia: 'Bioimpedancia',
  dexa: 'DEXA',
  pliegues: 'Pliegues',
  otro: 'Otro',
};

export interface BodyComposition {
  id: string;
  userId?: string;
  /** ISO date (yyyy-mm-dd) */
  date: string;
  method: CompositionMethod;
  fatPct?: number;
  musclePct?: number;
  weightKg?: number;
  notes?: string;
  createdAt: string;
}

/** Conditions that keep bioimpedance readings comparable between days */
export const COMPOSITION_PROTOCOL: string[] = [
  'Usa siempre el mismo equipo y el mismo método.',
  'Por la mañana, en ayunas y después de ir al baño.',
  'Antes de entrenar, sin haber sudado ni tomado una ducha caliente.',
  'Bien hidratado y sin alcohol en las 24 h previas.',
  'Pies y manos limpios y secos sobre los electrodos.',
];

export const FAT_PCT_RANGE = { min: 2, max: 70 } as const;
export const MUSCLE_PCT_RANGE = { min: 10, max: 75 } as const;
