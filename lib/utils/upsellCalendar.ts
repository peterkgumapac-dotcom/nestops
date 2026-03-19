import { GUEST_VERIFICATIONS, type GuestVerification, type UpsellPurchase } from '@/lib/data/verification'
import { RESERVATIONS } from '@/lib/data/reservations'

export function daysUntil(today: string, target: string): number {
  const t = new Date(today)
  const d = new Date(target)
  return Math.ceil((d.getTime() - t.getTime()) / (1000 * 60 * 60 * 24))
}

export function getThreeTierSignal(
  upsellTitle: string,
  propertyId: string,
  checkInDate: string,
  checkOutDate: string,
  today: string,
): 'available' | 'tentative' | 'blocked' {
  const t = upsellTitle.toLowerCase()
  const isEco = t.includes('early check') || t.includes('early')
  const isLco = t.includes('late check') || t.includes('checkout') || t.includes('check-out') || t.includes('late')

  if (!isEco && !isLco) return 'available'

  const sameProperty = RESERVATIONS.filter(r => r.propertyId === propertyId)

  if (isEco) {
    const priorCheckout = sameProperty.find(r => r.checkOutDate === checkInDate)
    if (priorCheckout) return 'blocked'
    const days = daysUntil(today, checkInDate)
    if (days <= 7) return 'tentative'
    return 'available'
  }

  // LCO
  const nextCheckin = sameProperty.find(r => r.checkInDate === checkOutDate)
  if (nextCheckin) return 'blocked'
  const days = daysUntil(today, checkOutDate)
  if (days <= 7) return 'tentative'
  return 'available'
}

export type CalendarSignalType = 'early_checkin' | 'late_checkout'

export interface CalendarSignal {
  type: CalendarSignalType
  possible: boolean
  reason: string
  conflictGuest?: string   // name of the conflicting guest if blocked
}

export function isCalendarUpsell(title: string): boolean {
  const t = title.toLowerCase()
  return t.includes('early check') || t.includes('late check') || t.includes('checkout') || t.includes('check-out') || t.includes('check-in')
}

export function getCalendarSignal(
  upsellTitle: string,
  propertyId: string,
  checkInDate: string,
  checkOutDate: string,
): CalendarSignal | null {
  const t = upsellTitle.toLowerCase()
  const isEarly = t.includes('early check')
  const isLate  = t.includes('late check') || t.includes('checkout') || t.includes('check-out')
  if (!isEarly && !isLate) return null

  const sameProperty = RESERVATIONS.filter(r => r.propertyId === propertyId)

  if (isEarly) {
    const priorCheckout = sameProperty.find(r => r.checkOutDate === checkInDate)
    return {
      type: 'early_checkin',
      possible: !priorCheckout,
      reason: priorCheckout
        ? `Prior checkout (${priorCheckout.guestName}) — ECO tight`
        : 'No prior checkout — ECO available',
      conflictGuest: priorCheckout?.guestName,
    }
  }

  const nextCheckin = sameProperty.find(r => r.checkInDate === checkOutDate)
  return {
    type: 'late_checkout',
    possible: !nextCheckin,
    reason: nextCheckin
      ? `Incoming check-in (${nextCheckin.guestName}) — LCO restricted`
      : 'No incoming check-in — LCO available',
    conflictGuest: nextCheckin?.guestName,
  }
}

export interface UpsellApprovalItem {
  guest: GuestVerification
  upsell: UpsellPurchase
  signal: CalendarSignal
  triggerType: 'same_day_checkin' | 'same_day_checkout'
}

/**
 * Returns upsell approval items where:
 * - Guest is checking in TODAY and has an early-checkin upsell, OR
 * - Guest is checking out TODAY and has a late-checkout upsell
 */
export function getTodayUpsellApprovals(today: string): UpsellApprovalItem[] {
  const items: UpsellApprovalItem[] = []

  for (const guest of GUEST_VERIFICATIONS) {
    if (!guest.upsellPurchases?.length) continue

    for (const upsell of guest.upsellPurchases) {
      if (!isCalendarUpsell(upsell.title)) continue

      const t = upsell.title.toLowerCase()
      const isEarly = t.includes('early check')
      const isLate  = t.includes('late check') || t.includes('checkout') || t.includes('check-out')

      const isSameDayCheckin  = guest.checkInDate  === today && isEarly
      const isSameDayCheckout = guest.checkOutDate === today && isLate

      if (!isSameDayCheckin && !isSameDayCheckout) continue

      const signal = getCalendarSignal(upsell.title, guest.propertyId, guest.checkInDate, guest.checkOutDate)
      if (!signal) continue

      items.push({
        guest,
        upsell,
        signal,
        triggerType: isSameDayCheckin ? 'same_day_checkin' : 'same_day_checkout',
      })
    }
  }

  return items
}
