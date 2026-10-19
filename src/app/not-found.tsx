import Link from 'next/link';
import { LANDING, PageTransition } from '~~/components/PageTransition';
import { SiteHeader } from '~~/components/SiteHeader';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <PageTransition>
        <main className='mx-auto max-w-[1440px] px-5 pb-28 md:px-10'>
          <section className='pt-24 md:pt-40'>
            <p className='font-mono text-[13px] tracking-[0.1em] text-muted uppercase'>
              404
            </p>
            <h1 className='mt-5 max-w-[800px] font-display text-[clamp(40px,5vw,72px)] leading-[1.06] tracking-[-0.022em]'>
              Nothing lives here.
            </h1>
            <p className='mt-6 text-[19px] leading-[1.6] text-muted'>
              <Link
                href='/'
                transitionTypes={LANDING}
                className='text-ink underline decoration-accent decoration-1 underline-offset-4'
              >
                Start from the beginning
              </Link>
              , or try one of the pages above.
            </p>
          </section>
        </main>
      </PageTransition>
    </>
  );
}
