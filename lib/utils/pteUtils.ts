import type { PTEStatus } from '@/lib/data/staffScheduling'
import type { Job, JobPTEStatus } from '@/lib/data/staff'
import { RESERVATIONS } from '@/lib/data/reservations'

export function isPropertyOccupied(propertyId: string, date: string): boolean {
  const d = new Date(date)
  return RESERVATIONS.some(r =>
    r.propertyId === propertyId &&
    r.pmsStatus !== 'cancelled' &&
    r.pmsStatus !== 'checked_out' &&
    d >= new Date(r.checkInDate) &&
    d < new Date(r.checkOutDate)
  )
}

export function getPTEDisplay(status: JobPTEStatus): { label: string; color: string; bg: string; icon: string } {
  const map: Record<JobPTEStatus, { label: string; color: string; bg: string; icon: string }> = {
    not_required: { label: 'No Guest',    color: '#6b7280', bg: '#6b728015', icon: '○' },
    auto_granted: { label: 'PTE Granted', color: '#16a34a', bg: '#16a34a15', icon: '✓' },
    granted:      { label: 'PTE Granted', color: '#16a34a', bg: '#16a34a15', icon: '✓' },
    pending:      { label: 'PTE Pending', color: '#d97706', bg: '#d9770615', icon: '⏳' },
    denied:       { label: 'PTE Denied',  color: '#dc2626', bg: '#dc262615', icon: '✗' },
    expired:      { label: 'PTE Expired', color: '#6b7280', bg: '#6b728015', icon: '⏱' },
  }
  return map[status] ?? map.not_required
}

export function canStartTask(job: Pick<Job, 'pteRequired' | 'pteStatus'>): boolean {
  if (!job.pteRequired) return true
  return job.pteStatus === 'granted' || job.pteStatus === 'auto_granted' || job.pteStatus === 'not_required'
}

export function isAccessCodeVisible(status?: JobPTEStatus): boolean {
  return status === 'granted' || status === 'auto_granted' || status === 'not_required'
}

export function checkAndGrantPTE(task: { pteRequired: boolean; propertyId?: string }): PTEStatus {
  if (!task.pteRequired) return 'not_required'
  if (!task.propertyId) return 'pending'
  const occupied = isPropertyOccupied(task.propertyId, new Date().toISOString())
  if (!occupied) return 'auto_granted'
  return 'pending'
}

export function sortJobsByAccessibility(jobs: Job[]): Job[] {
  const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
  return [...jobs].sort((a, b) => {
    const aPTE = a.pteStatus ?? 'not_required'
    const bPTE = b.pteStatus ?? 'not_required'
    if (aPTE === 'auto_granted' && bPTE !== 'auto_granted') return -1
    if (bPTE === 'auto_granted' && aPTE !== 'auto_granted') return 1
    if (aPTE === 'not_required' && bPTE === 'pending') return -1
    if (bPTE === 'not_required' && aPTE === 'pending') return 1
    return (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99)
  })
}

export function getPTEBadge(status: PTEStatus): { label: string; color: string; icon: string } {
  switch (status) {
    case 'auto_granted': return { label: 'PTE Granted', color: '#16a34a', icon: '✓' }
    case 'granted': return { label: 'PTE Granted', color: '#16a34a', icon: '✓' }
    case 'pending': return { label: 'PTE Pending', color: '#d97706', icon: '⏳' }
    case 'denied': return { label: 'PTE Denied', color: '#dc2626', icon: '✗' }
    case 'expired': return { label: 'PTE Expired', color: '#6b7280', icon: '⏱' }
    case 'not_required': return { label: 'No Guest', color: '#6b7280', icon: '○' }
    default: return { label: 'Unknown', color: '#6b7280', icon: '?' }
  }
}
