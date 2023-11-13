import Link from 'next/link';
import React from 'react';

export const NavBar = () => {
  return (
    <nav className='hidden md:flex items-center justify-between max-w-7xl mx-auto w-full text-sm mt-14'>
      <h6>TEMITOPE</h6>
      <ul className='flex items-center gap-x-8 '>
        <li>
          <Link href='/'>Home</Link>
        </li>
        <li>
          <Link href='/#works'>Works</Link>
        </li>
        <li>
          <Link href={'/projects'}>Projects</Link>
        </li>
        <li>
          <Link href='/#works'>Experience</Link>
        </li>
        <li>
          <Link href='/#contact'>Contact</Link>
        </li>
      </ul>
    </nav>
  );
};
