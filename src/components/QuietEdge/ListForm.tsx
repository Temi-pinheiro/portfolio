'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { type FormEvent, useState } from 'react';
import { Check } from '../icons';
import { EASE_OUT_EXPO } from '../motion/Reveal';

// The mailing list beside the free chapter: an email, and nothing else. It's
// single opt-in, so signing up is the whole step. The motion is the Bord
// waitlist form's, the house pattern for any form with a confirmation.
export const ListForm = ({ buttonClassName }: { buttonClassName: string }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = String(form.get('email') ?? '').trim();
    setEmail(value);
    setStatus('sending');
    try {
      const res = await fetch('/api/quiet-edge/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value, _gotcha: form.get('_gotcha') }),
      });
      setStatus(res.ok ? 'sent' : 'failed');
    } catch {
      setStatus('failed');
    }
  };

  return (
    <AnimatePresence mode='wait' initial={false}>
      {status === 'sent' ? (
        <motion.div
          key='sent'
          role='status'
          className='flex items-start gap-4'
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        >
          <motion.span
            className='inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent'
            initial={{ scale: 0.3, rotate: -60 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 14, delay: 0.15 }}
          >
            <Check size={20} />
          </motion.span>
          <div>
            <p className='font-display text-[24px] leading-[1.2]'>You’re on the list.</p>
            <p className='mt-2 text-[17px] leading-[1.6] text-muted'>
              I’ll write to <span className='text-ink'>{email}</span> when
              there’s a new edition.{' '}
              <button
                type='button'
                onClick={() => setStatus('idle')}
                className='font-mono text-[13px] tracking-[0.04em] underline decoration-underline underline-offset-4 transition-colors duration-300 hover:text-ink'
              >
                Wrong address?
              </button>
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.form
          key='form'
          onSubmit={submit}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          <label className='block'>
            <span className='font-mono text-[12px] tracking-[0.1em] text-muted uppercase'>
              Hear when there’s a new edition
            </span>
            <span className='mt-2.5 flex flex-col gap-3 sm:flex-row'>
              <input
                name='email'
                type='email'
                required
                maxLength={254}
                autoComplete='email'
                placeholder='you@work.com'
                defaultValue={email}
                className='min-h-[52px] w-full rounded-full border border-line bg-paper px-5 text-[17px] text-ink transition-colors duration-300 placeholder:text-muted/60 hover:border-muted focus:border-ink sm:max-w-[340px]'
              />
              <button
                type='submit'
                disabled={status === 'sending'}
                className={`${buttonClassName} justify-center disabled:translate-y-0 disabled:cursor-wait disabled:opacity-70`}
              >
                {status === 'sending' ? 'Adding you…' : 'Keep me posted'}
              </button>
            </span>
          </label>
          <div aria-hidden className='absolute -left-[9999px] h-px w-px overflow-hidden'>
            <label>
              Leave this empty
              <input name='_gotcha' tabIndex={-1} autoComplete='off' />
            </label>
          </div>
          <AnimatePresence initial={false}>
            {status === 'failed' && (
              <motion.p
                key='failed'
                role='alert'
                className='mt-4 text-[16px] leading-[1.55]'
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                That didn’t go through. Try again in a minute.
              </motion.p>
            )}
          </AnimatePresence>
          <p className='mt-4 text-[15px] leading-[1.55] text-muted'>
            I write when there’s a new edition, and every email has an
            unsubscribe link.
          </p>
        </motion.form>
      )}
    </AnimatePresence>
  );
};
