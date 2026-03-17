'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainAppShell from '@/components/shared/MainAppShell'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const savedUser = localStorage.getItem('nestops_user')
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

  return <MainAppShell>{children}</MainAppShell>
}
