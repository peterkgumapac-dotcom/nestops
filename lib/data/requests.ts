export type RequestType = 'maintenance' | 'purchase' | 'inquiry'
export type RequestStatus = 'open' | 'pending' | 'resolved'
export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent'
export type RequestSource = 'guest' | 'staff' | 'owner' | 'system'

export interface RequestComment {
  id: string
  author: string
  role: 'operator' | 'owner' | 'staff'
  message: string
  timestamp: string
}

export interface Request {
  id: string
  title: string
  type: RequestType
  status: RequestStatus
  priority: RequestPriority
  propertyId: string
  ownerId: string
  date: string
  description: string
  amount?: number
  currency?: string
  comments: RequestComment[]
  assignedTo?: string
  requiresOwnerApproval?: boolean
  source: RequestSource
  reporterName?: string
}

export const REQUESTS: Request[] = [
  {
    id: 'r1',
    title: 'Dishwasher not draining',
    type: 'maintenance',
    status: 'open',
    priority: 'high',
    propertyId: 'p1',
    ownerId: 'o1',
    date: '2026-04-11',
    description: 'Guests reported the dishwasher is not draining properly. Standing water remains after cycle completes.',
    source: 'staff',
    comments: [
      { id: 'c1', author: 'Sarah Johnson', role: 'owner', message: 'Guest called about this this morning. Needs urgent fix before next checkin Saturday.', timestamp: '2026-04-11T09:00:00Z' },
      { id: 'c2', author: 'Operations Team', role: 'operator', message: 'Dispatching plumber. Will confirm appointment shortly.', timestamp: '2026-04-11T10:30:00Z' },
    ],
  },
  {
    id: 'r2',
    title: 'Replace guest towel set',
    type: 'purchase',
    status: 'pending',
    priority: 'low',
    propertyId: 'p2',
    ownerId: 'o1',
    date: '2026-04-09',
    description: 'Current towel set is worn. Request to purchase 2 new sets (bath + hand + face cloths) for Harbor Studio.',
    amount: 890,
    currency: 'NOK',
    source: 'staff',
    comments: [
      { id: 'c3', author: 'Operations Team', role: 'operator', message: 'Reviewing purchase request. Will approve once we confirm budget.', timestamp: '2026-04-09T14:00:00Z' },
    ],
  },
  {
    id: 'r3',
    title: 'WiFi router upgrade inquiry',
    type: 'inquiry',
    status: 'resolved',
    priority: 'medium',
    propertyId: 'p3',
    ownerId: 'o2',
    date: '2026-04-05',
    description: 'Owner asked about upgrading the WiFi router to improve connection speed for remote workers.',
    source: 'staff',
    comments: [
      { id: 'c4', author: 'Michael Chen', role: 'owner', message: 'We have had 3 complaints about slow WiFi this month.', timestamp: '2026-04-05T11:00:00Z' },
      { id: 'c5', author: 'Operations Team', role: 'operator', message: 'We recommend upgrading to mesh system. Cost approx 2,400 NOK. Shall we proceed?', timestamp: '2026-04-06T09:00:00Z' },
      { id: 'c6', author: 'Michael Chen', role: 'owner', message: 'Yes please proceed.', timestamp: '2026-04-06T12:00:00Z' },
      { id: 'c7', author: 'Operations Team', role: 'operator', message: 'Upgrade completed. New mesh system installed and tested.', timestamp: '2026-04-08T16:00:00Z' },
    ],
  },
  {
    id: 'r4',
    title: 'Heating system making noise',
    type: 'maintenance',
    status: 'open',
    priority: 'urgent',
    propertyId: 'p4',
    ownerId: 'o3',
    date: '2026-04-12',
    description: 'Current guests report loud banging noise from heating radiators at night. Temperature also inconsistent.',
    source: 'staff',
    comments: [],
  },
  {
    id: 'r5',
    title: 'Purchase coffee machine',
    type: 'purchase',
    status: 'open',
    priority: 'low',
    propertyId: 'p1',
    ownerId: 'o1',
    date: '2026-04-10',
    description: 'Current coffee machine is broken. Request to replace with Nespresso Vertuo Next.',
    amount: 1290,
    currency: 'NOK',
    source: 'staff',
    comments: [],
  },
  {
    id: 'r6',
    title: 'AC not cooling — guest complaint',
    type: 'maintenance',
    status: 'open',
    priority: 'urgent',
    propertyId: 'p1',
    ownerId: 'o1',
    date: '2026-04-14',
    description: 'Guest Camilla Dahl reports AC not cooling in bedroom. Check-out in 2 days.',
    source: 'guest',
    reporterName: 'Camilla Dahl',
    comments: [],
  },
  {
    id: 'r7',
    title: 'Cleanliness complaint on arrival',
    type: 'inquiry',
    status: 'open',
    priority: 'high',
    propertyId: 'p3',
    ownerId: 'o2',
    date: '2026-04-13',
    description: 'Guest reported property was not clean on arrival. Requesting partial refund.',
    source: 'guest',
    reporterName: 'Lars Eriksen',
    comments: [],
  },
  {
    id: 'r8',
    title: 'Heating inspection — owner request',
    type: 'maintenance',
    status: 'pending',
    priority: 'medium',
    propertyId: 'p2',
    ownerId: 'o1',
    date: '2026-04-12',
    description: 'Owner Sarah Johnson has requested a full heating system inspection.',
    source: 'owner',
    reporterName: 'Sarah Johnson',
    comments: [],
  },
  {
    id: 'r9',
    title: 'Hot water runs cold after 5 minutes',
    type: 'maintenance',
    status: 'open',
    priority: 'high',
    propertyId: 'p4',
    ownerId: 'o3',
    date: '2026-04-13',
    description: 'Guest reports hot water cuts out after about 5 minutes in the shower. Boiler may need servicing.',
    source: 'guest' as const,
    reporterName: 'Henrik Solberg',
    comments: [],
  },
]
