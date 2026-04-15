export interface CleaningJob {
  id: string
  type: 'Turnover' | 'Deep Clean' | 'Same-day' | 'Inspection'
  property: string
  timeWindow: string
  status: 'pending' | 'in-progress' | 'done'
  assignedTo: string
  checkoutTime: string
  checkinTime: string
}

export const CLEANING_STATUS_COLOR: Record<CleaningJob['status'], string> = {
  pending:       'var(--text-muted)',
  'in-progress': 'var(--status-green-fg)',
  done:          'var(--text-subtle)',
}

export const CLEANING_STATUS_BG: Record<CleaningJob['status'], string> = {
  pending:       'var(--status-muted-bg)',
  'in-progress': 'var(--status-green-bg)',
  done:          'var(--status-muted-bg)',
}

export const CLEANING_TYPE_COLOR: Record<CleaningJob['type'], string> = {
  Turnover:     'var(--accent)',
  'Deep Clean': 'var(--accent)',
  'Same-day':   'var(--status-amber-fg)',
  Inspection:   'var(--accent)',
}

export function hasTightGap(checkoutTime: string, windowStart: string): boolean {
  const [ch, cm] = checkoutTime.split(':').map(Number)
  const [wh, wm] = windowStart.split(':').map(Number)
  const gapMins = (wh * 60 + wm) - (ch * 60 + cm)
  return gapMins < 90
}
