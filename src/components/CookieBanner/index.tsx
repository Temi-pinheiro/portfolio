'use client';

import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import posthog from 'posthog-js';
import { useState, useSyncExternalStore } from 'react';
import { EASE_OUT_EXPO } from '../motion/Reveal';

// Asks once whether PostHog may set a cookie (instrumentation-client.ts).
// Until the visitor answers, nothing is captured. "Allow" turns on full
// tracking and session replay; "No thanks" leaves PostHog counting visits
// without cookies. It only shows where PostHog runs (temipinheiro.com), sits
// above the floating teardown pill but under the modals, and never comes back
// once answered: PostHog keeps the answer.

const subscribe = () => () => {};
const pending = () =>
  Boolean(posthog.__loaded) && posthog.get_explicit_consent_status() === 'pending';

const button =
  'inline-flex min-h-9 items-center rounded-full px-4 font-mono md:min-h-10 md:px-5 text-[13px] font-semibold tracking-[0.02em] transition-[translate,scale,border-color] duration-300 ease-soft hover:-translate-y-0.5 active:scale-[0.97]';

export const CookieBanner = () => {
  // PostHog is set up before the page hydrates, so this reads its answer on
  // the first client render. On the server there's nothing to ask yet.
  const asking = useSyncExternalStore(subscribe, pending, () => false);
  const [answered, setAnswered] = useState(false);

  const answer = (allow: boolean) => {
    if (allow) posthog.opt_in_capturing();
    else posthog.opt_out_capturing();
    setAnswered(true);
  };

  return (
    <MotionConfig reducedMotion='user'>
      <AnimatePresence>
        {asking && !answered && (
          <motion.section
            aria-label='Cookies'
            className='fixed inset-x-3 bottom-3 z-40 rounded-[18px] border border-line bg-paper p-4 shadow-[0_24px_60px_-28px_rgb(0_0_0/0.45)] md:inset-x-auto md:bottom-6 md:left-6 md:max-w-[380px] md:p-5'
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO, delay: 1 } }}
            exit={{ opacity: 0, y: 10, transition: { duration: 0.25 } }}
          >
            <p className='text-[15px] leading-[1.5] text-muted md:text-[16px] md:leading-[1.55]'>
              <span className='text-ink'>Mind if I use a cookie?</span> PostHog
              shows me how people use this site, with recordings that hide what
              you type. Say no and visits are still counted, just without one.
            </p>
            <div className='mt-3 flex flex-wrap gap-2 md:mt-4'>
              <button
                type='button'
                onClick={() => answer(true)}
                className={`${button} bg-ink text-paper`}
              >
                Allow
              </button>
              <button
                type='button'
                onClick={() => answer(false)}
                className={`${button} border border-line hover:border-muted`}
              >
                No thanks
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
};
