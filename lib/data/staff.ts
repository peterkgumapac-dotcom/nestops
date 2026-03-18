export type JobStatus = 'pending' | 'in_progress' | 'done'
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent'
export type JobPTEStatus = 'not_required' | 'auto_granted' | 'pending' | 'granted' | 'denied' | 'expired'

export interface Job {
  id: string
  title: string
  propertyId: string
  propertyName: string
  type: 'cleaning' | 'maintenance' | 'inspection' | 'intake'
  status: JobStatus
  priority: JobPriority
  dueTime: string
  notes?: string
  checkoutTime?: string
  checkinTime?: string
  urgencyLabel?: 'Urgent' | 'Scheduled'
  pteRequired?: boolean
  pteStatus?: JobPTEStatus
  staffId?: string
}

export interface StaffMember {
  id: string
  name: string
  initials: string
  role: string
  assignedPropertyIds: string[]
  status: 'active' | 'inactive'
  jobIds: string[]
  hourlyRate: number // NOK per hour
}

export const JOBS: Job[] = [
  { id: 'j1', title: 'Full turnover clean', propertyId: 'p1', propertyName: 'Sunset Villa', type: 'cleaning', status: 'pending', priority: 'urgent', dueTime: '14:00', checkoutTime: '11:00', checkinTime: '15:00', urgencyLabel: 'Urgent', pteRequired: false, pteStatus: 'not_required', staffId: 's1' },
  { id: 'j2', title: 'Inspect heating system', propertyId: 'p4', propertyName: 'Downtown Loft', type: 'maintenance', status: 'in_progress', priority: 'high', dueTime: '12:00', urgencyLabel: 'Urgent', pteRequired: true, pteStatus: 'pending', staffId: 's3' },
  { id: 'j3', title: 'Quarterly inspection', propertyId: 'p3', propertyName: 'Ocean View Apt', type: 'inspection', status: 'pending', priority: 'medium', dueTime: '10:00', checkoutTime: '10:00', checkinTime: '15:00', urgencyLabel: 'Scheduled', pteRequired: false, pteStatus: 'not_required', staffId: 's2' },
  { id: 'j4', title: 'Standard clean', propertyId: 'p2', propertyName: 'Harbor Studio', type: 'cleaning', status: 'done', priority: 'low', dueTime: '11:00', pteRequired: false, pteStatus: 'not_required', staffId: 's1' },
  { id: 'j5', title: 'New property intake', propertyId: 'p5', propertyName: 'Mountain Cabin', type: 'intake', status: 'pending', priority: 'medium', dueTime: '09:00', pteRequired: false, pteStatus: 'not_required', staffId: 's1' },
  { id: 'j6', title: 'Fix hot tub heater', propertyId: 'p1', propertyName: 'Sunset Villa', type: 'maintenance', status: 'pending', priority: 'high', dueTime: '15:00', urgencyLabel: 'Urgent', pteRequired: true, pteStatus: 'auto_granted', staffId: 's3' },
  { id: 'j7', title: 'Fix toilet — blocked', propertyId: 'p3', propertyName: 'Ocean View Apt', type: 'maintenance', status: 'pending', priority: 'urgent', dueTime: '11:00', urgencyLabel: 'Urgent', pteRequired: true, pteStatus: 'granted', staffId: 's3' },
  { id: 'j8', title: 'Pool inspection', propertyId: 'p5', propertyName: 'Mountain Cabin', type: 'inspection', status: 'pending', priority: 'medium', dueTime: '14:00', urgencyLabel: 'Scheduled', pteRequired: false, pteStatus: 'not_required', staffId: 's2' },
]

export const STAFF_MEMBERS: StaffMember[] = [
  { id: 's1', name: 'Johan Larsson', initials: 'JL', role: 'Senior Cleaner',   assignedPropertyIds: ['p1', 'p3', 'p5'], status: 'active', jobIds: ['j1', 'j3', 'j5'], hourlyRate: 285 },
  { id: 's2', name: 'Anna Kowalski', initials: 'AK', role: 'Inspector',         assignedPropertyIds: ['p2', 'p4'],       status: 'active', jobIds: ['j2', 'j4'],       hourlyRate: 320 },
  { id: 's3', name: 'Marcus Berg',   initials: 'MB', role: 'Maintenance Tech',  assignedPropertyIds: ['p1', 'p4'],       status: 'active', jobIds: ['j2'],             hourlyRate: 310 },
]
