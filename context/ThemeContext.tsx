import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  background: string;
  card: string;
  cardElevated: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  primary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  tabBarBackground: string;
  tabBarActive: string;
  tabBarInactive: string;
}

export const darkColors: ThemeColors = {
  background: '#0A0A0F',
  card: '#111827',
  cardElevated: '#1A2436',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  border: '#1E2A3A',
  primary: '#0066FF',
  accent: '#38BDF8',
  success: '#34D399',
  warning: '#FFB547',
  danger: '#FF5C7A',
  tabBarBackground: '#0A0A0F',
  tabBarActive: '#0066FF',
  tabBarInactive: '#4A5568',
};

export const lightColors: ThemeColors = {
  background: '#F5F7FA',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  textPrimary: '#0A0A0F',
  textSecondary: '#5A6A7A',
  border: '#E2E8F0',
  primary: '#0066FF',
  accent: '#0EA5E9',
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  tabBarBackground: '#FFFFFF',
  tabBarActive: '#0066FF',
  tabBarInactive: '#9CA3AF',
};

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  colors: darkColors,
  toggleTheme: () => {},
});

const STORAGE_KEY = '@rova_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      if (val !== null) setIsDark(val === 'dark');
    });
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    AsyncStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ isDark, colors: isDark ? darkColors : lightColors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
