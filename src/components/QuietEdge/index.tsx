'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { MotionConfig } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { type MouseEvent, useEffect, useRef } from 'react';
import { isPaymentId, QUIET_EDGE } from '~~/lib/quietEdge';
import { ArrowRight } from '../icons';
import { ModalContent, ModalHeader } from '../Mariposa/Modal';
import { FadeUp, Stagger, StaggerItem, WordReveal } from '../motion/Reveal';
import { ListForm } from './ListForm';
import { PurchaseBody, STORED_PAYMENT, usePurchase } from './Purchase';

// The page for The Quiet Edge. One ask, buying the guide, which opens Whop's
// checkout in a modal; the free first chapter is the second door, for anyone
// not ready yet, with the mailing list beside it. The chapter descriptions are
// the guide's own, from the contents page of the free chapter.

const primaryButton =
  'inline-flex min-h-[52px] items-center rounded-full bg-accent px-7 font-mono text-[15px] font-semibold tracking-[0.02em] text-on-accent transition-[translate,scale] duration-300 ease-soft hover:-translate-y-0.5 active:scale-[0.97]';

const secondaryButton =
  'inline-flex min-h-[52px] items-center gap-3 rounded-full border border-line px-7 font-mono text-[15px] font-semibold tracking-[0.02em] transition-[translate,scale,border-color] duration-300 ease-soft hover:-translate-y-0.5 hover:border-muted active:scale-[0.97]';

const eyebrow = 'font-mono text-[13px] tracking-[0.1em] text-muted uppercase';

const sectionTitle =
  'font-display text-[clamp(34px,3.6vw,56px)] leading-[1.08] tracking-[-0.02em]';

const CHAPTERS = [
  {
    title: 'The mindset shift',
    body: 'Why most people get average work out of AI, and the four shifts that change it.',
  },
  {
    title: 'Your minimum viable stack',
    body: 'Pick roles, not products: why two paid tools are enough, and how to test them on three real tasks instead of chasing every launch.',
  },
  {
    title: 'The context problem',
    body: 'A one-page Context Document you own, so you stop re-explaining yourself, and the mirror problem: why AI leans toward agreeing with you.',
  },
  {
    title: 'Plugging it in',
    body: 'From read-only to “it drafts, you send”, and why most people should stop there.',
  },
  {
    title: 'Workflows by job to be done',
    body: 'Six jobs, six moves: writing, reading, thinking, meetings, learning and numbers. The pre-mortem, one of the best prompts in the guide, is here.',
  },
  {
    title: 'Career leverage without looking like a cheat',
    body: 'Using AI at work without costing you your credibility or your skill.',
  },
  {
    title: 'Building your personal AI system',
    body: 'A moves library that takes fifteen minutes a week, with a hard ceiling.',
  },
  {
    title: 'When not to use AI',
    body: 'Six times to close the laptop, and why fluency isn’t accuracy.',
  },
  {
    title: 'Your first seven days',
    body: 'One task a day, each mapped to a chapter.',
  },
];

const PROMISES = [
  {
    title: 'No prompt lists',
    body: 'No feature tours, and no model names that go stale in a month. It’s judgment about how AI fits into a real workday.',
  },
  {
    title: 'Any tool',
    body: 'It works whether you use ChatGPT, Claude, Gemini or whatever wins next year. Where I have an opinion, I say so.',
  },
  {
    title: 'Every edition',
    body: 'AI moves every few months, so the guide does too, two or three times a year. You buy this edition and every one after it.',
  },
];

export const QuietEdge = () => {
  const { purchase, claim, resume, start, open, setOpen } = usePurchase();
  // The button that opened the checkout, for focus to go back to.
  const opener = useRef<HTMLElement | null>(null);

  // Every "Get the guide" link opens the checkout. Without script, it goes to
  // the same plan on whop.com.
  const buyLink = {
    href: QUIET_EDGE.whop,
    'aria-haspopup': 'dialog' as const,
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      opener.current = event.currentTarget;
      start();
    },
  };

  // Back from Whop: after a finished checkout, or a bank's or card issuer's
  // page, the tab lands here with the payment in the address or in
  // sessionStorage. Pick the purchase up where it was.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let payment = params.get('payment');
    try {
      payment ??= sessionStorage.getItem(STORED_PAYMENT);
    } catch {}
    if (!isPaymentId(payment)) return;
    history.replaceState(null, '', location.pathname);
    // The address's status is trusted for a failure, never for a sale: the
    // claim asks Whop.
    const status = params.get('status');
    const failed = status === 'failed' || status === 'canceled';
    if (failed) {
      try {
        sessionStorage.removeItem(STORED_PAYMENT);
      } catch {}
    }
    resume(payment, failed);
  }, [resume]);

  const paid = purchase.step === 'paid';

  return (
    <MotionConfig reducedMotion='user'>
      <main className='mx-auto max-w-[1440px] px-5 pb-28 md:px-10'>
        <section className='grid items-center gap-12 pt-16 md:pt-[clamp(64px,8vw,128px)] lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-[clamp(48px,6vw,112px)]'>
          <div>
            <FadeUp>
              <p className={eyebrow}>A guide by Temitope Pinheiro</p>
            </FadeUp>
            <WordReveal
              as='h1'
              text='The Quiet Edge'
              className='mt-5 font-display text-[clamp(52px,7vw,112px)] leading-[1] tracking-[-0.03em]'
            />
            <FadeUp delay={0.25}>
              <p className='mt-5 max-w-[720px] font-display text-[clamp(24px,2.4vw,36px)] leading-[1.2] tracking-[-0.01em] text-muted italic'>
                How smart people are actually using AI at work
              </p>
            </FadeUp>
            <FadeUp delay={0.4}>
              <p className='mt-9 max-w-[620px] text-[clamp(18px,1.5vw,21px)] leading-[1.6]'>
                You already use ChatGPT, Claude or Gemini a few times a week,
                and you suspect you’re getting a fraction of what they can do.
                This is the field manual for the rest: nine chapters on how AI
                fits into a real workday, for people who are busy and skeptical
                of hype.
              </p>
            </FadeUp>
            <FadeUp delay={0.5} className='mt-10 flex flex-wrap items-center gap-x-6 gap-y-4'>
              <a {...buyLink} className={primaryButton}>
                Get the guide · {QUIET_EDGE.price}
              </a>
              <a
                href='#chapter-one'
                className='font-mono text-[14px] tracking-[0.03em] underline decoration-accent underline-offset-4'
              >
                Read Chapter 1 free
              </a>
            </FadeUp>
            <FadeUp delay={0.55}>
              <p className='mt-6 font-mono text-[13px] tracking-[0.03em] text-muted'>
                PDF · {QUIET_EDGE.pages} pages · Edition 1 · every future edition
                included
              </p>
            </FadeUp>
          </div>
          <FadeUp delay={0.2} y={32} className='order-first lg:order-none'>
            <div className='relative aspect-[612/792] w-[200px] rotate-[2deg] overflow-hidden rounded-[10px] border border-white/10 shadow-[0_40px_90px_-40px_rgb(0_0_0/0.55)] sm:w-[260px] md:w-[clamp(300px,28vw,420px)]'>
              <Image
                src='/quiet-edge/cover.jpg'
                alt='The cover of The Quiet Edge: a small figure with a laptop, sitting on the edge of a cliff under a blue crescent moon.'
                fill
                preload
                sizes='(min-width: 768px) 420px, (min-width: 640px) 260px, 200px'
                className='object-cover'
              />
            </div>
          </FadeUp>
        </section>

        <section className='border-t border-line mt-28 pt-24 md:mt-[clamp(120px,12vw,200px)] md:pt-[clamp(96px,10vw,160px)]'>
          <FadeUp>
            <p className={eyebrow}>Where it starts</p>
          </FadeUp>
          <WordReveal
            text='Stop treating AI like a search engine. Start treating it like a junior colleague.'
            className='mt-5 max-w-[1100px] font-display text-[clamp(36px,4.4vw,68px)] leading-[1.08] tracking-[-0.02em]'
          />
          <div className='mt-12 grid gap-x-[clamp(40px,5vw,96px)] gap-y-5 lg:grid-cols-2'>
            <FadeUp>
              <p className='max-w-[620px] text-[19px] leading-[1.65]'>
                Twenty years of search trained all of us the same way: a few
                words in, an answer out, move on. Type six words into a chat and
                the tool has to guess everything you left out: who’s reading,
                what already happened, what good looks like. So it guesses the
                average, and you get average work.
              </p>
            </FadeUp>
            <FadeUp delay={0.1}>
              <p className='max-w-[620px] text-[19px] leading-[1.65]'>
                A junior colleague is fast, capable and has read more than you,
                but needs context to be useful. Give AI what you’d give a new
                hire and the work changes. The rest of the guide is the
                mechanics for making that stick.
              </p>
            </FadeUp>
          </div>
        </section>

        <section className='pt-28 md:pt-[clamp(120px,12vw,200px)]' aria-labelledby='inside'>
          <div className='flex flex-wrap items-end justify-between gap-6'>
            <WordReveal id='inside' text='What’s inside' className={sectionTitle} />
            <FadeUp delay={0.2}>
              <p className='max-w-[520px] text-[18px] leading-[1.6] text-muted'>
                Nine chapters, short enough for a commute. Most end with one
                small thing to try this week.
              </p>
            </FadeUp>
          </div>
          <Stagger as='ol' className='mt-12 md:mt-16'>
            {CHAPTERS.map((chapter, i) => (
              <StaggerItem
                as='li'
                key={chapter.title}
                className='grid gap-3 border-t border-line py-7 md:grid-cols-[80px_minmax(0,1fr)_minmax(0,1.3fr)] md:gap-[clamp(24px,3vw,56px)] md:py-9'
              >
                <span className='font-mono text-[13px] tracking-[0.08em] text-muted'>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className='font-display text-[clamp(24px,2.2vw,32px)] leading-[1.2]'>
                  {chapter.title}
                </h3>
                <p className='max-w-[620px] text-[18px] leading-[1.6] text-muted'>
                  {chapter.body}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <Stagger
          as='div'
          className='mt-20 grid gap-10 border-t border-line pt-10 md:mt-[clamp(80px,8vw,128px)] md:grid-cols-3'
        >
          {PROMISES.map((item) => (
            <StaggerItem as='div' key={item.title}>
              <h3 className='font-display text-[26px]'>{item.title}</h3>
              <p className='mt-3 text-[17px] leading-[1.6] text-muted'>{item.body}</p>
            </StaggerItem>
          ))}
        </Stagger>

        {/* The second door: the free chapter, and the list. */}
        <section
          id='chapter-one'
          className='mt-24 grid scroll-mt-8 items-center gap-10 rounded-[22px] bg-tile px-6 py-10 md:mt-[clamp(96px,10vw,160px)] md:grid-cols-[auto_minmax(0,1fr)] md:gap-[clamp(40px,5vw,96px)] md:px-12 md:py-14'
        >
          <FadeUp>
            <div className='relative aspect-[612/792] w-[140px] -rotate-[2deg] overflow-hidden rounded-[8px] border border-white/10 shadow-[0_30px_70px_-35px_rgb(0_0_0/0.55)] md:w-[220px]'>
              <Image
                src='/quiet-edge/chapter-1-cover.jpg'
                alt='The cover of the free first chapter, The Mindset Shift.'
                fill
                sizes='(min-width: 768px) 220px, 140px'
                className='object-cover'
              />
            </div>
          </FadeUp>
          <div>
            <FadeUp>
              <p className={eyebrow}>Free</p>
            </FadeUp>
            <WordReveal
              text='Not sure yet? Read Chapter 1 first.'
              className='mt-4 font-display text-[clamp(32px,3.4vw,52px)] leading-[1.08] tracking-[-0.02em]'
            />
            <FadeUp delay={0.15}>
              <p className='mt-5 max-w-[600px] text-[18px] leading-[1.6] text-muted'>
                The mindset shift, plus the pre-mortem, a move pulled forward
                from Chapter 5, with a 20-minute exercise to try it on a real
                decision. Sixteen pages. No email needed.
              </p>
              <a
                href={QUIET_EDGE.chapterOne}
                download='The Quiet Edge - Chapter 1.pdf'
                className={`mt-8 ${secondaryButton}`}
              >
                Download Chapter 1
                <ArrowRight size={18} className='rotate-90' />
              </a>
            </FadeUp>
            <FadeUp delay={0.2} className='mt-12 border-t border-line pt-8'>
              <ListForm buttonClassName={secondaryButton} />
            </FadeUp>
          </div>
        </section>

        <section
          className='grid gap-10 pt-24 md:pt-[clamp(96px,10vw,160px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-[clamp(40px,5vw,96px)]'
          aria-labelledby='author'
        >
          <div>
            <FadeUp>
              <p className={eyebrow}>Who wrote it</p>
            </FadeUp>
            <WordReveal
              id='author'
              text='I’m Temitope, a developer from Lagos, Nigeria.'
              className='mt-5 font-display text-[clamp(32px,3.4vw,52px)] leading-[1.08] tracking-[-0.02em]'
            />
          </div>
          <FadeUp delay={0.1}>
            <p className='max-w-[620px] text-[19px] leading-[1.65]'>
              In Bali this year, almost everyone I met was using AI, but not many
              knew how to use it well. I found myself teaching people how to
              prompt, and advising people who sold AI services. Then I entered an
              AI hackathon and came out one of the winners.
            </p>
            <Link
              href='/about'
              className='group mt-6 inline-flex items-center gap-2 font-mono text-[14px] tracking-[0.03em] underline decoration-accent underline-offset-4'
            >
              More about me
              <ArrowRight
                size={16}
                className='transition-transform duration-500 ease-soft group-hover:translate-x-1'
              />
            </Link>
          </FadeUp>
        </section>

        {/* The ask, once more. */}
        <FadeUp className='mt-16 md:mt-24'>
          <a
            {...buyLink}
            className='group flex flex-wrap items-end justify-between gap-6 rounded-[22px] bg-accent px-6 py-7 text-on-accent transition-[translate] duration-500 ease-soft hover:-translate-y-1 md:px-10 md:py-10'
          >
            <span>
              <span className='block font-mono text-[13px] tracking-[0.08em] uppercase'>
                The Quiet Edge · {QUIET_EDGE.price}
              </span>
              <span className='mt-4 block max-w-[640px] text-[18px] leading-[1.55] opacity-85'>
                Pay here and the download starts as soon as your payment
                clears. The link comes by email too, and it gets you every new
                edition.
              </span>
            </span>
            <span className='flex items-center gap-3 font-display text-[clamp(30px,3vw,44px)] leading-none'>
              Get the guide
              <ArrowRight
                size={28}
                className='transition-transform duration-500 ease-soft group-hover:translate-x-1.5'
              />
            </span>
          </a>
        </FadeUp>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <ModalContent
            open={open}
            className='max-w-[680px]'
            aria-describedby={undefined}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              if (opener.current?.isConnected) opener.current.focus();
            }}
          >
            <ModalHeader
              eyebrow={`The Quiet Edge · ${QUIET_EDGE.price}`}
              title={paid ? 'Thank you.' : 'Get the guide'}
            />
            <div className='px-6 pb-8 md:px-12 md:pb-12'>
              <PurchaseBody
                purchase={purchase}
                claim={claim}
                buttonClassName={primaryButton}
              />
            </div>
          </ModalContent>
        </Dialog.Root>
      </main>
    </MotionConfig>
  );
};
