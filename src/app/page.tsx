import { Hero, Works, Experiences } from '~~/components';
import ContactForm from '~~/components/ContactForm';
import { Footer } from '~~/components/Footer';

export default function Home() {
  return (
    <main className='w-full h-full'>
      <Hero />

      <hr className='bg-[#808080] mt-8 md:mt-0 dark:opacity-25'></hr>
      <Works />
      <hr className='bg-[#808080] mt-8 md:mt-0 dark:opacity-25'></hr>
      <Experiences />
      <hr className='bg-[#808080] mt-8 md:mt-0 dark:opacity-25'></hr>
      <ContactForm />
      <Footer />
    </main>
  );
}
