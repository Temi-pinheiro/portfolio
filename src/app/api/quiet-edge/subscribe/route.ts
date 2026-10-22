import { NextRequest, NextResponse } from 'next/server';

// The Quiet Edge mailing list, for news of new editions: the "Temi Pinheiro"
// brand and its "The Quiet Edge" list on Sendbyte. The list is double opt-in,
// so Sendbyte emails a confirmation and nobody is mailed before they click it.
// That's also what makes it safe to accept any address here.
const LIST =
  'https://api.sendbyte.africa/v1/brands/57e33839-04b9-4fa0-a076-4da7fee55def/lists/277e3e48-721c-4549-82e8-b073fc419d71/subscribers';

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
