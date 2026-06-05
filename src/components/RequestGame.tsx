"use client";
import { useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RequestGame() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    platform: '',
    releaseYear: '',
    developer: '',
    referenceUrl: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/games/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error('요청에 실패했습니다.');
      }

      alert('게임 추가 요청이 접수되었습니다. 관리자 승인 후 반영됩니다.');
      router.push('/games');
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
          <PlusCircle className="text-neon-blue" /> 새로운 게임 추가 요청
        </h2>
        <p className="text-text-secondary text-sm">찾으시는 게임이 없나요? 등록을 요청해 주시면 확인 후 추가해 드립니다.</p>
      </div>

      <div className="bg-vault-surface border border-vault-border rounded-xl p-6 shadow-xl">
        {error && <div className="mb-4 p-3 bg-coral/10 border border-coral/30 rounded-lg text-coral text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1">게임명 *</label>
            <input 
              required
              type="text" 
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-neon-blue transition-colors"
              placeholder="예: Super Mario Bros."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1">플랫폼 *</label>
              <input 
                required
                type="text" 
                value={formData.platform}
                onChange={e => setFormData({ ...formData, platform: e.target.value })}
                className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-neon-blue transition-colors"
                placeholder="예: NES"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1">출시연도 *</label>
              <input 
                required
                type="number" 
                value={formData.releaseYear}
                onChange={e => setFormData({ ...formData, releaseYear: e.target.value })}
                className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-neon-blue transition-colors"
                placeholder="예: 1985"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1">개발사</label>
            <input 
              type="text" 
              value={formData.developer}
              onChange={e => setFormData({ ...formData, developer: e.target.value })}
              className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-neon-blue transition-colors"
              placeholder="예: Nintendo"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1">참고 URL</label>
            <input 
              type="url" 
              value={formData.referenceUrl}
              onChange={e => setFormData({ ...formData, referenceUrl: e.target.value })}
              className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-neon-blue transition-colors"
              placeholder="예: https://en.wikipedia.org/wiki/Super_Mario_Bros."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-1">추가 설명</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-neon-blue resize-none h-24 transition-colors"
              placeholder="게임을 식별하는 데 도움이 될만한 정보를 적어주세요."
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-3 bg-neon-blue text-vault-bg font-black rounded-lg hover:bg-neon-blue-dim transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <PlusCircle size={18} />}
              요청 제출하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
