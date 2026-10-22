import { ogContentType, ogImage, ogSize } from '~~/lib/og';

export const alt = 'The Quiet Edge, a guide by Temitope Pinheiro';
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return ogImage({
    label: 'TEMITOPE PINHEIRO · A GUIDE',
    title: 'The Quiet Edge: how smart people are actually using AI at work',
    path: '/quiet-edge',
  });
}
