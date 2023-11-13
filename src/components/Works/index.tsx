import React from 'react';
import data from '~~/data/works.json';
import { ProjectCard } from '..';

export const Works = () => {
  const { works } = data;
  return (
    <div
      className='md:pt-[100px] max-w-7xl mt-20 md:mx-auto w-full section-padding md:mb-[182px]'
      id='works'
    >
      <h2 className='font-semibold text-[28px] md:text-[44px]'>Works</h2>
      <p className=' font-light text-[#808080] text-sm'>
        Work I've completed for businesses and brands in the past
      </p>
      <ul className='mt-8 md:mt-20 flex flex-col gap-y-20'>
        {works.map((work, index) => (
          <li key={index}>
            <ProjectCard
              title={work.title}
              details={work.details}
              projectLink={work.projectLink}
              stack={work.stack}
              imageUrl={work.imageUrl}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
