import React from 'react';
import data from '~~/data/works.json';
import { ProjectCard } from '..';

export const Works = () => {
  const { works } = data;
  return (
    <div className='md:pt-[100px] max-w-7xl mx-auto w-full section-padding md:mb-[182px]'>
      <h2 id='works' className='font-semibold text-[44px]'>
        Works
      </h2>
      <p className=' font-extralight  text-sm'>
        Works i've completed for businesses/brands in the past
      </p>
      <ul className='mt-20 flex flex-col gap-y-20'>
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
