import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { isPaymentId } from '~~/lib/quietEdge';
import { getOrder, sendDownloadEmail } from '~~/lib/quietEdgeOrders';

// Whop's payment.succeeded webhook. It covers whoever the page can't: a
// payment that clears after the buyer left (a bank transfer, say), and anyone
// who bought on whop.com. Either way the buyer gets the same email. Sendbyte
// sends one email per payment, so a retry, or a buyer who also saw the page,
// gets it once.
//
// Whop signs `{webhook-id}.{webhook-timestamp}.{raw body}` with HMAC-SHA256,
// keyed with the literal `ws_…` secret (Standard Webhooks, without the base64
// key step), and sends `v1,<base64>` in webhook-signature.
const TOLERANCE_SECONDS = 5 * 60;

const verified = (req: NextRequest, body: string, secret: string) => {
  const id = req.headers.get('webhook-id');
  const timestamp = req.headers.get('webhook-timestamp');
  const signatures = req.headers.get('webhook-signature');
  if (!id || !timestamp || !signatures) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > TOLERANCE_SECONDS) return false;

  const expected = createHmac('sha256', secret)
    .update(`${id}.${timestamp}.${body}`)
    .digest();
  // The header can carry several signatures, space-separated, during a
  // secret rotation.
  return signatures.split(' ').some((entry) => {
    const [version, signature] = entry.split(',');
    if (version !== 'v1' || !signature) return false;
    const given = Buffer.from(signature, 'base64');
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
};

export async function POST(req: NextRequest) {
  const secret = process.env.WHOP_WEBHOOK_SECRET;
  if (!secret) {
    console.error('Quiet Edge webhook: WHOP_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
  const body = await req.text();
  if (!verified(req, body, secret)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  const payment = event?.data?.id;
  // Other events, and payments for other products, are fine to ignore.
  if (event?.type !== 'payment.succeeded' || !isPaymentId(payment)) {
    return NextResponse.json({ ok: true });
  }

  // Trust the API over the payload: it says whether this is the guide, and
  // whether it's still paid.
  const order = await getOrder(payment);
  if (order.state === 'unavailable') {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
  if (order.state === 'paid' && order.email) {
    const sent = await sendDownloadEmail(payment, order.email);
    // A failed send asks Whop to retry; Sendbyte keeps the retry to one email.
    if (!sent) return NextResponse.json({ error: 'send_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
