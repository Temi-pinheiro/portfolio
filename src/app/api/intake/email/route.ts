import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { answersAsText, checkAnswers } from '~~/lib/intake';

// "Prefer email?" under the prognosis on /mariposa. It mails Temi the
// visitor's address with their answers and the prognosis they were shown,
// through Sendbyte, with the visitor as the reply-to, so answering is one
// click. Nothing is sent to the visitor: a form that mails whatever address
// it's given can be used to send mail from this domain to anyone.
const SENDBYTE_EMAILS = 'https://api.sendbyte.africa/v1/emails';
const FROM = 'The Mariposa Program <intake@temipinheiro.com>';
const INBOX = 'temitopepinheiro@gmail.com';
const PROGNOSIS_LIMIT = 12000;

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const invalid = (field: string) =>
  NextResponse.json({ error: 'invalid', field }, { status: 400 });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') return invalid('email');

  // The honeypot: a field people never see. Anything that fills it in gets a
  // success and no email.
  if (body._gotcha) return NextResponse.json({ ok: true });

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return invalid('email');
  }
  const answers = checkAnswers(body.answers);
  if ('field' in answers) return invalid(answers.field);
  const prognosis = typeof body.prognosis === 'string' ? body.prognosis.trim() : '';
  if (prognosis.length > PROGNOSIS_LIMIT) return invalid('prognosis');

  const key = process.env.SENDBYTE_API_KEY;
  if (!key) {
    console.error('Intake email dropped: SENDBYTE_API_KEY is not set');
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }

  const rows: [string, string][] = [['Email', email], ...answersAsText(answers)];
  const text = [
    `${answers.name} would like to carry on by email. Reply to this message to reach them.`,
    ...rows.map(([label, value]) => `${label}\n${value}`),
    `The prognosis they were shown\n\n${prognosis || '(none)'}`,
  ].join('\n\n');
  const html =
    `<p style="margin:0 0 24px">${escapeHtml(answers.name)} would like to carry on by email. Reply to this message to reach them.</p>` +
    rows
      .map(
        ([label, value]) =>
          `<p style="margin:0 0 18px"><strong>${label}</strong><br>${escapeHtml(value).replace(/\n/g, '<br>')}</p>`
      )
      .join('') +
    `<p style="margin:28px 0 8px"><strong>The prognosis they were shown</strong></p><div style="white-space:pre-wrap">${escapeHtml(prognosis || '(none)')}</div>`;

  const res = await fetch(SENDBYTE_EMAILS, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: INBOX,
      reply_to: email,
      subject: `By email: ${answers.business.replace(/\s+/g, ' ')} (${answers.name.replace(/\s+/g, ' ')})`,
      text,
      html,
      tags: ['intake-email'],
      // A double click or a retry the same day is one email.
      idempotency_key: createHash('sha256')
        .update([new Date().toISOString().slice(0, 10), email, answers.business].join('\n'))
        .digest('hex'),
    }),
  }).catch((error: unknown) => {
    console.error('Intake email: Sendbyte unreachable', error);
    return null;
  });

  if (!res?.ok) {
    if (res) console.error('Intake email: Sendbyte', res.status, await res.text());
    return NextResponse.json({ error: 'send_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
