"use client";
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';
import { Game } from '@/types';
import GameCard from './GameCard';
import CollectionAddModal from './CollectionAddModal';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGameSlug } from '@/lib/slug';

export default function WikiHome({ games, ownedIds, historyGame }: { games: Game[]; ownedIds: string[]; historyGame?: Game | null }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Game | null>(null);
  return <div className="wiki-shell wiki-home">
    <section className="wiki-hero"><div>
      <p className="wiki-eyebrow">게임 위키 · 아카이브 · 나만의 다락</p>
      <h1>게임을 알아가고,<br />좋아한 순간을 모아요.</h1>
      <p className="wiki-intro">게임·플랫폼·제작사의 정보를 살펴보고,<br className="hidden sm:block" /> 나만의 게임 기록은 내 다락에 차곡차곡.</p>
      <form action="/games" className="wiki-search"><label className="sr-only" htmlFor="home-search">게임 위키 검색</label><input id="home-search" name="q" placeholder="게임 제목이나 기종으로 검색해보세요" /><button aria-label="게임 검색" type="submit"><Search size={20} /></button></form>
      <div className="wiki-actions"><Link className="wiki-button primary" href="/games">게임 위키 찾아보기</Link><Link className="wiki-button" href="/community">다락 구경하기</Link></div>
      <p className="wiki-note">로그인 없이 먼저 둘러볼 수 있어요.</p>
    </div><aside className="wiki-panel wiki-discover"><h2>어디부터 찾아볼까요?</h2>
      {[['게임 위키', '제목·장르·시리즈별 탐색', '/games'], ['플랫폼', '기종과 세대별 게임', '/platforms'], ['제작사', '개발사·배급사의 발자취', '/companies'], ['연대기', '시대를 따라 읽는 게임 이야기', '/timeline']].map(([name, detail, href]) => <Link key={href} href={href}><strong>{name}</strong><ArrowRight size={16} /><span>{detail}</span></Link>)}
      <Link className="wiki-note" href="/request">함께 기록해요 · 정보 추가 / 수정 제안 →</Link>
    </aside></section>
    <section className="wiki-section"><h2>시대를 따라 둘러보는 게임 아카이브</h2><p className="wiki-intro">연대별 게임과 플랫폼을 함께 살펴보세요.</p><div className="wiki-era-grid">{[['1980s', '오락실과 패미컴'], ['1990s', '게임 문화의 황금기'], ['2000s', '새로운 세계로의 접속']].map(([era, label]) => <Link className="wiki-panel" href={`/timeline#year-card-${era.slice(0, 4)}`} key={era}><strong>{era}</strong><h3>{label}</h3><span>시대별 기록 둘러보기 →</span></Link>)}</div></section>
    <section className="wiki-section"><div className="wiki-section-heading"><div><h2>게임 위키에서 발견하기</h2><p className="wiki-intro">게임 정보에서 내 다락까지, 취향을 넓혀보세요.</p></div><Link href="/games">전체 게임 보기 →</Link></div><div className="wiki-game-grid">{games.slice(0, 4).map(game => <GameCard key={game.id} game={game} isOwned={ownedIds.includes(game.id)} onClick={g => router.push(`/games/${getGameSlug(g)}`)} onAddToCollection={() => setSelected(game)} />)}</div>{!games.length && <p className="wiki-panel">아직 등록된 게임이 없어요. <Link href="/request">첫 게임 정보를 제안해주세요.</Link></p>}</section>
    {historyGame && <section className="wiki-history wiki-panel"><div><p className="wiki-eyebrow">아카이브에서 꺼낸 한 편</p><h2>{historyGame.title}</h2><p className="wiki-intro">{historyGame.platform} · {historyGame.releaseYear || '출시 연도 확인 중'}</p></div><Link className="wiki-button" href={`/games/${getGameSlug(historyGame)}`}>게임 문서 읽기 →</Link></section>}
    {selected && <CollectionAddModal game={selected} onClose={() => setSelected(null)} />}
  </div>;
}
