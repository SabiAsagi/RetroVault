import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getHardware, hardwareKindLabels, hardwareCatalog } from '@/lib/hardware';
import { getHardwareCollection } from '@/app/actions/hardware';
import { HardwarePhoto } from '@/components/PlatformHardware';
import HardwareCollectionEditor from '@/components/HardwareCollectionEditor';
import { prisma } from '@/lib/prisma';
import { getPlatformSlug } from '@/lib/slug';

export async function generateMetadata({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;const entry=getHardware(id);
  return entry?{title:`${entry.name} | 기기 도감 · 겜자취`,description:entry.summary,alternates:{canonical:`https://retrovault.kro.kr/hardware/${entry.id}`}}:{};
}

export default async function HardwarePage({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;const e=getHardware(id);if(!e)notFound();
  const session=await getServerSession(authOptions);
  const platformName=e.platformKey==='ps5'?'PlayStation 5':e.platformKey==='ps4'?'PlayStation 4':'Nintendo DS';
  const [platform,records]=await Promise.all([prisma.platform.findUnique({where:{name:platformName},select:{name:true,releaseYear:true}}),session?.user?.id?getHardwareCollection():Promise.resolve([])]);
  const initial=records.find(r=>r.catalogId===id);
  const parent=e.parentId?getHardware(e.parentId):null;
  const children=hardwareCatalog.filter(x=>x.parentId===id);
  return <article className="directory-shell hardware-document page-enter"><Link className="entity-back" href={platform?`/platforms/${getPlatformSlug(platform)}#platform-hardware`:'/platforms'}>← {platformName} 도감으로</Link><header className="hardware-hero"><HardwarePhoto entry={e}/><div><p className="directory-eyebrow">게임 위키 / 기기 상세</p><div className="entity-badges">{e.kinds.map(k=><span key={k}>{hardwareKindLabels[k]}</span>)}</div><h1>{e.name}</h1><p>{e.summary}</p></div></header><div className="hardware-detail-layout"><div><section className="hardware-info"><h2>기기 기록</h2><dl>{[['모델',e.model],['색상·디자인',e.color],['출시일',e.releaseDate||'확인 중'],['지역',e.region]].filter(([,v])=>v).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>{parent&&<Link href={`/hardware/${parent.id}`}>기본 모델: {parent.name} →</Link>}{e.compatibility&&<><h3>호환 기기</h3><ul>{e.compatibility.map(v=><li key={v}>{v}</li>)}</ul></>}{e.contents&&<><h3>확인된 주요 구성</h3><ul>{e.contents.map(v=><li key={v}>{v}</li>)}</ul></>}{e.notes&&<><h3>알아두기</h3><ul>{e.notes.map(v=><li key={v}>{v}</li>)}</ul></>}{e.gameQuery&&<Link className="wiki-button" href={`/games?q=${encodeURIComponent(e.gameQuery)}`}>함께 담긴 게임 찾아보기 →</Link>}</section>{children.length>0&&<section className="hardware-info"><h2>이 모델의 본체 색상</h2><div className="entity-variants">{children.map(c=><Link key={c.id} href={`/hardware/${c.id}`}>{c.color} →</Link>)}</div></section>}<section className="hardware-sources"><h2>출처와 기록 상태</h2><a href={e.sourceUrl} target="_blank" rel="noopener noreferrer">{e.sourceLabel} ↗</a>{e.additionalSources?.map(s=><a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">{s.label} ↗</a>)}<p>자료 확인일 {e.checkedAt} · 위에 표시된 지역과 출시 시점 기준</p><p>사진: {e.sourceLabel}. 사진·상표의 권리는 해당 권리자에게 있습니다.</p><Link href="/request/edit?tab=platform">틀린 정보나 다른 지역 자료 알려주기 →</Link></section></div><HardwareCollectionEditor catalogId={id} authenticated={Boolean(session?.user?.id)} initial={initial}/></div></article>;
}
