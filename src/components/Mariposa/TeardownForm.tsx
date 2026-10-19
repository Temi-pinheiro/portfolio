'use client';

import { FormEvent, useState } from 'react';

const INBOX = 'temitopepinheiro@gmail.com';

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
    `Teardown request: ${values.business}`
  )}&body=${encodeURIComponent(
    `Name: ${values.name}\nBusiness: ${values.business}\nLink: ${values.url}\n\n${values.problem}`
  )}`;

export const TeardownForm = ({ buttonClassName }: { buttonClassName: string }) => {
  const [values, setValues] = useState<Values>(EMPTY);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>(
    'idle'
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
      setStatus(res.ok ? 'sent' : 'failed');
    } catch {
      setStatus('failed');
    }
  };

  if (status === 'sent') {
    return (
      <div
        role='status'
        className='self-start rounded-[22px] border border-accent bg-tile p-7 md:p-[34px]'
      >
        <p className='font-display text-[clamp(28px,2.6vw,38px)] leading-[1.15]'>
          Got it, {values.name.split(' ')[0]}.
        </p>
        <p className='mt-4 text-[18px] leading-[1.6] text-muted'>
          Your teardown will be in{' '}
          <span className='text-ink'>{values.email}</span> within 24 hours.
        </p>
        <button
          type='button'
          onClick={() => setStatus('idle')}
          className='mt-6 font-mono text-[13px] tracking-[0.04em] text-muted underline decoration-underline underline-offset-4 transition-colors duration-300 hover:text-ink'
        >
          Wrong address? Change it
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className='rounded-[22px] border border-line bg-tile p-7 md:p-[34px]'
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
      <div className='mt-8 flex flex-wrap items-center gap-x-6 gap-y-4'>
        <button
          type='submit'
          disabled={status === 'sending'}
          className={`${buttonClassName} disabled:translate-y-0 disabled:opacity-70`}
        >
          {status === 'sending' ? 'Sending…' : 'Request a free teardown'}
        </button>
        <p className='font-mono text-[13px] text-muted'>
          A reply within 24 hours.
        </p>
      </div>
      <p role='alert' className='mt-5 text-[17px] leading-[1.55] empty:hidden'>
        {status === 'failed' && (
          <>
            That didn’t send. Try again, or{' '}
            <a
              href={mailto(values)}
              className='underline decoration-accent underline-offset-4'
            >
              email it to me
            </a>{' '}
            instead.
          </>
        )}
      </p>
    </form>
  );
};
