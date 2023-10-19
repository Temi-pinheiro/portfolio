import Image from 'next/image';
import { NavBar } from '~~/components';
import { Hero, Works } from '~~/sections';

export default function Home() {
  return (
    <main className='w-full h-full'>
      <NavBar />
      <Hero />
      <Works />
    </main>
  );
}
