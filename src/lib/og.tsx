import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { stillFrame } from './butterfly';

// One frame for every Open Graph image: paper ground, a mono label, the title
// in Playfair Display and the URL in the accent, with the mariposa on the
// right (the landing's butterfly, as rows of mono text). A page that sets its
// own `openGraph` block replaces the root image, so each such page needs an
// opengraph-image.tsx that calls this.

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

// Satori needs TTF/OTF bytes, not woff2, so the three weights ship in the
// repo (src/assets/fonts, OFL). They used to come from Google Fonts at build
// time, but that fetch failed on Netlify's build machines, and Satori fails
// the build when it has no font at all. next.config.js traces the folder into
// the server function for the article images rendered on request.
const FONT_DIR = path.join(process.cwd(), 'src', 'assets', 'fonts');
const loadFont = (file: string) => readFile(path.join(FONT_DIR, file));

// The butterfly as rows of text, each row split into runs of one tone: the
// canvas's per-character alpha, in three steps of the accent.
const BUTTERFLY = (() => {
  const cols = 54;
  const { lines, levels } = stillFrame({ cols, rows: 37, aspect: 1.12 / 0.62 });
  const tones = [0.55, 0.78, 1];
  return lines.map((line, r) => {
    const runs: { text: string; tone: number }[] = [];
    for (let c = 0; c < cols; c++) {
      const l = levels[r * cols + c];
      const alpha = 0.45 + 0.55 * Math.max(0, l);
      const tone = l < 0 ? -1 : tones[alpha < 0.63 ? 0 : alpha < 0.82 ? 1 : 2];
      const last = runs[runs.length - 1];
      if (last && (tone === -1 || tone === last.tone || last.tone === -1)) {
        last.text += line[c];
        if (last.tone === -1) last.tone = tone;
      } else runs.push({ text: line[c], tone });
    }
    return runs;
  });
})();

export async function ogImage({
  label,
  title,
  path,
}: {
  label: string;
  title: string;
  path: string;
}) {
  const url = `temipinheiro.com${path}`;
  const [display, mono, glyphs] = await Promise.all([
    loadFont('PlayfairDisplay-Regular.ttf'),
    loadFont('Inconsolata-Medium.ttf'),
    loadFont('Inconsolata-SemiBold.ttf'),
  ]);
  const fonts = [
    { name: 'Playfair Display', data: display, weight: 400 as const, style: 'normal' as const },
    { name: 'Inconsolata', data: mono, weight: 500 as const, style: 'normal' as const },
    { name: 'Inconsolata', data: glyphs, weight: 600 as const, style: 'normal' as const },
  ];
  const fontSize = title.length > 70 ? 48 : title.length > 40 ? 56 : 68;

  // Satori rule: an element with more than one child needs display: flex, so
  // every text node below is a single string.
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 48px 0 80px',
          background: '#FAFAF7',
          color: '#171717',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', width: 560 }}>
        <div
          style={{
            fontFamily: 'Inconsolata',
            fontSize: 28,
            color: '#5E5E5A',
            letterSpacing: 4,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: 'Playfair Display',
            fontSize,
            marginTop: 30,
            lineHeight: 1.08,
            letterSpacing: -1.5,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: 'Inconsolata',
            fontSize: 28,
            marginTop: 44,
            color: '#2A52C9',
          }}
        >
          {url}
        </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Inconsolata',
            fontWeight: 600,
            fontSize: 14.5,
            lineHeight: 1.12,
            // Inconsolata advances 0.5em; the canvas spaces cells 0.62em apart.
            letterSpacing: 14.5 * 0.12,
          }}
        >
          {BUTTERFLY.map((runs, r) => (
            <div key={r} style={{ display: 'flex', whiteSpace: 'pre' }}>
              {runs.map((run, i) => (
                <span
                  key={i}
                  style={{ color: `rgba(42, 82, 201, ${run.tone < 0 ? 0 : run.tone})` }}
                >
                  {run.text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...ogSize, fonts }
  );
}
