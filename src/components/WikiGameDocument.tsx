"use client";
import { Game } from '@/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BoxArtPlaceholder } from './GameCard';
import CollectionAddModal from './CollectionAddModal';
import AgeVerificationModal from './AgeVerificationModal';
import ReviewSection from './ReviewSection';
import { is19PlusGame, isAgeVerified } from '@/lib/ageVerification';

export default function WikiGameDocument({ game }: { game: Game }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [verified, setVerified] = useState(false);
  const [ageOpen, setAgeOpen] = useState(false);
  const restricted = is19PlusGame(game);
  useEffect(() => { const allowed = isAgeVerified(); setVerified(allowed); setAgeOpen(restricted && !allowed); }, [restricted]);
  const fields = [['원제', game.originalTitle], ['개발사', game.developer], ['배급사', game.publisher], ['플랫폼', game.platform], ['장르', game.genre], ['출시일', game.releaseDate || (game.releaseYear ? `${game.releaseYear}년` : '')], ['지역', game.country], ['출시 상태', game.releaseStatus], ['플랫폼 유형', game.platformType]];
  const trailer = (() => { try { const url = new URL(game.trailerUrl || ''); if (url.hostname === 'youtu.be') return `https://www.youtube.com/embed/${url.pathname.slice(1)}`; if (['www.youtube.com', 'youtube.com'].includes(url.hostname)) { const id = url.searchParams.get('v') || url.pathname.split('/embed/')[1]; return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : null; } } catch {} return null; })();
  return <div className="wiki-shell wiki-document">
    <AgeVerificationModal isOpen={ageOpen} onClose={() => router.push('/games')} onSuccess={() => { setVerified(true); setAgeOpen(false); }} />
    <header className="wiki-document-header"><Link className="wiki-note" href="/games">게임 위키 / 게임 문서</Link><h1>{game.title}</h1>{game.originalTitle && <p className="wiki-intro">{game.originalTitle}</p>}<p className="wiki-note">{game.platform} · {game.releaseYear || '출시 연도 확인 중'} · 조회 {game.views ?? 0}{game.rating ? ` · 평점 ${game.rating}` : ''}</p><Link className="wiki-note" href={`/request/edit?tab=game&q=${encodeURIComponent(game.title)}`}>정보 수정 제안 →</Link></header>
    <div className="wiki-document-layout">
      <nav className="wiki-toc wiki-panel" aria-label="문서 목차"><strong>목차</strong>{[['overview', '1. 개요'], ['history', '2. 시대와 배경'], ['specs', '3. 설치·사양'], ['reviews', '4. 이용자 리뷰'], ['sources', '5. 출처·정보 제안']].map(([id, name]) => <a key={id} href={`#${id}`}>{name}</a>)}</nav>
      <article className="wiki-article">
        <section id="overview" className="wiki-panel"><h2>1. 개요</h2><p>{game.description || '아직 소개가 정리되지 않았어요. 알고 있는 정보를 제안해주세요.'}</p>{trailer && <div className="mt-6"><h3 className="font-bold mb-3">트레일러</h3><iframe className="w-full aspect-video rounded-xl" src={trailer} title={`${game.title} 트레일러`} allowFullScreen loading="lazy" /></div>}</section>
        <section id="history" className="wiki-panel"><h2>2. 시대와 배경</h2><p>{game.historicalContext || '시대와 배경에 관한 정보가 아직 등록되지 않았어요.'}</p><Link className="wiki-note inline-block" href="/timeline">게임 연대기 둘러보기 →</Link></section>
        <section id="specs" className="wiki-panel"><h2>3. 설치·사양</h2><p>설치 용량: {game.installSize || '확인 중'}</p>{(game.pcSpecsMin || game.pcSpecsRec || /pc|windows|mac/i.test(game.platform || '')) && <><h3 className="font-bold mt-5 mb-2">최소 사양</h3><p>{game.pcSpecsMin || '확인 중'}</p><h3 className="font-bold mt-5 mb-2">권장 사양</h3><p>{game.pcSpecsRec || '확인 중'}</p></>}</section>
        <section id="reviews" className="wiki-panel"><h2>4. 이용자 리뷰</h2><ReviewSection gameId={game.id} /></section>
        <section id="sources" className="wiki-panel"><h2>5. 출처·정보 제안</h2><p>이 문서에는 자료별 출처 링크가 아직 정리되어 있지 않습니다. 공식 제품 페이지나 설명서 등 확인 가능한 자료와 함께 정보 수정을 제안해주세요.</p><div className="wiki-actions"><Link className="wiki-button" href={`/request/edit?tab=game&q=${encodeURIComponent(game.title)}`}>정보 수정 제안</Link>{game.developer && <Link className="wiki-button" href={`/games?developer=${encodeURIComponent(game.developer)}`}>같은 개발사의 게임</Link>}</div></section>
      </article>
      <aside className="wiki-infobox"><section className="wiki-panel"><div className="rounded-xl overflow-hidden mb-5 relative"><div className={restricted && !verified ? 'blur-xl pointer-events-none select-none' : ''}>{game.imageUrl ? <img src={game.imageUrl} alt={game.title} className="w-full aspect-[3/4] object-cover" /> : <BoxArtPlaceholder game={game} />}</div>{restricted && !verified && <button className="absolute inset-0 bg-vault-bg/80 font-bold text-coral" onClick={() => setAgeOpen(true)}>만 19세 이상 확인</button>}</div><h2>기본 정보</h2><dl>{fields.map(([label, value]) => <div className="contents" key={label}><dt>{label}</dt><dd>{value || '확인 중'}</dd></div>)}</dl>{game.platformDiscontinued && <p className="wiki-note">단종된 플랫폼</p>}</section><section className="wiki-panel bg-vault-surface-light"><h2>이 게임, 내 다락에도</h2><p className="wiki-note">소장 여부와 플레이 기록을 남겨보세요.</p><button className="wiki-button primary" onClick={() => setAdding(true)}>+ 내 다락에 담기</button><p className="wiki-note">새 기록은 비공개로 시작해요.</p></section></aside>
    </div>
    {adding && <CollectionAddModal game={game} onClose={() => setAdding(false)} />}
  </div>;
}
