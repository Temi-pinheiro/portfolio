import { downloadPath, QUIET_EDGE } from './quietEdge';
import { EMAIL, SITE_URL } from './site';

// Server only: these read the Whop and Sendbyte keys.
//
// Whop is the record of who bought the guide. Nothing is stored here: every
// claim, download and webhook asks Whop about the payment again, so a refund
// or a lost dispute ends access without anything to clean up.

const WHOP_PAYMENTS = 'https://api.whop.com/api/v1/payments';
// Whop shapes its responses by API version. Pinning one keeps the fields below
// where they are; the reads also accept the older shape, in case the pin is
// ever dropped.
const WHOP_VERSION = '2026-10-15-1';

const SENDBYTE_EMAILS = 'https://api.sendbyte.africa/v1/emails';
const FROM = 'Temi Pinheiro <temi@temipinheiro.com>';

// Substatuses that take the guide back: refunded in full, or lost to a dispute.
const REVOKED = new Set(['refunded', 'auto_refunded', 'dispute_lost', 'resolution_lost']);
// Still on its way: bank transfers and other slow methods sit here for a while.
const PENDING = new Set(['draft', 'open', 'pending', 'authorized']);

export type Order =
  | { state: 'paid'; email: string | null }
  | { state: 'pending' }
  // Not a payment for the guide, failed, or taken back.
  | { state: 'none' }
  // Whop didn't answer, or the key is missing.
  | { state: 'unavailable' };

type Payment = {
  status?: string;
  substatus?: string | null;
  refunded_at?: string | null;
  plan_id?: string;
  plan?: { id?: string } | null;
  customer_email?: string | null;
  user?: { email?: string | null } | null;
};

export const getOrder = async (payment: string): Promise<Order> => {
  const key = process.env.WHOP_API_KEY;
  if (!key) {
    console.error('Quiet Edge: WHOP_API_KEY is not set');
    return { state: 'unavailable' };
  }
  const res = await fetch(`${WHOP_PAYMENTS}/${encodeURIComponent(payment)}`, {
    headers: { Authorization: `Bearer ${key}`, 'Api-Version-Date': WHOP_VERSION },
    cache: 'no-store',
  }).catch((error: unknown) => {
    console.error('Quiet Edge: Whop unreachable', error);
    return null;
  });
  if (!res) return { state: 'unavailable' };
  if (res.status === 404) return { state: 'none' };
  if (!res.ok) {
    console.error('Quiet Edge: Whop', res.status, await res.text());
    return { state: 'unavailable' };
  }

  const found: Payment = await res.json();
  if (!QUIET_EDGE.plans.includes(found.plan_id ?? found.plan?.id ?? '')) return { state: 'none' };
  if (found.refunded_at || REVOKED.has(found.substatus ?? '')) return { state: 'none' };
  if (found.status === 'paid') {
    return { state: 'paid', email: found.customer_email ?? found.user?.email ?? null };
  }
  return PENDING.has(found.status ?? '') ? { state: 'pending' } : { state: 'none' };
};

// The buyer's download link, by email. It only ever goes to the address on
// the Whop payment, never to one typed into this site.
export const sendDownloadEmail = async (payment: string, to: string) => {
  const key = process.env.SENDBYTE_API_KEY;
  if (!key) {
    console.error('Quiet Edge email not sent: SENDBYTE_API_KEY is not set');
    return false;
  }
  // From a Deploy Preview, the link goes back to that preview (next.config.js).
  const link = `${process.env.DEPLOY_PREVIEW_URL || SITE_URL}${downloadPath(payment)}`;
  const paragraphs = [
    'Thanks for buying The Quiet Edge.',
    `Here’s your copy: ${link}`,
    'That link is yours to keep. When a new edition comes out, the same link gets you the new one. The guide is also in your Whop account, under The Quiet Edge.',
    'Start with the preface, then Chapter 1.',
    `Questions, or something that worked for you? Write to me at ${EMAIL}.`,
    'Temi',
  ];
  const html = paragraphs
    .map((text) =>
      text === paragraphs[1]
        ? `<p style="margin:0 0 18px">Here’s your copy: <a href="${link}">download The Quiet Edge</a></p>`
        : `<p style="margin:0 0 18px">${text}</p>`
    )
    .join('');

  const res = await fetch(SENDBYTE_EMAILS, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to,
      reply_to: EMAIL,
      subject: 'Your copy of The Quiet Edge',
      text: paragraphs.join('\n\n'),
      html,
      tags: ['quiet-edge'],
      // One email per payment, ever: the page, a reload and the webhook can
      // all ask for it.
      idempotency_key: `quiet-edge-${payment}`,
    }),
  }).catch((error: unknown) => {
    console.error('Quiet Edge email: Sendbyte unreachable', error);
    return null;
  });
  if (!res?.ok) {
    if (res) console.error('Quiet Edge email: Sendbyte', res.status, await res.text());
    return false;
  }
  return true;
};
