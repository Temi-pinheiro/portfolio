import type { Metadata } from 'next';
import { PageTransition } from '~~/components/PageTransition';
import { QuietEdge } from '~~/components/QuietEdge';
import { SiteHeader } from '~~/components/SiteHeader';
import { QUIET_EDGE } from '~~/lib/quietEdge';
import { SITE_URL } from '~~/lib/site';

// The guide's name alone is shared with other things people search for, so
// the title says what it is. "ai for work" is searched far more than "how to
// use ai at work" (the 2026-10-23 search audit).
const title = 'The Quiet Edge: a guide to using AI for work';
const description =
  'A field manual for using AI at work, for people who already use it a few times a week and suspect they’re getting a fraction of what it can do. Nine chapters, $27, every future edition included. Chapter 1 is free.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/quiet-edge' },
  openGraph: {
    title: `${title} | Temi Pinheiro`,
    description,
    url: 'https://temipinheiro.com/quiet-edge',
  },
};

// Product data lets search results show the price. The price comes from the
// same constant the page prints, so the two can't disagree.
const productJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'The Quiet Edge',
  description,
  image: `${SITE_URL}/quiet-edge/cover.jpg`,
  url: `${SITE_URL}/quiet-edge`,
  brand: { '@type': 'Brand', name: 'Temi Pinheiro' },
  offers: {
    '@type': 'Offer',
    price: QUIET_EDGE.price.replace('$', ''),
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: `${SITE_URL}/quiet-edge`,
  },
};

export default function QuietEdgePage() {
  return (
    <>
      {/* Motion server-renders revealed elements hidden; without JavaScript
          nothing would show them. */}
      <noscript>
        <style>{'[data-reveal]{opacity:1!important;transform:none!important}'}</style>
      </noscript>
      <SiteHeader current='quiet-edge' />
      <PageTransition>
        <QuietEdge />
      </PageTransition>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
    </>
  );
}
