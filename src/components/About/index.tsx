'use client';

import { MotionConfig } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { SOCIALS } from '~~/lib/site';
import { ArrowRight, ArrowUpRight } from '../icons';
import { FadeUp, WordReveal } from '../motion/Reveal';

// The longer story behind the landing's chapters: who I am beside my photo,
// then each chapter told in full, then the trip to Bali that ties them
// together and leads to the one next step, The Mariposa Program. The facts
// come from the user's résumé (September 2024) and the old site's
// experiences, as corrected by the user.

type Chapter = {
  year: string;
  title: string;
  body: string[];
  detail: string;
};

const CHAPTERS: Chapter[] = [
  {
    year: 'Before 2020',
    title: 'I studied IT in Cyprus, then came home to keep networks running.',
    body: [
      'I took a degree in Information Technology at Eastern Mediterranean University in Cyprus, then came back to Lagos. My first jobs were on the infrastructure side. As an intern network engineer at Airtel, I monitored roaming traffic and ran uptime checks with partner networks, and at Ericsson I helped move people off legacy systems and devices.',
    ],
    detail: 'Eastern Mediterranean University · Airtel Nigeria · Ericsson',
  },
  {
    year: '2020',
    title: 'I was connecting banks to NetSuite, and making a poster a day.',
    body: [
      'At AMT Digital I went from associate to lead technical consultant. I integrated other platforms with the NetSuite ERP, led a team of developers, and built a SuiteApp that automated bank reconciliation for clients across Africa. It has handled more than two million transactions.',
      'Alongside that, I made a poster a day, trying to picture feelings. There are 85 of them, and they’re the cards in Holo’d now.',
    ],
    detail: 'AMT Digital · associate to lead technical consultant',
  },
  {
    year: '2021',
    title: 'I moved to the front end, building a lending app for civil servants.',
    body: [
      'At P2Vest I led the build of a lending platform from the ground up, so civil servants could get loans more easily, working closely with the design and product team on how it felt to use. Then I helped build their real estate platform, working on both the back end and the front end, and helped improve its search for users across all 36 Nigerian states.',
    ],
    detail: 'P2Vest & Digithome · front-end developer',
  },
  {
    year: '2022',
    title: 'My work reached a million people, and I started leading the front end.',
    body: [
      'At Lendsqr I worked with the product teams on features used by more than 300 organisations and a million people, mentored three junior developers, and started brown-bag sessions with our engineering manager so the engineers could teach each other. For Assurdly, I led the build of a direct-debit platform for partner banks, with two-factor sign-in, inactivity timeouts and network-level encryption.',
      'At Woodcore I led three developers through a move from JavaScript to TypeScript that took out 40,000 lines of code, and built the landing page for the rebrand. At Wholistic I was the lead front-end developer on a project management dashboard with an AI assistant, Google Workspace and Slack built in, and a template builder for client reports.',
    ],
    detail: 'Lendsqr · Woodcore · Wholistic',
  },
  {
    year: '2024',
    title: 'I co-founded a studio, and wrote down how it runs.',
    body: [
      'At Deesgn+ I was co-founder and general admin. I set up how the company runs: its structure, its procedures, and the playbook for how a project is scoped, run and handed off. I also looked after the web side of the studio’s projects.',
    ],
    detail: 'Deesgn+ · co-founder & general admin',
  },
  {
    year: '2026',
    title: 'I’m building a social network, and shipping founders’ first products in four weeks.',
    body: [
      'Kommunne is a social network I co-founded, and we’re still building it. I’m the lead product developer, working with a backend developer, a designer who owns the design, and my co-founder, Yinka. At Klaw, another studio I co-founded, I lead the builds, taking founders from a five-day scope sprint to a shipped product in four weeks. AI does a lot of the generating; the last ten percent is judgement.',
      'In between, I build apps for the love of it: Bord, The Third Student and Holo’d.',
    ],
    detail: 'Kommunne · co-founder & CTO · Klaw · co-founder',
  },
];

const eyebrow = 'font-mono text-[13px] tracking-[0.1em] text-muted uppercase';

// The name on each network: the last part of the profile's address.
const handle = (href: string) =>
  new URL(href).pathname.split('/').filter(Boolean).pop() ?? '';

export const About = () => (
  <MotionConfig reducedMotion='user'>
    <main className='mx-auto max-w-[1440px] px-5 pb-28 md:px-10'>
      <section className='grid items-end gap-10 pt-16 md:pt-[clamp(64px,8vw,128px)] lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-[clamp(48px,6vw,112px)]'>
        <div>
          <FadeUp>
            <p className={eyebrow}>About me</p>
          </FadeUp>
          <WordReveal
            as='h1'
            text='I’m Temitope, a developer from Lagos, Nigeria.'
            className='mt-5 max-w-[960px] font-display text-[clamp(44px,5.6vw,88px)] leading-[1.04] tracking-[-0.025em]'
          />
          <FadeUp delay={0.35}>
            <p className='mt-9 max-w-[620px] text-[clamp(19px,1.6vw,22px)] leading-[1.6]'>
              I’ve been technically inclined since I was five. I still love this
              industry and what I do, and I’ve been lucky to work with a lot of
              great people along the way.
            </p>
            <p className='mt-5 max-w-[620px] text-[clamp(18px,1.5vw,20px)] leading-[1.6] text-muted'>
              This is the longer version of the story on the home page.
            </p>
          </FadeUp>
        </div>
        <FadeUp delay={0.2} y={32} className='order-first lg:order-none'>
          <div className='anim-drift relative aspect-[377/400] w-[180px] overflow-hidden rounded-[18px] bg-tile sm:w-[260px] md:w-[clamp(280px,26vw,360px)] md:rounded-[22px]'>
            <Image
              src='/about/temitope.jpg'
              alt='Temitope Pinheiro in a rattan chair, looking at a phone.'
              fill
              preload
              sizes='(min-width: 768px) 360px, (min-width: 640px) 260px, 180px'
              className='object-cover'
            />
          </div>
        </FadeUp>
      </section>

      <section className='pt-28 md:pt-[clamp(120px,12vw,200px)]' aria-labelledby='journey'>
        <WordReveal
          id='journey'
          text='How I got here'
          className='font-display text-[clamp(34px,3.6vw,56px)] leading-[1.08] tracking-[-0.02em]'
        />
        <ol className='mt-12 md:mt-16'>
          {CHAPTERS.map((chapter) => (
            <li
              key={chapter.year}
              className='grid gap-5 border-t border-line py-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] lg:gap-[clamp(40px,5vw,96px)]'
            >
              <FadeUp className='lg:sticky lg:top-24 lg:self-start'>
                <p className='flex items-center gap-2.5 font-mono text-[13px] tracking-[0.08em] text-muted uppercase'>
                  <span aria-hidden className='size-[7px] rounded-full bg-accent' />
                  {chapter.year}
                </p>
              </FadeUp>
              <FadeUp delay={0.1}>
                <h3 className='max-w-[760px] font-display text-[clamp(28px,2.8vw,42px)] leading-[1.15] tracking-[-0.015em]'>
                  {chapter.title}
                </h3>
                {chapter.body.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 24)}
                    className='mt-5 max-w-[680px] text-[19px] leading-[1.65]'
                  >
                    {paragraph}
                  </p>
                ))}
                <p className='mt-6 font-mono text-[13px] tracking-[0.03em] text-muted'>
                  {chapter.detail}
                </p>
              </FadeUp>
            </li>
          ))}
        </ol>
      </section>

      {/* The turn: what Bali showed me, and what it all adds up to. */}
      <section
        className='border-t border-line pt-24 md:pt-[clamp(96px,10vw,160px)]'
        aria-labelledby='bali'
      >
        <FadeUp>
          <p className='flex items-center gap-2.5 font-mono text-[13px] tracking-[0.08em] text-muted uppercase'>
            <span aria-hidden className='size-[7px] rounded-full bg-accent' />
            2026 · Bali
          </p>
        </FadeUp>
        <WordReveal
          id='bali'
          text='Then I went to Bali, and saw the gap.'
          className='mt-5 max-w-[1000px] font-display text-[clamp(40px,5vw,80px)] leading-[1.05] tracking-[-0.025em]'
        />
        <div className='mt-12 grid gap-x-[clamp(40px,5vw,96px)] gap-y-5 lg:grid-cols-2'>
          <FadeUp>
            <p className='max-w-[620px] text-[19px] leading-[1.65]'>
              AI was everywhere. Almost everyone I met was using it, but not
              many knew how to use it well. I found myself teaching people how
              to prompt, and I was surprised to be advising people who sold AI
              services.
            </p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className='max-w-[620px] text-[19px] leading-[1.65]'>
              Then I entered an AI hackathon and came out one of the winners.
              Of all the groups there, I was one of the only people who could
              really build with AI, and my product looked different from
              everyone else’s.
            </p>
          </FadeUp>
        </div>
        <FadeUp className='mt-16 md:mt-24'>
          <blockquote className='max-w-[1100px] border-l border-accent pl-6 md:pl-10'>
            <p className='font-display text-[clamp(28px,3.2vw,48px)] leading-[1.2] tracking-[-0.015em] italic'>
              The gap wasn’t access to AI. It was knowing how to use it well,
              and having the taste to turn what it makes into a product that
              feels finished.
            </p>
          </blockquote>
        </FadeUp>
        <FadeUp className='mt-12 md:mt-16'>
          <p className='max-w-[680px] text-[19px] leading-[1.65]'>
            Building products, and making them feel finished, is what I’ve
            spent my career on, in design and in code. It’s what ties all of
            this together, and it’s what I do now: I help founders finish the
            apps they built fast.
          </p>
        </FadeUp>
      </section>

      {/* The one next step. */}
      <FadeUp className='mt-16 md:mt-24'>
        <Link
          href='/mariposa'
          className='group flex flex-wrap items-end justify-between gap-6 rounded-[22px] bg-accent px-6 py-7 text-on-accent transition-[translate] duration-500 ease-soft hover:-translate-y-1 md:px-10 md:py-10'
        >
          <span>
            <span className='block font-mono text-[13px] tracking-[0.08em] uppercase'>
              The Mariposa Program
            </span>
            <span className='mt-4 block max-w-[640px] text-[18px] leading-[1.55] opacity-85'>
              A UI/UX process for founders who built with Lovable, Bolt,
              Replit, v0 or Cursor. It starts with a free teardown.
            </span>
          </span>
          <span className='flex items-center gap-3 font-display text-[clamp(30px,3vw,44px)] leading-none'>
            Work with me
            <ArrowRight
              size={28}
              className='transition-transform duration-500 ease-soft group-hover:translate-x-1.5'
            />
          </span>
        </Link>
      </FadeUp>

      {/* Where else to find me, after the one ask rather than before it. */}
      <section className='mt-20 md:mt-28' aria-labelledby='elsewhere'>
        <FadeUp>
          <h2 id='elsewhere' className={eyebrow}>
            Find me elsewhere
          </h2>
        </FadeUp>
        <ul className='mt-6 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3'>
          {SOCIALS.map((social, i) => (
            <FadeUp as='li' key={social.label} delay={0.05 * i}>
              <a
                href={social.href}
                target='_blank'
                rel='noreferrer'
                className='group flex h-full flex-col justify-between gap-8 rounded-[18px] border border-line p-5 transition-[border-color,translate] duration-500 ease-soft hover:-translate-y-1 hover:border-muted md:p-6'
              >
                <span className='flex items-start justify-between gap-3'>
                  <span className='font-display text-[clamp(24px,2.2vw,32px)] leading-none'>
                    {social.label}
                  </span>
                  <ArrowUpRight
                    size={18}
                    className='mt-0.5 flex-none text-muted transition-[translate,color] duration-500 ease-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink'
                  />
                </span>
                <span className='truncate font-mono text-[13px] tracking-[0.03em] text-muted'>
                  {handle(social.href)}
                </span>
              </a>
            </FadeUp>
          ))}
        </ul>
      </section>
    </main>
  </MotionConfig>
);
