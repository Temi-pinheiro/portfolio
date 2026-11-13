'use client';

import Link from 'next/link';
import { type ReactNode, useEffect, useRef } from 'react';
import { track } from '~~/lib/analytics';
import { Close } from '../icons';
import { IntakeFrame, closeButton, focusFirstField, quietButton, useIntake } from './Intake';

// The intake on a page of its own, so it can be sent as a link
// (temipinheiro.com/mariposa/intake). Same questions, prognosis and saved
// answers as the dialog on /mariposa: both read the same sessionStorage, so
// moving between them loses nothing.

const PageTitle = ({ className, children }: { className: string; children: ReactNode }) => (
  <h1 className={className}>{children}</h1>
);

export const IntakePage = () => {
  const intake = useIntake();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    track('intake_opened');
    // A frame later, once the saved answers have put the right screen up.
    const frame = requestAnimationFrame(() => {
      if (root.current) focusFirstField(root.current, intake);
    });
    return () => cancelAnimationFrame(frame);
    // Once, on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main ref={root} className='bg-paper'>
      <IntakeFrame
        intake={intake}
        title={PageTitle}
        close={
          <Link href='/mariposa' className={closeButton}>
            <Close />
            <span className='sr-only'>About the Mariposa Program</span>
          </Link>
        }
        notNow={
          <Link href='/mariposa' className={quietButton}>
            What’s this?
          </Link>
        }
      />
    </main>
  );
};
