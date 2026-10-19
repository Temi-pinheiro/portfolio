'use client';

import Image from 'next/image';
import { useState } from 'react';
import data from '~~/data/projects.json';
import { ArrowUpRight } from '../icons';

// Hovering or focusing a project fades the others back, the same focus move
// the landing story makes.

export const ProjectGrid = () => {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <ul className='mt-14 grid gap-x-6 gap-y-16 md:mt-[clamp(56px,6vw,96px)] md:grid-cols-2 md:gap-y-[72px]'>
      {data.projects.map((project, i) => {
        const dimmed = hover !== null && hover !== i;
        return (
          <li
            key={project.title}
            className='transition-opacity duration-500'
            style={{ opacity: dimmed ? 0.42 : 1 }}
          >
            <div
              className='anim-rise-y'
              style={{ animationDelay: `${100 + i * 100}ms` }}
            >
              <a
                href={project.projectLink}
                target='_blank'
                rel='noreferrer'
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className='group block'
              >
                <div className='relative aspect-[1440/1022] overflow-hidden rounded-[22px] border border-line bg-tile'>
                  <Image
                    src={project.imageUrl}
                    alt={`Screenshot of ${project.title}`}
                    fill
                    sizes='(min-width: 768px) 50vw, 100vw'
                    className='object-cover object-left-top transition-transform duration-1000 ease-soft group-hover:scale-[1.035] motion-reduce:transition-none'
                  />
                </div>
                <div className='mt-6 flex items-baseline justify-between gap-4'>
                  <span
                    className={`font-display text-[clamp(28px,2.4vw,38px)] leading-[1.1] tracking-[-0.015em] underline decoration-1 underline-offset-[0.18em] transition-[text-decoration-color] duration-400 ${
                      hover === i ? 'decoration-accent' : 'decoration-transparent'
                    }`}
                  >
                    {project.title}
                  </span>
                  <span className='inline-flex flex-none items-center gap-2 font-mono text-[13px] tracking-[0.04em] text-muted'>
                    {project.meta}
                    <ArrowUpRight size={15} />
                  </span>
                </div>
                <p className='mt-3 max-w-[600px] text-[18px] leading-[1.6] text-muted'>
                  {project.details}
                </p>
                <p className='mt-3.5 font-mono text-[13px] tracking-[0.03em] text-muted'>
                  {project.stack.join(' · ')}
                </p>
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
