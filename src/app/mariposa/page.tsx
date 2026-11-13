import type { Metadata } from 'next';
import { Mariposa } from '~~/components/Mariposa';
import { PageTransition } from '~~/components/PageTransition';
import { SiteHeader } from '~~/components/SiteHeader';

// What business owners search for, not the program's name: "Mariposa
// Program" brings up county services.
const title = 'AI systems and agents for businesses, built to order';
const description =
  'An AI operating system that knows how your business works, and agents that each take a job off your team, built inside the tools you already use. Start with nine questions and get a free prognosis.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/mariposa' },
  openGraph: {
    title: `${title} | Temi Pinheiro`,
    description,
    url: 'https://temipinheiro.com/mariposa',
  },
};

export default function MariposaPage() {
  return (
    <>
      {/* Motion server-renders revealed elements hidden; without JavaScript
          nothing would show them. */}
      <noscript>
        <style>{'[data-reveal]{opacity:1!important;transform:none!important}'}</style>
      </noscript>
      <SiteHeader current='mariposa' />
      <PageTransition>
        <Mariposa />
      </PageTransition>
    </>
  );
}
