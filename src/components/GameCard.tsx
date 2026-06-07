"use client";
import { Game, Rarity } from '../types';
import { Plus, Check, Star } from 'lucide-react';

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
  const [c1, c2] = PLATFORM_COLORS[game.platform] ?? ['#243550', '#314869'];

  const genre = (game.genre || 'UNK').slice(0, 3).toUpperCase();
  const year = String(game.releaseYear || '').slice(2);

  return (
    <div
      className="box-art-placeholder w-full aspect-[3/4]"
      style={{ background: `linear-gradient(145deg, ${c1} 0%, ${c2} 100%)` }}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 px-2 py-1.5 flex items-center justify-between">
        <span className="font-pixel text-[5px] text-text-primary/40">{(game.platform || 'UNK').slice(0, 8)}</span>
        <span className="font-pixel text-[5px] text-text-primary/40">'{year}</span>
      </div>

      {/* Center content */}
      <div className="z-10 relative text-center px-3">
        {/* Genre badge */}
        <div
          className="inline-block px-1.5 py-0.5 rounded text-[6px] font-pixel mb-2 text-text-primary/70"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {genre}
        </div>

        {/* Title */}
        <p className="font-pixel text-[6px] leading-relaxed text-text-primary/90 break-words line-clamp-4">
          {game.title}
        </p>

        {/* Publisher */}
        <p className="text-[8px] text-text-primary/50 mt-2 truncate">{game.publisher}</p>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 opacity-40"
        style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)` }}
      />
    </div>
  );
}

export default function GameCard({ game, isOwned, onAddToCollection, onClick }: GameCardProps) {
  const popularity = game.popularity ?? 50;
  const country = game.country;
  const countryFlag: Record<string, string> = {
    JP: '🇯🇵', US: '🇺🇸', SU: '🇷🇺', GB: '🇬🇧', AU: '🇦🇺', CA: '🇨🇦', SE: '🇸🇪', EU: '🇪🇺',
  };

  return (
    <div
      className="game-card bg-vault-surface border border-vault-border rounded-lg overflow-hidden cursor-pointer group"
      onClick={() => onClick?.(game)}
    >
      {/* Cover Art */}
      <div className="relative">
        {game.imageUrl ? (
          <img src={game.imageUrl} alt={game.title} className="w-full aspect-[3/4] object-cover" />
        ) : (
          <BoxArtPlaceholder game={game} />
        )}

        {/* Rarity badge overlay */}
        <div className="absolute top-2 left-2">
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${getRarityClass(game.rarity)}`}>
            {game.rarity}
          </span>
        </div>

        {/* Country flag */}
        {country && countryFlag[country] && (
          <div className="absolute top-2 right-2 text-sm leading-none" title={country}>
            {countryFlag[country]}
          </div>
        )}

        {/* Owned overlay */}
        {isOwned && (
          <div className="absolute inset-0 bg-mint/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
          {/* Rating and Genre */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0 mr-2">
            <div className="flex items-center gap-0.5 shrink-0 bg-vault-surface-light px-1 py-0.5 rounded border border-vault-border">
              <Star size={9} className="text-amber fill-amber" />
              <span className="text-[9px] font-bold text-text-primary">{game.rating ? game.rating.toFixed(1) : '-'}</span>
            </div>
            <span className="text-[9px] text-text-muted truncate">{game.genre}</span>
          </div>

          {/* Add button */}
          <button
            onClick={e => { e.stopPropagation(); onAddToCollection(game.id); }}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              isOwned
                ? 'bg-mint/20 text-mint border border-mint/30'
                : 'bg-vault-surface-light text-text-muted hover:text-mint hover:bg-mint/10 border border-transparent hover:border-mint/20'
            }`}
            title={isOwned ? '컬렉션에 있음' : '컬렉션에 추가'}
          >
            {isOwned ? <Check size={12} /> : <Plus size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
}
