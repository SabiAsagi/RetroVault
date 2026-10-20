import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-12 text-center">
      <p className="mb-3 font-pixel text-xs text-mint">404</p>
      <h1 className="mb-3 text-2xl font-bold text-text-primary">페이지를 찾을 수 없어요</h1>
      <p className="mb-8 text-sm text-text-secondary">주소가 변경되었거나 아직 등록되지 않은 정보예요. 게임 아카이브에서 다시 찾아보세요.</p>
      <Link href="/games" className="min-h-11 rounded-lg bg-mint px-5 py-3 font-bold text-vault-bg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mint">게임 아카이브 둘러보기</Link>
    </section>
  );
}
