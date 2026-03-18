import type { PTEStatus } from '@/lib/data/staffScheduling'

export function isPropertyOccupied(propertyId: string, date: string): boolean {
  // Stub — would check booking data in production
  void propertyId
  void date
  return false
}

export function checkAndGrantPTE(task: { pteRequired: boolean; propertyId?: string }): PTEStatus {
  if (!task.pteRequired) return 'not_required'
  if (!task.propertyId) return 'pending'
  const occupied = isPropertyOccupied(task.propertyId, new Date().toISOString())
  if (!occupied) return 'auto_granted'
  return 'pending'
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
