'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { track } from '~~/lib/analytics';
import { EMPTY_ANSWERS, answersAsText, type Answers } from '~~/lib/intake';
import { EMAIL as INBOX } from '~~/lib/site';

// The intake's state. It lives on the page, not in the dialog, so closing the
// dialog loses nothing, and a stream that's running keeps running. Answers and
// a finished prognosis are kept in sessionStorage, so a reload picks up where
// the visitor was.

export type Phase = 'questions' | 'thinking' | 'result' | 'failed';
// busy: today's cap is reached. unavailable/failed: no prognosis, and the
// answers may not have reached Temi. declined/cut: the stream started, so the
// function has emailed Temi the answers.
export type Failure = 'busy' | 'unavailable' | 'failed' | 'declined' | 'cut';
export type EmailStatus = 'idle' | 'sending' | 'sent' | 'failed';

const STORAGE_KEY = 'mariposa-intake';

type Saved = {
  step: number;
  answers: Answers;
  phase: Phase;
  prognosis: string;
  failure: Failure | null;
  delivered: boolean;
  email: string;
  emailStatus: EmailStatus;
};

const read = (): Partial<Saved> | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<Saved>) : null;
  } catch {
    return null;
  }
};

const write = (saved: Saved) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {}
};

// If the prognosis can't be written, the answers still reach me: an email
// with everything they told me already in it.
export const answersMailto = (answers: Answers) =>
  `mailto:${INBOX}?subject=${encodeURIComponent(
    `About my business${answers.business ? `: ${answers.business}` : ''}`,
  )}&body=${encodeURIComponent(
    answersAsText(answers)
      .map(([label, value]) => `${label}: ${value}`)
      .join('\n\n'),
  )}`;

// Where the asks go without script: the same email, with the questions in it.
export const INTAKE_HREF = `mailto:${INBOX}?subject=${encodeURIComponent(
  'About my business',
)}&body=${encodeURIComponent(
  [
    'Your name:',
    'Business, and its website:',
    'What the business does:',
    'How many people work in it:',
    'The tools the team uses every day:',
    'The biggest problem right now:',
    'What you wish ran by itself:',
    'Roughly how many hours a week it costs:',
    'What you’ve tried with AI so far:',
  ].join('\n\n'),
)}`;

export const useIntake = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [phase, setPhase] = useState<Phase>('questions');
  const [prognosis, setPrognosis] = useState('');
  const [failure, setFailure] = useState<Failure | null>(null);
  const [delivered, setDelivered] = useState(false);
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle');
  const [restored, setRestored] = useState(false);
  // Counts prognosis requests, so each one starts its animation afresh.
  const [attempt, setAttempt] = useState(0);
  const request = useRef<AbortController | null>(null);

  // Restored a frame after mount, so the server's render and the first client
  // render agree. A reload in the middle of a prognosis goes back to the last
  // question, since that stream is gone.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const saved = read();
      if (saved?.answers) {
        setAnswers({ ...EMPTY_ANSWERS, ...saved.answers });
        setStep(saved.step ?? 0);
        if (saved.phase === 'result' || saved.phase === 'failed') {
          setPhase(saved.phase);
          setPrognosis(saved.prognosis ?? '');
          setFailure(saved.failure ?? null);
          setDelivered(saved.delivered ?? false);
          setEmail(saved.email ?? '');
          setEmailStatus(saved.emailStatus === 'sent' ? 'sent' : 'idle');
        }
      }
      setRestored(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!restored || phase === 'thinking') return;
    write({ step, answers, phase, prognosis, failure, delivered, email, emailStatus });
  }, [restored, step, answers, phase, prognosis, failure, delivered, email, emailStatus]);

  useEffect(() => () => request.current?.abort(), []);

  const update = useCallback(
    <K extends keyof Answers>(field: K, value: Answers[K]) =>
      setAnswers((current) => ({ ...current, [field]: value })),
    [],
  );

  const submit = useCallback(
    async (gotcha: string) => {
      request.current?.abort();
      const controller = new AbortController();
      request.current = controller;
      setAttempt((n) => n + 1);
      setPhase('thinking');
      setPrognosis('');
      setFailure(null);
      setDelivered(false);
      setEmailStatus('idle');
      track('intake_submitted');

      const fail = (kind: Failure) => {
        setFailure(kind);
        setPhase('failed');
        track('prognosis_failed');
      };

      let res: Response;
      try {
        res = await fetch('/api/prognosis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...answers, _gotcha: gotcha }),
          signal: controller.signal,
        });
      } catch {
        if (!controller.signal.aborted) fail('failed');
        return;
      }
      if (!res.ok || !res.body) {
        fail(res.status === 429 ? 'busy' : res.status === 503 ? 'unavailable' : 'failed');
        return;
      }

      // From here the function emails me the answers, whatever happens next.
      setDelivered(true);
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = '';
      let text = '';
      let ended: 'done' | Failure | null = null;
      try {
        while (!ended) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += value;
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.trim()) continue;
            const event = JSON.parse(line) as { t: string; v?: string };
            if (event.t === 'text' && event.v) {
              text += event.v;
              setPrognosis(text);
            } else if (event.t === 'done') {
              ended = 'done';
            } else if (event.t === 'error') {
              ended = event.v === 'declined' ? 'declined' : 'cut';
            }
          }
        }
      } catch {
        if (controller.signal.aborted) return;
        ended = 'cut';
      }

      if (ended === 'done') {
        setPhase('result');
        track('prognosis_shown');
      } else {
        // A prognosis that stopped partway is still worth showing, with a note.
        fail(text ? 'cut' : ended && ended !== 'cut' ? ended : 'failed');
      }
    },
    [answers],
  );

  const sendEmail = useCallback(
    async (address: string, gotcha: string) => {
      setEmail(address);
      setEmailStatus('sending');
      const res = await fetch('/api/intake/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: address, answers, prognosis, _gotcha: gotcha }),
      }).catch(() => null);
      if (res?.ok) {
        setEmailStatus('sent');
        track('intake_email_left');
      } else {
        setEmailStatus('failed');
      }
    },
    [answers, prognosis],
  );

  // Back to the questions with the answers kept, for a change and a new
  // prognosis.
  const edit = useCallback(() => {
    request.current?.abort();
    setPhase('questions');
  }, []);

  return {
    attempt,
    step,
    setStep,
    answers,
    update,
    phase,
    prognosis,
    failure,
    delivered,
    email,
    emailStatus,
    setEmailStatus,
    submit,
    sendEmail,
    edit,
  };
};

export type Intake = ReturnType<typeof useIntake>;
