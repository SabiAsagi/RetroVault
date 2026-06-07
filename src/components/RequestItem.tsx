"use client";
import { useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';

import { useSearchParams } from 'next/navigation';

export default function RequestItem() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  
  const initialTab = (searchParams?.get('tab') as 'game' | 'platform' | 'company') || 'game';
  const [requestType, setRequestType] = useState<'game' | 'platform' | 'company'>(initialTab);
  
  const [formData, setFormData] = useState({
    title: '', platform: '', releaseYear: '', developer: '', referenceUrl: '', description: '',
    name: '', manufacturer: '', type: '', country: '', websiteUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType, ...formData })
      });

      if (!res.ok) throw new Error('요청에 실패했습니다.');

      showToast('추가 요청이 접수되었습니다. 관리자 승인 후 반영됩니다.');
      router.push(requestType === 'game' ? '/games' : requestType === 'platform' ? '/platforms' : '/companies');
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[600px] mx-auto px-4 py-8 page-enter min-h-[calc(100vh-64px)]">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-black text-text-primary flex items-center justify-center gap-2 mb-2">
          <PlusCircle className="text-neon-blue" /> 새로운 아카이브 추가 요청
        </h2>
        <p className="text-text-secondary text-sm">찾으시는 정보가 없나요? 등록을 요청해 주시면 확인 후 추가해 드립니다.</p>
      </div>

      <div className="flex bg-vault-surface border border-vault-border rounded-lg p-1 mb-6">
        <button onClick={() => setRequestType('game')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${requestType === 'game' ? 'bg-neon-blue text-vault-bg' : 'text-text-muted hover:text-text-primary'}`}>게임</button>
        <button onClick={() => setRequestType('platform')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${requestType === 'platform' ? 'bg-neon-purple text-vault-bg' : 'text-text-muted hover:text-text-primary'}`}>콘솔</button>
        <button onClick={() => setRequestType('company')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${requestType === 'company' ? 'bg-amber text-vault-bg' : 'text-text-muted hover:text-text-primary'}`}>제작사</button>
      </div>

      <div className="bg-vault-surface border border-vault-border rounded-xl p-6 shadow-xl">
        {error && <div className="mb-4 p-3 bg-coral/10 border border-coral/30 rounded-lg text-coral text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {requestType === 'game' && (
            <>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1">게임명 *</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-neon-blue transition-colors" placeholder="예: Super Mario Bros." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase mb-1">플랫폼 *</label>
                  <input required type="text" value={formData.platform} onChange={e => setFormData({ ...formData, platform: e.target.value })} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-neon-blue transition-colors" placeholder="예: NES" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase mb-1">출시연도 *</label>
                  <input required type="number" value={formData.releaseYear} onChange={e => setFormData({ ...formData, releaseYear: e.target.value })} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-neon-blue transition-colors" placeholder="예: 1985" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1">개발사</label>
                <input type="text" value={formData.developer} onChange={e => setFormData({ ...formData, developer: e.target.value })} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-neon-blue transition-colors" placeholder="예: Nintendo" />
              </div>
            </>
          )}

          {requestType === 'platform' && (
            <>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1">콘솔명 *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-neon-purple transition-colors" placeholder="예: PlayStation 2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase mb-1">제조사 *</label>
                  <input required type="text" value={formData.manufacturer} onChange={e => setFormData({ ...formData, manufacturer: e.target.value })} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-neon-purple transition-colors" placeholder="예: Sony" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase mb-1">출시연도 *</label>
                  <input required type="number" value={formData.releaseYear} onChange={e => setFormData({ ...formData, releaseYear: e.target.value })} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-neon-purple transition-colors" placeholder="예: 2000" />
                </div>
              </div>
            </>
          )}

          {requestType === 'company' && (
            <>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1">회사명 *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-amber transition-colors" placeholder="예: Sega" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase mb-1">유형 *</label>
                  <select required value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-amber transition-colors">
                    <option value="">선택하세요</option>
                    <option value="DEVELOPER">개발사</option>
                    <option value="PUBLISHER">유통사(퍼블리셔)</option>
                    <option value="BOTH">개발/유통 모두</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase mb-1">국가</label>
                  <input type="text" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-amber transition-colors" placeholder="예: Japan" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1">웹사이트</label>
                <input type="url" value={formData.websiteUrl} onChange={e => setFormData({ ...formData, websiteUrl: e.target.value })} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-amber transition-colors" placeholder="예: https://www.sega.com" />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1">
              {requestType === 'game' ? '참고 URL' : '설명'}
            </label>
            {requestType === 'game' ? (
              <input type="url" value={formData.referenceUrl} onChange={e => setFormData({ ...formData, referenceUrl: e.target.value })} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-neon-blue transition-colors" placeholder="예: https://en.wikipedia.org/wiki/..." />
            ) : (
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary resize-none h-20 transition-colors" placeholder="관련 설명을 적어주세요." />
            )}
          </div>

          <div className="pt-4">
            <button type="submit" disabled={isSubmitting} className={`w-full py-3 text-vault-bg font-black rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${requestType === 'game' ? 'bg-neon-blue hover:bg-neon-blue-dim' : requestType === 'platform' ? 'bg-neon-purple hover:bg-neon-purple/80' : 'bg-amber hover:bg-amber/80'}`}>
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <PlusCircle size={18} />}
              요청 제출하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
