import type { MeasurementSiteId } from '@/types/measurement';
import { SITE_BY_ID } from '@/types/measurement';
import { cn } from '@/lib/utils';

// Front-view mannequin drawn from smoothed outlines in a 200×400 viewBox.
// Only the viewer's left half is defined; the right half is mirrored (x → 200 − x).

type Pt = [number, number];

const W = 200;
const mirror = ([x, y]: Pt): Pt => [W - x, y];

/** Closed Catmull-Rom spline through the points, as an SVG path. */
function smoothClosedPath(pts: Pt[]): string {
  const n = pts.length;
  const p = (i: number) => pts[(i + n) % n];
  let d = `M ${p(0)[0]} ${p(0)[1]}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0]} ${p2[1]}`;
  }
  return d + ' Z';
}

// Neck → shoulder → torso side → outer leg → foot → inner leg → crotch
const BODY_LEFT: Pt[] = [
  [91, 48], [90, 64], [76, 70], [62, 76], [60, 90], [64, 104], [65, 130], [71, 160],
  [70, 180], [65, 200], [63, 225], [66, 262], [71, 292], [68, 315], [71, 340], [77, 368],
  [78, 380], [68, 390], [92, 391], [93, 378], [93, 345], [95, 318], [94, 295], [96, 262],
  [98, 232],
];
const BODY = smoothClosedPath([...BODY_LEFT, ...[...BODY_LEFT].reverse().map(mirror)]);

const ARM_RELAXED_LEFT: Pt[] = [
  [63, 74], [52, 80], [47, 95], [45, 120], [44, 145], [41, 170], [39, 195], [38, 212],
  [34, 224], [37, 236], [45, 236], [47, 222], [47, 210], [51, 185], [55, 160], [58, 140],
  [61, 120], [63, 100],
];

// Front double-biceps: upper arm out to the side, forearm vertical, fist up
const ARM_FLEXED_LEFT: Pt[] = [
  [64, 76], [52, 70], [38, 64], [28, 66], [24, 52], [22, 36], [22, 24], [12, 22], [8, 30],
  [8, 50], [10, 70], [14, 84], [30, 90], [48, 94], [62, 100],
];

const armPaths = (left: Pt[]) => [smoothClosedPath(left), smoothClosedPath(left.map(mirror))];
const ARMS_RELAXED = armPaths(ARM_RELAXED_LEFT);
const ARMS_FLEXED = armPaths(ARM_FLEXED_LEFT);

// Tape band per site. Bilateral sites are defined on the left and mirrored.
interface Band { cx: number; cy: number; rx: number; ry: number }

const BANDS: Record<MeasurementSiteId, Band> = {
  cuello:          { cx: 100, cy: 60,  rx: 10, ry: 3 },
  hombros:         { cx: 100, cy: 86,  rx: 56, ry: 5 },
  pecho:           { cx: 100, cy: 104, rx: 37, ry: 4 },
  cintura:         { cx: 100, cy: 162, rx: 29, ry: 4 },
  abdomen:         { cx: 100, cy: 178, rx: 30, ry: 4 },
  cadera:          { cx: 100, cy: 206, rx: 36, ry: 4.5 },
  brazo_contraido: { cx: 54,  cy: 108, rx: 9,  ry: 2.5 },
  brazo_relajado:  { cx: 53,  cy: 124, rx: 9,  ry: 2.5 },
  antebrazo:       { cx: 48,  cy: 165, rx: 8,  ry: 2.5 },
  muslo:           { cx: 81,  cy: 258, rx: 16, ry: 3.5 },
  pantorrilla:     { cx: 82,  cy: 318, rx: 13, ry: 3 },
};

// On the flexed pose the band wraps the horizontal upper arm at the biceps peak
const FLEXED_ARM_BAND: Band = { cx: 38, cy: 79, rx: 4, ry: 14 };

function bandsFor(site: MeasurementSiteId, flexed: boolean): Band[] {
  const b = flexed && site === 'brazo_contraido' ? FLEXED_ARM_BAND : BANDS[site];
  if (!SITE_BY_ID[site].bilateral) return [b];
  return [b, { ...b, cx: W - b.cx }];
}

export interface BodyFigureBand {
  site: MeasurementSiteId;
  /** Tailwind stroke class, e.g. "stroke-primary" */
  className?: string;
}

export default function BodyFigure({
  bands,
  pose = 'relaxed',
  className,
}: {
  bands: BodyFigureBand[];
  pose?: 'relaxed' | 'flexed';
  className?: string;
}) {
  const flexed = pose === 'flexed';
  const arms = flexed ? ARMS_FLEXED : ARMS_RELAXED;

  return (
    <svg viewBox="0 0 200 400" className={cn('h-full w-auto', className)} aria-hidden="true">
      <g className="fill-muted stroke-muted-foreground/40" strokeWidth={1.2} strokeLinejoin="round">
        {arms.map((d) => <path key={d} d={d} />)}
        <path d={BODY} />
        <circle cx={100} cy={30} r={18} />
      </g>
      {bands.flatMap(({ site, className: bandClass }) =>
        bandsFor(site, flexed).map((b, i) => {
          // Split the tape ellipse along its long axis into back and front halves
          const vertical = b.ry > b.rx;
          const [x1, y1, x2, y2] = vertical
            ? [b.cx, b.cy - b.ry, b.cx, b.cy + b.ry]
            : [b.cx - b.rx, b.cy, b.cx + b.rx, b.cy];
          const arc = (sweep: 0 | 1) => `M ${x1} ${y1} A ${b.rx} ${b.ry} 0 0 ${sweep} ${x2} ${y2}`;
          return (
            <g key={`${site}-${i}`} className={cn('stroke-primary', bandClass)} fill="none">
              {/* Back half of the tape: dashed and faint */}
              <path d={arc(vertical ? 0 : 1)} strokeWidth={1.5} strokeDasharray="2 2" opacity={0.5} />
              {/* Front half of the tape */}
              <path d={arc(vertical ? 1 : 0)} strokeWidth={3} strokeLinecap="round" />
            </g>
          );
        }),
      )}
    </svg>
  );
}
