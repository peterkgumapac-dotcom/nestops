'use client'
import { useState, useEffect } from 'react'
import { useRole } from '@/context/RoleContext'

export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    setIsMobile(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [breakpoint])
  return isMobile
}

export function useIsCleaner(): boolean {
  const { user } = useRole()
  if (!user) return false
  return user.jobRole === 'cleaner' || user.subRole === 'Cleaner'
}
