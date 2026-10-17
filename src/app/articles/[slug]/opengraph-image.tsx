import { ImageResponse } from 'next/og';
import { FORMAT_LABEL, getArticle, getArticles } from '~~/lib/articles';

// Prerender one image per published article alongside the page itself.
export function generateStaticParams() {
  return getArticles().map((article) => ({ slug: article.slug }));
}

export const alt = 'Article by Temitope Pinheiro';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  const title = article?.title ?? 'Articles';
  const label = article ? FORMAT_LABEL[article.format].toUpperCase() : 'ARTICLES';
  const fontSize = title.length > 70 ? 52 : title.length > 40 ? 62 : 76;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '96px',
          background: '#010101',
          color: '#ffffff',
        }}
      >
        <div style={{ fontSize: 34, color: '#808080', letterSpacing: 4 }}>
          {`TEMITOPE PINHEIRO · ${label}`}
        </div>
        <div
          style={{
            fontSize,
            fontWeight: 700,
            marginTop: 28,
            lineHeight: 1.1,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 30, marginTop: 40, color: '#2C1DFF' }}>
          temipinheiro.com/articles
        </div>
      </div>
    ),
    { ...size }
  );
}
