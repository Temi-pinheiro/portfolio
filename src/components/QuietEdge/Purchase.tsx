'use client';

import { loadWhop } from '@whop/elements';
import { Checkout, CheckoutElement, WhopElements } from '@whop/elements-react';
import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import { track } from '~~/lib/analytics';
import { QUIET_EDGE } from '~~/lib/quietEdge';
import { EMAIL } from '~~/lib/site';
import { ArrowRight, Check } from '../icons';
import { EASE_OUT_EXPO } from '../motion/Reveal';

// Buying the guide without leaving the page: Whop's checkout, embedded in the
// modal. When it finishes, the page hands the payment's ID to the claim route,
// which asks Whop whether it's paid, emails the buyer their link, and answers
// with it, so the download starts right there.
//
// Whop sends the tab to `returnUrl` once the checkout is done, and after an
// off-site step (3DS, a bank's page) with `payment` and `status` added. So the
// ID also goes into sessionStorage, and the page picks the purchase up again
// from either one when it loads.
//
// After a card payment, Whop's checkout can also take the whole tab to
// whop.com (to sign the buyer in, or to the product), sometimes before
// onComplete fires. A $1 test on 2026-10-30 ended there, with no claim and no
// email. `allowCompletionNavigation: false` keeps the buyer here: Whop's
// controller then announces the completion instead of navigating. It's read by
// the checkout code Whop serves, but it isn't in the 1.8.0 types, hence the
// spread below.
const STAY_ON_PAGE = { allowCompletionNavigation: false };

export type Purchase =
  | { step: 'checkout'; retry?: boolean }
  | { step: 'confirming' }
  | { step: 'paid'; download: string; email: string | null }
  | { step: 'pending' }
  | { step: 'problem'; payment: string };

export const STORED_PAYMENT = 'quiet-edge-payment';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const usePurchase = () => {
  const [purchase, setPurchase] = useState<Purchase>({ step: 'checkout' });
  // Whether the modal is open. It lives here because coming back from Whop
  // reopens it.
  const [open, setOpen] = useState(false);

  const claim = useCallback(async (payment: string) => {
    setPurchase({ step: 'confirming' });
    // Whop can take a moment to report a payment it has just taken, so ask a
    // few times, about 20 seconds in all, before settling on an answer.
    let last = 'none';
    for (let attempt = 0; attempt < 5; attempt++) {
      if (attempt) await wait(1500 * attempt);
      const res = await fetch('/api/quiet-edge/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Finishes even if the tab is taken elsewhere, so the email still goes.
        keepalive: true,
        body: JSON.stringify({ payment }),
      }).catch(() => null);
      const data = await res?.json().catch(() => null);
      last = data?.state ?? 'unavailable';
      if (last === 'paid') {
        track('guide_purchased');
        try {
          sessionStorage.removeItem(STORED_PAYMENT);
        } catch {}
        setPurchase({ step: 'paid', download: data.download, email: data.email });
        // The route answers with the PDF as an attachment, so this starts the
        // download and leaves the page where it is.
        window.location.assign(data.download);
        return;
      }
    }
    setPurchase(last === 'pending' ? { step: 'pending' } : { step: 'problem', payment });
  }, []);

  // Back on the page with a payment: claim it, or, if the bank's step failed,
  // offer the checkout again.
  const resume = useCallback(
    (payment: string, failed: boolean) => {
      setOpen(true);
      if (failed) setPurchase({ step: 'checkout', retry: true });
      else claim(payment);
    },
    [claim]
  );

  // Opening it again after a problem starts a fresh checkout.
  const start = useCallback(() => {
    track('guide_checkout_opened');
    setPurchase((current) => (current.step === 'problem' ? { step: 'checkout' } : current));
    setOpen(true);
  }, []);

  return { purchase, claim, resume, start, open, setOpen };
};

const appearance = () => ({
  theme: {
    appearance: matchMedia('(prefers-color-scheme: dark)').matches
      ? ('dark' as const)
      : ('light' as const),
    accentColor: 'blue' as const,
    grayColor: 'sand' as const,
  },
});

export const PurchaseBody = ({
  purchase,
  claim,
  buttonClassName,
}: {
  purchase: Purchase;
  claim: (payment: string) => void;
  buttonClassName: string;
}) => {
  // The loader adds Whop's script once; the modal only renders in the browser.
  const [whop] = useState(loadWhop);
  const [theme] = useState(appearance);

  if (purchase.step === 'checkout') {
    return (
      <>
        {purchase.retry && (
          <p role='alert' className='mb-6 text-[17px] leading-[1.55]'>
            That payment didn’t go through. You can try again below.
          </p>
        )}
        <WhopElements elements={whop} appearance={theme}>
          <Checkout
            plan={QUIET_EDGE.plan}
            returnUrl={`${location.origin}/quiet-edge`}
            {...STAY_ON_PAGE}
            onComplete={(done) => {
              if (done.result !== 'payment') return;
              try {
                sessionStorage.setItem(STORED_PAYMENT, done.paymentId);
              } catch {}
              claim(done.paymentId);
            }}
          >
            <CheckoutElement
              className='min-h-[420px]'
              fallback={
                <p className='py-16 text-center font-mono text-[13px] tracking-[0.04em] text-muted'>
                  Loading the checkout…
                </p>
              }
            />
          </Checkout>
        </WhopElements>
      </>
    );
  }

  if (purchase.step === 'confirming') {
    return (
      <p role='status' className='py-10 text-[18px] leading-[1.6] text-muted'>
        Confirming your payment with Whop. This takes a few seconds.
      </p>
    );
  }

  if (purchase.step === 'paid') {
    // The confirmation follows the Bord waitlist form, the house pattern for
    // any confirmation: it rises in on an expo-out curve, and its mark pops in
    // on a spring just after.
    return (
      <motion.div
        role='status'
        className='pt-2'
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
        <p className='mt-5 max-w-[560px] text-[18px] leading-[1.6] text-muted'>
          <span className='text-ink'>It’s yours.</span> Your download should
          have started. If it didn’t, use the button.{' '}
          {purchase.email ? (
            <>
              The link is also in <span className='ph-no-capture text-ink'>{purchase.email}</span>,
              and it gets you every new edition too.
            </>
          ) : (
            'The guide is also in your Whop account, under The Quiet Edge.'
          )}
        </p>
        <a href={purchase.download} className={`mt-8 gap-3 ${buttonClassName}`}>
          Download the PDF
          <ArrowRight size={18} className='rotate-90' />
        </a>
      </motion.div>
    );
  }

  if (purchase.step === 'pending') {
    return (
      <p role='status' className='py-6 text-[18px] leading-[1.6] text-muted'>
        Your payment is still clearing. Some methods, like bank transfers, take
        a while. As soon as it clears, the download link will be in your email,
        and the guide will be in your Whop account.
      </p>
    );
  }

  return (
    <div role='alert' className='py-6 text-[18px] leading-[1.6] text-muted'>
      <p>
        I couldn’t confirm that payment just now. If you were charged, the
        guide is in your Whop account under The Quiet Edge, and the download
        link is on its way to your email.
      </p>
      <p className='mt-4'>
        Nothing there?{' '}
        <a
          href={`mailto:${EMAIL}?subject=${encodeURIComponent(
            'The Quiet Edge: my download'
          )}&body=${encodeURIComponent(`My payment reference: ${purchase.payment}`)}`}
          className='text-ink underline decoration-accent underline-offset-4'
        >
          Email me
        </a>{' '}
        with your payment reference, <span className='font-mono text-[15px]'>{purchase.payment}</span>,
        and I’ll sort it out.
      </p>
    </div>
  );
};
