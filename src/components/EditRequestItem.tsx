"use client";
import { useState, useEffect } from 'react';
import { Edit3, Loader2, Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';

export default function EditRequestItem() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  
  const initialTab = (searchParams?.get('tab') as 'game' | 'platform' | 'company') || 'platform';
  const [requestType, setRequestType] = useState<'game' | 'platform' | 'company'>(initialTab);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const [formData, setFormData] = useState<any>({});
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSelectedItem(null);
    setSearchQuery('');
    setSearchResults([]);
    setFormData({});
  }, [requestType]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=${requestType}`);
          if (res.ok) {
            const data = await res.json();
            const results = requestType === 'game' ? data.games : requestType === 'platform' ? data.platforms : data.companies;
            setSearchResults(results || []);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, requestType]);

  const handleSelect = (item: any) => {
    setSelectedItem(item);
    setFormData({ ...item });
    setSearchQuery(item.name || item.title);
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsSubmitting(true);
    setError('');

    // Compute delta or just send full modified form data. We send full form data.
    const proposedData = { ...formData };
    delete proposedData.id;
    delete proposedData.createdAt;
    delete proposedData.updatedAt;
    delete proposedData.status;

    try {
      const res = await fetch('/api/request/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          targetType: requestType.toUpperCase(),
          targetId: selectedItem.id,
          proposedData,
          reason
        })
      });

      if (!res.ok) throw new Error('요청에 실패했습니다.');

      showToast('수정 건의가 접수되었습니다. 관리자 승인 후 반영됩니다.');
      router.push(requestType === 'game' ? '/games' : requestType === 'platform' ? '/platforms' : '/companies');
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-[600px] mx-auto px-4 py-8 page-enter min-h-[calc(100vh-64px)]">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-black text-text-primary flex items-center justify-center gap-2 mb-2">
          <Edit3 className="text-neon-purple" /> 기존 아카이브 수정 건의
        </h2>
        <p className="text-text-secondary text-sm">정보가 틀렸거나 내용 보강이 필요한가요? 직접 수정해서 건의해 주세요.</p>
      </div>

      <div className="flex bg-vault-surface border border-vault-border rounded-lg p-1 mb-6">
        <button onClick={() => setRequestType('game')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${requestType === 'game' ? 'bg-neon-blue text-vault-bg' : 'text-text-muted hover:text-text-primary'}`}>게임</button>
        <button onClick={() => setRequestType('platform')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${requestType === 'platform' ? 'bg-neon-purple text-vault-bg' : 'text-text-muted hover:text-text-primary'}`}>콘솔</button>
        <button onClick={() => setRequestType('company')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${requestType === 'company' ? 'bg-amber text-vault-bg' : 'text-text-muted hover:text-text-primary'}`}>제작사</button>
      </div>

      <div className="bg-vault-surface border border-vault-border rounded-xl p-6 shadow-xl relative">
        {!selectedItem && (
          <div className="mb-6 relative">
            <label className="block text-xs font-bold text-text-muted uppercase mb-1">수정할 대상 검색 *</label>
            <div className="relative">
              <input 
                type="text" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 pl-10 text-sm text-text-primary focus:border-neon-purple transition-colors" 
                placeholder="이름을 2글자 이상 입력하세요" 
              />
              <Search className="absolute left-3 top-3.5 text-text-muted" size={16} />
              {isSearching && <Loader2 className="absolute right-3 top-3.5 text-text-muted animate-spin" size={16} />}
            </div>
            
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-vault-bg border border-vault-border rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-4 py-3 text-sm text-text-primary hover:bg-vault-surface border-b border-vault-border last:border-0"
                  >
                    {item.name || item.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedItem && (
          <div>
            <div className="flex items-center justify-between mb-4 bg-vault-bg p-3 rounded-lg border border-vault-border">
              <span className="text-sm font-bold text-text-primary">수정 대상: <span className="text-neon-purple">{selectedItem.name || selectedItem.title}</span></span>
              <button onClick={() => setSelectedItem(null)} className="text-xs text-text-muted hover:text-text-primary underline">다른 대상 선택</button>
            </div>

            {error && <div className="mb-4 p-3 bg-coral/10 border border-coral/30 rounded-lg text-coral text-sm">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {requestType === 'game' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-1">게임명</label>
                    <input type="text" value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-neon-blue transition-colors" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase mb-1">출시연도</label>
                      <input type="number" value={formData.releaseYear || ''} onChange={e => handleChange('releaseYear', parseInt(e.target.value))} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-neon-blue transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase mb-1">장르</label>
                      <input type="text" value={formData.genre || ''} onChange={e => handleChange('genre', e.target.value)} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-neon-blue transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-1">설명</label>
                    <textarea value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary resize-none h-24 transition-colors" />
                  </div>
                </>
              )}

              {requestType === 'platform' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-1">콘솔명</label>
                    <input type="text" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-neon-purple transition-colors" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase mb-1">제조사</label>
                      <input type="text" value={formData.manufacturer || ''} onChange={e => handleChange('manufacturer', e.target.value)} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-neon-purple transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase mb-1">출시연도</label>
                      <input type="number" value={formData.releaseYear || ''} onChange={e => handleChange('releaseYear', parseInt(e.target.value))} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-neon-purple transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase mb-1">세대</label>
                      <input type="number" value={formData.generation || ''} onChange={e => handleChange('generation', parseInt(e.target.value))} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-neon-purple transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase mb-1">국가</label>
                      <input type="text" value={formData.country || ''} onChange={e => handleChange('country', e.target.value)} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-neon-purple transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-1">상세 설명</label>
                    <textarea value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary resize-none h-24 transition-colors" />
                  </div>
                </>
              )}

              {requestType === 'company' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-1">회사명</label>
                    <input type="text" value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-amber transition-colors" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase mb-1">국가</label>
                      <input type="text" value={formData.country || ''} onChange={e => handleChange('country', e.target.value)} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-amber transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-muted uppercase mb-1">웹사이트</label>
                      <input type="url" value={formData.websiteUrl || ''} onChange={e => handleChange('websiteUrl', e.target.value)} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-amber transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase mb-1">설명</label>
                    <textarea value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary resize-none h-24 transition-colors" />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1">건의 사유 (선택)</label>
                <input type="text" value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:border-neon-purple transition-colors" placeholder="예: 잘못된 정보 수정, 정보 추가 등" />
              </div>

              <div className="pt-4">
                <button type="submit" disabled={isSubmitting} className={`w-full py-3 text-vault-bg font-black rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${requestType === 'game' ? 'bg-neon-blue hover:bg-neon-blue-dim' : requestType === 'platform' ? 'bg-neon-purple hover:bg-neon-purple/80' : 'bg-amber hover:bg-amber/80'}`}>
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Edit3 size={18} />}
                  수정 건의 제출하기
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
