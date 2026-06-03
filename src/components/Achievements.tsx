"use client";
import { useState } from 'react';
import { Trophy, Star, History, Layers, Gamepad2, Disc, Package, X, Lock, CheckCircle2, ChevronRight } from 'lucide-react';
import { CollectionItem, Game } from '../types';
import { calculateEmblems, Emblem } from '../lib/emblems';

interface AchievementsProps {
  collection: CollectionItem[];
  games: Game[];
}

export default function Achievements({ collection, games }: AchievementsProps) {
  const [selectedEmblem, setSelectedEmblem] = useState<Emblem | null>(null);

  const emblems = calculateEmblems(collection, games);

  const getIcon = (iconName: string, className = '') => {
    switch (iconName) {
      case 'star': return <Star className={className} />;
      case 'history': return <History className={className} />;
      case 'layers': return <Layers className={className} />;
      case 'gamepad': return <Gamepad2 className={className} />;
      case 'disc': return <Disc className={className} />;
      case 'package': return <Package className={className} />;
      default: return <Trophy className={className} />;
    }
  };

  const unlockedEmblems = emblems.filter(e => e.isUnlocked);
  const inProgressEmblems = emblems.filter(e => !e.isUnlocked && e.currentCount > 0);
  const lockedEmblems = emblems.filter(e => !e.isUnlocked && e.currentCount === 0);

  const renderEmblemCard = (emblem: Emblem, state: 'unlocked' | 'progress' | 'locked') => {
    const progressPercent = Math.min(100, Math.max(0, (emblem.currentCount / emblem.targetCount) * 100));
    
    let containerClass = "bg-vault-surface border rounded-xl p-4 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ";
    let iconContainerClass = "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ";
    
    if (state === 'unlocked') {
      containerClass += `border-vault-border hover:border-vault-border-light shadow-md overflow-hidden relative`;
      iconContainerClass += `bg-opacity-20 ${emblem.colorClass} shadow-[0_0_15px_rgba(255,255,255,0.1)]`;
    } else if (state === 'progress') {
      containerClass += "border-vault-border hover:border-vault-border-light";
      iconContainerClass += "bg-vault-surface-light border-vault-border text-text-primary";
    } else {
      containerClass += "border-vault-border/50 opacity-60 hover:opacity-80 grayscale hover:grayscale-0";
      iconContainerClass += "bg-vault-surface-light border-vault-border/50 text-text-muted";
    }

    return (
      <div key={emblem.id} className={containerClass} onClick={() => setSelectedEmblem(emblem)}>
        {state === 'unlocked' && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        )}
        
        <div className="flex gap-4 items-start relative z-10">
          <div className={iconContainerClass}>
            {state === 'locked' ? <Lock size={20} /> : getIcon(emblem.iconName, state === 'unlocked' ? 'w-6 h-6' : 'w-6 h-6')}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-black text-sm truncate mb-1 ${state === 'unlocked' ? 'text-white' : 'text-text-primary'}`}>
              {emblem.name}
            </h3>
            <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed mb-3">
              {emblem.description}
            </p>
            
            {state !== 'unlocked' && (
              <div className="space-y-1.5 mt-auto">
                <div className="flex justify-between text-[10px] font-bold text-text-muted">
                  <span>진행률</span>
                  <span>{emblem.currentCount} / {emblem.targetCount}</span>
                </div>
                <div className="h-1.5 bg-vault-bg rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${state === 'progress' ? emblem.colorClass.split(' ')[0].replace('text-', 'bg-') : 'bg-vault-border'}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
            
            {state === 'unlocked' && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-mint mt-auto">
                <CheckCircle2 size={12} />
                달성 완료
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 page-enter min-h-[calc(100vh-64px)]">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3 mb-2">
          <Trophy className="text-amber" size={28} />
          수집가 업적
        </h2>
        <p className="text-sm text-text-secondary">컬렉션을 채워나가며 특별한 엠블럼과 보상을 획득하세요.</p>
        
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="bg-vault-surface border border-vault-border rounded-lg px-4 py-3 flex items-center gap-4">
            <div className="text-center">
              <p className="text-[10px] font-bold text-text-muted uppercase mb-0.5">총 업적</p>
              <p className="text-xl font-black text-white">{emblems.length}</p>
            </div>
            <div className="w-px h-8 bg-vault-border" />
            <div className="text-center">
              <p className="text-[10px] font-bold text-text-muted uppercase mb-0.5">달성률</p>
              <p className="text-xl font-black text-mint">{Math.round((unlockedEmblems.length / emblems.length) * 100)}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {unlockedEmblems.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-mint" /> 획득한 업적
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedEmblems.map(e => renderEmblemCard(e, 'unlocked'))}
            </div>
          </section>
        )}

        {inProgressEmblems.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" /> 진행 중인 업적
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inProgressEmblems.map(e => renderEmblemCard(e, 'progress'))}
            </div>
          </section>
        )}

        {lockedEmblems.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <h3 className="text-sm font-bold text-text-muted mb-4 flex items-center gap-2">
              <Lock size={16} /> 잠긴 업적
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lockedEmblems.map(e => renderEmblemCard(e, 'locked'))}
            </div>
          </section>
        )}
      </div>

      {/* Detail Modal */}
      {selectedEmblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div 
            className="bg-vault-surface border border-vault-border rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header Background */}
            <div className={`h-24 absolute top-0 inset-x-0 opacity-20 ${selectedEmblem.colorClass.split(' ')[0].replace('text-', 'bg-')}`} />
            
            <button 
              onClick={() => setSelectedEmblem(null)}
              className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors z-10 bg-black/20 p-1.5 rounded-full"
            >
              <X size={16} />
            </button>
            
            <div className="p-6 md:p-8 relative z-10 mt-4 flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 border-2 shadow-lg
                ${selectedEmblem.isUnlocked 
                  ? `${selectedEmblem.colorClass} bg-vault-surface-light shadow-[0_0_30px_rgba(255,255,255,0.15)]` 
                  : 'border-vault-border bg-vault-bg text-text-muted'}`}
              >
                {selectedEmblem.isUnlocked ? getIcon(selectedEmblem.iconName, 'w-10 h-10') : <Lock size={32} />}
              </div>
              
              <h2 className={`text-2xl font-black mb-2 ${selectedEmblem.isUnlocked ? 'text-white' : 'text-text-primary'}`}>
                {selectedEmblem.name}
              </h2>
              
              <p className="text-sm text-text-secondary mb-6">
                {selectedEmblem.description}
              </p>

              <div className="w-full bg-vault-bg border border-vault-border rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-text-muted">현재 진행 상황</span>
                  <span className="text-sm font-black text-white">{selectedEmblem.currentCount} / {selectedEmblem.targetCount}</span>
                </div>
                <div className="h-2 bg-vault-surface-light rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${selectedEmblem.colorClass.split(' ')[0].replace('text-', 'bg-')}`}
                    style={{ width: `${Math.min(100, (selectedEmblem.currentCount / selectedEmblem.targetCount) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="w-full text-left">
                <h4 className="text-[10px] font-bold text-text-muted uppercase mb-2">달성 보상</h4>
                <div className={`flex items-center gap-3 p-3 rounded-lg border ${selectedEmblem.isUnlocked ? 'bg-mint/10 border-mint/30 text-mint' : 'bg-vault-surface-light border-vault-border text-text-muted grayscale'}`}>
                  <div className="shrink-0">
                    <Star size={16} />
                  </div>
                  <p className="text-xs font-bold">{selectedEmblem.reward}</p>
                </div>
              </div>
            </div>
            
            {selectedEmblem.isUnlocked && (
              <div className="bg-vault-surface-light px-6 py-4 border-t border-vault-border flex justify-between items-center text-xs">
                <span className="text-text-muted">프로필 장식 적용 가능</span>
                <button className="text-neon-blue font-bold hover:text-white transition-colors flex items-center gap-1">
                  설정하기 <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
