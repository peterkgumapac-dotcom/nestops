'use client'
import { useState, useEffect } from 'react'
import { storageGet, STORAGE_KEYS } from '@/lib/storage'
import type { UserProfile } from '@/context/RoleContext'

export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const user = storageGet<UserProfile>(STORAGE_KEYS.USER)
    setCurrentUser(user)
    setMounted(true)
  }, [])

  return { currentUser, mounted }
}
