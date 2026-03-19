export type LeaveType = 'vacation' | 'sick' | 'personal' | 'unpaid'
export type LeaveStatus = 'pending' | 'approved' | 'denied'

export interface LeaveBalance {
  staffId: string
  vacationDaysTotal: number
  vacationDaysUsed: number
  sickDaysTotal: number
  sickDaysUsed: number
}

export interface LeaveRequest {
  id: string
  staffId: string
  staffName: string
  type: LeaveType
  from: string       // ISO date "2026-03-25"
  to: string         // ISO date "2026-03-27"
  days: number
  reason?: string
  status: LeaveStatus
  submittedAt: string
  reviewedBy?: string
  reviewNote?: string
}

export const LEAVE_BALANCES: LeaveBalance[] = [
  { staffId: 's1', vacationDaysTotal: 25, vacationDaysUsed: 8,  sickDaysTotal: 10, sickDaysUsed: 1 },
  { staffId: 's2', vacationDaysTotal: 25, vacationDaysUsed: 12, sickDaysTotal: 10, sickDaysUsed: 0 },
  { staffId: 's3', vacationDaysTotal: 25, vacationDaysUsed: 5,  sickDaysTotal: 10, sickDaysUsed: 3 },
  { staffId: 's4', vacationDaysTotal: 25, vacationDaysUsed: 3,  sickDaysTotal: 10, sickDaysUsed: 2 },
]

export const LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 'lr1', staffId: 's1', staffName: 'Johan Larsson', type: 'vacation', from: '2026-03-25', to: '2026-03-28', days: 4, reason: 'Family trip', status: 'pending', submittedAt: '2026-03-18' },
  { id: 'lr2', staffId: 's3', staffName: 'Marcus Berg',   type: 'sick',     from: '2026-03-17', to: '2026-03-17', days: 1, status: 'approved', submittedAt: '2026-03-17', reviewedBy: 'Operator' },
  { id: 'lr3', staffId: 's2', staffName: 'Anna Kowalski', type: 'vacation', from: '2026-04-07', to: '2026-04-11', days: 5, reason: 'Easter break', status: 'approved', submittedAt: '2026-03-10', reviewedBy: 'Operator' },
  { id: 'lr4', staffId: 's4', staffName: 'Fatima Ndiaye', type: 'personal', from: '2026-03-20', to: '2026-03-20', days: 1, reason: 'Personal appointment', status: 'denied', submittedAt: '2026-03-16', reviewedBy: 'Operator', reviewNote: 'Busy check-in day' },
]
