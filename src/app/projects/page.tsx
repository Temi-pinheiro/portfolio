import { Metadata } from 'next';
import React from 'react';
import Projects from '~~/components/Projects';
export const metadata: Metadata = {
  title: 'My Projects',
  description: 'My project showcase page',
};
export default function ProjectPage() {
  return <Projects />;
}
