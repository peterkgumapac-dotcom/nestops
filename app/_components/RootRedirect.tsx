'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootRedirect() {
  const router = useRouter()
  useEffect(() => {
    const stored = localStorage.getItem('nestops_user')
    if (stored) {
      router.push('/briefing')
    }
    // No user → stay on marketing page
  }, [router])
  return null
}
