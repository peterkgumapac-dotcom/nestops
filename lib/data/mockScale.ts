/**
 * Mock scale data generator — 50 properties with proportional reservations, jobs, and issues.
 * Toggle USE_SCALE_DATA to validate dashboard aggregation at scale.
 */
import type { Reservation } from './reservations'
import type { Job, JobStatus, JobPriority } from './staff'
import type { GuestIssue, IssueCategory, IssueSeverity, IssueStatus } from './guestServices'
import type { Property } from './properties'

export const USE_SCALE_DATA = false

// ─── Property generation ──────────────────────────────────────────────────────

const BASE_NAMES = [
  'Sunset Villa', 'Harbor Studio', 'Ocean View Apt', 'Downtown Loft', 'Mountain Cabin',
  'Fjord House', 'Birch Lodge', 'Pine Retreat', 'Glacier View', 'Coastal Flat',
]

function makeProperties(): Property[] {
  const props: Property[] = []
  for (let i = 0; i < 50; i++) {
    const baseName = BASE_NAMES[i % BASE_NAMES.length] ?? 'Unit'
    const unitNum = Math.floor(i / BASE_NAMES.length) + 1
    const suffix = unitNum > 1 ? ` — Unit ${unitNum}` : ''
    props.push({
      id: `sp${i + 1}`,
      name: `${baseName}${suffix}`,
      address: `Testveien ${i + 1}`,
      city: 'Oslo',
      beds: 1 + (i % 5),
      baths: 1 + (i % 3),
      status: 'live',
      ownerId: `o${(i % 5) + 1}`,
    })
  }
  return props
}

// ─── Reservation generation ───────────────────────────────────────────────────

const GUEST_NAMES = [
  'Emma Lindqvist', 'Marco Bianchi', 'Sarah Chen', 'Tobias Mäkinen', 'Ingrid Halvorsen',
  'David Park', 'Lena Schulz', 'Alex Torres', 'Mia Kowalski', 'James Oduya',
  'Priya Nair', 'Felix Hartmann', 'Yuki Tanaka', 'Anna Petrov', 'Carlos Silva',
  'Nina Berg', 'Omar Hassan', 'Julia Fischer', 'Kim Nguyen', 'Lars Eriksson',
]

const BOOKING_SOURCES = ['Airbnb', 'Booking.com', 'Direct', 'VRBO']

function makeReservations(properties: Property[], todayStr: string): Reservation[] {
  const reservations: Reservation[] = []
  const today = new Date(todayStr)
  let resIdx = 0

  for (const prop of properties) {
    // 3-5 reservations per property spread across the week
    const count = 3 + (resIdx % 3)
    for (let r = 0; r < count; r++) {
      resIdx++
      const dayOffset = r - 1 // some check in yesterday, today, tomorrow, etc.
      const checkIn = new Date(today)
      checkIn.setDate(checkIn.getDate() + dayOffset)
      const nights = 2 + (resIdx % 5)
      const checkOut = new Date(checkIn)
      checkOut.setDate(checkOut.getDate() + nights)

      const guestName = GUEST_NAMES[resIdx % GUEST_NAMES.length] ?? 'Guest'
      const source = BOOKING_SOURCES[resIdx % BOOKING_SOURCES.length] ?? 'Direct'

      reservations.push({
        id: `sr${resIdx}`,
        guestVerificationId: `sgv${resIdx}`,
        propertyId: prop.id,
        propertyName: prop.name,
        guestName,
        checkInDate: fmt(checkIn),
        checkOutDate: fmt(checkOut),
        nights,
        bookingSource: source,
        bookingRef: `SC-${10000 + resIdx}`,
        pmsStatus: 'confirmed',
        totalAmount: 200 + resIdx * 10,
        currency: 'USD',
        guestsCount: 1 + (resIdx % 4),
        syncedAt: `${todayStr}T06:00:00Z`,
        pmsProvider: 'hostaway',
        specialRequests: resIdx % 7 === 0 ? 'Late check-out requested if possible.' : undefined,
      })
    }
  }
  return reservations
}

// ─── Job generation ───────────────────────────────────────────────────────────

const JOB_TYPES: Job['type'][] = ['cleaning', 'maintenance', 'inspection', 'guest_services']
const JOB_TITLES: Record<string, string[]> = {
  cleaning: ['Full turnover clean', 'Deep clean', 'Mid-stay tidy', 'Express clean'],
  maintenance: ['Fix AC unit', 'Plumbing repair', 'Replace light fixture', 'Fix lock'],
  inspection: ['Quarterly inspection', 'Pre-arrival check', 'Safety audit'],
  guest_services: ['Guest complaint follow-up', 'Amenity request', 'Late check-in coordination'],
}

function makeJobs(properties: Property[]): Job[] {
  const jobs: Job[] = []
  const statuses: JobStatus[] = ['pending', 'in_progress', 'done']
  const priorities: JobPriority[] = ['low', 'medium', 'high', 'urgent']
  let idx = 0

  for (const prop of properties) {
    // 2 jobs per property on average
    const count = 1 + (idx % 3)
    for (let j = 0; j < count; j++) {
      idx++
      const type = JOB_TYPES[idx % JOB_TYPES.length] ?? 'cleaning'
      const titles = JOB_TITLES[type] ?? ['Task']
      const title = titles[idx % titles.length] ?? 'Task'
      const status = statuses[idx % statuses.length] ?? 'pending'
      const priority = priorities[idx % priorities.length] ?? 'medium'

      jobs.push({
        id: `sj${idx}`,
        title,
        propertyId: prop.id,
        propertyName: prop.name,
        type,
        status,
        priority,
        dueTime: `${9 + (idx % 8)}:00`,
        staffId: idx % 5 === 0 ? undefined : `s${(idx % 4) + 1}`,
        pteRequired: type === 'maintenance' && idx % 3 === 0,
        pteStatus: type === 'maintenance' && idx % 3 === 0 ? 'pending' : 'not_required',
        pte: type === 'maintenance' && idx % 3 === 0
          ? { status: 'pending' as const, requestedBy: 'System', requestedAt: '2026-03-20T07:00:00' }
          : undefined,
      })
    }
  }
  return jobs
}

// ─── Guest issue generation ───────────────────────────────────────────────────

const ISSUE_TITLES = [
  'Noisy neighbor complaint', 'Hot water not working', 'WiFi down', 'Broken window latch',
  'AC not cooling', 'Dirty bathroom on arrival', 'Missing towels', 'Door lock stuck',
  'Fridge not cold', 'Shower leak',
]

function makeIssues(properties: Property[], todayStr: string): GuestIssue[] {
  const issues: GuestIssue[] = []
  const categories: IssueCategory[] = ['noise', 'maintenance', 'amenity_failure', 'cleanliness', 'access_issue']
  const severities: IssueSeverity[] = ['low', 'medium', 'high', 'critical']
  const statuses: IssueStatus[] = ['open', 'investigating', 'resolved', 'escalated']
  let idx = 0

  for (const prop of properties.slice(0, 30)) {
    if (idx % 3 !== 0) { idx++; continue } // ~1/3 of properties have issues
    idx++
    const title = ISSUE_TITLES[idx % ISSUE_TITLES.length] ?? 'Issue'
    const category = categories[idx % categories.length] ?? 'maintenance'
    const severity = severities[idx % severities.length] ?? 'medium'
    const status = statuses[idx % statuses.length] ?? 'open'

    const checkIn = new Date(todayStr)
    checkIn.setDate(checkIn.getDate() - 1)
    const checkOut = new Date(todayStr)
    checkOut.setDate(checkOut.getDate() + 3)

    issues.push({
      id: `si${idx}`,
      propertyId: prop.id,
      propertyName: prop.name,
      reservationId: `sr${idx}`,
      guestName: GUEST_NAMES[idx % GUEST_NAMES.length] ?? 'Guest',
      checkInDate: fmt(checkIn),
      checkOutDate: fmt(checkOut),
      totalNights: 4,
      nightlyRate: 180,
      bookingChannel: 'airbnb',
      category,
      severity,
      title,
      description: `${title} reported by guest.`,
      reportedAt: `${todayStr}T08:00:00Z`,
      reportedBy: 'guest',
      affectedNights: 1,
      status,
      photos: [],
      internalNotes: '',
      timeline: [],
    })
  }
  return issues
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(d: Date): string {
  return d.toISOString().split('T')[0] ?? ''
}

// ─── Export ───────────────────────────────────────────────────────────────────

const TODAY = '2026-03-25'

export const SCALE_PROPERTIES = makeProperties()
export const SCALE_RESERVATIONS = makeReservations(SCALE_PROPERTIES, TODAY)
export const SCALE_JOBS = makeJobs(SCALE_PROPERTIES)
export const SCALE_ISSUES = makeIssues(SCALE_PROPERTIES, TODAY)
