'use client';

import { useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useSyncExternalStore } from 'react';
import { LIFE_NAMES } from '~~/lib/metamorphosis';
import { ArrowRight } from '../icons';
import { FadeUp } from '../motion/Reveal';
import { StepFigure } from './StepFigure';
import { REQUEST_HREF } from './TeardownForm';

export type Step = {
  parts: string;
  name: string;
  when: string;
  promise: string;
  points: string[];
  build?: boolean;
};

type Part = { number: string; name: string; promise: string };

// The five steps scroll past on the right, on the page's own background, while
// the ASCII figure holds still on the left and goes through the butterfly's
// life cycle, one form per step (lib/metamorphosis). On a phone the figure is
// a band across the top that the text scrolls under. The step bar is the
// landing's chapter bar, in the figure's blue.

// Holds each form while its step is in view and changes form in the middle
// of the scroll between two steps.
const hold = (s: number) => {
  const k = Math.floor(s);
  const f = s - k;
  const t = Math.min(1, Math.max(0, (f - 0.2) / 0.6));
  return k + t * t * (3 - 2 * t);
};

// Where a step counts as the one being read: the middle of the screen on a
// desktop, and the middle of what the band leaves on a phone.
const subscribeWide = (onChange: () => void) => {
  const query = window.matchMedia('(min-width: 1024px)');
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};
const useWide = () =>
  useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia('(min-width: 1024px)').matches,
    () => true
  );

export const Steps = ({
  steps,
  build,
  onRequest,
}: {
  steps: Step[];
  build: Part[];
  onRequest: (from: HTMLElement) => void;
}) => {
  const list = useRef<HTMLOListElement>(null);
  const wide = useWide();
  const { scrollYProgress } = useScroll({
    target: list,
    offset: wide ? ['start center', 'end center'] : ['start 72%', 'end 72%'],
  });
  const last = steps.length - 1;
  const stage = useTransform(scrollYProgress, (p) =>
    hold(Math.min(last, Math.max(0, p * steps.length - 0.5)))
  );
  const [current, setCurrent] = useState(0);
  useMotionValueEvent(stage, 'change', (s) => setCurrent(Math.round(s)));

  const goTo = (i: number) =>
    document
      .getElementById(`step-${steps[i].parts}`)
      ?.scrollIntoView({ behavior: 'smooth', block: wide ? 'center' : 'start' });

  return (
    <div className='relative mt-10 lg:mt-0 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-[clamp(40px,5vw,96px)]'>
      <div className='sticky top-0 z-10 -mx-5 flex h-[44svh] flex-col bg-paper px-5 pb-2 md:-mx-10 md:px-10 lg:mx-0 lg:h-svh lg:bg-transparent lg:px-0 lg:pb-10'>
        <StepFigure stage={stage} className='min-h-0 w-full flex-1' />
        <div>
          <p
            aria-hidden
            className='mb-3 hidden font-mono text-[13px] tracking-[0.08em] text-accent-text uppercase lg:block'
          >
            {LIFE_NAMES[current]}
          </p>
          <div className='grid grid-cols-5 gap-2 md:gap-2.5'>
            {steps.map((step, i) => (
              <button
                key={step.parts}
                type='button'
                onClick={() => goTo(i)}
                aria-label={`Go to ${step.name}`}
                aria-current={i === current ? 'step' : undefined}
                className={`flex min-h-11 flex-col items-start justify-end gap-2 pb-1 text-left font-mono text-[12px] tracking-[0.04em] transition-colors duration-300 md:text-[13px] ${
                  i === current ? 'text-accent-text' : 'text-muted hover:text-ink'
                }`}
              >
                {step.parts}
                <span
                  aria-hidden
                  className={`block h-0.5 w-full rounded-full transition-colors duration-500 ${
                    i === current
                      ? 'bg-accent-text'
                      : i < current
                        ? 'bg-accent-text/40'
                        : 'bg-line'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        {/* On a phone, the text fades as it slides under the band. */}
        <div
          aria-hidden
          className='pointer-events-none absolute inset-x-0 top-full h-12 bg-linear-to-b from-paper lg:hidden'
        />
      </div>

      <ol ref={list}>
        {steps.map((step, i) => {
          const next = steps[i + 1];
          return (
            <li
              key={step.parts}
              id={`step-${step.parts}`}
              className='flex min-h-[78svh] scroll-mt-[46svh] flex-col justify-center py-14 lg:min-h-[92svh] lg:scroll-mt-0'
            >
              <FadeUp>
                <p className='flex items-center gap-2.5 font-mono text-[12px] tracking-[0.08em] text-muted uppercase md:text-[13px]'>
                  <span aria-hidden className='size-[7px] rounded-full bg-accent' />
                  {step.parts} · {step.when}
                </p>
                <h3 className='mt-4 font-display text-[clamp(44px,5vw,80px)] leading-[1.02] tracking-[-0.025em]'>
                  {step.name}
                </h3>
                <p className='mt-4 font-display text-[clamp(24px,2.3vw,34px)] leading-[1.25] text-muted italic'>
                  {step.promise}
                </p>
                {step.build ? (
                  <>
                    <ul className='mt-9 grid grid-cols-2 gap-x-6 gap-y-6'>
                      {build.map((part) => (
                        <li key={part.number}>
                          <span className='font-mono text-[12px] font-semibold text-accent-text'>
                            {part.number}
                          </span>
                          <p className='mt-1 font-display text-[21px] leading-[1.2]'>
                            {part.name.replace(/^The /, '')}
                          </p>
                          <p className='mt-1 text-[16px] leading-[1.45] text-muted'>
                            {part.promise}
                          </p>
                        </li>
                      ))}
                    </ul>
                    <p className='mt-8 max-w-[560px] text-[16px] leading-[1.55] text-muted'>
                      {step.points[0]}
                    </p>
                  </>
                ) : (
                  <ul className='mt-9 flex flex-col gap-4'>
                    {step.points.map((point) => (
                      <li key={point} className='relative pl-[22px] text-[18px] leading-[1.5]'>
                        <span
                          aria-hidden
                          className='absolute top-[0.75em] left-0 h-px w-2.5 bg-accent'
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                )}
                {next ? (
                  <p className='mt-10 font-mono text-[13px] tracking-[0.03em] text-muted'>
                    Next: {next.name}
                  </p>
                ) : (
                  <a
                    href={REQUEST_HREF}
                    aria-haspopup='dialog'
                    onClick={(event) => {
                      event.preventDefault();
                      onRequest(event.currentTarget);
                    }}
                    className='group mt-10 inline-flex items-center gap-2 font-mono text-[14px] tracking-[0.03em] text-accent-text'
                  >
                    It starts with a free teardown
                    <ArrowRight
                      size={18}
                      className='transition-transform duration-300 ease-soft group-hover:translate-x-1'
                    />
                  </a>
                )}
              </FadeUp>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
