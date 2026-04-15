export type Severity = 'green' | 'amber' | 'red'

export interface PulseFeedItem {
  id: string
  actor: string
  initials: string
  avatarColor: string
  action: string
  property: string
  time: string
  severity: Severity
  badgeText?: string
  badgeVariant?: 'green' | 'red' | 'amber' | 'blue'
  progress?: number
}

export interface RoleNodeData {
  id: string
  role: string
  name: string
  initials: string
  color: string        // avatar bg
  actionLabel: string  // button text
  confirmText: string  // shown after action
}

export interface SourceNodeData {
  actor: string
  initials: string
  avatarColor: string
  description: string
  meta: string
  badgeText: string
  badgeVariant: 'green' | 'amber' | 'red'
}

export interface PulseScene {
  severity: Severity
  statusLabel: string
  statusBadge: string
  source: SourceNodeData
  feed: PulseFeedItem[]
  roles: RoleNodeData[]
}

export const PULSE_SCENES: Record<Severity, PulseScene> = {
  green: {
    severity: 'green',
    statusLabel: 'All systems operational',
    statusBadge: 'ALL CLEAR',
    source: {
      actor: 'Anna K.',
      initials: 'AK',
      avatarColor: '#10b981',
      description: 'Completed cleaning — Sunset Villa',
      meta: '2 min ago · auto-verified',
      badgeText: 'COMPLETED',
      badgeVariant: 'green',
    },
    feed: [
      { id: 'g1', actor: 'Anna K.', initials: 'AK', avatarColor: '#10b981', action: 'Marked cleaning complete', property: 'Sunset Villa', time: '2 min ago', severity: 'green', badgeText: 'DONE', badgeVariant: 'green' },
      { id: 'g2', actor: 'Bjorn L.', initials: 'BL', avatarColor: '#3b82f6', action: 'Assigned to linen delivery', property: 'Harbor Studio', time: '8 min ago', severity: 'green', badgeText: 'ASSIGNED', badgeVariant: 'blue' },
      { id: 'g3', actor: 'System', initials: 'SY', avatarColor: '#6366f1', action: 'Auto-verified check-in ready', property: 'Ocean View Apt', time: '12 min ago', severity: 'green', badgeText: 'VERIFIED', badgeVariant: 'green' },
      { id: 'g4', actor: 'Maria S.', initials: 'MS', avatarColor: '#ec4899', action: 'Clocked in for shift', property: 'Staff portal', time: '25 min ago', severity: 'green' },
      { id: 'g5', actor: 'Operator', initials: 'OP', avatarColor: '#14b8a6', action: 'Approved refund 750 NOK', property: 'Downtown Loft', time: '1h ago', severity: 'green' },
    ],
    roles: [
      { id: 'r-gs', role: 'GS Supervisor', name: 'Erik M.', initials: 'EM', color: '#3b82f6', actionLabel: 'Acknowledge', confirmText: 'Acknowledged' },
      { id: 'r-maint', role: 'Maintenance', name: 'Bjorn L.', initials: 'BL', color: '#f59e0b', actionLabel: 'Log Check', confirmText: 'Check logged' },
      { id: 'r-clean', role: 'Cleaning', name: 'Anna K.', initials: 'AK', color: '#ef4444', actionLabel: 'Confirm QC', confirmText: 'QC confirmed' },
      { id: 'r-ops', role: 'Operator', name: 'You', initials: 'OP', color: '#6b7280', actionLabel: 'Archive', confirmText: 'Archived' },
    ],
  },
  amber: {
    severity: 'amber',
    statusLabel: 'Pending resolution',
    statusBadge: 'WARNING',
    source: {
      actor: 'Johan L.',
      initials: 'JL',
      avatarColor: '#f59e0b',
      description: 'Linen delivery missing — Harbor Studio',
      meta: '6 min ago · PTE conflict',
      badgeText: 'BLOCKED',
      badgeVariant: 'amber',
    },
    feed: [
      { id: 'a1', actor: 'Johan L.', initials: 'JL', avatarColor: '#f59e0b', action: 'Reported linen shortage', property: 'Harbor Studio', time: '6 min ago', severity: 'amber', badgeText: 'BLOCKED', badgeVariant: 'amber' },
      { id: 'a2', actor: 'System', initials: 'SY', avatarColor: '#6366f1', action: 'PTE conflict detected', property: 'Harbor Studio', time: '6 min ago', severity: 'amber', badgeText: 'CONFLICT', badgeVariant: 'red' },
      { id: 'a3', actor: 'Maria S.', initials: 'MS', avatarColor: '#ec4899', action: 'Cleaning paused — waiting on linen', property: 'Harbor Studio', time: '8 min ago', severity: 'amber', badgeText: 'PAUSED', badgeVariant: 'amber' },
      { id: 'a4', actor: 'Anna K.', initials: 'AK', avatarColor: '#10b981', action: 'Marked cleaning complete', property: 'Sunset Villa', time: '15 min ago', severity: 'green', badgeText: 'DONE', badgeVariant: 'green' },
    ],
    roles: [
      { id: 'r-gs', role: 'GS Supervisor', name: 'Erik M.', initials: 'EM', color: '#3b82f6', actionLabel: 'Review PTE', confirmText: 'PTE reviewed' },
      { id: 'r-maint', role: 'Maintenance', name: 'Bjorn L.', initials: 'BL', color: '#f59e0b', actionLabel: 'Source Linen', confirmText: 'Linen sourced' },
      { id: 'r-clean', role: 'Cleaning', name: 'Maria S.', initials: 'MS', color: '#ef4444', actionLabel: 'Reassign', confirmText: 'Reassigned' },
      { id: 'r-ops', role: 'Operator', name: 'You', initials: 'OP', color: '#6b7280', actionLabel: 'Escalate', confirmText: 'Escalated' },
    ],
  },
  red: {
    severity: 'red',
    statusLabel: 'Immediate attention required',
    statusBadge: 'CRITICAL',
    source: {
      actor: 'Fatima N.',
      initials: 'FN',
      avatarColor: '#ef4444',
      description: 'Noise complaint escalated — Harbor Studio',
      meta: '1 min ago · guest escalation',
      badgeText: 'ESCALATION',
      badgeVariant: 'red',
    },
    feed: [
      { id: 'r1', actor: 'Fatima N.', initials: 'FN', avatarColor: '#ef4444', action: 'Guest escalated noise complaint', property: 'Harbor Studio', time: 'Just now', severity: 'red', badgeText: 'ESCALATION', badgeVariant: 'red' },
      { id: 'r2', actor: 'System', initials: 'SY', avatarColor: '#6366f1', action: 'Auto-created work order #WO-482', property: 'Harbor Studio', time: '1 min ago', severity: 'red', badgeText: 'WORK ORDER', badgeVariant: 'red' },
      { id: 'r3', actor: 'Bjorn L.', initials: 'BL', avatarColor: '#3b82f6', action: 'Dispatched for emergency response', property: 'Harbor Studio', time: '2 min ago', severity: 'amber', badgeText: 'EN ROUTE', badgeVariant: 'blue' },
      { id: 'r4', actor: 'Erik M.', initials: 'EM', avatarColor: '#3b82f6', action: 'Reviewing guest history', property: 'Harbor Studio', time: '3 min ago', severity: 'amber', badgeText: 'REVIEWING', badgeVariant: 'amber' },
      { id: 'r5', actor: 'Johan L.', initials: 'JL', avatarColor: '#f59e0b', action: 'Reported linen shortage', property: 'Harbor Studio', time: '14 min ago', severity: 'amber', badgeText: 'BLOCKED', badgeVariant: 'amber' },
    ],
    roles: [
      { id: 'r-gs', role: 'GS Supervisor', name: 'Erik M.', initials: 'EM', color: '#3b82f6', actionLabel: 'Contact Guest', confirmText: 'Guest contacted' },
      { id: 'r-maint', role: 'Maintenance', name: 'Bjorn L.', initials: 'BL', color: '#f59e0b', actionLabel: 'Create Work Order', confirmText: 'WO created' },
      { id: 'r-clean', role: 'Cleaning', name: 'Maria S.', initials: 'MS', color: '#ef4444', actionLabel: 'Priority Clean', confirmText: 'Dispatched' },
      { id: 'r-ops', role: 'Operator', name: 'You', initials: 'OP', color: '#6b7280', actionLabel: 'Override & Resolve', confirmText: 'Resolved' },
    ],
  },
}

export const SEVERITY_CONFIG = {
  green: { label: 'Green', color: '#10b981', bgColor: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.25)' },
  amber: { label: 'Amber', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.25)' },
  red:   { label: 'Red',   color: '#ef4444', bgColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)' },
} as const
