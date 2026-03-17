'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const savedUser = localStorage.getItem('nestops_user')
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser)
        if (u.role === 'owner') { router.replace('/owner'); return }
        if (u.role === 'staff' || u.role === 'operator') { router.replace('/app/dashboard'); return }
      } catch { /* fall through */ }
    }
    router.replace('/login')
  }, [router])

  return null
}
