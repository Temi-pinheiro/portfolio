// The Quiet Edge, my guide to using AI at work, sold through Whop (business
// biz_mxboRBrkwQoqfj, product prod_wjQ8jT35W6lTi). The price is set on the
// Whop plan; PRICE is only what the pages say, so change the two together.
// The full PDF is never in this repo, which is public: buyers get it through
// the download route, from GUIDE_PDF below.
const LIVE_PLAN = 'plan_Lyr47WRojsUCi';
// The page sells the plan through a Whop checkout configuration, whose
// redirect_url (https://temipinheiro.com/quiet-edge) is where Whop sends the
// tab once a payment goes through. Without one, Whop sent buyers to its own
// product page, and the page never got to start their download.
const LIVE_CHECKOUT = 'ch_bjtgbW9x3jVIWm3';
// A Deploy Preview can sell a test plan instead (a $1 product), so a real
// purchase tests the checkout, the email and the download before a change
// ships. The plan and its checkout configuration (redirecting to the preview)
// are set on Netlify for the deploy-preview context only.
const TEST_PLAN = process.env.NEXT_PUBLIC_QUIET_EDGE_TEST_PLAN || null;
const TEST_CHECKOUT = process.env.NEXT_PUBLIC_QUIET_EDGE_TEST_CHECKOUT || null;

export const QUIET_EDGE = {
  checkout: TEST_CHECKOUT ?? LIVE_CHECKOUT,
  // Payments on these plans unlock the guide. A preview still accepts the live
  // plan, so a real buyer's link can be checked there.
  plans: (TEST_PLAN ? [LIVE_PLAN, TEST_PLAN] : [LIVE_PLAN]) as readonly string[],
  price: '$27',
  pages: 63,
  chapterOne: '/quiet-edge/the-quiet-edge-chapter-1.pdf',
  // The same product on whop.com, for anyone who'd rather buy there.
  whop: 'https://whop.com/temipinheiro/the-quiet-edge-guide/',
} as const;

// The full PDF, in a site-wide Netlify Blobs store (production and previews
// share it). A new edition replaces it in place, with the live site linked:
//   netlify blobs:set quiet-edge guide.pdf --input <the new PDF>
// Whop keeps its own copy in the product's course; update both.
export const GUIDE_PDF = { store: 'quiet-edge', key: 'guide.pdf' } as const;

// A buyer's link to the current edition. It checks the payment every time,
// so it keeps working for every later edition and stops on a refund.
export const downloadPath = (payment: string) =>
  `/quiet-edge/download?payment=${encodeURIComponent(payment)}`;

export const isPaymentId = (value: unknown): value is string =>
  typeof value === 'string' && /^pay_[A-Za-z0-9]{6,40}$/.test(value);
