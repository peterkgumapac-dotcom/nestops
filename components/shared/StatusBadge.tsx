import { cn } from '@/lib/utils'

type StatusVariant = 'open' | 'pending' | 'resolved' | 'expired' | 'missing' | 'live' | 'onboarding' | 'offboarding' | 'active' | 'inactive' | 'valid' | 'expiring' | 'draft' | 'published' | 'needs_update' | 'ok' | 'low' | 'critical' | 'out' | 'urgent' | 'high' | 'medium' | 'ordered' | 'received' | 'cancelled' | 'in_progress' | 'done' | 'scheduled' | 'none'

// NOTE: These colors are intentionally defined as CSS variables so they respond to
// light/dark mode. The semantic groupings are:
//   --status-purple-*  → open, onboarding, ordered, in_progress
//   --status-amber-*   → pending, expiring, needs_update, low, medium, offboarding
//   --status-green-*   → resolved, live, valid, published, ok, received, done, active
//   --status-red-*     → expired, missing, critical, out, urgent, high
//   --status-blue-*    → scheduled
//   --status-muted-*   → inactive, draft, cancelled, none
//
// The variables are defined in globals.css. If a project-wide design token update is
// needed, update them there rather than here.
const VARIANT_STYLES: Record<StatusVariant, { bgVar: string; colorVar: string; label: string; pulse?: boolean }> = {
  open:         { bgVar: 'var(--status-purple-bg)',  colorVar: 'var(--status-purple-fg)',  label: 'Open' },
  pending:      { bgVar: 'var(--status-amber-bg)',   colorVar: 'var(--status-amber-fg)',   label: 'Pending' },
  resolved:     { bgVar: 'var(--status-green-bg)',   colorVar: 'var(--status-green-fg)',   label: 'Resolved' },
  expired:      { bgVar: 'var(--status-red-bg)',     colorVar: 'var(--status-red-fg)',     label: 'Expired',     pulse: true },
  missing:      { bgVar: 'var(--status-red-bg)',     colorVar: 'var(--status-red-fg)',     label: 'Missing',     pulse: true },
  live:         { bgVar: 'var(--status-green-bg)',   colorVar: 'var(--status-green-fg)',   label: 'Live' },
  onboarding:   { bgVar: 'var(--status-purple-bg)',  colorVar: 'var(--status-purple-fg)',  label: 'Onboarding' },
  inactive:     { bgVar: 'var(--status-muted-bg)',   colorVar: 'var(--status-muted-fg)',   label: 'Inactive' },
  valid:        { bgVar: 'var(--status-green-bg)',   colorVar: 'var(--status-green-fg)',   label: 'Valid' },
  expiring:     { bgVar: 'var(--status-amber-bg)',   colorVar: 'var(--status-amber-fg)',   label: 'Expiring',    pulse: true },
  draft:        { bgVar: 'var(--status-muted-bg)',   colorVar: 'var(--status-muted-fg)',   label: 'Draft' },
  published:    { bgVar: 'var(--status-green-bg)',   colorVar: 'var(--status-green-fg)',   label: 'Published' },
  needs_update: { bgVar: 'var(--status-amber-bg)',   colorVar: 'var(--status-amber-fg)',   label: 'Needs Update' },
  ok:           { bgVar: 'var(--status-green-bg)',   colorVar: 'var(--status-green-fg)',   label: 'OK' },
  low:          { bgVar: 'var(--status-amber-bg)',   colorVar: 'var(--status-amber-fg)',   label: 'Low',         pulse: true },
  critical:     { bgVar: 'var(--status-red-bg)',     colorVar: 'var(--status-red-fg)',     label: 'Critical',    pulse: true },
  out:          { bgVar: 'var(--status-red-bg)',     colorVar: 'var(--status-red-fg)',     label: 'Out of Stock', pulse: true },
  urgent:       { bgVar: 'var(--status-red-bg)',     colorVar: 'var(--status-red-fg)',     label: 'Urgent',      pulse: true },
  high:         { bgVar: 'var(--status-red-bg)',     colorVar: 'var(--status-red-fg)',     label: 'High' },
  medium:       { bgVar: 'var(--status-amber-bg)',   colorVar: 'var(--status-amber-fg)',   label: 'Medium' },
  ordered:      { bgVar: 'var(--status-purple-bg)',  colorVar: 'var(--status-purple-fg)',  label: 'Ordered' },
  received:     { bgVar: 'var(--status-green-bg)',   colorVar: 'var(--status-green-fg)',   label: 'Received' },
  cancelled:    { bgVar: 'var(--status-muted-bg)',   colorVar: 'var(--status-muted-fg)',   label: 'Cancelled' },
  in_progress:  { bgVar: 'var(--status-purple-bg)',  colorVar: 'var(--status-purple-fg)',  label: 'In Progress' },
  done:         { bgVar: 'var(--status-green-bg)',   colorVar: 'var(--status-green-fg)',   label: 'Done' },
  scheduled:    { bgVar: 'var(--status-blue-bg)',    colorVar: 'var(--status-blue-fg)',    label: 'Scheduled' },
  active:       { bgVar: 'var(--status-green-bg)',   colorVar: 'var(--status-green-fg)',   label: 'Active' },
  offboarding:  { bgVar: 'var(--status-amber-bg)',   colorVar: 'var(--status-amber-fg)',   label: 'Offboarding' },
  none:         { bgVar: 'var(--status-muted-bg)',   colorVar: 'var(--status-muted-fg)',   label: '—' },
}

interface StatusBadgeProps {
  status: StatusVariant
  className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = VARIANT_STYLES[status] ?? { bgVar: 'var(--status-muted-bg)', colorVar: 'var(--status-muted-fg)', label: status }
  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', style.pulse ? 'pulse-urgent' : '', className)}
      style={{ background: style.bgVar, color: style.colorVar }}
    >
      {style.label}
    </span>
  )
}
