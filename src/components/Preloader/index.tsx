'use client';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { motion, animate } from 'framer-motion';
import gsap from 'gsap';

export const Preloader = ({ loading }: { loading: boolean }) => {
  const top = useRef(null);
  const bottom = useRef(null);

  useLayoutEffect(() => {
    // Refs allow you to access DOM nodes
    // then we can animate them like so...
    gsap
      .timeline()
      .to(
        top.current,
        {
          rotateY: '360',
          duration: 1,
          repeat: 1,
          ease: 'power2.inOut',
        },
        0
      )
      .to(
        bottom.current,
        {
          rotateY: '360',
          duration: 1,
          repeat: 1,
          ease: 'power3.inOut',
        },
        0
      )
      .to(
        top.current,
        {
          width: '100%',
          duration: 0.5,
          ease: 'power3.inOut',
        },
        2
      )
      .to(
        bottom.current,
        {
          width: '100%',
          duration: 0.5,
          ease: 'power3.inOut',
        },
        2
      )
      .to(
        top.current,
        {
          y: '-100%',
          duration: 0.5,
          ease: 'power3.inOut',
        },
        2.5
      )
      .to(
        bottom.current,
        {
          y: '100%',
          duration: 0.5,
          ease: 'power3.inOut',
        },
        2.5
      );
  });
  return (
    <motion.div className=' h-screen w-screen block'>
      <div
        ref={top}
        className='h-1/2 border-black dark:border-white border-b top-0 w-[10%] mx-auto'
      ></div>
      <div
        ref={bottom}
        className='h-1/2 border-black dark:border-white border-t bottom-0 w-[10%] mx-auto'
      ></div>
    </motion.div>
  );
};
