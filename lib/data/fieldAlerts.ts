export type FieldAlertType =
  | 'new_task' | 'schedule_change' | 'backjob'
  | 'apartment_dirty' | 'needs_consumables' | 'upsell_escalation'

export type FieldAlertSeverity = 'urgent' | 'warning' | 'info'

export interface FieldAlert {
  id: string
  type: FieldAlertType
  severity: FieldAlertSeverity
  title: string
  body: string
  propertyId: string
  propertyName: string
  assignedTo: string[]        // staffIds
  createdAt: string
  read: boolean
  actionRoute?: string        // if set, clicking the alert navigates here
}

export const FIELD_ALERTS: FieldAlert[] = [
  {
    id: 'fa1',
    type: 'new_task',
    severity: 'info',
    title: 'New deep clean assigned',
    body: 'Ocean View Apt — Today 15:00. Please review the checklist before arriving.',
    propertyId: 'p3',
    propertyName: 'Ocean View Apt',
    assignedTo: ['s1'],
    createdAt: '2026-03-19T08:00:00Z',
    read: false,
  },
  {
    id: 'fa2',
    type: 'schedule_change',
    severity: 'warning',
    title: 'Schedule changed: Harbor Studio',
    body: 'Your shift at Harbor Studio has moved from 09:00 to 11:00 due to a late checkout.',
    propertyId: 'p2',
    propertyName: 'Harbor Studio',
    assignedTo: ['s1'],
    createdAt: '2026-03-19T07:30:00Z',
    read: false,
  },
  {
    id: 'fa3',
    type: 'backjob',
    severity: 'urgent',
    title: 'Backjob reported — Sunset Villa',
    body: 'Guest reported towels not replaced after the last clean. Please revisit and confirm resolution.',
    propertyId: 'p1',
    propertyName: 'Sunset Villa',
    assignedTo: ['s1'],
    createdAt: '2026-03-18T21:00:00Z',
    read: false,
  },
  {
    id: 'fa4',
    type: 'apartment_dirty',
    severity: 'urgent',
    title: 'Guest reports apartment was dirty on arrival',
    body: 'Downtown Loft — guest Camilla Dahl checked in and reported the apartment was not clean. Supervisor action required.',
    propertyId: 'p4',
    propertyName: 'Downtown Loft',
    assignedTo: ['s2'],
    createdAt: '2026-03-19T10:15:00Z',
    read: false,
  },
  {
    id: 'fa5',
    type: 'needs_consumables',
    severity: 'warning',
    title: 'Low consumables — Garden Cottage',
    body: 'Shampoo and toilet paper stock is critically low. Please restock before the next check-in today.',
    propertyId: 'p5',
    propertyName: 'Garden Cottage',
    assignedTo: ['s1', 's2'],
    createdAt: '2026-03-19T09:00:00Z',
    read: false,
  },
  {
    id: 'fa6',
    type: 'upsell_escalation',
    severity: 'urgent',
    title: 'Upsell approval needed — Late Checkout',
    body: 'Downtown Loft — Late Checkout request from guest. No cleaner assigned. Supervisor approval required to confirm.',
    propertyId: 'p4',
    propertyName: 'Downtown Loft',
    assignedTo: ['s2'],
    createdAt: '2026-03-19T06:45:00Z',
    read: false,
    actionRoute: '/app/my-tasks',
  },
  {
    id: 'fa8',
    type: 'upsell_escalation',
    severity: 'warning',
    title: 'Early Check-in request — Ocean View Suite',
    body: 'Guest Alex Torres is requesting early check-in for Mar 22. Tap to review and approve or decline before the deadline.',
    propertyId: 'p1',
    propertyName: 'Ocean View Suite',
    assignedTo: ['s1'],
    createdAt: '2026-03-19T09:20:00Z',
    read: false,
    actionRoute: '/app/my-tasks',
  },
  {
    id: 'fa9',
    type: 'upsell_escalation',
    severity: 'urgent',
    title: 'Late Checkout request — Harbor Studio',
    body: 'Guest Soren Dahl is requesting a late checkout until 14:00. Your turnover window starts at 12:00 — this creates a tight gap.',
    propertyId: 'p2',
    propertyName: 'Harbor Studio',
    assignedTo: ['s1'],
    createdAt: '2026-03-19T07:10:00Z',
    read: false,
    actionRoute: '/app/my-tasks',
  },
  {
    id: 'fa7',
    type: 'backjob',
    severity: 'urgent',
    title: 'Backjob — Ocean View Apt',
    body: 'Welcome kit was missing when guest arrived. Please arrange delivery or replacement today.',
    propertyId: 'p3',
    propertyName: 'Ocean View Apt',
    assignedTo: ['s1', 's2'],
    createdAt: '2026-03-19T11:00:00Z',
    read: false,
  },
]
