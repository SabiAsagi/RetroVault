import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { EntityLogo, type DirectoryKind } from './DirectoryUI';

export function EntityDocument({ kind, name, image, badges, description, facts, website, children }: {
  kind: DirectoryKind; name: string; image?: string | null; badges: string[];
  description?: string | null; facts: { label: string; value?: string | null }[]; website?: string | null; children: ReactNode;
}) {
  const label = kind === 'platform' ? '플랫폼' : '제작사';
  return <article className="directory-shell entity-document page-enter">
    <Link className="entity-back" href={kind === 'platform' ? '/platforms' : '/companies'}><ArrowLeft size={16} /> {label} 도감으로 돌아가기</Link>
    <header className="entity-hero"><EntityLogo src={image} name={name} kind={kind} /><div><p className="directory-eyebrow"><BookOpen size={16} /> 게임 위키 / {label} 문서</p><h1>{name}</h1><div className="entity-badges">{badges.filter(Boolean).map((badge, i) => <span key={i}>{badge}</span>)}</div><nav className="entity-jumps" aria-label="문서 목차"><a href="#entity-about">소개</a><a href="#entity-facts">기본 정보</a>{kind === 'platform' && <a href="#platform-hardware">모델·에디션</a>}<a href="#entity-games">관련 게임</a></nav></div></header>
    <div className="entity-document-layout"><div className="entity-about" id="entity-about"><p className="directory-eyebrow">이 기록 들여다보기</p><h2>소개</h2><p>{description || '아직 소개가 등록되지 않았어요. 알고 있는 이야기가 있다면 정보 추가를 제안해주세요.'}</p><Link href={`/request/edit?tab=${kind}`}>문서 정보 보태기 <ArrowRight size={15} /></Link></div><section className="entity-facts" id="entity-facts"><h2>기본 정보</h2><dl>{facts.map(f => <div key={f.label}><dt>{f.label}</dt><dd>{f.value || '정보 확인 중'}</dd></div>)}</dl>{website && <a className="wiki-button mt-5" href={website} target="_blank" rel="noopener noreferrer">공식 홈페이지 ↗</a>}</section></div>
    <section className="entity-games" id={kind === 'company' ? 'entity-games' : undefined}>{children}</section>
    <div className="directory-contribute"><span>함께 채워가는 게임 위키</span><Link href={`/request/edit?tab=${kind}`}>정보 추가·수정 제안 <ArrowRight size={15} /></Link></div>
  </article>;
}
