"use client";
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
const themes = [{ id: 'dark', label: '블랙' }, { id: 'light', label: '화이트' }, { id: 'retro', label: '레트로' }];
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return <div id="theme-toggle" className="theme-picker" role="group" aria-label="화면 테마">{themes.map(({ id, label }) => <button key={id} type="button" aria-pressed={mounted && theme === id} onClick={() => setTheme(id)}>{label}<span aria-hidden="true">{mounted && theme === id ? ' ✓' : ''}</span></button>)}</div>;
}
