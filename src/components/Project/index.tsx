import React from 'react';
import { OuterLink } from '..';

export const ProjectCard = ({
  title,
  details,
  imageUrl,
  stack,
  projectLink,
  githubUrl,
}: {
  title: string;
  details: string;
  imageUrl: string;
  stack: string[];
  projectLink: string;
  githubUrl?: string;
}) => {
  return (
    <div className='flex flex-col-reverse gap-y-8 md:gap-y-0 md:flex-row items-start gap-x-8 md:h-[257px]'>
      <img
        className='max-w-[362px] max-h-[257px] w-full h-full object-cover object-left-top'
        src={imageUrl}
      />
      <article className='max-w-[624px] flex flex-col'>
        <OuterLink title={title} url={projectLink} githubUrl={githubUrl} />
        <p className=' mt-4 text-sm md:text-base max-w-[508px] text-[#808080]  font-light'>
          {details}
        </p>
        <ul className='flex items-center flex-wrap w-full gap-x-[14px] gap-y-5 mt-6 md:mt-8'>
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
