import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PageTransition } from '~~/components/PageTransition';
import { SiteHeader } from '~~/components/SiteHeader';
import {
  FORMAT_LABEL,
  formatDate,
  getArticle,
  getArticles,
} from '~~/lib/articles';
import { SITE_URL } from '~~/lib/site';

type Params = { slug: string };

// Every article is prerendered; an unknown slug is a 404, not a server render.
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const url = `${SITE_URL}/articles/${slug}`;
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/articles/${slug}` },
    openGraph: {
      type: 'article',
      title: `${article.title} | Temitope Pinheiro`,
      description: article.description,
      url,
      publishedTime: article.date,
      modifiedTime: article.updated ?? article.date,
      authors: ['Temitope Pinheiro'],
      tags: article.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
    },
    robots: article.draft ? { index: false, follow: false } : undefined,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const url = `${SITE_URL}/articles/${slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.updated ?? article.date,
    url,
    mainEntityOfPage: url,
    image: `${url}/opengraph-image`,
    keywords: article.tags.join(', '),
    inLanguage: 'en',
    author: { '@type': 'Person', name: 'Temitope Pinheiro', url: SITE_URL },
    publisher: { '@type': 'Person', name: 'Temitope Pinheiro', url: SITE_URL },
  };

  const backLink = (
    <Link
      href='/articles'
      className='font-mono text-[13px] tracking-[0.04em] text-muted transition-colors hover:text-ink'
    >
      ← All articles
    </Link>
  );

  return (
    <>
      <SiteHeader current='articles' />
      <PageTransition>
        <main className='mx-auto max-w-[1440px] px-5 pb-28 md:px-10'>
          <article className='mx-auto max-w-[720px] pt-14 md:pt-24'>
            {backLink}
            <p className='mt-10 font-mono text-[13px] tracking-[0.06em] text-muted uppercase'>
              {FORMAT_LABEL[article.format]} · {formatDate(article.date)} ·{' '}
              {article.readingMinutes} min read
              {article.draft && ' · Draft'}
            </p>
            <h1 className='mt-5 font-display text-[clamp(36px,4.4vw,60px)] leading-[1.1] tracking-[-0.02em] text-balance'>
              {article.title}
            </h1>
            {article.description && (
              <p className='mt-6 text-[20px] leading-[1.55] text-muted md:text-[22px]'>
                {article.description}
              </p>
            )}
            {/* The cover is also the article's share image (opengraph-image.tsx),
                so it keeps the share card's shape. */}
            {article.image ? (
              <div className='relative mt-10 aspect-[1200/630] overflow-hidden rounded-[14px] md:mt-12'>
                <Image
                  src={article.image}
                  alt=''
                  fill
                  preload
                  sizes='(min-width: 768px) 720px, 100vw'
                  className='object-cover'
                />
              </div>
            ) : (
              <hr className='mt-10 border-line md:mt-12' />
            )}
            <div
              className={`article-body mt-10 md:mt-12${
                article.format === 'interview' ? ' article-interview' : ''
              }`}
            >
              <Markdown remarkPlugins={[remarkGfm]}>{article.content}</Markdown>
            </div>
            {article.links.length > 0 && (
              <aside className='mt-16 border-t border-line pt-6'>
                <p className='font-mono text-[12px] tracking-[0.1em] text-muted uppercase'>
                  Mentioned
                </p>
                <ul className='mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[17px]'>
                  {article.links.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target='_blank'
                        rel='noreferrer'
                        className='underline decoration-accent decoration-1 underline-offset-4 transition-colors hover:text-accent-text'
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
            <p className='mt-16'>{backLink}</p>
          </article>
        </main>
      </PageTransition>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
