'use client';
import Link from 'next/link';
import React from 'react';
import { motion } from 'framer-motion';

export const NavBar = () => {
  const links = [
    { path: '/', label: 'Home' },
    { path: '/#works', label: 'Works' },
    { path: '/projects', label: 'Projects' },
    { path: '/#experience', label: 'Experience' },
    { path: '/#contact', label: 'Contact' },
  ];
  console.log(links);
  return (
    <nav className='hidden md:flex items-center justify-between max-w-7xl overflow-y-clip  mx-auto w-full text-sm mt-14 px-6'>
      <motion.h6
        initial={{ y: 'var(--y-from, 0)' }}
        animate={{ y: 'var(--y-to, 0)', transition: { easings: ['ease-in'] } }}
        className='[--y-from:30px] [--y-to:0px] [--opacity-from:0] [--opacity-to:1]'
      >
        TEMITOPE
      </motion.h6>
      <ul className='flex items-center gap-x-8 '>
        {links.map((l, index) => (
          <motion.li
            initial={{ y: 'var(--y-from, 0)' }}
            animate={{ y: 'var(--y-to, 0)' }}
            className='[--y-from:30px] [--y-to:0px] [--opacity-from:0] [--opacity-to:1] uppercase'
            transition={{
              delay: 0.6 + index * 0.08,
              duration: 0.3,
              easings: ['ease-in'],
            }}
            key={l.path}
          >
            <Link
              href={l.path}
              className='hover:text-[#FA6525] transition duration-200'
            >
              {l.label}
            </Link>
          </motion.li>
        ))}
      </ul>
    </nav>
  );
};
