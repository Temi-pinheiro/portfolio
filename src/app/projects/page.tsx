import { Metadata } from 'next';
import React from 'react';
import Projects from '~~/components/Projects';
export const metadata: Metadata = {
  title: 'Projects',
  description:
    'A showcase of personal and client projects by Temitope Pinheiro, built with React, Next.js, TypeScript and more.',
  alternates: { canonical: '/projects' },
  openGraph: {
    title: 'Projects | Temitope Pinheiro',
    description:
      'A showcase of personal and client projects by Temitope Pinheiro, built with React, Next.js, TypeScript and more.',
    url: 'https://temipinheiro.com/projects',
  },
};
export default function ProjectPage() {
  return <Projects />;
}
