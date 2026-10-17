import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '~~/components/Footer';
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
  const articles = getArticles();
  return (
    <div className='md:pt-[20px] mt-[120px] max-w-7xl mx-auto w-full px-6 md:mb-[182px]'>
      <h1 id='articles' className='font-semibold text-[44px]'>
        Articles
      </h1>
      <p className='font-light text-[#808080] text-sm max-w-[624px]'>
        Mostly interviews, where I answer questions about the things I have
        built and how I work. Now and then an essay.
      </p>
      {articles.length === 0 ? (
        <p className='mt-8 md:mt-20 font-light text-[#808080] text-sm'>
          Nothing here yet. The first few pieces are being written.
        </p>
      ) : (
        <ul className='mt-8 md:mt-20 flex flex-col'>
          {articles.map((article) => (
            <li
              key={article.slug}
              className='border-t border-black dark:border-white/25 last:border-b'
            >
              <Link
                href={`/articles/${article.slug}`}
                className='group block py-8 md:py-10'
              >
                <p className='text-xs uppercase tracking-[0.15em] text-[#808080]'>
                  {FORMAT_LABEL[article.format]} · {formatDate(article.date)} ·{' '}
                  {article.readingMinutes} min read
                  {article.draft && ' · Draft'}
                </p>
                <h2 className='mt-3 font-semibold text-xl md:text-[28px] leading-snug tracking-tight group-hover:text-[#FA6525] transition duration-200'>
                  {article.title}
                </h2>
                <p className='mt-3 text-sm md:text-base max-w-[624px] text-[#808080] font-light'>
                  {article.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Footer />
    </div>
  );
}
