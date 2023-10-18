import React from 'react';

export const NavBar = () => {
  return (
    <nav className='hidden md:flex items-center justify-between max-w-7xl mx-auto w-full'>
      <h6>TEMITOPE</h6>
      <ul className='flex items-center gap-x-8 '>
        <li>
          <a>Home</a>
        </li>
        <li>
          <a>Projects</a>
        </li>
        <li>
          <a>Experience</a>
        </li>
        <li>
          <a>Contact</a>
        </li>
      </ul>
    </nav>
  );
};
