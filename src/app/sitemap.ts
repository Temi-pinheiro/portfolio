import type { MetadataRoute } from 'next';
import { getArticles } from '~~/lib/articles';

const siteUrl = 'https://temipinheiro.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const articles = getArticles();
  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteUrl}/articles/${article.slug}`,
    lastModified: new Date(article.updated ?? article.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));
  const indexEntry: MetadataRoute.Sitemap = articles.length
    ? [
        {
          url: `${siteUrl}/articles`,
          lastModified: new Date(articles[0].date),
          changeFrequency: 'weekly',
          priority: 0.8,
        },
      ]
    : [];
  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${siteUrl}/projects`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...indexEntry,
    ...articleEntries,
  ];
}
