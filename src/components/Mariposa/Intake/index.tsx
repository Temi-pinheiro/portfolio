'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Close } from '../../icons';
import { ModalContent, modalEyebrow } from '../Modal';
import { Prognosis } from './Prognosis';
import { Questions, SCREENS } from './Questions';
import type { Intake as IntakeState } from './useIntake';

export { answersMailto, useIntake } from './useIntake';
export type { Intake as IntakeState } from './useIntake';

// The intake, full screen: a short requirements session, one question per
// screen, that ends in a prognosis written while the visitor waits
// (netlify/functions/prognosis.mts). The state is the page's (useIntake), so
// closing this loses nothing.

// The intake's frame: its title bar, the progress line, then the questions
// or the prognosis. The dialog on /mariposa and the page at /mariposa/intake
// both use it, and pass in their own title element and way out.
export const IntakeFrame = ({
  intake,
  title: Title,
  close,
  notNow,
}: {
  intake: IntakeState;
  title: (props: { className: string; children: ReactNode }) => ReactNode;
  close: ReactNode;
  notNow: ReactNode;
}) => {
  const asking = intake.phase === 'questions';
  const progress = asking ? intake.step / SCREENS.length : 1;

  return (
    <div className='flex min-h-dvh flex-col'>
      <div className='sticky top-0 z-10 bg-paper/90 backdrop-blur-md'>
        <div className='flex items-center justify-between gap-6 px-5 py-4 md:px-10'>
          <Title className={modalEyebrow}>
            The Mariposa Program · {asking ? 'Intake' : 'Your prognosis'}
          </Title>
          {close}
        </div>
        <div aria-hidden className='h-0.5 bg-line'>
          <motion.div
            className='h-full origin-left bg-accent-text'
            initial={false}
            animate={{ scaleX: progress }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
      <div className='flex flex-1 flex-col'>
        {asking ? (
          <Questions intake={intake} notNow={notNow} />
        ) : (
          <Prognosis key={intake.attempt} intake={intake} />
        )}
      </div>
    </div>
  );
};

// The way out of the intake: closes the dialog, or on the intake's own page
// goes to /mariposa.
export const quietButton =
  'min-h-11 font-mono text-[14px] tracking-[0.03em] text-muted transition-colors duration-300 hover:text-ink';
export const closeButton =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-tile transition-colors duration-300 hover:bg-tile-2';

export const Intake = ({
  intake,
  open,
  onOpenChange,
  onCloseAutoFocus,
}: {
  intake: IntakeState;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus: (event: Event) => void;
}) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <ModalContent
      open={open}
      fullscreen
      aria-describedby={undefined}
      onOpenAutoFocus={(event) => {
        // Straight to the first field, unless it would bring up a phone's
        // keyboard over the question.
        const panel = event.currentTarget as HTMLElement;
        if (!focusFirstField(panel, intake)) return;
        event.preventDefault();
      }}
      onCloseAutoFocus={onCloseAutoFocus}
    >
      <IntakeFrame
        intake={intake}
        title={Dialog.Title}
        close={
          <Dialog.Close className={closeButton}>
            <Close />
            <span className='sr-only'>Close</span>
          </Dialog.Close>
        }
        notNow={<Dialog.Close className={quietButton}>Not now</Dialog.Close>}
      />
    </ModalContent>
  </Dialog.Root>
);

// Puts focus in the first field when the questions open, with a fine pointer
// only, so a phone's keyboard doesn't come up over the question. True when it
// did.
export const focusFirstField = (root: HTMLElement, intake: IntakeState) => {
  const field = root.querySelector<HTMLElement>(
    'form input:not([tabindex="-1"]), form textarea'
  );
  if (!field || intake.phase !== 'questions' || !matchMedia('(pointer: fine)').matches)
    return false;
  field.focus();
  return true;
};
