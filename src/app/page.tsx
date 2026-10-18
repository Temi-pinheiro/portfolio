import { Landing } from '~~/components/Landing';
import { FORMAT_LABEL, getArticles } from '~~/lib/articles';

// The home page inherits the SEO metadata defined in `layout.tsx` (title,
// description, Open Graph, Twitter, canonical).

export default function Home() {
  const latest = getArticles()[0];
  return (
    <Landing
      latest={
        latest
          ? { title: latest.title, format: FORMAT_LABEL[latest.format] }
          : undefined
      }
    />
  );
}
