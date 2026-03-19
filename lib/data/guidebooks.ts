export type GuidebookStatus = 'published' | 'draft' | 'needs_update'
export type GuidebookTheme = 'dark' | 'light' | 'brand'

export interface UpsellItem {
  id: string
  title: string
  description: string
  price: number
  enabled: boolean
}

export interface LocalRec {
  category: 'food' | 'activity' | 'transport'
  name: string
  tip: string
  address?: string
}

export interface FAQ {
  question: string
  answer: string
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
  // Branding
  brandLogo?: string
  brandColor?: string
  brandName?: string
  requiresVerification: boolean
  // Rich content
  amenities?: string[]
  localRecs?: LocalRec[]
  faqs?: FAQ[]
}

export const GUIDEBOOKS: Guidebook[] = [
  {
    id: 'g1',
    propertyId: 'p1',
    propertyName: 'Sunset Villa',
    status: 'published',
    theme: 'dark',
    sectionsCount: 8,
    viewCount: 142,
    lastUpdated: '2026-03-01',
    agentName: 'Anna K.',
    agentInitials: 'AK',
    shareUrl: 'nestops.app/g/sunset-villa',
    wifiName: 'SunsetVilla_5G',
    wifiPassword: 'welcome2024!',
    welcomeMessage: 'Welcome to Sunset Villa! We hope you enjoy your stay. The property has been carefully prepared for your arrival — enjoy the ocean views and make yourself at home.',
    accessInstructions: '• Door code: 4821 — enter on keypad and press ✓\n• Parking: Use the designated spot #3 in the underground garage\n• Heating: Smart thermostat in the hallway, set to your preference\n• Checkout: Leave keys on kitchen counter and lock the door',
    houseRules: '• No smoking indoors\n• Quiet hours 22:00–08:00\n• Max occupancy: 6 guests\n• No parties or events\n• Pets allowed with prior approval\n• Respect the neighbors',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    requiresVerification: false,
    amenities: ['WiFi', 'Pool', 'Parking', 'AC', 'Washer', 'BBQ', 'Sea View'],
    localRecs: [
      { category: 'food', name: 'Brygga Bistro', tip: 'Best seafood in town, book ahead on weekends', address: 'Strandveien 12' },
      { category: 'food', name: 'Kaffehuset', tip: 'Great coffee and pastries, opens at 7am', address: 'Torget 3' },
      { category: 'activity', name: 'Coastal Trail Hike', tip: '4km scenic trail starting 500m from the villa', address: 'Trailhead: Strandpromenaden' },
      { category: 'activity', name: 'Kayak Rental', tip: 'Rent kayaks by the hour at the harbor', address: 'Havnegata 8' },
      { category: 'transport', name: 'Bus Line 12', tip: 'Runs every 20 min, stops at Strandveien', address: 'Stop: Strandveien' },
      { category: 'transport', name: 'Oslo Airport Express', tip: '35 min direct, departs from Central Station', address: 'Oslo S' },
    ],
    faqs: [
      { question: 'What is the WiFi password?', answer: 'Connect to SunsetVilla_5G and enter welcome2024! — tap the copy button above for easy access.' },
      { question: 'Is there parking available?', answer: 'Yes! Use parking spot #3 in the underground garage. The access code is the same as the door code: 4821.' },
      { question: 'Can I have guests visit?', answer: 'Yes, day visitors are welcome. Please ensure total occupancy at any time does not exceed 6 people.' },
      { question: 'What if I have an issue during my stay?', answer: 'Contact us via the messaging platform you booked through. For emergencies, the emergency number is on the fridge.' },
    ],
  },
  {
    id: 'g2',
    propertyId: 'p2',
    propertyName: 'Harbor Studio',
    status: 'draft',
    theme: 'light',
    sectionsCount: 5,
    viewCount: 0,
    lastUpdated: '2026-03-10',
    agentName: 'Johan L.',
    agentInitials: 'JL',
    shareUrl: 'nestops.app/g/harbor-studio',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    requiresVerification: false,
    amenities: ['WiFi', 'Parking', 'Washer'],
  },
  {
    id: 'g3',
    propertyId: 'p3',
    propertyName: 'Ocean View Apt',
    status: 'published',
    theme: 'brand',
    sectionsCount: 7,
    viewCount: 89,
    lastUpdated: '2026-02-15',
    agentName: 'Anna K.',
    agentInitials: 'AK',
    shareUrl: 'nestops.app/g/ocean-view',
    wifiName: 'OceanView_Guest',
    wifiPassword: 'ocean2024',
    welcomeMessage: 'Welcome to Ocean View — your private coastal escape. We\'ve prepared everything for an effortless stay. Enjoy the panoramic views and don\'t hesitate to reach out if you need anything.',
    accessInstructions: '• Door code: 7734 — enter on keypad and press ✓\n• Elevator: Use the left elevator to floor 8\n• Parking: Guest spots marked in blue on level B1\n• Checkout: Leave towels in the bathroom and keys on the counter',
    houseRules: '• No smoking anywhere on the property\n• Quiet hours 23:00–07:00\n• Max occupancy: 4 guests\n• No shoes inside the apartment\n• No parties or events\n• Keep balcony door closed when AC is running',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    // White-label branding
    brandLogo: 'https://placehold.co/120x40/1d4ed8/ffffff?text=CoastalStays',
    brandColor: '#1d4ed8',
    brandName: 'CoastalStays',
    requiresVerification: true,
    amenities: ['WiFi', 'AC', 'Washer', 'Sea View', 'Parking', 'Pet Friendly', 'Balcony'],
    localRecs: [
      { category: 'food', name: 'Sjøhuset Restaurant', tip: 'Iconic harbor restaurant, amazing sunset views', address: 'Bryggen 1' },
      { category: 'food', name: 'Strandbaren', tip: 'Casual beach bar, great burgers and cold drinks', address: 'Strandvei 22' },
      { category: 'food', name: 'Fiskekrogen', tip: 'Local favorite for fresh fish, moderate prices', address: 'Fisketorget 5' },
      { category: 'activity', name: 'Ocean Kayaking Tour', tip: 'Morning tours at 08:00, magical experience', address: 'Marina, Pier 4' },
      { category: 'activity', name: 'Coastal Cycling', tip: 'Bike rental 300m away, beautiful 10km coastal route' },
      { category: 'transport', name: 'Water Taxi', tip: 'Fastest way to the city center, runs until midnight', address: 'Dock B, Harbor' },
      { category: 'transport', name: 'Bus Route 8', tip: 'Every 15 min to city center, stop directly outside', address: 'Stop: Ocean View' },
    ],
    faqs: [
      { question: 'Is verification required to access this guidebook?', answer: 'Yes, for your security and ours, we require identity verification before granting access. It only takes 2 minutes.' },
      { question: 'How do I access the apartment?', answer: 'Enter code 7734 on the keypad at the main entrance, then take the left elevator to floor 8.' },
      { question: 'Is the apartment pet-friendly?', answer: 'Yes! Pets are welcome. Please add the pet fee to your stay via the Add-Ons section and keep pets off the furniture.' },
      { question: 'Can I check in early or check out late?', answer: 'Early check-in and late checkout are available for a small fee. You can book these directly in the Add-Ons section below.' },
      { question: 'Is there a washing machine?', answer: 'Yes, there\'s a washer/dryer in the utility room. Detergent is provided in the cabinet above.' },
    ],
  },
  {
    id: 'g4',
    propertyId: 'p4',
    propertyName: 'Downtown Loft',
    status: 'needs_update',
    theme: 'dark',
    sectionsCount: 6,
    viewCount: 201,
    lastUpdated: '2025-11-20',
    agentName: 'Peter K.',
    agentInitials: 'PK',
    shareUrl: 'nestops.app/g/downtown-loft',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    requiresVerification: false,
    amenities: ['WiFi', 'AC', 'Washer', 'Parking'],
  },
  {
    id: 'g5',
    propertyId: 'p5',
    propertyName: 'Mountain Cabin',
    status: 'draft',
    theme: 'light',
    sectionsCount: 4,
    viewCount: 0,
    lastUpdated: '2026-01-08',
    agentName: 'Johan L.',
    agentInitials: 'JL',
    shareUrl: 'nestops.app/g/mountain-cabin',
    checkInTime: '16:00',
    checkOutTime: '11:00',
    requiresVerification: false,
    amenities: ['WiFi', 'BBQ', 'Washer', 'Parking'],
  },
]
