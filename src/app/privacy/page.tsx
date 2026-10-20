import type { Metadata } from 'next';
import LegalDocument from '@/components/LegalDocument';
import { privacySections } from '@/content/policies';
export const metadata: Metadata = { title: '개인정보처리방침 | RetroVault', alternates: { canonical: '/privacy' } };
export default function PrivacyPage() {
  return <><LegalDocument title="개인정보처리방침" summary="어떤 정보를 왜 처리하는지, 어디에 보관하는지, 어떻게 수정·삭제를 요청할 수 있는지 안내합니다." sections={privacySections}/><aside className="mx-auto mb-12 max-w-4xl px-5 text-sm text-text-secondary"><p className="mb-3">제공자 개인정보 안내</p><ul className="flex flex-wrap gap-5 text-mint"><li><a href="https://vercel.com/legal/privacy-notice" className="underline">Vercel</a></li><li><a href="https://neon.com/privacy-policy" className="underline">Neon</a></li><li><a href="https://policies.google.com/privacy?hl=ko" className="underline">Google</a></li></ul></aside></>;
}
