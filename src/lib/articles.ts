import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

// Articles are Markdown files with YAML front matter. README.md ("Writing an
// article") lists the fields.
//
//   src/content/articles/<slug>.md  committed, published
//   src/content/drafts/<slug>.md    gitignored, local only, shown in `next dev`
//
// The repo is public, so unfinished pieces live in drafts/ and never reach
// GitHub. Moving a file to articles/ publishes it on the next deploy.

export type ArticleFormat = 'interview' | 'essay';

export type ArticleLink = { label: string; url: string };

export type Article = {
  slug: string;
  title: string;
  description: string;
  /** Publish date as yyyy-mm-dd. */
  date: string;
  /** Last substantive edit as yyyy-mm-dd, if any. */
  updated?: string;
  format: ArticleFormat;
  tags: string[];
  links: ArticleLink[];
  /** Optional cover (a path under public/): the top of the piece, the index's hover preview and the share image. */
  image?: string;
  draft: boolean;
  /** Markdown body with the front matter removed. */
  content: string;
  readingMinutes: number;
};

export const FORMAT_LABEL: Record<ArticleFormat, string> = {
  interview: 'Interview',
  essay: 'Essay',
};

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content');
const ARTICLES_DIR = path.join(CONTENT_DIR, 'articles');
const DRAFTS_DIR = path.join(CONTENT_DIR, 'drafts');

// Drafts (the drafts/ folder, or `draft: true` in articles/) show up in
// `next dev` so they can be previewed, and are left out of production builds
// entirely: the index, their pages, the sitemap and the Articles nav link.
const SHOW_DRAFTS = process.env.NODE_ENV !== 'production';

const WORDS_PER_MINUTE = 200;

function estimateReadingMinutes(markdown: string): number {
  const words = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function toIsoDate(value: unknown, file: string, field: string): string {
  // YAML turns an unquoted 2026-10-20 into a Date; a quoted one stays a string.
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  throw new Error(
    `Article "${file}": "${field}" must be a date written as yyyy-mm-dd.`
  );
}

function parseArticle(dir: string, file: string, isDraft: boolean): Article {
  const raw = fs.readFileSync(path.join(dir, file), 'utf8');
  const { data, content } = matter(raw);
  const title = typeof data.title === 'string' ? data.title.trim() : '';
  if (!title) {
    throw new Error(`Article "${file}" needs a "title" in its front matter.`);
  }
  const links: ArticleLink[] = Array.isArray(data.links)
    ? data.links
        .filter(
          (l) => l && typeof l.label === 'string' && typeof l.url === 'string'
        )
        .map((l) => ({ label: l.label, url: l.url }))
    : [];
  return {
    slug: file.replace(/\.md$/, ''),
    title,
    description:
      typeof data.description === 'string' ? data.description.trim() : '',
    date: toIsoDate(data.date, file, 'date'),
    updated: data.updated ? toIsoDate(data.updated, file, 'updated') : undefined,
    format: data.format === 'essay' ? 'essay' : 'interview',
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    links,
    image:
      typeof data.image === 'string' && data.image.startsWith('/')
        ? data.image
        : undefined,
    draft: isDraft || data.draft === true,
    content,
    readingMinutes: estimateReadingMinutes(content),
  };
}

function readDir(dir: string, isDraft: boolean): Article[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => /^[a-z0-9-]+\.md$/.test(file))
    .map((file) => parseArticle(dir, file, isDraft));
}

let cache: Article[] | undefined;

/** Articles newest first. Drafts are included outside production only. */
export function getArticles(): Article[] {
  if (cache && !SHOW_DRAFTS) return cache;
  const bySlug = new Map<string, Article>();
  const sources = [
    ...readDir(ARTICLES_DIR, false),
    ...(SHOW_DRAFTS ? readDir(DRAFTS_DIR, true) : []),
  ];
  for (const article of sources) {
    // A published piece wins over a leftover draft with the same slug.
    if (!bySlug.has(article.slug)) bySlug.set(article.slug, article);
  }
  const articles = [...bySlug.values()]
    .filter((article) => SHOW_DRAFTS || !article.draft)
    .sort(
      (a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title)
    );
  cache = articles;
  return articles;
}

export function getArticle(slug: string): Article | undefined {
  return getArticles().find((article) => article.slug === slug);
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "20 Oct 2026" from "2026-10-20", with no timezone drift. */
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(`${isoDate}T00:00:00Z`));
}
