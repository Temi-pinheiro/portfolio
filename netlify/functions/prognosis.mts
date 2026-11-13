import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { getStore } from '@netlify/blobs';
import { answersAsText, checkAnswers, type Answers } from '../../src/lib/intake';

// The prognosis at the end of the /mariposa intake. It checks the answers,
// streams Claude's read of the business back to the page as it's written, then
// emails the answers and the prognosis to Temi through Sendbyte. The visitor
// is never emailed.
//
// It's a Netlify function rather than a Next route because only functions take
// a rate limit (config below). The rest of the guard: same-origin requests
// only, the honeypot, the checks in lib/intake, and daily caps per visitor and
// for the whole site, so a script can't run up the API bill.
//
// The page reads newline-delimited JSON: {"t":"text","v":"…"} as text
// arrives, then {"t":"done"} or {"t":"error","v":"<reason>"}. Before the
// stream starts, failures are plain JSON with a status code.

const MODEL = 'claude-sonnet-5-5';
const PER_VISITOR_PER_DAY = 5;
const SITE_PER_DAY = 150;

const SENDBYTE_EMAILS = 'https://api.sendbyte.africa/v1/emails';
const FROM = 'The Mariposa Program <intake@temipinheiro.com>';
const INBOX = 'temitopepinheiro@gmail.com';

// The system prompt isn't in this repo: the repo is public, and the prompt is
// the offer's working method. It lives in the site's Blobs store (key below),
// uploaded from a gitignored file with `npm run prompt:push`. Kept for a few
// minutes per instance, so an upload takes effect without a deploy. Under
// `netlify dev` the local Blobs store is empty, so it reads that file instead.
const PROMPT_KEY = 'prompt/system';
const PROMPT_FILE = 'private/prognosis-prompt.md';
const PROMPT_TTL = 5 * 60_000;
let cachedPrompt: { text: string; at: number } | null = null;

const loadPrompt = async () => {
  if (cachedPrompt && Date.now() - cachedPrompt.at < PROMPT_TTL) return cachedPrompt.text;
  let text = (await getStore('intake').get(PROMPT_KEY, { type: 'text' }))?.trim() ?? '';
  if (!text && process.env.NETLIFY_DEV === 'true') {
    text = (await readFile(join(process.cwd(), PROMPT_FILE), 'utf8').catch(() => '')).trim();
  }
  if (!text) return null;
  cachedPrompt = { text, at: Date.now() };
  return text;
};

const json = (body: unknown, status: number) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

const sameOrigin = (req: Request) => {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(req.url).host;
  } catch {
    return false;
  }
};

// Counts today's prognoses, for the visitor and for the site. The visitor is
// a hash of their IP and the date, so no address is stored. Blobs has no
// atomic increment; two requests in the same instant can both pass, which is
// fine for a cap on spend.
const takeFromCaps = async (ip: string) => {
  const day = new Date().toISOString().slice(0, 10);
  const store = getStore({ name: 'intake', consistency: 'strong' });
  const visitor = createHash('sha256').update(`${day}\n${ip}`).digest('hex');
  const keys = { visitor: `caps/${day}/${visitor}`, site: `caps/${day}/site` };
  const [mine, all] = await Promise.all([
    store.get(keys.visitor).then(Number),
    store.get(keys.site).then(Number),
  ]);
  const used = { mine: mine || 0, all: all || 0 };
  if (used.mine >= PER_VISITOR_PER_DAY || used.all >= SITE_PER_DAY) return false;
  await Promise.all([
    store.set(keys.visitor, String(used.mine + 1)),
    store.set(keys.site, String(used.all + 1)),
  ]);
  return true;
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const mailTemi = async (answers: Answers, prognosis: string) => {
  const key = process.env.SENDBYTE_API_KEY;
  if (!key) {
    console.error('Prognosis: SENDBYTE_API_KEY is not set, intake not emailed');
    return;
  }
  const rows = answersAsText(answers);
  const text = [
    ...rows.map(([label, value]) => `${label}\n${value}`),
    `The prognosis they were shown\n\n${prognosis}`,
  ].join('\n\n');
  const html =
    rows
      .map(
        ([label, value]) =>
          `<p style="margin:0 0 18px"><strong>${label}</strong><br>${escapeHtml(value).replace(/\n/g, '<br>')}</p>`
      )
      .join('') +
    `<p style="margin:28px 0 8px"><strong>The prognosis they were shown</strong></p><div style="white-space:pre-wrap">${escapeHtml(prognosis)}</div>`;

  const res = await fetch(SENDBYTE_EMAILS, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: INBOX,
      subject: `Intake: ${answers.business.replace(/\s+/g, ' ')} (${answers.name.replace(/\s+/g, ' ')})`,
      text,
      html,
      tags: ['intake'],
      idempotency_key: createHash('sha256').update(text).digest('hex'),
    }),
  }).catch((error: unknown) => {
    console.error('Prognosis: Sendbyte unreachable', error);
    return null;
  });
  if (res && !res.ok) console.error('Prognosis: Sendbyte', res.status, await res.text());
};

const handler = async (req: Request, context: { ip?: string }) => {
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  if (!sameOrigin(req)) return json({ error: 'origin' }, 403);

  const body = await req.json().catch(() => null);
  // The honeypot: a field people never see.
  if (body && typeof body === 'object' && (body as { _gotcha?: unknown })._gotcha) {
    return json({ error: 'invalid' }, 400);
  }
  const answers = checkAnswers(body);
  if ('field' in answers) return json({ error: 'invalid', field: answers.field }, 400);

  const system = await loadPrompt().catch((error: unknown) => {
    console.error('Prognosis: prompt unavailable', error);
    return null;
  });
  if (!system) {
    console.error(`Prognosis: no prompt in Blobs (store intake, key ${PROMPT_KEY})`);
    return json({ error: 'unavailable' }, 503);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('Prognosis: ANTHROPIC_API_KEY is not set');
    return json({ error: 'unavailable' }, 503);
  }

  const allowed = await takeFromCaps(context.ip ?? 'unknown').catch((error: unknown) => {
    // A Blobs outage shouldn't stop a real lead; the rate limit still holds.
    console.error('Prognosis: caps unavailable', error);
    return true;
  });
  if (!allowed) return json({ error: 'busy' }, 429);

  const intake = answersAsText(answers)
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');

  const client = new Anthropic({ apiKey, maxRetries: 1 });
  const encoder = new TextEncoder();
  const started = Date.now();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // The visitor may have closed the page; then there's no one to send to.
      const send = (event: { t: 'text' | 'done' | 'error'; v?: string }) => {
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        } catch {}
      };
      let prognosis = '';
      let firstText = 0;
      try {
        const message = client.beta.messages.stream(
          {
            model: MODEL,
            max_tokens: 4000,
            betas: ['server-side-fallback-2026-07-01'],
            // If Sonnet's safety filter declines, the API carries on with
            // another model on the same stream.
            fallbacks: 'default',
            output_config: { effort: 'medium' },
            system: [
              { type: 'text', text: system, cache_control: { type: 'ephemeral' } },
            ],
            messages: [{ role: 'user', content: `<intake>\n${intake}\n</intake>` }],
          },
          { signal: req.signal }
        );
        for await (const event of message) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            if (!firstText) firstText = Date.now();
            prognosis += event.delta.text;
            send({ t: 'text', v: event.delta.text });
          }
        }
        const final = await message.finalMessage();
        console.info(
          `Prognosis: ${final.model}, ${final.stop_reason}, first text ${firstText ? firstText - started : '-'}ms, total ${Date.now() - started}ms, ${final.usage.output_tokens} out`
        );
        if (final.stop_reason === 'refusal' || !prognosis.trim()) {
          send({ t: 'error', v: 'declined' });
        } else {
          send({ t: 'done' });
        }
      } catch (error) {
        console.error('Prognosis: Claude request failed', error);
        send({ t: 'error', v: prognosis ? 'cut' : 'failed' });
      }
      // Temi gets the answers whatever happened, so a failure never loses
      // the lead. Sent before the stream closes, inside the function's time.
      await mailTemi(answers, prognosis.trim() || '(No prognosis: the request failed.)');
      try {
        controller.close();
      } catch {}
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
};

export default handler;

export const config = {
  path: '/api/prognosis',
  method: 'POST',
  rateLimit: {
    windowSize: 60,
    windowLimit: 3,
    aggregateBy: ['ip', 'domain'],
  },
};
