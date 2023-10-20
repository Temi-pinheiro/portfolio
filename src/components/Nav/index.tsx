import Link from 'next/link';
import React from 'react';

export const NavBar = () => {
  return (
    <nav className='hidden md:flex items-center justify-between max-w-7xl mx-auto w-full text-sm mt-14'>
      <h6>TEMITOPE</h6>
      <ul className='flex items-center gap-x-8 '>
        <li>
          <a>Home</a>
        </li>
        <li>
          <a href='#works'>Works</a>
        </li>
        <li>
          <Link href={'projects'}>Projects</Link>
        </li>
        <li>
          <a href='#experience'>Experience</a>
        </li>
        <li>
          <a href='#contact'>Contact</a>
        </li>
      </ul>
    </nav>
  );
};
