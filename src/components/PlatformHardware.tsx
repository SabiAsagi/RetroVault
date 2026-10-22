'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Monitor, ArrowRight } from 'lucide-react';
import { hardwareKindLabels, type HardwareEntry, type HardwareKind } from '@/lib/hardware';

export function HardwarePhoto({ entry }: { entry: HardwareEntry }) {
  const [failed,setFailed]=useState(false);
  return <div className="hardware-photo"><div className="hardware-photo-stage">{entry.image && !failed ? <img src={entry.image} alt={entry.name} loading="lazy" onError={()=>setFailed(true)} /> : <div className="hardware-photo-fallback"><Monitor size={32} aria-hidden="true"/><span>사진 준비 중</span></div>}</div></div>;
}
export default function PlatformHardware({ entries, legacyNames }: { entries: HardwareEntry[]; legacyNames: string[] }) {
  const [tab,setTab]=useState<'models'|'accessories'>('models');
  const [filter,setFilter]=useState<HardwareKind|'all'>('all');
  const visible=entries.filter(e=>tab==='accessories'?e.kinds.includes('accessory'):!e.kinds.includes('accessory')&&(filter==='all'||e.kinds.includes(filter)));
  return <section id="platform-hardware" className="hardware-section"><div className="hardware-section-heading"><div><p className="directory-eyebrow">기기를 더 자세히</p><h2>모델과 함께 쓰는 것들</h2></div><Link href="/collection?tab=hardware">내 기기 기록 →</Link></div><div className="directory-tabs" role="group" aria-label="기기 기록 종류"><button aria-pressed={tab==='models'} onClick={()=>setTab('models')}>모델·에디션</button><button aria-pressed={tab==='accessories'} onClick={()=>setTab('accessories')}>주변기기</button></div>{tab==='models'&&<><p className="hardware-note">Slim·Pro 같은 개선 모델, 특별한 디자인, 게임 동봉 패키지, 본체 색상을 구분해요.</p><div className="hardware-filters" role="group" aria-label="모델 분류">{(['all','model','edition','bundle','color'] as const).map(k=><button key={k} aria-pressed={filter===k} onClick={()=>setFilter(k)}>{k==='all'?'전체':hardwareKindLabels[k]}</button>)}</div></>}
    <div className="hardware-grid">{visible.map(e=><Link className="hardware-card" key={e.id} href={`/hardware/${e.id}`}><HardwarePhoto entry={e}/><div className="hardware-card-content"><div className="entity-badges">{e.kinds.map(k=><span key={k}>{hardwareKindLabels[k]}</span>)}</div><h3>{e.name}</h3><p>{e.summary}</p><span className="hardware-note">{e.releaseDate || '출시일 확인 중'} · {e.region}</span><strong>상세 정보와 소장 기록 <ArrowRight size={15}/></strong></div></Link>)}</div>
    {!visible.length&&<div className="directory-empty"><h3>이 분류의 자료를 모으고 있어요.</h3><p>공식 출처를 확인한 기록부터 차근차근 채웁니다.</p><Link href="/request?tab=platform">자료 보태기 →</Link></div>}
    {tab==='models'&&legacyNames.length>0&&<details className="hardware-legacy"><summary>기존 문서에 적힌 다른 모델명</summary><p>아래 이름은 기존 문서의 기록입니다. 상세 사양과 출시 정보는 확인이 필요해요.</p><ul>{legacyNames.map((n,i)=><li key={`${n}-${i}`}>{n}</li>)}</ul><Link href="/request/edit?tab=platform">모델 자료 보태기 →</Link></details>}
    <p className="hardware-note">전체 모델 목록이 아닙니다. 각 상세 문서에서 자료 출처와 확인일을 볼 수 있어요. 제품 사진과 상표의 권리는 해당 권리자에게 있습니다.</p>
  </section>;
}
