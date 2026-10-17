This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Writing an article

Write in `src/content/drafts/<slug>.md`. That folder is gitignored (this repo
is public), and drafts render only in `npm run dev`. To publish, move the file
to `src/content/articles/` and push. The file name is the URL
(`/articles/<slug>`), so keep it to lowercase letters, digits and hyphens. Each
file starts with YAML front matter:

```yaml
---
title: "How I built Bord"
description: "One or two sentences. Used for the index, meta description and link previews."
date: 2026-10-20          # publish date, yyyy-mm-dd
updated: 2026-11-02       # optional, when the piece changes materially
format: interview         # or essay; interview styles every ## heading as a question
tags: [bord, ios]
links:                    # optional, shown as "Mentioned" at the end
  - label: Bord
    url: https://mybord.vercel.app/
draft: true               # optional: keep a committed piece out of production
---
```

The body is Markdown (GitHub flavoured). Drafts are left out of production
builds, the sitemap and the nav, so the Articles link appears once the first
piece is published.
