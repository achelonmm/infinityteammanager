import { createTheme, MantineColorsTuple } from '@mantine/core';

const cyan: MantineColorsTuple = [
  '#e0f9ff',
  '#b8f1fc',
  '#8de8f9',
  '#5dddf5',
  '#2fd1ef',
  '#06b6d4', // [5] = --color-secondary (primary shade)
  '#0891b2', // [6] = --color-secondary-dark
  '#0e7490',
  '#155e75',
  '#164e63',
];

const dark: MantineColorsTuple = [
  '#f1f5f9', // [0] = text (--color-neutral-900)
  '#e2e8f0', // [1]
  '#cbd5e1', // [2]
  '#94a3b8', // [3] = muted text (--color-neutral-600)
  '#64748b', // [4]
  '#475569', // [5]
  '#1e293b', // [6] = borders, overlay (--color-surface-overlay)
  '#0f172a', // [7] = card bg, raised (--color-surface-raised)
  '#0b1120', // [8] = odd rows
  '#020617', // [9] = body bg (--color-surface-base)
];

export const theme = createTheme({
  primaryColor: 'cyan',
  colors: { cyan, dark },
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
  fontFamilyMonospace: "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
  defaultRadius: 'md',
  other: {
    colorAccent: '#f59e0b',
    colorAccentLight: '#fcd34d',
    colorAccentDark: '#d97706',
    colorSuccess: '#10b981',
    colorSuccessLight: '#6ee7b7',
    colorSuccessDark: '#059669',
    colorError: '#ef4444',
    colorErrorLight: '#fca5a5',
    colorErrorDark: '#dc2626',
    colorWarning: '#f59e0b',
    colorRankGold: '#f59e0b',
    colorRankSilver: '#94a3b8',
    colorRankBronze: '#b45309',
  },
});
