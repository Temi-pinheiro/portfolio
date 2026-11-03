import type { Metadata } from 'next';
import {
  type NoticeCode,
  noticeMetadata,
  PrivacyNotice,
} from '~~/components/PrivacyNotice';

type Params = { code: Exclude<NoticeCode, 'en'> };

// /privacy/pt and /privacy/es; English is /privacy itself.
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return [{ code: 'pt' }, { code: 'es' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { code } = await params;
  return noticeMetadata(code);
}

export default async function TranslatedPrivacyPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { code } = await params;
  return <PrivacyNotice code={code} />;
}
