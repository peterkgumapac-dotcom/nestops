export type PropertyStatus = 'live' | 'onboarding' | 'offboarding' | 'inactive'

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
}

export const PROPERTIES: Property[] = [
  { id: 'p1', name: 'Sunset Villa',    address: 'Solveien 12',    city: 'Oslo',         beds: 4, baths: 2, status: 'live',       ownerId: 'o1', imageUrl: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80' },
  { id: 'p2', name: 'Harbor Studio',   address: 'Havnegata 3',    city: 'Bergen',       beds: 1, baths: 1, status: 'onboarding', ownerId: 'o1', imageUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80' },
  { id: 'p3', name: 'Ocean View Apt',  address: 'Strandveien 8',  city: 'Stavanger',    beds: 2, baths: 1, status: 'live',       ownerId: 'o2', imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80' },
  { id: 'p4', name: 'Downtown Loft',   address: 'Torggata 22',    city: 'Oslo',         beds: 2, baths: 1, status: 'live',       ownerId: 'o3', imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80' },
  { id: 'p5', name: 'Mountain Cabin',  address: 'Fjellveien 45',  city: 'Lillehammer',  beds: 3, baths: 1, status: 'inactive',   ownerId: 'o4', imageUrl: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80' },
]
