import { NextRequest, NextResponse } from 'next/server';
import { isPaymentId } from '~~/lib/quietEdge';
import { getOrder } from '~~/lib/quietEdgeOrders';

// A buyer's download link, from the page or their email. It asks Whop about
// the payment every time, then streams the current edition from Whop's CDN,
// so the link keeps working for later editions and stops on a refund. Anything
// else goes back to the page, which says what's wrong.
export async function GET(req: NextRequest) {
  const payment = req.nextUrl.searchParams.get('payment');
  const back = new URL('/quiet-edge', req.nextUrl);
  if (!isPaymentId(payment)) return NextResponse.redirect(back);

  const order = await getOrder(payment);
  const source = process.env.QUIET_EDGE_PDF_URL;
  if (order.state !== 'paid' || !source) {
    if (!source) console.error('Quiet Edge: QUIET_EDGE_PDF_URL is not set');
    back.searchParams.set('payment', payment);
    return NextResponse.redirect(back);
  }

  const pdf = await fetch(source, { cache: 'no-store' }).catch(() => null);
  if (!pdf?.ok || !pdf.body) {
    console.error('Quiet Edge: the PDF did not load', pdf?.status);
    return new NextResponse('The download didn’t start. Try again in a minute.', {
      status: 502,
    });
  }
  return new NextResponse(pdf.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="The Quiet Edge.pdf"',
      ...(pdf.headers.get('content-length') && {
        'Content-Length': pdf.headers.get('content-length')!,
      }),
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}
