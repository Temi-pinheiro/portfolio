import type { Metadata, Viewport } from 'next';
import { Inconsolata } from 'next/font/google';
import './globals.css';
import { AppShell } from '~~/components/AppShell';
import { getArticles } from '~~/lib/articles';

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

// Whop Pixel for the Holo'd business (biz_71ryNxzPwKZ7zI). Whop asks for this
// snippet verbatim in the <head> of every page; the root layout covers them all.
// The loader it pulls in (t.whop.tw/s.js) hooks pushState/popstate itself, so
// client-side navigations between / and /projects send their own page events.
const whopPixel = `!function(w,d,s,u,n,a,b){if(w[n])return;a=w[n]={q:[],t:+new Date,s:[],o:u,track:function(){a.q.push([+new Date].concat([].slice.call(arguments)))},setScope:function(){a.s=[].slice.call(arguments).filter(function(x){return typeof x==="string"});a.q.push([+new Date,"setScope"].concat(a.s))},scope:function(){var c=[].slice.call(arguments);return{track:function(){a.q.push([+new Date].concat([].slice.call(arguments)).concat([{__scope:c}]))}}}};b=d.createElement(s);b.async=1;b.src=u+"/s.js";d.getElementsByTagName(s)[0].parentNode.insertBefore(b,d.getElementsByTagName(s)[0])}(window,document,"script","https://t.whop.tw","whop");whop.setScope("biz_71ryNxzPwKZ7zI");whop.track("page");`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The Articles link appears once the first article is published. Drafts
  // count in `next dev`, not in production, so /articles exists but stays
  // unlinked until then.
  const showArticles = getArticles().length > 0;

  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: whopPixel }} />
      </head>
      <body className={inconsolata.className}>
        <AppShell showArticles={showArticles}>{children}</AppShell>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  );
}
