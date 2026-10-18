'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, useSyncExternalStore } from 'react';
import mariposa from '~~/data/mariposa.json';
import { ARCHIVE_URL, SOCIALS } from '~~/lib/site';
import { AsciiButterfly } from '../AsciiButterfly';
import { ArrowRight, ArrowUpRight, Pause, Play } from '../icons';
import { LANDING, NavMorph, PageTransition } from '../PageTransition';

// Landing B from the redesign canvas: the story told one chapter at a time,
// and the site's links as tiles on the right that drift and grow on hover.
// Each tile morphs into its pill in the inner pages' header (NavMorph).
// One screen on desktop (overflow hidden); on a phone it is sized to fit one
// screen but scrolls rather than clips on short viewports.

type Chapter = { year: string; line: string; detail: string; href?: string };

const CHAPTERS: Chapter[] = [
  {
    year: '2020',
    line: 'I was making a poster a day, trying to picture feelings.',
    detail: '85 posters. They are the cards in Holo’d now.',
  },
  {
    year: '2021',
    line: 'I was writing the front end of a lending app for civil servants.',
    detail: 'P2Vest & Digithome · front-end developer',
  },
  {
    year: '2022',
    line: 'My work reached a million people, and I started leading the front end.',
    detail: 'Lendsqr · Woodcore · Wholistic',
  },
  {
    year: '2024',
    line: 'I co-founded a studio, and wrote down how it runs.',
    detail: 'Deesgn+ · co-founder & general admin',
  },
  {
    year: '2026',
    line: 'I’m building a social network, and shipping founders’ first products in four weeks.',
    detail: 'Kommunne · co-founder & CTO · Klaw · co-founder',
  },
  {
    year: 'Now',
    line: 'I help founders finish the apps they built fast.',
    detail:
      'The Mariposa Program · ten parts, from a free teardown to monthly care',
    href: '/mariposa',
  },
];

// The part names roll past on the Work with me tile; the first repeats at the
// end so the loop closes without a jump (see @keyframes roll).
const ROLL = [...mariposa.parts, mariposa.parts[0]];

// Negative delays start every cover mid-cycle, so one is always showing.
const COVERS = [
  { src: '/projects/holod.jpg', delay: '0s' },
  { src: '/projects/bord.jpg', delay: '-12s' },
  { src: '/projects/third-student.jpg', delay: '-8s' },
  { src: '/projects/portfolio-v3.jpg', delay: '-4s' },
];

type TileKey = 'work' | 'projects' | 'articles';
const BASE_GROW: Record<TileKey, number> = {
  work: 1.3,
  projects: 1.3,
  articles: 0.9,
};

const baliTime = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Makassar',
  hour: '2-digit',
  minute: '2-digit',
});
const subscribeClock = (onChange: () => void) => {
  const id = setInterval(onChange, 30_000);
  return () => clearInterval(id);
};

export const Landing = ({
  latest,
}: {
  latest?: { title: string; format: string };
}) => {
  const [chapter, setChapter] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [tile, setTile] = useState<TileKey | null>(null);
  const story = useRef<HTMLDivElement>(null);
  // Empty on the server, so the clock never causes a hydration mismatch.
  const time = useSyncExternalStore(
    subscribeClock,
    () => baliTime.format(new Date()),
    () => '',
  );

  const paused = hovering || stopped;
  const next = () => setChapter((c) => (c + 1) % CHAPTERS.length);
  const grow = (key: TileKey) =>
    tile ? (tile === key ? 2 : 0.75) : BASE_GROW[key];
  const tileEvents = (key: TileKey) => ({
    onMouseEnter: () => setTile(key),
    onMouseLeave: () => setTile(null),
    onFocus: () => setTile(key),
    onBlur: () => setTile(null),
  });

  return (
    <PageTransition>
      <div className="flex min-h-dvh flex-col px-5 pt-5 pb-5 md:h-dvh md:min-h-[640px] md:overflow-hidden md:px-10 md:pt-7 md:pb-8">
        <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <NavMorph name="wordmark">
            <Link
              href="/"
              className="font-display text-[19px] tracking-[-0.01em] md:text-[22px]"
            >
              Temitope Pinheiro
            </Link>
          </NavMorph>
          <div className="flex items-center gap-5 font-mono text-[12px] tracking-[0.04em] text-muted md:text-[13px]">
            <span className="tabular-nums">Bali {time}</span>
            <span aria-hidden className="hidden h-3.5 w-px bg-line md:block" />
            <ul className="hidden gap-5 md:flex">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-opacity duration-200 hover:opacity-55"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col gap-6 pt-6 md:flex-row md:gap-16">
          <section
            aria-label="My story, in chapters"
            className="relative flex min-w-0 flex-1 flex-col justify-end"
          >
            {/* The mariposa floats over the story, behind it: the canvas covers
                the column and reaches up beside the wordmark (72px: main's 24px
                padding, the header's 33px line and 15px of the page's top
                padding). It fits itself above the chapters, dipping a little
                behind them, and its pollen falls behind the text. */}
            <AsciiButterfly
              ground={story}
              className="anim-rise-y absolute inset-x-0 -top-[72px] hidden h-[calc(100%+72px)] w-full md:block"
              style={{ animationDelay: '400ms' }}
            />
            {/* All six chapters share one grid cell, so the block keeps the
                height of the longest and nothing below it jumps. Positioned, so
                it paints over the canvas. */}
            <div
              ref={story}
              className="relative grid max-w-[820px]"
              aria-live={stopped ? 'polite' : 'off'}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
              {CHAPTERS.map((c, i) => {
                const active = i === chapter;
                return (
                  <div
                    key={c.year}
                    aria-hidden={!active}
                    className="self-end transition-[opacity,transform] duration-[800ms] ease-soft [grid-area:1/1]"
                    style={{
                      opacity: active ? 1 : 0,
                      transform: active
                        ? 'none'
                        : `translateY(${i < chapter ? -14 : 14}px)`,
                      pointerEvents: active ? 'auto' : 'none',
                    }}
                  >
                    <p className="flex items-center gap-2.5 font-mono text-[12px] tracking-[0.08em] text-muted uppercase md:text-[13px]">
                      <span
                        aria-hidden
                        className="size-[7px] rounded-full bg-accent"
                      />
                      {c.year}
                    </p>
                    <p className="mt-3 font-display text-[clamp(26px,7vw,34px)] leading-[1.16] tracking-[-0.018em] text-balance md:mt-[18px] md:text-[clamp(32px,min(3.9vw,6.4vh),62px)]">
                      {c.line}
                    </p>
                    {c.href ? (
                      <Link
                        href={c.href}
                        transitionTypes={LANDING}
                        tabIndex={active ? 0 : -1}
                        className="mt-3.5 inline-flex items-center gap-2 font-mono text-[13px] tracking-[0.03em] text-muted underline decoration-underline underline-offset-4 transition-colors hover:text-ink md:mt-[22px] md:text-[14px]"
                      >
                        {c.detail}
                        <ArrowRight size={14} />
                      </Link>
                    ) : (
                      <p className="mt-3.5 font-mono text-[13px] tracking-[0.03em] text-muted md:mt-[22px] md:text-[14px]">
                        {c.detail}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="relative mt-5 flex max-w-[680px] items-end gap-2 md:mt-12">
              <div
                role="group"
                aria-label="Chapters"
                className="grid flex-1 grid-cols-6 gap-2 md:gap-2.5"
              >
                {CHAPTERS.map((c, i) => (
                  <button
                    key={c.year}
                    type="button"
                    aria-pressed={i === chapter}
                    aria-label={`${c.year}, chapter ${i + 1} of ${CHAPTERS.length}`}
                    onClick={() => setChapter(i)}
                    className={`flex min-h-11 flex-col items-start justify-end gap-2.5 pb-1.5 text-left font-mono text-[12px] tracking-[0.04em] transition-colors md:text-[13px] ${
                      i === chapter ? 'text-ink' : 'text-muted hover:text-ink'
                    }`}
                  >
                    <span>{c.year}</span>
                    <span
                      aria-hidden
                      className="relative block h-0.5 w-full overflow-hidden rounded-full bg-line"
                    >
                      {i === chapter && (
                        <span
                          className="anim-fill absolute inset-0 bg-ink"
                          style={{
                            animationPlayState: paused ? 'paused' : 'running',
                          }}
                          onAnimationEnd={next}
                        />
                      )}
                      {i < chapter && (
                        <span className="absolute inset-0 bg-muted" />
                      )}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setStopped((s) => !s)}
                aria-label={stopped ? 'Play the story' : 'Pause the story'}
                className="flex size-11 flex-none items-center justify-center text-muted transition-colors hover:text-ink"
              >
                {stopped ? <Play /> : <Pause />}
              </button>
            </div>
          </section>

          <nav
            aria-label="Explore"
            className="grid grid-cols-2 gap-2 md:flex md:min-h-0 md:w-[clamp(340px,31vw,460px)] md:flex-none md:flex-col md:gap-3 md:[container-type:size]"
          >
            <div
              className="anim-rise-x col-span-2 flex h-[96px] basis-0 transition-[flex-grow] duration-700 ease-soft md:h-auto md:min-h-0"
              style={{ flexGrow: grow('work'), animationDelay: '150ms' }}
            >
              <NavMorph name="mariposa">
                <Link
                  href="/mariposa"
                  transitionTypes={LANDING}
                  {...tileEvents('work')}
                  className="work-tile anim-drift relative flex flex-1 flex-col justify-between overflow-hidden rounded-[20px] bg-accent px-4 py-3.5 text-on-accent md:rounded-[22px] md:px-[26px] md:py-6"
                  style={{ animationDelay: '-2s' }}
                >
                  <span className="font-mono text-[12px] tracking-[0.08em] uppercase md:text-[13px]">
                    The Mariposa Program
                  </span>
                  <span className="block">
                    <span
                      aria-hidden
                      className="work-tile-roll hidden h-10 overflow-hidden md:mb-4 md:block"
                    >
                      <span className="anim-roll block font-display text-[30px] leading-10 italic">
                        {ROLL.map((p, i) => (
                          <span key={i} className="block h-10 whitespace-nowrap">
                            <span className="mr-2.5 align-[6px] font-mono text-[13px] not-italic">
                              {p.number}
                            </span>
                            {p.name}
                          </span>
                        ))}
                      </span>
                    </span>
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-display text-[24px] leading-[1.1] md:text-[30px]">
                        Work with me
                      </span>
                      <ArrowRight
                        className={`transition-transform duration-500 ease-soft ${tile === 'work' ? 'translate-x-1' : ''}`}
                      />
                    </span>
                  </span>
                </Link>
              </NavMorph>
            </div>

            <div
              className="anim-rise-x flex h-[112px] basis-0 transition-[flex-grow] duration-700 ease-soft md:h-auto md:min-h-0"
              style={{ flexGrow: grow('projects'), animationDelay: '250ms' }}
            >
              <NavMorph name="projects">
                <Link
                  href="/projects"
                  transitionTypes={LANDING}
                  {...tileEvents('projects')}
                  className="anim-drift relative flex-1 overflow-hidden rounded-[20px] bg-tile md:rounded-[22px]"
                  style={{ animationDelay: '-5s' }}
                >
                  {/* Hovering grows this tile by about half again. Sized to the
                      tile, the screenshot would zoom with it (~30%), so on desktop
                      it's sized off the column instead (100cqh, less the archive
                      link and gaps), a little short of the grown height: the tile
                      reveals more of it and zooms it under 10%. */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-full md:h-[calc((100cqh-94px)*0.53)] md:min-h-full"
                  >
                    {COVERS.map((c) => (
                      <span
                        key={c.src}
                        className="anim-cycle absolute inset-0"
                        style={{ animationDelay: c.delay }}
                      >
                        <Image
                          src={c.src}
                          alt=""
                          fill
                          sizes="(min-width: 768px) 460px, 50vw"
                          className="object-cover object-left-top"
                        />
                      </span>
                    ))}
                  </span>
                  <span className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-3 rounded-[12px] border border-line bg-paper px-3 py-2 md:inset-x-3.5 md:bottom-3.5 md:rounded-[14px] md:px-4 md:py-3">
                    <span className="font-display text-[19px] leading-[1.1] md:text-[24px]">
                      Projects
                    </span>
                    <span className="hidden font-mono text-[13px] text-muted lg:inline">
                      For the love of the game
                    </span>
                  </span>
                </Link>
              </NavMorph>
            </div>

            <div
              className="anim-rise-x flex h-[112px] basis-0 transition-[flex-grow] duration-700 ease-soft md:h-auto md:min-h-0"
              style={{ flexGrow: grow('articles'), animationDelay: '350ms' }}
            >
              <NavMorph name="articles">
                <Link
                  href="/articles"
                  transitionTypes={LANDING}
                  {...tileEvents('articles')}
                  className="articles-tile anim-drift relative flex min-h-0 flex-1 flex-col justify-between gap-3 overflow-hidden rounded-[20px] bg-tile px-4 py-3.5 md:rounded-[22px] md:px-[26px] md:py-[22px]"
                  style={{ animationDelay: '-7s' }}
                >
                  <span className="articles-tile-label hidden font-mono text-[13px] tracking-[0.08em] text-muted uppercase md:block">
                    {latest
                      ? `Latest ${latest.format.toLowerCase()}`
                      : 'Coming soon'}
                  </span>
                  {/* Fades out while another tile has squeezed this one, so the
                      clamp never cuts through the middle of a line. At rest it
                      fits the tile's height (see .articles-tile in globals.css). */}
                  <span
                    className={`articles-tile-title line-clamp-2 min-h-0 font-display text-[14px] leading-[1.25] italic transition-opacity duration-500 md:line-clamp-3 md:text-[22px] ${
                      tile && tile !== 'articles' ? 'md:opacity-0' : ''
                    }`}
                  >
                    {latest
                      ? `“${latest.title}”`
                      : 'Mostly interviews, where I answer questions about what I’ve built.'}
                  </span>
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-display text-[19px] leading-[1.1] md:text-[24px]">
                      Articles
                    </span>
                    <ArrowRight
                      size={20}
                      className={`transition-transform duration-500 ease-soft ${tile === 'articles' ? 'translate-x-1' : ''}`}
                    />
                  </span>
                </Link>
              </NavMorph>
            </div>

            <a
              href={ARCHIVE_URL}
              target="_blank"
              rel="noreferrer"
              className="anim-rise-x hidden flex-none items-center gap-3.5 rounded-2xl border border-line py-2.5 pr-[18px] pl-2.5 font-mono text-[13px] tracking-[0.03em] text-muted transition-colors hover:text-ink md:flex"
              style={{ animationDelay: '450ms' }}
            >
              <Image
                src="/projects/portfolio-v3.jpg"
                alt=""
                width={52}
                height={36}
                className="h-9 w-[52px] rounded-lg object-cover object-left-top"
              />
              <span className="text-ink">The old site</span>
              <span className="ml-auto">archive.temipinheiro.com</span>
              <ArrowUpRight />
            </a>
          </nav>
        </main>

        <div className="mt-3 flex items-center justify-between gap-3 font-mono text-[12px] tracking-[0.03em] text-muted md:hidden">
          <a
            href={ARCHIVE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5"
          >
            The old site <ArrowUpRight size={13} />
          </a>
          <ul className="flex gap-3.5">
            {SOCIALS.slice(0, 3).map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageTransition>
  );
};
