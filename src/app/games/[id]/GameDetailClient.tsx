"use client";
import { Game } from "@/types";
import { ArrowLeft, Calendar, Star, Package, Book, CheckSquare, Plus, Check } from "lucide-react";
import Link from "next/link";
import { BoxArtPlaceholder } from "@/components/GameCard";
import { useState } from "react";
import CollectionAddModal from "@/components/CollectionAddModal";
import { useSession } from "next-auth/react";

export default function GameDetailClient({ game }: { game: Game }) {
  const [activeTab, setActiveTab] = useState<'info'|'era'>('info');
  const [showAddModal, setShowAddModal] = useState(false);
  const { data: session } = useSession();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 page-enter min-h-[calc(100vh-64px)] space-y-6">
      <Link href="/games" className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-white transition-colors">
        <ArrowLeft size={16} /> 아카이브로 돌아가기
      </Link>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Cover Art */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">
          <div className="rounded-xl overflow-hidden shadow-2xl border border-vault-border">
            {game.imageUrl ? (
              <img src={game.imageUrl} alt={game.title} className="w-full aspect-[3/4] object-cover" />
            ) : (
              <BoxArtPlaceholder game={game} />
            )}
          </div>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-mint hover:bg-mint-dim text-vault-bg font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(74,237,196,0.3)] hover:shadow-[0_0_25px_rgba(74,237,196,0.5)]"
          >
            <Plus size={18} /> 내 컬렉션에 추가
          </button>
        </div>

        {/* Right: Info */}
        <div className="flex-1 space-y-6 min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2 py-1 bg-vault-surface-light border border-vault-border rounded text-xs font-bold text-text-secondary">
                {game.platform}
              </span>
              <span className="px-2 py-1 bg-vault-surface-light border border-vault-border rounded text-xs font-bold text-text-secondary">
                {game.releaseDate ? game.releaseDate : `${game.releaseYear}년`}
              </span>
              {game.country && (
                <span className="px-2 py-1 bg-vault-surface-light border border-vault-border rounded text-xs font-bold text-text-secondary">
                  {game.country}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black text-white leading-tight break-words">{game.title}</h1>
            <p className="text-sm text-text-muted mt-2">{game.developer ? `${game.developer} / ` : ''}{game.publisher}</p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-6 p-4 bg-vault-surface border border-vault-border rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center text-amber">
                <Star size={20} className="fill-amber" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-muted">평점</p>
                <p className="text-lg font-black text-white">{game.rating || '-'}</p>
              </div>
            </div>
            <div className="h-10 w-px bg-vault-border" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neon-blue/10 flex items-center justify-center text-neon-blue">
                <Package size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-text-muted">인기도</p>
                <p className="text-lg font-black text-white">{game.popularity || '-'}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div>
            <div className="flex gap-1 border-b border-vault-border mb-4">
              <button 
                onClick={() => setActiveTab('info')}
                className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'info' ? 'border-mint text-mint' : 'border-transparent text-text-muted hover:text-white'}`}
              >
                기본 정보
              </button>
              <button 
                onClick={() => setActiveTab('era')}
                className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'era' ? 'border-mint text-mint' : 'border-transparent text-text-muted hover:text-white'}`}
              >
                시대 정보
              </button>
            </div>

            <div className="text-sm text-text-secondary leading-relaxed bg-vault-surface border border-vault-border p-5 rounded-xl whitespace-pre-line">
              {activeTab === 'info' ? (
                <p>{game.description || '상세 설명이 없습니다.'}</p>
              ) : (
                <p>{game.historicalContext || '시대 정보가 없습니다.'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <CollectionAddModal 
          game={game} 
          onClose={() => setShowAddModal(false)} 
        />
      )}
    </div>
  );
}
