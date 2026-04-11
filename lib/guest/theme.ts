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
  bg:           '#1A1C20',
  surface:      '#222529',
  surfaceHover: '#2A2D32',
  border:       'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.14)',

  text:         '#FFFFFF',
  textBody:     'rgba(255,255,255,0.8)',
  textMuted:    'rgba(255,255,255,0.55)',
  textFaint:    'rgba(255,255,255,0.3)',

  accent:       '#8FB83A',
  accentLight:  '#7FA332',
  accentBg:     'rgba(143,184,58,0.10)',
  accentFg:     '#1A1C20',

  green:        '#3ECF8E',
  amber:        '#F5A623',
  red:          '#FF4D4D',
  blue:         '#4A9EFF',

  shadowSm:     '0 1px 3px rgba(0,0,0,0.20)',
  shadowMd:     '0 4px 16px rgba(0,0,0,0.28), 0 1px 4px rgba(0,0,0,0.16)',
  shadowLg:     '0 12px 40px rgba(0,0,0,0.36), 0 2px 8px rgba(0,0,0,0.20)',
}

/** @deprecated Use useGuestTheme() hook instead. Kept for static contexts. */
export const G = G_LIGHT
