"use client";
import { useTheme } from 'next-themes';
import { Sun, Moon, Tv } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ThemeMode } from '../types';

const modes: { mode: ThemeMode; icon: React.ReactNode; label: string; color: string }[] = [
  { mode: 'dark',   icon: <Moon size={14} />,  label: '다크',   color: 'text-neon-blue' },
  { mode: 'light',  icon: <Sun size={14} />,   label: '라이트', color: 'text-amber' },
  { mode: 'retro',  icon: <Tv size={14} />,    label: '레트로', color: 'text-mint' },
];
const CYCLE: ThemeMode[] = ['dark', 'light', 'retro'];

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all bg-vault-surface border-vault-border opacity-50">
        <Moon size={14} />
        <span className="text-[10px] font-medium tracking-wide hidden sm:inline">다크</span>
      </button>
    );
  }

  const currentMode = (theme as ThemeMode) || 'dark';
  const current = modes.find(m => m.mode === currentMode) ?? modes[0];

  const toggle = () => {
    const next = CYCLE[(CYCLE.indexOf(currentMode) + 1) % CYCLE.length];
    setTheme(next);
  };

  return (
    <button
      onClick={toggle}
      id="theme-toggle"
      title={`현재: ${current.label} 모드 (클릭하면 전환)`}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer
        bg-vault-surface border-vault-border hover:border-vault-border-light
        ${current.color}`}
    >
      {current.icon}
      <span className="text-[10px] font-medium tracking-wide hidden sm:inline">
        {current.label.toUpperCase()}
      </span>
    </button>
  );
}
