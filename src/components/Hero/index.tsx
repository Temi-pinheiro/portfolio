'use client';
import React from 'react';
import { motion } from 'framer-motion';
export const Hero = () => {
  return (
    <>
      <section
        className='max-w-7xl md:mx-auto relative w-full flex flex-col section-padding mt-[120px] py-[100px] md:mt-[98px] mb-[160px] md:mb-[138px]'
        id='home'
      >
        <motion.h1
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            opacity: { duration: 1.35 },
            x: { duration: 0.3 },
            delay: 0.8,
            ease: [0.65, 0, 0.35, 1],
          }}
          className='font-semibold text-[30px] md:text-7xl max-w-[792px] md:leading-[87.14px] tracking-tight'
        >
          Front-end Developer Experienced in building for SaaS Companies.
        </motion.h1>
        <div className='flex flex-col mt-8 md:mt-[116px] max-w-[486px] gap-y-5'>
          <motion.h3
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              opacity: { duration: 1 },
              x: { duration: 0.6 },
              delay: 0.6,
              ease: [0.65, 0, 0.35, 1],
            }}
            className='font-light mt-8 md:mt-0 text-2xl md:text-4xl'
          >
            Hi, I’m Temitope Pinheiro
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              opacity: { duration: 1 },
              x: { duration: 0.3 },
              delay: 0.7,
              ease: [0.65, 0, 0.35, 1],
            }}
            className='text-sm font-light dark:font-normal md:text-lg'
          >
            A multidiscplinary software developer that builds with the user in
            heart and business in mind. Currently building the Web3 space for
            creators to earn @{' '}
            <a
              className='text-[#2C1DFF] underline underline-offset-4'
              href='https://www.sorbit.xyz/'
              target='_blank'
            >
              Sorbit
            </a>
            .
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            opacity: { duration: 1.2 },
            y: { duration: 0.3 },
            delay: 0.8,
            ease: [0.65, 0, 0.35, 1],
          }}
          className='md:absolute left-0 -bottom-1 mt-28 md:mt-0 flex md:flex-col gap-x-3 gap-y-3'
        >
          <a href='https://github.com/Temi-pinheiro' target='_blank'>
            <GitHub />
          </a>
          <a
            href='https://www.linkedin.com/in/temitope-pinheiro/'
            target='_blank'
          >
            <Linkedin />
          </a>
          <a href='https://twitter.com/Dev1nh1o' target='_blank'>
            <Twitter />
          </a>
        </motion.div>
      </section>
      <motion.hr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.0 }}
        className='bg-[#808080] mt-8 md:mt-0 dark:opacity-25'
      ></motion.hr>
    </>
  );
};

const GitHub = () => (
  <svg
    width='20'
    height='20'
    viewBox='0 0 20 20'
    fill='none'
    className='dark:fill-white fill-black'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path d='M10.0008 1.66666C5.39665 1.66666 1.66748 5.39583 1.66748 10C1.66748 13.6875 4.0529 16.8021 7.3654 17.9062C7.78206 17.9792 7.93831 17.7292 7.93831 17.5104C7.93831 17.3125 7.9279 16.6562 7.9279 15.9583C5.83415 16.3437 5.29248 15.4479 5.12581 14.9792C5.03206 14.7396 4.62581 14 4.27165 13.8021C3.97998 13.6458 3.56331 13.2604 4.26123 13.25C4.91748 13.2396 5.38623 13.8542 5.54248 14.1042C6.29248 15.3646 7.4904 15.0104 7.96956 14.7917C8.04248 14.25 8.26123 13.8854 8.50083 13.6771C6.64665 13.4687 4.70915 12.75 4.70915 9.5625C4.70915 8.65625 5.03206 7.90625 5.56331 7.32291C5.47998 7.11458 5.18831 6.26041 5.64665 5.11458C5.64665 5.11458 6.34456 4.89583 7.93831 5.96875C8.605 5.78125 9.31333 5.6875 10.0217 5.6875C10.73 5.6875 11.4383 5.78125 12.105 5.96875C13.6987 4.88541 14.3967 5.11458 14.3967 5.11458C14.855 6.26041 14.5633 7.11458 14.48 7.32291C15.0112 7.90625 15.3342 8.64583 15.3342 9.5625C15.3342 12.7604 13.3862 13.4687 11.5321 13.6771C11.8342 13.9375 12.0946 14.4375 12.0946 15.2187C12.0946 16.3333 12.0842 17.2292 12.0842 17.5104C12.0842 17.7292 12.2404 17.9896 12.6571 17.9062C16.0492 16.7611 18.3332 13.5802 18.3342 10C18.3342 5.39583 14.605 1.66666 10.0008 1.66666Z' />
  </svg>
);

const Linkedin = () => (
  <svg
    width='20'
    height='20'
    viewBox='0 0 20 20'
    fill='none'
    className='dark:fill-white fill-black'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path d='M15.2801 15.2825H13.0589V11.8018C13.0589 10.9718 13.0421 9.90375 11.9014 9.90375C10.7433 9.90375 10.5664 10.8069 10.5664 11.7406V15.2825H8.34514V8.125H10.4789V9.10058H10.5076C10.8058 8.53808 11.5308 7.94437 12.6139 7.94437C14.8646 7.94437 15.2808 9.42567 15.2808 11.3538L15.2801 15.2825ZM5.83642 7.14562C5.12142 7.14562 4.54704 6.56687 4.54704 5.855C4.54704 5.14375 5.12204 4.56563 5.83642 4.56563C6.54892 4.56563 7.12642 5.14375 7.12642 5.855C7.12642 6.56687 6.54829 7.14562 5.83642 7.14562ZM6.95017 15.2825H4.72267V8.125H6.95017V15.2825ZM16.3914 2.5H3.60767C2.99579 2.5 2.50079 2.98375 2.50079 3.58063V16.4194C2.50079 17.0168 2.99579 17.5 3.60767 17.5H16.3896C17.0008 17.5 17.5008 17.0168 17.5008 16.4194V3.58063C17.5008 2.98375 17.0008 2.5 16.3896 2.5H16.3914Z' />
  </svg>
);

const Twitter = () => (
  <svg
    width='20'
    height='20'
    viewBox='0 0 20 20'
    fill='none'
    className='dark:fill-white fill-black'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path d='M6.66665 1.66667H0.833313L7.71736 10.8454L1.20827 18.3333H3.41663L8.74023 12.2092L13.3333 18.3333H19.1666L11.9931 8.76859L18.1667 1.66667H15.9584L10.9702 7.40482L6.66665 1.66667ZM14.1666 16.6667L4.16665 3.33334H5.83331L15.8333 16.6667H14.1666Z' />
  </svg>
);
