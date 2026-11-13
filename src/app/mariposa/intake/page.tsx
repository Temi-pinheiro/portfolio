import type { Metadata } from 'next';
import { IntakePage } from '~~/components/Mariposa/IntakePage';

// The intake as a link of its own, to send to someone directly. /mariposa
// opens the same intake in a dialog; this page is that, without the page
// around it.
const title = 'Nine questions about your business';
const description =
  'Tell me how your business works and where the week goes. You get a free prognosis of the AI systems I’d build for it, written while you wait.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/mariposa/intake' },
  openGraph: {
    title: `${title} | Temi Pinheiro`,
    description,
    url: 'https://temipinheiro.com/mariposa/intake',
  },
};

export default function MariposaIntakePage() {
  return <IntakePage />;
}
