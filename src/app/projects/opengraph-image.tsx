import { ogContentType, ogImage, ogSize } from '~~/lib/og';

export const alt = 'Projects by Temitope Pinheiro';
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return ogImage({
    label: 'TEMITOPE PINHEIRO · PROJECTS',
    title: 'For the love of the game',
    path: '/projects',
  });
}
