'use client';

import { motion, stagger, type Variants } from 'framer-motion';
import { Fragment, type ElementType, type ReactNode } from 'react';

// Scroll reveals, ported from the Bord site (~/Desktop/bord-web): things rise
// into place once, the first time a fifth of them is on screen, on an expo-out
// curve. Every revealed element carries `data-reveal`, which the page's
// <noscript> rule forces visible: Motion server-renders the hidden `initial`
// state, and without JavaScript nothing would undo it.

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const VIEWPORT = { once: true, amount: 0.2 } as const;

export const FadeUp = ({
  children,
  className,
  delay = 0,
  y = 24,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: 'div' | 'p' | 'li' | 'section';
}) => {
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag
      data-reveal
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay }}
    >
      {children}
    </Tag>
  );
};

const wordsParent: Variants = {
  hidden: {},
  shown: { transition: { delayChildren: stagger(0.045) } },
};

const word: Variants = {
  hidden: { y: '110%' },
  shown: { y: '0%', transition: { duration: 1, ease: EASE_OUT_EXPO } },
};

// A headline whose words slide up out of their own line, one after another.
// Split by word rather than by line so it wraps naturally at every width. Each
// word sits in a clipping box padded at the bottom so descenders aren't cut;
// the negative margin gives that space back.
export const WordReveal = ({
  text,
  as: Tag = 'h2',
  id,
  className,
}: {
  text: string;
  as?: ElementType;
  id?: string;
  className?: string;
}) => {
  const words = text.split(' ');
  return (
    <Tag id={id} className={className}>
      <motion.span
        className='block'
        variants={wordsParent}
        initial='hidden'
        whileInView='shown'
        viewport={VIEWPORT}
      >
        {/* The space sits between the clipping boxes, not inside one: a
            trailing space inside an inline-block collapses, and the words
            run together. */}
        {words.map((w, i) => (
          <Fragment key={`${w}-${i}`}>
            <span className='-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-top'>
              <motion.span data-reveal className='inline-block' variants={word}>
                {w}
              </motion.span>
            </span>
            {i < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </motion.span>
    </Tag>
  );
};

const listParent: Variants = {
  hidden: {},
  shown: { transition: { delayChildren: stagger(0.09, { startDelay: 0.1 }) } },
};

const listItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
};

// A list whose children rise in one after another. Pair with StaggerItem.
export const Stagger = ({
  children,
  className,
  as = 'ul',
}: {
  children: ReactNode;
  className?: string;
  as?: 'ul' | 'ol' | 'div';
}) => {
  const Tag = motion[as] as typeof motion.ul;
  return (
    <Tag
      className={className}
      variants={listParent}
      initial='hidden'
      whileInView='shown'
      viewport={VIEWPORT}
    >
      {children}
    </Tag>
  );
};

export const StaggerItem = ({
  children,
  className,
  as = 'li',
}: {
  children: ReactNode;
  className?: string;
  as?: 'li' | 'div';
}) => {
  const Tag = motion[as] as typeof motion.li;
  return (
    <Tag data-reveal className={className} variants={listItem}>
      {children}
    </Tag>
  );
};
