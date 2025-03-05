import React, { createContext, useState, useContext, useEffect } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

// Define theme types
export type ThemeMode = 'light' | 'dark';

// Define theme colors
export const lightTheme = {
  background: '#f5f5f5',
  backgroundSecondary: '#f0f0f0',
  text: '#333',
  primary: '#2196F3',
  secondary: '#4CAF50',
  boardBackground: '#f0f0f0',
  gridLines: '#ccc',
  statusBarBackground: '#fff',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayText: 'white',
  canvasBorder: '#ccc',
};

export const darkTheme = {
  background: '#121212',
  backgroundSecondary: '#1e1e1e',
  text: '#f5f5f5',
  primary: '#90caf9',
  secondary: '#81c784',
  boardBackground: '#1e1e1e',
  gridLines: '#444',
  statusBarBackground: '#2d2d2d',
  shadow: 'rgba(0, 0, 0, 0.4)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayText: 'white',
  canvasBorder: '#444',
};

type ThemeContextType = {
  themeMode: ThemeMode;
  theme: typeof lightTheme;
  toggleTheme: () => void;
};

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if localStorage is available (for SSR compatibility)
  const isBrowser = typeof window !== 'undefined';
  
  // Initialize theme from localStorage or default to light
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (isBrowser) {
      const savedTheme = localStorage.getItem('theme');
      return (savedTheme === 'dark' ? 'dark' : 'light') as ThemeMode;
    }
    return 'light';
  });

  // Get the current theme object
  const theme = themeMode === 'light' ? lightTheme : darkTheme;

  // Toggle theme
  const toggleTheme = () => {
    setThemeMode(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      if (isBrowser) {
        localStorage.setItem('theme', newTheme);
      }
      return newTheme;
    });
  };

  // Update theme in localStorage when changed
  useEffect(() => {
    if (isBrowser) {
      localStorage.setItem('theme', themeMode);
    }
  }, [themeMode, isBrowser]);

  return (
    <ThemeContext.Provider value={{ themeMode, theme, toggleTheme }}>
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};