import posthog from 'posthog-js';

// PostHog, set up the way ux-audit's tracking guide sets it up for clients:
// the snippet's values come from my own project (US cloud), replays mask
// every input, and visitors choose cookies in the banner (CookieBanner).
// Until they do, nothing is captured; if they decline, PostHog counts them
// without cookies (cookieless_mode 'on_reject', which needs "Cookieless
// server hash mode" on in the project's settings).
//
// It runs on temipinheiro.com only, so Deploy Previews and localhost don't
// add to the numbers. Visiting with ?posthog=off keeps it off in that browser
// (my own visits); ?posthog=on undoes it.

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
// The managed reverse proxy once it's set up (so ad blockers don't drop
// events), PostHog itself until then.
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
const LIVE = new Set(['temipinheiro.com', 'www.temipinheiro.com']);
const OFF = 'posthog-off';

const switchedOff = () => {
  try {
    const choice = new URLSearchParams(location.search).get('posthog');
    if (choice === 'off') localStorage.setItem(OFF, '1');
    if (choice === 'on') localStorage.removeItem(OFF);
    return localStorage.getItem(OFF) === '1';
  } catch {
    return false;
  }
};

if (token && LIVE.has(location.hostname) && !switchedOff()) {
  posthog.init(token, {
    api_host: host,
    ui_host: 'https://us.posthog.com',
    defaults: '2026-08-30',
    cookieless_mode: 'on_reject',
    session_recording: {
      // Never record network traffic: the purchase claim's reply carries the
      // buyer's email and their download link.
      recordBody: false,
      recordHeaders: false,
    },
  });
}
