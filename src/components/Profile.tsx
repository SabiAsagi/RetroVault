"use client";
import { useState, useMemo } from 'react';
import { 
  User, Link as LinkIcon, Calendar, Trophy, Gamepad2, 
  Star, Clock, Shield, Medal, Copy, Check, Share2, History as HistoryIcon,
  Edit2, Save, X
} from 'lucide-react';
import { CollectionItem, Game } from '../types';
import { calculateEmblems, Emblem } from '../lib/emblems';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '@/app/actions/profile';
import { useRouter } from 'next/navigation';

interface ProfileProps {
  collection: CollectionItem[];
  games: Game[];
}

export default function Profile({ collection, games }: ProfileProps) {
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    nickname: '',
    bio: '',
    image: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Initialize editData when user loads
  useMemo(() => {
    if (user && !isEditing) {
      setEditData({
        nickname: user.nickname || '',
        bio: user.bio || '',
        image: user.avatar || ''
      });
    }
  }, [user, isEditing]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile(editData);
      setIsEditing(false);
      window.location.reload(); // Hard reload to fetch new session
    } catch (e: any) {
      alert(e.message || '프로필 수정 실패');
    } finally {
      setIsSaving(false);
    }
  };

  const collectionGames = useMemo(() => {
    return collection
      .map(c => ({ item: c, game: games.find(g => g.id === c.gameId) }))
      .filter((cg): cg is { item: CollectionItem; game: NonNullable<typeof cg.game> } => !!cg.game);
  }, [collection, games]);

  const emblems = calculateEmblems(collection, games);
  const unlockedEmblems = emblems.filter(e => e.isUnlocked);
  const repEmblem = unlockedEmblems.length > 0 ? unlockedEmblems[unlockedEmblems.length - 1] : null;

  // ── My Game Life Calculations ──
  const gameLife = useMemo(() => {
    if (collectionGames.length === 0) return null;

    // 첫 등록 게임 (가장 먼저 추가한 게임 - 배열의 맨 앞이라고 가정)
    const firstRegistered = collectionGames[0];

    // 가장 오래 보유한 게임 (구매일이 가장 옛날인 게임)
    const longestOwned = [...collectionGames]
      .filter(cg => cg.item.purchaseDate)
      .sort((a, b) => a.item.purchaseDate!.localeCompare(b.item.purchaseDate!))[0];

    // 최애 플랫폼 & 장르
    const platforms: Record<string, number> = {};
    const genres: Record<string, number> = {};
    collectionGames.forEach(cg => {
      platforms[cg.game.platform] = (platforms[cg.game.platform] || 0) + 1;
      genres[cg.game.genre] = (genres[cg.game.genre] || 0) + 1;
    });

    const favoritePlatform = Object.entries(platforms).sort((a, b) => b[1] - a[1])[0]?.[0];
    const favoriteGenre = Object.entries(genres).sort((a, b) => b[1] - a[1])[0]?.[0];

    // 가장 많이 플레이한 게임
    const mostPlayed = [...collectionGames]
      .filter(cg => cg.item.playTime && cg.item.playTime > 0)
      .sort((a, b) => (b.item.playTime || 0) - (a.item.playTime || 0))[0];

    // 최고 평점 게임 (평점 5점 중 플레이 타임이 가장 높은 것)
    const highestRated = [...collectionGames]
      .filter(cg => cg.item.rating === 5)
      .sort((a, b) => (b.item.playTime || 0) - (a.item.playTime || 0))[0] 
      || [...collectionGames].sort((a, b) => b.item.rating - a.item.rating)[0];

    return {
      firstRegistered,
      longestOwned: longestOwned || firstRegistered,
      favoritePlatform,
      favoriteGenre,
      mostPlayed,
      highestRated
    };
  }, [collectionGames]);

  const profileUrl = "retrovault.io/profile/retro_master";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-8 page-enter min-h-[calc(100vh-64px)] space-y-8">
      
      {/* ── 1. Profile Header ── */}
      <div className="bg-vault-surface border border-vault-border rounded-2xl overflow-hidden relative shadow-xl">
        {/* Banner */}
        <div className={`h-32 relative ${repEmblem ? repEmblem.colorClass.split(' ')[0].replace('text-', 'bg-') : 'bg-vault-surface-light'} opacity-20 crt-lines`} />
        
        <div className="px-6 md:px-10 pb-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between -mt-12 mb-6 gap-4">
            
            <div className="flex items-end gap-5">
              <div className="w-24 h-24 rounded-2xl bg-vault-bg border-4 border-vault-surface flex items-center justify-center shadow-2xl relative overflow-hidden group cursor-pointer">
                {isEditing ? (
                  <img src={editData.image || "https://api.dicebear.com/7.x/pixel-art/svg?seed=RetroMaster&backgroundColor=1A1A1A"} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <img src={user?.avatar || "https://api.dicebear.com/7.x/pixel-art/svg?seed=RetroMaster&backgroundColor=1A1A1A"} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                )}
              </div>
              
              <div className="mb-1 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editData.nickname} 
                      onChange={e => setEditData({...editData, nickname: e.target.value})}
                      className="bg-vault-bg border border-vault-border rounded px-2 py-1 text-white text-lg font-bold focus:outline-none focus:border-mint max-w-[200px]"
                      placeholder="닉네임"
                    />
                  ) : (
                    <h2 className="text-2xl font-black text-white">{user?.nickname || '레트로 마스터'}</h2>
                  )}
                  {repEmblem && !isEditing && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${repEmblem.colorClass} bg-vault-surface`}>
                      <Medal size={12} /> {repEmblem.name}
                    </span>
                  )}
                </div>
                {!isEditing && (
                  <div className="flex items-center gap-3 text-xs text-text-muted font-medium">
                    <span className="flex items-center gap-1"><Calendar size={12} /> 2024년 가입</span>
                    <span className="flex items-center gap-1"><Gamepad2 size={12} /> {collectionGames.length} 게임 보유</span>
                  </div>
                )}
                {isEditing && (
                  <div className="mt-2 w-full">
                    <input 
                      type="text" 
                      value={editData.image} 
                      onChange={e => setEditData({...editData, image: e.target.value})}
                      className="bg-vault-bg border border-vault-border rounded px-2 py-1 text-xs text-text-secondary focus:outline-none focus:border-mint w-full max-w-[300px]"
                      placeholder="이미지 URL (아바타)"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-mint hover:bg-mint-dim text-vault-bg font-bold rounded-lg transition-colors text-sm disabled:opacity-50"
                  >
                    <Save size={14} /> 저장
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-vault-bg border border-vault-border text-text-secondary hover:text-white rounded-lg transition-colors text-sm"
                  >
                    <X size={14} /> 취소
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-vault-surface-light border border-vault-border text-text-secondary hover:text-white hover:border-vault-border-light rounded-lg transition-colors text-sm"
                  >
                    <Edit2 size={14} /> 편집
                  </button>
                  <button 
                    onClick={handleCopyLink}
                    className={`p-1.5 rounded-lg border transition-colors ${copied ? 'bg-mint/10 border-mint/30 text-mint' : 'bg-vault-bg border-vault-border text-text-primary hover:text-white hover:border-vault-border-light'}`}
                    title="공유 링크 복사"
                  >
                    {copied ? <Check size={16} /> : <Share2 size={16} />}
                  </button>
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            <textarea
              value={editData.bio}
              onChange={e => setEditData({...editData, bio: e.target.value})}
              rows={3}
              placeholder="자기소개를 입력하세요..."
              className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-white focus:outline-none focus:border-mint resize-none mt-2"
            />
          ) : (
            <p className="text-sm text-text-secondary leading-relaxed max-w-2xl mt-2 whitespace-pre-line">
              {user?.bio || '80년대부터 지금까지, 시대를 초월하는 명작들을 수집합니다. 특히 JRPG와 휴대용 콘솔에 깊은 애정을 가지고 있으며, 모든 게임을 꼼꼼히 플레이하고 기록으로 남기는 것을 즐깁니다. 가장 좋아하는 시리즈는 파이널 판타지입니다.'}
            </p>
          )}
        </div>
      </div>

      {/* ── 2. My Game Life ── */}
      {gameLife && (
        <div className="space-y-4">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Gamepad2 className="text-neon-purple" size={20} />
            내 게임 인생
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className="bg-vault-surface border border-vault-border rounded-xl p-5 hover:border-vault-border-light transition-colors group">
              <div className="text-[10px] font-bold text-text-muted uppercase mb-3 flex items-center gap-1.5">
                <Star size={12} className="text-mint" /> 첫 등록 게임
              </div>
              <p className="text-base font-bold text-white mb-1 group-hover:text-mint transition-colors">{gameLife.firstRegistered.game.title}</p>
              <p className="text-xs text-text-secondary">{gameLife.firstRegistered.game.platform}</p>
            </div>

            <div className="bg-vault-surface border border-vault-border rounded-xl p-5 hover:border-vault-border-light transition-colors group">
              <div className="text-[10px] font-bold text-text-muted uppercase mb-3 flex items-center gap-1.5">
                <HistoryIcon size={12} className="text-amber" /> 가장 오래 보유한 게임
              </div>
              <p className="text-base font-bold text-white mb-1 group-hover:text-amber transition-colors">{gameLife.longestOwned.game.title}</p>
              <p className="text-xs text-text-secondary">구매일: {gameLife.longestOwned.item.purchaseDate || '알 수 없음'}</p>
            </div>

            <div className="bg-vault-surface border border-vault-border rounded-xl p-5 hover:border-vault-border-light transition-colors group">
              <div className="text-[10px] font-bold text-text-muted uppercase mb-3 flex items-center gap-1.5">
                <Trophy size={12} className="text-neon-blue" /> 최애 플랫폼 & 장르
              </div>
              <p className="text-base font-bold text-white mb-1 group-hover:text-neon-blue transition-colors">{gameLife.favoritePlatform}</p>
              <p className="text-xs text-text-secondary">{gameLife.favoriteGenre} 장르 선호</p>
            </div>

            <div className="bg-vault-surface border border-vault-border rounded-xl p-5 hover:border-vault-border-light transition-colors group">
              <div className="text-[10px] font-bold text-text-muted uppercase mb-3 flex items-center gap-1.5">
                <Clock size={12} className="text-neon-purple" /> 가장 많이 플레이한 게임
              </div>
              <p className="text-base font-bold text-white mb-1 group-hover:text-neon-purple transition-colors">{gameLife.mostPlayed?.game.title || '기록 없음'}</p>
              <p className="text-xs text-text-secondary">{gameLife.mostPlayed?.item.playTime || 0}시간 플레이</p>
            </div>

            <div className="bg-vault-surface border border-vault-border rounded-xl p-5 hover:border-vault-border-light transition-colors group lg:col-span-2">
              <div className="text-[10px] font-bold text-text-muted uppercase mb-3 flex items-center gap-1.5">
                <Shield size={12} className="text-coral" /> 내 마음속 1위 게임 (최고 평점)
              </div>
              <div className="flex gap-4 items-center">
                {gameLife.highestRated?.game.imageUrl ? (
                  <img src={gameLife.highestRated.game.imageUrl} className="w-12 h-12 rounded object-cover shadow-md" alt="Cover" />
                ) : (
                  <div className="w-12 h-12 rounded bg-vault-bg border border-vault-border flex items-center justify-center shrink-0">
                    <Gamepad2 size={16} className="text-text-muted" />
                  </div>
                )}
                <div>
                  <p className="text-base font-bold text-white mb-1 group-hover:text-coral transition-colors">{gameLife.highestRated?.game.title || '평가된 게임 없음'}</p>
                  <p className="text-xs text-text-secondary">
                    평점 {gameLife.highestRated?.item.rating}/5.0 · {gameLife.highestRated?.game.platform}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── 3. Profile Share Card Preview ── */}
      <div className="space-y-6 pt-10 border-t border-vault-border/50">
        <div className="flex flex-col items-center justify-center mb-6 text-center">
          <h3 className="text-2xl font-black text-white flex items-center gap-2 mb-2">
            <Share2 className="text-mint" size={24} />
            내 게임 인생 리포트 카드
          </h3>
          <p className="text-sm text-text-muted">이 명함을 다운로드하여 SNS에 공유해보세요!</p>
        </div>
        
        <div className="w-full max-w-lg mx-auto bg-[#0a0a0c] border-2 border-vault-border rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative group cursor-pointer hover:border-mint/50 transition-colors">
          {/* Hologram Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-mint/0 via-mint/10 to-neon-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20 mix-blend-screen"></div>
          
          {/* Top Banner Area */}
          <div className="h-32 relative overflow-hidden bg-vault-surface">
            {gameLife?.highestRated?.game.imageUrl && (
              <img src={gameLife.highestRated.game.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm" alt="Banner" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0c]"></div>
          </div>
          
          <div className="p-8 relative z-10 -mt-16">
            <div className="flex justify-between items-end mb-6">
              <img src={user?.avatar || "https://api.dicebear.com/7.x/pixel-art/svg?seed=RetroMaster&backgroundColor=1A1A1A"} alt="Avatar" className="w-24 h-24 rounded-2xl border-4 border-[#0a0a0c] bg-vault-bg shadow-xl" />
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${repEmblem?.colorClass || 'text-text-muted'} bg-vault-surface border border-vault-border mb-2 shadow-lg`}>
                  {repEmblem?.name || '신입 컬렉터'}
                </span>
                <div className="flex items-center gap-1 justify-end text-text-muted">
                  <Gamepad2 size={14} />
                  <span className="text-sm font-bold">{collectionGames.length} Games</span>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h4 className="text-3xl font-black text-white tracking-tight mb-1">{user?.nickname || '레트로 마스터'}</h4>
              <p className="text-sm text-text-secondary">RetroVault Verified Collector</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-vault-surface/50 rounded-xl p-4 border border-vault-border/50 backdrop-blur-sm">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Favorite Genre</p>
                <p className="text-lg font-bold text-mint">{gameLife?.favoriteGenre || 'N/A'}</p>
              </div>
              <div className="bg-vault-surface/50 rounded-xl p-4 border border-vault-border/50 backdrop-blur-sm">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Main Platform</p>
                <p className="text-lg font-bold text-neon-blue">{gameLife?.favoritePlatform || 'N/A'}</p>
              </div>
              <div className="bg-vault-surface/50 rounded-xl p-4 border border-vault-border/50 backdrop-blur-sm col-span-2 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Most Played</p>
                  <p className="text-sm font-bold text-white truncate max-w-[200px]">{gameLife?.mostPlayed?.game.title || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Hours</p>
                  <p className="text-sm font-bold text-neon-purple">{gameLife?.mostPlayed?.item.playTime || 0}h</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-6 border-t border-vault-border/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-mint/20 flex items-center justify-center">
                  <Check size={14} className="text-mint" />
                </div>
                <div className="text-xs text-text-muted">
                  Joined<br/><span className="text-white font-bold">2024</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-pixel text-[10px] text-text-muted block mb-1">RETROVAULT.IO</span>
                <span className="text-xs font-mono text-text-secondary block">/profile/{user?.nickname?.toLowerCase() || 'retro_master'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mt-6">
          <button className="flex items-center gap-2 px-6 py-3 bg-mint/10 border border-mint/30 text-mint font-bold rounded-xl hover:bg-mint/20 hover:scale-105 transition-all shadow-lg shadow-mint/10">
            <Copy size={18} /> 명함 이미지로 저장하기
          </button>
        </div>
      </div>

    </div>
  );
}
