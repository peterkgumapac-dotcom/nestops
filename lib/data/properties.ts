export type PropertyStatus = 'live' | 'onboarding' | 'offboarding' | 'inactive'

export interface AccessCode {
  id: string
  label: string
  code: string
  expiresAt: string
  lastUsed: string
  source: 'suiteop' | 'manual'
}

export interface AccessEvent {
  id: string
  label: string
  timestamp: string
  action: 'entry' | 'exit'
}

export interface Property {
  id: string
  name: string
  address: string
  city: string
  beds: number
  baths: number
  status: PropertyStatus
  ownerId: string
  groupId?: string
  imageUrl?: string
  amenities?: string[]
  accessCodes?: AccessCode[]
  accessLog?: AccessEvent[]
}

export const PROPERTIES: Property[] = [
  {
    id: 'p1', name: 'Sunset Villa', address: 'Solveien 12', city: 'Oslo', beds: 4, baths: 2, status: 'live', ownerId: 'o1',
    imageUrl: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80',
    amenities: ['pool', 'hottub', 'bbq', 'washer', 'dryer', 'firepit'],
    accessCodes: [
      { id: 'ac1', label: 'Main Entrance', code: '842671', expiresAt: '2026-04-01', lastUsed: '2026-03-18 08:00', source: 'suiteop' },
      { id: 'ac2', label: 'Pool Gate',     code: '193054', expiresAt: '2026-04-01', lastUsed: '2026-03-16 11:05', source: 'suiteop' },
      { id: 'ac3', label: 'Staff Code',    code: '774412', expiresAt: '2026-12-31', lastUsed: '2026-03-17 09:30', source: 'manual' },
    ],
    accessLog: [
      { id: 'al1', label: 'Main Entrance', timestamp: '2026-03-18 08:00', action: 'entry' },
      { id: 'al2', label: 'Main Entrance', timestamp: '2026-03-17 14:23', action: 'entry' },
      { id: 'al3', label: 'Pool Gate',     timestamp: '2026-03-16 11:05', action: 'entry' },
      { id: 'al4', label: 'Main Entrance', timestamp: '2026-03-16 09:15', action: 'exit'  },
      { id: 'al5', label: 'Main Entrance', timestamp: '2026-03-15 18:30', action: 'exit'  },
    ],
  },
  {
    id: 'p2', name: 'Harbor Studio', address: 'Havnegata 3', city: 'Bergen', beds: 1, baths: 1, status: 'onboarding', ownerId: 'o1',
    imageUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80',
    amenities: ['washer'],
    accessCodes: [
      { id: 'ac4', label: 'Front Door', code: '330182', expiresAt: '2026-05-01', lastUsed: '2026-03-12 16:45', source: 'manual' },
    ],
    accessLog: [
      { id: 'al6', label: 'Front Door', timestamp: '2026-03-12 16:45', action: 'entry' },
      { id: 'al7', label: 'Front Door', timestamp: '2026-03-12 11:00', action: 'exit'  },
    ],
  },
  { id: 'p3', name: 'Ocean View Apt',  address: 'Strandveien 8',  city: 'Stavanger',   beds: 2, baths: 1, status: 'live',     ownerId: 'o2', imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80', amenities: ['washer', 'beach'] },
  { id: 'p4', name: 'Downtown Loft',   address: 'Torggata 22',    city: 'Oslo',        beds: 2, baths: 1, status: 'live',     ownerId: 'o3', imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', amenities: ['gym'] },
  { id: 'p5', name: 'Mountain Cabin',  address: 'Fjellveien 45',  city: 'Lillehammer', beds: 3, baths: 1, status: 'inactive', ownerId: 'o4', imageUrl: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80', amenities: ['hottub', 'bbq', 'firepit', 'beach'] },
]
