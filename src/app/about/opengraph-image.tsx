import { ogContentType, ogImage, ogSize } from '~~/lib/og';

export const alt = 'About Temitope Pinheiro';
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return ogImage({
    label: 'TEMITOPE PINHEIRO · ABOUT',
    title: 'A developer from Lagos, Nigeria',
    path: '/about',
  });
}
