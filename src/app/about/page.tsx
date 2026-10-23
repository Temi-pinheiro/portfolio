import type { Metadata } from 'next';
import { About } from '~~/components/About';
import { PageTransition } from '~~/components/PageTransition';
import { SiteHeader } from '~~/components/SiteHeader';
import { PERSON_ID, SITE_URL } from '~~/lib/site';

const description =
  'Temitope (Temi) Pinheiro is a developer from Lagos, Nigeria. The longer story: networks, NetSuite, fintech front ends, a studio, a social network, and the trip to Bali that led to The Mariposa Program.';

export const metadata: Metadata = {
  title: 'About me',
  description,
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About me | Temi Pinheiro',
    description,
    url: 'https://temipinheiro.com/about',
  },
};

// Tells search engines this page is about the person the site describes
// (the Person in app/layout.tsx).
const profileJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  url: `${SITE_URL}/about`,
  mainEntity: { '@id': PERSON_ID },
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
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }}
      />
    </>
  );
}
