// lib/storage.ts
export const STORAGE_KEYS = {
  USER: 'afterstay_user',
  ROLE: 'afterstay_role',
  THEME: 'afterstay_theme',
  BRIEFING_PREFS: 'afterstay_briefing_prefs',
  CLOCKIN: 'afterstay_clockin',
  FIELD_REPORTS: 'afterstay_field_reports',
  OWNER_WORK_ORDERS: 'afterstay_owner_work_orders',
} as const

export function storageGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const val = localStorage.getItem(key)
    if (!val) return null
    return JSON.parse(val) as T
  } catch (e) {
    console.warn(`[storage] Failed to parse key "${key}":`, e)
    return null
  }
}

export function storageSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn(`[storage] Failed to set key "${key}":`, e)
  }
}

export function storageRemove(key: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(key)
}

export function clearAllUserStorage(): void {
  Object.values(STORAGE_KEYS).forEach(key => storageRemove(key))
}
