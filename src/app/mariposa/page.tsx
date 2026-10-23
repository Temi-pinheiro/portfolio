import type { Metadata } from 'next';
import { Mariposa } from '~~/components/Mariposa';
import { PageTransition } from '~~/components/PageTransition';
import { SiteHeader } from '~~/components/SiteHeader';

// What founders search for, not the program's name: "Mariposa Program" brings
// up county services, and "lovable app" is searched about 7 times as often as
// "ux audit" (the 2026-10-23 search audit).
const title = 'UI/UX audit for Lovable, Bolt and Replit apps';
const description =
  'UI/UX audits for apps built with Lovable, Base44, Bolt or Replit, delivered within 24 hours. It starts with a free teardown: the three things I’d fix first.';

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
