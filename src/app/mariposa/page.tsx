import type { Metadata } from 'next';
import { Mariposa } from '~~/components/Mariposa';
import { PageTransition } from '~~/components/PageTransition';
import { SiteHeader } from '~~/components/SiteHeader';

const description =
  'The Mariposa Program: a ten-part UI/UX process for web apps built fast with AI. A free teardown, a 24-hour audit, a one-week build, a re-audit and monthly care. Buy the parts you need, or all of them.';

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
      <SiteHeader current='mariposa' />
      <PageTransition>
        <Mariposa />
      </PageTransition>
    </>
  );
}
