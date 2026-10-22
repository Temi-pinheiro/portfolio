import type { Metadata, Viewport } from 'next';
import { Inconsolata, Newsreader, Playfair_Display } from 'next/font/google';
import { CookieBanner } from '~~/components/CookieBanner';
import { Navigated } from '~~/components/Navigated';
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
const title = 'Temitope Pinheiro';
const description =
  'Temitope Pinheiro builds products: co-founder and CTO at Kommunne, co-founder at Klaw, and the Mariposa Program for founders who built their app fast and want it to feel finished.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: '%s | Temitope Pinheiro',
  },
  description,
  applicationName: 'Temitope Pinheiro',
  authors: [{ name: 'Temitope Pinheiro', url: siteUrl }],
  creator: 'Temitope Pinheiro',
  publisher: 'Temitope Pinheiro',
  keywords: [
    'Temitope Pinheiro',
    'Fullstack Developer',
    'Product Designer',
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

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Temitope Pinheiro',
  url: siteUrl,
  jobTitle: 'Fullstack Developer',
  worksFor: [
    { '@type': 'Organization', name: 'Kommunne', url: 'https://kommunne.com' },
    { '@type': 'Organization', name: 'Klaw', url: 'https://klaw.build' },
  ],
  email: 'mailto:temitopepinheiro@gmail.com',
  sameAs: [
    'https://github.com/Temi-pinheiro',
    'https://www.linkedin.com/in/temitope-pinheiro/',
    'https://twitter.com/ndmhjt',
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  );
}
