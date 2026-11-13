'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { type FormEvent, type KeyboardEvent, type ReactNode, useRef, useState } from 'react';
import {
  HOURS,
  LIMITS,
  SECTORS,
  TEAM_SIZES,
  TOOLS,
  TRIED,
  WISHES,
  type Answers,
} from '~~/lib/intake';
import { EASE_OUT_EXPO } from '../../motion/Reveal';
import { primaryButton } from '../styles';
import { Chips, fieldLabel, textInput } from './Fields';
import type { Intake } from './useIntake';

// One question per screen. Enter moves on (⌘/Ctrl+Enter in a text box, where
// Enter is a new line); a chip picked with the pointer moves on by itself.
// The browser's own required checks guard each screen, and the one check it
// can't do (at least one box ticked) is done here.

type Screen = {
  title: string;
  hint?: string;
  // What's wrong with this screen's answers, if anything the browser can't
  // check is missing.
  problem?: (a: Answers) => string | null;
};

export const SCREENS: Screen[] = [
  {
    title: 'First, who am I talking to?',
    hint: 'Your name and the business’s. A website helps me see what you do, if you have one.',
  },
  { title: 'What does the business do?' },
  { title: 'How many people work in it?' },
  {
    title: 'Which tools does the team use every day?',
    hint: 'Tick all that apply. Anything I build works inside these.',
  },
  {
    title: 'What’s the biggest problem in the business right now?',
    hint: 'The thing that eats your week, loses you money or keeps coming back. A few sentences is plenty.',
  },
  {
    title: 'What do you wish ran by itself?',
    hint: 'Tick any that fit, or say it in your own words.',
  },
  { title: 'Roughly how many hours a week does that cost you and the team?' },
  {
    title: 'What have you tried with AI so far?',
    hint: 'Tick all that apply.',
    problem: (a) => (a.tried.length ? null : 'Tick at least one, even if it’s “Nothing yet”.'),
  },
  {
    title: 'Ninety days from now, what would you like to be true?',
    hint: 'Optional. Picture the week you’d rather be having.',
  },
];

const textArea = `${textInput} min-h-[140px] resize-y leading-[1.55]`;

// notNow: the way out on the first screen, since the dialog closes and the
// intake's own page links to /mariposa.
export const Questions = ({ intake, notNow }: { intake: Intake; notNow: ReactNode }) => {
  const { step, setStep, answers, update, submit } = intake;
  const last = SCREENS.length - 1;
  const screen = SCREENS[step];
  const [problem, setProblem] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);
  const form = useRef<HTMLFormElement>(null);
  const gotcha = useRef<HTMLInputElement>(null);

  // Each new screen starts at its first field (the picked chip, if there is
  // one), once it has mounted. With a coarse pointer that would bring up the
  // keyboard over the question, so the heading takes focus instead.
  const heading = useRef<HTMLHeadingElement>(null);
  const focusOnMount = useRef(false);
  const attachForm = (element: HTMLFormElement | null) => {
    form.current = element;
    if (!element || !focusOnMount.current) return;
    focusOnMount.current = false;
    requestAnimationFrame(() => {
      const field = element.querySelector<HTMLElement>(
        'input:checked, input:not([tabindex="-1"]), textarea'
      );
      if (field && matchMedia('(pointer: fine)').matches) field.focus();
      else heading.current?.focus();
    });
  };

  const go = (to: number) => {
    focusOnMount.current = true;
    setProblem(null);
    setDirection(to > step ? 1 : -1);
    setStep(to);
  };

  const next = (event?: FormEvent) => {
    event?.preventDefault();
    const issue = screen.problem?.(answers) ?? null;
    if (issue) {
      setProblem(issue);
      return;
    }
    if (step === last) submit(gotcha.current?.value ?? '');
    else go(step + 1);
  };

  // A chip picked by pointer on a one-answer screen: a beat to see it land,
  // then on. "Something else" waits for its text box.
  const pickThenNext = (value: string) => {
    if (value === 'Something else') return;
    setTimeout(() => form.current?.requestSubmit(), 280);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== 'Enter' || !(event.metaKey || event.ctrlKey)) return;
    event.preventDefault();
    event.currentTarget.requestSubmit();
  };

  const body = () => {
    switch (step) {
      case 0:
        return (
          <div className='grid gap-6 md:grid-cols-2'>
            <label className='block'>
              <span className={fieldLabel}>Your name</span>
              <input
                required
                maxLength={LIMITS.name}
                autoComplete='name'
                value={answers.name}
                onChange={(e) => update('name', e.target.value)}
                className={textInput}
              />
            </label>
            <label className='block'>
              <span className={fieldLabel}>Business name</span>
              <input
                required
                maxLength={LIMITS.business}
                autoComplete='organization'
                value={answers.business}
                onChange={(e) => update('business', e.target.value)}
                className={textInput}
              />
            </label>
            <label className='block md:col-span-2'>
              <span className={fieldLabel}>Website (optional)</span>
              {/* Not type=url: it rejects "mybusiness.com", which is how people type it. */}
              <input
                maxLength={LIMITS.website}
                inputMode='url'
                autoComplete='url'
                autoCapitalize='none'
                spellCheck={false}
                placeholder='yourbusiness.com'
                value={answers.website}
                onChange={(e) => update('website', e.target.value)}
                className={textInput}
              />
            </label>
          </div>
        );
      case 1:
        return (
          <>
            <Chips
              name='sector'
              legend={screen.title}
              options={SECTORS}
              required
              value={answers.sector}
              onChange={(value) => update('sector', value)}
              onPick={pickThenNext}
            />
            {answers.sector === 'Something else' && (
              <label className='mt-6 block max-w-[560px]'>
                <span className={fieldLabel}>In a few words</span>
                <input
                  required
                  autoFocus
                  maxLength={LIMITS.sectorOther}
                  value={answers.sectorOther}
                  onChange={(e) => update('sectorOther', e.target.value)}
                  className={textInput}
                />
              </label>
            )}
          </>
        );
      case 2:
        return (
          <Chips
            name='team'
            legend={screen.title}
            options={TEAM_SIZES}
            required
            value={answers.team}
            onChange={(value) => update('team', value)}
            onPick={pickThenNext}
          />
        );
      case 3:
        return (
          <>
            <Chips
              multiple
              name='tools'
              legend={screen.title}
              options={TOOLS}
              value={answers.tools}
              onChange={(value) => update('tools', value)}
            />
            <label className='mt-8 block max-w-[640px]'>
              <span className={fieldLabel}>Anything else? (optional)</span>
              <input
                maxLength={LIMITS.toolsOther}
                placeholder='The booking system, the POS, a custom app…'
                value={answers.toolsOther}
                onChange={(e) => update('toolsOther', e.target.value)}
                className={textInput}
              />
            </label>
          </>
        );
      case 4:
        return (
          <label className='block'>
            <span className='sr-only'>{screen.title}</span>
            <textarea
              required
              maxLength={LIMITS.problem}
              rows={5}
              value={answers.problem}
              onChange={(e) => update('problem', e.target.value)}
              className={textArea}
            />
          </label>
        );
      case 5:
        return (
          <>
            <Chips
              multiple
              name='wishes'
              legend={screen.title}
              options={WISHES}
              value={answers.wishes}
              onChange={(value) => update('wishes', value)}
            />
            <label className='mt-8 block'>
              <span className={fieldLabel}>In your own words (optional)</span>
              <textarea
                maxLength={LIMITS.wishesOther}
                rows={3}
                value={answers.wishesOther}
                onChange={(e) => update('wishesOther', e.target.value)}
                className={`${textArea} min-h-[100px]`}
              />
            </label>
          </>
        );
      case 6:
        return (
          <Chips
            name='hours'
            legend={screen.title}
            options={HOURS}
            required
            value={answers.hours}
            onChange={(value) => update('hours', value)}
            onPick={pickThenNext}
          />
        );
      case 7:
        return (
          <Chips
            multiple
            name='tried'
            legend={screen.title}
            options={TRIED}
            value={answers.tried}
            onChange={(value) => {
              setProblem(null);
              update('tried', value);
            }}
          />
        );
      default:
        return (
          <label className='block'>
            <span className='sr-only'>{screen.title}</span>
            <textarea
              maxLength={LIMITS.goal}
              rows={4}
              value={answers.goal}
              onChange={(e) => update('goal', e.target.value)}
              className={textArea}
            />
          </label>
        );
    }
  };

  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-1 px-5 pt-[clamp(32px,8svh,96px)] pb-10 md:px-10'>
        <div className='mx-auto max-w-[820px]'>
          <AnimatePresence mode='wait' initial={false} custom={direction}>
            <motion.form
              key={step}
              ref={attachForm}
              id='intake-form'
              onSubmit={next}
              onKeyDown={onKeyDown}
              custom={direction}
              initial={{ opacity: 0, y: 24 * direction }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 * direction, transition: { duration: 0.2 } }}
              transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
            >
              <p className='font-mono text-[13px] tracking-[0.08em] text-accent-text'>
                {String(step + 1).padStart(2, '0')} / {String(SCREENS.length).padStart(2, '0')}
              </p>
              <h3
                ref={heading}
                tabIndex={-1}
                className='mt-4 font-display text-[clamp(32px,4vw,56px)] leading-[1.08] tracking-[-0.02em] outline-none'
              >
                {screen.title}
              </h3>
              {screen.hint && (
                <p className='mt-4 max-w-[620px] text-[18px] leading-[1.55] text-muted'>
                  {screen.hint}
                </p>
              )}
              <div className='mt-9'>{body()}</div>
              <AnimatePresence initial={false}>
                {problem && (
                  <motion.p
                    key='problem'
                    role='alert'
                    className='mt-6 text-[17px] leading-[1.55]'
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {problem}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.form>
          </AnimatePresence>
          {/* The honeypot: a field people never see. */}
          <div aria-hidden className='absolute -left-[9999px] h-px w-px overflow-hidden'>
            <label>
              Leave this empty
              <input ref={gotcha} name='_gotcha' tabIndex={-1} autoComplete='off' />
            </label>
          </div>
        </div>
      </div>

      <div className='sticky bottom-0 border-t border-line bg-paper/90 px-5 py-4 backdrop-blur-md md:px-10'>
        <div className='mx-auto flex max-w-[820px] items-center justify-between gap-4'>
          {step > 0 ? (
            <button
              type='button'
              onClick={() => go(step - 1)}
              className='min-h-11 font-mono text-[14px] tracking-[0.03em] text-muted transition-colors duration-300 hover:text-ink'
            >
              Back
            </button>
          ) : (
            notNow
          )}
          <div className='flex items-center gap-5'>
            <span className='hidden font-mono text-[12px] text-muted md:inline'>
              {step === 4 || step === 5 || step === 8 ? '⌘ + Enter' : 'Enter ↵'}
            </span>
            <button type='submit' form='intake-form' className={primaryButton}>
              {step === last ? 'Get your prognosis' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
