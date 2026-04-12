'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle group ${isDark ? 'active' : ''}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      type="button"
    >
      <div className="toggle-knob">
        {isDark ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef6751" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef6751" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        )}
      </div>
    </button>
  );
}
