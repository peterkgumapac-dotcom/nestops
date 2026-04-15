'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CleanerProfileRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/app/my-account') }, [router])
  return null
}
