const STORAGE_KEY = 'afterstay_guest_issues'

export interface GuestIssue {
  id: string
  trackingId: string
  type: 'maintenance' | 'inquiry' | 'emergency'
  guestName: string
  propertyId: string
  propertyName: string
  category: string
  location?: string
  urgency: 'normal' | 'urgent'
  description: string
  photos: string[]
  status: 'open' | 'investigating' | 'in_progress' | 'resolved'
  operatorResponse?: string
  createdAt: string
}

function load(): GuestIssue[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function save(issues: GuestIssue[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(issues))
}

function nextTrackingId(issues: GuestIssue[]): string {
  const nums = issues.map(i => parseInt(i.trackingId.replace('GS-', ''), 10)).filter(n => !isNaN(n))
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
  return 'GS-' + String(next).padStart(4, '0')
}

export const issueStore = {
  getIssues(propertyId?: string): GuestIssue[] {
    const all = load()
    return propertyId ? all.filter(i => i.propertyId === propertyId) : all
  },

  addIssue(data: Omit<GuestIssue, 'id' | 'trackingId' | 'createdAt' | 'status'>): GuestIssue {
    const all = load()
    const issue: GuestIssue = {
      ...data,
      id: crypto.randomUUID(),
      trackingId: nextTrackingId(all),
      status: 'open',
      createdAt: new Date().toISOString(),
    }
    save([...all, issue])
    return issue
  },

  updateStatus(id: string, status: GuestIssue['status'], operatorResponse?: string) {
    const all = load()
    const updated = all.map(i =>
      i.id === id ? { ...i, status, ...(operatorResponse ? { operatorResponse } : {}) } : i
    )
    save(updated)
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY)
  },
}
