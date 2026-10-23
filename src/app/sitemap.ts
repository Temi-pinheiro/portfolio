import type { MetadataRoute } from 'next';
import cases from '~~/data/mariposa.json';
import { getArticles } from '~~/lib/articles';
import { caseSlug } from '~~/lib/cases';
import { SITE_URL } from '~~/lib/site';

// Only articles carry a lastModified: theirs is real. The other pages' would
// be the build time, which changes on every deploy and tells Google nothing.
// The Articles page joins once there's something on it (it's noindex until
// then).
export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getArticles();
  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/articles/${article.slug}`,
    lastModified: new Date(article.updated ?? article.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));
  const caseEntries: MetadataRoute.Sitemap = cases.cases.map((study) => ({
    url: `${SITE_URL}/mariposa/${caseSlug(study.name)}`,
    changeFrequency: 'yearly',
    priority: 0.7,
  }));
  return [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/mariposa`, changeFrequency: 'monthly', priority: 0.9 },
    ...caseEntries,
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/quiet-edge`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/projects`, changeFrequency: 'monthly', priority: 0.8 },
    ...(articles.length
      ? [
          {
            url: `${SITE_URL}/articles`,
            lastModified: new Date(articles[0].date),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
          },
        ]
      : []),
    ...articleEntries,
  ];
}
