'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'darker' | 'midnight' | 'glass';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  apiKeys: {
    openai: string;
    anthropic: string;
    gemini: string;
  };
  updateApiKey: (provider: 'openai' | 'anthropic' | 'gemini', key: string) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('glass');
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    gemini: 'AIzaSyAmwt5GH5j59SMm9zskINTuBSijQD5on8c', // Default Gemini key
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('helix-theme') as Theme;
    const savedApiKeys = localStorage.getItem('helix-api-keys');
    
    if (savedTheme) {
      setTheme(savedTheme);
    }
    
    if (savedApiKeys) {
      try {
        setApiKeys(JSON.parse(savedApiKeys));
      } catch (error) {
        console.error('Failed to parse saved API keys');
      }
    }
  }, []);

  // Save to localStorage when values change
  useEffect(() => {
    localStorage.setItem('helix-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    // Apply theme-specific CSS variables
    const root = document.documentElement;
    switch (theme) {
      case 'dark':
        root.style.setProperty('--bg-primary', 'rgb(17, 24, 39)');
        root.style.setProperty('--bg-secondary', 'rgb(31, 41, 55)');
        root.style.setProperty('--bg-tertiary', 'rgb(55, 65, 81)');
        root.style.setProperty('--glass-bg', 'rgba(31, 41, 55, 0.8)');
        break;
      case 'darker':
        root.style.setProperty('--bg-primary', 'rgb(0, 0, 0)');
        root.style.setProperty('--bg-secondary', 'rgb(15, 15, 15)');
        root.style.setProperty('--bg-tertiary', 'rgb(30, 30, 30)');
        root.style.setProperty('--glass-bg', 'rgba(15, 15, 15, 0.8)');
        break;
      case 'midnight':
        root.style.setProperty('--bg-primary', 'rgb(2, 6, 23)');
        root.style.setProperty('--bg-secondary', 'rgb(15, 23, 42)');
        root.style.setProperty('--bg-tertiary', 'rgb(30, 41, 59)');
        root.style.setProperty('--glass-bg', 'rgba(15, 23, 42, 0.8)');
        break;
      case 'glass':
        root.style.setProperty('--bg-primary', 'rgb(0, 0, 0)');
        root.style.setProperty('--bg-secondary', 'rgba(255, 255, 255, 0.05)');
        root.style.setProperty('--bg-tertiary', 'rgba(255, 255, 255, 0.1)');
        root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.08)');
        break;
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('helix-api-keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  const updateApiKey = (provider: 'openai' | 'anthropic' | 'gemini', key: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: key
    }));
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      apiKeys,
      updateApiKey,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}