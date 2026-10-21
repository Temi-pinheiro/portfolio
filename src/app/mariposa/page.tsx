import type { Metadata } from 'next';
import { Mariposa } from '~~/components/Mariposa';
import { PageTransition } from '~~/components/PageTransition';
import { SiteHeader } from '~~/components/SiteHeader';

const description =
  'For founders who built their app with AI tools and can tell it feels off. It starts with a free teardown: send your link, and get back the three things I’d fix first within 24 hours.';

export const metadata: Metadata = {
  title: 'The Mariposa Program',
  description,
  alternates: { canonical: '/mariposa' },
  openGraph: {
    title: 'The Mariposa Program | Temitope Pinheiro',
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
