'use client';

import Link from 'next/link';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-12 text-center">
      <p className="mb-3 font-pixel text-xs text-coral">RETRY?</p>
      <h1 className="mb-3 text-2xl font-bold text-text-primary">화면을 불러오지 못했어요</h1>
      <p role="alert" className="mb-8 text-sm text-text-secondary">잠시 후 다시 시도해주세요. 문제가 계속되면 홈으로 돌아가 다른 페이지를 이용할 수 있어요.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="min-h-11 rounded-lg bg-mint px-5 py-3 font-bold text-vault-bg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mint">다시 시도</button>
        <Link href="/" className="min-h-11 rounded-lg border border-vault-border px-5 py-3 text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mint">홈으로 돌아가기</Link>
      </div>
    </section>
  );
}
