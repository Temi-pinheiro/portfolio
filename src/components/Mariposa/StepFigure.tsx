'use client';

import type { MotionValue } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { fit, glyph, level, STILL, type Grid } from '~~/lib/butterfly';
import { createFigure } from '~~/lib/metamorphosis';

// The steps' figure (lib/metamorphosis), drawn like the landing's butterfly:
// mono glyphs on a canvas, in the accent. `stage` is the step, 0–4, with
// fractions between steps as you scroll. It animates at 30 frames a second
// while on screen; under reduced motion it holds one still frame per step and
// changes only with the step.
export const StepFigure = ({
  stage,
  className,
}: {
  stage: MotionValue<number>;
  className?: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const figure = createFigure();
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    const dark = window.matchMedia('(prefers-color-scheme: dark)');
    let width = 0;
    let height = 0;
    let font = '';
    let accent = '';
    let visible = false;
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

    const readStyle = () => {
      const style = getComputedStyle(canvas);
      accent = style.color;
      Object.assign(grid, fit(figure.extent, width, height, 0.86));
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

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      const { cols, cellW, cellH } = grid;
      if (cols < 8 || grid.rows < 6) return;
      const s = still.matches ? Math.round(stage.get()) : stage.get();
      figure.render(s, t, grid);
      // Thin glyphs on dark paper need a higher floor to read.
      const floor = dark.matches ? 0.6 : 0.45;
      ctx.font = font;
      ctx.textBaseline = 'top';
      ctx.fillStyle = accent;
      for (let cell = 0; cell < grid.depth.length; cell++) {
        if (grid.depth[cell] === 0) continue;
        const l = level(grid.lum[cell]);
        ctx.globalAlpha = floor + (1 - floor) * l;
        ctx.fillText(glyph(l), (cell % cols) * cellW, Math.floor(cell / cols) * cellH);
      }
      ctx.globalAlpha = 1;
    };

    let frame = 0;
    let last = -Infinity;
    const loop = (time: number) => {
      frame = requestAnimationFrame(loop);
      if (time - last < 33 || !width) return;
      last = time;
      draw(time / 1000);
    };
    const start = () => {
      cancelAnimationFrame(frame);
      if (!visible) return;
      if (still.matches) draw(STILL);
      else frame = requestAnimationFrame(loop);
    };

    const onStage = () => {
      if (still.matches && visible) draw(STILL);
    };
    const onTheme = () => {
      readStyle();
      if (still.matches) draw(STILL);
    };
    const resizer = new ResizeObserver(() => {
      resize();
      if (still.matches) draw(STILL);
    });
    const watcher = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });

    resize();
    resizer.observe(canvas);
    watcher.observe(canvas);
    const unsubscribe = stage.on('change', onStage);
    dark.addEventListener('change', onTheme);
    still.addEventListener('change', start);
    // The mono font may land after the first frame.
    document.fonts.ready.then(onTheme);

    return () => {
      cancelAnimationFrame(frame);
      resizer.disconnect();
      watcher.disconnect();
      unsubscribe();
      dark.removeEventListener('change', onTheme);
      still.removeEventListener('change', start);
    };
  }, [stage]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none font-mono text-accent-text ${className ?? ''}`}
    />
  );
};
