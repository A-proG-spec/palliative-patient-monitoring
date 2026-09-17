import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (mode: ThemeMode) => void;
}

const STORAGE_KEY = 'pcs-theme';

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
});

function getOsPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Apply theme classes to <html>.
 *
 * Light  → no extra class
 * Dark   → .dark
 * System → .system  (plus .dark if OS is currently dark, so components
 *           that only check .dark remain functional in system-dark mode)
 */
function applyTheme(resolved: 'light' | 'dark', preference: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove('dark', 'system');

  if (preference === 'system') {
    root.classList.add('system');
    if (resolved === 'dark') {
      root.classList.add('dark');
    }
  } else if (resolved === 'dark') {
    root.classList.add('dark');
  }
  // light: no class needed
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
    } catch { /* ignore */ }
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (stored === 'light') return 'light';
      if (stored === 'dark') return 'dark';
    } catch { /* ignore */ }
    return getOsPreference();
  });

  const resolveTheme = useCallback((pref: ThemeMode): 'light' | 'dark' => {
    if (pref === 'light') return 'light';
    if (pref === 'dark') return 'dark';
    return getOsPreference();
  }, []);

  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    applyTheme(resolved, theme);
  }, [theme, resolveTheme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const resolved = getOsPreference();
      setResolvedTheme(resolved);
      applyTheme(resolved, 'system');
    };
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      mq.addListener(handler);
      return () => mq.removeListener(handler);
    }
  }, [theme]);

  const setTheme = useCallback((mode: ThemeMode) => {
    try { localStorage.setItem(STORAGE_KEY, mode); } catch { /* ignore */ }
    setThemeState(mode);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
