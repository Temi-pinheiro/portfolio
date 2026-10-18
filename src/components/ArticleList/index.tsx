'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export type ArticleRow = {
  slug: string;
  title: string;
  description: string;
  meta: string;
  image?: string;
};

// Hovering a row fades the others, nudges its title along and, when the piece
// has an `image` in its front matter, shows it on the right.

export const ArticleList = ({ articles }: { articles: ArticleRow[] }) => {
  const [hover, setHover] = useState<string | null>(null);

  return (
    <ol className='mt-14 border-t border-line md:mt-[clamp(56px,6vw,96px)]'>
      {articles.map((article) => {
        const active = hover === article.slug;
        const dimmed = hover !== null && !active;
        return (
          <li
            key={article.slug}
            className='border-b border-line transition-opacity duration-500'
            style={{ opacity: dimmed ? 0.45 : 1 }}
          >
            <Link
              href={`/articles/${article.slug}`}
              onMouseEnter={() => setHover(article.slug)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(article.slug)}
              onBlur={() => setHover(null)}
              className='grid items-center gap-y-2.5 py-8 md:grid-cols-[220px_minmax(0,1fr)_200px] md:gap-x-10'
            >
              <span className='font-mono text-[13px] tracking-[0.04em] text-muted'>
                {article.meta}
              </span>
              <span
                className='block transition-transform duration-[600ms] ease-soft motion-reduce:transition-none'
                style={{ transform: active ? 'translateX(10px)' : 'none' }}
              >
                <span className='block font-display text-[clamp(24px,2.3vw,36px)] leading-[1.18] tracking-[-0.012em]'>
                  {article.title}
                </span>
                {article.description && (
                  <span className='mt-2.5 block max-w-[640px] text-[18px] leading-[1.55] text-muted'>
                    {article.description}
                  </span>
                )}
              </span>
              <span
                aria-hidden
                className='relative hidden h-[136px] w-[200px] justify-self-end overflow-hidden rounded-[14px] bg-tile transition-[opacity,transform] duration-700 ease-soft md:block'
                style={{
                  opacity: active && article.image ? 1 : 0,
                  transform: active
                    ? 'translateY(0) rotate(-2deg)'
                    : 'translateY(10px) scale(0.96)',
                }}
              >
                {article.image && (
                  <Image
                    src={article.image}
                    alt=''
                    fill
                    sizes='200px'
                    className='object-cover object-left-top'
                  />
                )}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
};
