import Link from 'next/link';
import type { PolicySection } from '@/content/policies';
import { POLICY_DATE, STUDIO_NAME } from '@/lib/legal';

export default function LegalDocument({ title, summary, sections }: { title: string; summary: string; sections: PolicySection[] }) {
  return <article className="mx-auto max-w-4xl px-5 py-10 md:px-8 md:py-16">
    <Link href="/" className="inline-flex min-h-11 items-center text-sm text-mint hover:underline">← 겜자취 홈</Link>
    <header className="mb-8 border-b border-vault-border pb-8"><p className="mb-3 text-sm text-text-secondary">{STUDIO_NAME} · 겜자취</p><h1 className="mb-4 text-3xl font-bold text-text-primary md:text-4xl">{title}</h1><p className="text-base leading-8 text-text-secondary">{summary}</p><p className="mt-4 text-sm text-text-muted">작성일 {POLICY_DATE} · 운영 적용 전 검토본</p></header>
    <nav aria-label="문서 목차" className="mb-10 grid gap-2 rounded-xl border border-vault-border bg-vault-surface p-5 sm:grid-cols-2">{sections.map((section,index) => <a key={section.title} href={`#section-${index+1}`} className="py-1 text-sm leading-6 text-mint hover:underline">{section.title}</a>)}</nav>
    <div className="space-y-10">{sections.map((section,index) => <section key={section.title} id={`section-${index+1}`} className="scroll-mt-28"><h2 className="mb-4 text-xl font-bold text-text-primary">{section.title}</h2>{section.paragraphs.map(paragraph => <p key={paragraph} className="mt-3 break-words text-base leading-8 text-text-secondary">{paragraph}</p>)}</section>)}</div>
    <nav aria-label="운영 정책" className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-vault-border pt-6 text-sm text-mint"><Link href="/privacy" className="min-h-11 py-3 hover:underline">개인정보처리방침</Link><Link href="/terms" className="min-h-11 py-3 hover:underline">이용약관</Link><Link href="/contact" className="min-h-11 py-3 hover:underline">문의하기</Link></nav>
  </article>;
}
