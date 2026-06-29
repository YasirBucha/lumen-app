// Lumen design tokens — Direction D · Editorial + Stats
// Editorial newspaper × fintech ledger. Numbers are the hero.
// Fraunces serif for display, Inter Tight for UI, JetBrains Mono for metadata.

const LumenTokens = {
  themes: {
    dark: {
      bg: '#0E1623',           // deep ink navy (newspaper night)
      bgRaised: '#14202F',
      bgSheet: '#1A2738',
      surface: '#14202F',
      surfaceHi: '#1A2738',
      border: 'rgba(242,234,214,0.16)',   // hairline rule
      borderHi: 'rgba(242,234,214,0.28)',
      text: '#F2EAD6',         // newsprint cream
      textMuted: 'rgba(242,234,214,0.62)',
      textSubtle: 'rgba(242,234,214,0.40)',
      inverse: '#0E1623',
    },
    light: {
      bg: '#F1ECDF',           // newsprint paper
      bgRaised: '#FBF8EE',
      bgSheet: '#FFFEF7',
      surface: '#FBF8EE',
      surfaceHi: '#FFFEF7',
      border: 'rgba(26,39,56,0.16)',
      borderHi: 'rgba(26,39,56,0.30)',
      text: '#1A2738',         // ink navy
      textMuted: 'rgba(26,39,56,0.62)',
      textSubtle: 'rgba(26,39,56,0.40)',
      inverse: '#F1ECDF',
    },
  },
  // Accents — oxblood is the locked default; others kept as alt palettes
  accents: {
    oxblood:  { darkBase: '#C8413A', lightBase: '#8A1F1F', ink: '#F2EAD6', label: 'Oxblood' },
    ink:      { darkBase: '#5B7DB1', lightBase: '#2D4D7A', ink: '#F2EAD6', label: 'Ink Blue' },
    olive:    { darkBase: '#9BAE7C', lightBase: '#5A6E3C', ink: '#0E1623', label: 'Olive' },
    burnt:    { darkBase: '#D68A3A', lightBase: '#9C5A1A', ink: '#0E1623', label: 'Burnt' },
  },
  // Semantic — editorial muted (no neon)
  semantic: {
    dark:  { good: '#8FAE7C', review: '#D6B26A', cancel: '#C8413A', info: '#5B7DB1' },
    light: { good: '#4F6B3C', review: '#A57F2B', cancel: '#8A1F1F', info: '#2D4D7A' },
  },
  // Type pairings — Fraunces is always present as display.
  typePairs: {
    inter:   { ui: '"Inter Tight", "Inter", system-ui, sans-serif',
               mono: '"JetBrains Mono", ui-monospace, monospace',
               display: '"Fraunces", "Times New Roman", serif' },
    geist:   { ui: '"Geist", "Inter", system-ui, sans-serif',
               mono: '"IBM Plex Mono", ui-monospace, monospace',
               display: '"Fraunces", "Times New Roman", serif' },
  },
  radius: { none: 0, sm: 2, md: 4, lg: 6 }, // editorial: barely any rounding
};

window.LumenTokens = LumenTokens;

window.useLumenTheme = function useLumenTheme(t) {
  const theme = LumenTokens.themes[t.theme] || LumenTokens.themes.dark;
  const accentDef = LumenTokens.accents[t.accent] || LumenTokens.accents.oxblood;
  const accentValue = t.theme === 'dark' ? accentDef.darkBase : accentDef.lightBase;
  const accentSoft = t.theme === 'dark'
    ? `color-mix(in oklch, ${accentValue} 18%, transparent)`
    : `color-mix(in oklch, ${accentValue} 10%, transparent)`;
  const fonts = LumenTokens.typePairs[t.typePair] || LumenTokens.typePairs.inter;
  const semantic = LumenTokens.semantic[t.theme] || LumenTokens.semantic.dark;
  // Cancel always equals accent in D
  semantic.cancel = accentValue;
  return {
    ...theme,
    accent: accentValue,
    accentSoft,
    accentInk: accentDef.ink,
    accentName: accentDef.label,
    fontUI: fonts.ui,
    fontMono: fonts.mono,
    fontDisplay: fonts.display,
    semantic,
    radius: LumenTokens.radius,
    themeName: t.theme,
  };
};
