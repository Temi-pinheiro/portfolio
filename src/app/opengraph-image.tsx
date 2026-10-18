import { ogContentType, ogImage, ogSize } from '~~/lib/og';

export const alt = 'Temitope Pinheiro';
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return ogImage({
    label: 'TEMITOPE PINHEIRO',
    title: 'From a poster a day to helping founders finish what they built fast.',
    path: '',
  });
}
