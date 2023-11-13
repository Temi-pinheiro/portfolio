import React from 'react';
import { ProjectCard } from '~~/components';
import data from '~~/data/projects.json';

export const Projects = () => {
  const { projects: proj } = data;
  return (
    <div className='md:pt-[100px] max-w-7xl mx-auto w-full section-padding md:mb-[182px]'>
      <h2 id='projects' className='font-semibold text-[44px]'>
        Projects
      </h2>
      <p className=' font-light text-[#808080] text-sm'>
        Personal projects i tried my hand at, brought to you mostly by{' '}
        <a
          href='https://www.frontendmentor.io/profile/Temi-pinheiro'
          target='_blank'
          className='underline'
        >
          Frontendmentor.io
        </a>
      </p>
      <ul className='mt-8 md:mt-20 flex flex-col gap-y-20'>
        {proj.map((project, index) => (
          <li key={index}>
            <ProjectCard
              title={project.title}
              details={project.details}
              projectLink={project.projectLink}
              stack={project.stack}
              imageUrl={project.imageUrl}
              githubUrl={project.githubUrl}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
