import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import Link from 'next/link';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PageTransition } from '~~/components/PageTransition';
import { SiteHeader } from '~~/components/SiteHeader';

// The privacy notice, in the three languages I sell and write outreach in.
// The text lives in src/content/privacy/<code>.md; the cold-email footers
// link to these paths, so keep them stable. When the text changes, change
// UPDATED (and the dates below) with it.
const UPDATED = '2026-11-03';

export const NOTICES = {
  en: {
    lang: 'en',
    href: '/privacy',
    name: 'English',
    title: 'Privacy notice',
    description:
      'What personal data Temitope Pinheiro collects on this site, through Whop, on the email list and in outreach, why, and how to see or delete it.',
    updated: 'Last updated 3 November 2026',
  },
  pt: {
    lang: 'pt-BR',
    href: '/privacy/pt',
    name: 'Português',
    title: 'Aviso de privacidade',
    description:
      'Quais dados pessoais Temitope Pinheiro coleta no site, pela Whop, na lista de e-mails e na prospecção, para quê, e como vê-los ou apagá-los.',
    updated: 'Atualizado em 3 de novembro de 2026',
  },
  es: {
    lang: 'es',
    href: '/privacy/es',
    name: 'Español',
    title: 'Aviso de privacidad',
    description:
      'Qué datos personales recaba Temitope Pinheiro en el sitio, en Whop, en la lista de correo y en la prospección, para qué, y cómo verlos o borrarlos.',
    updated: 'Actualizado el 3 de noviembre de 2026',
  },
} as const;

export type NoticeCode = keyof typeof NOTICES;

const languages = Object.fromEntries(
  Object.values(NOTICES).map((n) => [n.lang, n.href])
);

export function noticeMetadata(code: NoticeCode): Metadata {
  const notice = NOTICES[code];
  return {
    title: notice.title,
    description: notice.description,
    alternates: { canonical: notice.href, languages },
    openGraph: {
      title: `${notice.title} | Temitope Pinheiro`,
      description: notice.description,
      url: notice.href,
    },
  };
}

export const PrivacyNotice = ({ code }: { code: NoticeCode }) => {
  const notice = NOTICES[code];
  const text = fs.readFileSync(
    path.join(process.cwd(), 'src/content/privacy', `${code}.md`),
    'utf8'
  );
  const others = Object.entries(NOTICES).filter(([c]) => c !== code);

  return (
    <>
      <SiteHeader />
      <PageTransition>
        <main className='mx-auto max-w-[1440px] px-5 pb-28 md:px-10'>
          <article lang={notice.lang} className='mx-auto max-w-[720px] pt-14 md:pt-24'>
            <p className='font-mono text-[13px] tracking-[0.06em] text-muted uppercase'>
              <time dateTime={UPDATED}>{notice.updated}</time>
            </p>
            <h1 className='mt-5 font-display text-[clamp(36px,4.4vw,60px)] leading-[1.1] tracking-[-0.02em] text-balance'>
              {notice.title}
            </h1>
            <ul className='mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[13px] tracking-[0.04em]'>
              {others.map(([c, other]) => (
                <li key={c} lang={other.lang}>
                  <Link
                    href={other.href}
                    hrefLang={other.lang}
                    className='text-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink'
                  >
                    {other.name}
                  </Link>
                </li>
              ))}
            </ul>
            <hr className='mt-10 border-line md:mt-12' />
            <div className='article-body mt-10 md:mt-12'>
              <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
            </div>
          </article>
        </main>
      </PageTransition>
    </>
  );
};
