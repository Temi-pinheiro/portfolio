import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Footer } from '~~/components/Footer';
import {
  FORMAT_LABEL,
  formatDate,
  getArticle,
  getArticles,
} from '~~/lib/articles';

const siteUrl = 'https://temipinheiro.com';

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
  const url = `${siteUrl}/articles/${slug}`;
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

  const url = `${siteUrl}/articles/${slug}`;
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
    author: { '@type': 'Person', name: 'Temitope Pinheiro', url: siteUrl },
    publisher: { '@type': 'Person', name: 'Temitope Pinheiro', url: siteUrl },
  };

  const backLink = (
    <Link
      href='/articles'
      className='text-sm text-[#808080] hover:text-[#FA6525] transition duration-200'
    >
      ← All articles
    </Link>
  );

  return (
    <div className='md:pt-[20px] mt-[120px] max-w-7xl mx-auto w-full px-6 md:mb-[182px]'>
      <article className='max-w-[720px]'>
        {backLink}
        <p className='mt-10 text-xs uppercase tracking-[0.15em] text-[#808080]'>
          {FORMAT_LABEL[article.format]} · {formatDate(article.date)} ·{' '}
          {article.readingMinutes} min read
          {article.draft && ' · Draft'}
        </p>
        <h1 className='mt-4 font-semibold text-[32px] md:text-[44px] leading-[1.15] tracking-tight'>
          {article.title}
        </h1>
        {article.description && (
          <p className='mt-5 text-base md:text-xl font-light text-[#808080]'>
            {article.description}
          </p>
        )}
        <hr className='mt-10 md:mt-12 dark:opacity-25' />
        <div
          className={`article-body mt-10 md:mt-12${
            article.format === 'interview' ? ' article-interview' : ''
          }`}
        >
          <Markdown remarkPlugins={[remarkGfm]}>{article.content}</Markdown>
        </div>
        {article.links.length > 0 && (
          <aside className='mt-16 border-t border-black dark:border-white/25 pt-6'>
            <p className='text-xs uppercase tracking-[0.15em] text-[#808080]'>
              Mentioned
            </p>
            <ul className='mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm'>
              {article.links.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target='_blank'
                    rel='noreferrer'
                    className='underline underline-offset-4 hover:text-[#FA6525] transition duration-200'
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
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Footer />
    </div>
  );
}
