export type UpsellApprovalStatus =
  'pending_cleaner' | 'pending_supervisor' | 'approved' | 'declined' | 'auth_held' | 'charged' | 'expired'

export interface UpsellApprovalRequest {
  id: string
  upsellRuleId: string
  guestVerificationId: string
  guestName: string
  propertyId: string
  propertyName: string
  checkInDate: string
  checkOutDate: string
  upsellTitle: string
  price: number
  currency: string
  calendarSignal: 'available' | 'tentative' | 'blocked'
  paymentMode: 'auto_charge' | 'auth_hold'
  status: UpsellApprovalStatus
  requestedAt: string
  assignedCleanerId?: string        // set when a cleaner is known
  escalatedToSupervisor?: boolean   // true when no cleaner assigned → routed to supervisor
  supervisorId?: string             // id of the supervisor who received the escalation
  cleanerRespondedAt?: string
  cleanerNotes?: string
}

export const UPSELL_APPROVAL_REQUESTS: UpsellApprovalRequest[] = [
  {
    id: 'uar1',
    upsellRuleId: 'ur1',
    guestVerificationId: 'gv1',
    guestName: 'Alex Torres',
    propertyId: 'p1',
    propertyName: 'Ocean View Suite',
    checkInDate: '2026-03-22',
    checkOutDate: '2026-03-27',
    upsellTitle: 'Early Check-in',
    price: 45,
    currency: 'USD',
    calendarSignal: 'tentative',
    paymentMode: 'auth_hold',
    status: 'pending_cleaner',
    requestedAt: '2026-03-19T09:15:00Z',
    assignedCleanerId: 's1',
  },
  {
    id: 'uar2',
    upsellRuleId: 'ur3',
    guestVerificationId: 'gv2',
    guestName: 'Yuki Tanaka',
    propertyId: 'p2',
    propertyName: 'Downtown Loft',
    checkInDate: '2026-03-20',
    checkOutDate: '2026-03-24',
    upsellTitle: 'Airport Transfer',
    price: 65,
    currency: 'USD',
    calendarSignal: 'available',
    paymentMode: 'auto_charge',
    status: 'charged',
    requestedAt: '2026-03-18T14:30:00Z',
  },
  {
    id: 'uar3',
    upsellRuleId: 'ur2',
    guestVerificationId: 'gv3',
    guestName: 'Marcus Chen',
    propertyId: 'p3',
    propertyName: 'Garden Cottage',
    checkInDate: '2026-03-25',
    checkOutDate: '2026-03-30',
    upsellTitle: 'Late Checkout',
    price: 35,
    currency: 'USD',
    calendarSignal: 'available',
    paymentMode: 'auth_hold',
    status: 'auth_held',
    requestedAt: '2026-03-19T11:00:00Z',
    assignedCleanerId: 's2',
  },
  {
    id: 'uar4',
    upsellRuleId: 'ur1',
    guestVerificationId: 'gv4',
    guestName: 'Sofia Martinez',
    propertyId: 'p1',
    propertyName: 'Ocean View Suite',
    checkInDate: '2026-03-21',
    checkOutDate: '2026-03-25',
    upsellTitle: 'Early Check-in',
    price: 45,
    currency: 'USD',
    calendarSignal: 'blocked',
    paymentMode: 'auth_hold',
    status: 'declined',
    requestedAt: '2026-03-17T16:45:00Z',
    assignedCleanerId: 's1',
    cleanerRespondedAt: '2026-03-17T18:00:00Z',
    cleanerNotes: 'Prior checkout same morning, cannot accommodate early check-in.',
  },
  {
    // No cleaner assigned for this property → auto-escalated to field supervisor
    id: 'uar5',
    upsellRuleId: 'ur2',
    guestVerificationId: 'gv5',
    guestName: 'Lena Hoffmann',
    propertyId: 'p4',
    propertyName: 'Downtown Loft',
    checkInDate: '2026-03-24',
    checkOutDate: '2026-03-28',
    upsellTitle: 'Late Checkout',
    price: 35,
    currency: 'USD',
    calendarSignal: 'tentative',
    paymentMode: 'auth_hold',
    status: 'pending_supervisor',
    requestedAt: '2026-03-19T13:20:00Z',
    escalatedToSupervisor: true,
    supervisorId: 's2',   // Anna Kowalski — Inspector / field supervisor
  },
]
