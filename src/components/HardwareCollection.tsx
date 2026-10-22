import Link from 'next/link';
import { getHardware, type HardwareRecord } from '@/lib/hardware';
import { HardwarePhoto } from './PlatformHardware';

export default function HardwareCollection({records}:{records:HardwareRecord[]}){
 const owned=records.filter(r=>r.status==='OWNED');const wish=records.filter(r=>r.status==='WISHLIST');
 return <section className="hardware-vault"><div className="hardware-section-heading"><div><p className="directory-eyebrow">나만 보는 소장 기록</p><h1>내 다락의 기기들</h1><p>보유 {owned.length}종 · {owned.reduce((n,r)=>n+r.quantity,0)}대 / 위시 {wish.length}종</p></div><Link className="wiki-button" href="/platforms">도감에서 기기 찾기 →</Link></div>{records.length?(['OWNED','WISHLIST'] as const).map(status=><section key={status}><h2>{status==='OWNED'?'가지고 있는 기기':'갖고 싶은 기기'}</h2><div className="hardware-grid">{records.filter(r=>r.status===status).map(r=>{const e=getHardware(r.catalogId);return e?<Link key={r.catalogId} className="hardware-card" href={`/hardware/${e.id}`}><HardwarePhoto entry={e}/><div className="hardware-card-content"><h3>{e.name}</h3><span>{status==='OWNED'?'보유 중':'위시리스트'} · 수량 {r.quantity}</span>{r.memo&&<p className="hardware-memo">{r.memo}</p>}<strong>기록 수정하기 →</strong></div></Link>:null;})}</div></section>):<div className="directory-empty"><h2>기기를 위한 자리도 마련했어요.</h2><p>플랫폼 도감에서 모델·에디션·색상을 고르고 내 다락에 담아보세요.</p><Link href="/platforms">첫 기기 찾아보기 →</Link></div>}</section>;
}
