'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { FormEvent, KeyboardEvent, useState } from 'react';
import { EMAIL as INBOX } from '~~/lib/site';
import { Check } from '../icons';
import { EASE_OUT_EXPO } from '../motion/Reveal';

type Values = {
  name: string;
  email: string;
  business: string;
  url: string;
  problem: string;
};

const EMPTY: Values = { name: '', email: '', business: '', url: '', problem: '' };

const label = 'font-mono text-[12px] tracking-[0.1em] text-muted uppercase';
const input =
  'mt-2.5 w-full rounded-[14px] border border-line bg-paper px-4 py-3.5 text-[17px] text-ink transition-colors duration-300 placeholder:text-muted/60 hover:border-muted focus:border-ink';

// If the send fails, the request still reaches me: the error offers an email
// with everything they typed already in it.
const mailto = (values: Values) =>
  `mailto:${INBOX}?subject=${encodeURIComponent(
    `Teardown request${values.business ? `: ${values.business}` : ''}`
  )}&body=${encodeURIComponent(
    `Name: ${values.name}\nBusiness: ${values.business}\nLink: ${values.url}\n\n${values.problem}`
  )}`;

// Where the ask goes without script, which the modal needs: the same email,
// with the form's questions in it.
export const REQUEST_HREF = mailto(EMPTY);

// "Within 24 hours" as a time they can hold me to: a day from now, rounded up
// to the hour, in their own time zone.
const replyBy = () => {
  const by = new Date();
  by.setHours(by.getHours() + 25, 0, 0, 0);
  const day = by.toLocaleDateString(undefined, { weekday: 'long' });
  const time = by.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${day} at ${time}`;
};

// The request's state lives on the page, not in the form: it outlasts the
// modal closing, and the page hides its floating button once it's sent.
export const useTeardown = () => {
  const [values, setValues] = useState<Values>(EMPTY);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>(
    'idle'
  );
  const [by, setBy] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = Object.fromEntries(
      Object.keys(EMPTY).map((key) => [key, String(form.get(key) ?? '')])
    ) as Values;
    setValues(next);
    setStatus('sending');
    try {
      const res = await fetch('/api/teardown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...next, _gotcha: form.get('_gotcha') }),
      });
      if (res.ok) setBy(replyBy());
      setStatus(res.ok ? 'sent' : 'failed');
    } catch {
      setStatus('failed');
    }
  };

  return { values, status, by, submit, edit: () => setStatus('idle') };
};

export type Teardown = ReturnType<typeof useTeardown>;

// The motion follows the Bord waitlist form (~/Desktop/bord-web,
// components/WaitlistForm.tsx), the house pattern for any form with a
// confirmation: the form lifts out, the confirmation rises in on an expo-out
// curve, and its mark pops in on a spring just after.
export const TeardownForm = ({
  teardown: { values, status, by, submit, edit },
  buttonClassName,
}: {
  teardown: Teardown;
  buttonClassName: string;
}) => {
  // ⌘/Ctrl+Enter sends from any field, the message box included, where Enter
  // alone is a new line. requestSubmit runs the same checks as the button.
  const onKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== 'Enter' || !(event.metaKey || event.ctrlKey)) return;
    event.preventDefault();
    if (status !== 'sending') event.currentTarget.requestSubmit();
  };

  return (
    <AnimatePresence mode='wait' initial={false}>
      {status === 'sent' ? (
        <motion.div
          key='sent'
          role='status'
          className='pt-6'
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
            Got it, {values.name.split(' ')[0]}.
          </p>
          <p className='mt-4 text-[18px] leading-[1.6] text-muted'>
            Your teardown will be in{' '}
            <span className='text-ink'>{values.email}</span> by{' '}
            <span className='text-ink'>{by}</span>, from {INBOX}. If it’s not
            there, check spam.
          </p>
          <button
            type='button'
            onClick={edit}
            className='mt-6 font-mono text-[13px] tracking-[0.04em] text-muted underline decoration-underline underline-offset-4 transition-colors duration-300 hover:text-ink'
          >
            Wrong address? Change it
          </button>
        </motion.div>
      ) : (
        <motion.form
          key='form'
          onSubmit={submit}
          onKeyDown={onKeyDown}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          <div className='grid gap-6 md:grid-cols-2'>
            <label className='block'>
              <span className={label}>Your name</span>
              <input
                name='name'
                required
                maxLength={120}
                autoComplete='name'
                defaultValue={values.name}
                className={input}
              />
            </label>
            <label className='block'>
              <span className={label}>Email</span>
              <input
                name='email'
                type='email'
                required
                maxLength={254}
                autoComplete='email'
                defaultValue={values.email}
                className={input}
              />
            </label>
            <label className='block'>
              <span className={label}>Business</span>
              <input
                name='business'
                required
                maxLength={120}
                autoComplete='organization'
                defaultValue={values.business}
                className={input}
              />
            </label>
            <label className='block'>
              <span className={label}>Link to your site or app</span>
              {/* Not type=url: it rejects "myapp.com", which is how people type it. */}
              <input
                name='url'
                required
                maxLength={500}
                inputMode='url'
                autoComplete='url'
                autoCapitalize='none'
                spellCheck={false}
                placeholder='yourapp.com'
                defaultValue={values.url}
                className={input}
              />
            </label>
            <label className='block md:col-span-2'>
              <span className={label}>What’s not working right now?</span>
              <textarea
                name='problem'
                required
                maxLength={2000}
                rows={4}
                placeholder='People sign up, then never come back.'
                defaultValue={values.problem}
                className={`${input} resize-y`}
              />
            </label>
          </div>
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
                className='mt-6 text-[17px] leading-[1.55]'
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                That didn’t send. Try again, or{' '}
                <a
                  href={mailto(values)}
                  className='underline decoration-accent underline-offset-4'
                >
                  email it to me
                </a>{' '}
                instead.
              </motion.p>
            )}
          </AnimatePresence>
          <div className='mt-8 flex flex-wrap items-center gap-x-6 gap-y-4'>
            <button
              type='submit'
              disabled={status === 'sending'}
              className={`${buttonClassName} disabled:translate-y-0 disabled:cursor-wait disabled:opacity-70`}
            >
              {status === 'sending' ? 'Sending…' : 'Request a free teardown'}
            </button>
            <p className='font-mono text-[13px] text-muted'>
              A reply within 24 hours.
            </p>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
};
