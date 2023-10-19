import Image from 'next/image';
import { NavBar, Hero, Projects, Works } from '~~/components';

export default function Home() {
  return (
    <main className='w-full h-full'>
      <NavBar />
      <Hero />
      <hr></hr>
      <Projects />
      <hr></hr>
      <Works />
    </main>
  );
}
