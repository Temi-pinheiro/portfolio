'use client';

import { useEffect, useRef, type CSSProperties, type RefObject } from 'react';
import {
  extentOf,
  fit,
  getModel,
  glyph,
  level,
  poseAt,
  projector,
  rasterize,
  shedPoints,
  STILL,
  type Grid,
} from '~~/lib/butterfly';

// The landing's mariposa (the model is in lib/butterfly), drawn on a canvas in
// the accent blue. It flaps, sways, bobs and leans a little toward the
// pointer, and as its wings open it sheds pollen from their lower edges: ASCII
// specks that drift out, fall and fade. Under reduced motion it draws one
// still frame, with the pollen it would have shed by then.
//
// `ground` is the content the canvas sits behind: the butterfly is fitted
// above it, dipping into its top by DIP of its height and fading there, and
// the pollen fades as it falls through it. It must share the canvas's
// offsetParent. Where that leaves under MIN_ROOM pixels (a short phone), the
// butterfly would be too small to read as one, so it isn't drawn.

const MAX_SPECKS = 160;
const DIP = 0.3;
const MIN_ROOM = 120;
// Specks flutter by swapping between a low and a high mark in their cell, and
// the larger ones glint.
const FLUTTER = ['.', ',', "'", '`'];
const GLINT = ['+', '*'];

type Speck = {
  x: number; // model units, y up, relative to the model's origin
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  phase: number;
  glint: boolean;
};

// A small seeded generator, so the reduced-motion frame comes out the same on
// every redraw.
const random = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const AsciiButterfly = ({
  ground,
  className,
  style,
}: {
  ground?: RefObject<HTMLElement | null>;
  className?: string;
  style?: CSSProperties;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const model = getModel();
    const extent = extentOf(model);
    const shed = shedPoints(model);
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    const dark = window.matchMedia('(prefers-color-scheme: dark)');

    let width = 0;
    let height = 0;
    // Where the ground starts, and how far into it the butterfly may dip.
    let groundTop = Infinity;
    let dip = 0;
    let fits = true;
    let font = '';
    let color = '';
    const grid: Grid = {
      cols: 0,
      rows: 0,
      cellW: 0,
      cellH: 0,
      unit: 0,
      cx: 0,
      cy: 0,
      depth: new Float32Array(0),
      lum: new Float32Array(0),
    };
    // The pointer's pull, eased toward its target every frame.
    const lean = { x: 0, y: 0, tx: 0, ty: 0 };
    let specks: Speck[] = [];
    let rand = random(7);
    let owed = 0; // specks due but not yet emitted
    let lastFlap = poseAt(0).flap;

    // The butterfly fills most of the space above the ground, a little right
    // of centre so a raised wing clears the wordmark. The type scales with it.
    const readStyle = () => {
      const style = getComputedStyle(canvas);
      color = style.color;
      const below = ground?.current;
      if (below && below.offsetParent === canvas.offsetParent) {
        groundTop = below.offsetTop - canvas.offsetTop;
        dip = below.offsetHeight * DIP;
      }
      const room = Math.min(height, groundTop + dip);
      fits = room >= MIN_ROOM;
      Object.assign(grid, fit(extent, width, room, 0.94, 0.56, 0.5));
      const size = Math.min(12, Math.max(8, Math.round(grid.unit / 14)));
      font = `600 ${size}px ${style.fontFamily}`;
      grid.cellW = size * 0.62;
      grid.cellH = size * 1.12;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      readStyle();
      grid.cols = Math.floor(width / grid.cellW);
      grid.rows = Math.floor(height / grid.cellH);
      grid.depth = new Float32Array(grid.cols * grid.rows);
      grid.lum = new Float32Array(grid.cols * grid.rows);
    };

    // Moves the pollen on by dt seconds, shedding new specks from the wing
    // margins as the wings open (when the flap angle falls).
    const step = (t: number, dt: number) => {
      const pose = poseAt(t, lean);
      const opening = Math.max(0, (lastFlap - pose.flap) / dt) / 0.7;
      lastFlap = pose.flap;
      owed += dt * (4 + 36 * opening);
      const { place } = projector(model, pose);
      while (owed >= 1) {
        owed -= 1;
        if (specks.length >= MAX_SPECKS) continue;
        const p = place(shed[Math.floor(rand() * shed.length)]);
        const side = p.x < 0 ? -1 : 1;
        specks.push({
          x: p.x,
          y: p.y,
          vx: side * (0.06 + 0.22 * rand()) * (0.5 + opening),
          vy: -(0.08 + 0.14 * rand()) - 0.22 * opening,
          age: 0,
          life: 2.5 + 2.5 * rand(),
          phase: rand() * Math.PI * 2,
          glint: rand() < 0.35,
        });
      }
      const drag = Math.exp(-1.1 * dt);
      const settle = 1 - Math.exp(-1.4 * dt);
      specks = specks.filter((s) => {
        s.age += dt;
        s.vx *= drag;
        // Pollen is light: it eases toward a slow fall rather than dropping.
        s.vy += (-0.2 - s.vy) * settle;
        s.x += (s.vx + 0.05 * Math.sin(s.age * 2.3 + s.phase)) * dt;
        s.y += s.vy * dt;
        return s.age < s.life;
      });
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      const { cols, rows, cellW, cellH } = grid;
      if (cols < 8 || rows < 6 || !fits) return;
      rasterize(model, poseAt(t, lean), grid);

      // Thin glyphs on dark paper need a higher floor to read.
      const floor = dark.matches ? 0.6 : 0.45;
      ctx.font = font;
      ctx.textBaseline = 'top';
      ctx.fillStyle = color;
      for (let cell = 0; cell < grid.depth.length; cell++) {
        if (grid.depth[cell] === 0) continue;
        const l = level(grid.lum[cell]);
        const y = Math.floor(cell / cols) * cellH;
        // Softer where it dips behind the text.
        const sink = y > groundTop ? 1 - 0.55 * Math.min(1, (y - groundTop) / dip) : 1;
        ctx.globalAlpha = (floor + (1 - floor) * l) * sink;
        ctx.fillText(glyph(l), (cell % cols) * cellW, y);
      }

      // Pollen sits behind the butterfly, so it shows once it leaves the
      // wings, and fades out before the edges of the box and as it falls
      // behind the text.
      for (const s of specks) {
        const px = grid.cx + grid.unit * s.x;
        const py = grid.cy - grid.unit * s.y;
        const col = Math.floor(px / cellW);
        const row = Math.floor(py / cellH);
        if (col < 0 || col >= cols || row < 0 || row >= rows) continue;
        if (grid.depth[row * cols + col] !== 0) continue;
        const edge = Math.min(px, width - px, height - py) / (height * 0.14);
        const sink = py > groundTop ? 1 - (py - groundTop) / (dip * 2.5) : 1;
        const fade =
          Math.min(1, s.age / 0.3, (s.life - s.age) / (s.life * 0.4), edge, sink) *
          (s.glint ? 0.95 : 0.8);
        if (fade <= 0) continue;
        const marks = s.glint ? GLINT : FLUTTER;
        ctx.globalAlpha = fade;
        ctx.fillText(
          marks[Math.floor(s.age * 3 + s.phase) % marks.length],
          col * cellW,
          row * cellH,
        );
      }
      ctx.globalAlpha = 1;
    };

    // The still frame replays the four seconds before it, so it carries the
    // same pollen every time.
    const drawStill = () => {
      specks = [];
      rand = random(7);
      owed = 0;
      lastFlap = poseAt(STILL - 4).flap;
      for (let t = STILL - 4; t < STILL; t += 1 / 30) step(t, 1 / 30);
      draw(STILL);
    };

    let frame = 0;
    let last = -Infinity;
    const loop = (time: number) => {
      frame = requestAnimationFrame(loop);
      // 30 frames a second is plenty for something this calm.
      if (time - last < 33 || !width || !fits) return;
      if (last === -Infinity) lastFlap = poseAt(time / 1000).flap;
      // A hidden tab pauses rAF; don't release a backlog of pollen after it.
      const dt = Math.min(0.1, (time - last) / 1000);
      last = time;
      lean.x += (lean.tx - lean.x) * 0.04;
      lean.y += (lean.ty - lean.y) * 0.04;
      step(time / 1000, dt);
      draw(time / 1000);
    };
    const start = () => {
      cancelAnimationFrame(frame);
      if (still.matches) drawStill();
      else frame = requestAnimationFrame(loop);
    };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      lean.tx = (e.clientX / window.innerWidth) * 2 - 1;
      lean.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onTheme = () => {
      readStyle();
      if (still.matches) drawStill();
    };
    const observer = new ResizeObserver(() => {
      resize();
      if (still.matches) drawStill();
    });

    resize();
    start();
    observer.observe(canvas);
    if (ground?.current) observer.observe(ground.current);
    window.addEventListener('pointermove', onPointer);
    dark.addEventListener('change', onTheme);
    still.addEventListener('change', start);
    // The mono font may land after the first frame.
    document.fonts.ready.then(onTheme);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('pointermove', onPointer);
      dark.removeEventListener('change', onTheme);
      still.removeEventListener('change', start);
    };
  }, [ground]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none font-mono text-accent-text ${className ?? ''}`}
      style={style}
    />
  );
};
