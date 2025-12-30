import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create context
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState('dark'); // Default to dark theme
  const [loading, setLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        // Use system preference if no saved theme
        setTheme(systemColorScheme || 'dark');
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
      setTheme('dark');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
  };

  const setThemeMode = async (mode) => {
    setTheme(mode);
    await AsyncStorage.setItem('theme', mode);
  };

  // Theme colors
  const lightColors = {
    primary: '#667eea',
    secondary: '#764ba2',
    background: '#f8fafc',
    card: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    disabled: '#94a3b8',
    shadow: 'rgba(0, 0, 0, 0.1)',
  };

  const darkColors = {
    primary: '#667eea',
    secondary: '#764ba2',
    background: '#0f172a',
    card: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    disabled: '#475569',
    shadow: 'rgba(0, 0, 0, 0.3)',
  };

  const themeColors = theme === 'light' ? lightColors : darkColors;

  const value = {
    theme,
    colors: themeColors,
    toggleTheme,
    setThemeMode,
    loading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
