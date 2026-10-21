'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import type { ComponentProps, ReactNode } from 'react';
import { Close } from '../icons';

type ContentProps = Pick<
  ComponentProps<typeof Dialog.Content>,
  'onOpenAutoFocus' | 'onCloseAutoFocus' | 'aria-describedby'
>;

// The page's modals, inside a Dialog.Root. The motion is the one from
// Wholistic (~/Desktop/old projects/wholistic, components/UI/Modal): a blurred
// backdrop fades in, the panel opens out from half its width on Motion's
// default spring, and on close the panel fades first and the backdrop 120ms
// after. Radix supplies the dialog behaviour: focus trap, Escape and scroll
// lock.
export const ModalContent = ({
  open,
  className,
  children,
  ...props
}: ContentProps & { open: boolean; className?: string; children: ReactNode }) => (
  <AnimatePresence>
    {open && (
      <Dialog.Portal forceMount>
        <Dialog.Overlay asChild forceMount>
          <motion.div
            className='fixed inset-0 z-50 bg-[rgb(29_29_29/0.19)] backdrop-blur-[8px]'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: 0.12 } }}
          />
        </Dialog.Overlay>
        <div className='pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-3 md:p-8'>
          <Dialog.Content asChild forceMount {...props}>
            <motion.div
              className={`pointer-events-auto relative max-h-full w-full overflow-y-auto overscroll-contain rounded-[20px] bg-paper shadow-[0_40px_120px_-40px_rgb(0_0_0/0.5)] outline-none ${className ?? ''}`}
              initial={{ scaleX: 0.5, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {children}
            </motion.div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    )}
  </AnimatePresence>
);

export const modalEyebrow = 'font-mono text-[12px] tracking-[0.1em] text-muted uppercase';

// The eyebrow, title and close button, held at the top as the modal scrolls.
export const ModalHeader = ({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) => (
  <div className='sticky top-0 z-10 flex items-start justify-between gap-6 bg-paper/90 px-6 pt-6 pb-4 backdrop-blur-md md:px-12 md:pt-10'>
    <div>
      <p className={modalEyebrow}>{eyebrow}</p>
      <Dialog.Title className='mt-3 font-display text-[clamp(32px,3.4vw,52px)] leading-[1.05] tracking-[-0.015em]'>
        {title}
      </Dialog.Title>
    </div>
    <Dialog.Close className='inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-tile transition-colors duration-300 hover:bg-tile-2'>
      <Close />
      <span className='sr-only'>Close</span>
    </Dialog.Close>
  </div>
);
