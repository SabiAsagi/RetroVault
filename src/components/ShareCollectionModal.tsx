import { useState, useEffect } from 'react';
import { X, Copy, Check, ExternalLink, Image as ImageIcon, Twitter, Facebook, MessageCircle } from 'lucide-react';
import { Visibility } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface ShareCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  visibility: Visibility;
}

export default function ShareCollectionModal({ isOpen, onClose, visibility }: ShareCollectionModalProps) {
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const username = user?.nickname || 'retro_master';
  
  const [origin, setOrigin] = useState('https://retrovault.io');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const shareUrl = `${origin}/profile/${encodeURIComponent(username)}`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-vault-surface border border-vault-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-vault-border bg-vault-surface-light">
          <h2 className="text-lg font-black text-text-primary flex items-center gap-2">
            <ExternalLink size={20} className="text-neon-blue" />
            내 컬렉션 공유
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {visibility === 'private' && (
            <div className="mb-6 p-4 bg-coral/10 border border-coral/30 rounded-xl">
              <p className="text-sm text-coral font-bold mb-1">현재 컬렉션이 비공개 상태입니다.</p>
              <p className="text-xs text-coral/80">링크를 공유해도 다른 사람이 볼 수 없습니다. 설정에서 전체 공개 또는 친구 공개로 변경해주세요.</p>
            </div>
          )}

          {/* 대표 선반 이미지 프리뷰 (시뮬레이션) */}
          <div className="mb-6 relative aspect-video bg-vault-bg rounded-xl border border-vault-border overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1593118247619-e2d6f056869e?q=80&w=800" alt="Shelf Preview" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
              <h3 className="text-text-primary font-black text-lg">{username}님의 컬렉션</h3>
              <p className="text-mint text-xs font-bold">RetroVault Digital Museum</p>
            </div>
            
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button className="flex items-center gap-2 px-4 py-2 bg-vault-surface border border-vault-border text-text-primary text-sm font-bold rounded-lg hover:text-mint hover:border-mint transition-colors">
                <ImageIcon size={16} /> 대표 이미지 다운로드
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-muted mb-2">공유 링크</label>
              <div className="flex gap-2">
                <div className="flex-1 bg-vault-bg border border-vault-border rounded-lg px-3 py-2.5 text-sm text-text-secondary truncate select-all">
                  {shareUrl}
                </div>
                <button 
                  onClick={handleCopy}
                  className="flex items-center justify-center w-10 shrink-0 bg-vault-surface-light border border-vault-border rounded-lg text-text-primary hover:text-mint transition-colors"
                >
                  {copied ? <Check size={16} className="text-mint" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-vault-border">
              <p className="text-xs font-bold text-text-muted mb-3 text-center">SNS 공유</p>
              <div className="flex justify-center gap-4">
                <button className="w-10 h-10 rounded-full bg-[#1DA1F2] text-text-primary flex items-center justify-center hover:-translate-y-1 transition-transform shadow-lg shadow-[#1DA1F2]/20">
                  <Twitter size={18} />
                </button>
                <button className="w-10 h-10 rounded-full bg-[#1877F2] text-text-primary flex items-center justify-center hover:-translate-y-1 transition-transform shadow-lg shadow-[#1877F2]/20">
                  <Facebook size={18} />
                </button>
                <button className="w-10 h-10 rounded-full bg-[#FEE500] text-[#000000] flex items-center justify-center hover:-translate-y-1 transition-transform shadow-lg shadow-[#FEE500]/20">
                  <MessageCircle size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
