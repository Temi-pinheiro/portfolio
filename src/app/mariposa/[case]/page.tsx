import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CaseBody, type Case } from '~~/components/Mariposa/CaseStudies';
import { primaryButton } from '~~/components/Mariposa/styles';
import { PageTransition } from '~~/components/PageTransition';
import { SiteHeader } from '~~/components/SiteHeader';
import data from '~~/data/mariposa.json';
import { caseSlug } from '~~/lib/cases';

// Each case study on /mariposa also has a page of its own, so it can rank and
// be linked to; on /mariposa it opens in a modal. Its ask is the page's one
// ask: the button goes back to /mariposa with the teardown form open.

const cases: Case[] = data.cases;
const find = (slug: string) => cases.find((study) => caseSlug(study.name) === slug);

export const dynamicParams = false;

export function generateStaticParams() {
  return cases.map((study) => ({ case: caseSlug(study.name) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ case: string }>;
}): Promise<Metadata> {
  const study = find((await params).case);
  if (!study) return {};
  const path = `/mariposa/${caseSlug(study.name)}`;
  const description = `${study.summary} ${study.facts
    .slice(0, 3)
    .map((fact) => `${fact.label}: ${fact.value.toLowerCase()}.`)
    .join(' ')}`;
  return {
    title: study.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${study.title} | Temi Pinheiro`,
      description,
      url: `https://temipinheiro.com${path}`,
      images: [{ url: study.before.src, alt: study.before.alt }],
    },
  };
}

export default async function CasePage({
  params,
}: {
  params: Promise<{ case: string }>;
}) {
  const study = find((await params).case);
  if (!study) notFound();
  return (
    <>
      <SiteHeader />
      <PageTransition>
        <main className='mx-auto max-w-[1120px] px-5 pb-28 md:px-10'>
          <section className='pt-16 pb-10 md:pt-[clamp(64px,8vw,128px)]'>
            <p className='font-mono text-[13px] tracking-[0.1em] text-muted uppercase'>
              <Link
                href='/mariposa'
                className='underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-300 hover:decoration-current'
              >
                The Mariposa Program
              </Link>{' '}
              · Case study
            </p>
            <h1 className='mt-5 max-w-[960px] font-display text-[clamp(40px,5vw,78px)] leading-[1.06] tracking-[-0.022em]'>
              {study.title}
            </h1>
          </section>
          <CaseBody
            study={study}
            cta={
              <Link href='/mariposa?teardown' className={primaryButton}>
                Request a free teardown
              </Link>
            }
          />
        </main>
      </PageTransition>
    </>
  );
}
