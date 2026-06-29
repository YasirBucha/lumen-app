import { useEffect } from 'react';
import { useUiStore } from '../store/uiStore';
import type { ThemeTokens } from '../types';

const LIGHT: ThemeTokens = {
  bg: '#F1ECDF',
  surface: '#FBF8EE',
  surfaceRaised: '#FFFEF7',
  text: '#1A2738',
  textMuted: 'rgba(26, 39, 56, 0.62)',
  textSubtle: 'rgba(26, 39, 56, 0.4)',
  border: 'rgba(26, 39, 56, 0.16)',
  borderHi: 'rgba(26, 39, 56, 0.28)',
  accent: '#8A1F1F',
  accentInk: '#FBF8EE',
  good: '#4F6B3C',
  review: '#A57F2B',
  cancel: '#8A1F1F',
};

const DARK: ThemeTokens = {
  bg: '#0E1623',
  surface: '#14202F',
  surfaceRaised: '#1A2738',
  text: '#F2EAD6',
  textMuted: 'rgba(242, 234, 214, 0.72)',
  textSubtle: 'rgba(242, 234, 214, 0.5)',
  border: 'rgba(242, 234, 214, 0.12)',
  borderHi: 'rgba(242, 234, 214, 0.22)',
  accent: '#C8413A',
  accentInk: '#F2EAD6',
  good: '#8FAE7C',
  review: '#D6B26A',
  cancel: '#C8413A',
};

export function useTheme(): ThemeTokens {
  const theme = useUiStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return theme === 'dark' ? DARK : LIGHT;
}

export function useThemeName() {
  return useUiStore((s) => s.theme);
}
