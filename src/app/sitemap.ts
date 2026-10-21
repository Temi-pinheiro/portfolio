import type { MetadataRoute } from 'next';
import { getArticles } from '~~/lib/articles';
import { SITE_URL } from '~~/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const articles = getArticles();
  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/articles/${article.slug}`,
    lastModified: new Date(article.updated ?? article.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));
  return [
    { url: SITE_URL, lastModified, changeFrequency: 'monthly', priority: 1 },
    {
      url: `${SITE_URL}/mariposa`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/articles`,
      lastModified: articles.length ? new Date(articles[0].date) : lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...articleEntries,
  ];
}
