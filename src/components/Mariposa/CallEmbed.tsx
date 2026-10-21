'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { CALENDLY_URL, EMAIL } from '~~/lib/site';

// Calendly's inline embed as a plain iframe rather than its widget script: the
// script scans the page once when it loads, so it misses an embed that mounts
// after a client-side navigation. The iframe takes the URL the script would
// build, and the one message the script acts on is handled here: the page
// height, so the frame grows with what it shows instead of scrolling inside.
//
// The colours follow the site and its theme. Calendly applies them only on a
// paid plan; on the free plan the calendar stays white.

const DARK = '(prefers-color-scheme: dark)';
const subscribeScheme = (onChange: () => void) => {
  const query = matchMedia(DARK);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};

const COLORS = {
  light: { background_color: 'fafaf7', text_color: '171717', primary_color: '2a52c9' },
  dark: { background_color: '0f0f0e', text_color: 'edece8', primary_color: '8aa0e1' },
};

const frame = 'overflow-hidden rounded-[22px] border border-line bg-paper';

export const CallEmbed = () => {
  // Null on the server: the frame's URL depends on the theme, so it's only
  // built in the browser, and the calendar never loads twice.
  const scheme = useSyncExternalStore<'light' | 'dark' | null>(
    subscribeScheme,
    () => (matchMedia(DARK).matches ? 'dark' : 'light'),
    () => null
  );
  const [height, setHeight] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://calendly.com') return;
      // Its first message means the calendar is drawn. The frame's load event
      // can come seconds later, once every script on Calendly's page is in.
      setLoaded(true);
      const data = event.data as { event?: string; payload?: { height?: string } };
      if (data.event !== 'calendly.page_height') return;
      const next = parseInt(data.payload?.height ?? '', 10);
      if (next > 0) setHeight(next);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  if (!CALENDLY_URL) {
    return (
      <div className={`${frame} flex flex-col items-start gap-6 p-7 md:p-[34px]`}>
        <p className='font-display text-[clamp(24px,2.2vw,32px)] leading-[1.2]'>
          Email me and we’ll find a time.
        </p>
        <a
          href={`mailto:${EMAIL}?subject=${encodeURIComponent('A call about my app')}`}
          className='font-mono text-[15px] tracking-[0.02em] text-accent-text underline decoration-accent underline-offset-4'
        >
          {EMAIL}
        </a>
      </div>
    );
  }

  let src = '';
  if (scheme) {
    const url = new URL(CALENDLY_URL);
    url.searchParams.set('embed_domain', location.host);
    url.searchParams.set('embed_type', 'Inline');
    url.searchParams.set('hide_gdpr_banner', '1');
    for (const [key, value] of Object.entries(COLORS[scheme])) {
      url.searchParams.set(key, value);
    }
    src = url.toString();
  }

  return (
    <div
      className={`${frame} relative h-[700px] transition-[height] duration-500 ease-soft`}
      style={height ? { height } : undefined}
    >
      <p
        aria-hidden
        className={`absolute inset-0 flex items-center justify-center font-mono text-[13px] tracking-[0.04em] text-muted transition-opacity duration-500 ${
          loaded ? 'opacity-0' : ''
        }`}
      >
        Loading the calendar…
      </p>
      {src && (
        <iframe
          key={src}
          src={src}
          title='Schedule a call'
          loading='lazy'
          onLoad={() => setLoaded(true)}
          className={`relative block size-full transition-opacity duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      <noscript>
        <a
          href={CALENDLY_URL}
          className='absolute inset-0 flex items-center justify-center bg-paper font-mono text-[15px] text-accent-text underline underline-offset-4'
        >
          Open my calendar
        </a>
      </noscript>
    </div>
  );
};
