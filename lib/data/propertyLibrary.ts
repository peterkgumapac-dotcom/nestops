export interface LibraryContact {
  name: string
  phone?: string
  email?: string
  notes?: string
}

export interface LibraryAppliance {
  name: string
  brand?: string
  model?: string
  serialNumber?: string
  location?: string
  warrantyExpiry?: string
  manualUrl?: string
  notes?: string
}

export interface LibraryRoom {
  name: string
  beds?: string
  notes?: string
}

export interface PropertyLibrary {
  propertyId: string

  // Basic
  nickname?: string
  type: 'apartment' | 'house' | 'villa' | 'cabin' | 'studio' | 'loft'
  maxGuests: number
  minNights: number
  description?: string
  tagline?: string

  // Access
  accessType: 'smart_lock' | 'keypad' | 'key_box' | 'in_person'
  accessCode?: string
  accessInstructions?: string
  checkIn: string
  checkOut: string
  parkingInfo?: string
  garbageInfo?: string

  // Utilities
  electricityProvider?: string
  meterLocation?: string
  waterProvider?: string
  internetProvider?: string
  wifiName?: string
  wifiPassword?: string
  tvProvider?: string
  tvInfo?: string
  heatingType?: string
  heatingInstructions?: string

  // Appliances
  appliances: LibraryAppliance[]

  // Smart home
  smartHome: { device: string; brand?: string; appName?: string; notes?: string }[]

  // House rules
  houseRules: {
    smokingAllowed: boolean
    petsAllowed: boolean
    partiesAllowed: boolean
    quietHours?: string
    additionalRules?: string[]
  }

  // Emergency
  emergency: {
    contacts: LibraryContact[]
    nearestHospital?: string
    nearestPharmacy?: string
    maintenanceContractor?: string
    electrician?: string
    plumber?: string
  }

  // Amenities
  amenities: string[]

  // Rooms
  rooms: LibraryRoom[]

  // Local area
  localArea: {
    supermarket?: string
    supermarketDistance?: string
    airport?: string
    airportDistance?: string
    publicTransport?: string
    restaurants?: string[]
    attractions?: string[]
    notes?: string
  }

  // Internal notes
  internalNotes?: string
  cleaningInstructions?: string
  cleaningDuration?: number // minutes
  bufferDays?: number
  inspectionRequired?: boolean

  // Photos
  photos: { url: string; caption?: string; isPrimary?: boolean }[]

  // Completion score (0-100)
  completionScore: number

  storageLocation?: string
  storagePhotoUrl?: string
  cleaningNotes?: string
}

export const PROPERTY_LIBRARIES: PropertyLibrary[] = [
  {
    propertyId: 'p1',
    nickname: 'The Sunset',
    type: 'villa',
    maxGuests: 8,
    minNights: 2,
    description: 'A stunning 4-bedroom villa in the heart of Oslo with breathtaking sunset views. Fully renovated in 2023 with modern Scandinavian design.',
    tagline: 'Luxury Oslo villa with stunning sunset views',
    accessType: 'smart_lock',
    accessCode: '2847',
    accessInstructions: 'Use the Yale smart lock app or enter code 2847. Door handle must be pulled while entering code.',
    checkIn: '15:00',
    checkOut: '11:00',
    parkingInfo: 'Private driveway, fits 2 cars. Additional street parking available on Solveien.',
    garbageInfo: 'Bins located on left side of property. Collection every Tuesday.',
    electricityProvider: 'Hafslund Eco',
    meterLocation: 'Utility room, ground floor, behind the washing machine',
    internetProvider: 'Telenor',
    wifiName: 'SunsetVilla_5G',
    wifiPassword: 'Oslo2024!',
    tvProvider: 'Canal Digital',
    tvInfo: 'Smart TV in living room. Netflix pre-installed. Remote in drawer below TV.',
    heatingType: 'Underfloor + Heat pump',
    heatingInstructions: 'Thermostat in main hallway. Set to 22°C for guest comfort. Heat pump remote on kitchen counter.',
    appliances: [
      { name: 'Dishwasher', brand: 'Bosch', model: 'SMS6ZCW00E', location: 'Kitchen', warrantyExpiry: '2026-08-15' },
      { name: 'Washing Machine', brand: 'Miele', model: 'WCR870WPS', location: 'Utility room', warrantyExpiry: '2027-03-01' },
      { name: 'Coffee Machine', brand: 'Nespresso', model: 'Vertuo Next', location: 'Kitchen counter', notes: 'Pods in cabinet above' },
      { name: 'Heat Pump', brand: 'Daikin', model: 'FTXM35R', location: 'Living room wall', warrantyExpiry: '2028-01-10' },
    ],
    smartHome: [
      { device: 'Smart Lock', brand: 'Yale', appName: 'Yale Access', notes: 'Codes managed via operator app' },
      { device: 'Smart Thermostat', brand: 'Nest', appName: 'Google Home', notes: 'Set auto-schedule enabled' },
    ],
    houseRules: {
      smokingAllowed: false,
      petsAllowed: true,
      partiesAllowed: false,
      quietHours: '23:00 – 07:00',
      additionalRules: ['Max 8 guests at any time', 'Remove shoes at entrance', 'No food in bedrooms'],
    },
    emergency: {
      contacts: [
        { name: 'Peter K. (Manager)', phone: '+47 900 12 345', email: 'peter@nestops.no' },
        { name: 'Lars Plumbing AS', phone: '+47 901 23 456' },
      ],
      nearestHospital: 'Oslo Universitetssykehus — 2.4 km',
      nearestPharmacy: 'Apotek 1 Solveien — 0.8 km',
      maintenanceContractor: 'Bjorn Maintenance (+47 902 34 567)',
      electrician: 'Elcon AS (+47 903 45 678)',
      plumber: 'Lars Plumbing AS (+47 901 23 456)',
    },
    amenities: ['WiFi', 'Parking', 'Kitchen', 'Washer', 'Dryer', 'Dishwasher', 'Coffee maker', 'Smart TV', 'Work desk', 'Iron', 'Hair dryer', 'BBQ grill', 'Garden', 'Patio'],
    rooms: [
      { name: 'Master Bedroom', beds: 'King', notes: 'Ensuite bathroom' },
      { name: 'Bedroom 2', beds: 'Queen' },
      { name: 'Bedroom 3', beds: '2x Single' },
      { name: 'Bedroom 4', beds: 'Single', notes: 'Good for kids' },
    ],
    localArea: {
      supermarket: 'Meny Solveien',
      supermarketDistance: '0.9 km',
      airport: 'Oslo Gardermoen (OSL)',
      airportDistance: '48 km',
      publicTransport: 'Bus 37 from Solveien stop (200m). Tram T-bane line 1 from Holtet (1.2km).',
      restaurants: ['Maaemo (★★★, 1.8 km)', 'Kontrast (1.2 km)', 'Ling Ling Rooftop (2.1 km)'],
      attractions: ['Vigeland Sculpture Park (3 km)', 'Oslo Opera House (4 km)', 'Holmenkollen Ski Jump (6 km)'],
    },
    internalNotes: 'Owner Sarah prefers advance notice before any repairs over 2000 NOK. Key handoff available as backup — contact office.',
    cleaningInstructions: 'Deep clean between all checkouts. Pay extra attention to BBQ and outdoor patio furniture. All bedding to be washed and ironed.',
    cleaningDuration: 240,
    bufferDays: 1,
    inspectionRequired: true,
    photos: [
      { url: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80', caption: 'Front exterior', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', caption: 'Living room' },
      { url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80', caption: 'Kitchen' },
      { url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80', caption: 'Master bedroom' },
    ],
    completionScore: 92,
  },
  {
    propertyId: 'p2',
    nickname: 'Harbor Gem',
    type: 'studio',
    maxGuests: 2,
    minNights: 3,
    description: 'Charming studio apartment with direct harbor views in Bergen. Perfect for couples.',
    tagline: 'Cozy harbor studio in Bergen\'s heart',
    accessType: 'keypad',
    accessCode: '5519',
    accessInstructions: 'Enter #5519# on the keypad by the main entrance.',
    checkIn: '14:00',
    checkOut: '11:00',
    parkingInfo: 'No private parking. Municipal parking garage 100m away (Parking1 app).',
    garbageInfo: 'Bins in basement. Access via elevator.',
    internetProvider: 'Altibox',
    wifiName: 'HarborStudio',
    wifiPassword: 'Bergen2025',
    heatingType: 'Electric panel heaters',
    heatingInstructions: 'Individual controls in each room. Set to 20°C recommended.',
    appliances: [
      { name: 'Coffee Machine', brand: 'Nespresso', model: 'Essenza Mini', location: 'Kitchen counter' },
      { name: 'Mini fridge', brand: 'Bosch', location: 'Kitchen area' },
    ],
    smartHome: [],
    houseRules: {
      smokingAllowed: false,
      petsAllowed: false,
      partiesAllowed: false,
      quietHours: '22:00 – 08:00',
      additionalRules: ['Max 2 guests', 'No outdoor shoes inside'],
    },
    emergency: {
      contacts: [
        { name: 'Peter K. (Manager)', phone: '+47 900 12 345' },
      ],
      nearestHospital: 'Haukeland Universitetssykehus — 3.1 km',
      nearestPharmacy: 'Apotek Strandkaien — 0.3 km',
    },
    amenities: ['WiFi', 'Kitchen', 'Harbor view', 'Coffee maker', 'Smart TV'],
    rooms: [
      { name: 'Studio main area', beds: 'Queen sofa bed' },
    ],
    localArea: {
      supermarket: 'Rema 1000 Strandkaien',
      supermarketDistance: '0.4 km',
      airport: 'Bergen Airport Flesland (BGO)',
      airportDistance: '19 km',
      publicTransport: 'Bus 3 from Torget (50m). Light rail from Bergen station (0.8km).',
      restaurants: ['Bryggen Tracteursted (0.2 km)', 'Lysverket (0.6 km)'],
      attractions: ['Bryggen Wharf (0.2 km)', 'Bergen Fish Market (0.3 km)', 'Mount Fløyen (1 km)'],
    },
    cleaningDuration: 90,
    storageLocation: 'Hallway closet, top shelf',
    cleaningNotes: 'Guest allergic to lavender products. Use unscented cleaning spray.',
    bufferDays: 0,
    photos: [
      { url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80', caption: 'Harbor view', isPrimary: true },
    ],
    completionScore: 65,
  },
  {
    propertyId: 'p3',
    nickname: 'Ocean Breeze',
    type: 'apartment',
    maxGuests: 4,
    minNights: 2,
    description: '2-bedroom apartment in Stavanger with panoramic ocean views. Modern design, fully equipped.',
    tagline: 'Ocean views with modern Stavanger comfort',
    accessType: 'key_box',
    accessCode: 'KeyBox code: 8834 — located at main entrance right side',
    accessInstructions: 'Key box at main entrance (right side). Code 8834. Return keys to box on departure.',
    checkIn: '15:00',
    checkOut: '11:00',
    wifiName: 'OceanView_Guest',
    wifiPassword: 'Stavanger2025!',
    heatingType: 'Central heating',
    appliances: [
      { name: 'Dishwasher', brand: 'AEG', location: 'Kitchen' },
      { name: 'Washing Machine', brand: 'Electrolux', location: 'Bathroom closet' },
    ],
    smartHome: [],
    houseRules: {
      smokingAllowed: false,
      petsAllowed: true,
      partiesAllowed: false,
      quietHours: '23:00 – 07:00',
    },
    emergency: {
      contacts: [
        { name: 'Peter K. (Manager)', phone: '+47 900 12 345' },
        { name: 'Nordic HVAC', phone: '+47 904 56 789' },
      ],
      nearestHospital: 'Stavanger Universitetssykehus — 4.2 km',
    },
    amenities: ['WiFi', 'Parking', 'Kitchen', 'Washer', 'Dishwasher', 'Ocean view', 'Balcony'],
    rooms: [
      { name: 'Bedroom 1', beds: 'Queen' },
      { name: 'Bedroom 2', beds: '2x Single' },
    ],
    localArea: {
      supermarket: 'Coop Extra Strandveien',
      supermarketDistance: '0.6 km',
      airport: 'Stavanger Sola Airport (SVG)',
      airportDistance: '14 km',
    },
    cleaningDuration: 150,
    bufferDays: 1,
    photos: [
      { url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80', caption: 'Ocean view balcony', isPrimary: true },
    ],
    completionScore: 74,
  },
  {
    propertyId: 'p4',
    nickname: 'Loft 22',
    type: 'loft',
    maxGuests: 4,
    minNights: 2,
    description: 'Stylish downtown Oslo loft with industrial design. Walking distance to all major attractions.',
    tagline: 'Industrial chic in the heart of Oslo',
    accessType: 'smart_lock',
    accessCode: '7743',
    checkIn: '15:00',
    checkOut: '11:00',
    wifiName: 'Loft22_WiFi',
    wifiPassword: 'Downtown!22',
    heatingType: 'District heating',
    appliances: [
      { name: 'Nespresso', brand: 'Nespresso', model: 'Vertuo', location: 'Kitchen island' },
    ],
    smartHome: [
      { device: 'Smart Lock', brand: 'Igloohome', appName: 'igloohome app' },
    ],
    houseRules: {
      smokingAllowed: false,
      petsAllowed: false,
      partiesAllowed: false,
      quietHours: '23:00 – 07:00',
    },
    emergency: {
      contacts: [
        { name: 'Peter K. (Manager)', phone: '+47 900 12 345' },
      ],
      nearestHospital: 'Oslo Universitetssykehus — 1.8 km',
    },
    amenities: ['WiFi', 'Kitchen', 'Smart TV', 'Work desk', 'Coffee maker'],
    rooms: [
      { name: 'Master Bedroom', beds: 'King' },
      { name: 'Sleeping loft', beds: '2x Single', notes: 'Accessed via spiral staircase' },
    ],
    localArea: {
      supermarket: 'Rema 1000 Torggata',
      supermarketDistance: '0.2 km',
      airport: 'Oslo Gardermoen (OSL)',
      airportDistance: '45 km',
      publicTransport: 'T-bane at Grønland station (0.3km). Multiple bus lines on Torggata.',
    },
    cleaningDuration: 150,
    bufferDays: 1,
    photos: [
      { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', caption: 'Living area', isPrimary: true },
    ],
    completionScore: 58,
  },
  {
    propertyId: 'p5',
    nickname: 'The Fjell Cabin',
    type: 'cabin',
    maxGuests: 6,
    minNights: 3,
    description: 'Traditional Norwegian mountain cabin near Lillehammer. Perfect for skiing in winter and hiking in summer.',
    tagline: 'Authentic Norwegian mountain experience',
    accessType: 'key_box',
    accessCode: '3310',
    accessInstructions: 'Key box on the left side of the door frame. Code 3310. Wooden tag with instructions inside.',
    checkIn: '16:00',
    checkOut: '12:00',
    parkingInfo: 'Large gravel area in front. Fits 3 cars.',
    garbageInfo: 'Bring all waste to municipal station 2 km down the road (open weekends).',
    wifiName: 'FjellCabin',
    wifiPassword: 'Lillehammer!',
    heatingType: 'Wood burning stove + electric backup',
    heatingInstructions: 'Firewood stacked on left side of cabin. Use fire lighter starters in basket by fireplace. Electric backup panel in hallway.',
    appliances: [
      { name: 'Wood Stove', brand: 'Jøtul', model: 'F 373', location: 'Living room', notes: 'Always open damper before lighting' },
      { name: 'Coffee Percolator', brand: 'Moka', location: 'Kitchen' },
    ],
    smartHome: [],
    houseRules: {
      smokingAllowed: false,
      petsAllowed: true,
      partiesAllowed: false,
      quietHours: '22:00 – 08:00',
      additionalRules: ['Respect wildlife and nature', 'Close all window shutters when leaving', 'No snowmobiles'],
    },
    emergency: {
      contacts: [
        { name: 'Peter K. (Manager)', phone: '+47 900 12 345' },
        { name: 'Local Emergency (fire/police)', phone: '110/112' },
      ],
      nearestHospital: 'Sykehuset Innlandet Lillehammer — 12 km',
    },
    amenities: ['WiFi', 'Parking', 'Fireplace', 'Kitchen', 'BBQ grill', 'Ski storage', 'Sauna', 'Hiking trails'],
    rooms: [
      { name: 'Master Bedroom', beds: 'Queen' },
      { name: 'Bedroom 2', beds: '2x Single' },
      { name: 'Loft', beds: '2x Single', notes: 'Kids love it!' },
    ],
    localArea: {
      supermarket: 'Rema 1000 Lillehammer',
      supermarketDistance: '9 km',
      airport: 'Oslo Gardermoen (OSL)',
      airportDistance: '185 km',
      attractions: ['Hafjell Alpine Resort (8 km)', 'Hunderfossen Family Park (14 km)', 'Norwegian Olympic Museum (11 km)'],
    },
    cleaningInstructions: 'Sweep fireplace ashes. Check all window shutters closed. Deep clean bathrooms and kitchen. Leave enough firewood starters for next guests.',
    cleaningDuration: 180,
    bufferDays: 2,
    inspectionRequired: true,
    photos: [
      { url: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80', caption: 'Cabin exterior', isPrimary: true },
    ],
    completionScore: 81,
  },
]

export function getLibrary(propertyId: string): PropertyLibrary | undefined {
  return PROPERTY_LIBRARIES.find(l => l.propertyId === propertyId)
}
