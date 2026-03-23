export type MaintenanceFlagStatus = 'pending_review' | 'scheduled' | 'converted'

export interface MaintenanceFlag {
  id: string
  propertyId: string
  propertyName: string
  reportedBy: string       // cleaner name
  reportedAt: string       // ISO timestamp
  issueType: string        // e.g. "Broken fixture", "Leak", etc.
  description: string
  urgency: 'today' | 'later'
  status: MaintenanceFlagStatus
  linkedJobId?: string     // set when converted to maintenance task
}

export const MAINTENANCE_FLAGS: MaintenanceFlag[] = [
  {
    id: 'mf-1',
    propertyId: 'p2',
    propertyName: 'Harbor Studio',
    reportedBy: 'Maria S.',
    reportedAt: '2026-03-22T09:42:00',
    issueType: 'Broken fixture',
    description: 'Shower head is cracked and leaking at the base. Water pressure very low.',
    urgency: 'today',
    status: 'pending_review',
  },
  {
    id: 'mf-2',
    propertyId: 'p3',
    propertyName: 'Ocean View Apt',
    reportedBy: 'Maria S.',
    reportedAt: '2026-03-22T11:15:00',
    issueType: 'Appliance',
    description: 'Dishwasher door latch is broken — door won\'t seal properly.',
    urgency: 'later',
    status: 'pending_review',
  },
]
