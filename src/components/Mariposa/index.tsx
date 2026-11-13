'use client';

import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { type MouseEvent, useEffect, useRef, useState } from 'react';
import data from '~~/data/mariposa.json';
import { track } from '~~/lib/analytics';
import { ArrowUpRight } from '../icons';
import {
  EASE_OUT_EXPO,
  FadeUp,
  Stagger,
  StaggerItem,
  WordReveal,
} from '../motion/Reveal';
import { CallEmbed } from './CallEmbed';
import { Intake, useIntake } from './Intake';
import { INTAKE_HREF } from './Intake/useIntake';
import { Steps, type Step } from './Steps';
import { primaryButton } from './styles';

// The Mariposa Program, since 2026-11-13: AI operating systems, agents and
// agent swarms, built to order. The page asks for one thing, the intake, and
// every section leads back to it. The intake opens full screen, and ends in a
// prognosis written while the visitor waits, then the call. No prices: they
// come after the call. The end of the page is the call itself, for anyone who
// would rather talk first.

const sectionTitle =
  'font-display text-[clamp(34px,3.6vw,56px)] leading-[1.08] tracking-[-0.02em]';

// Public words from people about AI in their own work, sourced and linked.
// Never presented as my clients'. Each one is approved before it goes here.
type Proof = { quote: string; by: string; role: string; source: string; url: string };

export const Mariposa = () => {
  const steps: Step[] = data.path;
  const proof: Proof[] = data.proof;

  const intake = useIntake();
  const [open, setOpen] = useState(false);
  // The button that opened the intake, for focus to go back to.
  const opener = useRef<HTMLElement | null>(null);
  const start = (from: HTMLElement | null) => {
    opener.current = from;
    track('intake_opened');
    setOpen(true);
  };
  const startLink = {
    href: INTAKE_HREF,
    'aria-haspopup': 'dialog' as const,
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      start(event.currentTarget);
    },
  };
  const done = intake.phase === 'result' || intake.phase === 'failed';
  const label = done ? 'See your prognosis' : 'Get your prognosis';

  // Old links ask for ?teardown, newer ones may ask for ?intake: either opens
  // the intake, and the flag leaves the address so a reload doesn't reopen
  // it. A frame later, so it opens over a painted page.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const url = new URL(window.location.href);
      if (!url.searchParams.has('intake') && !url.searchParams.has('teardown')) return;
      url.searchParams.delete('intake');
      url.searchParams.delete('teardown');
      window.history.replaceState(window.history.state, '', url);
      track('intake_opened');
      setOpen(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // The one button follows you down the page once the hero's has scrolled
  // away.
  const heroButton = useRef<HTMLAnchorElement>(null);
  const [pastHero, setPastHero] = useState(false);
  useEffect(() => {
    const hero = heroButton.current;
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) =>
      setPastHero(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <MotionConfig reducedMotion='user'>
      <main className='mx-auto max-w-[1440px] px-5 pb-28 md:px-10'>
        <section className='pt-16 md:pt-[clamp(64px,9vw,140px)]'>
          {/* The label says what this is in the words people search for, and
              it's part of the heading, so search engines read it too. */}
          <h1>
            <FadeUp
              as='span'
              className='block font-mono text-[13px] tracking-[0.1em] text-muted uppercase'
            >
              The Mariposa Program · AI systems and agents for businesses
            </FadeUp>
            <span className='sr-only'>. </span>
            <WordReveal
              as='span'
              text='An AI team, built around how your business works.'
              className='mt-5 block max-w-[1040px] font-display text-[clamp(44px,6.4vw,100px)] leading-[1.03] tracking-[-0.025em]'
            />
          </h1>
          <FadeUp delay={0.35}>
            <p className='mt-9 max-w-[660px] text-[clamp(18px,1.5vw,21px)] leading-[1.6] text-muted'>
              I design and build AI systems for businesses: an operating system
              that knows your business, and agents that each take a job off
              your team’s hands. Each one works inside
              the tools you already use. It starts with nine questions, and
              you get my first read on where AI fits before you leave the page.
            </p>
          </FadeUp>
          <FadeUp delay={0.5} className='mt-10'>
            <a ref={heroButton} {...startLink} className={primaryButton}>
              {label}
            </a>
            {/* Who's asking. Inside what happened (the bio-copy-accuracy
                rule). */}
            <p className='mt-6 max-w-[540px] text-[16px] leading-[1.55] text-muted'>
              I’m Temitope. I’ve built product software since 2021, and right
              now I’m building an AI operating system for Sorbit Studios.
            </p>
          </FadeUp>
        </section>

        <section className='pt-28 md:pt-[clamp(120px,12vw,200px)]' id='build'>
          <div className='flex flex-wrap items-end justify-between gap-6'>
            <WordReveal text='What I build' className={sectionTitle} />
            <FadeUp delay={0.2}>
              <p className='max-w-[520px] text-[18px] leading-[1.6] text-muted'>
                Any sector, any size. A one-person studio might need one agent;
                a team of two hundred, the whole system. The intake shows which.
              </p>
            </FadeUp>
          </div>
          <Stagger as='ul' className='mt-12 grid gap-4 md:grid-cols-3'>
            {data.offer.map((item, i) => (
              <StaggerItem
                key={item.name}
                className='flex flex-col rounded-[22px] border border-line p-6 md:p-8'
              >
                <span className='font-mono text-[13px] text-accent-text'>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className='mt-6 font-display text-[clamp(28px,2.4vw,36px)] leading-[1.1]'>
                  {item.name}
                </h3>
                <p className='mt-4 text-[17px] leading-[1.6] text-muted'>{item.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section className='pt-28 md:pt-[clamp(120px,12vw,200px)]' id='how'>
          <div className='flex flex-wrap items-end justify-between gap-6'>
            <WordReveal text='How it works' className={sectionTitle} />
            <FadeUp delay={0.2}>
              <p className='max-w-[520px] text-[18px] leading-[1.6] text-muted'>
                Five steps, from what eats your week to a system that keeps up
                with the business.
              </p>
            </FadeUp>
          </div>
          <Steps steps={steps} onRequest={start} />
        </section>

        {proof.length > 0 && (
          <section className='pt-24 md:pt-[clamp(96px,10vw,160px)]' id='proof'>
            <div className='flex flex-wrap items-end justify-between gap-6'>
              <WordReveal text='In their words' className={sectionTitle} />
              <FadeUp delay={0.2}>
                <p className='max-w-[520px] text-[18px] leading-[1.6] text-muted'>
                  What people have said, in public, about handing work to AI in
                  their own businesses. They aren’t my clients; each one links
                  to where they said it.
                </p>
              </FadeUp>
            </div>
            <Stagger as='ul' className='mt-12 grid gap-4 md:grid-cols-2'>
              {proof.map((item) => (
                <StaggerItem
                  key={item.url}
                  className='flex flex-col justify-between gap-8 rounded-[22px] bg-tile p-6 md:p-8'
                >
                  <blockquote className='font-display text-[clamp(22px,1.9vw,28px)] leading-[1.35]'>
                    “{item.quote}”
                  </blockquote>
                  <p className='flex flex-wrap items-end justify-between gap-4 font-mono text-[13px] tracking-[0.03em] text-muted'>
                    <span>
                      <span className='text-ink'>{item.by}</span> · {item.role}
                    </span>
                    <a
                      href={item.url}
                      target='_blank'
                      rel='noreferrer'
                      className='inline-flex items-center gap-1.5 underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-300 hover:decoration-current'
                    >
                      {item.source}
                      <ArrowUpRight size={14} />
                    </a>
                  </p>
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        )}

        <section
          className='grid scroll-mt-8 gap-12 pt-24 md:pt-[clamp(96px,10vw,160px)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-[clamp(40px,5vw,96px)]'
          id='call'
        >
          <div className='lg:sticky lg:top-10 lg:self-start'>
            <FadeUp>
              <p className='font-mono text-[13px] tracking-[0.1em] text-muted uppercase'>
                Schedule a call
              </p>
            </FadeUp>
            <WordReveal
              text='Rather talk first?'
              className='mt-5 font-display text-[clamp(40px,4.6vw,72px)] leading-[1.08] tracking-[-0.02em]'
            />
            <FadeUp delay={0.25}>
              <p className='mt-6 max-w-[520px] text-[19px] leading-[1.6] text-muted'>
                Book 30 minutes. Tell me how the business runs and where the
                week goes, and I’ll tell you where I’d start.
              </p>
              <p className='mt-4 max-w-[520px] text-[19px] leading-[1.6] text-muted'>
                Rather write it down?{' '}
                <a
                  {...startLink}
                  className='text-ink underline decoration-accent underline-offset-4'
                >
                  {done ? 'See your prognosis' : 'Start the intake'}
                </a>{' '}
                instead.
              </p>
            </FadeUp>
          </div>
          <FadeUp delay={0.15}>
            <CallEmbed />
          </FadeUp>
        </section>

        <Intake
          intake={intake}
          open={open}
          onOpenChange={setOpen}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (opener.current?.isConnected) opener.current.focus();
          }}
        />

        <AnimatePresence>
          {pastHero && !open && (
            <motion.div
              className='pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center px-5 md:bottom-7 lg:justify-end lg:px-10'
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
            >
              <a
                {...startLink}
                className={`pointer-events-auto shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45)] ${primaryButton}`}
              >
                {label}
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
};
