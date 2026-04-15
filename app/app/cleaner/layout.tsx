'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CleanerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const savedUser = localStorage.getItem('afterstay_user')
    if (!savedUser) {
      router.replace('/login')
      return
    }
    try {
      const u = JSON.parse(savedUser)
      if (u.role === 'owner') {
        router.replace('/owner')
      }
    } catch { /* ignore */ }
  }, [router])

  return <>{children}</>
}
