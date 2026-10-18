// The mariposa: a point-sampled 3D butterfly, z-buffered into a grid of cells
// and drawn as mono characters. The landing's canvas animates it; the icons,
// Open Graph images and Whop cards are still frames of the same model, so it
// is one butterfly everywhere. No DOM here, so servers and scripts can use it.

export const RAMP = '.,:;-=+*#%@';
const STEP = 0.018; // sample spacing in model units
const DEPTH = 5.5; // camera distance
const RADIUS = 1.6; // the model's rough bounding radius
const LIGHT = normalize(-0.25, 0.35, 0.9);
// It leans 15° clockwise, head to the right, as if banking into a turn.
export const TILT = (15 * Math.PI) / 180;
// The still frame, in seconds: wings nearly open, so the shape reads.
export const STILL = 0.6;

const BODY = 0;
const WING = 1;
const ANTENNA = 2;
// The wing's patterned margin, where the pollen sheds from.
const EDGE = 3;

function normalize(x: number, y: number, z: number) {
  const l = Math.hypot(x, y, z);
  return [x / l, y / l, z / l] as const;
}

// The right wings as outlines, root at the origin: a forewing with a pointed
// apex and a straight outer edge, and a rounded hindwing below it. The left
// wings mirror them.
const FOREWING = [
  [0.05, 0.1], [0.35, 0.55], [0.8, 0.95], [1.25, 1.2], [1.55, 1.25],
  [1.6, 1.05], [1.45, 0.6], [1.2, 0.2], [0.85, 0], [0.4, -0.05], [0.05, -0.05],
];
const HINDWING = [
  [0.05, -0.05], [0.5, -0.05], [0.95, -0.2], [1.15, -0.5], [1.05, -0.85],
  [0.8, -1.1], [0.5, -1.15], [0.25, -0.95], [0.08, -0.6],
];

const inside = (shape: number[][], u: number, v: number) => {
  let hit = false;
  for (let i = 0, j = shape.length - 1; i < shape.length; j = i++) {
    const [ui, vi] = shape[i];
    const [uj, vj] = shape[j];
    if (vi > v !== vj > v && u < ((uj - ui) * (v - vi)) / (vj - vi) + ui) hit = !hit;
  }
  return hit;
};

const edgeDistance = (shape: number[][], u: number, v: number) => {
  let best = Infinity;
  for (let i = 0, j = shape.length - 1; i < shape.length; j = i++) {
    const [ui, vi] = shape[i];
    const [uj, vj] = shape[j];
    const du = uj - ui;
    const dv = vj - vi;
    const k = Math.max(0, Math.min(1, ((u - ui) * du + (v - vi) * dv) / (du * du + dv * dv)));
    best = Math.min(best, Math.hypot(u - ui - k * du, v - vi - k * dv));
  }
  return best;
};

// The wing's pattern, as a brightness multiplier: a dark margin with pale
// spots, an eyespot on each wing, faint veins, and a darker root.
const wingTone = (shape: number[][], u: number, v: number, edge: number) => {
  const a = Math.atan2(v, u);
  const r = Math.hypot(u, v);
  let tone = 0.88;
  if (edge < 0.13) tone = Math.cos(a * 26) > 0.55 && edge > 0.04 ? 1 : 0.32;
  else if (r < 0.3) tone = 0.55;
  const eye = shape === FOREWING ? Math.hypot(u - 1.05, v - 0.78) : Math.hypot(u - 0.68, v + 0.62);
  if (eye < 0.07) tone = 0.25;
  else if (eye < 0.15) tone = 1;
  return tone * (0.84 + 0.16 * Math.cos(a * 16));
};

// Every sample as [x, y, z, nx, ny, nz, tone, kind], in model space: the body
// runs along y (head up), the wings lie flat in the x-y plane, and the back
// faces +z.
const buildModel = () => {
  const pts: number[] = [];
  for (let u = 0.05; u <= 1.62; u += STEP) {
    for (let v = -1.2; v <= 1.3; v += STEP) {
      const shape = inside(FOREWING, u, v)
        ? FOREWING
        : inside(HINDWING, u, v)
          ? HINDWING
          : null;
      if (!shape) continue;
      const edge = edgeDistance(shape, u, v);
      const tone = wingTone(shape, u, v, edge);
      const kind = edge < 0.13 ? EDGE : WING;
      pts.push(u, v, 0, 0, 0, 1, tone, kind, -u, v, 0, 0, 0, 1, tone, kind);
    }
  }
  const ellipsoid = (cy: number, rx: number, ry: number, tone: number) => {
    for (let s = 0; s <= Math.PI; s += 0.06) {
      for (let t = 0; t < Math.PI * 2; t += 0.12) {
        const [nx, ny, nz] = normalize(
          (Math.sin(s) * Math.cos(t)) / rx,
          Math.cos(s) / ry,
          (Math.sin(s) * Math.sin(t)) / rx,
        );
        pts.push(
          rx * Math.sin(s) * Math.cos(t),
          cy + ry * Math.cos(s),
          rx * Math.sin(s) * Math.sin(t),
          nx,
          ny,
          nz,
          tone,
          BODY,
        );
      }
    }
  };
  ellipsoid(-0.25, 0.075, 0.65, 0.9);
  ellipsoid(0.56, 0.1, 0.1, 0.9);
  for (const side of [-1, 1]) {
    for (let t = 0; t <= 1; t += 0.012) {
      // A quadratic curve out of the head, ending in a small club.
      const x = side * (2 * (1 - t) * t * 0.08 + t * t * 0.38 + (1 - t) ** 2 * 0.04);
      const y = (1 - t) ** 2 * 0.62 + 2 * (1 - t) * t * 1.05 + t * t * 1.3;
      const z = 0.02 + t * 0.08;
      pts.push(x, y, z, 0, 0, 1, t > 0.94 ? 1 : 0.7, ANTENNA);
    }
  }
  return new Float32Array(pts);
};

let model: Float32Array | null = null;
export const getModel = () => (model ??= buildModel());

// The indices of the wing-margin samples in the open, where pollen can fall
// without the other wing hiding it: the hindwings' lower edges and the
// forewings' outer tips.
export const shedPoints = (m: Float32Array) => {
  const out: number[] = [];
  for (let i = 0; i < m.length / 8; i++) {
    const o = i * 8;
    if (m[o + 7] === EDGE && (m[o + 1] < -0.5 || Math.abs(m[o]) > 1.3)) out.push(i);
  }
  return out;
};

export type Lean = { x: number; y: number };
export type Pose = { flap: number; bob: number; sway: number; pitch: number };

// Wings beat in a soft pulse every 3.2s and the body bobs against them, while
// the whole figure sways slowly and leans toward the pointer.
export const poseAt = (t: number, lean: Lean = { x: 0, y: 0 }): Pose => {
  const beat = (0.5 - 0.5 * Math.cos((t * Math.PI * 2) / 3.2)) ** 1.3;
  return {
    flap: 0.05 + 0.55 * beat,
    bob: 0.07 * Math.sin(t * 0.9) - 0.04 * beat,
    sway: 0.22 * Math.sin((t * Math.PI * 2) / 16) + lean.x * 0.12,
    pitch: -0.3 + 0.06 * Math.sin(t * 0.7) + lean.y * 0.08,
  };
};

// Places sample i in the pose and on the picture plane: x and y in model
// units (y up, tilted), w as 1/distance for the z-buffer. `shade` then lights
// the sample last placed.
export const projector = (m: Float32Array, pose: Pose, tilt = TILT) => {
  const cf = Math.cos(pose.flap);
  const sf = Math.sin(pose.flap);
  const cs = Math.cos(pose.sway);
  const ss = Math.sin(pose.sway);
  const cp = Math.cos(pose.pitch);
  const sp = Math.sin(pose.pitch);
  const ct = Math.cos(tilt);
  const st = Math.sin(tilt);
  const out = { x: 0, y: 0, w: 0 };
  let o = 0;
  let vz = 0;
  let nx = 0;
  let nz = 0;

  const place = (i: number) => {
    o = i * 8;
    let x = m[o];
    let z = m[o + 2];
    nx = m[o + 3];
    nz = m[o + 5];
    const kind = m[o + 7];
    if (kind === WING || kind === EDGE) {
      // Each wing turns about the body, so the tips rise toward +z.
      const side = x < 0 ? -1 : 1;
      const reach = Math.abs(x);
      x = side * reach * cf;
      z = reach * sf;
      nx = -side * sf;
      nz = cf;
    }
    // Sway about the body, then pitch the head away a little.
    const wx = x * cs + z * ss;
    const wz = -x * ss + z * cs;
    const vy = m[o + 1] * cp - wz * sp + pose.bob;
    vz = m[o + 1] * sp + wz * cp;
    out.w = 1 / (DEPTH - vz);
    const px = DEPTH * wx * out.w;
    const py = DEPTH * vy * out.w;
    out.x = px * ct + py * st;
    out.y = -px * st + py * ct;
    return out;
  };

  const shade = () => {
    const kind = m[o + 7];
    let light = 0.7;
    if (kind !== ANTENNA) {
      const ny = m[o + 4];
      const mx = nx * cs + nz * ss;
      const mz = -nx * ss + nz * cs;
      const my = ny * cp - mz * sp;
      const mw = ny * sp + mz * cp;
      const dot = mx * LIGHT[0] + my * LIGHT[1] + mw * LIGHT[2];
      // Wings are thin, so both faces catch the light.
      light = kind === BODY ? 0.3 + 0.7 * Math.max(0, dot) : 0.45 + 0.55 * Math.abs(dot);
    }
    // Nearer samples read a little brighter, for depth.
    return m[o + 6] * light * (0.78 + 0.22 * (vz / RADIUS));
  };

  return { place, shade };
};

export type Extent = { minX: number; maxX: number; minY: number; maxY: number };

// A full 16s cycle of the motion, a quarter second apart.
const CYCLE = Array.from({ length: 64 }, (_, k) => k / 4);

// The tilted figure's extent at the given times (by default the whole cycle),
// so a frame can be sized to fill its box without clipping a raised wing.
export const extentOf = (m: Float32Array, times = CYCLE, tilt = TILT): Extent => {
  const e = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
  for (const t of times) {
    const { place } = projector(m, poseAt(t), tilt);
    for (let i = 0; i < m.length / 8; i += 3) {
      const p = place(i);
      e.minX = Math.min(e.minX, p.x);
      e.maxX = Math.max(e.maxX, p.x);
      e.minY = Math.min(e.minY, p.y);
      e.maxY = Math.max(e.maxY, p.y);
    }
  }
  return e;
};

export type Grid = {
  cols: number;
  rows: number;
  cellW: number;
  cellH: number;
  unit: number; // pixels per model unit
  cx: number; // where the model's origin lands, in pixels
  cy: number;
  depth: Float32Array; // per cell, 0 when empty
  lum: Float32Array;
};

// Fits the figure's extent into a w × h box: `fill` of the box at most, with
// its centre at (ax, ay) as fractions of the box.
export const fit = (e: Extent, w: number, h: number, fill: number, ax = 0.5, ay = 0.5) => {
  const unit = Math.min((w * fill) / (e.maxX - e.minX), (h * fill) / (e.maxY - e.minY));
  return {
    unit,
    cx: w * ax - (unit * (e.minX + e.maxX)) / 2,
    cy: h * ay + (unit * (e.minY + e.maxY)) / 2,
  };
};

export const rasterize = (m: Float32Array, pose: Pose, g: Grid, tilt = TILT) => {
  g.depth.fill(0);
  const { place, shade } = projector(m, pose, tilt);
  for (let i = 0; i < m.length / 8; i++) {
    const p = place(i);
    const col = Math.floor((g.cx + g.unit * p.x) / g.cellW);
    const row = Math.floor((g.cy - g.unit * p.y) / g.cellH);
    if (col < 0 || col >= g.cols || row < 0 || row >= g.rows) continue;
    const cell = row * g.cols + col;
    if (p.w <= g.depth[cell]) continue;
    g.depth[cell] = p.w;
    g.lum[cell] = shade();
  }
};

// A cell's brightness, lifted by a soft curve so mid-tones reach the denser
// characters, and the character for it.
export const level = (lum: number) => Math.min(1, Math.max(0, lum)) ** 0.8;
export const glyph = (l: number) => RAMP[Math.min(RAMP.length - 1, Math.floor(l * RAMP.length))];

// A still frame as text, for drawing the butterfly without a canvas: one
// string per row, and each cell's level (-1 where empty). `aspect` is a
// cell's height over its width.
export const stillFrame = ({
  cols,
  rows,
  aspect,
  fill = 0.92,
  time = STILL,
}: {
  cols: number;
  rows: number;
  aspect: number;
  fill?: number;
  time?: number;
}) => {
  const m = getModel();
  const g: Grid = {
    cols,
    rows,
    cellW: 1,
    cellH: aspect,
    ...fit(extentOf(m, [time]), cols, rows * aspect, fill),
    depth: new Float32Array(cols * rows),
    lum: new Float32Array(cols * rows),
  };
  rasterize(m, poseAt(time), g);
  const levels = Array.from(g.depth, (d, i) => (d === 0 ? -1 : level(g.lum[i])));
  const lines: string[] = [];
  for (let r = 0; r < rows; r++) {
    let line = '';
    for (let c = 0; c < cols; c++) {
      const l = levels[r * cols + c];
      line += l < 0 ? ' ' : glyph(l);
    }
    lines.push(line);
  }
  return { lines, levels };
};
