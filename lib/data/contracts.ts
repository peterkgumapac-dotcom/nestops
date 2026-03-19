export type EmploymentType = 'full_time' | 'part_time' | 'casual' | 'contractor'

export interface StaffContract {
  staffId: string
  staffName: string
  employmentType: EmploymentType
  startDate: string          // ISO date
  endDate?: string           // undefined = ongoing
  hourlyRate: number         // NOK
  weeklyHours: number        // contracted hours
  noticePeriodDays: number
  benefits: string[]
  status: 'active' | 'expired' | 'draft'
}

export const STAFF_CONTRACTS: StaffContract[] = [
  { staffId: 's1', staffName: 'Johan Larsson', employmentType: 'full_time',  startDate: '2024-02-01', hourlyRate: 285, weeklyHours: 40, noticePeriodDays: 30, benefits: ['25 days paid leave', '10 days sick pay', 'Equipment provided'], status: 'active' },
  { staffId: 's2', staffName: 'Anna Kowalski', employmentType: 'full_time',  startDate: '2023-08-15', hourlyRate: 320, weeklyHours: 40, noticePeriodDays: 30, benefits: ['25 days paid leave', '10 days sick pay', 'Equipment provided', 'Inspection kit allowance'], status: 'active' },
  { staffId: 's3', staffName: 'Marcus Berg',   employmentType: 'part_time',  startDate: '2025-01-10', hourlyRate: 310, weeklyHours: 24, noticePeriodDays: 14, benefits: ['Pro-rata leave', '10 days sick pay', 'Tools provided'], status: 'active' },
  { staffId: 's4', staffName: 'Fatima Ndiaye', employmentType: 'full_time',  startDate: '2024-06-01', hourlyRate: 295, weeklyHours: 40, noticePeriodDays: 30, benefits: ['25 days paid leave', '10 days sick pay', 'Mobile data allowance'], status: 'active' },
]
