export interface PropertyDayWorkload {
  turnovers: number
  sameDayCheckIns: number
  deepCleans: number
  totalGuests: number
}

// Key format: `${propertyId}__${date}`
export const PROPERTY_WORKLOAD: Record<string, PropertyDayWorkload> = {
  'p1__2026-03-22': { turnovers: 3, sameDayCheckIns: 2, deepCleans: 0, totalGuests: 5 },
  'p1__2026-03-19': { turnovers: 2, sameDayCheckIns: 1, deepCleans: 1, totalGuests: 4 },
  'p2__2026-03-19': { turnovers: 1, sameDayCheckIns: 0, deepCleans: 0, totalGuests: 1 },
  'p3__2026-03-25': { turnovers: 4, sameDayCheckIns: 1, deepCleans: 1, totalGuests: 6 },
  'p4__2026-03-24': { turnovers: 2, sameDayCheckIns: 2, deepCleans: 0, totalGuests: 4 },
  'p4__2026-03-28': { turnovers: 5, sameDayCheckIns: 2, deepCleans: 1, totalGuests: 8 },
}

export function getPropertyWorkload(propertyId: string, date: string): PropertyDayWorkload {
  return PROPERTY_WORKLOAD[`${propertyId}__${date}`] ?? { turnovers: 1, sameDayCheckIns: 0, deepCleans: 0, totalGuests: 1 }
}
