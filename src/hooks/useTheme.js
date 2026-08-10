import { useState, useEffect } from 'react';

/**
 * Hook pengurusan tema (dark/light) dengan localStorage.
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  return { theme, setTheme, toggleTheme };
}
