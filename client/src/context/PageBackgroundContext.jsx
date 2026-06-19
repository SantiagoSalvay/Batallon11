import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'batallon11-dark-mode';

const PageBackgroundContext = createContext(null);

export function PageBackgroundProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') return true;
      return localStorage.getItem('batallon11-black-bg') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, darkMode ? '1' : '0');
    } catch {
      // ignore
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((v) => !v);

  return (
    <PageBackgroundContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </PageBackgroundContext.Provider>
  );
}

export function usePageBackground() {
  const ctx = useContext(PageBackgroundContext);
  if (!ctx) {
    throw new Error('usePageBackground must be used within PageBackgroundProvider');
  }
  return ctx;
}