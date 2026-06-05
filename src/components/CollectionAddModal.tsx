"use client";
import { useState, useEffect } from 'react';
import { Game, CollectionItem, OwnershipStatus, PlayStatus, Visibility, PurchaseType, Region, Condition } from '@/types';
import { X, Save, Check } from 'lucide-react';
import { updateCollectionItem } from '@/app/actions/collection';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface CollectionAddModalProps {
  game: Game;
  initialItem?: CollectionItem;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CollectionAddModal({ game, initialItem, onClose, onSuccess }: CollectionAddModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    ownershipStatus: initialItem?.ownershipStatus || '미개봉',
    playStatus: initialItem?.playStatus || '미플레이',
    playTime: initialItem?.playTime || 0,
    visibility: initialItem?.visibility || 'public',
    purchaseType: initialItem?.purchaseType || '패키지',
    region: initialItem?.region || 'KOR',
    condition: initialItem?.condition || 'Excellent',
    purchaseDate: initialItem?.purchaseDate || new Date().toISOString().split('T')[0],
    purchasePrice: initialItem?.purchasePrice || 0,
    memo: initialItem?.memo || '',
    rating: initialItem?.rating || 0,
    groupId: '',
  });

  useEffect(() => {
    if (session) {
      fetch('/api/collection-groups')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setGroups(data);
        })
        .catch(console.error);
    }
  }, [session]);

  if (!session) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-vault-surface border border-vault-border rounded-xl p-6 max-w-sm w-full text-center">
          <h3 className="text-xl font-bold text-white mb-2">로그인이 필요합니다</h3>
          <p className="text-sm text-text-muted mb-6">컬렉션에 게임을 추가하려면 먼저 로그인해주세요.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={onClose} className="px-4 py-2 text-sm text-text-secondary hover:text-white transition-colors">취소</button>
            <Link href="/login" className="px-4 py-2 bg-mint text-vault-bg font-bold rounded-lg hover:bg-mint-dim transition-colors">로그인하기</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCollectionItem(game.id, {
        ...formData,
        purchasePrice: Number(formData.purchasePrice) || 0,
        playTime: Number(formData.playTime) || 0,
        rating: Number(formData.rating) || 0,
      });
      if (onSuccess) onSuccess();
      router.refresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert('컬렉션 추가 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-vault-surface border border-vault-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-vault-border bg-vault-bg/50">
          <h3 className="text-lg font-bold text-white truncate pr-4">{initialItem ? '컬렉션 수정' : '컬렉션에 추가'}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-white transition-colors shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 bg-vault-surface-light border-b border-vault-border flex gap-4 items-center">
          {game.imageUrl ? (
            <img src={game.imageUrl} alt={game.title} className="w-12 h-16 object-cover rounded shadow" />
          ) : (
            <div className="w-12 h-16 bg-vault-bg rounded border border-vault-border flex items-center justify-center text-[8px] text-text-muted text-center p-1">
              No Image
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-white line-clamp-2">{game.title}</h4>
            <p className="text-xs text-text-secondary mt-1">{game.platform} · {game.releaseYear}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1.5">소장 상태</label>
              <select 
                value={formData.ownershipStatus} 
                onChange={e => setFormData({...formData, ownershipStatus: e.target.value as OwnershipStatus})}
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-mint"
              >
                <option value="미개봉">미개봉</option>
                <option value="전부 보유">전부 보유</option>
                <option value="일부 누락">일부 누락</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1.5">플레이 상태</label>
              <select 
                value={formData.playStatus} 
                onChange={e => setFormData({...formData, playStatus: e.target.value as PlayStatus})}
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-mint"
              >
                <option value="미플레이">미플레이</option>
                <option value="플레이중">플레이중</option>
                <option value="엔딩 완료">엔딩 완료</option>
                <option value="중단">중단</option>
                <option value="반복 플레이중">반복 플레이중</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1.5">플레이 시간 (시간)</label>
              <input 
                type="number"
                min="0"
                value={formData.playTime} 
                onChange={e => setFormData({...formData, playTime: parseInt(e.target.value) || 0})}
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-mint"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1.5">공개 범위</label>
              <select 
                value={formData.visibility} 
                onChange={e => setFormData({...formData, visibility: e.target.value as Visibility})}
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-mint"
              >
                <option value="public">공개</option>
                <option value="friends">친구 공개</option>
                <option value="private">비공개</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-vault-border">
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1.5">소장 그룹 지정</label>
              <select 
                value={formData.groupId} 
                onChange={e => setFormData({ ...formData, groupId: e.target.value })}
                className="w-full bg-vault-bg border border-vault-border rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-mint"
              >
                <option value="">지정 안 함</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1.5">구매 방식</label>
              <select 
                value={formData.purchaseType} 
                onChange={e => setFormData({...formData, purchaseType: e.target.value as PurchaseType})}
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-mint"
              >
                <option value="패키지">패키지</option>
                <option value="다운로드">다운로드</option>
                <option value="구독">구독</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1.5">지역판</label>
              <select 
                value={formData.region} 
                onChange={e => setFormData({...formData, region: e.target.value as Region})}
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-mint"
              >
                <option value="KOR">KOR (한국)</option>
                <option value="JPN">JPN (일본)</option>
                <option value="USA">USA (북미)</option>
                <option value="EUR">EUR (유럽)</option>
                <option value="OTHER">기타</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1.5">상태(컨디션)</label>
              <select 
                value={formData.condition} 
                onChange={e => setFormData({...formData, condition: e.target.value as Condition})}
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-mint"
              >
                <option value="Mint">Mint (최상)</option>
                <option value="Excellent">Excellent (상)</option>
                <option value="Good">Good (중)</option>
                <option value="Fair">Fair (하)</option>
                <option value="Poor">Poor (불량)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1.5">구매일</label>
              <input 
                type="date" 
                value={formData.purchaseDate} 
                onChange={e => setFormData({...formData, purchaseDate: e.target.value})}
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-mint"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1.5">구매가 (원)</label>
              <input 
                type="number" 
                value={formData.purchasePrice} 
                onChange={e => setFormData({...formData, purchasePrice: parseInt(e.target.value)})}
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-mint"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">개인 평점 (0~5)</label>
            <input 
              type="number" 
              min="0" max="5" step="0.5"
              value={formData.rating} 
              onChange={e => setFormData({...formData, rating: parseFloat(e.target.value)})}
              className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-mint"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">컬렉션 메모</label>
            <textarea 
              value={formData.memo} 
              onChange={e => setFormData({...formData, memo: e.target.value})}
              rows={3}
              placeholder="상태 특이사항, 추억 등..."
              className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-mint resize-none"
            />
          </div>
        </form>

        <div className="p-4 border-t border-vault-border bg-vault-bg flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-text-secondary hover:text-white transition-colors"
          >
            취소
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-mint hover:bg-mint-dim text-vault-bg font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? '저장 중...' : <><Save size={16} /> 저장하기</>}
          </button>
        </div>
      </div>
    </div>
  );
}
