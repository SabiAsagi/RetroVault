"use client";
import { useState } from 'react';
import { useSessionStorage } from "@/hooks/useSessionStorage";
import { 
  LayoutDashboard, Gamepad2, Building2, Users, AlertOctagon, History, 
  Settings, RefreshCw, Trash2, Search, Edit, Eye, MoreVertical, Plus,
  CheckCircle, XCircle, AlertTriangle, ShieldAlert, Monitor, Shield
} from 'lucide-react';
import AdminGameModal from "./AdminGameModal";
import AdminPlatformModal from "./AdminPlatformModal";
import AdminCompanyModal from "./AdminCompanyModal";
import { CollectionItem, Game, TimelineEvent } from '../types';
import { createGame, updateGame, deleteGame, createTimelineEvent, updateTimelineEvent, deleteTimelineEvent } from '@/app/actions/admin';
import { resolveReport } from '@/app/actions/admin-dashboard';
import { createCompany, updateCompany, deleteCompany, createPlatform, updatePlatform, deletePlatform, updateUserRole, toggleUserBan, deleteUser, approveGameRequest, rejectGameRequest, approvePlatformRequest, rejectPlatformRequest, approveCompanyRequest, rejectCompanyRequest, updateUserProfileFromAdmin } from '@/app/actions/admin-extensions';

interface AdminProps {
  collection: CollectionItem[];
  games: Game[];
  timelineEvents: TimelineEvent[];
  stats: any;
  users: any[];
  reports: any[];
  logs: any[];
  companies: any[];
  platforms?: any[];
  gameRequests: any[];
  platformRequests?: any[];
  companyRequests?: any[];
  editRequests?: any[];
  userRole?: string;
  onResetToSample?: () => void;
  onClearAll?: () => void;
}

type Tab = 'dashboard' | 'games' | 'requests' | 'companies' | 'platforms' | 'users' | 'reports' | 'logs' | 'settings' | 'timeline';

export default function Admin({ collection, games, timelineEvents, stats, users, reports, logs, companies, platforms, gameRequests, platformRequests, companyRequests, editRequests, userRole = 'USER', onResetToSample, onClearAll }: AdminProps) {
  const [activeTab, setActiveTab] = useSessionStorage<Tab>('admin-tab', 'dashboard');
  const [confirmAction, setConfirmAction] = useState<'reset' | 'clear' | null>(null);

  const [editingGame, setEditingGame] = useState<Partial<Game> | null>(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingTimeline, setEditingTimeline] = useState<Partial<TimelineEvent> | null>(null);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [gamesPage, setGamesPage] = useSessionStorage('admin-games-page', 1);
  const gamesPerPage = 10;
  const [gamesSearch, setGamesSearch] = useSessionStorage('admin-games-search', '');
  
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [companiesPage, setCompaniesPage] = useSessionStorage('admin-companies-page', 1);
  const companiesPerPage = 10;
  const [companiesSearch, setCompaniesSearch] = useSessionStorage('admin-companies-search', '');

  const [editingPlatform, setEditingPlatform] = useState<any>(null);
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);
  const [platformsPage, setPlatformsPage] = useSessionStorage('admin-platforms-page', 1);
  const platformsPerPage = 10;
  const [platformsSearch, setPlatformsSearch] = useSessionStorage('admin-platforms-search', '');

  // Custom User Management Modal State
  const [userActionModalOpen, setUserActionModalOpen] = useState(false);
  const [selectedUserForAction, setSelectedUserForAction] = useState<any>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Upload failed');
      }

      const blob = await response.json();
      setter(blob.url);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`업로드 실패: ${error.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const [localUsers, setLocalUsers] = useState(users || []);
  
  const handleAddCompany = () => {
    setEditingCompany({});
    setIsCompanyModalOpen(true);
  };

  const handleUserActionClick = (user: any) => {
    setSelectedUserForAction(user);
    setUserActionModalOpen(true);
  };

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{ message: string; onConfirm: () => void; isPrompt?: boolean; promptLabel?: string; onPromptSubmit?: (val: string) => void }>({ message: '', onConfirm: () => {} });
  const [promptInput, setPromptInput] = useState('');

  // Request Management State
  const [requestTab, setRequestTab] = useState<'game' | 'platform' | 'company' | 'edit'>('game');
  const [reviewingRequest, setReviewingRequest] = useState<any>(null);
  const [reviewingRequestType, setReviewingRequestType] = useState<'game'|'platform'|'company'|'edit'>('game');

  const executeUserAction = async (actionType: 'ROLE' | 'MAKE_MANAGER' | 'MAKE_USER' | 'BAN' | 'UNBAN' | 'DELETE', reason?: string) => {
    if (!selectedUserForAction) return;
    try {
      if (actionType === 'ROLE') {
        await updateUserRole(selectedUserForAction.id, 'ADMIN');
        setLocalUsers(localUsers.map(u => u.id === selectedUserForAction.id ? { ...u, role: 'ADMIN' } : u));
      } else if (actionType === 'MAKE_MANAGER') {
        await updateUserRole(selectedUserForAction.id, 'MANAGER');
        setLocalUsers(localUsers.map(u => u.id === selectedUserForAction.id ? { ...u, role: 'MANAGER' } : u));
      } else if (actionType === 'MAKE_USER') {
        await updateUserRole(selectedUserForAction.id, 'USER');
        setLocalUsers(localUsers.map(u => u.id === selectedUserForAction.id ? { ...u, role: 'USER' } : u));
      } else if (actionType === 'BAN' || actionType === 'UNBAN') {
        const newStatus = actionType === 'BAN';
        await toggleUserBan(selectedUserForAction.id, newStatus);
        setLocalUsers(localUsers.map(u => u.id === selectedUserForAction.id ? { ...u, isBanned: newStatus } : u));
      } else if (actionType === 'DELETE') {
        await deleteUser(selectedUserForAction.id);
        setLocalUsers(localUsers.filter(u => u.id !== selectedUserForAction.id));
      }
      setUserActionModalOpen(false);
      setConfirmModalOpen(false);
    } catch (e: any) {
      alert(`오류: ${e.message || '실패'}`);
    }
  };


  function executeAction() {
    if (confirmAction === 'reset') onResetToSample?.();
    else if (confirmAction === 'clear') onClearAll?.();
    setConfirmAction(null);
  }

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in">
      <h3 className="text-xl font-bold text-text-primary mb-4">대시보드</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-vault-surface border border-vault-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-text-muted">총 회원</span>
            <Users size={18} className="text-mint" />
          </div>
          <span className="text-2xl font-black text-text-primary">{stats?.userCount || 0}<span className="text-xs text-text-muted ml-1 font-normal">명</span></span>
          <p className="text-[10px] text-mint mt-2 flex items-center gap-1">가입된 전체 회원 수</p>
        </div>
        <div className="bg-vault-surface border border-vault-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-text-muted">등록된 게임</span>
            <Gamepad2 size={18} className="text-neon-blue" />
          </div>
          <span className="text-2xl font-black text-text-primary">{stats?.gameCount || 0}<span className="text-xs text-text-muted ml-1 font-normal">개</span></span>
          <p className="text-[10px] text-neon-blue mt-2 flex items-center gap-1">마스터 데이터</p>
        </div>
        <div className="bg-vault-surface border border-vault-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-text-muted">누적 컬렉션 아이템</span>
            <Building2 size={18} className="text-amber" />
          </div>
          <span className="text-2xl font-black text-text-primary">{stats?.collectionCount || 0}<span className="text-xs text-text-muted ml-1 font-normal">개</span></span>
          <p className="text-[10px] text-amber mt-2 flex items-center gap-1">유저 전체 합산</p>
        </div>
        <div className="bg-vault-surface border border-vault-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-text-muted">미처리 신고</span>
            <ShieldAlert size={18} className="text-coral" />
          </div>
          <span className="text-2xl font-black text-coral">{stats?.pendingReports || 0}<span className="text-xs text-coral/60 ml-1 font-normal">건</span></span>
          <p className="text-[10px] text-coral mt-2 flex items-center gap-1">검토 필요</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-vault-border flex justify-between items-center bg-vault-bg">
            <h4 className="text-sm font-bold text-text-primary">최근 로그인 현황</h4>
            <button className="text-[10px] text-text-muted hover:text-text-primary">더보기</button>
          </div>
          <div className="p-0">
            <table className="w-full text-left text-sm">
              <tbody>
                {(localUsers || []).slice(0, 5).map(u => (
                  <tr key={u.id} className="border-b border-vault-border/50 last:border-0 hover:bg-vault-surface-light">
                    <td className="px-5 py-3 text-text-primary">{u.name || u.nickname || '익명'}</td>
                    <td className="px-5 py-3 text-text-muted text-xs">{u.email}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`px-2 py-1 rounded text-[10px] bg-mint/10 text-mint border border-mint/20`}>
                        활성
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-vault-border flex justify-between items-center bg-vault-bg">
            <h4 className="text-sm font-bold text-text-primary">최근 시스템 로그</h4>
            <button onClick={() => setActiveTab('logs')} className="text-[10px] text-text-muted hover:text-text-primary">전체 로그</button>
          </div>
          <div className="p-0">
            <table className="w-full text-left text-sm">
              <tbody>
                {(logs || []).slice(0, 5).map(l => (
                  <tr key={l.id} className="border-b border-vault-border/50 last:border-0 hover:bg-vault-surface-light">
                    <td className="px-5 py-3">
                      <p className="text-xs text-text-primary mb-0.5">{l.action}</p>
                      <p className="text-[10px] text-text-muted">{l.target}</p>
                    </td>
                    <td className="px-5 py-3 text-right text-[10px] text-text-muted">{new Date(l.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGames = () => (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-text-primary">마스터 게임 데이터</h3>
        <button 
          onClick={() => { setEditingGame({}); setIsGameModalOpen(true); }}
          className="bg-neon-blue hover:bg-neon-blue/80 text-text-primary px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2"
        >
          <Plus size={14} /> 게임 추가
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="게임 검색..." value={gamesSearch} onChange={e => {setGamesSearch(e.target.value); setGamesPage(1);}} className="w-full bg-vault-surface border border-vault-border rounded text-sm text-text-primary px-9 py-2 focus:outline-none focus:border-neon-blue" />
        </div>
      </div>

      <div className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm table-fixed">
          <thead className="bg-vault-bg border-b border-vault-border text-text-muted text-xs uppercase">
            <tr>
              <th className="px-4 py-3 w-40">ID</th>
              <th className="px-4 py-3">타이틀</th>
              <th className="px-4 py-3">플랫폼</th>
              <th className="px-4 py-3">출시연도</th>
              <th className="px-4 py-3">제작사</th>
              <th className="px-4 py-3 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vault-border/50">
            {games.filter(g => g.title.toLowerCase().includes(gamesSearch.toLowerCase())).slice((gamesPage - 1) * gamesPerPage, gamesPage * gamesPerPage).map(g => (
              <tr key={g.id} className="hover:bg-vault-surface-light">
                <td className="px-4 py-3 text-text-muted font-mono text-xs truncate" title={g.id}>{g.id}</td>
                <td className="px-4 py-3 text-text-primary font-medium truncate" title={g.title}>{g.title}</td>
                <td className="px-4 py-3 text-text-secondary truncate">{g.platform}</td>
                <td className="px-4 py-3 text-text-secondary">{g.releaseYear}</td>
                <td className="px-4 py-3 text-text-secondary truncate">{g.developer || '-'}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button 
                    onClick={() => { setEditingGame(g); setIsGameModalOpen(true); }}
                    className="p-1.5 text-text-muted hover:text-neon-blue rounded transition-colors" title="수정"
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    onClick={async () => {
                      if (window.confirm(`'${g.title}' 데이터를 삭제하시겠습니까?`)) {
                        try {
                          await deleteGame(g.id);
                          window.location.reload();
                        } catch (e) {
                          alert('삭제 실패');
                        }
                      }
                    }}
                    className="p-1.5 text-text-muted hover:text-coral rounded transition-colors" title="삭제"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {games.filter(g => g.title.toLowerCase().includes(gamesSearch.toLowerCase())).length > 0 && (
          <div className="flex justify-between items-center p-4 bg-vault-bg border-t border-vault-border">
            <span className="text-xs text-text-muted">총 {games.filter(g => g.title.toLowerCase().includes(gamesSearch.toLowerCase())).length}개 게임</span>
            <div className="flex gap-2">
              <button disabled={gamesPage === 1} onClick={() => setGamesPage(p => p - 1)} className="px-3 py-1 bg-vault-surface hover:bg-vault-surface-light border border-vault-border rounded text-xs text-text-primary disabled:opacity-50">이전</button>
              <span className="px-3 py-1 text-xs text-text-primary">{gamesPage} / {Math.ceil(games.filter(g => g.title.toLowerCase().includes(gamesSearch.toLowerCase())).length / gamesPerPage)}</span>
              <button disabled={gamesPage >= Math.ceil(games.filter(g => g.title.toLowerCase().includes(gamesSearch.toLowerCase())).length / gamesPerPage)} onClick={() => setGamesPage(p => p + 1)} className="px-3 py-1 bg-vault-surface hover:bg-vault-surface-light border border-vault-border rounded text-xs text-text-primary disabled:opacity-50">다음</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-4 animate-in fade-in">
      <h3 className="text-xl font-bold text-text-primary mb-4">회원 관리</h3>
      <div className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-vault-bg border-b border-vault-border text-text-muted text-xs uppercase">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">닉네임</th>
              <th className="px-4 py-3">이메일</th>
              <th className="px-4 py-3">권한</th>
              <th className="px-4 py-3">가입일</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vault-border/50">
            {(localUsers || []).map(u => (
              <tr key={u.id} className="hover:bg-vault-surface-light">
                <td className="px-4 py-3 text-text-muted font-mono text-xs truncate" title={u.id}>{u.id}</td>
                <td className="px-4 py-3 text-text-primary font-medium">{u.nickname || u.name || '익명'}</td>
                <td className="px-4 py-3 text-text-secondary text-xs">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${u.role === 'ADMIN' ? 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue' : 'bg-vault-bg border-vault-border text-text-muted'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${u.isBanned ? 'bg-coral/10 border-coral/30 text-coral' : 'bg-mint/10 border-mint/30 text-mint'}`}>
                    {u.isBanned ? '밴 상태' : '활성'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleUserActionClick(u)} className="p-1.5 bg-vault-surface border border-vault-border rounded text-text-muted hover:text-text-primary transition-colors">
                    <Settings size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-4 animate-in fade-in">
      <h3 className="text-xl font-bold text-text-primary mb-4">신고 관리</h3>
      <div className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-vault-bg border-b border-vault-border text-text-muted text-xs uppercase">
            <tr>
              <th className="px-4 py-3">신고 대상</th>
              <th className="px-4 py-3">사유</th>
              <th className="px-4 py-3">신고자</th>
              <th className="px-4 py-3">접수일</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3 text-right">조치</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vault-border/50">
            {(reports || []).map(r => (
              <tr key={r.id} className="hover:bg-vault-surface-light">
                <td className="px-4 py-3 text-text-primary font-medium">{r.targetType} {r.targetId}</td>
                <td className="px-4 py-3 text-coral text-xs">{r.reason}</td>
                <td className="px-4 py-3 text-text-secondary text-xs">{r.reporter?.name || '익명'}</td>
                <td className="px-4 py-3 text-text-secondary text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${r.status === 'PENDING' ? 'bg-amber/10 border-amber/30 text-amber' : r.status === 'APPROVED' ? 'bg-mint/10 border-mint/30 text-mint' : 'bg-vault-bg border-vault-border text-text-muted'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  {r.status === 'PENDING' ? (
                    <>
                      <button onClick={async () => {
                        try {
                          await resolveReport(r.id, 'APPROVED', '관리자 승인 처리');
                        } catch (e) { console.error(e); }
                      }} className="p-1.5 text-mint bg-mint/10 rounded hover:bg-mint/20 transition-colors" title="승인"><CheckCircle size={14} /></button>
                      <button onClick={async () => {
                        try {
                          await resolveReport(r.id, 'REJECTED', '관리자 반려 처리');
                        } catch (e) { console.error(e); }
                      }} className="p-1.5 text-text-muted bg-vault-bg border border-vault-border rounded hover:text-text-primary transition-colors" title="반려"><XCircle size={14} /></button>
                    </>
                  ) : (
                    <button className="p-1.5 text-text-muted hover:text-text-primary rounded transition-colors" title="상세보기"><Eye size={14} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-text-primary">아카이브 추가 요청</h3>
        <div className="flex bg-vault-surface border border-vault-border rounded-lg p-1">
          <button onClick={() => setRequestTab('game')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${requestTab === 'game' ? 'bg-neon-blue text-vault-bg' : 'text-text-muted hover:text-text-primary'}`}>게임</button>
          <button onClick={() => setRequestTab('platform')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${requestTab === 'platform' ? 'bg-neon-purple text-vault-bg' : 'text-text-muted hover:text-text-primary'}`}>콘솔/플랫폼</button>
          <button onClick={() => setRequestTab('company')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${requestTab === 'company' ? 'bg-amber text-vault-bg' : 'text-text-muted hover:text-text-primary'}`}>회사</button>
          <button onClick={() => setRequestTab('edit')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${requestTab === 'edit' ? 'bg-coral text-vault-bg' : 'text-text-muted hover:text-text-primary'}`}>수정 건의</button>
        </div>
      </div>
      <div className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-vault-bg border-b border-vault-border text-text-muted text-xs uppercase">
            <tr>
              <th className="px-4 py-3">요청 내용</th>
              <th className="px-4 py-3">요청자</th>
              <th className="px-4 py-3">요청일</th>
              <th className="px-4 py-3 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vault-border/50">
            {requestTab === 'game' && (gameRequests || []).map((r: any) => (
              <tr key={r.id} className="hover:bg-vault-surface-light">
                <td className="px-4 py-3 text-text-primary font-medium">{r.title} ({r.platform?.name})</td>
                <td className="px-4 py-3 text-text-secondary text-xs">{r.requestedBy?.name || '익명'}</td>
                <td className="px-4 py-3 text-text-secondary text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => { setReviewingRequest(r); setReviewingRequestType('game'); }} className="p-1.5 text-text-primary bg-vault-bg border border-vault-border rounded hover:bg-vault-surface transition-colors text-xs font-bold" title="확인 및 수정">검토</button>
                </td>
              </tr>
            ))}
            {requestTab === 'platform' && (platformRequests || []).map((r: any) => (
              <tr key={r.id} className="hover:bg-vault-surface-light">
                <td className="px-4 py-3 text-text-primary font-medium">{r.name}</td>
                <td className="px-4 py-3 text-text-secondary text-xs">{r.requestedBy?.name || '익명'}</td>
                <td className="px-4 py-3 text-text-secondary text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => { setReviewingRequest(r); setReviewingRequestType('platform'); }} className="p-1.5 text-text-primary bg-vault-bg border border-vault-border rounded hover:bg-vault-surface transition-colors text-xs font-bold" title="확인 및 수정">검토</button>
                </td>
              </tr>
            ))}
            {requestTab === 'company' && (companyRequests || []).map((r: any) => (
              <tr key={r.id} className="hover:bg-vault-surface-light">
                <td className="px-4 py-3 text-text-primary font-medium">{r.name}</td>
                <td className="px-4 py-3 text-text-secondary text-xs">{r.requestedBy?.name || '익명'}</td>
                <td className="px-4 py-3 text-text-secondary text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => { setReviewingRequest(r); setReviewingRequestType('company'); }} className="p-1.5 text-text-primary bg-vault-bg border border-vault-border rounded hover:bg-vault-surface transition-colors text-xs font-bold" title="확인 및 수정">검토</button>
                </td>
              </tr>
            ))}
            {requestTab === 'edit' && (editRequests || []).map((r: any) => (
              <tr key={r.id} className="hover:bg-vault-surface-light">
                <td className="px-4 py-3 text-text-primary font-medium">{r.targetType} ({r.targetId})</td>
                <td className="px-4 py-3 text-text-secondary text-xs">{r.requestedBy?.name || '익명'}</td>
                <td className="px-4 py-3 text-text-secondary text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => { setReviewingRequest(r); setReviewingRequestType('edit'); }} className="p-1.5 text-coral bg-coral/10 border border-coral/30 rounded hover:bg-coral/20 transition-colors text-xs font-bold" title="확인 및 승인">검토</button>
                </td>
              </tr>
            ))}
            {((requestTab === 'game' && (!gameRequests || gameRequests.length === 0)) ||
              (requestTab === 'platform' && (!platformRequests || platformRequests.length === 0)) ||
              (requestTab === 'company' && (!companyRequests || companyRequests.length === 0)) ||
              (requestTab === 'edit' && (!editRequests || editRequests.length === 0))) && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-text-muted">대기 중인 요청이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="space-y-4 animate-in fade-in">
      <h3 className="text-xl font-bold text-text-primary mb-4">시스템 수정 로그</h3>
      <div className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-vault-bg border-b border-vault-border text-text-muted text-xs uppercase">
            <tr>
              <th className="px-4 py-3">일시</th>
              <th className="px-4 py-3">수행자</th>
              <th className="px-4 py-3">액션</th>
              <th className="px-4 py-3">대상</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vault-border/50">
            {(logs || []).map(l => (
              <tr key={l.id} className="hover:bg-vault-surface-light">
                <td className="px-4 py-3 text-text-secondary text-xs">{new Date(l.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-neon-blue text-xs font-medium">{l.admin?.name || '관리자'}</td>
                <td className="px-4 py-3 text-text-primary">{l.action}</td>
                <td className="px-4 py-3 text-text-muted text-xs">{l.targetType} ({l.targetId})</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCompanies = () => (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-text-primary">회사 관리</h3>
        <button onClick={handleAddCompany} className="bg-neon-blue hover:bg-neon-blue/80 text-text-primary px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2">
          <Plus size={14} /> 회사 추가
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="회사 검색..." 
            value={companiesSearch} 
            onChange={e => {setCompaniesSearch(e.target.value); setCompaniesPage(1);}} 
            className="w-full bg-vault-surface border border-vault-border rounded text-sm text-text-primary px-9 py-2 focus:outline-none focus:border-amber" 
          />
        </div>
      </div>

      <div className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-vault-bg border-b border-vault-border text-text-muted text-xs uppercase">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">회사명</th>
              <th className="px-4 py-3">구분</th>
              <th className="px-4 py-3">등록 게임 수</th>
              <th className="px-4 py-3">소재지</th>
              <th className="px-4 py-3 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vault-border/50">
            {(companies || []).filter(c => c.name.toLowerCase().includes(companiesSearch.toLowerCase())).length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted">등록된 회사가 없습니다.</td></tr>
            )}
            {(companies || []).filter(c => c.name.toLowerCase().includes(companiesSearch.toLowerCase())).slice((companiesPage - 1) * companiesPerPage, companiesPage * companiesPerPage).map(c => (
              <tr key={c.id} className="hover:bg-vault-surface-light">
                <td className="px-4 py-3 text-text-muted font-mono text-xs">{c.id}</td>
                <td className="px-4 py-3 text-text-primary font-medium">{c.name}</td>
                <td className="px-4 py-3 text-text-secondary text-xs">{c.type}</td>
                <td className="px-4 py-3 text-mint font-mono text-xs">{c.gamesCount}</td>
                <td className="px-4 py-3 text-text-secondary text-xs">{c.hq}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => { setEditingCompany(c); setIsCompanyModalOpen(true); }} className="p-1.5 text-text-muted hover:text-neon-blue rounded transition-colors" title="수정"><Edit size={14} /></button>
                  <button onClick={() => {
                    setConfirmConfig({
                      message: '정말 삭제하시겠습니까?',
                      onConfirm: async () => { await deleteCompany(c.id); window.location.reload(); }
                    });
                    setConfirmModalOpen(true);
                  }} className="p-1.5 text-text-muted hover:text-coral rounded transition-colors" title="삭제"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {(companies || []).filter(c => c.name.toLowerCase().includes(companiesSearch.toLowerCase())).length > 0 && (
          <div className="flex justify-between items-center p-4 bg-vault-bg border-t border-vault-border">
            <span className="text-xs text-text-muted">총 {(companies || []).filter(c => c.name.toLowerCase().includes(companiesSearch.toLowerCase())).length}개 회사</span>
            <div className="flex gap-2">
              <button disabled={companiesPage === 1} onClick={() => setCompaniesPage(p => p - 1)} className="px-3 py-1 bg-vault-surface hover:bg-vault-surface-light border border-vault-border rounded text-xs text-text-primary disabled:opacity-50">이전</button>
              <span className="px-3 py-1 text-xs text-text-primary">{companiesPage} / {Math.ceil((companies || []).filter(c => c.name.toLowerCase().includes(companiesSearch.toLowerCase())).length / companiesPerPage)}</span>
              <button disabled={companiesPage >= Math.ceil((companies || []).filter(c => c.name.toLowerCase().includes(companiesSearch.toLowerCase())).length / companiesPerPage)} onClick={() => setCompaniesPage(p => p + 1)} className="px-3 py-1 bg-vault-surface hover:bg-vault-surface-light border border-vault-border rounded text-xs text-text-primary disabled:opacity-50">다음</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 animate-in fade-in">
      <h3 className="text-xl font-bold text-text-primary mb-4">시스템 설정</h3>
      
      <div className="bg-vault-surface border border-coral/30 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-vault-border">
          <AlertTriangle size={18} className="text-coral" />
          <h3 className="text-base font-bold text-coral">데이터 위험 영역</h3>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-text-primary mb-1">샘플 데이터로 초기화</p>
              <p className="text-xs text-text-muted">현재의 컬렉션 데이터를 모두 지우고 기본 제공되는 14개의 샘플 데이터 세트로 되돌립니다.</p>
            </div>
            <button
              onClick={() => setConfirmAction('reset')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-vault-bg border border-vault-border hover:border-amber/40 hover:text-amber text-text-secondary text-sm rounded-lg transition-all shrink-0"
            >
              <RefreshCw size={16} /> 초기화
            </button>
          </div>
          
          <div className="h-px bg-vault-border/50" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-text-primary mb-1">로컬스토리지 전체 삭제</p>
              <p className="text-xs text-text-muted">모든 데이터를 완전히 비웁니다. 이 작업은 되돌릴 수 없습니다.</p>
            </div>
            <button
              onClick={() => setConfirmAction('clear')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-coral/10 border border-coral/30 hover:bg-coral/20 text-coral text-sm rounded-lg transition-all shrink-0"
            >
              <Trash2 size={16} /> 데이터 완전 삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const handleAddPlatform = () => {
    setEditingPlatform({ generation: 1, type: 'HOME' });
    setIsPlatformModalOpen(true);
  };

  const renderPlatforms = () => (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-text-primary">콘솔/플랫폼 관리</h3>
        <button onClick={handleAddPlatform} className="bg-neon-purple hover:bg-neon-purple/80 text-vault-bg px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2">
          <Plus size={14} /> 플랫폼 추가
        </button>
      </div>
      
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="플랫폼 검색..." value={platformsSearch} onChange={e => {setPlatformsSearch(e.target.value); setPlatformsPage(1);}} className="w-full bg-vault-surface border border-vault-border rounded text-sm text-text-primary px-9 py-2 focus:outline-none focus:border-neon-purple" />
        </div>
      </div>

      <div className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-vault-bg border-b border-vault-border text-text-muted text-xs uppercase">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">이름</th>
              <th className="px-4 py-3">제조사</th>
              <th className="px-4 py-3">세대</th>
              <th className="px-4 py-3">타입</th>
              <th className="px-4 py-3 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vault-border/50">
            {(platforms || []).filter(p => p.name.toLowerCase().includes(platformsSearch.toLowerCase())).slice((platformsPage - 1) * platformsPerPage, platformsPage * platformsPerPage).map(p => (
              <tr key={p.id} className="hover:bg-vault-surface-light">
                <td className="px-4 py-3 text-text-muted font-mono text-xs">{p.id}</td>
                <td className="px-4 py-3 text-text-primary font-medium">{p.name}</td>
                <td className="px-4 py-3 text-text-secondary text-xs">{p.manufacturer || '-'}</td>
                <td className="px-4 py-3 text-neon-purple font-mono text-xs">{p.generation}세대</td>
                <td className="px-4 py-3">
                  <span className="text-[10px] px-2 py-0.5 rounded border bg-vault-bg border-vault-border text-text-muted">
                    {p.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => { setEditingPlatform(p); setIsPlatformModalOpen(true); }} className="p-1.5 text-text-muted hover:text-neon-purple rounded transition-colors" title="수정"><Edit size={14} /></button>
                  <button onClick={() => {
                    setConfirmConfig({
                      message: `'${p.name}' 플랫폼을 삭제하시겠습니까?`,
                      onConfirm: async () => { await deletePlatform(p.id); window.location.reload(); }
                    });
                    setConfirmModalOpen(true);
                  }} className="p-1.5 text-text-muted hover:text-coral rounded transition-colors" title="삭제"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {(!platforms || platforms.filter(p => p.name.toLowerCase().includes(platformsSearch.toLowerCase())).length === 0) && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted">등록된 플랫폼이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
        
        {(platforms || []).filter(p => p.name.toLowerCase().includes(platformsSearch.toLowerCase())).length > 0 && (
          <div className="flex justify-between items-center p-4 bg-vault-bg border-t border-vault-border">
            <span className="text-xs text-text-muted">총 {(platforms || []).filter(p => p.name.toLowerCase().includes(platformsSearch.toLowerCase())).length}개 플랫폼</span>
            <div className="flex gap-2">
              <button disabled={platformsPage === 1} onClick={() => setPlatformsPage(p => p - 1)} className="px-3 py-1 bg-vault-surface hover:bg-vault-surface-light border border-vault-border rounded text-xs text-text-primary disabled:opacity-50">이전</button>
              <span className="px-3 py-1 text-xs text-text-primary">{platformsPage} / {Math.ceil((platforms || []).filter(p => p.name.toLowerCase().includes(platformsSearch.toLowerCase())).length / platformsPerPage)}</span>
              <button disabled={platformsPage >= Math.ceil((platforms || []).filter(p => p.name.toLowerCase().includes(platformsSearch.toLowerCase())).length / platformsPerPage)} onClick={() => setPlatformsPage(p => p + 1)} className="px-3 py-1 bg-vault-surface hover:bg-vault-surface-light border border-vault-border rounded text-xs text-text-primary disabled:opacity-50">다음</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8 page-enter min-h-[calc(100vh-64px)] flex flex-col md:flex-row gap-6">
      
      {/* ── Sidebar ── */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-vault-surface border border-vault-border rounded-xl p-4 sticky top-24">
          <div className="mb-6 px-2">
            <h2 className="text-lg font-black text-text-primary">Admin Console</h2>
            <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">RetroVault Manager</p>
          </div>
          
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: '대시보드', icon: LayoutDashboard, roles: ['ADMIN', 'MODERATOR', 'INFO_MANAGER', 'USER_MANAGER'] },
              { id: 'games', label: '게임 관리', icon: Gamepad2, roles: ['ADMIN', 'MODERATOR', 'INFO_MANAGER'] },
              { id: 'platforms', label: '콘솔 관리', icon: Monitor, roles: ['ADMIN', 'MODERATOR', 'INFO_MANAGER'] },
              { id: 'companies', label: '회사 관리', icon: Building2, roles: ['ADMIN', 'MODERATOR', 'INFO_MANAGER'] },
              { id: 'requests', label: '추가 요청', icon: Plus, roles: ['ADMIN', 'MODERATOR', 'INFO_MANAGER'] },
              { id: 'users', label: '회원 관리', icon: Users, roles: ['ADMIN', 'MODERATOR', 'USER_MANAGER'] },
              { id: 'reports', label: '신고 관리', icon: AlertOctagon, roles: ['ADMIN', 'MODERATOR', 'USER_MANAGER'] },
              { id: 'logs', label: '시스템 로그', icon: History, roles: ['ADMIN', 'MODERATOR'] },
              { id: 'settings', label: '설정', icon: Settings, roles: ['ADMIN', 'MODERATOR', 'INFO_MANAGER', 'USER_MANAGER'] },
            ].filter(tab => tab.roles.includes(userRole)).map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium
                    ${isActive ? 'bg-mint/10 text-mint' : 'text-text-muted hover:text-text-primary hover:bg-vault-surface-light'}`}
                >
                  <Icon size={16} /> {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* ── Main Panel ── */}
      <main className="flex-1 min-w-0">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'games' && renderGames()}
        {activeTab === 'platforms' && renderPlatforms()}
        {activeTab === 'companies' && renderCompanies()}
        {activeTab === 'requests' && renderRequests()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'logs' && renderLogs()}
        {activeTab === 'timeline' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-text-primary">타임라인 관리</h3>
            <button 
              onClick={() => { setEditingTimeline({ type: 'event', year: 2000 }); setIsTimelineModalOpen(true); }}
              className="bg-coral hover:bg-coral/80 text-text-primary px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2"
            >
              <Plus size={14} /> 이벤트 추가
            </button>
          </div>

          <div className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-muted uppercase bg-vault-surface-light border-b border-vault-border">
                  <tr>
                    <th className="px-4 py-3 w-16">연도</th>
                    <th className="px-4 py-3">타이틀</th>
                    <th className="px-4 py-3">유형</th>
                    <th className="px-4 py-3">시대</th>
                    <th className="px-4 py-3 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vault-border">
                  {timelineEvents?.map((event: TimelineEvent) => (
                    <tr key={event.id} className="hover:bg-vault-surface-light/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-coral">{event.year}</td>
                      <td className="px-4 py-3 font-medium text-text-primary">{event.title}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${event.type === 'console' ? 'bg-neon-blue/20 text-neon-blue' : event.type === 'game' ? 'bg-mint/20 text-mint' : 'bg-vault-surface-light text-text-muted'}`}>
                          {event.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{event.era || '-'}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button 
                          onClick={() => { setEditingTimeline(event); setIsTimelineModalOpen(true); }}
                          className="p-1.5 text-text-muted hover:text-coral rounded transition-colors" title="수정"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={async () => {
                            if (window.confirm(`'${event.title}' 이벤트를 삭제하시겠습니까?`)) {
                              try {
                                await deleteTimelineEvent(event.id);
                                window.location.reload();
                              } catch (e) {
                                alert('삭제 실패');
                              }
                            }
                          }}
                          className="p-1.5 text-text-muted hover:text-coral rounded transition-colors" title="삭제"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!timelineEvents || timelineEvents.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-text-muted">등록된 타임라인 이벤트가 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
        {activeTab === 'settings' && renderSettings()}
      </main>

      {/* ── Confirm Dialog ── */}
      {confirmAction && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 modal-backdrop" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}>
          <div className="modal-content bg-vault-surface border border-vault-border rounded-xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-coral/10 border border-coral/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(255,107,107,0.2)]">
              <AlertTriangle className="text-coral" size={22} />
            </div>
            <h3 className="text-center font-bold text-text-primary mb-2 text-lg">
              {confirmAction === 'reset' ? '샘플 데이터로 초기화할까요?' : '모든 데이터를 영구 삭제할까요?'}
            </h3>
            <p className="text-center text-sm text-text-muted mb-6">
              {confirmAction === 'reset' 
                ? '현재 컬렉션이 지워지고 기본 제공되는 샘플 컬렉션으로 교체됩니다.' 
                : '컬렉션 내 모든 기록이 삭제되며 이 작업은 되돌릴 수 없습니다.'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmAction(null)} className="flex-1 py-2.5 bg-vault-bg border border-vault-border text-text-primary rounded-lg text-sm hover:border-vault-border-light hover:text-text-primary transition-colors">
                취소
              </button>
              <button onClick={executeAction} className="flex-1 py-2.5 bg-coral text-text-primary rounded-lg text-sm font-bold hover:bg-coral/90 transition-colors shadow-lg">
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Game Form Modal ── */}
      <AdminGameModal 
        isOpen={isGameModalOpen} 
        onClose={() => setIsGameModalOpen(false)} 
        initialData={editingGame} 
        onSave={async (data: any) => {
          setIsSubmitting(true);
          try {
            if (data.id) {
              const { updateGame } = require('@/app/actions/admin');
              await updateGame(data.id, data);
            } else {
              const { createGame } = require('@/app/actions/admin');
              await createGame(data);
            }
            window.location.reload();
          } catch (err: any) {
            alert(err.message || '오류 발생');
          } finally {
            setIsSubmitting(false);
          }
        }} 
        isSubmitting={isSubmitting}
        handleImageUpload={handleImageUpload}
        uploadingImage={uploadingImage}
      />
      
      {/* ── Timeline Form Modal ── */}
      {isTimelineModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-vault-surface border border-vault-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-vault-border bg-vault-bg/50">
              <h3 className="text-lg font-bold text-text-primary">{editingTimeline?.id ? '이벤트 수정' : '이벤트 추가'}</h3>
              <button onClick={() => setIsTimelineModalOpen(false)} className="text-text-muted hover:text-text-primary">
                <XCircle size={20} />
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              try {
                if (editingTimeline?.id) {
                  await updateTimelineEvent(editingTimeline.id, editingTimeline);
                } else {
                  await createTimelineEvent(editingTimeline);
                }
                window.location.reload();
              } catch (err: any) {
                alert(err.message || '오류 발생');
              } finally {
                setIsSubmitting(false);
              }
            }} className="p-4 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1">연도</label>
                  <input required type="number" value={editingTimeline?.year || ''} onChange={e => setEditingTimeline({...editingTimeline, year: parseInt(e.target.value)})} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-text-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1">시대구분</label>
                  <input type="text" value={editingTimeline?.era || ''} onChange={e => setEditingTimeline({...editingTimeline, era: e.target.value})} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-text-primary" placeholder="예: 4th Gen" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1">타이틀</label>
                <input required type="text" value={editingTimeline?.title || ''} onChange={e => setEditingTimeline({...editingTimeline, title: e.target.value})} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-text-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1">유형</label>
                <select value={editingTimeline?.type || 'event'} onChange={e => setEditingTimeline({...editingTimeline, type: e.target.value as any})} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-text-primary">
                  <option value="event">일반 이벤트</option>
                  <option value="console">콘솔 출시</option>
                  <option value="game">게임 출시</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1">설명</label>
                <textarea rows={3} value={editingTimeline?.description || ''} onChange={e => setEditingTimeline({...editingTimeline, description: e.target.value})} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-text-primary resize-none" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-vault-border">
                <button type="button" onClick={() => setIsTimelineModalOpen(false)} className="px-4 py-2 text-sm text-text-muted hover:text-text-primary">취소</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-coral text-text-primary rounded text-sm font-bold disabled:opacity-50">
                  {isSubmitting ? '저장 중...' : '저장하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── User Action Modal ── */}
      {userActionModalOpen && selectedUserForAction && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-vault-surface border border-vault-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-vault-border bg-vault-bg/50">
              <h3 className="text-lg font-bold text-text-primary">회원 관리: {selectedUserForAction.nickname || selectedUserForAction.name}</h3>
              <button onClick={() => setUserActionModalOpen(false)} className="text-text-muted hover:text-text-primary">
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto space-y-6">
              {/* User Info Edit Form */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-mint border-b border-vault-border pb-2">기본 정보 수정</h4>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1">닉네임</label>
                  <input type="text" value={selectedUserForAction.nickname || ''} onChange={e => setSelectedUserForAction({...selectedUserForAction, nickname: e.target.value})} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-text-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1">이메일</label>
                  <input type="email" value={selectedUserForAction.email || ''} onChange={e => setSelectedUserForAction({...selectedUserForAction, email: e.target.value})} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-text-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1">비밀번호 변경 (변경할 경우만 입력)</label>
                  <input type="password" value={selectedUserForAction.newPassword || ''} onChange={e => setSelectedUserForAction({...selectedUserForAction, newPassword: e.target.value})} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-text-primary" placeholder="새 비밀번호 입력" />
                </div>
                <button onClick={async () => {
                  try {
                    await updateUserProfileFromAdmin(selectedUserForAction.id, {
                      nickname: selectedUserForAction.nickname,
                      email: selectedUserForAction.email,
                      password: selectedUserForAction.newPassword
                    });
                    setLocalUsers(localUsers.map(u => u.id === selectedUserForAction.id ? { ...u, nickname: selectedUserForAction.nickname, email: selectedUserForAction.email } : u));
                    alert('회원 정보가 성공적으로 수정되었습니다.');
                    window.location.reload();
                  } catch (e: any) {
                    alert(`수정 실패: ${e.message}`);
                  }
                }} className="w-full bg-mint hover:bg-mint-dim text-vault-bg text-sm font-bold py-2.5 rounded-lg transition-colors">
                  정보 저장
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-vault-border">
                <h4 className="text-sm font-bold text-coral border-b border-vault-border pb-2">권한 및 제재 관리</h4>
                <button onClick={() => executeUserAction('MAKE_MANAGER')} className="w-full flex items-center justify-between p-3 bg-vault-bg border border-vault-border rounded-lg hover:border-mint text-sm text-text-primary transition-colors">
                  <span>중간관리자 권한 부여</span>
                  <ShieldAlert size={16} className="text-mint" />
                </button>
                <button onClick={() => executeUserAction('MAKE_USER')} className="w-full flex items-center justify-between p-3 bg-vault-bg border border-vault-border rounded-lg hover:border-amber text-sm text-text-primary transition-colors">
                  <span>일반 유저로 강등</span>
                  <Shield size={16} className="text-amber" />
                </button>
                <button onClick={() => {
                  setPromptInput('');
                  setConfirmConfig({
                    message: selectedUserForAction.isBanned ? '밴 해제 사유를 입력하세요' : '밴 사유를 입력하세요',
                    isPrompt: true,
                    promptLabel: '사유',
                    onConfirm: () => {},
                    onPromptSubmit: (val) => {
                      executeUserAction(selectedUserForAction.isBanned ? 'UNBAN' : 'BAN', val);
                    }
                  });
                  setConfirmModalOpen(true);
                }} className="w-full flex items-center justify-between p-3 bg-vault-bg border border-vault-border rounded-lg hover:border-amber text-sm text-text-primary transition-colors">
                  <span>{selectedUserForAction.isBanned ? '밴 해제' : '밴 처리'}</span>
                  <AlertTriangle size={16} className="text-amber" />
                </button>
                <button onClick={() => {
                  setConfirmConfig({
                    message: '정말 삭제하시겠습니까?',
                    onConfirm: () => executeUserAction('DELETE')
                  });
                  setConfirmModalOpen(true);
                }} className="w-full flex items-center justify-between p-3 bg-vault-bg border border-vault-border rounded-lg hover:border-coral text-sm text-coral transition-colors">
                  <span>회원 영구 삭제</span>
                  <Trash2 size={16} className="text-coral" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Company Form Modal ── */}
      <AdminCompanyModal 
        isOpen={isCompanyModalOpen} 
        onClose={() => setIsCompanyModalOpen(false)} 
        initialData={editingCompany} 
        onSave={async (data: any) => {
          setIsSubmitting(true);
          try {
            if (data.id) {
              const { updateCompany } = require('@/app/actions/admin-extensions');
              await updateCompany(data.id, data);
            } else {
              const { createCompany } = require('@/app/actions/admin-extensions');
              await createCompany(data);
            }
            window.location.reload();
          } catch (err: any) {
            alert(err.message || '오류 발생');
          } finally {
            setIsSubmitting(false);
          }
        }} 
        isSubmitting={isSubmitting}
        handleImageUpload={handleImageUpload}
        uploadingImage={uploadingImage}
      />
      
      {/* ── Custom Confirm / Prompt Modal ── */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-vault-surface border border-vault-border rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-5">
              <h3 className="text-lg font-bold text-text-primary mb-3 whitespace-pre-line">{confirmConfig.message}</h3>
              {confirmConfig.isPrompt && (
                <input 
                  autoFocus
                  type="text" 
                  value={promptInput}
                  onChange={e => setPromptInput(e.target.value)}
                  placeholder={confirmConfig.promptLabel}
                  className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-mint"
                />
              )}
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-vault-border bg-vault-bg/50">
              <button onClick={() => setConfirmModalOpen(false)} className="px-4 py-2 text-sm text-text-muted hover:text-text-primary">취소</button>
              <button onClick={() => {
                if (confirmConfig.isPrompt && confirmConfig.onPromptSubmit) {
                  confirmConfig.onPromptSubmit(promptInput);
                } else {
                  confirmConfig.onConfirm();
                }
                setConfirmModalOpen(false);
              }} className="px-4 py-2 bg-mint text-vault-bg rounded text-sm font-bold">확인</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Request Review Modal ── */}
      {reviewingRequest && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-vault-surface border border-vault-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-vault-border bg-vault-bg/50">
              <h3 className="text-lg font-bold text-text-primary">
                {reviewingRequestType === 'game' ? '게임' : reviewingRequestType === 'platform' ? '콘솔/플랫폼' : reviewingRequestType === 'company' ? '회사' : '수정 건의'} 검토
              </h3>
              <button onClick={() => setReviewingRequest(null)} className="text-text-muted hover:text-text-primary">
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto space-y-4">
              <div className="bg-vault-bg border border-vault-border rounded-lg p-4 mb-4">
                <p className="text-sm font-bold text-text-primary mb-1">요청자: {reviewingRequest.requestedBy?.name || '익명'}</p>
                <p className="text-xs text-text-secondary">요청일: {new Date(reviewingRequest.createdAt).toLocaleString()}</p>
              </div>

              {reviewingRequestType === 'game' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-text-muted mb-1">타이틀</label>
                    <input type="text" value={reviewingRequest.title || ''} onChange={e => setReviewingRequest({...reviewingRequest, title: e.target.value})} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-text-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text-muted mb-1">출시연도</label>
                      <input type="number" value={reviewingRequest.releaseYear || ''} onChange={e => setReviewingRequest({...reviewingRequest, releaseYear: parseInt(e.target.value)})} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-text-primary" />
                    </div>
                  </div>
                </>
              )}

              {reviewingRequestType === 'platform' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-text-muted mb-1">플랫폼명</label>
                    <input type="text" value={reviewingRequest.name || ''} onChange={e => setReviewingRequest({...reviewingRequest, name: e.target.value})} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-text-primary" />
                  </div>
                </>
              )}

              {reviewingRequestType === 'company' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-text-muted mb-1">회사명</label>
                    <input type="text" value={reviewingRequest.name || ''} onChange={e => setReviewingRequest({...reviewingRequest, name: e.target.value})} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-text-primary" />
                  </div>
                </>
              )}

              {reviewingRequestType === 'edit' ? (
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1">건의 사유</label>
                  <p className="text-sm text-text-primary bg-vault-bg border border-vault-border rounded p-3 mb-4 break-words whitespace-pre-wrap">{reviewingRequest.reason || '없음'}</p>
                  
                  <label className="block text-xs font-bold text-text-muted mb-1">수정 제안 데이터</label>
                  <pre className="text-[10px] text-text-primary bg-vault-bg border border-vault-border rounded p-3 overflow-x-auto whitespace-pre-wrap break-all">
                    {reviewingRequest.proposedData ? JSON.stringify(JSON.parse(reviewingRequest.proposedData), null, 2) : ''}
                  </pre>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1">설명 / 참고자료</label>
                  <textarea rows={6} value={reviewingRequest.description || ''} onChange={e => setReviewingRequest({...reviewingRequest, description: e.target.value})} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-text-primary resize-none" />
                </div>
              )}
            </div>

            <div className="flex justify-between gap-3 p-4 border-t border-vault-border bg-vault-bg/50">
              <button 
                onClick={async () => {
                  setPromptInput('');
                  setConfirmConfig({
                    message: '반려 사유를 입력하세요 (선택사항)',
                    isPrompt: true,
                    promptLabel: '사유',
                    onConfirm: () => {},
                    onPromptSubmit: async (reason) => {
                      setIsSubmitting(true);
                      try {
                        if (reviewingRequestType === 'game') await rejectGameRequest(reviewingRequest.id, reason);
                        if (reviewingRequestType === 'platform') await rejectPlatformRequest(reviewingRequest.id, reason);
                        if (reviewingRequestType === 'company') await rejectCompanyRequest(reviewingRequest.id, reason);
                        if (reviewingRequestType === 'edit') {
                          const { resolveEditRequest } = await import('@/app/actions/admin-dashboard');
                          await resolveEditRequest(reviewingRequest.id, 'REJECTED', reason);
                        }
                        window.location.reload();
                      } catch(e) { alert('오류 발생'); setIsSubmitting(false); }
                    }
                  });
                  setConfirmModalOpen(true);
                }}
                disabled={isSubmitting} 
                className="px-4 py-2 text-coral border border-coral/30 bg-coral/10 hover:bg-coral/20 rounded text-sm font-bold"
              >반려</button>
              
              <button 
                onClick={async () => {
                  setConfirmConfig({
                    message: '현재 내용으로 승인하시겠습니까? (자동으로 공개 처리됩니다)',
                    onConfirm: async () => {
                      setIsSubmitting(true);
                      try {
                        if (reviewingRequestType === 'game') {
                          const updateData = {
                            ...reviewingRequest,
                            platform: typeof reviewingRequest.platform === 'object' ? reviewingRequest.platform?.name : reviewingRequest.platform,
                            developer: typeof reviewingRequest.developer === 'object' ? reviewingRequest.developer?.name : reviewingRequest.developer,
                          };
                          await updateGame(reviewingRequest.id, updateData);
                          await approveGameRequest(reviewingRequest.id);
                        }
                        if (reviewingRequestType === 'platform') {
                          await approvePlatformRequest(reviewingRequest.id);
                        }
                        if (reviewingRequestType === 'company') {
                          await updateCompany(reviewingRequest.id, reviewingRequest);
                          await approveCompanyRequest(reviewingRequest.id);
                        }
                        if (reviewingRequestType === 'edit') {
                          const { resolveEditRequest } = await import('@/app/actions/admin-dashboard');
                          await resolveEditRequest(reviewingRequest.id, 'APPROVED', '관리자 승인');
                        }
                        window.location.reload();
                      } catch(e) { alert('오류 발생'); setIsSubmitting(false); }
                    }
                  });
                  setConfirmModalOpen(true);
                }}
                disabled={isSubmitting} 
                className="px-4 py-2 bg-mint text-vault-bg rounded text-sm font-bold"
              >정보 수정 및 승인</button>
            </div>
          </div>
        </div>
      )}
      {/* ── Platform Form Modal ── */}
      <AdminPlatformModal 
        isOpen={isPlatformModalOpen} 
        onClose={() => setIsPlatformModalOpen(false)} 
        initialData={editingPlatform} 
        onSave={async (data: any) => {
          setIsSubmitting(true);
          try {
            if (data.id) {
              const { updatePlatform } = require('@/app/actions/admin-extensions');
              await updatePlatform(data.id, data);
            } else {
              const { createPlatform } = require('@/app/actions/admin-extensions');
              await createPlatform(data);
            }
            window.location.reload();
          } catch (err: any) {
            alert(err.message || '오류 발생');
          } finally {
            setIsSubmitting(false);
          }
        }} 
        isSubmitting={isSubmitting}
        handleImageUpload={handleImageUpload}
        uploadingImage={uploadingImage}
      />
    </div>
  );
}
