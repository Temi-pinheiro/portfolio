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
  const label = article ? FORMAT_LABEL[article.format].toUpperCase() : 'ARTICLES';
  return ogImage({
    label: `TEMITOPE PINHEIRO · ${label}`,
    title: article?.title ?? 'Articles',
    path: '/articles',
  });
}
