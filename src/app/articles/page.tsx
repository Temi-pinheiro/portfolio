import type { Metadata } from 'next';
import { ArticleList } from '~~/components/ArticleList';
import { PageTransition } from '~~/components/PageTransition';
import { SiteHeader } from '~~/components/SiteHeader';
import { FORMAT_LABEL, formatDate, getArticles } from '~~/lib/articles';

const description =
  'Interviews and essays by Temitope Pinheiro on building products, working with AI, and what it takes to ship and sell your own apps.';

export const metadata: Metadata = {
  title: 'Articles',
  description,
  alternates: { canonical: '/articles' },
  openGraph: {
    title: 'Articles | Temitope Pinheiro',
    description,
    url: 'https://temipinheiro.com/articles',
  },
};

export default function ArticlesPage() {
  const articles = getArticles().map((article) => ({
    slug: article.slug,
    title: article.title,
    description: article.description,
    image: article.image,
    meta: [
      FORMAT_LABEL[article.format],
      article.draft ? 'Draft' : formatDate(article.date),
      `${article.readingMinutes} min`,
    ].join(' · '),
  }));

  return (
    <>
      <SiteHeader current='articles' />
      <PageTransition>
        <main className='mx-auto max-w-[1440px] px-5 pb-28 md:px-10'>
          <section className='flex flex-wrap items-end justify-between gap-8 pt-16 md:pt-[clamp(64px,8vw,128px)]'>
            <div>
              <p className='font-mono text-[13px] tracking-[0.1em] text-muted uppercase'>
                Articles
              </p>
              <h1 className='mt-5 max-w-[960px] font-display text-[clamp(40px,5vw,78px)] leading-[1.06] tracking-[-0.022em]'>
                Mostly interviews, where I answer questions about what I’ve
                built.
              </h1>
            </div>
            <p className='max-w-[380px] text-[18px] leading-[1.6] text-muted'>
              Now and then an essay.
              {articles.length === 0 && ' The first pieces are being written.'}
            </p>
          </section>
          {articles.length > 0 && <ArticleList articles={articles} />}
        </main>
      </PageTransition>
    </>
  );
}
