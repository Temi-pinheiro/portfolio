import type { Metadata } from 'next';
import { PageTransition } from '~~/components/PageTransition';
import { ProjectGrid } from '~~/components/ProjectGrid';
import { SiteHeader } from '~~/components/SiteHeader';

const description =
  'Things Temitope Pinheiro made and shared: Holo’d, Bord, The Third Student and the site before this one.';

export const metadata: Metadata = {
  title: 'Projects',
  description,
  alternates: { canonical: '/projects' },
  openGraph: {
    title: 'Projects | Temitope Pinheiro',
    description,
    url: 'https://temipinheiro.com/projects',
  },
};

export default function ProjectsPage() {
  return (
    <>
      <SiteHeader current='projects' />
      <PageTransition>
        <main className='mx-auto max-w-[1440px] px-5 pb-28 md:px-10'>
          <section className='flex flex-wrap items-end justify-between gap-8 pt-16 md:pt-[clamp(64px,8vw,128px)]'>
            <div>
              <p className='font-mono text-[13px] tracking-[0.1em] text-muted uppercase'>
                Projects
              </p>
              <h1 className='mt-5 max-w-[900px] font-display text-[clamp(44px,5.6vw,88px)] leading-[1.04] tracking-[-0.025em]'>
                For the love of the game
              </h1>
            </div>
            <p className='max-w-[420px] text-[18px] leading-[1.6] text-muted'>
              Things I made for myself and decided to share with the world.
            </p>
          </section>
          <ProjectGrid />
        </main>
      </PageTransition>
    </>
  );
}
