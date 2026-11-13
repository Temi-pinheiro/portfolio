'use client';

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from 'framer-motion';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { LIFE_NAMES } from '~~/lib/metamorphosis';
import { EMAIL as INBOX } from '~~/lib/site';
import { Check } from '../../icons';
import { EASE_OUT_EXPO } from '../../motion/Reveal';
import { CallEmbed } from '../CallEmbed';
import { StepFigure } from '../StepFigure';
import { primaryButton } from '../styles';
import { fieldLabel, textInput } from './Fields';
import { answersMailto, type Intake } from './useIntake';

// After the last question: the chrysalis hangs in the middle of the screen
// while the prognosis is written (lib/metamorphosis, stage 2). When the first
// words arrive it emerges into the butterfly (stages 3 and 4), moves up out
// of the way, and the prognosis streams in under it. Then the call, and the
// email for anyone who'd rather write.

const CHRYSALIS = 2;
const BUTTERFLY = 4;

const FAILURES = {
  busy: 'The prognosis has had a busy day and is resting until tomorrow.',
  unavailable: 'The prognosis isn’t available right now.',
  failed: 'Something went wrong before I could write your prognosis.',
  declined: 'I couldn’t write a prognosis from these answers.',
  cut: 'Your prognosis stopped partway. Here’s what was written.',
} as const;

export const Prognosis = ({ intake }: { intake: Intake }) => {
  const { phase, prognosis, failure, delivered, answers } = intake;
  const reduce = useReducedMotion();
  const stage = useMotionValue(CHRYSALIS);
  const [stageName, setStageName] = useState(LIFE_NAMES[CHRYSALIS]);
  // Mounted afresh for each request (keyed by attempt). A prognosis restored
  // from an earlier visit opens already emerged.
  const [emergedOnce, setEmerged] = useState(phase !== 'thinking');
  const hasText = prognosis.length > 0;
  // Nothing was written: the chrysalis stays one, and steps aside for the
  // message. Under reduced motion there's no emerging to wait for.
  const failedEmpty = phase === 'failed' && !hasText;
  const emerged = emergedOnce || failedEmpty || (Boolean(reduce) && hasText);

  useEffect(() => stage.on('change', (s) => setStageName(LIFE_NAMES[Math.round(s)])), [stage]);

  useEffect(() => {
    if (!hasText) {
      stage.set(CHRYSALIS);
      return;
    }
    if (emerged) {
      stage.set(BUTTERFLY);
      return;
    }
    const controls = animate(stage, BUTTERFLY, {
      duration: 1.8,
      ease: [0.45, 0, 0.2, 1],
      onComplete: () => setEmerged(true),
    });
    return () => controls.stop();
  }, [hasText, emerged, stage]);

  const streaming = phase === 'thinking';
  // What follows the prognosis waits until the butterfly has moved aside.
  const finished = (phase === 'result' || phase === 'failed') && emerged;

  return (
    <div className='px-5 pb-24 md:px-10'>
      <div className='mx-auto max-w-[820px]'>
        <motion.div
          className='flex flex-col items-center justify-center'
          initial={false}
          animate={{ height: emerged ? '26svh' : '62svh' }}
          transition={{ duration: reduce ? 0 : 0.9, ease: EASE_OUT_EXPO }}
        >
          <StepFigure stage={stage} className='min-h-0 w-full flex-1' />
          <p
            aria-hidden
            className='mt-2 font-mono text-[13px] tracking-[0.08em] text-accent-text uppercase'
          >
            {stageName}
          </p>
        </motion.div>

        <AnimatePresence>
          {!emerged && (
            <motion.p
              key='waiting'
              role='status'
              className='mt-6 text-center text-[18px] leading-[1.55] text-muted'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.4 } }}
              exit={{ opacity: 0 }}
            >
              {hasText ? 'Here it comes.' : 'Writing your prognosis. It takes about half a minute.'}
            </motion.p>
          )}
        </AnimatePresence>

        {emerged && hasText && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
          >
            <p className='mt-10 font-mono text-[13px] tracking-[0.08em] text-muted uppercase'>
              Your prognosis · {answers.business}
            </p>
            <div
              aria-busy={streaming}
              className='article-body mt-6 [&_strong]:font-semibold [&>h2:first-child]:mt-0'
            >
              <ReactMarkdown>{prognosis}</ReactMarkdown>
            </div>
            {streaming && (
              <span
                aria-hidden
                className='mt-4 inline-block h-5 w-2 animate-pulse bg-accent-text align-middle'
              />
            )}
          </motion.div>
        )}

        {finished && (
          <p role='status' className='sr-only'>
            {phase === 'result' ? 'Your prognosis is ready.' : failure ? FAILURES[failure] : ''}
          </p>
        )}

        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.2 }}
          >
            {phase === 'failed' && failure ? (
              <div className='mt-10 rounded-[20px] border border-line p-6 md:p-8'>
                <p className='font-display text-[clamp(24px,2.4vw,32px)] leading-[1.2]'>
                  {FAILURES[failure]}
                </p>
                <p className='mt-4 text-[18px] leading-[1.6] text-muted'>
                  {delivered
                    ? 'Your answers reached me anyway, and I’ll read them. Book a call below, or '
                    : 'Your answers are safe here. Book a call below, or '}
                  {delivered ? (
                    'leave your email and I’ll reply.'
                  ) : (
                    <a
                      href={answersMailto(answers)}
                      className='text-ink underline decoration-accent underline-offset-4'
                    >
                      email them to me
                    </a>
                  )}
                  {!delivered && '.'}
                </p>
                {failure !== 'busy' && (
                  <button
                    type='button'
                    onClick={() => intake.submit('')}
                    className='mt-6 font-mono text-[14px] tracking-[0.03em] text-accent-text underline decoration-accent underline-offset-4'
                  >
                    Try again
                  </button>
                )}
              </div>
            ) : (
              <p className='mt-10 border-t border-line pt-6 text-[16px] leading-[1.6] text-muted'>
                Claude drafted this from your answers, as a first read. I read every one myself.{' '}
                <button
                  type='button'
                  onClick={intake.edit}
                  className='text-ink underline decoration-underline underline-offset-4 transition-colors duration-300 hover:text-accent-text'
                >
                  Change your answers
                </button>
              </p>
            )}

            <section className='mt-16'>
              <p className='font-mono text-[13px] tracking-[0.1em] text-muted uppercase'>
                Next
              </p>
              <h3 className='mt-4 font-display text-[clamp(32px,3.6vw,52px)] leading-[1.08] tracking-[-0.02em]'>
                Let’s talk it through.
              </h3>
              <p className='mt-4 max-w-[620px] text-[18px] leading-[1.6] text-muted'>
                Thirty minutes. Bring the questions above and anything I got wrong, and
                you’ll leave knowing what I’d build first.
              </p>
              <div className='mt-8'>
                <CallEmbed prefill={{ name: answers.name, email: intake.email || undefined }} />
              </div>
            </section>

            {(delivered || phase === 'result') && <EmailHandOff intake={intake} />}
          </motion.div>
        )}
      </div>
    </div>
  );
};

const EmailHandOff = ({ intake }: { intake: Intake }) => {
  const { email, emailStatus, sendEmail, setEmailStatus, answers } = intake;
  const gotcha = useRef<HTMLInputElement>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (emailStatus === 'sending') return;
    const value = new FormData(event.currentTarget).get('email');
    sendEmail(String(value ?? '').trim(), gotcha.current?.value ?? '');
  };

  return (
    <section className='mt-16 border-t border-line pt-10'>
      <AnimatePresence mode='wait' initial={false}>
        {emailStatus === 'sent' ? (
          <motion.div
            key='sent'
            role='status'
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
          >
            <motion.span
              className='inline-flex size-12 items-center justify-center rounded-full bg-accent text-on-accent'
              initial={{ scale: 0.3, rotate: -60 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 14, delay: 0.15 }}
            >
              <Check size={24} />
            </motion.span>
            <p className='mt-5 font-display text-[clamp(28px,2.6vw,38px)] leading-[1.15]'>
              Got it, {answers.name.split(' ')[0]}.
            </p>
            <p className='mt-4 text-[18px] leading-[1.6] text-muted'>
              I’ll write to <span className='ph-no-capture text-ink'>{email}</span> myself,
              from {INBOX}. If it’s not in your inbox, check spam.
            </p>
            <button
              type='button'
              onClick={() => setEmailStatus('idle')}
              className='mt-6 font-mono text-[13px] tracking-[0.04em] text-muted underline decoration-underline underline-offset-4 transition-colors duration-300 hover:text-ink'
            >
              Wrong address? Change it
            </button>
          </motion.div>
        ) : (
          <motion.form
            key='form'
            onSubmit={submit}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <h3 className='font-display text-[clamp(26px,2.6vw,36px)] leading-[1.15]'>
              Prefer email?
            </h3>
            <p className='mt-3 max-w-[560px] text-[18px] leading-[1.6] text-muted'>
              Leave your address and I’ll reply to your prognosis myself.
            </p>
            <div className='mt-6 flex max-w-[620px] flex-col gap-4 sm:flex-row sm:items-end'>
              <label className='block flex-1'>
                <span className={fieldLabel}>Email</span>
                <input
                  name='email'
                  type='email'
                  required
                  maxLength={254}
                  autoComplete='email'
                  defaultValue={email}
                  className={`ph-no-capture ${textInput}`}
                />
              </label>
              <button
                type='submit'
                disabled={emailStatus === 'sending'}
                className={`${primaryButton} justify-center disabled:translate-y-0 disabled:cursor-wait disabled:opacity-70`}
              >
                {emailStatus === 'sending' ? 'Sending…' : 'Send'}
              </button>
            </div>
            <div aria-hidden className='absolute -left-[9999px] h-px w-px overflow-hidden'>
              <label>
                Leave this empty
                <input ref={gotcha} name='_gotcha' tabIndex={-1} autoComplete='off' />
              </label>
            </div>
            <AnimatePresence initial={false}>
              {emailStatus === 'failed' && (
                <motion.p
                  key='failed'
                  role='alert'
                  className='mt-5 text-[17px] leading-[1.55]'
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  That didn’t send. Try again, or{' '}
                  <a
                    href={answersMailto(answers)}
                    className='underline decoration-accent underline-offset-4'
                  >
                    email me directly
                  </a>
                  .
                </motion.p>
              )}
            </AnimatePresence>
          </motion.form>
        )}
      </AnimatePresence>
    </section>
  );
};
