import { useState } from 'react';
import { Game, CollectionItem, OwnershipStatus, Condition, Region, PurchaseType, Visibility } from '../types';
import {
  X, Plus, Heart, ChevronRight, Star, Trash2, Library, Info, BookOpen,
  MonitorPlay, Gamepad2, Layers, CheckCircle2, Globe, Clock, DollarSign, Eye, EyeOff, Image as ImageIcon, Milestone, Calendar, Users
} from 'lucide-react';
import { getRarityClass, BoxArtPlaceholder } from './GameCard';

interface GameDetailModalProps {
  game: Game;
  games: Game[];
  collectionItem?: CollectionItem;
  isOwned: boolean;
  onClose: () => void;
  onAddToCollection: (gameId: string) => void;
  onAddToWishlist: (gameId: string) => void;
  onRemoveFromCollection: (gameId: string) => void;
  onUpdateStatus: (gameId: string, status: OwnershipStatus) => void;
  onUpdateMemo: (gameId: string, memo: string) => void;
  onUpdateRating: (gameId: string, rating: number) => void;
  onSelectGame: (game: Game) => void;
  onUpdateCondition?: (gameId: string, condition: Condition) => void;
  onUpdateRegion?: (gameId: string, region: Region) => void;
  onUpdatePurchaseType?: (gameId: string, purchaseType: PurchaseType) => void;
  onUpdatePurchasePrice?: (gameId: string, price: number) => void;
  onUpdatePurchaseDate?: (gameId: string, date: string) => void;
  onUpdatePlayTime?: (gameId: string, hours: number) => void;
  onUpdatePlayStartDate?: (gameId: string, date: string) => void;
  onUpdateClearDate?: (gameId: string, date: string) => void;
  onUpdateVisibility?: (gameId: string, visibility: Visibility) => void;
}

const statuses: OwnershipStatus[] = ['미개봉', '패키지 보유', '단품 보유', '엔딩 완료', '플레이 중', '위시리스트', '판매 완료'];
const conditions: Condition[] = ['Mint', 'Excellent', 'Good', 'Fair', 'Poor'];
const regions: { value: Region; label: string }[] = [
  { value: 'KOR', label: '🇰🇷 한국판' },
  { value: 'JPN', label: '🇯🇵 일본판' },
  { value: 'USA', label: '🇺🇸 북미판' },
  { value: 'EUR', label: '🇪🇺 유럽판' },
  { value: 'OTHER', label: '기타' },
];
const purchaseTypes: { value: PurchaseType; label: string }[] = [
  { value: '패키지', label: '📦 패키지' },
  { value: '다운로드', label: '💻 다운로드' },
  { value: '구독', label: '🔄 구독' },
];

type ModalTab = 'basic' | 'era' | 'media' | 'record';

const countryNames: Record<string, string> = {
  JP: '🇯🇵 일본', US: '🇺🇸 미국', SU: '🇷🇺 소련', GB: '🇬🇧 영국',
  AU: '🇦🇺 호주', CA: '🇨🇦 캐나다', SE: '🇸🇪 스웨덴', EU: '🇪🇺 유럽',
};

export default function GameDetailModal({
  game, games, collectionItem, isOwned, onClose,
  onAddToCollection, onAddToWishlist, onRemoveFromCollection,
  onUpdateStatus, onUpdateMemo, onUpdateRating, onSelectGame,
  onUpdateCondition, onUpdateRegion, onUpdatePurchaseType, onUpdatePurchasePrice, onUpdatePurchaseDate,
  onUpdatePlayTime, onUpdatePlayStartDate, onUpdateClearDate, onUpdateVisibility
}: GameDetailModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>('basic');
  const [selectedScreenshotIndex, setSelectedScreenshotIndex] = useState(0);

  const col = collectionItem;

  const renderBasicTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 max-w-[200px] shrink-0 mx-auto md:mx-0">
          <div className="aspect-[3/4] rounded-lg overflow-hidden border border-vault-border shadow-lg bg-vault-surface relative">
            {game.imageUrl ? (
              <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover" />
            ) : (
              <BoxArtPlaceholder game={game} />
            )}
            <div className="absolute top-2 left-2">
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${getRarityClass(game.rarity)} shadow`}>
                {game.rarity}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-2xl font-black text-white leading-tight mb-2">{game.title}</h2>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-2.5 py-1 rounded bg-mint/10 text-mint text-xs font-bold border border-mint/20">{game.platform}</span>
              <span className="px-2.5 py-1 rounded bg-vault-surface-light border border-vault-border text-text-secondary text-xs">{game.releaseYear}</span>
              <span className="px-2.5 py-1 rounded bg-vault-surface-light border border-vault-border text-text-secondary text-xs">{game.genre}</span>
              {game.country && <span className="px-2.5 py-1 rounded bg-vault-surface-light border border-vault-border text-text-secondary text-xs">{countryNames[game.country] || game.country}</span>}
              {game.rating && (
                <span className="px-2.5 py-1 rounded bg-amber/10 text-amber text-xs font-bold border border-amber/20 flex items-center gap-1">
                  <Star size={10} className="fill-amber" /> {game.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
          
          <div className="bg-vault-surface/50 border border-vault-border/50 rounded-lg p-4 text-sm text-text-secondary leading-relaxed">
            {game.description}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {game.developer && (
              <div className="bg-vault-surface border border-vault-border rounded-lg p-3">
                <span className="text-[10px] text-text-muted block mb-1 font-medium uppercase tracking-wider">Developer</span>
                {game.developerLogoUrl ? (
                  <div className="h-8 flex items-center mb-1">
                    <img src={game.developerLogoUrl} alt={game.developer} className="max-h-full max-w-full object-contain filter drop-shadow brightness-0 invert opacity-80" />
                  </div>
                ) : null}
                <span className="text-xs font-semibold text-white">{game.developer}</span>
              </div>
            )}
            {game.publisher && (
              <div className="bg-vault-surface border border-vault-border rounded-lg p-3">
                <span className="text-[10px] text-text-muted block mb-1 font-medium uppercase tracking-wider">Publisher</span>
                {game.publisherLogoUrl ? (
                  <div className="h-8 flex items-center mb-1">
                    <img src={game.publisherLogoUrl} alt={game.publisher} className="max-h-full max-w-full object-contain filter drop-shadow brightness-0 invert opacity-80" />
                  </div>
                ) : null}
                <span className="text-xs font-semibold text-white">{game.publisher}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderEraTab = () => {
    const eraGames = game.sameEraGames?.map(id => games.find(g => g.id === id)).filter(Boolean) as Game[];
    return (
      <div className="space-y-6">
        {game.historicalNote && (
          <div className="p-4 bg-amber/5 border border-amber/20 rounded-lg flex gap-3">
            <Milestone className="text-amber shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="text-sm font-bold text-amber mb-1">역사적 의의</h4>
              <p className="text-sm text-text-secondary leading-relaxed">{game.historicalNote}</p>
            </div>
          </div>
        )}
        
        {game.historicalContext && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={14} /> 시대적 배경
            </h3>
            <div className="p-4 bg-vault-surface border border-vault-border rounded-lg">
              <p className="text-sm text-text-secondary leading-relaxed">{game.historicalContext}</p>
            </div>
          </div>
        )}

        {game.relatedEvents && game.relatedEvents.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
              <Calendar size={14} /> 주요 사건 ({game.releaseYear}년 전후)
            </h3>
            <div className="space-y-2">
              {game.relatedEvents.map((evt, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-vault-surface border border-vault-border rounded-lg">
                  <span className="text-neon-purple font-pixel text-[10px] mt-0.5">{evt.year}</span>
                  <span className="text-sm text-text-secondary">{evt.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {eraGames && eraGames.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
              <Users size={14} /> 동시대 주요 게임
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {eraGames.map(g => (
                <div key={g.id} onClick={() => onSelectGame(g)} className="bg-vault-surface border border-vault-border rounded p-2 cursor-pointer hover:border-vault-border-light group">
                  <div className="aspect-[3/4] mb-1.5 overflow-hidden rounded bg-vault-bg">
                    {g.imageUrl ? (
                      <img src={g.imageUrl} alt={g.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <BoxArtPlaceholder game={g} />
                    )}
                  </div>
                  <h4 className="text-[9px] text-text-primary truncate">{g.title}</h4>
                </div>
              ))}
            </div>
          </div>
        )}

        {game.competingPlatforms && game.competingPlatforms.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
              <Gamepad2 size={14} /> 경쟁 기종
            </h3>
            <div className="flex flex-wrap gap-2">
              {game.competingPlatforms.map((plat, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-vault-surface border border-vault-border rounded-full text-xs text-text-secondary">
                  {plat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMediaTab = () => {
    if (!game.screenshots || game.screenshots.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ImageIcon size={32} className="text-vault-border-light mb-3" />
          <h3 className="text-text-primary font-bold text-sm mb-1">스크린샷 없음</h3>
          <p className="text-xs text-text-muted">이 게임에 등록된 스크린샷이 없습니다.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black border border-vault-border shadow-inner">
          <img 
            src={game.screenshots[selectedScreenshotIndex]} 
            alt={`${game.title} screenshot ${selectedScreenshotIndex + 1}`} 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {game.screenshots.map((url, idx) => (
            <button 
              key={idx}
              onClick={() => setSelectedScreenshotIndex(idx)}
              className={`shrink-0 w-24 h-16 rounded-md overflow-hidden border-2 transition-all ${
                selectedScreenshotIndex === idx ? 'border-mint opacity-100' : 'border-transparent opacity-50 hover:opacity-100'
              }`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderRecordTab = () => (
    <div className="space-y-6">
      {/* 1. Status Selection */}
      <div className="p-4 bg-vault-surface border border-vault-border rounded-xl space-y-4">
        <h3 className="text-xs font-bold text-text-muted flex items-center gap-1.5"><Library size={14} /> 소장 상태</h3>
        {isOwned ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => onUpdateStatus(game.id, s)}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all border ${
                  col?.status === s ? 'bg-mint/10 text-mint border-mint/30' : 'bg-vault-bg text-text-secondary border-vault-border hover:border-vault-border-light'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => onAddToCollection(game.id)}
              className="flex-1 py-2.5 bg-mint text-vault-bg text-sm font-bold rounded-lg hover:bg-mint-dim transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              내 컬렉션에 추가
            </button>
            <button
              onClick={() => onAddToWishlist(game.id)}
              className="flex-1 py-2.5 bg-vault-surface-light border border-vault-border text-text-primary text-sm font-bold rounded-lg hover:border-vault-border-light transition-colors flex items-center justify-center gap-2"
            >
              <Heart size={16} />
              위시리스트
            </button>
          </div>
        )}
      </div>

      {isOwned && col && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Condition & Region */}
            <div className="p-4 bg-vault-surface border border-vault-border rounded-xl space-y-3">
              <h3 className="text-[10px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1.5">
                <CheckCircle2 size={12} /> 패키지 상태
              </h3>
              <div>
                <select
                  value={col.condition || ''}
                  onChange={e => onUpdateCondition?.(game.id, e.target.value as Condition)}
                  className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-mint/50"
                >
                  <option value="">상태 선택 안함</option>
                  {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <h3 className="text-[10px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1.5 pt-2 border-t border-vault-border/50">
                <Globe size={12} /> 발매 지역판
              </h3>
              <div>
                <select
                  value={col.region || ''}
                  onChange={e => onUpdateRegion?.(game.id, e.target.value as Region)}
                  className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-mint/50"
                >
                  <option value="">지역 선택 안함</option>
                  {regions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>

            {/* Purchase Info */}
            <div className="p-4 bg-vault-surface border border-vault-border rounded-xl space-y-3">
              <h3 className="text-[10px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1.5">
                <DollarSign size={12} /> 가격 및 구매 정보
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="date"
                  value={col.purchaseDate || ''}
                  onChange={e => onUpdatePurchaseDate?.(game.id, e.target.value)}
                  className="bg-vault-bg border border-vault-border rounded-lg px-2 py-2 text-sm text-text-primary focus:outline-none focus:border-mint/50"
                />
                <select
                  value={col.purchaseType || ''}
                  onChange={e => onUpdatePurchaseType?.(game.id, e.target.value as PurchaseType)}
                  className="bg-vault-bg border border-vault-border rounded-lg px-2 py-2 text-sm text-text-primary focus:outline-none focus:border-mint/50"
                >
                  <option value="">구매 경로</option>
                  {purchaseTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-text-muted block mb-1">구매가</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-sm">₩</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={col.purchasePrice || ''}
                      onChange={e => onUpdatePurchasePrice?.(game.id, Number(e.target.value))}
                      className="w-full bg-vault-bg border border-vault-border rounded-lg pl-6 pr-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-mint/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-text-muted block mb-1">현재 추정가 (MVP 시뮬레이션)</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-sm">₩</span>
                    <input
                      type="number"
                      disabled
                      value={col.currentPrice || (col.purchasePrice ? col.purchasePrice * 1.35 : 0)} // 가상의 35% 프리미엄
                      className="w-full bg-vault-bg/50 border border-vault-border/50 rounded-lg pl-6 pr-2 py-1.5 text-sm text-text-muted cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {col.purchasePrice && (
                <div className="flex justify-between items-center bg-vault-bg rounded-lg p-2 border border-vault-border/50 mt-1">
                  <span className="text-xs text-text-muted">추정 수익률</span>
                  <span className="text-sm font-bold text-mint flex items-center gap-1">
                    📈 +35.0%
                  </span>
                </div>
              )}
            </div>

            {/* Play Record */}
            <div className="p-4 bg-vault-surface border border-vault-border rounded-xl space-y-3 md:col-span-2">
              <h3 className="text-[10px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1.5">
                <MonitorPlay size={12} /> 플레이 기록
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-text-muted block mb-1">시작일</label>
                  <input
                    type="date"
                    value={col.playStartDate || ''}
                    onChange={e => onUpdatePlayStartDate?.(game.id, e.target.value)}
                    className="w-full bg-vault-bg border border-vault-border rounded-lg px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-mint/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted block mb-1">클리어일</label>
                  <input
                    type="date"
                    value={col.clearDate || ''}
                    onChange={e => onUpdateClearDate?.(game.id, e.target.value)}
                    className="w-full bg-vault-bg border border-vault-border rounded-lg px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-mint/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted block mb-1">플레이 타임(시간)</label>
                  <input
                    type="number"
                    value={col.playTime || ''}
                    onChange={e => onUpdatePlayTime?.(game.id, Number(e.target.value))}
                    className="w-full bg-vault-bg border border-vault-border rounded-lg px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-mint/50"
                  />
                </div>
              </div>
            </div>

            {/* Personal Rating & Memo */}
            <div className="p-4 bg-vault-surface border border-vault-border rounded-xl space-y-4 md:col-span-2">
              <div>
                <h3 className="text-[10px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1.5 mb-2">
                  <Star size={12} /> 내 평점
                </h3>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => onUpdateRating(game.id, star)}
                      className="p-1 cursor-pointer"
                    >
                      <Star size={24} className={star <= (col.rating || 0) ? 'text-amber fill-amber' : 'text-vault-border-light'} />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-[10px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1.5 mb-2">
                  <BookOpen size={12} /> 수집 메모
                </h3>
                <textarea
                  value={col.memo || ''}
                  onChange={e => onUpdateMemo(game.id, e.target.value)}
                  placeholder="구입처, 게임에 얽힌 추억, 박스 상태 등 메모를 남겨보세요..."
                  className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-mint/50 resize-none h-24"
                />
              </div>

              {/* Visibility & Delete */}
              <div className="pt-2 flex items-center justify-between border-t border-vault-border/50">
                <button
                  onClick={() => onUpdateVisibility?.(game.id, col.visibility === 'public' ? 'private' : 'public')}
                  className="flex items-center gap-1.5 text-xs text-text-muted hover:text-white transition-colors"
                >
                  {col.visibility === 'public' ? <><Eye size={14} /> 공개됨</> : <><EyeOff size={14} /> 비공개</>}
                </button>
                <button
                  onClick={() => onRemoveFromCollection(game.id)}
                  className="text-xs text-coral hover:text-red-400 flex items-center gap-1"
                >
                  <Trash2 size={12} /> 컬렉션에서 삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-vault-bg/90 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-vault-surface border border-vault-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Tabs */}
        <div className="flex items-center justify-between border-b border-vault-border bg-vault-bg/50 pr-2">
          <div className="flex overflow-x-auto scrollbar-none pl-2">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-4 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'basic' ? 'border-mint text-mint' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
            >
              기본 정보
            </button>
            <button
              onClick={() => setActiveTab('era')}
              className={`px-4 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'era' ? 'border-neon-purple text-neon-purple' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
            >
              시대 정보
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`px-4 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'media' ? 'border-neon-blue text-neon-blue' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
            >
              스크린샷
            </button>
            <button
              onClick={() => setActiveTab('record')}
              className={`px-4 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'record' ? 'border-amber text-amber' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
            >
              내 기록
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-vault-surface-light transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {activeTab === 'basic' && renderBasicTab()}
          {activeTab === 'era' && renderEraTab()}
          {activeTab === 'media' && renderMediaTab()}
          {activeTab === 'record' && renderRecordTab()}
        </div>
      </div>
    </div>
  );
}
