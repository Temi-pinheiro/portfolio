import { NextRequest, NextResponse } from 'next/server';
import { downloadPath, isPaymentId } from '~~/lib/quietEdge';
import { getOrder, sendDownloadEmail } from '~~/lib/quietEdgeOrders';

// The page calls this when Whop's checkout finishes (or the buyer comes back
// from a bank's page) with the payment's ID. The ID alone proves nothing, so
// Whop is asked whether it's a paid order for the guide. If it is, the buyer
// gets their download link here and by email.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const payment = body?.payment;
  if (!isPaymentId(payment)) {
    return NextResponse.json({ state: 'none' }, { status: 400 });
  }

  const order = await getOrder(payment);
  if (order.state === 'unavailable') {
    return NextResponse.json({ state: 'unavailable' }, { status: 503 });
  }
  if (order.state !== 'paid') {
    return NextResponse.json(
      { state: order.state },
      { status: order.state === 'pending' ? 202 : 404 }
    );
  }

  // A failed email doesn't stop the download; the page offers the link either
  // way, and the webhook tries the email again.
  const emailed = order.email ? await sendDownloadEmail(payment, order.email) : false;
  return NextResponse.json({
    state: 'paid',
    download: downloadPath(payment),
    email: emailed ? order.email : null,
  });
}
