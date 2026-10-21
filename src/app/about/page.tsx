import type { Metadata } from 'next';
import { About } from '~~/components/About';
import { PageTransition } from '~~/components/PageTransition';
import { SiteHeader } from '~~/components/SiteHeader';

const description =
  'Temitope Pinheiro is a developer from Lagos, Nigeria. The longer story: networks, NetSuite, fintech front ends, a studio, a social network, and the trip to Bali that led to The Mariposa Program.';

export const metadata: Metadata = {
  title: 'About me',
  description,
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About me | Temitope Pinheiro',
    description,
    url: 'https://temipinheiro.com/about',
  },
};

export default function AboutPage() {
  return (
    <>
      {/* Motion server-renders revealed elements hidden; without JavaScript
          nothing would show them. */}
      <noscript>
        <style>{'[data-reveal]{opacity:1!important;transform:none!important}'}</style>
      </noscript>
      <SiteHeader current='about' />
      <PageTransition>
        <About />
      </PageTransition>
    </>
  );
}
