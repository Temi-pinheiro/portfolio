// The Quiet Edge, my guide to using AI at work, sold through Whop (business
// biz_mxboRBrkwQoqfj, product prod_wjQ8jT35W6lTi). The price is set on the
// Whop plan; PRICE is only what the pages say, so change the two together.
// The full PDF is never in this repo, which is public: it lives on Whop, and
// the download route streams it to buyers from QUIET_EDGE_PDF_URL.
export const QUIET_EDGE = {
  plan: 'plan_Lyr47WRojsUCi',
  price: '$27',
  pages: 63,
  chapterOne: '/quiet-edge/the-quiet-edge-chapter-1.pdf',
  // The same product on whop.com, for anyone who'd rather buy there.
  whop: 'https://whop.com/temipinheiro/the-quiet-edge-guide/',
} as const;

// A buyer's link to the current edition. It checks the payment every time,
// so it keeps working for every later edition and stops on a refund.
export const downloadPath = (payment: string) =>
  `/quiet-edge/download?payment=${encodeURIComponent(payment)}`;

export const isPaymentId = (value: unknown): value is string =>
  typeof value === 'string' && /^pay_[A-Za-z0-9]{6,40}$/.test(value);
