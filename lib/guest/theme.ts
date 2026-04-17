export interface GuestTheme {
  // Surfaces
  bg: string
  surface: string
  surfaceHover: string
  border: string
  borderStrong: string

  // Text
  text: string
  textBody: string
  textMuted: string
  textFaint: string

  // Accent
  accent: string
  accentLight: string
  accentBg: string
  accentFg: string

  // Status
  green: string
  amber: string
  red: string
  blue: string

  // Shadows
  shadowSm: string
  shadowMd: string
  shadowLg: string
}

export const G_LIGHT: GuestTheme = {
  bg:           '#FAF7F2',
  surface:      '#FFFFFF',
  surfaceHover: '#F5F2EC',
  border:       '#E8E2D8',
  borderStrong: '#D4CCC0',

  text:         '#1C1917',
  textBody:     '#44403C',
  textMuted:    '#A8A29E',
  textFaint:    '#D6D3D1',

  accent:       '#5B6B2F',
  accentLight:  '#7A8F42',
  accentBg:     '#EEF2E2',
  accentFg:     '#FFFFFF',

  green:        '#3D7A3F',
  amber:        '#C2762B',
  red:          '#C43333',
  blue:         '#3672B8',

  shadowSm:     '0 1px 3px rgba(28,25,23,0.06)',
  shadowMd:     '0 4px 16px rgba(28,25,23,0.08), 0 1px 4px rgba(28,25,23,0.04)',
  shadowLg:     '0 12px 40px rgba(28,25,23,0.12), 0 2px 8px rgba(28,25,23,0.06)',
}

export const G_DARK: GuestTheme = {
  bg:           '#080b12',
  surface:      '#1a1f27',
  surfaceHover: '#161b22',
  border:       '#1e2530',
  borderStrong: '#2a3040',

  text:         '#e8eaed',
  textBody:     '#e8eaed',
  textMuted:    '#8b95a5',
  textFaint:    '#5a6577',

  accent:       '#1d9e75',
  accentLight:  '#2dd4a0',
  accentBg:     'rgba(29,158,117,0.10)',
  accentFg:     '#FFFFFF',

  green:        '#1d9e75',
  amber:        '#f59e0b',
  red:          '#ef4444',
  blue:         '#378add',

  shadowSm:     '0 1px 3px rgba(0,0,0,0.30)',
  shadowMd:     '0 4px 16px rgba(0,0,0,0.35), 0 1px 4px rgba(0,0,0,0.20)',
  shadowLg:     '0 12px 40px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.25)',
}

/** @deprecated Use useGuestTheme() hook instead. Kept for static contexts. */
export const G = G_LIGHT
