'use client';

import Image from 'next/image';
import { useState } from 'react';
import data from '~~/data/mariposa.json';
import { ArrowUpRight, Plus } from '../icons';
import { TeardownForm } from './TeardownForm';

type Part = {
  number: string;
  name: string;
  when: string;
  in: string[];
  pain: string;
  promise: string;
  steps: string[];
};

// No prices on the page: the teardown shows what the work is like first, and
// the price comes with my reply. The Whop listings stay live for that reply.
type Offer = {
  name: string;
  tag: string;
  parts: string;
  detail: string;
  primary: boolean;
};

type Shot = { src: string; alt: string; caption: string };

// Only founders who said yes get a case here, named. A quote goes in once
// they've sent one in their own words.
type Case = {
  name: string;
  url: string;
  summary: string;
  facts: { label: string; value: string }[];
  before: Shot;
  after: Shot;
  fixes: { found: string; shipped: string }[];
  quote?: { text: string; by: string };
};

const primaryButton =
  'inline-flex min-h-[52px] items-center rounded-full bg-accent px-7 font-mono text-[15px] font-semibold tracking-[0.02em] text-on-accent transition-transform duration-300 ease-soft hover:-translate-y-0.5';
const secondaryButton =
  'inline-flex min-h-[52px] items-center rounded-full border border-ink px-7 font-mono text-[15px] tracking-[0.02em] transition-transform duration-300 ease-soft hover:-translate-y-0.5';

const external = (href: string) =>
  href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {};

const facts = [
  { label: 'Parts', value: 'Ten, alone or together' },
  { label: 'Audit', value: 'Within 24 hours' },
  { label: 'Build', value: 'One week' },
  { label: 'Stack', value: 'Whatever you built it in' },
];

// The parts list is an accordion: one part open at a time, the Audit first.
// Rows animate open through grid-template-rows 0fr → 1fr.
const PART_COLUMNS =
  'grid-cols-[40px_minmax(0,1fr)_24px] md:grid-cols-[64px_minmax(0,1.1fr)_minmax(0,1fr)_190px_28px]';
// Fixes read across on desktop (number, found, shipped) and stack on a phone.
const FIX_COLUMNS =
  'grid-cols-[40px_minmax(0,1fr)] md:grid-cols-[64px_minmax(0,1fr)_minmax(0,1fr)]';

const CaseStudy = ({ study }: { study: Case }) => (
  <article className='mt-12 border-t border-line pt-10'>
    <div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3'>
      <h3 className='font-display text-[clamp(32px,3vw,46px)] leading-[1.1] tracking-[-0.015em]'>
        {study.name}
      </h3>
      <a
        href={study.url}
        {...external(study.url)}
        className='inline-flex items-center gap-2 font-mono text-[13px] tracking-[0.04em] text-muted underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-300 hover:decoration-current'
      >
        {study.url.replace('https://', '')}
        <ArrowUpRight size={15} />
      </a>
    </div>
    <p className='mt-4 max-w-[640px] text-[18px] leading-[1.6] text-muted'>
      {study.summary}
    </p>
    <dl className='mt-10 grid grid-cols-2 gap-8 md:grid-cols-4'>
      {study.facts.map((fact) => (
        <div key={fact.label}>
          <dt className='font-mono text-[12px] tracking-[0.1em] text-muted uppercase'>
            {fact.label}
          </dt>
          <dd className='mt-2.5 font-display text-[20px] md:text-[24px]'>
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
    <div className='mt-12 grid gap-x-4 gap-y-8 md:grid-cols-2'>
      {[study.before, study.after].map((shot) => (
        <figure key={shot.src}>
          <div className='relative aspect-[16/10] overflow-hidden rounded-[22px] border border-line bg-tile'>
            <Image
              src={shot.src}
              alt={shot.alt}
              fill
              sizes='(min-width: 768px) 50vw, 100vw'
              className='object-cover object-top'
            />
          </div>
          <figcaption className='mt-3 font-mono text-[13px] tracking-[0.03em] text-muted'>
            {shot.caption}
          </figcaption>
        </figure>
      ))}
    </div>
    <div className='mt-12'>
      <div
        aria-hidden
        className={`hidden gap-x-6 pb-4 font-mono text-[12px] tracking-[0.1em] text-muted uppercase md:grid ${FIX_COLUMNS}`}
      >
        <span />
        <span>What I found</span>
        <span>What shipped</span>
      </div>
      <ol className='border-t border-line'>
        {study.fixes.map((fix, i) => (
          <li
            key={fix.found}
            className={`grid gap-x-4 gap-y-3 border-b border-line py-6 md:gap-x-6 ${FIX_COLUMNS}`}
          >
            <span className='font-mono text-[15px] font-semibold text-accent-text'>
              {i + 1}
            </span>
            <p className='text-[17px] leading-[1.55] text-muted'>
              <span className='sr-only'>Found: </span>
              {fix.found}
            </p>
            <p className='col-start-2 text-[17px] leading-[1.55] md:col-start-auto'>
              <span className='mr-2 font-mono text-[12px] tracking-[0.1em] text-accent-text uppercase md:sr-only'>
                Shipped
              </span>
              {fix.shipped}
            </p>
          </li>
        ))}
      </ol>
    </div>
    {study.quote && (
      <blockquote className='mt-14 max-w-[900px]'>
        <p className='font-display text-[clamp(24px,2.4vw,34px)] leading-[1.3] italic'>
          “{study.quote.text}”
        </p>
        <footer className='mt-4 font-mono text-[13px] tracking-[0.03em] text-muted'>
          {study.quote.by}
        </footer>
      </blockquote>
    )}
  </article>
);

export const Mariposa = () => {
  const parts: Part[] = data.parts;
  const offers: Offer[] = data.offers;
  const cases: Case[] = data.cases;
  const [open, setOpen] = useState(1);

  return (
    <main className='mx-auto max-w-[1440px] px-5 pb-28 md:px-10'>
      <section className='pt-16 md:pt-[clamp(64px,9vw,140px)]'>
        <p className='font-mono text-[13px] tracking-[0.1em] text-muted uppercase'>
          The Mariposa Program
        </p>
        <h1 className='mt-5 max-w-[1040px] font-display text-[clamp(44px,6.4vw,100px)] leading-[1.03] tracking-[-0.025em]'>
          You built it fast. Now make it feel finished.
        </h1>
        <p className='mt-9 max-w-[640px] text-[clamp(18px,1.5vw,21px)] leading-[1.6] text-muted'>
          A UI/UX process for founders who built their web app with Lovable,
          Bolt, Replit, v0 or Cursor, and can tell it feels off. Ten parts,
          from a free teardown to monthly care. The audit tells you which parts
          you need. Buy those, or all of them.
        </p>
        <div className='mt-10 flex flex-wrap gap-3'>
          <a href='#teardown' className={primaryButton}>
            Request a free teardown
          </a>
          <a href='#parts' className={secondaryButton}>
            See the ten parts
          </a>
        </div>
        <dl className='mt-16 grid grid-cols-2 gap-8 border-t border-line pt-7 md:mt-[clamp(64px,7vw,110px)] md:grid-cols-4'>
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className='font-mono text-[12px] tracking-[0.1em] text-muted uppercase'>
                {fact.label}
              </dt>
              <dd className='mt-2.5 font-display text-[20px] md:text-[24px]'>
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className='pt-24 md:pt-[clamp(96px,10vw,160px)]' id='parts'>
        <div className='flex flex-wrap items-end justify-between gap-6'>
          <h2 className='font-display text-[clamp(34px,3.6vw,56px)] tracking-[-0.02em]'>
            The ten parts
          </h2>
          <p className='max-w-[520px] text-[18px] leading-[1.6] text-muted'>
            Same product, new form. Most of the work is subtraction: what
            isn’t working comes off, and what’s left is rebuilt so it reads as
            one product. Hence the name.
          </p>
        </div>
        <ol className='mt-12 border-t border-line'>
          {parts.map((part, i) => {
            const isOpen = open === i;
            const panelId = `part-${part.number}`;
            return (
              <li key={part.number} className='border-b border-line'>
                <h3>
                  <button
                    type='button'
                    id={`${panelId}-toggle`}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className={`grid w-full items-baseline gap-x-4 gap-y-2 py-6 text-left md:gap-x-6 md:py-7 ${PART_COLUMNS}`}
                  >
                    <span className='font-mono text-[15px] font-semibold text-accent-text'>
                      {part.number}
                    </span>
                    <span className='font-display text-[24px] leading-[1.15] tracking-[-0.01em] md:text-[clamp(24px,2.2vw,34px)]'>
                      {part.name}
                    </span>
                    <span
                      className={`col-start-2 row-start-2 text-[17px] leading-[1.4] italic transition-colors duration-400 md:col-start-auto md:row-start-auto md:text-[19px] ${
                        isOpen ? 'text-ink' : 'text-muted'
                      }`}
                    >
                      {part.promise}
                    </span>
                    <span className='col-start-2 row-start-3 font-mono text-[13px] tracking-[0.03em] text-muted md:col-start-auto md:row-start-auto md:text-right'>
                      {part.when}
                    </span>
                    <Plus
                      className={`col-start-3 row-start-1 self-center justify-self-end transition-transform duration-500 ease-soft md:col-start-auto md:row-start-auto ${
                        isOpen ? 'rotate-45' : ''
                      }`}
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role='region'
                  aria-labelledby={`${panelId}-toggle`}
                  inert={!isOpen}
                  className='grid transition-[grid-template-rows] duration-[600ms] ease-soft'
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className='min-h-0 overflow-hidden'>
                    <div className={`grid gap-x-4 gap-y-5 pb-9 md:gap-x-6 ${PART_COLUMNS}`}>
                      <span aria-hidden />
                      <div>
                        <p className='text-[18px] leading-[1.55] text-muted'>
                          {part.pain}
                        </p>
                        {part.in.length > 0 && (
                          <ul className='mt-4 flex flex-wrap gap-2'>
                            {part.in.map((bundle) => (
                              <li
                                key={bundle}
                                className='rounded-full border border-line px-3 py-1.5 font-mono text-[12px] text-muted'
                              >
                                In the {bundle}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <ul className='col-start-2 flex flex-col gap-3 md:col-[3/5]'>
                        {part.steps.map((step) => (
                          <li
                            key={step}
                            className='relative pl-[22px] text-[17px] leading-[1.5]'
                          >
                            <span
                              aria-hidden
                              className='absolute top-[0.72em] left-0 h-px w-2.5 bg-accent'
                            />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {cases.length > 0 && (
        <section className='pt-24 md:pt-[clamp(96px,10vw,160px)]' id='cases'>
          <div className='flex flex-wrap items-end justify-between gap-6'>
            <h2 className='font-display text-[clamp(34px,3.6vw,56px)] tracking-[-0.02em]'>
              Case studies
            </h2>
            <p className='max-w-[520px] text-[18px] leading-[1.6] text-muted'>
              Real teardowns, shared with the founders’ permission.
            </p>
          </div>
          {cases.map((study) => (
            <CaseStudy key={study.name} study={study} />
          ))}
        </section>
      )}

      <section className='pt-24 md:pt-[clamp(96px,10vw,160px)]' id='how'>
        <div className='flex flex-wrap items-end justify-between gap-6'>
          <h2 className='font-display text-[clamp(34px,3.6vw,56px)] tracking-[-0.02em]'>
            How it works
          </h2>
          <p className='max-w-[520px] text-[18px] leading-[1.6] text-muted'>
            After the teardown comes the audit. Then take the whole build, or
            just the part it points at.
          </p>
        </div>
        <ul className='mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {offers.map((offer) => (
            <li
              key={offer.name}
              className={`flex flex-col rounded-[22px] border p-7 md:p-[30px] ${
                offer.primary ? 'border-accent bg-tile' : 'border-line'
              }`}
            >
              <span
                className={`font-mono text-[12px] tracking-[0.1em] uppercase ${
                  offer.primary ? 'text-accent-text' : 'text-muted'
                }`}
              >
                {offer.tag}
              </span>
              <span className='mt-5 font-display text-[clamp(30px,2.6vw,38px)] leading-[1.1] tracking-[-0.01em]'>
                {offer.name}
              </span>
              <span className='mt-4 font-mono text-[13px] text-muted'>
                {offer.parts}
              </span>
              <span className='mt-2 text-[17px] leading-[1.55]'>
                {offer.detail}
              </span>
            </li>
          ))}
        </ul>
        <p className='mt-6 max-w-[640px] font-mono text-[13px] leading-[1.6] text-muted'>
          Book the Website or App Augment within 7 days of your audit and what
          you paid for the audit comes off it. The credit doesn’t apply to
          single parts.
        </p>
      </section>

      <section className='mt-24 grid gap-10 border-t border-line pt-10 md:mt-[clamp(96px,10vw,160px)] md:grid-cols-3'>
        <div>
          <h3 className='font-display text-[26px]'>Front end only</h3>
          <p className='mt-3 text-[17px] leading-[1.6] text-muted'>
            Design and front-end code: what people see and touch. No backend,
            infrastructure or security work.
          </p>
        </div>
        <div>
          <h3 className='font-display text-[26px]'>Any stack</h3>
          <p className='mt-3 text-[17px] leading-[1.6] text-muted'>
            Lovable, Bolt, Replit, v0, Cursor, Next.js, React, Webflow, Framer,
            WordPress. If it’s live, I can work on it.
          </p>
        </div>
        <div>
          <h3 className='font-display text-[26px]'>Two guarantees</h3>
          <p className='mt-3 text-[17px] leading-[1.6] text-muted'>
            At least 10 fixes worth making in your audit, or a full refund.
            After a build, anything the re-audit finds still open, I fix for
            free.
          </p>
        </div>
      </section>

      <section
        className='grid scroll-mt-8 gap-12 pt-24 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-[clamp(40px,5vw,96px)] md:pt-[clamp(96px,10vw,160px)]'
        id='teardown'
      >
        <div>
          <p className='font-mono text-[13px] tracking-[0.1em] text-muted uppercase'>
            Part 00 · Free
          </p>
          <h2 className='mt-5 font-display text-[clamp(40px,4.6vw,72px)] leading-[1.08] tracking-[-0.02em]'>
            Start with a free teardown.
          </h2>
          <p className='mt-6 max-w-[520px] text-[19px] leading-[1.6] text-muted'>
            Send me your link. Within 24 hours I’ll send back the three things
            I’d fix first, marked on a screenshot, with what each one costs you
            and how to fix it.
          </p>
          <p className='mt-4 max-w-[520px] text-[19px] leading-[1.6] text-muted'>
            No call and no pitch. If you want more fixed after that, I’ll tell
            you which parts you need and what they cost.
          </p>
        </div>
        <TeardownForm buttonClassName={primaryButton} />
      </section>
    </main>
  );
};
