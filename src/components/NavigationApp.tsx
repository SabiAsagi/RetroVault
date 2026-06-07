"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getGameSlug } from '@/lib/slug';
import {
  Home, Archive, Clock, BookOpen, BarChart3,
  Trophy, User, Users, Settings, Search, Mail,
  Database, X, Menu, LogIn, ChevronDown, Loader2
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useSession, signOut } from 'next-auth/react';
import { useDebounce } from '@/hooks/useDebounce';

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
  { id: 'consoles', path: '/platforms', label: '콘솔 아카이브', icon: <Database size={16} />, color: '#A78BFA', group: 'main' },
  { id: 'companies', path: '/companies', label: '게임 제작사 아카이브', icon: <Archive size={16} />, color: '#FFB547', group: 'main' },
  { id: 'community', path: '/community', label: '유저 컬렉션 탐색', icon: <User size={16} />, color: '#FFB547', group: 'main' },
  { id: 'timeline', path: '/timeline', label: '레트로 타임라인', icon: <Clock size={16} />, color: '#A78BFA', group: 'main' },
  
  // User Menu order: 프로필 / 친구 / 내 컬렉션 / 컬렉션 분석 / 업적
  { id: 'profile', path: '/profile/me', label: '프로필', icon: <User size={16} />, color: '#4EA8FF', group: 'user' },
  { id: 'friends', path: '/friends', label: '친구', icon: <Users size={16} />, color: '#4AEDC4', group: 'user' },
  { id: 'vault', path: '/collection', label: '내 컬렉션', icon: <BookOpen size={16} />, color: '#FFB547', group: 'user' },
  { id: 'stats', path: '/stats', label: '컬렉션 분석', icon: <BarChart3 size={16} />, color: '#FF6B6B', group: 'user' },
  { id: 'achievements', path: '/achievements', label: '업적', icon: <Trophy size={16} />, color: '#FFB547', group: 'user' },
  
  { id: 'admin', path: '/admin', label: '관리자', icon: <Settings size={16} />, color: '#FF6B6B', group: 'admin' },
];

const bottomTabIds = ['dashboard', 'archive', 'consoles', 'community', 'timeline'];

export default function NavigationApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = session?.user;
  const isAuthenticated = !!user;

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  React.useEffect(() => {
    if (debouncedSearch.length >= 2) {
      setIsSearching(true);
      fetch(`/api/search?q=${encodeURIComponent(debouncedSearch)}`)
        .then(res => res.json())
        .then(data => setSearchResults(data))
        .catch(console.error)
        .finally(() => setIsSearching(false));
    } else {
      setSearchResults(null);
    }
  }, [debouncedSearch]);

  const getActiveItemId = () => {
    const item = navItems.find(n => n.path !== '/' && pathname.startsWith(n.path));
    if (item) return item.id;
    if (pathname === '/') return 'dashboard';
    return '';
  };

  const activeTabId = getActiveItemId();
  const activeItem = navItems.find(n => n.id === activeTabId);

  return (
    <>
      <header className="sticky top-0 z-50 glass-panel border-b border-vault-border bg-vault-bg/80 backdrop-blur-md">
        <div className="flex items-center h-14 px-4 gap-3 max-w-screen-2xl mx-auto">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-vault-surface border border-vault-border text-text-secondary hover:text-mint hover:border-mint/40 transition-all shrink-0"
          >
            <Menu size={17} />
          </button>

          <Link href="/" className="flex items-center gap-2 shrink-0 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-mint to-neon-blue flex items-center justify-center crt-lines shadow-md neon-mint">
              <span className="font-pixel text-[8px] text-vault-bg font-bold">RV</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-pixel text-[9px] text-text-primary group-hover:text-mint transition-colors leading-none">
                RetroVault
              </h1>
              <p className="text-[8px] text-text-muted leading-none mt-0.5 tracking-wider">DIGITAL MUSEUM</p>
            </div>
          </Link>

          <span className="sm:hidden text-sm font-semibold text-text-secondary truncate flex-1">
            {activeItem?.label}
          </span>

          <div className="relative flex-1 max-w-lg hidden sm:block z-[80]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            <input
              type="text"
              placeholder="게임명, 회사, 유저 등 통합 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              className="w-full bg-vault-surface/80 border border-vault-border rounded-lg pl-8 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-mint transition-all"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-mint animate-spin" size={14} />
            )}
            
            {searchFocused && searchResults && (
              <div className="absolute top-full mt-2 w-full bg-vault-surface border border-vault-border rounded-xl shadow-2xl overflow-hidden max-h-[70vh] overflow-y-auto">
                {searchResults.games?.length > 0 && (
                  <div className="p-2 border-b border-vault-border/50">
                    <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 px-2">게임</h3>
                    {searchResults.games.map((g: any) => (
                      <Link href={`/games/${getGameSlug(g)}`} key={g.id} className="flex items-center gap-3 px-2 py-2 hover:bg-vault-surface-light rounded-lg transition-colors">
                        {g.coverImageUrl ? (
                          <img src={g.coverImageUrl} className="w-8 h-10 object-cover rounded" />
                        ) : (
                          <div className="w-8 h-10 bg-vault-bg rounded border border-vault-border" />
                        )}
                        <div>
                          <p className="text-sm font-bold text-text-primary leading-tight">{g.title}</p>
                          <p className="text-xs text-text-secondary">{g.platform?.name}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                
                {searchResults.users?.length > 0 && (
                  <div className="p-2 border-b border-vault-border/50">
                    <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 px-2">유저</h3>
                    {searchResults.users.map((u: any) => (
                      <Link href={`/profile/${u.nickname || u.id}`} key={u.id} className="flex items-center gap-2 px-2 py-2 hover:bg-vault-surface-light rounded-lg transition-colors">
                        <img src={u.image || u.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.id || 'User'}&backgroundColor=1A1A1A`} alt={u.nickname} className="w-6 h-6 rounded-md object-cover border border-vault-border" />
                        <p className="text-sm text-text-primary">{u.nickname}</p>
                      </Link>
                    ))}
                  </div>
                )}
                
                {searchResults.companies?.length > 0 && (
                  <div className="p-2 border-b border-vault-border/50">
                    <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 px-2">회사</h3>
                    {searchResults.companies.map((c: any) => (
                      <div key={c.id} className="flex items-center gap-2 px-2 py-2 hover:bg-vault-surface-light rounded-lg transition-colors">
                        <p className="text-sm text-text-primary">{c.name}</p>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.groups?.length > 0 && (
                  <div className="p-2 border-b border-vault-border/50">
                    <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 px-2">공개 컬렉션</h3>
                    {searchResults.groups.map((grp: any) => (
                      <Link href={`/profile/${grp.user?.nickname || grp.userId}?group=${grp.id}`} key={grp.id} className="flex items-center gap-2 px-2 py-2 hover:bg-vault-surface-light rounded-lg transition-colors">
                        <p className="text-sm text-text-primary">{grp.name}</p>
                        <span className="text-[10px] text-text-muted">by {grp.user?.nickname}</span>
                      </Link>
                    ))}
                  </div>
                )}
                
                {(!searchResults.games?.length && !searchResults.users?.length && !searchResults.companies?.length && !searchResults.groups?.length) && (
                  <div className="p-6 text-center text-sm text-text-muted">검색 결과가 없습니다.</div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            <ThemeToggle />
            {!isAuthenticated ? (
              <Link href="/login" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-mint text-vault-bg text-xs font-bold hover:bg-mint-dim transition-colors">
                <LogIn size={13} />
                <span className="hidden sm:inline">로그인</span>
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg hover:bg-vault-surface-light transition-colors border border-transparent hover:border-vault-border cursor-pointer"
                >
                  <img src={user?.image || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${(user as any)?.id || 'RetroMaster'}&backgroundColor=1A1A1A`} alt={user?.name || 'User'} className="w-6 h-6 rounded-md bg-vault-bg border border-vault-border object-cover" />
                  <span className="hidden sm:block text-xs font-bold text-text-primary max-w-[80px] truncate">{user?.name}</span>
                  <ChevronDown size={14} className="text-text-muted" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-vault-surface border border-vault-border rounded-xl shadow-2xl py-1 z-50">
                    <div className="px-4 py-2 border-b border-vault-border/50 mb-1">
                      <p className="text-sm font-bold text-text-primary truncate">{user?.name}</p>
                      <p className="text-[10px] text-text-muted truncate">{user?.email}</p>
                    </div>
                    {navItems.filter(item => item.group === 'user').map(item => (
                      <Link key={item.id} href={item.id === 'profile' ? `/profile/${(user as any)?.nickname || user?.name || user?.id}` : item.path} onClick={() => setDropdownOpen(false)} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-vault-surface-light hover:text-text-primary flex items-center gap-2">
                        {item.icon} {item.label}
                      </Link>
                    ))}
                    <div className="h-px bg-vault-border/50 my-1" />
                    <button onClick={() => { setDropdownOpen(false); signOut(); }} className="w-full text-left px-4 py-2 text-sm text-coral hover:bg-coral/10 flex items-center gap-2">
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
            if (item.id === 'admin' && user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') return null;
            return (
              <Link
                href={item.path}
                key={item.id}
                className={`relative flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap transition-all cursor-pointer group ${
                  isActive ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <span style={isActive ? { color: item.color } : {}} className="transition-colors">
                  {item.icon}
                </span>
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-t" style={{ background: `linear-gradient(90deg, ${item.color}, transparent)` }} />
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
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-mint to-neon-blue flex items-center justify-center crt-lines shadow">
              <span className="font-pixel text-[7px] text-vault-bg font-bold">RV</span>
            </div>
            <div>
              <p className="font-pixel text-[8px] text-text-primary">RetroVault</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary transition-all">
            <X size={17} />
          </button>
        </div>

        <nav className="py-3 px-3 space-y-0.5 overflow-y-auto">
          {navItems.filter(item => item.group === 'main' || item.group === 'admin').map(item => {
            const isActive = activeTabId === item.id;
            if (item.id === 'admin' && user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') return null;
            return (
              <Link
                href={item.id === 'profile' ? `/profile/${(user as any)?.nickname || user?.name || user?.id}` : item.path}
                key={item.id}
                onClick={() => setSidebarOpen(false)}
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

      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden glass-panel border-t border-vault-border safe-area-inset-bottom">
        <div className="flex items-stretch h-14">
          {bottomTabIds.map(tabId => {
            const item = navItems.find(n => n.id === tabId)!;
            const isActive = activeTabId === tabId;
            return (
              <Link href={item.path} key={tabId} className="flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer relative">
                {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b" style={{ background: item.color }} />}
                <span style={isActive ? { color: item.color } : { color: 'var(--color-text-muted)' }} className="scale-125 inline-flex">{item.icon}</span>
                <span className="text-[9px] font-medium" style={isActive ? { color: item.color } : { color: 'var(--color-text-muted)' }}>
                  {item.label.replace('게임 아카이브', '아카이브').replace('레트로 타임라인', '타임라인')}
                </span>
              </Link>
            );
          })}
          <button onClick={() => setSidebarOpen(true)} className="flex-1 flex flex-col items-center justify-center gap-0.5 cursor-pointer text-text-muted">
            <Menu size={19} />
            <span className="text-[9px] font-medium">더보기</span>
          </button>
        </div>
      </nav>
    </>
  );
}
