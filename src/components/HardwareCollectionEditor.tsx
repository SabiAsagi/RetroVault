'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveHardwareCollection, removeHardwareCollection } from '@/app/actions/hardware';
import type { HardwareRecord } from '@/lib/hardware';

export default function HardwareCollectionEditor({ catalogId, authenticated, initial }: { catalogId: string; authenticated: boolean; initial?: HardwareRecord }) {
  const router = useRouter();
  const [status, setStatus] = useState<HardwareRecord['status']>(initial?.status || 'OWNED');
  const [quantity, setQuantity] = useState(String(initial?.quantity || 1));
  const [memo, setMemo] = useState(initial?.memo || '');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(false);
  if (!authenticated) return <section className="hardware-save"><h2>이 기기를 내 다락에</h2><p>보유한 기기와 갖고 싶은 기기를 따로 기록해요. 기록은 본인만 볼 수 있어요.</p><Link className="wiki-button" href={`/login?callbackUrl=${encodeURIComponent(`/hardware/${catalogId}`)}`}>로그인하고 기기 담기 →</Link></section>;
  return <section className="hardware-save"><h2>{initial ? '내 기기 기록 수정' : '이 기기를 내 다락에'}</h2><p>나만 보는 기기 기록 · 게임 소장 기록과 따로 저장돼요.</p><form onSubmit={async e => {
    e.preventDefault(); setBusy(true); setFeedback('');
    try { const result = await saveHardwareCollection({ catalogId, status, quantity: Number(quantity), memo }); setFeedback(result.ok ? '내 다락에 저장했어요.' : result.error || '저장하지 못했어요.'); if (result.ok) router.refresh(); }
    catch { setFeedback('연결을 확인한 뒤 다시 시도해주세요.'); } finally { setBusy(false); }
  }}><div className="hardware-form-row"><label>소장 상태<select value={status} onChange={e => setStatus(e.target.value as HardwareRecord['status'])}><option value="OWNED">보유 중</option><option value="WISHLIST">위시리스트</option></select></label><label>수량<input type="number" min={1} max={99} required value={quantity} onChange={e => setQuantity(e.target.value)} /></label></div><label>나만의 메모<textarea maxLength={2000} rows={3} value={memo} onChange={e => setMemo(e.target.value)} placeholder="구입한 곳, 구성품이나 소중한 기억을 적어보세요." /></label><span className="hardware-note">{memo.length.toLocaleString()} / 2,000자</span><div className="hardware-actions"><button className="wiki-button" disabled={busy} type="submit">{busy ? '처리 중…' : initial ? '기록 수정하기' : '내 다락에 저장'}</button><Link href="/collection?tab=hardware">내 기기 보러 가기 →</Link></div></form><p role="status" aria-live="polite">{feedback}</p>{initial && <div className="hardware-remove">{confirmRemove ? <><p>이 기기의 소장 기록과 메모를 지울까요?</p><button disabled={busy} onClick={async () => { setBusy(true); try { const r=await removeHardwareCollection(catalogId); if(r.ok){router.replace('/collection?tab=hardware');router.refresh();}else setFeedback(r.error || '지우지 못했어요.'); }catch{setFeedback('연결을 확인해주세요.');}finally{setBusy(false);} }}>기록 지우기</button><button disabled={busy} onClick={() => setConfirmRemove(false)}>취소</button></> : <button disabled={busy} onClick={() => setConfirmRemove(true)}>소장 기록에서 빼기</button>}</div>}</section>;
}
