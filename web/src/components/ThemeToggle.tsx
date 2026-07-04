'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'agrolease-theme';

/**
 * Simple dark mode toggle (Task 12 polish). Defaults to the OS preference,
 * then persists an explicit user choice to localStorage so it survives
 * navigation between /prices/... pages (which are statically generated).
 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored ? stored === 'dark' : prefersDark;
    // localStorage/matchMedia aren't available during SSR, so the initial
    // `null` state must be resolved on mount - unavoidable for this
    // hydration-safe theme-detection pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage/matchMedia, unavoidable on mount
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    window.localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
  }

  // Avoid a flash of the wrong icon before we know the real preference.
  if (isDark === null) {
    return <button aria-label="Toggle dark mode" className="w-9 h-9" />;
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className="w-9 h-9 flex items-center justify-center rounded-full border border-border text-foreground hover:bg-surface transition-colors"
    >
      {isDark ? '☀' : '☾'}
    </button>
  );
}
