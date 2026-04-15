import { SHIFTS, type Shift } from './staffScheduling'
import { PROPERTIES } from './properties'
import { JOBS } from './staff'

export interface CleanerDaySchedule {
  date: string
  dayLabel: string
  dayShort: string
  isToday: boolean
  shifts: Shift[]
  properties: Array<{
    id: string
    name: string
    city: string
    imageUrl?: string
    shiftTime: string
    type: string
  }>
  jobCount: number
  totalHours: number
  status: 'off' | 'scheduled' | 'confirmed' | 'completed' | 'in_progress'
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function getCleanerWeek(staffId: string, weekOffset = 0): CleanerDaySchedule[] {
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  // Start from Monday of the target week
  const monday = new Date(now)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + weekOffset * 7)

  const week: CleanerDaySchedule[] = []

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const dayIndex = d.getDay()

    const dayShifts = SHIFTS.filter(s => s.staffId === staffId && s.date === dateStr)

    const properties = dayShifts.map(s => {
      const prop = PROPERTIES.find(p => p.id === s.propertyId)
      return {
        id: s.propertyId,
        name: prop?.name ?? s.propertyId,
        city: prop?.city ?? '',
        imageUrl: prop?.imageUrl,
        shiftTime: `${s.startTime}–${s.endTime}`,
        type: s.type,
      }
    })

    const jobIds = dayShifts.flatMap(s => s.jobIds)
    const jobCount = jobIds.length + (dayShifts.length > 0 ? dayShifts.length : 0)

    const totalMinutes = dayShifts.reduce((sum, s) => {
      const [sh, sm] = s.startTime.split(':').map(Number)
      const [eh, em] = s.endTime.split(':').map(Number)
      return sum + (eh * 60 + em) - (sh * 60 + sm)
    }, 0)

    let status: CleanerDaySchedule['status'] = 'off'
    if (dayShifts.length > 0) {
      if (dayShifts.every(s => s.status === 'completed')) status = 'completed'
      else if (dayShifts.some(s => s.status === 'in_progress')) status = 'in_progress'
      else if (dayShifts.some(s => s.status === 'confirmed')) status = 'confirmed'
      else status = 'scheduled'
    }

    week.push({
      date: dateStr,
      dayLabel: DAY_NAMES[dayIndex],
      dayShort: DAY_SHORT[dayIndex],
      isToday: dateStr === todayStr,
      shifts: dayShifts,
      properties,
      jobCount,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      status,
    })
  }

  return week
}

export function getCleanerMonthSummary(staffId: string): {
  totalShifts: number
  totalHours: number
  propertiesCleaned: number
} {
  const staffShifts = SHIFTS.filter(s => s.staffId === staffId)
  const totalMinutes = staffShifts.reduce((sum, s) => {
    const [sh, sm] = s.startTime.split(':').map(Number)
    const [eh, em] = s.endTime.split(':').map(Number)
    return sum + (eh * 60 + em) - (sh * 60 + sm)
  }, 0)
  const uniqueProps = new Set(staffShifts.map(s => s.propertyId))

  return {
    totalShifts: staffShifts.length,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    propertiesCleaned: uniqueProps.size,
  }
}
