import { getStore } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import { GUIDE_PDF, isPaymentId } from '~~/lib/quietEdge';
import { getOrder } from '~~/lib/quietEdgeOrders';
import { EMAIL } from '~~/lib/site';

// A buyer's download link, from the page or their email. It asks Whop about
// the payment every time, then sends the current edition from the site's own
// Blobs store, so the link keeps working for later editions and stops on a
// refund. Anything else goes back to the page, which says what's wrong.
//
// It used to stream from a Whop CDN URL. Whop made that file private, the URL
// started answering 403, and the first buyer's link (2026-10-29) saved the
// error as download.txt. A blob has no URL to expire.
export async function GET(req: NextRequest) {
  const payment = req.nextUrl.searchParams.get('payment');
  const back = new URL('/quiet-edge', req.nextUrl);
  if (!isPaymentId(payment)) return NextResponse.redirect(back);

  const order = await getOrder(payment);
  if (order.state !== 'paid') {
    back.searchParams.set('payment', payment);
    return NextResponse.redirect(back);
  }

  const pdf = await readPdf();
  if (!pdf) return failed(payment);
  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="The Quiet Edge.pdf"',
      'Content-Length': String(pdf.byteLength),
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}

const readPdf = async () => {
  try {
    // getStore throws outside Netlify, where there's no store to open.
    const pdf = await getStore(GUIDE_PDF.store).get(GUIDE_PDF.key, { type: 'arrayBuffer' });
    if (!pdf) console.error(`Quiet Edge: no PDF at ${GUIDE_PDF.store}/${GUIDE_PDF.key}`);
    return pdf;
  } catch (error) {
    console.error('Quiet Edge: Netlify Blobs failed', error);
    return null;
  }
};

// A page, not plain text: a browser saves a plain-text answer from a download
// link as a file, which looks like the guide arrived broken.
const failed = (payment: string) => {
  const mail = `mailto:${EMAIL}?subject=${encodeURIComponent(
    'The Quiet Edge: my download'
  )}&amp;body=${encodeURIComponent(`My payment reference: ${payment}`)}`;
  const html = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>The Quiet Edge</title>
<body style="font: 18px/1.6 Georgia, serif; max-width: 560px; margin: 15vh auto; padding: 0 16px">
<p>Your payment went through, but the download didn’t start. Try the link again in a minute.</p>
<p>The guide is also in your Whop account, under The Quiet Edge.</p>
<p>Still nothing? <a href="${mail}">Email me</a> with your payment reference, <code>${payment}</code>, and I’ll send it to you.</p>
</body>
</html>`;
  return new NextResponse(html, {
    status: 502,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
};
