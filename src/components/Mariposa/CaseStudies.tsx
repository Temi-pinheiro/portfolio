'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight } from '../icons';
import { ModalContent, ModalHeader, modalEyebrow as eyebrow } from './Modal';

type Shot = { src: string; alt: string; caption: string };

// Only founders who said yes get a case here, named. A quote goes in once
// they've sent one in their own words.
export type Case = {
  name: string;
  url: string;
  summary: string;
  facts: { label: string; value: string }[];
  before: Shot;
  after: Shot;
  fixes: { found: string; shipped: string }[];
  quote?: { text: string; by: string };
};

// Fixes read across on desktop (number, found, shipped) and stack on a phone.
const FIX_COLUMNS =
  'grid-cols-[40px_minmax(0,1fr)] md:grid-cols-[64px_minmax(0,1fr)_minmax(0,1fr)]';

const Facts = ({ facts }: { facts: Case['facts'] }) => (
  <dl className='grid grid-cols-2 gap-6 md:grid-cols-4'>
    {facts.map((fact) => (
      <div key={fact.label}>
        <dt className={eyebrow}>{fact.label}</dt>
        <dd className='mt-2 font-display text-[20px] md:text-[22px]'>{fact.value}</dd>
      </div>
    ))}
  </dl>
);

// The case itself, as the modal shows it. It ends on the one next step: the
// "Request a free teardown" button swaps this modal for the form's.
const CaseModal = ({
  study,
  buttonClassName,
  onRequest,
}: {
  study: Case;
  buttonClassName: string;
  onRequest: () => void;
}) => (
  <>
    <ModalHeader eyebrow='Case study' title={study.name} />
    <div className='px-6 pb-8 md:px-12 md:pb-12'>
      <a
        href={study.url}
        target='_blank'
        rel='noreferrer'
        className='inline-flex items-center gap-2 font-mono text-[13px] tracking-[0.04em] text-muted underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-300 hover:decoration-current'
      >
        {study.url.replace('https://', '')}
        <ArrowUpRight size={15} />
      </a>
      <Dialog.Description className='mt-4 max-w-[640px] text-[18px] leading-[1.6] text-muted'>
        {study.summary}
      </Dialog.Description>
      <div className='mt-8'>
        <Facts facts={study.facts} />
      </div>
      <div className='mt-10 grid gap-x-4 gap-y-8 md:grid-cols-2'>
        {[study.before, study.after].map((shot) => (
          <figure key={shot.src}>
            <div className='relative aspect-[16/10] overflow-hidden rounded-[18px] border border-line bg-tile'>
              <Image
                src={shot.src}
                alt={shot.alt}
                fill
                sizes='(min-width: 1120px) 520px, (min-width: 768px) 45vw, 100vw'
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
          className={`hidden gap-x-6 pb-4 ${eyebrow} md:grid ${FIX_COLUMNS}`}
        >
          <span />
          <span>What I found</span>
          <span>What shipped</span>
        </div>
        <ol className='border-t border-line'>
          {study.fixes.map((fix, i) => (
            <li
              key={fix.found}
              className={`grid gap-x-4 gap-y-3 border-b border-line py-5 md:gap-x-6 ${FIX_COLUMNS}`}
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
        <blockquote className='mt-12 max-w-[900px]'>
          <p className='font-display text-[clamp(24px,2.4vw,34px)] leading-[1.3] italic'>
            “{study.quote.text}”
          </p>
          <footer className='mt-4 font-mono text-[13px] tracking-[0.03em] text-muted'>
            {study.quote.by}
          </footer>
        </blockquote>
      )}
      <div className='mt-12 flex flex-wrap items-center justify-between gap-6 rounded-[22px] bg-tile p-7 md:p-9'>
        <p className='font-display text-[clamp(26px,2.4vw,34px)] leading-[1.15]'>
          Want the same for yours?
        </p>
        <button type='button' onClick={onRequest} className={buttonClassName}>
          Request a free teardown
        </button>
      </div>
    </div>
  </>
);

// A case is a card on the page; the case itself opens in a modal, and focus
// goes back to the card when it closes. `onRequest` opens the teardown form's
// modal, with the card to return focus to.
export const CaseCard = ({
  study,
  buttonClassName,
  onRequest,
}: {
  study: Case;
  buttonClassName: string;
  onRequest: (from: HTMLElement | null) => void;
}) => {
  const [open, setOpen] = useState(false);
  const card = useRef<HTMLButtonElement>(null);
  // Set when they close the case by asking for a teardown: the form's modal
  // opens as this one fades, and keeps the focus.
  const toForm = useRef(false);

  const request = () => {
    toForm.current = true;
    setOpen(false);
    onRequest(card.current);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        ref={card}
        className='group grid w-full gap-6 rounded-[28px] border border-line bg-tile p-3 text-left transition-[scale,border-color] duration-300 ease-soft hover:border-muted active:scale-[0.99] md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:gap-10 md:p-4'
      >
        <span className='relative block aspect-[16/10] overflow-hidden rounded-[20px] border border-line'>
          {/* The before, with the teardown's numbered marks: the card shows
              what a teardown looks like. */}
          <Image
            src={study.before.src}
            alt=''
            fill
            sizes='(min-width: 768px) 55vw, 100vw'
            className='object-cover object-top transition-transform duration-700 ease-soft group-hover:scale-[1.03]'
          />
        </span>
        <span className='flex flex-col px-3 pb-4 md:px-0 md:py-6 md:pr-8'>
          <span className={eyebrow}>Case study</span>
          <span className='mt-4 font-display text-[clamp(34px,3.2vw,48px)] leading-[1.05] tracking-[-0.015em]'>
            {study.name}
          </span>
          <span className='mt-4 text-[18px] leading-[1.55] text-muted'>
            {study.summary}
          </span>
          <span className='mt-6 font-mono text-[13px] tracking-[0.03em]'>
            {study.facts
              .slice(0, 3)
              .map((fact) => `${fact.label}: ${fact.value.toLowerCase()}`)
              .join(' · ')}
          </span>
          <span className='mt-8 inline-flex items-center gap-2 font-mono text-[14px] text-accent-text md:mt-auto'>
            Read the case
            <ArrowRight
              size={18}
              className='transition-transform duration-300 ease-soft group-hover:translate-x-1'
            />
          </span>
        </span>
      </Dialog.Trigger>
      <ModalContent
        open={open}
        className='max-w-[1120px]'
        onCloseAutoFocus={(event) => {
          if (!toForm.current) return;
          toForm.current = false;
          event.preventDefault();
        }}
      >
        <CaseModal
          study={study}
          buttonClassName={buttonClassName}
          onRequest={request}
        />
      </ModalContent>
    </Dialog.Root>
  );
};
