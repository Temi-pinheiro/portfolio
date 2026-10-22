import { NextRequest, NextResponse } from 'next/server';

// The Quiet Edge mailing list, for news of new editions: the "Temi Pinheiro"
// brand's "The Quiet Edge: new editions" list on Sendbyte. It's single
// opt-in, so people are on it as soon as they sign up. The first list was
// double opt-in, but Sendbyte never sent its confirmation email to people
// added through the API, so they all sat unconfirmed (the user's call,
// 2026-10-22). Anyone can put any address here; every campaign carries
// Sendbyte's unsubscribe link, and the honeypot keeps the bots out.
const LIST =
  'https://api.sendbyte.africa/v1/brands/57e33839-04b9-4fa0-a076-4da7fee55def/lists/491eff85-c9b1-4154-8dfd-542357e326da/subscribers';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  // The honeypot, as on the teardown form.
  if (body._gotcha) return NextResponse.json({ ok: true });

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid', field: 'email' }, { status: 400 });
  }

  const key = process.env.SENDBYTE_API_KEY;
  if (!key) {
    console.error('Quiet Edge sign-up dropped: SENDBYTE_API_KEY is not set');
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }

  const res = await fetch(LIST, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, attributes: { source: 'quiet-edge-page' } }),
  }).catch((error: unknown) => {
    console.error('Quiet Edge sign-up: Sendbyte unreachable', error);
    return null;
  });
  if (!res?.ok) {
    if (res) console.error('Quiet Edge sign-up: Sendbyte', res.status, await res.text());
    return NextResponse.json({ error: 'send_failed' }, { status: 502 });
  }
  // Someone who unsubscribed before comes back as skipped. That's theirs to
  // undo, through their own email, so the page says the same thing either way.
  return NextResponse.json({ ok: true });
}
