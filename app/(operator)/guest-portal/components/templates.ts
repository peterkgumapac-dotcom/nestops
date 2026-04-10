export interface ColorScheme {
  bg: string
  accent: string
  text: string
}

export interface Template {
  id: 'default' | 'minimalist' | 'premium'
  name: string
  tagline: string
  description: string
  thumbnail: string
  previewUrl: string
  features: string[]
  colorScheme: ColorScheme
}

export const TEMPLATES: Template[] = [
  {
    id: 'default',
    name: 'Default',
    tagline: 'Balanced & Complete',
    description:
      'The full AfterStay experience — trip planning, multi-guest support, and all six guide sections in a polished dark theme.',
    thumbnail: '/templates/default-thumb.svg',
    previewUrl: '/guest/preview',
    features: [
      'Trip Planner (Top 5)',
      'Multi-guest system',
      'All 6 guide sections',
      'Discover with Host Picks',
      'Services section',
      'Currency auto-detect',
    ],
    colorScheme: {
      bg: '#FAF7F2',
      accent: '#5B6B2F',
      text: '#1C1917',
    },
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    tagline: 'Clean & Simple',
    description:
      'A stripped-back layout focused on essentials — check-in info, house rules, and quick links. Ideal for short stays and budget properties.',
    thumbnail: '/templates/minimalist-thumb.svg',
    previewUrl: '/guest/preview',
    features: [
      'Check-in flow',
      'WiFi + door code',
      'House rules',
      'Emergency contacts',
      'Checkout guide',
    ],
    colorScheme: {
      bg: '#ffffff',
      accent: '#18181b',
      text: '#09090b',
    },
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Luxury & Immersive',
    description:
      'A rich, immersive portal with concierge AI, premium add-ons, and curated Host Picks. Built for high-end vacation rentals and boutique stays.',
    thumbnail: '/templates/premium-thumb.svg',
    previewUrl: '/guest/preview',
    features: [
      'All Default features',
      'Concierge AI chat',
      'Premium add-ons (spa, chef, transfers)',
      'Curated Host Picks only (no Google)',
      'Gold accent theme',
    ],
    colorScheme: {
      bg: '#0c0a09',
      accent: '#d4a017',
      text: '#fafaf9',
    },
  },
]
