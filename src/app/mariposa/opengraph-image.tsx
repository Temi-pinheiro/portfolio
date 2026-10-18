import { ogContentType, ogImage, ogSize } from '~~/lib/og';

export const alt = 'The Mariposa Program, a UI/UX process by Temitope Pinheiro';
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return ogImage({
    label: 'THE MARIPOSA PROGRAM',
    title: 'You built it fast. Now make it feel finished.',
    path: '/mariposa',
  });
}
