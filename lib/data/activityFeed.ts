export type FeedItemType =
  | 'in_progress' | 'blocked' | 'en_route'
  | 'completed' | 'guest_issue' | 'field_report'
  | 'approved' | 'clocked_in'

export interface FeedItem {
  id: string
  type: FeedItemType
  actor: string
  action: string
  property: string
  detail?: string
  time: string
  progress?: number
  eta?: string
  statusLabel?: string
  color: string
}

export const FEED_ITEMS: FeedItem[] = [
  { id: 'f1', type: 'in_progress', actor: 'Maria S.',    action: 'cleaning',               property: 'Sunset Villa',   detail: 'bedroom 2/4',            time: 'Started 12:45 PM', progress: 50, statusLabel: 'In progress · 50% done · Est. 2:30 PM', color: '#10b981' },
  { id: 'f2', type: 'blocked',     actor: 'Johan L.',    action: 'blocked',                property: 'Harbor Studio',  detail: 'linen delivery missing',  time: 'Flagged 1:02 PM',  statusLabel: 'Blocked · Action needed',                  color: '#ef4444' },
  { id: 'f3', type: 'en_route',    actor: 'Bjorn L.',    action: 'en route',               property: 'Ocean View Apt', detail: 'emergency plumbing',      time: 'Dispatched 12:58 PM', eta: '1:15 PM', statusLabel: 'En route · ETA 1:15 PM',   color: '#3b82f6' },
  { id: 'f4', type: 'completed',   actor: 'Anna K.',     action: 'marked task complete',   property: 'Sunset Villa',   detail: 'Cleaning',                time: '2 min ago',        color: '#10b981' },
  { id: 'f5', type: 'guest_issue', actor: 'Fatima N.',   action: 'logged guest issue',     property: 'Harbor Studio',  detail: 'Noise complaint',         time: '14 min ago',       color: '#ef4444' },
  { id: 'f6', type: 'field_report',actor: 'Ivan P.',     action: 'submitted field report', property: 'Ocean View Apt', detail: 'Broken window latch',     time: '31 min ago',       color: '#d97706' },
  { id: 'f7', type: 'approved',    actor: 'Operator',    action: 'approved refund',        property: 'Downtown Loft',  detail: '750 NOK',                 time: '1h ago',           color: '#6366f1' },
  { id: 'f8', type: 'clocked_in',  actor: 'Anna K.',     action: 'clocked in',             property: 'Staff portal',   time: '2h ago',                   color: '#a78bfa' },
]

export type FeedTab = 'all' | 'in_progress' | 'completed' | 'issues'

export function filterFeed(items: FeedItem[], tab: FeedTab): FeedItem[] {
  if (tab === 'all') return items
  if (tab === 'in_progress') return items.filter(i => i.type === 'in_progress' || i.type === 'en_route')
  if (tab === 'completed') return items.filter(i => i.type === 'completed')
  if (tab === 'issues') return items.filter(i => i.type === 'blocked' || i.type === 'guest_issue' || i.type === 'field_report')
  return items
}
