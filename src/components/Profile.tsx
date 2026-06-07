"use client";
import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  User as UserIcon, Link as LinkIcon, Calendar, Trophy, Gamepad2, 
  Star, Clock, Shield, Medal, Copy, Check, Share2, History as HistoryIcon,
  Edit2, Save, X, Download, MessageSquare, AlertTriangle, UserPlus, UserCheck, UserMinus,
  LayoutGrid, Heart, Eye
} from 'lucide-react';
import { CollectionItem, Game } from '../types';
import { calculateEmblems, Emblem } from '../lib/emblems';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '@/app/actions/profile';
import { useRouter } from 'next/navigation';
import { toPng } from 'html-to-image';
import { useToast } from '../contexts/ToastContext';
import Stats from './Stats';

interface ProfileProps {
  collection: CollectionItem[];
  games: Game[];
  viewedUser?: {
    id: string;
    name: string;
    email: string;
    nickname: string;
    bio: string;
    image: string;
  };
  collectionGroups?: any[];
}

export default function Profile({ collection, games, viewedUser, collectionGroups }: ProfileProps) {
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<'profile' | 'collection'>('collection');
  const [currentPage, setCurrentPage] = useState(1);
  const { user, updateProfile: updateProfileContext } = useAuth();
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    nickname: '',
    bio: '',
    image: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const [dmModalOpen, setDmModalOpen] = useState(false);
  const [dmContent, setDmContent] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const displayUser = viewedUser || user;
  const isOwnProfile = !viewedUser || viewedUser.id === user?.id;

  const [friendStatus, setFriendStatus] = useState<'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'ACCEPTED'>('NONE');
  const [friendshipId, setFriendshipId] = useState<string | null>(null);

  // Fetch friendship status
  useEffect(() => {
    if (!isOwnProfile && displayUser && user) {
      fetch('/api/friends')
        .then(res => res.json())
        .then((data: any[]) => {
          if (Array.isArray(data)) {
            const fs = data.find(f => (f.userId === user.id && f.friendId === displayUser.id) || (f.userId === displayUser.id && f.friendId === user.id));
            if (fs) {
              setFriendshipId(fs.id);
              if (fs.status === 'ACCEPTED') setFriendStatus('ACCEPTED');
              else if (fs.userId === user.id) setFriendStatus('PENDING_SENT');
              else setFriendStatus('PENDING_RECEIVED');
            }
          }
        });
    }
  }, [isOwnProfile, displayUser, user]);

  const handleFriendAction = async (action: 'ADD' | 'ACCEPT' | 'REJECT' | 'REMOVE') => {
    try {
      if (action === 'ADD') {
        const res = await fetch('/api/friends', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ friendId: displayUser?.id })
        });
        if (res.ok) setFriendStatus('PENDING_SENT');
      } else if (friendshipId) {
        if (action === 'ACCEPT') {
          await fetch('/api/friends', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: friendshipId, status: 'ACCEPTED' })
          });
          setFriendStatus('ACCEPTED');
        } else {
          // REJECT or REMOVE
          await fetch('/api/friends', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: friendshipId, status: 'REJECTED' })
          });
          setFriendStatus('NONE');
          setFriendshipId(null);
        }
      }
    } catch (e) {
      console.error(e);
      showToast('요청 처리 중 오류가 발생했습니다.', 'error');
    }
  };

  // Initialize editData when user loads
  useMemo(() => {
    if (isOwnProfile && displayUser && !isEditing) {
      setEditData({
        nickname: displayUser.nickname || (displayUser as any).name || '',
        bio: displayUser.bio || '',
        image: (displayUser as any).image || (displayUser as any).avatar || ''
      });
    }
  }, [displayUser, isOwnProfile, isEditing]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile(editData);
      await updateProfileContext({ nickname: editData.nickname, avatar: editData.image });
      setIsEditing(false);
      window.location.reload();
    } catch (e: any) {
      showToast(e.message || '프로필 수정 실패', 'error');
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

  const handleDownloadReport = async () => {
    if (!reportRef.current) return;
    try {
      const dataUrl = await toPng(reportRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `${user?.nickname || 'retro_master'}_report.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image:', err);
      showToast('이미지 다운로드에 실패했습니다.', 'error');
    }
  };

  const handleSendDM = async () => {
    if (!dmContent.trim() || !displayUser) return;
    try {
      await fetch('/api/dm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: displayUser.id, content: dmContent })
      });
      showToast('쪽지를 보냈습니다.');
      setDmModalOpen(false);
      setDmContent('');
    } catch (e) {
      showToast('쪽지 전송 실패', 'error');
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim() || !displayUser) return;
    try {
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType: 'USER', targetId: displayUser.id, reason: reportReason })
      });
      showToast('신고가 접수되었습니다.');
      setReportModalOpen(false);
      setReportReason('');
    } catch (e) {
      showToast('신고 접수 실패', 'error');
    }
  };

  const [localLikes, setLocalLikes] = useState(collectionGroups?.[0]?.likes || 0);

  const handleLike = async () => {
    if (!collectionGroups || collectionGroups.length === 0) return showToast('공개된 컬렉션이 없습니다.', 'error');
    const mainGroupId = collectionGroups[0].id;
    try {
      const res = await fetch(`/api/collection-groups/${mainGroupId}/like`, { method: 'POST' });
      if (res.ok) {
        setLocalLikes((prev: number) => prev + 1);
      } else {
        showToast('로그인이 필요합니다.', 'error');
      }
    } catch (e) {
      showToast('오류가 발생했습니다.', 'error');
    }
  };

  const itemsPerPage = 20;
  const totalPages = Math.ceil(collectionGames.length / itemsPerPage);
  const currentItems = collectionGames.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 page-enter min-h-[calc(100vh-64px)] relative">
      
      {/* ── 1. Collection Grid (Gallery) ── */}
      {!isOwnProfile && activeView === 'collection' && (
      <div className="w-full transition-all duration-500 ease-in-out">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
              <LayoutGrid className="text-amber" size={20} />
              {displayUser?.nickname || (displayUser as any)?.name || '유저'}님의 컬렉션
            </h3>
            <div className="flex items-center gap-2">
              {!isOwnProfile && collectionGroups && collectionGroups.length > 0 && (
                <>
                  <button onClick={handleLike} className="flex items-center gap-1.5 px-3 py-1 bg-coral/10 text-coral border border-coral/30 rounded-full text-xs font-bold hover:bg-coral/20 transition-colors">
                    <Heart size={14} /> {localLikes}
                  </button>
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-vault-surface-light text-text-secondary border border-vault-border rounded-full text-xs font-bold">
                    <Eye size={14} /> {collectionGroups[0].views}
                  </span>
                </>
              )}
              <span className="text-xs font-bold text-text-muted bg-vault-surface border border-vault-border px-3 py-1 rounded-full hidden sm:inline-block">
                총 {collectionGames.length}개
              </span>
              <button onClick={() => setActiveView('profile')} className="flex items-center gap-1 px-3 py-1 bg-vault-surface hover:bg-vault-surface-light border border-vault-border rounded-lg text-xs text-text-secondary transition-colors">
                프로필 보기
              </button>
            </div>
          </div>
          
          {currentItems.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {currentItems.map(cg => (
                  <div key={cg.item.id} className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden hover:border-mint/50 hover:shadow-lg transition-all group">
                    <div className="aspect-[3/4] bg-vault-surface-light relative">
                      {cg.game.imageUrl ? (
                        <img src={cg.game.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted">
                          <Gamepad2 size={32} className="opacity-20" />
                        </div>
                      )}
                      {cg.item.ownershipStatus === '전부 보유' && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-mint text-vault-bg rounded-full flex items-center justify-center shadow-md">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-vault-bg/90 to-transparent opacity-80" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-xs font-bold text-text-primary truncate">{cg.game.title}</p>
                        <p className="text-[10px] text-text-secondary truncate">{cg.game.platform}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 pb-4">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 bg-vault-surface border border-vault-border text-text-primary rounded disabled:opacity-50 text-sm">이전</button>
                  <span className="text-sm text-text-muted">{currentPage} / {totalPages}</span>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 bg-vault-surface border border-vault-border text-text-primary rounded disabled:opacity-50 text-sm">다음</button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-vault-surface border border-vault-border rounded-xl">
              <Gamepad2 size={32} className="mx-auto text-text-muted mb-3 opacity-30" />
              <p className="text-sm text-text-secondary">공개된 컬렉션이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
      )}

      {/* ── 2. Profile Info ── */}
      {(isOwnProfile || activeView === 'profile') && (
      <div className={`w-full flex flex-col gap-6 transition-all duration-500 max-w-4xl mx-auto`}>
      
      {/* ── Profile Header ── */}
      <div className="bg-vault-surface border border-vault-border rounded-2xl overflow-hidden relative shadow-xl">
        {/* Banner */}
        <div className={`h-32 relative ${repEmblem ? repEmblem.colorClass.split(' ')[0].replace('text-', 'bg-') : 'bg-vault-surface-light'} opacity-20 crt-lines`} />
        
        <div className="px-6 md:px-10 pb-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between -mt-12 mb-6 gap-4">
            
            <div className="flex items-end gap-5">
              <div className="w-24 h-24 rounded-2xl bg-vault-bg border-4 border-vault-surface flex items-center justify-center shadow-2xl relative overflow-hidden group cursor-pointer">
                {isEditing ? (
                  <label className="w-full h-full cursor-pointer relative block">
                    <img src={editData.image || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${displayUser?.id || 'RetroMaster'}&backgroundColor=1A1A1A`} alt="Avatar" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-1 rounded">사진 변경</span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        if (file.size > 2 * 1024 * 1024) {
                          showToast('사진은 2MB 이하여야 합니다.', 'error');
                          return;
                        }

                        try {
                          showToast('사진을 업로드 중입니다...', 'info');
                          const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
                            method: 'POST',
                            body: file,
                          });
                          
                          if (!response.ok) {
                            throw new Error('Upload failed');
                          }
                          
                          const blob = await response.json();
                          setEditData(prev => ({...prev, image: blob.url}));
                          showToast('사진이 업로드되었습니다. 잊지말고 아래 저장 버튼을 눌러주세요!');
                        } catch (error) {
                          showToast('사진 업로드에 실패했습니다.', 'error');
                        }
                      }}
                    />
                  </label>
                ) : (
                  <img src={(displayUser as any)?.image || (displayUser as any)?.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${displayUser?.id || 'RetroMaster'}&backgroundColor=1A1A1A`} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                )}
              </div>
              
              <div className="mb-1 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editData.nickname} 
                      onChange={e => setEditData({...editData, nickname: e.target.value})}
                      className="bg-vault-bg border border-vault-border rounded px-2 py-1 text-text-primary text-lg font-bold focus:outline-none focus:border-mint max-w-[200px]"
                      placeholder="닉네임"
                    />
                  ) : (
                    <h2 className="text-2xl md:text-3xl font-black text-text-primary truncate">{displayUser?.nickname || (displayUser as any)?.name || '레트로 마스터'}</h2>
                  )}
                  {repEmblem && !isEditing && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${repEmblem.colorClass} bg-vault-surface`}>
                      <Medal size={12} /> {repEmblem.name}
                    </span>
                  )}
                </div>
                {!isEditing && (
                  <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted font-medium">
                    <span className="flex items-center gap-1 whitespace-nowrap"><Calendar size={12} className="shrink-0" /> {(displayUser as any)?.createdAt ? new Date((displayUser as any).createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : '2024년 1월 1일'} 가입</span>
                    <span className="flex items-center gap-1 whitespace-nowrap"><Gamepad2 size={12} className="shrink-0" /> {collectionGames.length} 게임 보유</span>
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
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-vault-bg border border-vault-border text-text-secondary hover:text-text-primary rounded-lg transition-colors text-sm"
                  >
                    <X size={14} /> 취소
                  </button>
                </>
              ) : isOwnProfile ? (
                <>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-vault-surface-light border border-vault-border text-text-secondary hover:text-text-primary hover:border-vault-border-light rounded-lg transition-colors text-sm"
                  >
                    <Edit2 size={14} /> 편집
                  </button>
                  <button 
                    onClick={handleCopyLink}
                    className={`p-1.5 rounded-lg border transition-colors ${copied ? 'bg-mint/10 border-mint/30 text-mint' : 'bg-vault-bg border-vault-border text-text-primary hover:text-text-primary hover:border-vault-border-light'}`}
                    title="공유 링크 복사"
                  >
                    {copied ? <Check size={16} /> : <Share2 size={16} />}
                  </button>
                </>
              ) : (
                <div className="flex gap-2 items-center">
                  {!isOwnProfile && (
                    <button 
                      onClick={() => setActiveView('collection')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-neon-purple text-vault-bg text-sm font-bold rounded-lg hover:bg-neon-purple-dim transition-colors mr-2 shadow-lg"
                    >
                      <LayoutGrid size={14} /> 컬렉션 보기
                    </button>
                  )}
                  <button 
                    onClick={handleCopyLink}
                    className={`p-1.5 rounded-lg border transition-colors ${copied ? 'bg-mint/10 border-mint/30 text-mint' : 'bg-vault-bg border-vault-border text-text-primary hover:text-text-primary hover:border-vault-border-light'}`}
                    title="공유 링크 복사"
                  >
                    {copied ? <Check size={16} /> : <Share2 size={16} />}
                  </button>
                  
                  {user && (
                    <>
                      {friendStatus === 'NONE' && (
                        <button onClick={() => handleFriendAction('ADD')} className="p-1.5 rounded-lg border bg-vault-bg border-vault-border text-mint hover:text-mint/80 hover:border-mint/50 transition-colors" title="친구 추가">
                          <UserPlus size={16} />
                        </button>
                      )}
                      {friendStatus === 'PENDING_SENT' && (
                        <button className="p-1.5 rounded-lg border bg-vault-bg border-vault-border text-text-muted cursor-default" title="친구 요청 전송됨">
                          <UserPlus size={16} className="opacity-50" />
                        </button>
                      )}
                      {friendStatus === 'PENDING_RECEIVED' && (
                        <button onClick={() => handleFriendAction('ACCEPT')} className="p-1.5 rounded-lg border bg-vault-bg border-vault-border text-mint hover:bg-mint/10 hover:border-mint/50 transition-colors" title="친구 요청 수락">
                          <UserCheck size={16} />
                        </button>
                      )}
                      {friendStatus === 'ACCEPTED' && (
                        <button onClick={() => handleFriendAction('REMOVE')} className="p-1.5 rounded-lg border bg-vault-bg border-vault-border text-text-secondary hover:text-coral hover:border-coral/50 transition-colors" title="친구 삭제">
                          <UserMinus size={16} />
                        </button>
                      )}
                    </>
                  )}

                  <button 
                    onClick={() => setDmModalOpen(true)}
                    className="p-1.5 rounded-lg border bg-vault-bg border-vault-border text-text-primary hover:text-text-primary hover:border-vault-border-light transition-colors"
                    title="쪽지 보내기"
                  >
                    <MessageSquare size={16} />
                  </button>
                  <button 
                    onClick={() => setReportModalOpen(true)}
                    className="p-1.5 rounded-lg border bg-vault-bg border-vault-border text-coral/70 hover:text-coral hover:border-coral/50 transition-colors"
                    title="유저 신고"
                  >
                    <AlertTriangle size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {isEditing ? (
            <textarea
              value={editData.bio}
              onChange={e => setEditData({...editData, bio: e.target.value})}
              rows={3}
              placeholder="자기소개를 입력하세요..."
              className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-mint resize-none mt-2"
            />
          ) : (
            <p className="text-sm text-text-secondary leading-relaxed max-w-2xl mt-2 whitespace-pre-line">
              {displayUser?.bio || '아직 자기소개가 없습니다.'}
            </p>
          )}
        </div>
      </div>

      {/* ── 2. My Game Life ── */}
      {gameLife && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
              <Gamepad2 className="text-neon-purple" size={20} />
              {isOwnProfile ? '내 게임 인생 리포트 카드' : `${displayUser?.nickname || '유저'}님의 게임 인생 리포트 카드`}
            </h3>
            {isOwnProfile && (
              <button 
                onClick={handleDownloadReport}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-vault-surface-light hover:bg-vault-surface border border-vault-border text-text-secondary hover:text-text-primary rounded-lg transition-colors text-xs font-bold"
              >
                <Download size={14} /> PNG로 다운로드
              </button>
            )}
          </div>
          
          <div ref={reportRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-vault-bg p-4 rounded-xl">
            
            <div className="bg-vault-surface border border-vault-border rounded-xl p-5 hover:border-vault-border-light transition-colors group">
              <div className="text-[10px] font-bold text-text-muted uppercase mb-3 flex items-center gap-1.5">
                <Star size={12} className="text-mint" /> 첫 등록 게임
              </div>
              <p className="text-base font-bold text-text-primary mb-1 group-hover:text-mint transition-colors">{gameLife.firstRegistered.game.title}</p>
              <p className="text-xs text-text-secondary">{gameLife.firstRegistered.game.platform}</p>
            </div>

            <div className="bg-vault-surface border border-vault-border rounded-xl p-5 hover:border-vault-border-light transition-colors group">
              <div className="text-[10px] font-bold text-text-muted uppercase mb-3 flex items-center gap-1.5">
                <HistoryIcon size={12} className="text-amber" /> 가장 오래 보유한 게임
              </div>
              <p className="text-base font-bold text-text-primary mb-1 group-hover:text-amber transition-colors">{gameLife.longestOwned.game.title}</p>
              <p className="text-xs text-text-secondary">구매일: {gameLife.longestOwned.item.purchaseDate || '알 수 없음'}</p>
            </div>

            <div className="bg-vault-surface border border-vault-border rounded-xl p-5 hover:border-vault-border-light transition-colors group">
              <div className="text-[10px] font-bold text-text-muted uppercase mb-3 flex items-center gap-1.5">
                <Trophy size={12} className="text-neon-blue" /> 최애 플랫폼 & 장르
              </div>
              <p className="text-base font-bold text-text-primary mb-1 group-hover:text-neon-blue transition-colors">{gameLife.favoritePlatform}</p>
              <p className="text-xs text-text-secondary">{gameLife.favoriteGenre} 장르 선호</p>
            </div>

            <div className="bg-vault-surface border border-vault-border rounded-xl p-5 hover:border-vault-border-light transition-colors group">
              <div className="text-[10px] font-bold text-text-muted uppercase mb-3 flex items-center gap-1.5">
                <Clock size={12} className="text-neon-purple" /> 가장 많이 플레이한 게임
              </div>
              <p className="text-base font-bold text-text-primary mb-1 group-hover:text-neon-purple transition-colors">{gameLife.mostPlayed?.game.title || '기록 없음'}</p>
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
                  <p className="text-base font-bold text-text-primary mb-1 group-hover:text-coral transition-colors">{gameLife.highestRated?.game.title || '평가된 게임 없음'}</p>
                  <p className="text-xs text-text-secondary">
                    평점 {gameLife.highestRated?.item.rating}/5.0 · {gameLife.highestRated?.game.platform}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── 3. Collection Statistics ── */}
      <div className="mt-8">
        <Stats games={games} collection={collection} />
      </div>

      {/* ── 4. Profile Share Card Preview ── */}
      {isOwnProfile && (
        <div className="space-y-6 pt-10 border-t border-vault-border/50 pb-8">
        <div className="flex flex-col items-center justify-center mb-6 text-center">
          <h3 className="text-2xl font-black text-text-primary flex items-center gap-2 mb-2">
            <Share2 className="text-mint" size={24} />
            {isOwnProfile ? '내 게임 인생 리포트 카드' : `${displayUser?.nickname || '유저'}님의 게임 인생 리포트 카드`}
          </h3>
          <p className="text-sm text-text-muted">이 명함을 다운로드하여 SNS에 공유해보세요!</p>
        </div>
        
        <div ref={reportRef} className="w-full max-w-lg mx-auto bg-[#0a0a0c] border-2 border-vault-border rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative group cursor-pointer hover:border-mint/50 transition-colors">
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
              <img src={(displayUser as any)?.image || (displayUser as any)?.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${displayUser?.id || 'RetroMaster'}&backgroundColor=1A1A1A`} alt="Avatar" className="w-24 h-24 rounded-2xl bg-vault-bg border-4 border-vault-surface object-cover shadow-2xl" />
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
              <h4 className="text-3xl font-black text-text-primary tracking-tight mb-1">{displayUser?.nickname || (displayUser as any)?.name || '레트로 마스터'}</h4>
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
                  <p className="text-sm font-bold text-text-primary truncate max-w-[200px]">{gameLife?.mostPlayed?.game.title || 'N/A'}</p>
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
                    <UserIcon size={14} className="mt-0.5 opacity-70" />
                </div>
                <div className="text-xs text-text-muted">
                  Joined<br/><span className="text-text-primary font-bold">{(displayUser as any)?.createdAt ? new Date((displayUser as any).createdAt).getFullYear() : '2024'}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-pixel text-[10px] text-text-muted block mb-1">RETROVAULT.IO</span>
                <span className="text-xs font-mono text-text-secondary block">/profile/{displayUser?.nickname?.toLowerCase() || (displayUser as any)?.name?.toLowerCase() || 'retro_master'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mt-6">
          <button onClick={handleDownloadReport} className="flex items-center gap-2 px-6 py-3 bg-mint/10 border border-mint/30 text-mint font-bold rounded-xl hover:bg-mint/20 hover:scale-105 transition-all shadow-lg shadow-mint/10">
            <Download size={18} /> PNG로 저장하기
          </button>
        </div>
        </div>
      )}
      
      </div>
      )}

      {/* Modals */}
      {dmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-vault-surface border border-vault-border rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-text-primary mb-4">쪽지 보내기</h3>
            <textarea
              value={dmContent}
              onChange={e => setDmContent(e.target.value)}
              className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-mint resize-none h-32 mb-4"
              placeholder={`${displayUser?.nickname}님에게 보낼 메시지를 입력하세요...`}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setDmModalOpen(false)} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors">취소</button>
              <button onClick={handleSendDM} className="px-4 py-2 bg-mint text-vault-bg font-bold rounded-lg hover:bg-mint-dim transition-colors">보내기</button>
            </div>
          </div>
        </div>
      )}

      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-vault-surface border border-vault-border rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-coral mb-4 flex items-center gap-2">
              <AlertTriangle size={20} /> 신고하기
            </h3>
            <p className="text-sm text-text-secondary mb-4">이 유저를 신고하는 이유를 상세히 적어주세요.</p>
            <textarea
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              className="w-full bg-vault-bg border border-vault-border rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:border-coral resize-none h-32 mb-4"
              placeholder="신고 사유를 입력하세요..."
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setReportModalOpen(false)} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors">취소</button>
              <button onClick={handleReport} className="px-4 py-2 bg-coral text-text-primary font-bold rounded-lg hover:bg-red-600 transition-colors">신고 접수</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
