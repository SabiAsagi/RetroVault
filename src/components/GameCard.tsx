"use client";
import { Game, Rarity } from '../types';
import { Plus, Check, Star, Eye } from 'lucide-react';

interface GameCardProps {
  game: Game;
  isOwned: boolean;
  onAddToCollection: (gameId: string) => void;
  onClick?: (game: Game) => void;
}

const PLATFORM_COLORS: Record<string, [string, string]> = {
  'Atari 2600':      ['#8B4513', '#A0522D'],
  'NES':             ['#C41E3A', '#E8273D'],
  'Game Boy':        ['#4A5E3A', '#6B7E57'],
  'Super Famicom':   ['#4B4B8F', '#6B6BB0'],
  'Sega Genesis':    ['#1A1A2E', '#252545'],
  'PlayStation':     ['#003087', '#0040A8'],
  'Nintendo 64':     ['#2B3A2B', '#3A4E3A'],
  'Dreamcast':       ['#CC5500', '#FF6B00'],
  'PlayStation 2':   ['#00439C', '#005ACC'],
  'Nintendo DS':     ['#555555', '#777777'],
  'Nintendo Switch': ['#CC0010', '#E60012'],
  'PlayStation 3':   ['#001E62', '#00287A'],
  'PC':              ['#1E3A5F', '#2A5080'],
  'PlayStation 5':   ['#00439C', '#0060CC'],
};

export function getRarityClass(rarity: Rarity): string {
  const map: Record<Rarity, string> = {
    Common: 'rarity-common',
    Uncommon: 'rarity-uncommon',
    Rare: 'rarity-rare',
    Legendary: 'rarity-legendary',
  };
  return map[rarity];
}

export function BoxArtPlaceholder({ game }: { game: Game }) {
  return <div className="cartridge-art"><span>{game.platform || 'GAME'}</span><div className="cartridge-label"><small>ARCHIVE / {game.releaseYear || '—'}</small><strong>{game.title}</strong><em>게임 위키 · 겜자취</em></div></div>;
}

import { useState, useEffect } from 'react';
import { is19PlusGame, isAgeVerified } from '@/lib/ageVerification';
import { Lock } from 'lucide-react';

export default function GameCard({ game, isOwned, onAddToCollection, onClick }: GameCardProps) {
  const popularity = game.popularity ?? 50;
  const country = game.country;
  const is19 = is19PlusGame(game);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    setVerified(isAgeVerified());
    const handleAgeChange = () => setVerified(isAgeVerified());
    window.addEventListener('ageVerificationChanged', handleAgeChange);
    return () => window.removeEventListener('ageVerificationChanged', handleAgeChange);
  }, []);

  const showBlur = is19 && !verified;

  return (
    <div
      className="game-card bg-vault-surface border border-vault-border rounded-lg overflow-hidden cursor-pointer group"
      role="link" tabIndex={0} aria-label={`${game.title} 문서 읽기`} onKeyDown={e => { if (e.key === 'Enter' && e.target === e.currentTarget) onClick?.(game); }}
      onClick={() => onClick?.(game)}
    >
      {/* Cover Art */}
      <div className="relative overflow-hidden">
        <div className={showBlur ? "blur-md scale-105 filter select-none transition-all duration-300" : ""}>
          {game.imageUrl ? (
            <img src={game.imageUrl} alt={game.title} className="w-full aspect-square object-cover" />
          ) : (
            <BoxArtPlaceholder game={game} />
          )}
        </div>

        {showBlur && (
          <div className="absolute inset-0 bg-vault-bg/60 backdrop-blur-sm flex flex-col items-center justify-center gap-1.5 z-10">
            <div className="w-9 h-9 rounded-full bg-coral/90 border-2 border-white flex items-center justify-center text-white font-black text-xs shadow-lg animate-pulse">
              19
            </div>
            <span className="text-[10px] font-extrabold text-coral bg-vault-bg/80 px-2 py-0.5 rounded border border-coral/30">
              청소년 관람불가
            </span>
          </div>
        )}

        {/* Rarity badge overlay */}
        <div className="absolute top-2 left-2 z-20">
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${getRarityClass(game.rarity)}`}>
            {game.rarity}
          </span>
        </div>

        {/* 19+ Badge (when unblurred or verified) */}
        {is19 && !showBlur && (
          <div className="absolute top-2 left-16 z-20">
            <span className="text-[9px] px-1.5 py-0.5 rounded font-black bg-coral text-white border border-coral/50 shadow-sm">
              19
            </span>
          </div>
        )}

        {/* Owned overlay */}
        {isOwned && (
          <div className="absolute inset-0 bg-mint/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <div className="w-8 h-8 rounded-full bg-mint flex items-center justify-center shadow-lg">
              <Check size={16} className="text-vault-bg" />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5">
        <h3 className="text-xs font-semibold text-text-primary line-clamp-2 break-words h-8 group-hover:text-mint transition-colors leading-tight" title={game.title}>
          {game.title}
        </h3>
        <p className="text-[10px] text-text-muted truncate mt-0.5">{game.platform} · {game.releaseYear}</p>

        <div className="flex items-center justify-between mt-2">
          {/* Rating, Views, and Genre */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0 mr-2">
            <div className="flex items-center gap-0.5 shrink-0 bg-vault-surface-light px-1 py-0.5 rounded border border-vault-border">
              <Star size={9} className="text-amber fill-amber" />
              <span className="text-[9px] font-bold text-text-primary">{game.rating ? game.rating.toFixed(1) : '-'}</span>
            </div>
            <div className="flex items-center gap-0.5 shrink-0 bg-vault-surface-light px-1 py-0.5 rounded border border-vault-border">
              <Eye size={9} className="text-text-muted" />
              <span className="text-[9px] font-bold text-text-secondary">{game.views ?? 0}</span>
            </div>
            <span className="text-[9px] text-text-muted truncate cursor-help" title={game.genre}>{game.genre}</span>
          </div>

          {/* Add button */}
          <button
            onClick={e => { e.stopPropagation(); onAddToCollection(game.id); }}
            className={`min-h-10 min-w-10 rounded-md transition-all cursor-pointer flex items-center justify-center ${
              isOwned
                ? 'bg-mint/20 text-mint border border-mint/30'
                : 'bg-vault-surface-light text-text-muted hover:text-mint hover:bg-mint/10 border border-transparent hover:border-mint/20'
            }`}
            title={isOwned ? '내 다락에 있음' : '내 다락에 담기'}
            aria-label={`${game.title}: ${isOwned ? '내 다락에 있음' : '내 다락에 담기'}`}
          >
            {isOwned ? <Check size={16} /> : <Plus size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

