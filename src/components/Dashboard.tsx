import { Game, CollectionItem, Era } from '../types';
import { Calendar, Heart, Eye, ChevronRight, Star, History, Disc, Trophy, ArrowRight } from 'lucide-react';
import GameCard, { BoxArtPlaceholder } from './GameCard';
import Link from 'next/link';
import { getGameSlug } from '@/lib/slug';

interface DashboardProps {
  games: Game[];
  collection: CollectionItem[];
  historyGame?: Game | null;
  popularCollections?: {
    id: string;
    user: string;
    title: string;
    likes: number;
    views: number;
    type?: 'group' | 'user';
    userImage?: string | null;
    games: Game[];
  }[];
  isOwned: (gameId: string) => boolean;
  onAddToCollection: (gameId: string) => void;
  onTabChange: (tab: 'archive' | 'vault' | 'timeline') => void;
  onEraFilter: (era: Era) => void;
  onSelectCollection?: (id: string, groupId?: string) => void;
  onSelectGame?: (game: Game) => void;
}

export default function Dashboard({ games, collection, historyGame, popularCollections = [], isOwned, onAddToCollection, onSelectGame, onTabChange, onSelectCollection }: DashboardProps) {
  
  // Get recent 6 games from the complete game list to mock "Recently Added" across the platform
  const recentlyAddedGames = [...(games || [])].sort((a, b) => b.releaseYear - a.releaseYear).slice(0, 6);
  
  // Get legendary/rare games for "Recommended Archives"
  const recommendedGames = (games || []).filter(g => g.rarity === 'Legendary' || g.rarity === 'Rare').slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8 page-enter">
      
      {/* ── 1. Hero Banner (Today in History) ────────────────────────────── */}
      <div className="relative rounded-xl overflow-hidden bg-vault-surface border border-vault-border shadow-2xl p-6 md:p-10 group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#020617]" />
        <div className="absolute inset-0 hero-gradient opacity-60 mix-blend-overlay" />
        <div className="absolute inset-0 crt-lines opacity-40 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-mint/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-mint/20 border border-mint/40 text-mint">
              <Calendar size={12} />
            </span>
            <span className="font-pixel text-[10px] text-mint tracking-widest uppercase">
              {(historyGame as any)?.isRandom ? "Admin's Pick" : "Today in History"}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black text-text-primary leading-tight mb-4 tracking-tight">
            {historyGame ? (
              <>
                {historyGame.releaseYear}년 오늘,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-mint via-neon-blue to-neon-purple">
                  {historyGame.title}
                </span>
                <br />
                {(historyGame as any)?.isRandom ? '레트로 명작의 숨결' : (historyGame.country ? `${historyGame.country} 발매` : '발매')}
              </>
            ) : (
              <>
                아카이브의 시작,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-mint via-neon-blue to-neon-purple">
                  레트로 게임의 세계로
                </span>
              </>
            )}
          </h1>
          
          <p className="text-text-secondary text-sm md:text-base mb-6 leading-relaxed bg-black/20 p-4 rounded-lg border border-white/5 backdrop-blur-sm">
            {historyGame 
              ? ((historyGame as any)?.isRandom 
                  ? '오늘 발매된 게임이 없어, 관리자가 추천하는 명작입니다. 게임 역사에 큰 획을 그은 이 타이틀을 아카이브에서 확인해보세요.' 
                  : (historyGame.description || '이 전설적인 타이틀은 게임 역사에 큰 획을 그었습니다. 지금 바로 아카이브에서 확인해보세요.')) 
              : '수많은 명작 게임들이 당신의 컬렉션을 기다리고 있습니다. 첫 게임을 추가해보세요!'}
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Link
              href={historyGame ? `/games/${getGameSlug(historyGame)}` : '/games'}
              className="flex items-center gap-2 px-5 py-2.5 bg-mint text-vault-bg text-sm font-bold rounded-lg hover:bg-mint-dim transition-all shadow-[0_0_15px_rgba(74,237,196,0.3)] hover:shadow-[0_0_25px_rgba(74,237,196,0.5)]"
            >
              <History size={16} />
              관련 아카이브 보기
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. Popular Collections ────────────────────────────────────────── */}
      <div>
        <SectionHeader 
          title="인기 컬렉션" 
          icon={<Heart size={16} className="text-coral" />} 
          subtitle="다른 유저들이 구성한 멋진 컬렉션을 구경해보세요."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {popularCollections.map(col => {
            const colGames = (col.games || []).slice(0, 3); // Show up to 3 games
            
            return (
              <div 
                key={col.id} 
                onClick={() => {
                  const viewUrl = col.type === 'user' ? `/api/users/${col.id}/view` : `/api/collection-groups/${col.id}/view`;
                  fetch(viewUrl, { method: 'POST' }).catch(console.error);
                  if (onSelectCollection) onSelectCollection(col.user, col.type === 'group' ? col.id : undefined);
                  else onTabChange('vault');
                }} 
                className="glass-panel border border-vault-border rounded-xl p-4 hover:border-vault-border-light transition-all cursor-pointer group"
              >
                {/* User Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-vault-border to-vault-surface-light flex items-center justify-center border border-vault-border text-xs font-bold text-text-muted overflow-hidden shrink-0">
                      {col.userImage ? (
                        <img src={col.userImage} alt={col.user} className="w-full h-full object-cover" />
                      ) : (
                        col.user.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary group-hover:text-mint transition-colors">{col.title}</h4>
                      <p className="text-[10px] text-text-muted">by @{col.user}</p>
                    </div>
                  </div>
                  <button className="text-text-muted hover:text-text-primary transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </div>
                
                {/* Thumbnails */}
                <div className="flex gap-2 mb-4 h-24">
                  {colGames.map((g, i) => (
                    <div key={g.id + i} className="flex-1 rounded-md overflow-hidden border border-vault-border shadow-sm h-full">
                      {g.imageUrl ? (
                        <img src={g.imageUrl} alt={g.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <div className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity">
                          <BoxArtPlaceholder game={g} />
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Fill empty spots if less than 3 games */}
                  {Array.from({ length: Math.max(0, 3 - colGames.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="flex-1 rounded-md overflow-hidden border border-vault-border/30 bg-vault-surface-light h-full flex items-center justify-center">
                      <span className="text-text-muted text-xs">?</span>
                    </div>
                  ))}
                </div>
                
                {/* Metrics */}
                <div className="flex items-center gap-4 text-xs text-text-muted border-t border-vault-border/50 pt-3">
                  <span className="flex items-center gap-1.5"><Heart size={12} className="text-coral" /> {col.likes.toLocaleString()}</span>
                  <span className="flex items-center gap-1.5"><Eye size={12} className="text-neon-blue" /> {col.views.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
          {popularCollections.length === 0 && (
            <div className="col-span-3 text-center py-10 text-text-muted border border-dashed border-vault-border/50 rounded-xl">
              아직 등록된 컬렉션이 없습니다. 첫 번째 컬렉션의 주인이 되어보세요!
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── 3. Recently Added Games (List Style) ─────────────────────────── */}
        <div>
          <SectionHeader 
            title="최근 등록 게임" 
            icon={<Disc size={16} className="text-neon-blue" />} 
            subtitle="아카이브에 새롭게 추가된 타이틀"
            action={{ label: '전체 보기', onClick: () => onTabChange('archive') }}
          />
          <div className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden">
            {recentlyAddedGames.map((game, index) => (
              <div 
                key={game.id} 
                onClick={() => onSelectGame?.(game)}
                className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 hover:bg-vault-surface-light transition-colors cursor-pointer group ${
                  index !== recentlyAddedGames.length - 1 ? 'border-b border-vault-border/60' : ''
                }`}
              >
                <div className="w-12 h-16 md:w-14 md:h-18 rounded overflow-hidden shrink-0 shadow border border-vault-border bg-vault-bg">
                   {game.imageUrl ? (
                    <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover" />
                  ) : (
                    <BoxArtPlaceholder game={game} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-text-primary truncate group-hover:text-neon-blue transition-colors mb-1">
                    {game.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 bg-vault-bg border border-vault-border text-text-secondary text-[10px] rounded shrink-0">
                      {game.platform}
                    </span>
                    <span className="text-[10px] text-text-muted shrink-0">
                      {game.releaseYear}
                    </span>
                  </div>
                </div>
                
                <div className="shrink-0 flex flex-col items-end hidden sm:flex">
                  <span className="text-xs text-text-muted mb-1">{game.genre}</span>
                  {game.popularity && (
                    <div className="flex items-center gap-0.5">
                      <Star size={10} className="text-amber fill-amber" />
                      <span className="text-[10px] text-text-secondary font-medium">{game.popularity}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. Recommended Archives ───────────────────────────────────────── */}
        <div>
          <SectionHeader 
            title="추천 아카이브" 
            icon={<Trophy size={16} className="text-amber" />} 
            subtitle="역사적으로 의미 있는 기념비적 타이틀"
          />
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {recommendedGames.map(game => (
              <GameCard 
                key={game.id} 
                game={game} 
                isOwned={isOwned(game.id)} 
                onAddToCollection={onAddToCollection} 
                onClick={onSelectGame} 
              />
            ))}
          </div>
          
          <button 
            onClick={() => onTabChange('archive')}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 bg-vault-surface border border-vault-border rounded-xl text-sm font-bold text-text-secondary hover:text-text-primary hover:border-vault-border-light hover:bg-vault-surface-light transition-all group"
          >
            아카이브 전체 탐색하기
            <ArrowRight size={16} className="text-text-muted group-hover:text-mint transition-colors group-hover:translate-x-1" />
          </button>
        </div>
      </div>
      
    </div>
  );
}

function SectionHeader({ title, icon, subtitle, action }: {
  title: string;
  icon: React.ReactNode;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex items-end justify-between mb-4 border-b border-vault-border/50 pb-2">
      <div>
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-1">
          {icon}
          {title}
        </h2>
        {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="text-xs font-medium text-text-muted hover:text-mint flex items-center gap-0.5 cursor-pointer transition-colors"
        >
          {action.label} <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}
