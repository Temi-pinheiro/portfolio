import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

// Free teardown requests from /mariposa, mailed to me through Sendbyte
// (docs.sendbyte.africa). The founder is the reply-to, so answering is one
// click. Nothing is sent back to them: a form that mails whatever address it's
// given can be used to send mail from this domain to anyone.
const SENDBYTE_EMAILS = 'https://api.sendbyte.africa/v1/emails';
const FROM = 'The Mariposa Program <teardowns@temipinheiro.com>';
const INBOX = 'temitopepinheiro@gmail.com';

const LIMITS = {
  name: 120,
  email: 254,
  business: 120,
  url: 500,
  problem: 2000,
} as const;
type Field = keyof typeof LIMITS;

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const invalid = (field: Field) =>
  NextResponse.json({ error: 'invalid', field }, { status: 400 });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  // The honeypot: a field people never see. Anything that fills it in gets a
  // success and no email.
  if (body._gotcha) return NextResponse.json({ ok: true });

  const fields = {} as Record<Field, string>;
  for (const field of Object.keys(LIMITS) as Field[]) {
    const value = typeof body[field] === 'string' ? body[field].trim() : '';
    if (!value || value.length > LIMITS[field]) return invalid(field);
    fields[field] = value;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) return invalid('email');

  // People type "myapp.com", so add the scheme before parsing.
  let link: URL;
  try {
    link = new URL(
      /^https?:\/\//i.test(fields.url) ? fields.url : `https://${fields.url}`
    );
  } catch {
    return invalid('url');
  }
  if (!link.hostname.includes('.')) return invalid('url');

  const key = process.env.SENDBYTE_API_KEY;
  if (!key) {
    console.error('Teardown request dropped: SENDBYTE_API_KEY is not set');
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }

  const rows: [string, string][] = [
    ['Name', fields.name],
    ['Email', fields.email],
    ['Business', fields.business],
    ['Link', link.href],
    ['What’s not working', fields.problem],
  ];
  const text = rows.map(([label, value]) => `${label}\n${value}`).join('\n\n');
  const html = rows
    .map(([label, value]) => {
      const body =
        label === 'Link'
          ? `<a href="${escapeHtml(value)}">${escapeHtml(value)}</a>`
          : escapeHtml(value).replace(/\n/g, '<br>');
      return `<p style="margin:0 0 18px"><strong>${label}</strong><br>${body}</p>`;
    })
    .join('');

  const res = await fetch(SENDBYTE_EMAILS, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: INBOX,
      reply_to: fields.email,
      subject: `Teardown request: ${fields.business.replace(/\s+/g, ' ')}`,
      text,
      html,
      tags: ['teardown'],
      // Sendbyte sends one email per key, forever. A double click or a retry
      // the same day is one request; the same one tomorrow is a new one.
      idempotency_key: createHash('sha256')
        .update(
          [
            new Date().toISOString().slice(0, 10),
            fields.email,
            link.href,
            fields.problem,
          ].join('\n')
        )
        .digest('hex'),
    }),
  }).catch((error: unknown) => {
    console.error('Teardown request: Sendbyte unreachable', error);
    return null;
  });

  if (!res?.ok) {
    if (res) {
      console.error('Teardown request: Sendbyte', res.status, await res.text());
    }
    return NextResponse.json({ error: 'send_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
