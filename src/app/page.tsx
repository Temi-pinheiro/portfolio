import Image from 'next/image';
import { Hero, NavBar } from '~~/components';

export default function Home() {
  return (
    <main className='w-full h-full'>
      <NavBar />
      <Hero />
    </main>
  );
}
