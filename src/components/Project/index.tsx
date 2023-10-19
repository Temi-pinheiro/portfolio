import React from 'react';

export const ProjectCard = ({
  title,
  details,
  imageUrl,
  stack,
  projectLink,
}: {
  title: string;
  details: string;
  imageUrl: string;
  stack: string[];
  projectLink: string;
}) => {
  return (
    <div className='flex items-start gap-x-8'>
      <img
        className='max-w-[362px] max-h-[257px] w-full h-full object-cover'
        src={imageUrl}
      />
      <article className='max-w-[624px] flex flex-col'>
        <a
          className='text-xl font-medium flex items-center gap-x-3'
          href={projectLink}
          target='_blank'
        >
          {title}
          <Arrow />
        </a>
        <p className=' mt-4 max-w-[508px] font-light'>{details}</p>
        <ul className='flex items-center flex-wrap w-full gap-x-[14px] mt-8'>
          {stack.map((st, index) => (
            <li
              className='shrink-0 px-4  py-2 rounded-[34px] text-xs border border-[#AFAFAF]'
              key={index}
            >
              {st}
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
};

const Arrow = () => (
  <svg
    width='13'
    height='13'
    viewBox='0 0 13 13'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path d='M1.4 13L0 11.6L9.6 2H1V0H13V12H11V3.4L1.4 13Z' fill='white' />
  </svg>
);
