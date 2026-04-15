'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CleanerTasksRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/app/my-tasks') }, [router])
  return null
}
