import React from 'react';
import data from '~~/data/experiences.json';
import { Experience } from '..';

export const Experiences = () => {
  const { experiences } = data;
  return (
    <div className=' pt-20 md:pt-[100px] max-w-7xl mx-auto w-full section-padding md:mb-[182px]'>
      <h2 id='works' className='font-semibold text-[20px] md:text-[44px]'>
        Experience
      </h2>

      <ul className='mt-8 md:mt-20 flex flex-col gap-y-20'>
        {experiences.map((exp, index) => (
          <li key={index}>
            <Experience
              title={exp.title}
              position={exp.position}
              details={exp.details}
              website={exp.website}
              stack={exp.stack}
              period={exp.period}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
