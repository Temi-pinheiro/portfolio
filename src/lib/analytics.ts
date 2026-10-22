import posthog from 'posthog-js';

// The named events behind the site's funnels, on top of the pageviews and
// clicks PostHog captures by itself. They're anonymous: never pass a name or
// an email. PostHog only runs on temipinheiro.com (instrumentation-client.ts),
// so anywhere else these do nothing.
export type AnalyticsEvent =
  | 'teardown_form_opened'
  | 'teardown_requested'
  | 'call_booked'
  | 'guide_checkout_opened'
  | 'guide_purchased'
  | 'chapter_one_downloaded'
  | 'list_joined';

export const track = (event: AnalyticsEvent) => {
  if (posthog.__loaded) posthog.capture(event);
};
