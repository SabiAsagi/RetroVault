"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Archive, Clock, BookOpen, BarChart3,
  Trophy, User, Users, Settings, Search,
  Database, X, Menu, LogIn, ChevronDown, Loader2
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useSession, signOut } from 'next-auth/react';
import { useDebounce } from '@/hooks/useDebounce';
import { LogoIcon } from './LogoIcon';

interface NavItem {
  id: string;
  path: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  group?: 'main' | 'user' | 'admin';
}

const navItems: NavItem[] = [
  { id: 'dashboard', path: '/', label: '홈', icon: <Home size={16} />, color: '#4AEDC4', group: 'main' },
  { id: 'archive', path: '/games', label: '게임 아카이브', icon: <Archive size={16} />, color: '#4EA8FF', group: 'main' },
  { id: 'consoles', path: '/platforms', label: '콘솔/플랫폼 아카이브', icon: <Database size={16} />, color: '#A78BFA', group: 'main' },
  { id: 'companies', path: '/companies', label: '게임 제작사 아카이브', icon: <Archive size={16} />, color: '#FFB547', group: 'main' },
  { id: 'community', path: '/community', label: '유저 컬렉션 탐색', icon: <User size={16} />, color: '#FFB547', group: 'main' },
  { id: 'timeline', path: '/timeline', label: '레트로 타임라인', icon: <Clock size={16} />, color: '#A78BFA', group: 'main' },

  { id: 'profile', path: '/profile/me', label: '프로필', icon: <User size={16} />, color: '#4EA8FF', group: 'user' },
  { id: 'friends', path: '/friends', label: '친구', icon: <Users size={16} />, color: '#4AEDC4', group: 'user' },
  { id: 'vault', path: '/collection', label: '내 컬렉션', icon: <BookOpen size={16} />, color: '#FFB547', group: 'user' },
  { id: 'stats', path: '/stats', label: '컬렉션 분석', icon: <BarChart3 size={16} />, color: '#FF6B6B', group: 'user' },
  { id: 'achievements', path: '/achievements', label: '업적', icon: <Trophy size={16} />, color: '#FFB547', group: 'user' },

  { id: 'admin', path: '/admin', label: '관리자', icon: <Settings size={16} />, color: '#FF6B6B', group: 'admin' },
];

import { getGameSlug, getPlatformSlug, getCompanySlug } from '@/lib/slug';

type SearchCategory = 'all' | 'game' | 'platform' | 'company' | 'user' | 'collection';

const searchCategories: { value: SearchCategory; label: string; path?: string }[] = [
  { value: 'all', label: '전체', path: '/games' },
  { value: 'game', label: '게임', path: '/games' },
  { value: 'platform', label: '플랫폼', path: '/platforms' },
  { value: 'company', label: '회사', path: '/companies' },
  { value: 'user', label: '유저', path: '/community' },
  { value: 'collection', label: '컬렉션', path: '/community' },
];

const bottomTabIds = ['dashboard', 'archive', 'consoles', 'community', 'timeline'];

const bottomTabLabels: Record<string, string> = {
  dashboard: '홈',
  archive: '게임',
  consoles: '플랫폼',
  community: '커뮤니티',
  timeline: '타임라인',
};

export default function NavigationApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = session?.user;
  const isAuthenticated = !!user;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<SearchCategory>('all');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  React.useEffect(() => {
    if (debouncedSearch.length >= 2) {
      setIsSearching(true);
      fetch(`/api/search?q=${encodeURIComponent(debouncedSearch)}${searchCategory === 'all' ? '' : `&type=${searchCategory}`}`)
        .then(res => res.json())
        .then(data => setSearchResults(data))
        .catch(console.error)
        .finally(() => setIsSearching(false));
    } else {
      setSearchResults(null);
    }
  }, [debouncedSearch, searchCategory]);

  const getActiveItemId = () => {
    const item = navItems.find(n => n.path !== '/' && pathname.startsWith(n.path));
    if (item) return item.id;
    if (pathname === '/') return 'dashboard';
    return '';
  };

  const activeTabId = getActiveItemId();

  const handleNavClick = (path: string) => {
    if (path === '/games') {
      sessionStorage.removeItem('archive-platforms');
      sessionStorage.removeItem('archive-genre');
      sessionStorage.removeItem('archive-country');
      sessionStorage.removeItem('archive-developer');
      sessionStorage.removeItem('archive-publisher');
      sessionStorage.removeItem('archive-search');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 glass-panel border-b border-vault-border bg-vault-bg/80 backdrop-blur-md">
        <div className="flex items-center h-14 px-2 sm:px-4 gap-2 sm:gap-3 max-w-screen-2xl mx-auto">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-vault-surface border border-vault-border text-text-secondary hover:text-mint hover:border-mint/40 transition-all shrink-0"
          >
            <Menu size={17} />
          </button>

          <Link href="/" className="flex items-center gap-2 shrink-0 group cursor-pointer">
            <LogoIcon size={36} />
            <div className="hidden sm:block">
              <h1 className="font-pixel text-xs text-text-primary group-hover:text-mint transition-colors leading-none mb-1">
                RetroVault
              </h1>
              <p className="text-[9px] text-text-muted leading-none tracking-wider">DIGITAL MUSEUM</p>
            </div>
          </Link>

          {/* Global Search Bar */}
          <div className="relative min-w-0 flex-1 max-w-xl mx-0 sm:mx-6 z-[80]">
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value as SearchCategory)}
              onFocus={() => setSearchFocused(true)}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 rounded-md border border-vault-border bg-vault-bg px-2 text-[11px] font-bold text-text-secondary focus:outline-none focus:border-mint"
              aria-label="검색 카테고리"
            >
              {searchCategories.map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
            <Search className="absolute left-[6.6rem] top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input
              type="text"
              placeholder="통합 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  const category = searchCategories.find(c => c.value === searchCategory);
                  const path = category?.path || '/games';
                  const typeParam = searchCategory !== 'all' ? `&type=${searchCategory}` : '';
                  window.location.href = `${path}?q=${encodeURIComponent(searchQuery.trim())}${typeParam}`;
                  setSearchFocused(false);
                }
              }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              className="w-full bg-vault-surface/80 border border-vault-border rounded-lg pl-32 pr-9 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-mint transition-all"
              aria-label="통합 검색"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-mint animate-spin" size={14} />
            )}

            {searchFocused && searchResults && (
              <div className="fixed left-3 right-3 top-16 mt-0 bg-vault-surface border border-vault-border rounded-xl shadow-2xl overflow-hidden max-h-[calc(100vh-8rem)] overflow-y-auto sm:absolute sm:left-auto sm:right-auto sm:top-full sm:mt-2 sm:w-full sm:max-h-[70vh]">
                {searchResults.games?.length > 0 && (
                  <div className="p-2 border-b border-vault-border/50">
                    <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 px-2">게임</h3>
                    {searchResults.games.map((game: any) => (
                      <Link href={`/games/${getGameSlug(game)}`} key={game.id} className="flex items-center gap-2 px-2 py-2 hover:bg-vault-surface-light rounded-lg transition-colors" onClick={() => setSearchFocused(false)}>
                        <p className="text-sm text-text-primary">{game.title}</p>
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.platforms?.length > 0 && (
                  <div className="p-2 border-b border-vault-border/50">
                    <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 px-2">플랫폼</h3>
                    {searchResults.platforms.map((platform: any) => (
                      <Link href={`/platforms/${getPlatformSlug(platform)}`} key={platform.id} className="flex items-center gap-2 px-2 py-2 hover:bg-vault-surface-light rounded-lg transition-colors" onClick={() => setSearchFocused(false)}>
                        <p className="text-sm text-text-primary">{platform.name}</p>
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.companies?.length > 0 && (
                  <div className="p-2 border-b border-vault-border/50">
                    <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 px-2">회사</h3>
                    {searchResults.companies.map((company: any) => (
                      <Link href={`/companies/${getCompanySlug(company)}`} key={company.id} className="flex items-center gap-2 px-2 py-2 hover:bg-vault-surface-light rounded-lg transition-colors" onClick={() => setSearchFocused(false)}>
                        <p className="text-sm text-text-primary">{company.name}</p>
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.users?.length > 0 && (
                  <div className="p-2 border-b border-vault-border/50">
                    <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 px-2">유저</h3>
                    {searchResults.users.map((u: any) => (
                      <Link href={`/profile/${u.nickname || u.name || u.id}`} key={u.id} className="flex items-center gap-2 px-2 py-2 hover:bg-vault-surface-light rounded-lg transition-colors">
                        <p className="text-sm text-text-primary">{u.nickname || u.name}</p>
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.groups?.length > 0 && (
                  <div className="p-2 border-b border-vault-border/50">
                    <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 px-2">공개 컬렉션</h3>
                    {searchResults.groups.map((grp: any) => (
                      <Link href={`/profile/${grp.user?.nickname || grp.user?.name || grp.userId}?group=${grp.id}`} key={grp.id} className="flex items-center gap-2 px-2 py-2 hover:bg-vault-surface-light rounded-lg transition-colors">
                        <p className="text-sm text-text-primary">{grp.name}</p>
                        <span className="text-[10px] text-text-muted">by {grp.user?.nickname || grp.user?.name || 'User'}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {(!searchResults.games?.length && !searchResults.platforms?.length && !searchResults.users?.length && !searchResults.companies?.length && !searchResults.groups?.length) && (
                  <div className="p-6 text-center text-sm text-text-muted">검색 결과가 없습니다.</div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            <div className="hidden sm:block"><ThemeToggle /></div>
            {!isAuthenticated ? (
              <Link href="/login" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-mint text-vault-bg text-xs font-bold hover:bg-mint-dim transition-colors">
                <LogIn size={13} />
                <span className="hidden sm:inline">로그인</span>
              </Link>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg hover:bg-vault-surface-light transition-colors border border-transparent hover:border-vault-border cursor-pointer"
                >
                  <img
                    src={user?.image || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${(user as any)?.id || 'RetroMaster'}&backgroundColor=1A1A1A`}
                    alt={user?.name || 'User'}
                    className="w-6 h-6 rounded-md bg-vault-bg border border-vault-border object-cover"
                  />
                  <span className="hidden sm:block text-xs font-bold text-text-primary max-w-[80px] truncate">{(user as any)?.nickname || user?.name}</span>
                  <ChevronDown size={14} className="text-text-muted" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-vault-surface border border-vault-border rounded-xl shadow-2xl py-1 z-50">
                    <div className="px-4 py-2 border-b border-vault-border/50 mb-1">
                      <p className="text-sm font-bold text-text-primary truncate">{(user as any)?.nickname || user?.name}</p>
                      <p className="text-[10px] text-text-muted truncate">{user?.email}</p>
                    </div>
                    {navItems.filter(item => item.group === 'user').map(item => (
                      <Link
                        key={item.id}
                        href={item.id === 'profile' ? `/profile/${(user as any)?.nickname || user?.name || user?.id}` : item.path}
                        onClick={() => setDropdownOpen(false)}
                        className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-vault-surface-light flex items-center gap-2"
                      >
                        {item.icon} {item.label}
                      </Link>
                    ))}
                    <div className="h-px bg-vault-border/50 my-1" />
                    <button
                      onClick={() => { setDropdownOpen(false); signOut(); }}
                      className="w-full text-left px-4 py-2 text-sm text-coral hover:bg-coral/10 flex items-center gap-2 cursor-pointer"
                    >
                      <LogIn size={14} className="rotate-180" /> 로그아웃
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-0 px-4 max-w-screen-2xl mx-auto border-t border-vault-border/40 overflow-x-auto">
          {navItems.filter(item => item.group === 'main' || item.group === 'admin').map(item => {
            const isActive = activeTabId === item.id;
            if (item.id === 'admin' && (user as any)?.role !== 'ADMIN' && (user as any)?.role !== 'INFO_MANAGER' && (user as any)?.role !== 'USER_MANAGER' && (user as any)?.role !== 'MODERATOR') return null;
            return (
              <Link
                href={item.path}
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className={`relative flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap transition-all cursor-pointer group ${
                  isActive ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <span style={isActive ? { color: item.color } : {}} className="transition-colors">
                  {item.icon}
                </span>
                {item.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-t"
                    style={{ background: `linear-gradient(90deg, ${item.color}, transparent)` }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </header>

      {sidebarOpen && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 z-[70] h-full w-72 glass-panel border-r border-vault-border shadow-2xl lg:hidden transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 h-14 border-b border-vault-border">
          <div className="flex items-center gap-2.5">
            <LogoIcon size={28} />
            <div>
              <p className="font-pixel text-[8px] text-text-primary">RetroVault</p>
              <p className="text-[8px] text-text-muted">DIGITAL MUSEUM</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary transition-all">
            <X size={17} />
          </button>
        </div>

        <nav className="py-3 px-3 space-y-0.5 overflow-y-auto">
          {navItems.filter(item => item.group === 'main' || item.group === 'admin').map(item => {
            const isActive = activeTabId === item.id;
            if (item.id === 'admin' && (user as any)?.role !== 'ADMIN' && (user as any)?.role !== 'INFO_MANAGER' && (user as any)?.role !== 'USER_MANAGER' && (user as any)?.role !== 'MODERATOR') return null;
            return (
              <Link
                href={item.path}
                key={item.id}
                onClick={() => {
                  handleNavClick(item.path);
                  setSidebarOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive ? 'bg-vault-surface-light text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary hover:bg-vault-surface/50'
                }`}
              >
                <span style={isActive ? { color: item.color } : {}}>{item.icon}</span>
                <span className="font-bold text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-vault-border bg-vault-bg/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
        aria-label="하단 탭 네비게이션"
      >
        <div className="grid h-16 grid-cols-5 max-w-screen-sm mx-auto">
          {bottomTabIds.map(id => {
            const item = navItems.find(navItem => navItem.id === id);
            if (!item) return null;
            const isActive = activeTabId === item.id;
            return (
              <Link
                key={item.id}
                href={item.path}
                onClick={() => handleNavClick(item.path)}
                aria-label={item.label}
                className={`relative flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-[10px] font-bold transition-colors ${
                  isActive ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 h-0.5 w-8 rounded-b-full" style={{ backgroundColor: item.color }} />
                )}
                <span style={isActive ? { color: item.color } : {}} className="flex h-5 items-center justify-center">
                  {item.icon}
                </span>
                <span className="block max-w-full truncate leading-none">
                  {bottomTabLabels[item.id] || item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
