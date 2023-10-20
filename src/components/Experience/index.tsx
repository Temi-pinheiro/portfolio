import React from 'react';
import { OuterLink } from '..';

export const Experience = ({
  title,
  details,
  period,
  position,
  stack,
  website,
}: {
  title: string;
  position: string;
  details: string[];
  period: string;
  stack: string[];
  website: string;
}) => {
  return (
    <div className='flex items-start gap-x-8 '>
      <article className='max-w-[624px] flex flex-col shrink-0'>
        <OuterLink title={title} url={website} />
        <h4 className='text-[#DDDDDD] font-light mt-2 text-sm'>{position}</h4>
        <ul className='flex flex-col w-full gap-y-3 mt-8 '>
          {details.map((dt, index) => (
            <li className='text-xs list-disc list-inside leading-5' key={index}>
              {dt}
            </li>
          ))}
        </ul>
        <ul className='flex items-center flex-wrap w-full gap-x-[14px] gap-y-5 mt-8'>
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
      <div className='flex items-center gap-x-6'>
        <svg
          className='w-full'
          height='1'
          viewBox='0 0 624 1'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <line y1='0.5' x2='624' y2='0.5' stroke='#9E9E9E' />
        </svg>

        <span className='text-xs text-[#9E9E9E] shrink-0'>{period}</span>
      </div>
    </div>
  );
};
