import { cn } from '@/lib/utils'

type StatusVariant = 'open' | 'pending' | 'resolved' | 'expired' | 'missing' | 'live' | 'onboarding' | 'offboarding' | 'active' | 'inactive' | 'valid' | 'expiring' | 'draft' | 'published' | 'needs_update' | 'ok' | 'low' | 'critical' | 'out' | 'urgent' | 'high' | 'medium' | 'ordered' | 'received' | 'cancelled' | 'in_progress' | 'done' | 'scheduled' | 'none'

const VARIANT_STYLES: Record<StatusVariant, { bg: string; color: string; label: string; pulse?: boolean }> = {
  open:         { bg: 'rgba(124,58,237,0.15)',  color: '#a78bfa', label: 'Open' },
  pending:      { bg: 'rgba(217,119,6,0.15)',   color: '#fbbf24', label: 'Pending' },
  resolved:     { bg: 'rgba(5,150,105,0.15)',   color: '#34d399', label: 'Resolved' },
  expired:      { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', label: 'Expired', pulse: true },
  missing:      { bg: 'rgba(239,68,68,0.12)',   color: '#f87171', label: 'Missing', pulse: true },
  live:         { bg: 'rgba(5,150,105,0.15)',   color: '#34d399', label: 'Live' },
  onboarding:   { bg: 'rgba(124,58,237,0.15)',  color: '#a78bfa', label: 'Onboarding' },
  inactive:     { bg: 'rgba(100,100,120,0.15)', color: '#7878a0', label: 'Inactive' },
  valid:        { bg: 'rgba(5,150,105,0.15)',   color: '#34d399', label: 'Valid' },
  expiring:     { bg: 'rgba(217,119,6,0.15)',   color: '#fbbf24', label: 'Expiring', pulse: true },
  draft:        { bg: 'rgba(100,100,120,0.15)', color: '#7878a0', label: 'Draft' },
  published:    { bg: 'rgba(5,150,105,0.15)',   color: '#34d399', label: 'Published' },
  needs_update: { bg: 'rgba(217,119,6,0.15)',   color: '#fbbf24', label: 'Needs Update' },
  ok:           { bg: 'rgba(5,150,105,0.15)',   color: '#34d399', label: 'OK' },
  low:          { bg: 'rgba(217,119,6,0.15)',   color: '#fbbf24', label: 'Low', pulse: true },
  critical:     { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', label: 'Critical', pulse: true },
  out:          { bg: 'rgba(239,68,68,0.2)',    color: '#f87171', label: 'Out of Stock', pulse: true },
  urgent:       { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', label: 'Urgent', pulse: true },
  high:         { bg: 'rgba(239,68,68,0.12)',   color: '#f87171', label: 'High' },
  medium:       { bg: 'rgba(217,119,6,0.12)',   color: '#fbbf24', label: 'Medium' },
  ordered:      { bg: 'rgba(124,58,237,0.15)',  color: '#a78bfa', label: 'Ordered' },
  received:     { bg: 'rgba(5,150,105,0.15)',   color: '#34d399', label: 'Received' },
  cancelled:    { bg: 'rgba(100,100,120,0.15)', color: '#7878a0', label: 'Cancelled' },
  in_progress:  { bg: 'rgba(124,58,237,0.15)',  color: '#a78bfa', label: 'In Progress' },
  done:         { bg: 'rgba(5,150,105,0.15)',   color: '#34d399', label: 'Done' },
  scheduled:    { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa', label: 'Scheduled' },
  active:       { bg: 'rgba(5,150,105,0.15)',   color: '#34d399', label: 'Active' },
  offboarding:  { bg: 'rgba(217,119,6,0.15)',   color: '#fbbf24', label: 'Offboarding' },
  none:         { bg: 'rgba(100,100,120,0.1)',  color: '#7878a0', label: '—' },
}

interface StatusBadgeProps {
  status: StatusVariant
  className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = VARIANT_STYLES[status] ?? { bg: 'rgba(100,100,120,0.15)', color: '#7878a0', label: status }
  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', style.pulse ? 'pulse-urgent' : '', className)}
      style={{ background: style.bg, color: style.color }}
    >
      {style.label}
    </span>
  )
}
