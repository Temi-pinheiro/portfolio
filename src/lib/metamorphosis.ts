// The Mariposa steps' figure: the landing's ASCII butterfly, driven by scroll
// through its life cycle, one form per step, ending on the landing's own pose.
// An egg (the Teardown), a caterpillar (the Audit), a chrysalis (the Build),
// the adult just out with its wings still folded and crumpled (the Re-Audit),
// and the butterfly (the Keep). Between steps, the points of one form flow
// into the next. Every form is a cloud of N points, so any two can be blended point for
// point. No DOM here.

import { extentOf, getModel, KIND, poseAt, TILT, type Grid } from './butterfly';

const N = 12000;
// Points pair up between forms in this many bands, so the top of one form
// flows to the top of the next rather than across it.
const BANDS = 80;
const DEPTH = 5.5;
const RADIUS = 1.6;
const LIGHT = normalize(-0.25, 0.35, 0.9);

function normalize(x: number, y: number, z: number) {
  const l = Math.hypot(x, y, z) || 1;
  return [x / l, y / l, z / l] as const;
}

const random = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Dense samples, 8 numbers each: x y z, the normal, tone, and one spare
// (a butterfly sample's kind, a caterpillar sample's place along its body).

// A ribbed egg, narrower at the top.
const egg = () => {
  const pts: number[] = [];
  const rx = 0.5;
  const ry = 0.66;
  for (let s = 0.02; s < Math.PI; s += 0.016) {
    const ring = Math.max(8, Math.round(Math.sin(s) * 300));
    for (let k = 0; k < ring; k++) {
      const a = (k / ring) * Math.PI * 2;
      const r = rx * Math.sin(s) * (1 - 0.14 * Math.cos(s)) * (1 + 0.025 * Math.cos(a * 18));
      const x = r * Math.cos(a);
      const z = r * Math.sin(a);
      const y = ry * Math.cos(s);
      const [nx, ny, nz] = normalize(x / (rx * rx), y / (ry * ry), z / (rx * rx));
      pts.push(x, y, z, nx, ny, nz, 0.8 + 0.2 * Math.cos(a * 18), 0);
    }
  }
  return pts;
};

// A banded caterpillar lying along x, tail at -x and head at +x, with stubby
// legs underneath and two short filaments at the head.
const LARVA = 1.3;
const larva = () => {
  const pts: number[] = [];
  const R = 0.22;
  const radius = (u: number) => {
    const seg = 0.86 + 0.14 * Math.sqrt(Math.abs(Math.sin(Math.PI * u * 11)));
    const tail = u < 0.07 ? Math.sqrt(u / 0.07) : 1;
    const head = u > 0.92 ? Math.sqrt(Math.max(0, 1 - ((u - 0.92) / 0.08) ** 2)) * 1.05 : 1;
    return R * seg * tail * head;
  };
  for (let u = 0; u <= 1; u += 0.002) {
    const r = radius(u);
    const ring = Math.max(6, Math.round((r / R) * 160));
    const groove = Math.abs(Math.sin(Math.PI * u * 11)) < 0.22;
    const band = 0.5 + 0.5 * Math.cos(u * 11 * Math.PI * 2);
    for (let k = 0; k < ring; k++) {
      const p = (k / ring) * Math.PI * 2;
      const y = r * Math.cos(p);
      const z = r * Math.sin(p);
      const tone = u > 0.92 ? 0.5 : groove ? 0.42 : 0.62 + 0.38 * band;
      pts.push(-LARVA + 2 * LARVA * u, y, z, 0, Math.cos(p), Math.sin(p), tone, u);
    }
  }
  for (let leg = 0; leg < 9; leg++) {
    const u = [0.2, 0.28, 0.36, 0.44, 0.52, 0.6, 0.76, 0.84, 0.9][leg];
    for (const side of [-1, 1]) {
      for (let d = 0; d < 0.1; d += 0.006) {
        for (let k = 0; k < 10; k++) {
          const a = (k / 10) * Math.PI * 2;
          const x = -LARVA + 2 * LARVA * u + 0.025 * Math.cos(a);
          pts.push(x, -radius(u) * 0.85 - d, side * 0.09 + 0.025 * Math.sin(a), Math.cos(a), 0, Math.sin(a), 0.5, u);
        }
      }
    }
  }
  for (const side of [-1, 1]) {
    for (let t = 0; t <= 1; t += 0.008) {
      const x = LARVA - 0.08 + 0.22 * t;
      const y = 0.12 + 0.3 * t - 0.12 * t * t;
      pts.push(x, y, side * (0.06 + 0.06 * t), 0, 0, 1, 0.7, 1);
    }
  }
  return pts;
};

// A chrysalis hanging from a twig: a stalk, a crown with a dark line and pale
// dots, and a body that swells and tapers to a point.
const PIVOT = 1.02;
const pupa = () => {
  const pts: number[] = [];
  const radius = (v: number) => {
    if (v < 0.05) return 0.04;
    const w = (v - 0.05) / 0.95;
    const waist = 1 - 0.1 * Math.exp(-(((w - 0.24) / 0.05) ** 2));
    return Math.max(0.04 * (1 - w), 0.38 * Math.sin(Math.PI * w ** 0.8) ** 0.75 * waist);
  };
  for (let v = 0; v <= 1; v += 0.0025) {
    const r = radius(v);
    const y = 0.95 - 1.95 * v;
    const slope = (radius(Math.min(1, v + 0.005)) - radius(Math.max(0, v - 0.005))) / (1.95 * 0.01);
    const ring = Math.max(8, Math.round((r / 0.38) * 220));
    const w = (v - 0.05) / 0.95;
    for (let k = 0; k < ring; k++) {
      const a = (k / ring) * Math.PI * 2;
      const [nx, ny, nz] = normalize(Math.cos(a), slope, Math.sin(a));
      let tone = 0.86 * (0.9 + 0.1 * Math.cos(a * 3 + w * 8));
      if (Math.abs(w - 0.24) < 0.012) tone = 0.32;
      else if (Math.abs(w - 0.28) < 0.015 && Math.cos(a * 9) > 0.86) tone = 1;
      pts.push(r * Math.cos(a), y, r * Math.sin(a), nx, ny, nz, tone, 0);
    }
  }
  for (let x = -0.75; x <= 0.75; x += 0.006) {
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2;
      pts.push(x, PIVOT + 0.05 * Math.cos(a), 0.05 * Math.sin(a), 0, Math.cos(a), Math.sin(a), 0.6, 1);
    }
  }
  return pts;
};

type Shape = { base: Float32Array; thin: Float32Array };

// N samples drawn from a dense set without repeats, then ordered: by the
// primary key, and within each band by the secondary.
const resample = (
  dense: ArrayLike<number>,
  primary: (d: ArrayLike<number>, o: number) => number,
  secondary: (d: ArrayLike<number>, o: number) => number,
  thin: (d: ArrayLike<number>, o: number) => number,
  seed: number
): Shape => {
  const count = dense.length / 8;
  const rand = random(seed);
  const pool = Array.from({ length: count }, (_, i) => i);
  for (let i = 0; i < N; i++) {
    const j = i + Math.floor(rand() * (count - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const picks = pool.slice(0, N).sort((a, b) => primary(dense, a * 8) - primary(dense, b * 8));
  const size = N / BANDS;
  for (let b = 0; b < BANDS; b++) {
    const band = picks.slice(b * size, (b + 1) * size);
    band.sort((a, c) => secondary(dense, a * 8) - secondary(dense, c * 8));
    picks.splice(b * size, size, ...band);
  }
  const base = new Float32Array(N * 8);
  const thinOut = new Float32Array(N);
  picks.forEach((p, i) => {
    for (let k = 0; k < 8; k++) base[i * 8 + k] = dense[p * 8 + k];
    thinOut[i] = thin(dense, p * 8);
  });
  return { base, thin: thinOut };
};

const top = (d: ArrayLike<number>, o: number) => -d[o + 1];
const around = (d: ArrayLike<number>, o: number) => Math.atan2(d[o + 2], d[o]);
const solid = () => 0;

// The pairing runs egg top → caterpillar tail → chrysalis top → butterfly top:
// the egg unrolls into the caterpillar, the caterpillar hangs from its tail.
const SHAPES = {
  egg: () => resample(egg(), top, around, solid, 1),
  larva: () =>
    resample(larva(), (d, o) => d[o], (d, o) => Math.atan2(d[o + 2], d[o + 1]), solid, 2),
  pupa: () => resample(pupa(), top, around, solid, 3),
  butterfly: () =>
    resample(
      getModel(),
      top,
      (d, o) => d[o],
      (d, o) => (d[o + 7] === KIND.WING || d[o + 7] === KIND.EDGE ? 1 : 0),
      4
    ),
};
type ShapeName = keyof typeof SHAPES;

// The whole figure's turn and place: yaw about y, pitch about x, then roll
// about the view axis (clockwise, as the landing's tilt), scale and shift.
type Rig = { yaw: number; pitch: number; roll: number; scale: number; x: number; y: number };
type Wings = { flap: number; spread: number; crumple: number };
type ButterflyPose = Rig & Wings;

const rigger = (r: Rig) => {
  const cy = Math.cos(r.yaw);
  const sy = Math.sin(r.yaw);
  const cp = Math.cos(r.pitch);
  const sp = Math.sin(r.pitch);
  const cr = Math.cos(r.roll);
  const sr = Math.sin(r.roll);
  const turn = (x: number, y: number, z: number, out: Float32Array, o: number) => {
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    const y2 = y * cp - z1 * sp;
    out[o + 2] = y * sp + z1 * cp;
    out[o] = x1 * cr + y2 * sr;
    out[o + 1] = -x1 * sr + y2 * cr;
  };
  return {
    point: (x: number, y: number, z: number, out: Float32Array, o: number) => {
      turn(x * r.scale, y * r.scale, z * r.scale, out, o);
      out[o] += r.x;
      out[o + 1] += r.y;
    },
    normal: turn,
  };
};

const placeButterfly = (
  shape: Shape,
  pose: ButterflyPose,
  pos: Float32Array,
  nrm: Float32Array
) => {
  const { base } = shape;
  const rig = rigger(pose);
  const cf = Math.cos(pose.flap);
  const sf = Math.sin(pose.flap);
  for (let i = 0; i < N; i++) {
    const o = i * 8;
    const kind = base[o + 7];
    let x = base[o];
    let y = base[o + 1];
    let z = base[o + 2];
    let nx = base[o + 3];
    let ny = base[o + 4];
    let nz = base[o + 5];
    if (kind === KIND.WING || kind === KIND.EDGE) {
      // In the wing's own plane: out along u, up along v, and w off the
      // plane where it's still crumpled. Then the wing turns about the body.
      const side = x < 0 ? -1 : 1;
      const u = Math.abs(x) * pose.spread;
      const v = y * pose.spread;
      const reach = Math.min(1, u * 2);
      const w = pose.crumple * reach * Math.sin(u * 21 + v * 13);
      const dwu = pose.crumple * reach * 21 * Math.cos(u * 21 + v * 13);
      const dwv = pose.crumple * reach * 13 * Math.cos(u * 21 + v * 13);
      x = side * (u * cf - w * sf);
      z = u * sf + w * cf;
      y = v;
      const [a, b, c] = normalize(-dwu, -dwv, 1);
      nx = side * (a * cf - c * sf);
      ny = b;
      nz = a * sf + c * cf;
    }
    rig.point(x, y, z, pos, i * 3);
    rig.normal(nx, ny, nz, nrm, i * 3);
  }
};

type Point = { x: number; y: number };

const placeSolid = (
  name: Exclude<ShapeName, 'butterfly'>,
  shape: Shape,
  t: number,
  centre: Point,
  pos: Float32Array,
  nrm: Float32Array
) => {
  const { base } = shape;
  const rig = rigger(
    name === 'egg'
      ? { yaw: t * 0.35, pitch: -0.32, roll: 0.12, scale: 1.6, x: 0, y: 0.05 * Math.sin(t * 1.2) }
      : name === 'larva'
        ? { yaw: -0.55 + 0.15 * Math.sin(t * 0.35), pitch: -0.5, roll: 0.05, scale: 1.12, x: 0, y: -0.05 }
        : { yaw: 0.3 * Math.sin(t * 0.3), pitch: -0.12, roll: 0, scale: 1.25, x: 0, y: -0.15 }
  );
  const shift = { x: centre.x, y: centre.y };
  // The caterpillar crawls: a hump runs from tail to head. The chrysalis
  // swings a little from its twig.
  const hump = ((t * 0.32) % 1.4) - 0.2;
  const swing = 0.07 * Math.sin(t * 0.9);
  const cs = Math.cos(swing);
  const ss = Math.sin(swing);
  for (let i = 0; i < N; i++) {
    const o = i * 8;
    let x = base[o];
    let y = base[o + 1];
    let nx = base[o + 3];
    let ny = base[o + 4];
    if (name === 'larva') {
      y += 0.17 * Math.exp(-(((base[o + 7] - hump) / 0.09) ** 2));
    } else if (name === 'pupa' && base[o + 7] === 0) {
      const dy = y - PIVOT;
      [x, y] = [x * cs - dy * ss, PIVOT + x * ss + dy * cs];
      [nx, ny] = [nx * cs - ny * ss, nx * ss + ny * cs];
    }
    rig.point(x, y, base[o + 2], pos, i * 3);
    pos[i * 3] += shift.x;
    pos[i * 3 + 1] += shift.y;
    rig.normal(nx, ny, base[o + 5], nrm, i * 3);
  }
};

const lerpPose = (a: ButterflyPose, b: ButterflyPose, m: number): ButterflyPose => {
  const out = { ...a };
  for (const k of Object.keys(a) as (keyof ButterflyPose)[]) out[k] = a[k] + (b[k] - a[k]) * m;
  return out;
};

// The landing's pose: its flap, bob, sway and pitch, and its tilt.
const home = (t: number): ButterflyPose => {
  const p = poseAt(t);
  return { flap: p.flap, spread: 1, crumple: 0, yaw: p.sway, pitch: p.pitch, roll: TILT, scale: 1, x: 0, y: p.bob };
};

const LIFE: ShapeName[] = ['egg', 'larva', 'pupa', 'butterfly', 'butterfly'];

// The adult just out of the chrysalis: hanging head up, wings closed over its
// back, smaller and crumpled, pumping slowly as they fill.
const emerging = (t: number): ButterflyPose => ({
  flap: 1.42 + 0.05 * Math.sin(t * 1.7),
  spread: 0.8,
  crumple: 0.025,
  yaw: 1.0 + 0.12 * Math.sin(t * 0.4),
  pitch: -0.12,
  roll: 0.05,
  scale: 1,
  x: 0,
  y: 0.05,
});

export const createFigure = () => {
  const shapes: Partial<Record<ShapeName, Shape>> = {};
  const shapeOf = (name: ShapeName) => (shapes[name] ??= SHAPES[name]());
  const posA = new Float32Array(N * 3);
  const nrmA = new Float32Array(N * 3);
  const posB = new Float32Array(N * 3);
  const nrmB = new Float32Array(N * 3);
  // A fixed drift per point, for the dust between forms.
  const rand = random(9);
  const drift = Float32Array.from({ length: N * 3 }, () => rand() * 2 - 1);
  // The landing's framing, so the last step matches it. The tilted
  // butterfly's box isn't centred on its body, so every other form is
  // placed at the box's centre instead of the origin.
  const extent = extentOf(getModel());
  const centre = { x: (extent.minX + extent.maxX) / 2, y: (extent.minY + extent.maxY) / 2 };
  const centred = (p: ButterflyPose) => ({ ...p, x: p.x + centre.x, y: p.y + centre.y });
  // The butterfly's pose at a step: anywhere but the last, centred.
  const poseOf = (step: number, t: number) =>
    step === 4 ? home(t) : centred(emerging(t));

  const place = (step: number, t: number, pos: Float32Array, nrm: Float32Array) => {
    const name = LIFE[step];
    if (name === 'butterfly') placeButterfly(shapeOf(name), poseOf(step, t), pos, nrm);
    else placeSolid(name, shapeOf(name), t, centre, pos, nrm);
  };

  return {
    extent,

    // Draws the figure at step s (0–4; fractions are between steps) and time
    // t into the grid's depth and brightness.
    render(s: number, t: number, g: Grid) {
      const from = Math.min(3, Math.floor(s));
      const m = Math.min(1, s - from);
      const a = LIFE[from];
      const b = LIFE[from + 1];
      const shapeB = shapeOf(b);
      // What's in posA: form a, or form b once the blend is done.
      let shapeA = shapeOf(a);
      let blend = 0;

      if (m < 0.001) {
        place(from, t, posA, nrmA);
      } else if (m > 0.999) {
        place(from + 1, t, posA, nrmA);
        shapeA = shapeB;
      } else if (a === 'butterfly' && b === 'butterfly') {
        // The same points either side, so blend the pose, not the points:
        // the wings unfold and turn rather than sliding in straight lines.
        const p = lerpPose(poseOf(from, t), poseOf(from + 1, t), smooth(0, 1, m));
        placeButterfly(shapeOf('butterfly'), p, posA, nrmA);
      } else {
        place(from, t, posA, nrmA);
        place(from + 1, t, posB, nrmB);
        blend = m;
      }

      g.depth.fill(0);
      for (let i = 0; i < N; i++) {
        const o = i * 3;
        let x = posA[o];
        let y = posA[o + 1];
        let z = posA[o + 2];
        let nx = nrmA[o];
        let ny = nrmA[o + 1];
        let nz = nrmA[o + 2];
        let tone = shapeA.base[i * 8 + 6];
        let thin = shapeA.thin[i];
        if (blend > 0) {
          // Points leave top first, and lift off into dust on the way.
          const k = smooth(0, 1, (blend - 0.35 * (i / N)) / 0.65);
          const dust = 0.14 * Math.sin(Math.PI * k);
          x += (posB[o] - x) * k + drift[o] * dust;
          y += (posB[o + 1] - y) * k + drift[o + 1] * dust;
          z += (posB[o + 2] - z) * k + drift[o + 2] * dust;
          nx += (nrmB[o] - nx) * k;
          ny += (nrmB[o + 1] - ny) * k;
          nz += (nrmB[o + 2] - nz) * k;
          tone += (shapeB.base[i * 8 + 6] - tone) * k;
          thin += (shapeB.thin[i] - thin) * k;
        }
        const w = 1 / (DEPTH - z);
        const col = Math.floor((g.cx + g.unit * DEPTH * x * w) / g.cellW);
        const row = Math.floor((g.cy - g.unit * DEPTH * y * w) / g.cellH);
        if (col < 0 || col >= g.cols || row < 0 || row >= g.rows) continue;
        const cell = row * g.cols + col;
        if (w <= g.depth[cell]) continue;
        g.depth[cell] = w;
        const [lx, ly, lz] = normalize(nx, ny, nz);
        const dot = lx * LIGHT[0] + ly * LIGHT[1] + lz * LIGHT[2];
        // Thin wings catch the light on both faces; solid forms on one.
        const light = (0.3 + 0.7 * Math.max(0, dot)) * (1 - thin) + (0.45 + 0.55 * Math.abs(dot)) * thin;
        g.lum[cell] = tone * light * (0.78 + 0.22 * (z / RADIUS));
      }
    },
  };
};

// The form at each step of the life cycle, for the caption.
export const LIFE_NAMES = ['Egg', 'Caterpillar', 'Chrysalis', 'Emerging', 'Mariposa'];
