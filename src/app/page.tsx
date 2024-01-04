import { Metadata } from 'next';
import { Hero, Works, Experiences } from '~~/components';
import ContactForm from '~~/components/ContactForm';
import { Footer } from '~~/components/Footer';

export const metadata: Metadata = {
  title: 'Temitope Pinheiro Portfolio',
  description: 'My portfolio page for 2023',
};

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
