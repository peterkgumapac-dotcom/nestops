export type GsFeedType =
  | 'upsell_approved' | 'upsell_declined'
  | 'cleaning_complete' | 'issue_reported'
  | 'early_checkin_request' | 'late_checkout_request'
  | 'guest_verified' | 'guest_issue'

export interface GsFeedItem {
  id: string
  type: GsFeedType
  actor: string
  action: string
  property: string
  propertyId: string
  detail?: string
  time: string            // ISO string
  actionRoute?: string
  workOrderPrompt?: boolean
  upsellDecisionStatus?: 'approved' | 'declined'
}

export const GS_FEED_SEED: GsFeedItem[] = [
  {
    id: 'gsf1',
    type: 'upsell_approved',
    actor: 'Maria K.',
    action: 'approved Early Check-in for Alex Torres',
    property: 'Ocean View Suite',
    propertyId: 'p3',
    time: '2026-03-21T08:15:00Z',
    upsellDecisionStatus: 'approved',
  },
  {
    id: 'gsf2',
    type: 'upsell_declined',
    actor: 'Anna K.',
    action: 'declined Late Checkout for Soren Dahl',
    property: 'Harbor Studio',
    propertyId: 'p2',
    detail: 'Tight gap, next check-in at 14:00',
    time: '2026-03-21T07:45:00Z',
    upsellDecisionStatus: 'declined',
  },
  {
    id: 'gsf3',
    type: 'cleaning_complete',
    actor: 'Maria K.',
    action: 'completed turnover',
    property: 'Harbor Studio',
    propertyId: 'p2',
    time: '2026-03-21T07:30:00Z',
  },
  {
    id: 'gsf4',
    type: 'issue_reported',
    actor: 'Maria K.',
    action: 'reported issue: "Broken towel rail"',
    property: 'Sunset Villa',
    propertyId: 'p1',
    detail: 'Broken towel rail',
    time: '2026-03-21T11:20:00Z',
    actionRoute: '/operator/contractors',
    workOrderPrompt: true,
  },
  {
    id: 'gsf5',
    type: 'early_checkin_request',
    actor: 'Guest Alex Torres',
    action: 'requested Early Check-in',
    property: 'Ocean View Suite',
    propertyId: 'p3',
    time: '2026-03-21T06:45:00Z',
    actionRoute: '/operator/guest-services/upsells',
  },
  {
    id: 'gsf6',
    type: 'late_checkout_request',
    actor: 'Guest Soren Dahl',
    action: 'requested Late Checkout until 14:00',
    property: 'Harbor Studio',
    propertyId: 'p2',
    time: '2026-03-21T07:10:00Z',
    actionRoute: '/operator/guest-services/upsells',
  },
  {
    id: 'gsf7',
    type: 'guest_verified',
    actor: 'Guest Camilla Dahl',
    action: 'completed verification',
    property: 'Downtown Loft',
    propertyId: 'p4',
    time: '2026-03-21T05:30:00Z',
  },
  {
    id: 'gsf8',
    type: 'guest_issue',
    actor: 'Guest',
    action: 'reported apartment was dirty on arrival',
    property: 'Downtown Loft',
    propertyId: 'p4',
    time: '2026-03-21T10:15:00Z',
    actionRoute: '/operator/guest-services/issues',
  },
  {
    id: 'gsf9',
    type: 'cleaning_complete',
    actor: 'Maria K.',
    action: 'completed deep clean',
    property: 'Ocean View Apt',
    propertyId: 'p3',
    time: '2026-03-21T15:20:00Z',
  },
  {
    id: 'gsf10',
    type: 'upsell_declined',
    actor: 'Maria K.',
    action: 'declined Early Check-in for Lena Berg',
    property: 'Sunset Villa',
    propertyId: 'p1',
    detail: 'Prior guest still checking out',
    time: '2026-03-21T09:00:00Z',
    upsellDecisionStatus: 'declined',
  },
]
