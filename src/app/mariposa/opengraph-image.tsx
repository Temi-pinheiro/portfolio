import { ogContentType, ogImage, ogSize } from '~~/lib/og';

export const alt = 'The Mariposa Program: AI systems and agents for businesses, by Temitope Pinheiro';
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return ogImage({
    label: 'THE MARIPOSA PROGRAM',
    title: 'An AI team, built around how your business works.',
    path: '/mariposa',
  });
}
