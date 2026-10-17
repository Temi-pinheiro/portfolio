'use client';
import Link from 'next/link';
import React, { useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import ScrollToPlugin from 'gsap/ScrollToPlugin';
import { useRouter } from 'next/navigation';

type NavLink = { path: string; label: string; target?: string };

export const NavBar = ({
  showArticles = false,
}: {
  showArticles?: boolean;
}) => {
  const router = useRouter();
  const links: NavLink[] = [
    { path: '/', label: 'Home' },
    { path: '/#works', label: 'Works', target: '#works' },
    { path: '/projects', label: 'Projects' },
    ...(showArticles ? [{ path: '/articles', label: 'Articles' }] : []),
    { path: '/#experience', label: 'Experience', target: '#experience' },
    { path: '/#contact', label: 'Contact', target: '#contact' },
  ];
  gsap.registerPlugin(ScrollToPlugin);
  const scrollTo = (e: any, target: string) => {
    e.preventDefault();
    let scrollTarget = document.querySelector(target)!;
    if (!scrollTarget) {
      router.push(`/${target}`);
    } else {
      gsap.to(window, {
        duration: 1.5,
        scrollTo: scrollTarget,
        ease: 'power2.inOut',
      });
    }
  };

  return (
    <nav className="hidden md:flex items-center justify-between max-w-7xl overflow-y-clip  mx-auto w-full text-sm mt-14 px-6">
      <motion.h6
        initial={{ y: 'var(--y-from, 0)' }}
        animate={{
          y: 'var(--y-to, 0)',
          transition: { ease: [0.16, 1, 0.3, 1] },
        }}
        className="[--y-from:30px] [--y-to:0px] [--opacity-from:0] [--opacity-to:1]"
      >
        TEMITOPE
      </motion.h6>
      <ul className="flex items-center gap-x-8 ">
        {links.map((l, index) => {
          const target = l.target;
          return (
            <motion.li
              initial={{ y: 'var(--y-from, 0)' }}
              animate={{ y: 'var(--y-to, 0)' }}
              className="[--y-from:30px] [--y-to:0px] [--opacity-from:0] [--opacity-to:1] uppercase"
              transition={{
                delay: 0.3 + index * 0.08,
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              key={l.path}
            >
              <Link
                href={l.path}
                className="hover:text-[#FA6525] transition duration-200"
                onClick={target ? (e) => scrollTo(e, target) : undefined}
              >
                {l.label}
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </nav>
  );
};
