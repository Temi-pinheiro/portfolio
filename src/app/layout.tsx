import type { Metadata, Viewport } from 'next';
import { Inconsolata, Newsreader, Playfair_Display } from 'next/font/google';
import { CookieBanner } from '~~/components/CookieBanner';
import { Navigated } from '~~/components/Navigated';
import { EMAIL, PERSON_ID, SOCIALS } from '~~/lib/site';
import './globals.css';

// Display and story type, body copy, and small labels (the old site's font,
// kept for the small things). Exposed as CSS variables for globals.css.
const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});
const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-newsreader',
  display: 'swap',
});
const inconsolata = Inconsolata({
  subsets: ['latin'],
  variable: '--font-inconsolata',
  display: 'swap',
});

const siteUrl = 'https://temipinheiro.com';
// People search both names, and Google suggests "nigeria" and "lagos" after
// them, so the home title carries all of it (the 2026-10-23 search audit).
// Inner pages end in "| Temi Pinheiro", the name Whop and the emails use.
const title = 'Temitope (Temi) Pinheiro, developer from Lagos, Nigeria';
const description =
  'Temitope (Temi) Pinheiro, a developer from Lagos, Nigeria: co-founder and CTO at Kommunne, co-founder at Klaw, and UI/UX audits for founders who built their app with AI.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: '%s | Temi Pinheiro',
  },
  description,
  applicationName: 'Temitope Pinheiro',
  authors: [{ name: 'Temitope Pinheiro', url: siteUrl }],
  creator: 'Temitope Pinheiro',
  publisher: 'Temitope Pinheiro',
  keywords: [
    'Temitope Pinheiro',
    'Temi Pinheiro',
    'UI/UX Audit',
    'Mariposa Program',
    'Kommunne',
    'Klaw',
    'Next.js',
    'React',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Temitope Pinheiro',
    title,
    description,
    locale: 'en_US',
    // The landing's butterfly flapping: two wingbeats (6.4s) that loop,
    // rendered from lib/butterfly at the image's size. Where a platform plays
    // og:video it shows this; everywhere else shows the image. Only the home
    // page (and the 404) inherit it: every other page sets its own openGraph.
    // Absolute, because Next resolves images against metadataBase but not
    // videos.
    videos: [
      {
        url: `${siteUrl}/og/butterfly.mp4`,
        secureUrl: `${siteUrl}/og/butterfly.mp4`,
        type: 'video/mp4',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    creator: '@ndmhjt',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0f0f0e' },
    { media: '(prefers-color-scheme: light)', color: '#fafaf7' },
  ],
};

// Who the site is about, and the site itself. Other pages point at the person
// by PERSON_ID (the guide's author, the About page's subject) rather than
// repeating it.
const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: 'Temitope Pinheiro',
      alternateName: 'Temi Pinheiro',
      url: siteUrl,
      image: `${siteUrl}/about/temitope.jpg`,
      jobTitle: 'Developer',
      description:
        'A developer from Lagos, Nigeria. Co-founder and CTO at Kommunne, co-founder at Klaw, and UI/UX audits for apps built with AI.',
      worksFor: [
        { '@type': 'Organization', name: 'Kommunne', url: 'https://kommunne.com' },
        { '@type': 'Organization', name: 'Klaw', url: 'https://klaw.build' },
      ],
      email: `mailto:${EMAIL}`,
      sameAs: SOCIALS.map((s) => s.href),
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Temitope Pinheiro',
      alternateName: 'Temi Pinheiro',
      publisher: { '@id': PERSON_ID },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang='en'
      className={`${playfair.variable} ${newsreader.variable} ${inconsolata.variable}`}
    >
      <body>
        <Navigated />
        {children}
        <CookieBanner />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </body>
    </html>
  );
}
