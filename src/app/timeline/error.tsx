'use client';
import Link from 'next/link';
export default function TimelineError({reset}:{reset:()=>void}){return <div className="chronicle"><h1>연대기를 불러오지 못했어요.</h1><div className="chronicle-empty" role="alert"><p>잠시 후 다시 시도해주세요. 다른 게임 문서는 계속 둘러볼 수 있어요.</p><button onClick={reset}>다시 불러오기</button><Link href="/games">게임 위키로 이동 →</Link></div></div>;}
