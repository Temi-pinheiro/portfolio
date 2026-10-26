import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { FORMAT_LABEL, getArticle, getArticles } from '~~/lib/articles';
import { ogContentType, ogImage, ogSize } from '~~/lib/og';

// Prerender one image per published article alongside the page itself.
export function generateStaticParams() {
  return getArticles().map((article) => ({ slug: article.slug }));
}

export const alt = 'Article by Temitope Pinheiro';
export const size = ogSize;
export const contentType = ogContentType;

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  // An article with a cover shares the cover, so the link preview on X and
  // elsewhere is the picture at the top of the piece. If the file can't be
  // read, the usual card stands in.
  if (article?.image) {
    const file = await readFile(path.join(process.cwd(), 'public', article.image)).catch(
      () => undefined
    );
    if (file) {
      const type = article.image.endsWith('.png') ? 'image/png' : 'image/jpeg';
      return new ImageResponse(
        (
          <div style={{ width: '100%', height: '100%', display: 'flex' }}>
            <img
              src={`data:${type};base64,${file.toString('base64')}`}
              alt=''
              width={ogSize.width}
              height={ogSize.height}
              style={{ objectFit: 'cover' }}
            />
          </div>
        ),
        ogSize
      );
    }
  }
  const label = article ? FORMAT_LABEL[article.format].toUpperCase() : 'ARTICLES';
  return ogImage({
    label: `TEMITOPE PINHEIRO · ${label}`,
    title: article?.title ?? 'Articles',
    path: '/articles',
  });
}
