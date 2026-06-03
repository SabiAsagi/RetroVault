import React from 'react';
import { Search, Archive, Vault, Clock, BarChart3, Gamepad2, Wifi, Database, WifiOff, Camera } from 'lucide-react';
import { Tab, DataSourceStatus } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  dataSource?: DataSourceStatus;
}

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Home', icon: <Gamepad2 size={16} /> },
  { id: 'archive', label: 'Archive', icon: <Archive size={16} /> },
  { id: 'vault', label: 'My Vault', icon: <Vault size={16} /> },
  { id: 'timeline', label: 'Timeline', icon: <Clock size={16} /> },
  { id: 'stats', label: 'Stats', icon: <BarChart3 size={16} /> },
];

export default function Header({ activeTab, onTabChange, searchQuery, onSearchChange, dataSource = 'local' }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-vault-bg/90 backdrop-blur-md border-b border-vault-border">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Logo */}
          <button
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-2 shrink-0 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded bg-gradient-to-br from-mint to-neon-blue flex items-center justify-center crt-lines">
              <span className="font-pixel text-[8px] text-vault-bg font-bold">RV</span>
            </div>
            <h1 className="font-pixel text-[10px] sm:text-xs text-text-primary group-hover:text-mint transition-colors hidden sm:block">
              RetroVault
            </h1>
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="게임, 플랫폼, 제조사 검색..."
              className="w-full bg-vault-surface border border-vault-border rounded-md pl-9 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-mint/50 focus:ring-1 focus:ring-mint/20 transition-colors"
            />
          </div>

          {/* Data Source Status Badge */}
          <div className="shrink-0 hidden md:flex items-center">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-mint/10 border border-mint/20 text-mint">
                <Database size={14} />
                <span className="text-[10px] font-medium tracking-wide">LOCAL</span>
              </div>
            <div className="ml-2 pl-2 border-l border-vault-border">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'text-mint tab-active'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
