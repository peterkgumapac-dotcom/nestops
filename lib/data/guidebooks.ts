export type GuidebookStatus = 'published' | 'draft' | 'needs_update'
export type GuidebookTheme = 'dark' | 'light' | 'brand'

export interface UpsellItem {
  id: string
  title: string
  description: string
  price: number
  enabled: boolean
}

export interface Guidebook {
  id: string
  propertyId: string
  propertyName: string
  status: GuidebookStatus
  theme: GuidebookTheme
  sectionsCount: number
  viewCount: number
  lastUpdated: string
  agentName: string
  agentInitials: string
  shareUrl: string
  wifiName?: string
  wifiPassword?: string
  welcomeMessage?: string
  accessInstructions?: string
  houseRules?: string
  checkInTime: string
  checkOutTime: string
  upsells?: UpsellItem[]
}

export const GUIDEBOOKS: Guidebook[] = [
  { id: 'g1', propertyId: 'p1', propertyName: 'Sunset Villa', status: 'published', theme: 'dark', sectionsCount: 8, viewCount: 142, lastUpdated: '2026-03-01', agentName: 'Anna K.', agentInitials: 'AK', shareUrl: 'nestops.app/g/sunset-villa', wifiName: 'SunsetVilla_5G', wifiPassword: 'welcome2024!', welcomeMessage: 'Welcome to Sunset Villa! We hope you enjoy your stay.', checkInTime: '15:00', checkOutTime: '11:00' },
  { id: 'g2', propertyId: 'p2', propertyName: 'Harbor Studio', status: 'draft', theme: 'light', sectionsCount: 5, viewCount: 0, lastUpdated: '2026-03-10', agentName: 'Johan L.', agentInitials: 'JL', shareUrl: 'nestops.app/g/harbor-studio', checkInTime: '14:00', checkOutTime: '12:00' },
  { id: 'g3', propertyId: 'p3', propertyName: 'Ocean View Apt', status: 'published', theme: 'brand', sectionsCount: 7, viewCount: 89, lastUpdated: '2026-02-15', agentName: 'Anna K.', agentInitials: 'AK', shareUrl: 'nestops.app/g/ocean-view', wifiName: 'OceanView_Guest', wifiPassword: 'ocean2024', checkInTime: '15:00', checkOutTime: '11:00' },
  { id: 'g4', propertyId: 'p4', propertyName: 'Downtown Loft', status: 'needs_update', theme: 'dark', sectionsCount: 6, viewCount: 201, lastUpdated: '2025-11-20', agentName: 'Peter K.', agentInitials: 'PK', shareUrl: 'nestops.app/g/downtown-loft', checkInTime: '14:00', checkOutTime: '12:00' },
  { id: 'g5', propertyId: 'p5', propertyName: 'Mountain Cabin', status: 'draft', theme: 'light', sectionsCount: 4, viewCount: 0, lastUpdated: '2026-01-08', agentName: 'Johan L.', agentInitials: 'JL', shareUrl: 'nestops.app/g/mountain-cabin', checkInTime: '16:00', checkOutTime: '11:00' },
]
