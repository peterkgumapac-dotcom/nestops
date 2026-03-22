import type { ChecklistItem, WorkItem, TaskPhoto, DeployRequest } from '@/lib/data/checklists'
import { getCleaningChecklist, getMaintenanceChecklist } from '@/lib/data/checklists'

export interface ActivityEntry {
  id: string
  type: 'message' | 'system'
  authorName?: string
  authorRole?: string
  authorAvatar?: string
  message?: string
  event?: string
  detail?: string
  timestamp: string
}

export type JobStatus = 'pending' | 'in_progress' | 'done'
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent'
export type JobPTEStatus = 'not_required' | 'auto_granted' | 'pending' | 'granted' | 'denied' | 'expired'

export interface JobReservation {
  id: string
  guestName: string
  guestEmail?: string
  platform?: string
  checkIn: string
  checkOut: string
  nights: number
  nightsRemaining?: number
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
}

export interface JobPTE {
  status: JobPTEStatus
  requestedAt?: string
  requestedBy?: string
  grantedBy?: string
  grantedAt?: string
  deniedBy?: string
  deniedAt?: string
  deniedReason?: string
  guestName?: string
  guestCheckout?: string
  enterAfter?: string
  validFrom?: string
  validUntil?: string
  accessCode?: string
  notes?: string
}

export interface Job {
  id: string
  title: string
  propertyId: string
  propertyName: string
  type: 'cleaning' | 'maintenance' | 'inspection' | 'intake' | 'guest_services' | 'delivery'
  status: JobStatus
  priority: JobPriority
  dueTime: string
  notes?: string
  checkoutTime?: string
  checkinTime?: string
  urgencyLabel?: 'Urgent' | 'Scheduled'
  pteRequired?: boolean
  pteStatus?: JobPTEStatus
  pte?: JobPTE
  reservation?: JobReservation
  staffId?: string
  checklist?: ChecklistItem[]
  deployRequests?: DeployRequest[]
  workItems?: WorkItem[]
  beforePhotos?: TaskPhoto[]
  afterPhotos?: TaskPhoto[]
  activity?: ActivityEntry[]
}

export interface StaffMember {
  id: string
  name: string
  initials: string
  role: string
  assignedPropertyIds: string[]
  status: 'active' | 'inactive'
  jobIds: string[]
  hourlyRate: number // NOK per hour
}

const HENRIK_RESERVATION: JobReservation = {
  id: 'res-001',
  guestName: 'Henrik Solberg',
  platform: 'Airbnb',
  checkIn: '2026-03-18',
  checkOut: '2026-03-22',
  nights: 4,
  nightsRemaining: 2,
  status: 'checked_in',
}

export const JOBS: Job[] = [
  {
    id: 'j1',
    title: 'Full turnover clean',
    propertyId: 'p1', propertyName: 'Sunset Villa',
    type: 'cleaning', status: 'pending', priority: 'urgent',
    dueTime: '14:00', checkoutTime: '11:00', checkinTime: '15:00',
    urgencyLabel: 'Urgent', pteRequired: false, pteStatus: 'not_required',
    staffId: 's1',
    reservation: { id: 'res-100', guestName: 'Emma Lindqvist', platform: 'Airbnb', checkIn: '2026-03-22', checkOut: '2026-03-27', nights: 5, nightsRemaining: 5, status: 'confirmed' },
    checklist: getCleaningChecklist(3, 2, ['hottub']),
    deployRequests: [],
    beforePhotos: [], afterPhotos: [],
  },
  {
    id: 'j2',
    title: 'Inspect heating system',
    propertyId: 'p4', propertyName: 'Downtown Loft',
    type: 'maintenance', status: 'in_progress', priority: 'high',
    dueTime: '12:00', urgencyLabel: 'Urgent',
    pteRequired: true, pteStatus: 'pending',
    pte: { status: 'pending', requestedBy: 'Bjorn Larsen', requestedAt: '2026-03-20T07:30:00', guestName: 'Henrik Solberg', guestCheckout: '2026-03-22T11:00:00', notes: 'Guest in property — GS contacting guest' },
    reservation: HENRIK_RESERVATION,
    staffId: 's3',
    workItems: getMaintenanceChecklist().map(i => ({ ...i, completed: false })),
    beforePhotos: [], afterPhotos: [],
    activity: [
      { id: 'act-1', type: 'system', event: 'Task created', detail: 'Assigned to Bjorn Larsen', timestamp: '2026-03-20T07:30:00' },
      { id: 'act-2', type: 'system', event: 'PTE required', detail: 'Guest Henrik Solberg in property. GS notified.', timestamp: '2026-03-20T07:30:00' },
      { id: 'act-3', type: 'message', authorName: 'Fatima Ndiaye', authorRole: 'guest_services', authorAvatar: 'FN', message: 'Contacting guest now via WhatsApp. Henrik is usually responsive in mornings.', timestamp: '2026-03-20T08:15:00' },
      { id: 'act-4', type: 'message', authorName: 'Bjorn Larsen', authorRole: 'maintenance', authorAvatar: 'BL', message: 'Going to Sunset Villa first while waiting. That one is empty so I can start there.', timestamp: '2026-03-20T08:45:00' },
      { id: 'act-5', type: 'message', authorName: 'Fatima Ndiaye', authorRole: 'guest_services', authorAvatar: 'FN', message: 'Henrik confirmed — OK to enter between 11:00 and 15:00. He will be out for lunch.', timestamp: '2026-03-20T09:30:00' },
      { id: 'act-6', type: 'system', event: 'Guest granted PTE via Fatima Ndiaye', detail: 'Access window: 11:00–15:00. Access code unlocked.', timestamp: '2026-03-20T09:30:00' },
    ],
  },
  {
    id: 'j3',
    title: 'Quarterly inspection',
    propertyId: 'p3', propertyName: 'Ocean View Apt',
    type: 'inspection', status: 'pending', priority: 'medium',
    dueTime: '10:00', checkoutTime: '10:00', checkinTime: '15:00',
    urgencyLabel: 'Scheduled', pteRequired: false, pteStatus: 'not_required',
    staffId: 's2',
    workItems: getMaintenanceChecklist().map(i => ({ ...i, completed: false })),
    beforePhotos: [], afterPhotos: [],
  },
  {
    id: 'j4',
    title: 'Standard clean',
    propertyId: 'p2', propertyName: 'Harbor Studio',
    type: 'cleaning', status: 'done', priority: 'low',
    dueTime: '11:00', pteRequired: false, pteStatus: 'not_required',
    staffId: 's1',
    checklist: getCleaningChecklist(1, 1, []),
    deployRequests: [],
    beforePhotos: [], afterPhotos: [],
  },
  {
    id: 'j5',
    title: 'New property intake',
    propertyId: 'p5', propertyName: 'Mountain Cabin',
    type: 'intake', status: 'pending', priority: 'medium',
    dueTime: '09:00', pteRequired: false, pteStatus: 'not_required',
    staffId: 's1',
  },
  {
    id: 'j6',
    title: 'Fix hot tub heater',
    propertyId: 'p1', propertyName: 'Sunset Villa',
    type: 'maintenance', status: 'pending', priority: 'high',
    dueTime: '15:00', urgencyLabel: 'Urgent',
    pteRequired: true, pteStatus: 'auto_granted',
    pte: { status: 'auto_granted', grantedBy: 'system', grantedAt: '2026-03-20T06:00:00', accessCode: '7734', enterAfter: '11:00', notes: 'Property empty — no active reservation' },
    staffId: 's3',
    workItems: getMaintenanceChecklist().map(i => ({ ...i, completed: false })),
    beforePhotos: [], afterPhotos: [],
  },
  {
    id: 'j7',
    title: 'Fix toilet — blocked',
    propertyId: 'p3', propertyName: 'Ocean View Apt',
    type: 'maintenance', status: 'pending', priority: 'urgent',
    dueTime: '11:00', urgencyLabel: 'Urgent',
    pteRequired: true, pteStatus: 'granted',
    pte: { status: 'granted', grantedBy: 'Fatima Ndiaye', grantedAt: '2026-03-20T09:00:00', accessCode: '9182', enterAfter: '11:00', validFrom: '2026-03-20T11:00:00', validUntil: '2026-03-20T13:00:00', notes: 'Guest confirmed via message.' },
    staffId: 's3',
    workItems: getMaintenanceChecklist().map(i => ({ ...i, completed: false })),
    beforePhotos: [], afterPhotos: [],
  },
  {
    id: 'j8',
    title: 'Pool inspection',
    propertyId: 'p5', propertyName: 'Mountain Cabin',
    type: 'inspection', status: 'pending', priority: 'medium',
    dueTime: '14:00', urgencyLabel: 'Scheduled',
    pteRequired: false, pteStatus: 'not_required',
    staffId: 's2',
    workItems: [
      { id: 'wi-13', label: 'Check chemical levels and water clarity', completed: false },
      { id: 'wi-14', label: 'Clean filters and skimmer baskets', completed: false },
      { id: 'wi-15', label: 'Inspect pump and heating system', completed: false },
      { id: 'wi-16', label: 'Note any issues or repairs needed', completed: false },
    ],
    beforePhotos: [], afterPhotos: [],
  },
  {
    id: 'j9',
    title: 'Follow up on guest complaint — heating',
    propertyId: 'p4', propertyName: 'Downtown Loft',
    type: 'guest_services', status: 'pending', priority: 'high',
    dueTime: '10:00', urgencyLabel: 'Urgent',
    pteRequired: false, pteStatus: 'not_required',
    staffId: 's4',
  },
  {
    id: 'j10',
    title: 'Coordinate late check-in — Sunset Villa',
    propertyId: 'p1', propertyName: 'Sunset Villa',
    type: 'guest_services', status: 'pending', priority: 'medium',
    dueTime: '16:00', urgencyLabel: 'Scheduled',
    pteRequired: false, pteStatus: 'not_required',
    staffId: 's4',
  },
  {
    id: 'j11',
    title: 'Deliver extra towels',
    propertyId: 'p4', propertyName: 'Downtown Loft',
    type: 'delivery', status: 'pending', priority: 'medium',
    dueTime: '14:00', urgencyLabel: 'Scheduled',
    pteRequired: true, pteStatus: 'granted',
    pte: { status: 'granted', grantedBy: 'Fatima Ndiaye', grantedAt: '2026-03-20T09:00:00', guestName: 'Henrik Solberg', guestCheckout: '2026-03-22T11:00:00', enterAfter: '14:00', validFrom: '2026-03-20T14:00:00', validUntil: '2026-03-20T15:00:00', accessCode: '4421', notes: 'Guest confirmed via WhatsApp. Leave towels in bathroom.' },
    reservation: HENRIK_RESERVATION,
    staffId: 's4',
    workItems: [
      { id: 'wi-17', label: 'Collect items from warehouse/storage', completed: false },
      { id: 'wi-18', label: 'Deliver to property', completed: false },
      { id: 'wi-19', label: 'Place items as requested', completed: false },
      { id: 'wi-20', label: 'Confirm delivery complete', completed: false },
    ],
    beforePhotos: [], afterPhotos: [],
  },
]

export const STAFF_MEMBERS: StaffMember[] = [
  { id: 's1', name: 'Johan Larsson',  initials: 'JL', role: 'Senior Cleaner',            assignedPropertyIds: ['p1', 'p3', 'p5'],             status: 'active', jobIds: ['j1', 'j3', 'j5'],  hourlyRate: 285 },
  { id: 's2', name: 'Anna Kowalski',  initials: 'AK', role: 'Inspector',                 assignedPropertyIds: ['p2', 'p4'],                   status: 'active', jobIds: ['j3', 'j8'],         hourlyRate: 320 },
  { id: 's3', name: 'Bjorn Larsen',   initials: 'BL', role: 'Maintenance Tech',           assignedPropertyIds: ['p1', 'p4'],                   status: 'active', jobIds: ['j2', 'j6', 'j7'],   hourlyRate: 310 },
  { id: 's4', name: 'Fatima Ndiaye',  initials: 'FN', role: 'Guest Services Coordinator', assignedPropertyIds: ['p1','p2','p3','p4','p5'],      status: 'active', jobIds: ['j9', 'j10'],        hourlyRate: 295 },
]
