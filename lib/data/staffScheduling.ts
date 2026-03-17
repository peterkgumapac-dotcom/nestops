import { STAFF_MEMBERS } from './staff'
import { PROPERTIES } from './properties'

export type ShiftType = 'cleaning' | 'maintenance' | 'inspection' | 'intake' | 'standby'
export type ShiftStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'

export interface Shift {
  id: string
  staffId: string
  propertyId: string
  date: string           // ISO date string e.g. '2026-03-16'
  day: DayOfWeek
  startTime: string      // '09:00'
  endTime: string        // '14:00'
  type: ShiftType
  status: ShiftStatus
  notes?: string
  jobIds: string[]
}

export interface StaffAvailability {
  staffId: string
  day: DayOfWeek
  available: boolean
  preferredStart?: string
  preferredEnd?: string
  notes?: string
}

// Week of 2026-03-16 (Mon) to 2026-03-22 (Sun)
export const WEEK_START = '2026-03-16'

export const SHIFTS: Shift[] = [
  // Monday 2026-03-16
  { id: 'sh-1',  staffId: 's1', propertyId: 'p1', date: '2026-03-16', day: 'Mon', startTime: '09:00', endTime: '13:00', type: 'cleaning',     status: 'completed',  notes: 'Full turnover — checkout 11am',   jobIds: ['j1'] },
  { id: 'sh-2',  staffId: 's2', propertyId: 'p4', date: '2026-03-16', day: 'Mon', startTime: '10:00', endTime: '12:00', type: 'inspection',   status: 'completed',  notes: 'Quarterly check',                  jobIds: ['j3'] },
  { id: 'sh-3',  staffId: 's3', propertyId: 'p1', date: '2026-03-16', day: 'Mon', startTime: '14:00', endTime: '17:00', type: 'maintenance',  status: 'completed',  notes: 'AC unit service',                   jobIds: [] },

  // Tuesday 2026-03-17
  { id: 'sh-4',  staffId: 's1', propertyId: 'p3', date: '2026-03-17', day: 'Tue', startTime: '09:00', endTime: '12:00', type: 'cleaning',     status: 'completed',  notes: 'Standard turnover',                jobIds: [] },
  { id: 'sh-5',  staffId: 's2', propertyId: 'p2', date: '2026-03-17', day: 'Tue', startTime: '13:00', endTime: '15:00', type: 'inspection',   status: 'completed',  notes: 'New guest arrival check',          jobIds: [] },
  { id: 'sh-6',  staffId: 's3', propertyId: 'p4', date: '2026-03-17', day: 'Tue', startTime: '08:00', endTime: '11:00', type: 'maintenance',  status: 'completed',  notes: 'Hot water heater inspection',      jobIds: ['j2'] },

  // Wednesday 2026-03-18
  { id: 'sh-7',  staffId: 's1', propertyId: 'p5', date: '2026-03-18', day: 'Wed', startTime: '10:00', endTime: '14:00', type: 'intake',       status: 'completed',  notes: 'New property onboarding',          jobIds: ['j5'] },
  { id: 'sh-8',  staffId: 's2', propertyId: 'p1', date: '2026-03-18', day: 'Wed', startTime: '09:00', endTime: '11:00', type: 'inspection',   status: 'completed',  notes: 'Post-maintenance walkthrough',     jobIds: [] },
  { id: 'sh-9',  staffId: 's3', propertyId: 'p3', date: '2026-03-18', day: 'Wed', startTime: '13:00', endTime: '16:00', type: 'maintenance',  status: 'completed',  notes: 'Tap washer replacement',           jobIds: [] },

  // Thursday 2026-03-19
  { id: 'sh-10', staffId: 's1', propertyId: 'p2', date: '2026-03-19', day: 'Thu', startTime: '09:00', endTime: '12:00', type: 'cleaning',     status: 'confirmed',  notes: 'Checkout clean',                   jobIds: [] },
  { id: 'sh-11', staffId: 's2', propertyId: 'p3', date: '2026-03-19', day: 'Thu', startTime: '14:00', endTime: '16:00', type: 'inspection',   status: 'confirmed',  notes: 'Pre-arrival check',                jobIds: [] },
  { id: 'sh-12', staffId: 's3', propertyId: 'p1', date: '2026-03-19', day: 'Thu', startTime: '08:00', endTime: '12:00', type: 'maintenance',  status: 'confirmed',  notes: 'Full appliance service',           jobIds: [] },

  // Friday 2026-03-20
  { id: 'sh-13', staffId: 's1', propertyId: 'p4', date: '2026-03-20', day: 'Fri', startTime: '08:00', endTime: '13:00', type: 'cleaning',     status: 'scheduled',  notes: 'Turnover — 3 checkouts today',    jobIds: [] },
  { id: 'sh-14', staffId: 's2', propertyId: 'p5', date: '2026-03-20', day: 'Fri', startTime: '10:00', endTime: '13:00', type: 'inspection',   status: 'scheduled',  notes: 'Cabin readiness check',            jobIds: [] },
  { id: 'sh-15', staffId: 's3', propertyId: 'p2', date: '2026-03-20', day: 'Fri', startTime: '09:00', endTime: '11:00', type: 'maintenance',  status: 'scheduled',  notes: 'Nespresso descale',                jobIds: [] },

  // Saturday 2026-03-21
  { id: 'sh-16', staffId: 's1', propertyId: 'p1', date: '2026-03-21', day: 'Sat', startTime: '10:00', endTime: '15:00', type: 'cleaning',     status: 'scheduled',  notes: 'Weekend turnover',                 jobIds: [] },
  { id: 'sh-17', staffId: 's1', propertyId: 'p3', date: '2026-03-21', day: 'Sat', startTime: '16:00', endTime: '18:00', type: 'standby',      status: 'scheduled',  notes: 'On-call standby',                  jobIds: [] },
  { id: 'sh-18', staffId: 's2', propertyId: 'p4', date: '2026-03-21', day: 'Sat', startTime: '09:00', endTime: '12:00', type: 'inspection',   status: 'scheduled',  notes: 'Saturday arrival check',           jobIds: [] },

  // Sunday 2026-03-22
  { id: 'sh-19', staffId: 's1', propertyId: 'p2', date: '2026-03-22', day: 'Sun', startTime: '11:00', endTime: '14:00', type: 'cleaning',     status: 'scheduled',  notes: 'Sunday deep clean',                jobIds: [] },
  { id: 'sh-20', staffId: 's3', propertyId: 'p5', date: '2026-03-22', day: 'Sun', startTime: '10:00', endTime: '13:00', type: 'maintenance',  status: 'scheduled',  notes: 'Cabin heating system',             jobIds: [] },
]

export const AVAILABILITY: StaffAvailability[] = [
  { staffId: 's1', day: 'Mon', available: true,  preferredStart: '08:00', preferredEnd: '16:00' },
  { staffId: 's1', day: 'Tue', available: true,  preferredStart: '08:00', preferredEnd: '16:00' },
  { staffId: 's1', day: 'Wed', available: true,  preferredStart: '08:00', preferredEnd: '16:00' },
  { staffId: 's1', day: 'Thu', available: true,  preferredStart: '08:00', preferredEnd: '16:00' },
  { staffId: 's1', day: 'Fri', available: true,  preferredStart: '08:00', preferredEnd: '16:00' },
  { staffId: 's1', day: 'Sat', available: true,  preferredStart: '10:00', preferredEnd: '18:00' },
  { staffId: 's1', day: 'Sun', available: true,  preferredStart: '11:00', preferredEnd: '15:00' },

  { staffId: 's2', day: 'Mon', available: true,  preferredStart: '09:00', preferredEnd: '17:00' },
  { staffId: 's2', day: 'Tue', available: true,  preferredStart: '09:00', preferredEnd: '17:00' },
  { staffId: 's2', day: 'Wed', available: true,  preferredStart: '09:00', preferredEnd: '17:00' },
  { staffId: 's2', day: 'Thu', available: true,  preferredStart: '09:00', preferredEnd: '17:00' },
  { staffId: 's2', day: 'Fri', available: true,  preferredStart: '09:00', preferredEnd: '17:00' },
  { staffId: 's2', day: 'Sat', available: true,  preferredStart: '09:00', preferredEnd: '14:00' },
  { staffId: 's2', day: 'Sun', available: false, notes: 'Unavailable Sundays' },

  { staffId: 's3', day: 'Mon', available: true,  preferredStart: '08:00', preferredEnd: '17:00' },
  { staffId: 's3', day: 'Tue', available: true,  preferredStart: '08:00', preferredEnd: '17:00' },
  { staffId: 's3', day: 'Wed', available: true,  preferredStart: '08:00', preferredEnd: '17:00' },
  { staffId: 's3', day: 'Thu', available: true,  preferredStart: '08:00', preferredEnd: '17:00' },
  { staffId: 's3', day: 'Fri', available: true,  preferredStart: '08:00', preferredEnd: '17:00' },
  { staffId: 's3', day: 'Sat', available: false, notes: 'Unavailable Saturdays' },
  { staffId: 's3', day: 'Sun', available: true,  preferredStart: '10:00', preferredEnd: '15:00' },
]

// ─── Computed helpers ────────────────────────────────────────────────────────

export function getShiftDuration(shift: Shift): number {
  const [sh, sm] = shift.startTime.split(':').map(Number)
  const [eh, em] = shift.endTime.split(':').map(Number)
  return (eh * 60 + em) - (sh * 60 + sm)
}

export function getStaffWeeklyHours(staffId: string): number {
  const mins = SHIFTS
    .filter(s => s.staffId === staffId)
    .reduce((sum, s) => sum + getShiftDuration(s), 0)
  return Math.round((mins / 60) * 10) / 10
}

export function getShiftsForDay(day: DayOfWeek): Shift[] {
  return SHIFTS.filter(s => s.day === day)
}

export function getShiftsForStaff(staffId: string): Shift[] {
  return SHIFTS.filter(s => s.staffId === staffId)
}

export function getShiftsForProperty(propertyId: string): Shift[] {
  return SHIFTS.filter(s => s.propertyId === propertyId)
}

export interface StaffWorkload {
  staffId: string
  staffName: string
  initials: string
  weeklyHours: number
  shiftCount: number
  byType: Record<ShiftType, number>
  utilisation: number // 0–100 based on 40h standard week
}

export function getWorkloadSummary(): StaffWorkload[] {
  return STAFF_MEMBERS.map(member => {
    const shifts = getShiftsForStaff(member.id)
    const weeklyHours = getStaffWeeklyHours(member.id)
    const byType = {} as Record<ShiftType, number>
    for (const s of shifts) {
      byType[s.type] = (byType[s.type] ?? 0) + getShiftDuration(s) / 60
    }
    return {
      staffId: member.id,
      staffName: member.name,
      initials: member.initials,
      weeklyHours,
      shiftCount: shifts.length,
      byType,
      utilisation: Math.round((weeklyHours / 40) * 100),
    }
  })
}

export const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const SHIFT_TYPE_COLOR: Record<ShiftType, string> = {
  cleaning:    '#7c3aed',
  maintenance: '#f97316',
  inspection:  '#06b6d4',
  intake:      '#10b981',
  standby:     '#6b7280',
}

export const SHIFT_STATUS_COLOR: Record<ShiftStatus, string> = {
  scheduled:   '#6366f1',
  confirmed:   '#7c3aed',
  in_progress: '#d97706',
  completed:   '#10b981',
  cancelled:   '#ef4444',
  no_show:     '#dc2626',
}
