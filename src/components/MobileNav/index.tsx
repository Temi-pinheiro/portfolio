'use client';
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './styles.module.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import ScrollToPlugin from 'gsap/ScrollToPlugin';

const modalBodyVariants = {
  initial: { x: 400 },
  remove: { x: 400 },
  animate: { x: 0 },
};

export const MobileNav = () => {
  const location = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      setSidebarOpen(false);
    }
  };
  useEffect(() => {
    sidebarOpen && setSidebarOpen(false);
  }, [location]);

  return (
    <div className='md:hidden'>
      <div className={styles.nav}>
        <Link href='/' className='overflow-y-clip'>
          <motion.h6
            initial={{ y: 'var(--y-from, 0)' }}
            animate={{ y: 'var(--y-to, 0)', transition: { duration: 0.3 } }}
            className='max-sm:[--y-from:30px] max-sm:[--y-to:0px]  '
          >
            TEMITOPE
          </motion.h6>
        </Link>
        <motion.button
          initial={{ x: 'var(--x-from, 0)' }}
          animate={{
            x: 'var(--x-to, 0)',
            transition: { duration: 0.3, delay: 0.3 },
          }}
          className='max-sm:[--x-from:100px] max-sm:[--x-to:0px]  mb-2'
          onClick={() => setSidebarOpen(true)}
        >
          <svg
            width='47'
            height='8'
            viewBox='0 0 47 8'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <line
              y1='0.5'
              x2='47'
              y2='0.5'
              // stroke='#B8B8B8'
              className='stroke-black dark:stroke-[#B8B8B8]'
            />
            <line
              y1='7.5'
              x2='47'
              y2='7.5'
              // stroke='#B8B8B8'
              className='stroke-black dark:stroke-[#B8B8B8]'
            />
          </svg>
        </motion.button>
      </div>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className='bg-white fixed h-screen inset-0 dark:bg-black z-[60] px-8 pt-6 w-full overflow-y-auto flex flex-col pb-10'
            onClick={(e) => e.stopPropagation()}
            variants={modalBodyVariants}
            animate='animate'
            exit='remove'
            initial='initial'
          >
            <button onClick={() => setSidebarOpen(false)} className='ml-auto'>
              <svg
                width='15'
                height='15'
                viewBox='0 0 12 12'
                xmlns='http://www.w3.org/2000/svg'
                className='fill-black dark:fill-white'
              >
                <path d='M7.09939 6.00974L11.772 1.33703C12.076 1.03309 12.076 0.541661 11.772 0.237721C11.468 -0.0662194 10.9766 -0.0662194 10.6727 0.237721L5.99994 4.91043L1.32737 0.237721C1.02329 -0.0662194 0.532003 -0.0662194 0.228062 0.237721C-0.0760207 0.541661 -0.0760207 1.03309 0.228062 1.33703L4.90063 6.00974L0.228062 10.6824C-0.0760207 10.9864 -0.0760207 11.4778 0.228062 11.7818C0.379534 11.9334 0.578697 12.0095 0.777717 12.0095C0.976738 12.0095 1.17576 11.9334 1.32737 11.7818L5.99994 7.10905L10.6727 11.7818C10.8243 11.9334 11.0233 12.0095 11.2223 12.0095C11.4213 12.0095 11.6203 11.9334 11.772 11.7818C12.076 11.4778 12.076 10.9864 11.772 10.6824L7.09939 6.00974Z' />
              </svg>
            </button>
            <ul className='flex flex-col items-center gap-y-8 mt-10 uppercase text-2xl font-semibold'>
              <li>
                <Link onClick={(e) => scrollTo(e, '#home')} href='/'>
                  Home
                </Link>
              </li>
              <li>
                <Link onClick={(e) => scrollTo(e, '#works')} href='/#works'>
                  Works
                </Link>
              </li>
              <li>
                <Link href={'/projects'}>Projects</Link>
              </li>
              <li>
                <Link
                  onClick={(e) => scrollTo(e, '#experience')}
                  href='/#experience'
                >
                  Experience
                </Link>
              </li>
              <li>
                <Link onClick={(e) => scrollTo(e, '#contact')} href='/#contact'>
                  Contact
                </Link>
              </li>
            </ul>{' '}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
