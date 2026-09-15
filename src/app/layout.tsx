import type { Metadata, Viewport } from 'next';
import { Inconsolata } from 'next/font/google';
import './globals.css';
import { AppShell } from '~~/components/AppShell';

const inconsolata = Inconsolata({ subsets: ['latin'] });

const siteUrl = 'https://temipinheiro.com';
const description =
  'Temitope Pinheiro — fullstack developer and co-founder. Building Kommunne, and shipping founder MVPs in four weeks at Klaw.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Temitope Pinheiro — Fullstack Developer',
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
    'Software Engineer',
    'Frontend Developer',
    'React',
    'Next.js',
    'TypeScript',
    'SaaS',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Temitope Pinheiro',
    title: 'Temitope Pinheiro — Fullstack Developer',
    description,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Temitope Pinheiro — Fullstack Developer',
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
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#010101' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
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
    <html lang="en">
      <body className={inconsolata.className}>
        <AppShell>{children}</AppShell>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  );
}
