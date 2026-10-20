import type { Metadata } from 'next';
import LegalDocument from '@/components/LegalDocument';
import { termsSections } from '@/content/policies';
export const metadata: Metadata = { title: '이용약관 | RetroVault', alternates: { canonical: '/terms' } };
export default function TermsPage() { return <LegalDocument title="이용약관" summary="게임을 발견하고 컬렉션을 기록하는 공간을 함께 이용하기 위한 기본 약속입니다." sections={termsSections}/>; }
