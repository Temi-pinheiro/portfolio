// Writes the site's icons from the landing's butterfly (src/lib/butterfly.ts):
// the mark is its cells as white dots on the accent, each sized by the cell's
// brightness. Run from the repo root with Node 22.18 or later:
//
//   node scripts/icons.mts
//
// It writes src/app/icon.svg, src/app/favicon.ico (16, 32, 48) and
// src/app/apple-icon.png (180, full bleed; iOS rounds the corners itself).
// No dependencies: the PNGs are drawn and encoded here.

import { writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';
import { stillFrame } from '../src/lib/butterfly.ts';

const ACCENT = [0x2a, 0x52, 0xc9];
const CELLS = 24;

// pad and radius are fractions of the side; dot scales each dot by its cell's
// brightness l, as [radius over half a cell, opacity].
type Mark = { pad: number; radius: number; dot: (l: number) => [number, number] };

// A halftone for large sizes. Small ones overlap the dots into a solid
// silhouette, since a halftone washes out at 16px. The SVG sits between, as
// browsers draw it in tabs and at full size alike.
const HALFTONE = (l: number): [number, number] => [0.55 + 0.45 * l, 0.62 + 0.38 * l];
const SOLID = (): [number, number] => [1.5, 1]; // covers the cell's corners too
const FULL = (l: number): [number, number] => [0.8 + 0.25 * l, 0.8 + 0.2 * l];

// Dots in a unit square: centre, radius and opacity.
const dots = ({ pad, dot }: Mark) => {
  const { levels } = stillFrame({ cols: CELLS, rows: CELLS, aspect: 1, fill: 1 });
  const cell = (1 - pad * 2) / CELLS;
  const out: { x: number; y: number; r: number; a: number }[] = [];
  for (let i = 0; i < levels.length; i++) {
    const l = levels[i];
    if (l < 0) continue;
    const [r, a] = dot(l);
    out.push({
      x: pad + ((i % CELLS) + 0.5) * cell,
      y: pad + (Math.floor(i / CELLS) + 0.5) * cell,
      r: (cell / 2) * r,
      a,
    });
  }
  return out;
};

const svg = (mark: Mark) => {
  const s = 512;
  const circles = dots(mark)
    .map(
      (d) =>
        `<circle cx="${(d.x * s).toFixed(1)}" cy="${(d.y * s).toFixed(1)}" r="${(d.r * s).toFixed(1)}" fill-opacity="${d.a.toFixed(2)}"/>`,
    )
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}"><rect width="${s}" height="${s}" rx="${mark.radius * s}" fill="#2A52C9"/><g fill="#fff">${circles}</g></svg>\n`;
};

// Coverage of a rounded square and the dots, 4×4 samples a pixel, as RGBA.
const raster = (size: number, mark: Mark) => {
  const N = 4;
  const tile = new Float32Array(size * size);
  const ink = new Float32Array(size * size);
  const rr = mark.radius * size;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let hit = 0;
      for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
          const px = x + (i + 0.5) / N;
          const py = y + (j + 0.5) / N;
          const dx = Math.max(rr - px, px - (size - rr), 0);
          const dy = Math.max(rr - py, py - (size - rr), 0);
          if (dx * dx + dy * dy <= rr * rr) hit++;
        }
      }
      tile[y * size + x] = hit / (N * N);
    }
  }
  for (const d of dots(mark)) {
    const cx = d.x * size;
    const cy = d.y * size;
    const r = d.r * size;
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        if (x < 0 || y < 0 || x >= size || y >= size) continue;
        let hit = 0;
        for (let j = 0; j < N; j++) {
          for (let i = 0; i < N; i++) {
            const dx = x + (i + 0.5) / N - cx;
            const dy = y + (j + 0.5) / N - cy;
            if (dx * dx + dy * dy <= r * r) hit++;
          }
        }
        // Overlapping dots add up (as layered paint would), so a solid
        // silhouette has no seams between cells.
        const k = y * size + x;
        ink[k] = 1 - (1 - ink[k]) * (1 - (hit / (N * N)) * d.a);
      }
    }
  }
  const rgba = Buffer.alloc(size * size * 4);
  for (let k = 0; k < size * size; k++) {
    for (let c = 0; c < 3; c++) {
      rgba[k * 4 + c] = Math.round(ACCENT[c] + (255 - ACCENT[c]) * ink[k]);
    }
    rgba[k * 4 + 3] = Math.round(255 * tile[k]);
  }
  return rgba;
};

const png = (size: number, rgba: Buffer) => {
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 6, 0, 0, 0], 8); // 8-bit RGBA
  const rows = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    rgba.copy(rows, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(rows)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

// An ICO is a directory of PNGs.
const ico = (images: { size: number; data: Buffer }[]) => {
  const head = Buffer.alloc(6 + images.length * 16);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(images.length, 4);
  let offset = head.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + i * 16;
    head[e] = size;
    head[e + 1] = size;
    head.writeUInt16LE(1, e + 4);
    head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(data.length, e + 8);
    head.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([head, ...images.map((i) => i.data)]);
};

// Small sizes take less padding too, so the silhouette stays legible.
const small: Mark = { pad: 0.1, radius: 0.22, dot: SOLID };
writeFileSync('src/app/icon.svg', svg({ pad: 0.12, radius: 0.22, dot: FULL }));
writeFileSync(
  'src/app/favicon.ico',
  ico([16, 32, 48].map((size) => ({ size, data: png(size, raster(size, small)) }))),
);
writeFileSync(
  'src/app/apple-icon.png',
  png(180, raster(180, { pad: 0.16, radius: 0, dot: HALFTONE })),
);
console.log('wrote src/app/icon.svg, favicon.ico and apple-icon.png');
