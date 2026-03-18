export type IssueCategory =
  | 'cleanliness'
  | 'maintenance'
  | 'noise'
  | 'amenity_failure'
  | 'access_issue'
  | 'listing_inaccuracy'
  | 'safety'
  | 'other'

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical'

export type IssueStatus =
  | 'open'
  | 'investigating'
  | 'resolved'
  | 'escalated'
  | 'refund_pending'
  | 'refund_issued'
  | 'closed'

export type RefundType =
  | 'full_night'
  | 'partial_50'
  | 'partial_25'
  | 'full_stay'
  | 'custom'
  | 'none'

export type RefundStatus = 'pending' | 'approved' | 'issued' | 'declined'

export interface GuestIssue {
  id: string
  propertyId: string
  propertyName: string
  propertyImage?: string

  // Reservation
  reservationId: string
  guestName: string
  guestEmail?: string
  checkInDate: string
  checkOutDate: string
  totalNights: number
  nightlyRate: number
  bookingChannel: 'airbnb' | 'booking_com' | 'direct' | 'vrbo'

  // Issue
  category: IssueCategory
  severity: IssueSeverity
  title: string
  description: string
  reportedAt: string
  reportedBy: 'guest' | 'staff' | 'operator'
  affectedNights: number

  // Status
  status: IssueStatus
  assignedTo?: string
  resolvedAt?: string
  resolutionTimeMinutes?: number
  resolutionNotes?: string

  // Refund
  refund?: {
    requested: boolean
    suggestedAmount: number
    approvedAmount: number
    affectedNightNumbers: number[]
    refundType: RefundType
    status: RefundStatus
    issuedVia: 'airbnb' | 'stripe' | 'booking_com' | 'manual'
    approvedBy?: string
    issuedAt?: string
    notes?: string
  }

  photos: string[]
  internalNotes: string
  timeline: {
    at: string
    by: string
    action: string
    note?: string
  }[]
}

export const GUEST_ISSUES: GuestIssue[] = [
  // ─── Sunset Villa ────────────────────────────────────────────────
  {
    id: 'gi-1',
    propertyId: 'p1',
    propertyName: 'Sunset Villa',
    propertyImage: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400&q=80',
    reservationId: 'RES-2026-0301',
    guestName: 'Emma Lindström',
    guestEmail: 'emma.l@email.com',
    checkInDate: '2026-03-01',
    checkOutDate: '2026-03-06',
    totalNights: 5,
    nightlyRate: 1800,
    bookingChannel: 'airbnb',
    category: 'maintenance',
    severity: 'high',
    title: 'AC unit stopped working on night 3',
    description: 'The air conditioning in the master bedroom completely stopped working during our stay. Reported to host immediately. Temperature was uncomfortable.',
    reportedAt: '2026-03-03T22:14:00',
    reportedBy: 'guest',
    affectedNights: 2,
    status: 'refund_issued',
    assignedTo: 'Bjorn L.',
    resolvedAt: '2026-03-04T09:30:00',
    resolutionTimeMinutes: 676,
    resolutionNotes: 'Technician dispatched next morning. Faulty capacitor replaced. Partial refund issued for 2 affected nights.',
    refund: {
      requested: true,
      suggestedAmount: 3600,
      approvedAmount: 1800,
      affectedNightNumbers: [3, 4],
      refundType: 'partial_50',
      status: 'issued',
      issuedVia: 'airbnb',
      approvedBy: 'Peter K.',
      issuedAt: '2026-03-05T10:00:00',
      notes: '50% refund for 2 nights as AC was repaired same day',
    },
    photos: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80'],
    internalNotes: 'AC unit is old — schedule full replacement before summer.',
    timeline: [
      { at: '2026-03-03T22:14:00', by: 'Guest', action: 'Issue reported via Airbnb message' },
      { at: '2026-03-03T22:45:00', by: 'Peter K.', action: 'Acknowledged and logged in NestOps' },
      { at: '2026-03-04T08:00:00', by: 'Peter K.', action: 'Assigned to Bjorn L. — technician dispatch' },
      { at: '2026-03-04T09:30:00', by: 'Bjorn L.', action: 'Resolved — capacitor replaced' },
      { at: '2026-03-05T10:00:00', by: 'Peter K.', action: 'Refund NOK 1,800 issued via Airbnb' },
    ],
  },
  {
    id: 'gi-2',
    propertyId: 'p1',
    propertyName: 'Sunset Villa',
    propertyImage: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400&q=80',
    reservationId: 'RES-2026-0215',
    guestName: 'Marcus Weber',
    checkInDate: '2026-02-15',
    checkOutDate: '2026-02-18',
    totalNights: 3,
    nightlyRate: 1800,
    bookingChannel: 'booking_com',
    category: 'cleanliness',
    severity: 'medium',
    title: 'Bathroom not properly cleaned',
    description: 'Found hair in the shower drain and soap scum on the tiles. Not acceptable for this price point.',
    reportedAt: '2026-02-15T16:30:00',
    reportedBy: 'guest',
    affectedNights: 1,
    status: 'resolved',
    assignedTo: 'Maria S.',
    resolvedAt: '2026-02-15T18:00:00',
    resolutionTimeMinutes: 90,
    resolutionNotes: 'Maria re-cleaned bathroom within 90 minutes of check-in. Guest satisfied.',
    refund: {
      requested: false,
      suggestedAmount: 0,
      approvedAmount: 0,
      affectedNightNumbers: [1],
      refundType: 'none',
      status: 'declined',
      issuedVia: 'manual',
      notes: 'Issue resolved immediately, no refund requested by guest',
    },
    photos: [],
    internalNotes: 'Review cleaning checklist for bathrooms. Fatima was assigned this clean.',
    timeline: [
      { at: '2026-02-15T16:30:00', by: 'Guest', action: 'Issue reported at check-in' },
      { at: '2026-02-15T16:45:00', by: 'Peter K.', action: 'Maria S. dispatched for re-clean' },
      { at: '2026-02-15T18:00:00', by: 'Maria S.', action: 'Re-clean completed. Guest happy.' },
    ],
  },
  {
    id: 'gi-3',
    propertyId: 'p1',
    propertyName: 'Sunset Villa',
    propertyImage: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400&q=80',
    reservationId: 'RES-2026-0220',
    guestName: 'Sophie Andersen',
    checkInDate: '2026-02-20',
    checkOutDate: '2026-02-25',
    totalNights: 5,
    nightlyRate: 1800,
    bookingChannel: 'airbnb',
    category: 'amenity_failure',
    severity: 'low',
    title: 'Dishwasher not working',
    description: "Dishwasher makes loud noise and doesn't complete cycle.",
    reportedAt: '2026-02-22T11:00:00',
    reportedBy: 'guest',
    affectedNights: 3,
    status: 'closed',
    assignedTo: 'Bjorn L.',
    resolvedAt: '2026-02-23T14:00:00',
    resolutionTimeMinutes: 1740,
    resolutionNotes: 'Technician found worn pump. Temporary fix applied. Full replacement scheduled.',
    refund: {
      requested: true,
      suggestedAmount: 450,
      approvedAmount: 450,
      affectedNightNumbers: [3, 4, 5],
      refundType: 'custom',
      status: 'issued',
      issuedVia: 'airbnb',
      approvedBy: 'Peter K.',
      issuedAt: '2026-02-24T09:00:00',
      notes: 'NOK 150 gesture per affected night — minor amenity issue',
    },
    photos: [],
    internalNotes: 'Dishwasher needs full replacement. Added to fixed assets repair queue.',
    timeline: [
      { at: '2026-02-22T11:00:00', by: 'Guest', action: 'Reported via Airbnb' },
      { at: '2026-02-22T12:00:00', by: 'Peter K.', action: 'Logged and assigned' },
      { at: '2026-02-23T14:00:00', by: 'Bjorn L.', action: 'Temporary fix applied' },
      { at: '2026-02-24T09:00:00', by: 'Peter K.', action: 'NOK 450 refund issued' },
    ],
  },
  {
    id: 'gi-4',
    propertyId: 'p1',
    propertyName: 'Sunset Villa',
    propertyImage: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400&q=80',
    reservationId: 'RES-2026-0310',
    guestName: 'Lars Eriksen',
    checkInDate: '2026-03-10',
    checkOutDate: '2026-03-15',
    totalNights: 5,
    nightlyRate: 1800,
    bookingChannel: 'direct',
    category: 'noise',
    severity: 'medium',
    title: 'Noise from construction next door',
    description: 'Construction noise starting at 7am every day. Woke us up early each morning.',
    reportedAt: '2026-03-11T08:15:00',
    reportedBy: 'guest',
    affectedNights: 4,
    status: 'resolved',
    assignedTo: 'Peter K.',
    resolvedAt: '2026-03-11T09:00:00',
    resolutionTimeMinutes: 45,
    resolutionNotes: 'External construction beyond our control. Offered earplugs and late checkout. Guest accepted.',
    refund: {
      requested: true,
      suggestedAmount: 900,
      approvedAmount: 0,
      affectedNightNumbers: [2, 3, 4, 5],
      refundType: 'none',
      status: 'declined',
      issuedVia: 'manual',
      notes: 'External factor — not property fault. Offered late checkout as goodwill.',
    },
    photos: [],
    internalNotes: 'Add construction notice to listing description until June 2026.',
    timeline: [
      { at: '2026-03-11T08:15:00', by: 'Guest', action: 'Reported via direct message' },
      { at: '2026-03-11T09:00:00', by: 'Peter K.', action: 'Responded — offered late checkout' },
    ],
  },

  // ─── Downtown Loft ─────────────────────────────────────────────
  {
    id: 'gi-5',
    propertyId: 'p4',
    propertyName: 'Downtown Loft',
    propertyImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80',
    reservationId: 'RES-2026-0201',
    guestName: 'Ingrid Haugen',
    checkInDate: '2026-02-01',
    checkOutDate: '2026-02-05',
    totalNights: 4,
    nightlyRate: 1400,
    bookingChannel: 'airbnb',
    category: 'maintenance',
    severity: 'critical',
    title: 'Heating system failure — apartment freezing',
    description: 'Heating stopped working completely on night 1. Temperature dropped to 14°C. Had to sleep in coats.',
    reportedAt: '2026-02-01T23:30:00',
    reportedBy: 'guest',
    affectedNights: 3,
    status: 'refund_issued',
    assignedTo: 'Bjorn L.',
    resolvedAt: '2026-02-02T14:00:00',
    resolutionTimeMinutes: 870,
    resolutionNotes: 'Emergency plumber called. Boiler thermostat failed. Replaced next morning.',
    refund: {
      requested: true,
      suggestedAmount: 5600,
      approvedAmount: 4200,
      affectedNightNumbers: [1, 2, 3],
      refundType: 'full_night',
      status: 'issued',
      issuedVia: 'airbnb',
      approvedBy: 'Peter K.',
      issuedAt: '2026-02-03T10:00:00',
      notes: 'Full refund for 3 affected nights. Critical failure.',
    },
    photos: ['https://images.unsplash.com/photo-1558618047-f4e60cef6c8c?w=400&q=80'],
    internalNotes: 'URGENT: Downtown Loft boiler is aging. Full replacement needed before next winter.',
    timeline: [
      { at: '2026-02-01T23:30:00', by: 'Guest', action: 'Emergency report — no heating' },
      { at: '2026-02-01T23:45:00', by: 'Peter K.', action: 'Emergency acknowledged. Bjorn called.' },
      { at: '2026-02-02T14:00:00', by: 'Bjorn L.', action: 'Boiler repaired' },
      { at: '2026-02-03T10:00:00', by: 'Peter K.', action: 'NOK 4,200 full refund issued' },
    ],
  },
  {
    id: 'gi-6',
    propertyId: 'p4',
    propertyName: 'Downtown Loft',
    propertyImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80',
    reservationId: 'RES-2026-0210',
    guestName: 'Thomas Nilsen',
    checkInDate: '2026-02-10',
    checkOutDate: '2026-02-13',
    totalNights: 3,
    nightlyRate: 1400,
    bookingChannel: 'booking_com',
    category: 'access_issue',
    severity: 'high',
    title: 'Keypad code not working at check-in',
    description: 'Arrived at 4pm. Code was not working. Waited outside for 45 minutes in the cold.',
    reportedAt: '2026-02-10T16:05:00',
    reportedBy: 'guest',
    affectedNights: 1,
    status: 'refund_issued',
    assignedTo: 'Peter K.',
    resolvedAt: '2026-02-10T16:50:00',
    resolutionTimeMinutes: 45,
    resolutionNotes: 'Code had expired — battery in keypad was low causing glitches. Operator provided manual entry.',
    refund: {
      requested: true,
      suggestedAmount: 700,
      approvedAmount: 700,
      affectedNightNumbers: [1],
      refundType: 'partial_50',
      status: 'issued',
      issuedVia: 'booking_com',
      approvedBy: 'Peter K.',
      issuedAt: '2026-02-11T09:00:00',
      notes: '50% refund first night for access inconvenience',
    },
    photos: [],
    internalNotes: 'Replace keypad battery monthly. Add to cleaning checklist.',
    timeline: [
      { at: '2026-02-10T16:05:00', by: 'Guest', action: 'Called operator — locked out' },
      { at: '2026-02-10T16:50:00', by: 'Peter K.', action: 'Remote reset + manual override' },
      { at: '2026-02-11T09:00:00', by: 'Peter K.', action: 'NOK 700 refund issued' },
    ],
  },
  {
    id: 'gi-7',
    propertyId: 'p4',
    propertyName: 'Downtown Loft',
    propertyImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80',
    reservationId: 'RES-2026-0301',
    guestName: 'Anna Kristoffersen',
    checkInDate: '2026-03-01',
    checkOutDate: '2026-03-04',
    totalNights: 3,
    nightlyRate: 1400,
    bookingChannel: 'airbnb',
    category: 'cleanliness',
    severity: 'high',
    title: 'Property not cleaned before arrival',
    description: 'Previous guest items still in the apartment. Dishes in sink, towels on floor.',
    reportedAt: '2026-03-01T15:30:00',
    reportedBy: 'guest',
    affectedNights: 1,
    status: 'resolved',
    assignedTo: 'Maria S.',
    resolvedAt: '2026-03-01T17:30:00',
    resolutionTimeMinutes: 120,
    resolutionNotes: 'Emergency clean dispatched. Maria arrived within 1 hour.',
    refund: {
      requested: true,
      suggestedAmount: 1400,
      approvedAmount: 700,
      affectedNightNumbers: [1],
      refundType: 'partial_50',
      status: 'issued',
      issuedVia: 'airbnb',
      approvedBy: 'Peter K.',
      issuedAt: '2026-03-02T09:00:00',
      notes: '50% first night refund — cleaning failure',
    },
    photos: [],
    internalNotes: 'Cleaning handover failure. Johan did this clean — follow up required.',
    timeline: [
      { at: '2026-03-01T15:30:00', by: 'Guest', action: 'Reported via Airbnb — not cleaned' },
      { at: '2026-03-01T15:45:00', by: 'Peter K.', action: 'Emergency clean dispatched' },
      { at: '2026-03-01T17:30:00', by: 'Maria S.', action: 'Full clean completed' },
      { at: '2026-03-02T09:00:00', by: 'Peter K.', action: 'NOK 700 refund issued' },
    ],
  },
  {
    id: 'gi-8',
    propertyId: 'p4',
    propertyName: 'Downtown Loft',
    propertyImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80',
    reservationId: 'RES-2026-0308',
    guestName: 'Henrik Solberg',
    checkInDate: '2026-03-08',
    checkOutDate: '2026-03-12',
    totalNights: 4,
    nightlyRate: 1400,
    bookingChannel: 'direct',
    category: 'maintenance',
    severity: 'medium',
    title: 'Hot water inconsistent',
    description: 'Hot water runs out after 5 minutes every morning.',
    reportedAt: '2026-03-09T08:30:00',
    reportedBy: 'guest',
    affectedNights: 3,
    status: 'investigating',
    assignedTo: 'Bjorn L.',
    resolutionNotes: '',
    refund: {
      requested: true,
      suggestedAmount: 2100,
      approvedAmount: 0,
      affectedNightNumbers: [2, 3, 4],
      refundType: 'partial_25',
      status: 'pending',
      issuedVia: 'stripe',
      notes: 'Pending resolution',
    },
    photos: [],
    internalNotes: 'Small water heater for apartment size. Upgrade needed.',
    timeline: [
      { at: '2026-03-09T08:30:00', by: 'Guest', action: 'Reported via direct message' },
      { at: '2026-03-09T09:00:00', by: 'Peter K.', action: 'Assigned to Bjorn. Investigating.' },
    ],
  },
  {
    id: 'gi-9',
    propertyId: 'p4',
    propertyName: 'Downtown Loft',
    propertyImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80',
    reservationId: 'RES-2026-0315',
    guestName: 'Camilla Dahl',
    checkInDate: '2026-03-15',
    checkOutDate: '2026-03-17',
    totalNights: 2,
    nightlyRate: 1400,
    bookingChannel: 'airbnb',
    category: 'listing_inaccuracy',
    severity: 'medium',
    title: 'Gym access not available as listed',
    description: 'Listing says gym access included but building gym is under renovation.',
    reportedAt: '2026-03-15T17:00:00',
    reportedBy: 'guest',
    affectedNights: 2,
    status: 'investigating',
    assignedTo: 'Fatima N.',
    photos: [],
    internalNotes: 'Update listing to remove gym access until renovation complete.',
    timeline: [
      { at: '2026-03-15T17:00:00', by: 'Guest', action: 'Reported at check-in' },
      { at: '2026-03-15T17:30:00', by: 'Fatima N.', action: 'Acknowledged — contacting building management about timeline' },
    ],
  },

  // ─── Harbor Studio ──────────────────────────────────────────────
  {
    id: 'gi-10',
    propertyId: 'p2',
    propertyName: 'Harbor Studio',
    propertyImage: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400&q=80',
    reservationId: 'RES-2026-0205',
    guestName: 'Julia Svensson',
    checkInDate: '2026-02-05',
    checkOutDate: '2026-02-08',
    totalNights: 3,
    nightlyRate: 900,
    bookingChannel: 'airbnb',
    category: 'noise',
    severity: 'low',
    title: 'Street noise at night',
    description: 'Busy street — noise until midnight on weekends.',
    reportedAt: '2026-02-06T09:00:00',
    reportedBy: 'guest',
    affectedNights: 2,
    status: 'closed',
    assignedTo: 'Peter K.',
    resolvedAt: '2026-02-06T09:30:00',
    resolutionTimeMinutes: 30,
    resolutionNotes: 'Added to listing description. Offered earplugs for remainder of stay.',
    refund: {
      requested: false,
      suggestedAmount: 0,
      approvedAmount: 0,
      affectedNightNumbers: [],
      refundType: 'none',
      status: 'declined',
      issuedVia: 'manual',
      notes: 'External factor, no refund',
    },
    photos: [],
    internalNotes: 'Add noise disclaimer to listing.',
    timeline: [
      { at: '2026-02-06T09:00:00', by: 'Guest', action: 'Reported via message' },
      { at: '2026-02-06T09:30:00', by: 'Peter K.', action: 'Responded with apology and earplugs offer' },
    ],
  },
  {
    id: 'gi-11',
    propertyId: 'p2',
    propertyName: 'Harbor Studio',
    propertyImage: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400&q=80',
    reservationId: 'RES-2026-0301',
    guestName: 'Olaf Magnusson',
    checkInDate: '2026-03-01',
    checkOutDate: '2026-03-05',
    totalNights: 4,
    nightlyRate: 900,
    bookingChannel: 'booking_com',
    category: 'amenity_failure',
    severity: 'low',
    title: 'Coffee machine not working',
    description: 'Nespresso machine shows error light. Cannot make coffee.',
    reportedAt: '2026-03-02T08:00:00',
    reportedBy: 'guest',
    affectedNights: 1,
    status: 'resolved',
    assignedTo: 'Maria S.',
    resolvedAt: '2026-03-02T11:00:00',
    resolutionTimeMinutes: 180,
    resolutionNotes: 'Descaling required. Maria visited and fixed within 3 hours.',
    refund: {
      requested: false,
      suggestedAmount: 0,
      approvedAmount: 0,
      affectedNightNumbers: [],
      refundType: 'none',
      status: 'declined',
      issuedVia: 'manual',
      notes: 'Minor issue resolved quickly',
    },
    photos: [],
    internalNotes: 'Add descaling to quarterly maintenance schedule.',
    timeline: [
      { at: '2026-03-02T08:00:00', by: 'Guest', action: 'Reported via Booking.com' },
      { at: '2026-03-02T11:00:00', by: 'Maria S.', action: 'Descaled and fixed' },
    ],
  },

  // ─── Ocean View Apt ─────────────────────────────────────────────
  {
    id: 'gi-12',
    propertyId: 'p3',
    propertyName: 'Ocean View Apt',
    propertyImage: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&q=80',
    reservationId: 'RES-2026-0115',
    guestName: 'Petra Novak',
    checkInDate: '2026-01-15',
    checkOutDate: '2026-01-20',
    totalNights: 5,
    nightlyRate: 1200,
    bookingChannel: 'airbnb',
    category: 'maintenance',
    severity: 'high',
    title: 'Bathroom tap leaking',
    description: 'Bathroom tap dripping constantly. Could not sleep due to noise.',
    reportedAt: '2026-01-16T22:00:00',
    reportedBy: 'guest',
    affectedNights: 3,
    status: 'refund_issued',
    assignedTo: 'Bjorn L.',
    resolvedAt: '2026-01-17T11:00:00',
    resolutionTimeMinutes: 780,
    resolutionNotes: 'Washer replaced. Issue resolved next morning.',
    refund: {
      requested: true,
      suggestedAmount: 1800,
      approvedAmount: 900,
      affectedNightNumbers: [2, 3],
      refundType: 'partial_25',
      status: 'issued',
      issuedVia: 'airbnb',
      approvedBy: 'Peter K.',
      issuedAt: '2026-01-18T09:00:00',
      notes: 'NOK 450 per affected night as goodwill',
    },
    photos: [],
    internalNotes: 'Check all tap washers during next maintenance visit.',
    timeline: [
      { at: '2026-01-16T22:00:00', by: 'Guest', action: 'Reported' },
      { at: '2026-01-17T11:00:00', by: 'Bjorn L.', action: 'Washer replaced' },
      { at: '2026-01-18T09:00:00', by: 'Peter K.', action: 'NOK 900 refund issued' },
    ],
  },
  {
    id: 'gi-13',
    propertyId: 'p3',
    propertyName: 'Ocean View Apt',
    propertyImage: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&q=80',
    reservationId: 'RES-2026-0220',
    guestName: 'David Park',
    checkInDate: '2026-02-20',
    checkOutDate: '2026-02-23',
    totalNights: 3,
    nightlyRate: 1200,
    bookingChannel: 'direct',
    category: 'cleanliness',
    severity: 'medium',
    title: 'Mold in bathroom corner',
    description: 'Visible mold in the corner of the shower. Concerning for health.',
    reportedAt: '2026-02-20T17:00:00',
    reportedBy: 'guest',
    affectedNights: 3,
    status: 'escalated',
    assignedTo: 'Bjorn L.',
    resolutionNotes: 'Mold treatment scheduled. Guest offered alternative accommodation.',
    refund: {
      requested: true,
      suggestedAmount: 3600,
      approvedAmount: 3600,
      affectedNightNumbers: [1, 2, 3],
      refundType: 'full_stay',
      status: 'issued',
      issuedVia: 'stripe',
      approvedBy: 'Peter K.',
      issuedAt: '2026-02-21T10:00:00',
      notes: 'Full refund — health/safety issue',
    },
    photos: [],
    internalNotes: 'URGENT: Professional mold remediation required. Property blocked until resolved.',
    timeline: [
      { at: '2026-02-20T17:00:00', by: 'Guest', action: 'Reported health concern' },
      { at: '2026-02-20T17:30:00', by: 'Peter K.', action: 'Escalated. Full refund approved.' },
      { at: '2026-02-21T10:00:00', by: 'Peter K.', action: 'Full NOK 3,600 refund via Stripe' },
    ],
  },
  {
    id: 'gi-14',
    propertyId: 'p3',
    propertyName: 'Ocean View Apt',
    propertyImage: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&q=80',
    reservationId: 'RES-2026-0310',
    guestName: 'Sarah Mitchell',
    checkInDate: '2026-03-10',
    checkOutDate: '2026-03-14',
    totalNights: 4,
    nightlyRate: 1200,
    bookingChannel: 'airbnb',
    category: 'amenity_failure',
    severity: 'low',
    title: 'Netflix not working on Smart TV',
    description: 'Cannot log into Netflix. Error message on screen.',
    reportedAt: '2026-03-10T21:00:00',
    reportedBy: 'guest',
    affectedNights: 1,
    status: 'resolved',
    assignedTo: 'Fatima N.',
    resolvedAt: '2026-03-10T21:30:00',
    resolutionTimeMinutes: 30,
    resolutionNotes: 'Guided guest via WhatsApp to reset the Netflix app. Resolved remotely.',
    refund: {
      requested: false,
      suggestedAmount: 0,
      approvedAmount: 0,
      affectedNightNumbers: [],
      refundType: 'none',
      status: 'declined',
      issuedVia: 'manual',
      notes: 'Resolved remotely in 30 mins',
    },
    photos: [],
    internalNotes: 'Add Netflix troubleshooting to property library.',
    timeline: [
      { at: '2026-03-10T21:00:00', by: 'Guest', action: 'Reported via Airbnb' },
      { at: '2026-03-10T21:10:00', by: 'Fatima N.', action: 'Assigned and reached out to guest via WhatsApp' },
      { at: '2026-03-10T21:30:00', by: 'Fatima N.', action: 'Resolved — Netflix app reset guide worked' },
    ],
  },

  // ─── Mountain Cabin ─────────────────────────────────────────────
  {
    id: 'gi-15',
    propertyId: 'p5',
    propertyName: 'Mountain Cabin',
    propertyImage: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=400&q=80',
    reservationId: 'RES-2026-0301',
    guestName: 'Erik Bjørnstad',
    checkInDate: '2026-03-01',
    checkOutDate: '2026-03-07',
    totalNights: 6,
    nightlyRate: 2200,
    bookingChannel: 'airbnb',
    category: 'access_issue',
    severity: 'low',
    title: 'Gate code changed without notice',
    description: 'The gate code in the welcome guide was outdated.',
    reportedAt: '2026-03-01T18:00:00',
    reportedBy: 'guest',
    affectedNights: 1,
    status: 'resolved',
    assignedTo: 'Fatima N.',
    resolvedAt: '2026-03-01T18:20:00',
    resolutionTimeMinutes: 20,
    resolutionNotes: 'Correct code sent via WhatsApp immediately.',
    refund: {
      requested: false,
      suggestedAmount: 0,
      approvedAmount: 0,
      affectedNightNumbers: [],
      refundType: 'none',
      status: 'declined',
      issuedVia: 'manual',
      notes: 'Resolved in 20 minutes',
    },
    photos: [],
    internalNotes: 'Always update welcome guide when codes change.',
    timeline: [
      { at: '2026-03-01T18:00:00', by: 'Guest', action: 'Called — gate code wrong' },
      { at: '2026-03-01T18:20:00', by: 'Fatima N.', action: 'Correct code sent via WhatsApp immediately' },
    ],
  },
]

// ─── Computed helpers ──────────────────────────────────────────────────────

export function fmtNok(amount: number): string {
  return `NOK ${amount.toLocaleString('no-NO')}`
}

export function getActiveIssues(issues: GuestIssue[]): GuestIssue[] {
  return issues.filter(i =>
    i.status === 'open' || i.status === 'investigating' || i.status === 'escalated'
  )
}

export function getTotalRefunds(issues: GuestIssue[]): number {
  return issues.reduce((sum, i) => sum + (i.refund?.approvedAmount ?? 0), 0)
}

export function getAvgResolutionHrs(issues: GuestIssue[]): number {
  const resolved = issues.filter(i => i.resolutionTimeMinutes != null)
  if (!resolved.length) return 0
  const avg = resolved.reduce((s, i) => s + (i.resolutionTimeMinutes ?? 0), 0) / resolved.length
  return Math.round((avg / 60) * 10) / 10
}

export interface PropertyHealth {
  propertyId: string
  propertyName: string
  propertyImage?: string
  issueCount: number
  openCount: number
  avgResolutionHrs: number
  totalRefunds: number
  health: 'good' | 'watch' | 'alert'
}

export function getPropertyHealth(issues: GuestIssue[]): PropertyHealth[] {
  const grouped: Record<string, GuestIssue[]> = {}
  for (const issue of issues) {
    if (!grouped[issue.propertyId]) grouped[issue.propertyId] = []
    grouped[issue.propertyId].push(issue)
  }
  return Object.entries(grouped).map(([pid, pIssues]) => {
    const open = getActiveIssues(pIssues).length
    const avgHrs = getAvgResolutionHrs(pIssues)
    const hasSafety = pIssues.some(i => i.category === 'safety')
    let health: 'good' | 'watch' | 'alert' = 'good'
    if (pIssues.length >= 4 || avgHrs >= 8 || hasSafety) health = 'alert'
    else if (pIssues.length >= 2 || avgHrs >= 4) health = 'watch'
    return {
      propertyId: pid,
      propertyName: pIssues[0].propertyName,
      propertyImage: pIssues[0].propertyImage,
      issueCount: pIssues.length,
      openCount: open,
      avgResolutionHrs: avgHrs,
      totalRefunds: getTotalRefunds(pIssues),
      health,
    }
  })
}

export function getRedFlagProperties(issues: GuestIssue[]): PropertyHealth[] {
  return getPropertyHealth(issues).filter(p => p.health === 'alert')
}

export function getCategoryBreakdown(issues: GuestIssue[]): Record<IssueCategory, number> {
  const counts = {} as Record<IssueCategory, number>
  for (const issue of issues) {
    counts[issue.category] = (counts[issue.category] ?? 0) + 1
  }
  return counts
}
