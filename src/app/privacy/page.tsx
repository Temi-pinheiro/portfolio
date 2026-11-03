import { noticeMetadata, PrivacyNotice } from '~~/components/PrivacyNotice';

export const metadata = noticeMetadata('en');

export default function PrivacyPage() {
  return <PrivacyNotice code='en' />;
}
