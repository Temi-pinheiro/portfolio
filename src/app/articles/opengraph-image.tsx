import { ogContentType, ogImage, ogSize } from '~~/lib/og';

export const alt = 'Articles by Temitope Pinheiro';
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return ogImage({
    label: 'TEMITOPE PINHEIRO · ARTICLES',
    title: 'Mostly interviews, where I answer questions about what I’ve built.',
    path: '/articles',
  });
}
