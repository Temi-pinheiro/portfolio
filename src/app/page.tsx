import { Hero, Works, Experiences } from '~~/components';
import ContactForm from '~~/components/ContactForm';
import { Footer } from '~~/components/Footer';

// The home page intentionally inherits the rich SEO metadata defined in
// `layout.tsx` (title, description, Open Graph, Twitter, canonical) so the
// tags stay consistent across the document head.

export default function Home() {
  return (
    <main className='w-full h-full'>
      <Hero />

      <Works />
      <hr className='bg-[#808080] mt-8 md:mt-0 dark:opacity-25'></hr>
      <Experiences />
      <hr className='bg-[#808080] mt-8 md:mt-0 dark:opacity-25'></hr>
      <ContactForm />
      <Footer />
    </main>
  );
}
