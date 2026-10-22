import type { Metadata } from 'next';
import { PageTransition } from '~~/components/PageTransition';
import { QuietEdge } from '~~/components/QuietEdge';
import { SiteHeader } from '~~/components/SiteHeader';

const description =
  'A field manual for using AI at work, for people who already use it a few times a week and suspect they’re getting a fraction of what it can do. Nine chapters, $27, every future edition included. Chapter 1 is free.';

export const metadata: Metadata = {
  title: 'The Quiet Edge',
  description,
  alternates: { canonical: '/quiet-edge' },
  openGraph: {
    title: 'The Quiet Edge | Temitope Pinheiro',
    description,
    url: 'https://temipinheiro.com/quiet-edge',
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
      <SiteHeader />
      <PageTransition>
        <QuietEdge />
      </PageTransition>
    </>
  );
}
