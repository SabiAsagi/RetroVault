"use client";
import React, { useState } from 'react';
import {
  Home, Archive, Clock, BookOpen, BarChart3,
  Trophy, User, Settings, Search,
  Database, X, Menu, LogIn, ChevronDown, Bell
} from 'lucide-react';
import { Tab } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

interface NavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

interface NavItem {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  color: string;
  group?: 'main' | 'user' | 'admin';
}

const navItems: NavItem[] = [
  { id: 'dashboard',    label: '홈',           icon: <Home size={16} />,       color: '#4AEDC4', group: 'main' },
  { id: 'archive',      label: '게임 아카이브', icon: <Archive size={16} />,    color: '#4EA8FF', group: 'main' },
  { id: 'timeline',     label: '레트로 타임라인',icon: <Clock size={16} />,     color: '#A78BFA', group: 'main' },
  { id: 'vault',        label: '내 컬렉션',    icon: <BookOpen size={16} />,   color: '#FFB547', group: 'user' },
  { id: 'stats',        label: '컬렉션 분석',  icon: <BarChart3 size={16} />,  color: '#FF6B6B', group: 'user' },
  { id: 'achievements', label: '업적',         icon: <Trophy size={16} />,     color: '#FFB547', group: 'user' },
  { id: 'profile',      label: '프로필',       icon: <User size={16} />,       color: '#4EA8FF', group: 'user' },
  { id: 'admin',        label: '관리자',       icon: <Settings size={16} />,   color: '#FF6B6B', group: 'admin' },
];

const bottomTabIds: Tab[] = ['dashboard', 'archive', 'vault', 'achievements', 'profile'];

export default function Navigation({ activeTab, onTabChange, searchQuery, onSearchChange }: NavProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated, logout } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => {
          if (data.notifications) {
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
          }
        })
        .catch(console.error);
    }
  }, [isAuthenticated]);

  const handleMarkAllAsRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH' });
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = async (id: string, link: string | null) => {
    await fetch(`/api/notifications?id=${id}`, { method: 'PATCH' });
    setUnreadCount(prev => Math.max(0, prev - 1));
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setNotificationsOpen(false);
    if (link) {
      window.location.href = link;
    }
  };

  const handleTabChange = (tab: Tab) => {
    onTabChange(tab);
    setSidebarOpen(false);
  };

  const activeItem = navItems.find(n => n.id === activeTab);

  return (
    <>
      {/* ─── TOP HEADER ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass-panel border-b border-vault-border">
        <div className="flex items-center h-14 px-4 gap-3 max-w-screen-2xl mx-auto">

          {/* Hamburger (mobile < lg) */}
          <button
            id="nav-hamburger"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-vault-surface border border-vault-border text-text-secondary hover:text-mint hover:border-mint/40 transition-all shrink-0"
            aria-label="메뉴 열기"
          >
            <Menu size={17} />
          </button>

          {/* Logo */}
          <button
            onClick={() => handleTabChange('dashboard')}
            className="flex items-center gap-2 shrink-0 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-mint to-neon-blue flex items-center justify-center crt-lines shadow-md neon-mint">
              <span className="font-pixel text-[8px] text-vault-bg font-bold">RV</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-pixel text-[9px] text-text-primary group-hover:text-mint transition-colors leading-none">
                RetroVault
              </h1>
              <p className="text-[8px] text-text-muted leading-none mt-0.5 tracking-wider">DIGITAL MUSEUM</p>
            </div>
          </button>

          {/* Current page (xs only) */}
          <span className="sm:hidden text-sm font-semibold text-text-secondary truncate flex-1">
            {activeItem?.label}
          </span>

          {/* Search */}
          <div className="relative flex-1 max-w-lg hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            <input
              id="nav-search"
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="게임, 플랫폼, 개발사 검색..."
              className="w-full bg-vault-surface/80 border border-vault-border rounded-lg pl-8 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-mint/50 focus:ring-1 focus:ring-mint/20 transition-all"
            />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            {/* Data source */}
            <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-full bg-mint/10 border border-mint/20 text-mint text-[10px] font-medium">
              <Database size={11} />
              <span className="tracking-wide">LOCAL</span>
            </div>

            <ThemeToggle />

            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => { setNotificationsOpen(!notificationsOpen); setDropdownOpen(false); }}
                  className="relative p-2 rounded-lg text-text-muted hover:bg-vault-surface-light hover:text-text-primary transition-colors cursor-pointer"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1.5 w-2 h-2 bg-coral rounded-full shadow-[0_0_8px_rgba(255,107,107,0.8)]" />
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 md:w-80 bg-vault-surface border border-vault-border rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-vault-border/50 bg-vault-surface-light">
                      <h3 className="text-sm font-bold text-text-primary">알림</h3>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllAsRead} className="text-xs text-mint hover:text-mint-dim transition-colors">
                          모두 읽음표시
                        </button>
                      )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-text-muted">
                          새로운 알림이 없습니다.
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => handleNotificationClick(n.id, n.link)}
                            className={`px-4 py-3 border-b border-vault-border/30 hover:bg-vault-surface-light cursor-pointer transition-colors ${!n.isRead ? 'bg-mint/5' : ''}`}
                          >
                            <p className={`text-sm ${!n.isRead ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                              {n.message}
                            </p>
                            <p className="text-[10px] text-text-muted mt-1">
                              {new Date(n.createdAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Login / User Info */}
            {!isAuthenticated ? (
              <button
                id="login-btn"
                onClick={() => window.location.href = '/login'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-mint text-vault-bg text-xs font-bold hover:bg-mint-dim transition-colors"
              >
                <LogIn size={13} />
                <span className="hidden sm:inline">로그인</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => { setDropdownOpen(!dropdownOpen); setNotificationsOpen(false); }}
                  className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg hover:bg-vault-surface-light transition-colors border border-transparent hover:border-vault-border cursor-pointer"
                >
                  <img src={user?.avatar || (user as any)?.picture || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.id || 'RetroMaster'}&backgroundColor=1A1A1A`} alt={user?.nickname} className="w-6 h-6 rounded-md bg-vault-bg border border-vault-border object-cover" />
                  <span className="hidden sm:block text-xs font-bold text-text-primary max-w-[80px] truncate">{user?.nickname}</span>
                  <ChevronDown size={14} className="text-text-muted" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-vault-surface border border-vault-border rounded-xl shadow-2xl py-1 z-50">
                    <div className="px-4 py-2 border-b border-vault-border/50 mb-1">
                      <p className="text-sm font-bold text-text-primary truncate">{user?.nickname}</p>
                      <p className="text-[10px] text-text-muted truncate">{user?.email}</p>
                    </div>
                    <button onClick={() => { setDropdownOpen(false); handleTabChange('profile'); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-vault-surface-light hover:text-text-primary flex items-center gap-2">
                      <User size={14} /> 내 프로필
                    </button>
                    <button onClick={() => { setDropdownOpen(false); handleTabChange('settings'); }} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-vault-surface-light hover:text-text-primary flex items-center gap-2">
                      <Settings size={14} /> 설정
                    </button>
                    <div className="h-px bg-vault-border/50 my-1" />
                    <button onClick={() => { setDropdownOpen(false); logout(); }} className="w-full text-left px-4 py-2 text-sm text-coral hover:bg-coral/10 flex items-center gap-2">
                      <LogIn size={14} className="rotate-180" /> 로그아웃
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── HORIZONTAL TABS (desktop lg+) ────────────────────────────── */}
        <nav className="hidden lg:flex items-center gap-0 px-4 max-w-screen-2xl mx-auto border-t border-vault-border/40 overflow-x-auto">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => handleTabChange(item.id)}
                className={`relative flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap transition-all cursor-pointer group ${
                  isActive ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <span style={isActive ? { color: item.color } : {}} className="transition-colors">
                  {item.icon}
                </span>
                {item.label}

                {/* Separator before admin */}
                {item.id === 'admin' && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-5 bg-vault-border" />
                )}

                {/* Active underline */}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-t"
                    style={{ background: `linear-gradient(90deg, ${item.color}, transparent)` }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* ─── MOBILE SEARCH BAR (sm) ─────────────────────────────────────── */}
      <div className="sm:hidden px-4 py-2 bg-vault-bg border-b border-vault-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="게임, 플랫폼 검색..."
            className="w-full bg-vault-surface border border-vault-border rounded-lg pl-8 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-mint/50 transition-all"
          />
        </div>
      </div>

      {/* ─── SIDEBAR BACKDROP ───────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── SLIDE-IN SIDEBAR ───────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 z-[70] h-full w-72 glass-panel border-r border-vault-border shadow-2xl lg:hidden transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-vault-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-mint to-neon-blue flex items-center justify-center crt-lines shadow">
              <span className="font-pixel text-[7px] text-vault-bg font-bold">RV</span>
            </div>
            <div>
              <p className="font-pixel text-[8px] text-text-primary">RetroVault</p>
              <p className="text-[8px] text-text-muted">DIGITAL MUSEUM</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-vault-surface-light transition-all">
            <X size={17} />
          </button>
        </div>

        {/* Nav */}
        <nav className="py-3 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <React.Fragment key={item.id}>
                {item.id === 'admin' && (
                  <div className="my-2 border-t border-vault-border/60" />
                )}
                <button
                  id={`sidebar-${item.id}`}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-vault-surface-light text-text-primary'
                      : 'text-text-secondary hover:bg-vault-surface-light hover:text-text-primary'
                  }`}
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={isActive
                      ? { backgroundColor: `${item.color}18`, color: item.color, border: `1px solid ${item.color}33` }
                      : { backgroundColor: 'var(--color-vault-surface-light)', color: 'var(--color-text-muted)' }
                    }
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-5 rounded-full" style={{ background: `linear-gradient(180deg, ${item.color}, transparent)` }} />
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-vault-border bg-vault-surface/80">
          <div className="flex items-center justify-between">
            <button
              onClick={() => { window.location.href = '/login'; setSidebarOpen(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-mint text-vault-bg text-xs font-bold hover:bg-mint-dim transition-colors"
            >
              <LogIn size={13} />
              로그인
            </button>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* ─── BOTTOM TAB BAR (< sm) ──────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden glass-panel border-t border-vault-border safe-area-inset-bottom">
        <div className="flex items-stretch h-14">
          {bottomTabIds.map(tabId => {
            const item = navItems.find(n => n.id === tabId)!;
            const isActive = activeTab === tabId;
            return (
              <button
                key={tabId}
                id={`bottom-tab-${tabId}`}
                onClick={() => handleTabChange(tabId)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all relative"
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b" style={{ background: item.color }} />
                )}
                <span style={isActive ? { color: item.color } : { color: 'var(--color-text-muted)' }} className="scale-125 inline-flex">
                  {item.icon}
                </span>
                <span className="text-[9px] font-medium" style={isActive ? { color: item.color } : { color: 'var(--color-text-muted)' }}>
                  {item.label.replace('게임 아카이브', '아카이브').replace('레트로 타임라인', '타임라인')}
                </span>
              </button>
            );
          })}
        </div>
      </nav>


      <AuthModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
