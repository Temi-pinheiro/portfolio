'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { type MouseEvent, useEffect, useRef, useState } from 'react';
import data from '~~/data/mariposa.json';
import {
  EASE_OUT_EXPO,
  FadeUp,
  Stagger,
  StaggerItem,
  WordReveal,
} from '../motion/Reveal';
import { CaseCard, type Case } from './CaseStudies';
import { ModalContent, ModalHeader } from './Modal';
import { Steps, type Step } from './Steps';
import { TeardownForm, useTeardown } from './TeardownForm';

// The page asks for one thing, the teardown, and every step after it leads to
// exactly one next step. So the program is five steps in order, not a menu:
// which parts someone needs is the audit's call, and the price comes with my
// reply. Everything shows without a click; a case study opens in a modal that
// ends on the same ask. Wherever the ask is made, the form opens in a modal,
// so no one has to scroll to the end for it; it's also at the end, for anyone
// who reads that far.

const primaryButton =
  'inline-flex min-h-[52px] items-center rounded-full bg-accent px-7 font-mono text-[15px] font-semibold tracking-[0.02em] text-on-accent transition-[translate,scale] duration-300 ease-soft hover:-translate-y-0.5 active:scale-[0.97]';

const sectionTitle =
  'font-display text-[clamp(34px,3.6vw,56px)] leading-[1.08] tracking-[-0.02em]';

const guarantees = [
  {
    title: 'Front end only',
    body: 'Design and front-end code: what people see and touch. No backend, infrastructure or security work.',
  },
  {
    title: 'Any stack',
    body: 'Lovable, Bolt, Replit, v0, Cursor, Next.js, React, Webflow, Framer, WordPress. If it’s live, I can work on it.',
  },
  {
    title: 'Two guarantees',
    body: 'At least 10 fixes worth making in your audit, or a full refund. After a build, anything the re-audit finds still open, I fix for free.',
  },
];

export const Mariposa = () => {
  const steps: Step[] = data.path;
  // Parts 02–07: what the Build step is made of.
  const build = data.parts.slice(2, 8);
  const cases: Case[] = data.cases;

  const teardown = useTeardown();
  const [requesting, setRequesting] = useState(false);
  // The button that opened the form's modal, for focus to go back to.
  const opener = useRef<HTMLElement | null>(null);
  const request = (from: HTMLElement | null) => {
    opener.current = from;
    setRequesting(true);
  };
  // The ask is a link to the form at the end, so it works without script.
  const requestLink = {
    href: '#teardown',
    'aria-haspopup': 'dialog' as const,
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      request(event.currentTarget);
    },
  };

  // The one button follows you down the page: it shows once the hero's button
  // has scrolled away, and hides at the form and once a request is sent.
  const heroButton = useRef<HTMLAnchorElement>(null);
  const formSection = useRef<HTMLElement>(null);
  const [pastHero, setPastHero] = useState(false);
  const [atForm, setAtForm] = useState(false);
  const sent = teardown.status === 'sent';
  const showBar = pastHero && !atForm && !sent;

  useEffect(() => {
    const hero = heroButton.current;
    const form = formSection.current;
    if (!hero || !form) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) {
          setPastHero(!entry.isIntersecting && entry.boundingClientRect.top < 0);
        } else {
          setAtForm(entry.isIntersecting);
        }
      }
    });
    observer.observe(hero);
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  return (
    <MotionConfig reducedMotion='user'>
      <main className='mx-auto max-w-[1440px] px-5 pb-28 md:px-10'>
        <section className='pt-16 md:pt-[clamp(64px,9vw,140px)]'>
          <FadeUp>
            <p className='font-mono text-[13px] tracking-[0.1em] text-muted uppercase'>
              The Mariposa Program
            </p>
          </FadeUp>
          <WordReveal
            as='h1'
            text='You built it fast. Now make it feel finished.'
            className='mt-5 max-w-[1040px] font-display text-[clamp(44px,6.4vw,100px)] leading-[1.03] tracking-[-0.025em]'
          />
          <FadeUp delay={0.35}>
            <p className='mt-9 max-w-[640px] text-[clamp(18px,1.5vw,21px)] leading-[1.6] text-muted'>
              A UI/UX process for founders who built their web app with
              Lovable, Bolt, Replit, v0 or Cursor, and can tell it feels off. It
              starts with a free teardown: send me your link, and I’ll send back
              the three things I’d fix first.
            </p>
          </FadeUp>
          <FadeUp delay={0.5} className='mt-10'>
            <a ref={heroButton} {...requestLink} className={primaryButton}>
              Request a free teardown
            </a>
          </FadeUp>
        </section>

        <section className='pt-28 md:pt-[clamp(120px,12vw,200px)]' id='how'>
          <div className='flex flex-wrap items-end justify-between gap-6'>
            <WordReveal text='How it works' className={sectionTitle} />
            <FadeUp delay={0.2}>
              <p className='max-w-[520px] text-[18px] leading-[1.6] text-muted'>
                Five steps. Each one tells you whether you need the next.
              </p>
            </FadeUp>
          </div>
          <Steps steps={steps} build={build} onRequest={request} />
        </section>

        {cases.length > 0 && (
          <section className='pt-24 md:pt-[clamp(96px,10vw,160px)]' id='cases'>
            <div className='flex flex-wrap items-end justify-between gap-6'>
              <WordReveal text='Case studies' className={sectionTitle} />
              <FadeUp delay={0.2}>
                <p className='max-w-[520px] text-[18px] leading-[1.6] text-muted'>
                  Real teardowns, shared with the founders’ permission.
                </p>
              </FadeUp>
            </div>
            <Stagger as='ul' className='mt-12 grid gap-4'>
              {cases.map((study) => (
                <StaggerItem key={study.name}>
                  <CaseCard
                    study={study}
                    buttonClassName={primaryButton}
                    onRequest={request}
                  />
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        )}

        <Stagger
          as='div'
          className='mt-24 grid gap-10 border-t border-line pt-10 md:mt-[clamp(96px,10vw,160px)] md:grid-cols-3'
        >
          {guarantees.map((item) => (
            <StaggerItem as='div' key={item.title}>
              <h3 className='font-display text-[26px]'>{item.title}</h3>
              <p className='mt-3 text-[17px] leading-[1.6] text-muted'>
                {item.body}
              </p>
            </StaggerItem>
          ))}
        </Stagger>

        <section
          ref={formSection}
          className='grid scroll-mt-8 gap-12 pt-24 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-[clamp(40px,5vw,96px)] md:pt-[clamp(96px,10vw,160px)]'
          id='teardown'
        >
          <div>
            <FadeUp>
              <p className='font-mono text-[13px] tracking-[0.1em] text-muted uppercase'>
                Part 00 · Free
              </p>
            </FadeUp>
            <WordReveal
              text='Start with a free teardown.'
              className='mt-5 font-display text-[clamp(40px,4.6vw,72px)] leading-[1.08] tracking-[-0.02em]'
            />
            <FadeUp delay={0.25}>
              <p className='mt-6 max-w-[520px] text-[19px] leading-[1.6] text-muted'>
                Send me your link. Within 24 hours I’ll send back the three
                things I’d fix first, marked on a screenshot, with what each one
                costs you and how to fix it.
              </p>
              <p className='mt-4 max-w-[520px] text-[19px] leading-[1.6] text-muted'>
                No call and no pitch. If you want more fixed after that, I’ll
                tell you which parts you need and what they cost.
              </p>
            </FadeUp>
          </div>
          <TeardownForm teardown={teardown} buttonClassName={primaryButton} />
        </section>

        <Dialog.Root open={requesting} onOpenChange={setRequesting}>
          <ModalContent
            open={requesting}
            className='max-w-[760px]'
            // With the intro gone, there's nothing to describe the dialog.
            {...(sent && { 'aria-describedby': undefined })}
            onOpenAutoFocus={(event) => {
              // Straight to the first field, unless it would bring up a
              // phone's keyboard over the form.
              const panel = event.currentTarget as HTMLElement;
              const field = panel.querySelector('input');
              if (!field || !matchMedia('(pointer: fine)').matches) return;
              event.preventDefault();
              field.focus();
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              if (opener.current?.isConnected) opener.current.focus();
            }}
          >
            <ModalHeader
              eyebrow='Part 00 · Free'
              title='Start with a free teardown.'
            />
            <div className='px-6 pb-8 md:px-12 md:pb-12'>
              {/* Once sent, the intro folds away and the confirmation is
                  all that's left. */}
              <AnimatePresence initial={false}>
                {!sent && (
                  <motion.div
                    key='intro'
                    className='overflow-hidden'
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                  >
                    <Dialog.Description className='max-w-[560px] pb-8 text-[18px] leading-[1.6] text-muted'>
                      Send me your link. Within 24 hours I’ll send back the
                      three things I’d fix first, marked on a screenshot, with
                      what each one costs you and how to fix it. No call and no
                      pitch.
                    </Dialog.Description>
                  </motion.div>
                )}
              </AnimatePresence>
              <TeardownForm
                teardown={teardown}
                buttonClassName={primaryButton}
                bare
              />
            </div>
          </ModalContent>
        </Dialog.Root>

        <AnimatePresence>
          {showBar && (
            <motion.div
              className='pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center px-5 md:bottom-7 lg:justify-end lg:px-10'
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
            >
              <a
                {...requestLink}
                className={`pointer-events-auto shadow-[0_12px_32px_-12px_rgb(0_0_0/0.45)] ${primaryButton}`}
              >
                Request a free teardown
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
};
