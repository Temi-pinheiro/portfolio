import Image from 'next/image';
import Link from 'next/link';
import { LANDING, NavMorph } from '../PageTransition';

// The header on every page but the landing: the wordmark, and the landing's
// three tiles shrunk to pills, each with a small visual, then About me, which
// is the "More about me" link beside the landing's chapters. These stay still;
// only the landing's tiles drift. Navigating from the landing, each tile (and
// that link) morphs into its pill, and back again (NavMorph).

type Page = 'mariposa' | 'projects' | 'articles' | 'about';

const PILLS: { page: Page; href: string; label: string; visual: React.ReactNode }[] = [
  {
    page: 'mariposa',
    href: '/mariposa',
    label: 'Work with me',
    visual: (
      <span className='flex size-8 items-center justify-center rounded-[9px] bg-accent font-mono text-[11px] text-on-accent'>
        09
      </span>
    ),
  },
  {
    page: 'projects',
    href: '/projects',
    label: 'Projects',
    visual: (
      <span className='relative block size-8 overflow-hidden rounded-[9px]'>
        <Image
          src='/projects/holod.jpg'
          alt=''
          fill
          sizes='32px'
          className='object-cover object-left-top'
        />
      </span>
    ),
  },
  {
    page: 'articles',
    href: '/articles',
    label: 'Articles',
    visual: (
      <span className='flex size-8 flex-col justify-center gap-1 rounded-[9px] border border-line bg-paper px-[7px]'>
        <span className='h-0.5 rounded-full bg-ink' />
        <span className='h-0.5 rounded-full bg-muted' />
        <span className='h-0.5 w-3/5 rounded-full bg-muted' />
      </span>
    ),
  },
  {
    page: 'about',
    href: '/about',
    label: 'About me',
    visual: (
      <span className='relative block size-8 overflow-hidden rounded-[9px]'>
        <Image
          src='/about/temitope.jpg'
          alt=''
          fill
          sizes='32px'
          className='object-cover object-top'
        />
      </span>
    ),
  },
];

export const SiteHeader = ({ current }: { current?: Page }) => (
  <header className='mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-5 gap-y-4 px-5 pt-5 md:px-10 md:pt-7'>
    <NavMorph name='wordmark'>
      <Link
        href='/'
        transitionTypes={LANDING}
        className='font-display text-[20px] tracking-[-0.01em] md:text-[22px]'
      >
        Temitope Pinheiro
      </Link>
    </NavMorph>
    {/* Four pills don't fit one row on a phone, so there they're a two by
        two grid rather than three and a straggler. */}
    <nav aria-label='Main' className='w-full sm:w-auto'>
      <ul className='grid grid-cols-2 gap-2 sm:flex sm:flex-wrap md:gap-2.5'>
        {PILLS.map((pill) => {
          const active = pill.page === current;
          return (
            <li key={pill.page}>
              <NavMorph name={pill.page}>
                <Link
                  href={pill.href}
                  aria-current={active ? 'page' : undefined}
                  className={`group flex h-11 items-center gap-2.5 rounded-[14px] px-4 text-[15px] transition-colors sm:inline-flex sm:py-1.5 sm:pr-4 sm:pl-1.5 md:text-[16px] ${
                    active ? 'bg-ink text-paper' : 'bg-tile text-ink hover:bg-tile-2'
                  }`}
                >
                  <span
                    aria-hidden
                    className='hidden transition-transform duration-500 ease-soft group-hover:scale-[1.08] sm:inline-flex'
                  >
                    {pill.visual}
                  </span>
                  {pill.label}
                </Link>
              </NavMorph>
            </li>
          );
        })}
      </ul>
    </nav>
  </header>
);
