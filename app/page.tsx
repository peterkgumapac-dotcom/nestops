'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()
  useEffect(() => {
    const storedUser = localStorage.getItem('nestops_user')
    if (storedUser) {
      router.push('/app/dashboard')
    } else {
      router.push('/login')
    }
  }, [router])
  return null
}
