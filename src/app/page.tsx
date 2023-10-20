import { Hero, Works, Experiences } from '~~/components';

export default function Home() {
  return (
    <main className='w-full h-full'>
      <Hero />

      <hr className='bg-[#808080]  opacity-25'></hr>
      <Works />
      <hr className='bg-[#808080]  opacity-25'></hr>
      <Experiences />
    </main>
  );
}
