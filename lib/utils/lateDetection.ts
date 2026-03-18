export function getLateStatus(shift: {
  status: string
  date: string
  startTime: string
}): {
  isLate: boolean
  minutesLate: number
  severity: 'grace' | 'late' | 'very_late'
} {
  if (shift.status === 'completed' || shift.status === 'in_progress') {
    return { isLate: false, minutesLate: 0, severity: 'grace' }
  }

  const shiftStart = new Date(`${shift.date}T${shift.startTime}`)
  const now = new Date()
  const minutesLate = Math.floor((now.getTime() - shiftStart.getTime()) / 60000)

  if (minutesLate <= 0) return { isLate: false, minutesLate: 0, severity: 'grace' }
  if (minutesLate <= 15) return { isLate: false, minutesLate, severity: 'grace' }
  if (minutesLate <= 30) return { isLate: true, minutesLate, severity: 'late' }
  return { isLate: true, minutesLate, severity: 'very_late' }
}
