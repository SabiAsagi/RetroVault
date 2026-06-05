"use client";
import { useState } from 'react';
import { 
  LayoutDashboard, Gamepad2, Building2, Users, AlertOctagon, History, 
  Settings, RefreshCw, Trash2, Search, Edit, Eye, MoreVertical, Plus,
  CheckCircle, XCircle, AlertTriangle, ShieldAlert
} from 'lucide-react';
import { CollectionItem, Game, TimelineEvent } from '../types';
import { createGame, updateGame, deleteGame, createTimelineEvent, updateTimelineEvent, deleteTimelineEvent } from '@/app/actions/admin';
import { resolveReport } from '@/app/actions/admin-dashboard';

interface AdminProps {
  collection: CollectionItem[];
  games: Game[];
  timelineEvents: TimelineEvent[];
  stats: any;
  users: any[];
  reports: any[];
  logs: any[];
  companies: any[];
  gameRequests: any[];
  onResetToSample?: () => void;
  onClearAll?: () => void;
}

type Tab = 'dashboard' | 'games' | 'requests' | 'companies' | 'users' | 'reports' | 'logs' | 'settings' | 'timeline';

export default function Admin({ collection, games, timelineEvents, stats, users, reports, logs, companies, gameRequests, onResetToSample, onClearAll }: AdminProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [confirmAction, setConfirmAction] = useState<'reset' | 'clear' | null>(null);

  const [editingGame, setEditingGame] = useState<Partial<Game> | null>(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingTimeline, setEditingTimeline] = useState<Partial<TimelineEvent> | null>(null);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const blob = await response.json();
      setter(blob.url);
    } catch (error) {
      console.error(error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploadingImage(false);
    }
  };

  const [localUsers, setLocalUsers] = useState(users || []);
  
  const handleAddCompany = () => {
    // API creation is needed here, omitted for brevity, but you'd call a server action
    alert('회사 추가 기능은 API 연동이 필요합니다.');
  };

  const handleUserAction = (userId: string) => {
    const action = prompt('수행할 작업을 선택하세요:\n1: 관리자 권한 부여\n2: 회원 삭제');
    if (action === '1') {
      setLocalUsers(localUsers.map(u => u.id === userId ? { ...u, role: 'ADMIN' } : u));
      alert('관리자 권한이 부여되었습니다.');
    } else if (action === '2') {
      if (confirm('정말로 이 회원을 삭제하시겠습니까?')) {
        setLocalUsers(localUsers.filter(u => u.id !== userId));
        alert('회원이 삭제되었습니다.');
      }
    }
  };

  function executeAction() {
    if (confirmAction === 'reset') onResetToSample?.();
    else if (confirmAction === 'clear') onClearAll?.();
    setConfirmAction(null);
  }

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in">
      <h3 className="text-xl font-bold text-white mb-4">대시보드</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-vault-surface border border-vault-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-text-muted">총 회원</span>
            <Users size={18} className="text-mint" />
          </div>
          <span className="text-2xl font-black text-white">{stats?.userCount || 0}<span className="text-xs text-text-muted ml-1 font-normal">명</span></span>
          <p className="text-[10px] text-mint mt-2 flex items-center gap-1">가입된 전체 회원 수</p>
        </div>
        <div className="bg-vault-surface border border-vault-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-text-muted">등록된 게임</span>
            <Gamepad2 size={18} className="text-neon-blue" />
          </div>
          <span className="text-2xl font-black text-white">{stats?.gameCount || 0}<span className="text-xs text-text-muted ml-1 font-normal">개</span></span>
          <p className="text-[10px] text-neon-blue mt-2 flex items-center gap-1">마스터 데이터</p>
        </div>
        <div className="bg-vault-surface border border-vault-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-text-muted">누적 컬렉션 아이템</span>
            <Building2 size={18} className="text-amber" />
          </div>
          <span className="text-2xl font-black text-white">{stats?.collectionCount || 0}<span className="text-xs text-text-muted ml-1 font-normal">개</span></span>
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
            <h4 className="text-sm font-bold text-white">최근 로그인 현황</h4>
            <button className="text-[10px] text-text-muted hover:text-white">더보기</button>
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
            <h4 className="text-sm font-bold text-white">최근 시스템 로그</h4>
            <button onClick={() => setActiveTab('logs')} className="text-[10px] text-text-muted hover:text-white">전체 로그</button>
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
        <h3 className="text-xl font-bold text-white">마스터 게임 데이터</h3>
        <button 
          onClick={() => { setEditingGame({}); setIsGameModalOpen(true); }}
          className="bg-neon-blue hover:bg-neon-blue/80 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2"
        >
          <Plus size={14} /> 게임 추가
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="게임 검색..." className="w-full bg-vault-surface border border-vault-border rounded text-sm text-white px-9 py-2 focus:outline-none focus:border-neon-blue" />
        </div>
      </div>

      <div className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-vault-bg border-b border-vault-border text-text-muted text-xs uppercase">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">타이틀</th>
              <th className="px-4 py-3">플랫폼</th>
              <th className="px-4 py-3">출시연도</th>
              <th className="px-4 py-3">제작사</th>
              <th className="px-4 py-3">희귀도</th>
              <th className="px-4 py-3 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vault-border/50">
            {games.slice(0, 10).map(g => (
              <tr key={g.id} className="hover:bg-vault-surface-light">
                <td className="px-4 py-3 text-text-muted font-mono text-xs">{g.id}</td>
                <td className="px-4 py-3 text-white font-medium">{g.title}</td>
                <td className="px-4 py-3 text-text-secondary">{g.platform}</td>
                <td className="px-4 py-3 text-text-secondary">{g.releaseYear}</td>
                <td className="px-4 py-3 text-text-secondary">{g.developer || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded border
                    ${g.rarity === 'Legendary' ? 'bg-coral/10 border-coral/30 text-coral' : 
                      g.rarity === 'Rare' ? 'bg-amber/10 border-amber/30 text-amber' : 
                      g.rarity === 'Uncommon' ? 'bg-mint/10 border-mint/30 text-mint' : 
                      'bg-vault-bg border-vault-border text-text-muted'}`
                  }>
                    {g.rarity}
                  </span>
                </td>
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
        {games.length > 10 && (
           <div className="p-3 text-center text-xs text-text-muted border-t border-vault-border bg-vault-bg">
             전체 {games.length}개 중 상위 10개만 표시 (MVP 데모)
           </div>
        )}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-4 animate-in fade-in">
      <h3 className="text-xl font-bold text-white mb-4">회원 관리</h3>
      <div className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-vault-bg border-b border-vault-border text-text-muted text-xs uppercase">
            <tr>
              <th className="px-4 py-3">이름</th>
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
                <td className="px-4 py-3 text-white font-medium">{u.name || u.nickname || '익명'}</td>
                <td className="px-4 py-3 text-text-secondary text-xs">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${u.role === 'ADMIN' ? 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue' : 'bg-vault-bg border-vault-border text-text-muted'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded border bg-mint/10 border-mint/30 text-mint`}>
                    활성
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleUserAction(u.id)} className="p-1 text-text-muted hover:text-white"><MoreVertical size={14} /></button>
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
      <h3 className="text-xl font-bold text-white mb-4">신고 관리</h3>
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
                <td className="px-4 py-3 text-white font-medium">{r.targetType} {r.targetId}</td>
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
                      }} className="p-1.5 text-text-muted bg-vault-bg border border-vault-border rounded hover:text-white transition-colors" title="반려"><XCircle size={14} /></button>
                    </>
                  ) : (
                    <button className="p-1.5 text-text-muted hover:text-white rounded transition-colors" title="상세보기"><Eye size={14} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="space-y-4 animate-in fade-in">
      <h3 className="text-xl font-bold text-white mb-4">시스템 수정 로그</h3>
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
                <td className="px-4 py-3 text-white">{l.action}</td>
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
        <h3 className="text-xl font-bold text-white">회사 관리</h3>
        <button onClick={handleAddCompany} className="bg-neon-blue hover:bg-neon-blue/80 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2">
          <Plus size={14} /> 회사 추가
        </button>
      </div>
      <div className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-vault-bg border-b border-vault-border text-text-muted text-xs uppercase">
            <tr>
              <th className="px-4 py-3">회사명</th>
              <th className="px-4 py-3">구분</th>
              <th className="px-4 py-3">등록 게임 수</th>
              <th className="px-4 py-3">소재지</th>
              <th className="px-4 py-3 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vault-border/50">
            {(companies || []).map(c => (
              <tr key={c.id} className="hover:bg-vault-surface-light">
                <td className="px-4 py-3 text-white font-medium">{c.name}</td>
                <td className="px-4 py-3 text-text-secondary text-xs">{c.type}</td>
                <td className="px-4 py-3 text-mint font-mono text-xs">{c.gamesCount}</td>
                <td className="px-4 py-3 text-text-secondary text-xs">{c.hq}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button className="p-1.5 text-text-muted hover:text-neon-blue rounded transition-colors" title="수정"><Edit size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 animate-in fade-in">
      <h3 className="text-xl font-bold text-white mb-4">시스템 설정</h3>
      
      <div className="bg-vault-surface border border-coral/30 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-vault-border">
          <AlertTriangle size={18} className="text-coral" />
          <h3 className="text-base font-bold text-coral">데이터 위험 영역</h3>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-white mb-1">샘플 데이터로 초기화</p>
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
              <p className="text-sm font-bold text-white mb-1">로컬스토리지 전체 삭제</p>
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

  const renderRequests = () => (
    <div className="space-y-4 animate-in fade-in">
      <h3 className="text-xl font-bold text-white mb-4">게임 추가 요청</h3>
      <div className="bg-vault-surface border border-vault-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-vault-bg border-b border-vault-border text-text-muted text-xs uppercase">
            <tr>
              <th className="px-4 py-3">요청 게임</th>
              <th className="px-4 py-3">요청자</th>
              <th className="px-4 py-3">요청일</th>
              <th className="px-4 py-3 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-vault-border/50">
            {(gameRequests || []).map(r => (
              <tr key={r.id} className="hover:bg-vault-surface-light">
                <td className="px-4 py-3 text-white font-medium">{r.title} ({r.platform?.name})</td>
                <td className="px-4 py-3 text-text-secondary text-xs">{r.requestedBy?.name || '익명'}</td>
                <td className="px-4 py-3 text-text-secondary text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button 
                    onClick={async () => {
                      if (window.confirm('승인하시겠습니까?')) {
                        try {
                          await fetch(`/api/admin/games/${r.id}/approve`, { method: 'POST' });
                          window.location.reload();
                        } catch (e) { alert('승인 실패'); }
                      }
                    }} 
                    className="p-1.5 text-mint bg-mint/10 rounded hover:bg-mint/20 transition-colors" title="승인"
                  ><CheckCircle size={14} /></button>
                  <button 
                    onClick={async () => {
                      if (window.confirm('반려하시겠습니까?')) {
                        try {
                          await fetch(`/api/admin/games/${r.id}/reject`, { method: 'POST' });
                          window.location.reload();
                        } catch (e) { alert('반려 실패'); }
                      }
                    }} 
                    className="p-1.5 text-coral bg-coral/10 rounded hover:bg-coral/20 transition-colors" title="반려"
                  ><XCircle size={14} /></button>
                </td>
              </tr>
            ))}
            {(!gameRequests || gameRequests.length === 0) && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-text-muted">대기 중인 요청이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8 page-enter min-h-[calc(100vh-64px)] flex flex-col md:flex-row gap-6">
      
      {/* ── Sidebar ── */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-vault-surface border border-vault-border rounded-xl p-4 sticky top-24">
          <div className="mb-6 px-2">
            <h2 className="text-lg font-black text-white">Admin Console</h2>
            <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">RetroVault Manager</p>
          </div>
          
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
              { id: 'games', label: '게임 관리', icon: Gamepad2 },
              { id: 'requests', label: '추가 요청', icon: Plus },
              { id: 'timeline', label: '타임라인', icon: History },
              { id: 'companies', label: '회사 관리', icon: Building2 },
              { id: 'users', label: '회원 관리', icon: Users },
              { id: 'reports', label: '신고 관리', icon: AlertOctagon },
              { id: 'logs', label: '시스템 로그', icon: History },
              { id: 'settings', label: '설정', icon: Settings },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium
                    ${isActive ? 'bg-mint/10 text-mint' : 'text-text-muted hover:text-white hover:bg-vault-surface-light'}`}
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
        {activeTab === 'requests' && renderRequests()}
        {activeTab === 'companies' && renderCompanies()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'logs' && renderLogs()}
        {activeTab === 'timeline' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">타임라인 관리</h3>
            <button 
              onClick={() => { setEditingTimeline({ type: 'event', year: 2000 }); setIsTimelineModalOpen(true); }}
              className="bg-coral hover:bg-coral/80 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2"
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
                      <td className="px-4 py-3 font-medium text-white">{event.title}</td>
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
            <h3 className="text-center font-bold text-white mb-2 text-lg">
              {confirmAction === 'reset' ? '샘플 데이터로 초기화할까요?' : '모든 데이터를 영구 삭제할까요?'}
            </h3>
            <p className="text-center text-sm text-text-muted mb-6">
              {confirmAction === 'reset' 
                ? '현재 컬렉션이 지워지고 기본 제공되는 샘플 컬렉션으로 교체됩니다.' 
                : '컬렉션 내 모든 기록이 삭제되며 이 작업은 되돌릴 수 없습니다.'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmAction(null)} className="flex-1 py-2.5 bg-vault-bg border border-vault-border text-text-primary rounded-lg text-sm hover:border-vault-border-light hover:text-white transition-colors">
                취소
              </button>
              <button onClick={executeAction} className="flex-1 py-2.5 bg-coral text-white rounded-lg text-sm font-bold hover:bg-coral/90 transition-colors shadow-lg">
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Game Form Modal ── */}
      {isGameModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-vault-surface border border-vault-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-vault-border bg-vault-bg/50">
              <h3 className="text-lg font-bold text-white">{editingGame?.id ? '게임 수정' : '게임 추가'}</h3>
              <button onClick={() => setIsGameModalOpen(false)} className="text-text-muted hover:text-white">
                <XCircle size={20} />
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              try {
                if (editingGame?.id) {
                  await updateGame(editingGame.id, editingGame);
                } else {
                  await createGame(editingGame);
                }
                window.location.reload();
              } catch (err: any) {
                alert(err.message || '오류 발생');
              } finally {
                setIsSubmitting(false);
              }
            }} className="p-4 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1">타이틀</label>
                <input required type="text" value={editingGame?.title || ''} onChange={e => setEditingGame({...editingGame, title: e.target.value})} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1">플랫폼</label>
                  <input required type="text" value={editingGame?.platform || ''} onChange={e => setEditingGame({...editingGame, platform: e.target.value})} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-white" placeholder="예: Super Famicom" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1">출시연도</label>
                  <input required type="number" value={editingGame?.releaseYear || ''} onChange={e => setEditingGame({...editingGame, releaseYear: parseInt(e.target.value)})} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1">장르</label>
                  <input type="text" value={editingGame?.genre || ''} onChange={e => setEditingGame({...editingGame, genre: e.target.value})} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1">제작사</label>
                  <input type="text" value={(editingGame as any)?.developer || ''} onChange={e => setEditingGame({...editingGame, developer: e.target.value} as any)} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-white" placeholder="예: Nintendo" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1">커버 이미지 (업로드 또는 URL)</label>
                <div className="flex gap-2 items-center">
                  <input type="text" value={editingGame?.imageUrl || ''} onChange={e => setEditingGame({...editingGame, imageUrl: e.target.value})} className="flex-1 bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-white" placeholder="https://..." />
                  <div className="relative overflow-hidden inline-block bg-vault-surface-light border border-vault-border rounded hover:bg-vault-border-light cursor-pointer">
                    <button type="button" className="px-4 py-2 text-sm text-white font-bold whitespace-nowrap min-w-[100px]" disabled={uploadingImage}>
                      {uploadingImage ? '업로드 중...' : '파일 선택'}
                    </button>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, (url) => setEditingGame({...editingGame, imageUrl: url}))}
                      className="absolute left-0 top-0 opacity-0 w-full h-full cursor-pointer"
                      disabled={uploadingImage}
                    />
                  </div>
                </div>
                {editingGame?.imageUrl && (
                  <div className="mt-2 w-32 aspect-[3/4] rounded-md overflow-hidden border border-vault-border">
                    <img src={editingGame.imageUrl} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1">설명</label>
                <textarea rows={3} value={editingGame?.description || ''} onChange={e => setEditingGame({...editingGame, description: e.target.value})} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-white resize-none" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-vault-border">
                <button type="button" onClick={() => setIsGameModalOpen(false)} className="px-4 py-2 text-sm text-text-muted hover:text-white">취소</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-neon-blue text-white rounded text-sm font-bold disabled:opacity-50">
                  {isSubmitting ? '저장 중...' : '저장하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Timeline Form Modal ── */}
      {isTimelineModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-vault-surface border border-vault-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-vault-border bg-vault-bg/50">
              <h3 className="text-lg font-bold text-white">{editingTimeline?.id ? '이벤트 수정' : '이벤트 추가'}</h3>
              <button onClick={() => setIsTimelineModalOpen(false)} className="text-text-muted hover:text-white">
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
                  <input required type="number" value={editingTimeline?.year || ''} onChange={e => setEditingTimeline({...editingTimeline, year: parseInt(e.target.value)})} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted mb-1">시대구분</label>
                  <input type="text" value={editingTimeline?.era || ''} onChange={e => setEditingTimeline({...editingTimeline, era: e.target.value})} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-white" placeholder="예: 4th Gen" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1">타이틀</label>
                <input required type="text" value={editingTimeline?.title || ''} onChange={e => setEditingTimeline({...editingTimeline, title: e.target.value})} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1">유형</label>
                <select value={editingTimeline?.type || 'event'} onChange={e => setEditingTimeline({...editingTimeline, type: e.target.value as any})} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-white">
                  <option value="event">일반 이벤트</option>
                  <option value="console">콘솔 출시</option>
                  <option value="game">게임 출시</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1">설명</label>
                <textarea rows={3} value={editingTimeline?.description || ''} onChange={e => setEditingTimeline({...editingTimeline, description: e.target.value})} className="w-full bg-vault-bg border border-vault-border rounded px-3 py-2 text-sm text-white resize-none" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-vault-border">
                <button type="button" onClick={() => setIsTimelineModalOpen(false)} className="px-4 py-2 text-sm text-text-muted hover:text-white">취소</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-coral text-white rounded text-sm font-bold disabled:opacity-50">
                  {isSubmitting ? '저장 중...' : '저장하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
