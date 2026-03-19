'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PROPERTIES } from '@/lib/data/properties'

interface ClockIn {
  staffId: string
  shiftId: string
  propertyId: string
  date: string
  clockInTime: string
  status: string
}

function getElapsed(clockInTime: string): string {
  const diff = Date.now() - new Date(clockInTime).getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default function ClockStatus() {
  const [clockIn, setClockIn] = useState<ClockIn | null>(null)
  const [elapsed, setElapsed] = useState('')
  const [isStaff, setIsStaff] = useState(false)
  const [isSupervisor, setIsSupervisor] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('nestops_user')
    if (userStr) {
      try {
        const u = JSON.parse(userStr)
        setIsStaff(u.role === 'staff')
        setIsSupervisor(u.subRole?.includes('Supervisor') ?? false)
      } catch {}
    }
    const ciStr = localStorage.getItem('nestops_clockin')
    if (ciStr) {
      try {
        const ci = JSON.parse(ciStr)
        const today = new Date().toISOString().split('T')[0]
        if (ci.date === today && ci.status === 'in_progress') {
          setClockIn(ci)
          setElapsed(getElapsed(ci.clockInTime))
        }
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (!clockIn) return
    const interval = setInterval(() => {
      setElapsed(getElapsed(clockIn.clockInTime))
    }, 60000)
    return () => clearInterval(interval)
  }, [clockIn])

  if (!isStaff) return null

  const propertyName = clockIn ? (PROPERTIES.find(p => p.id === clockIn.propertyId)?.name ?? 'Property') : null

  if (isSupervisor) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 12 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#7c3aed' }} />
        <Link href="/app/dashboard" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Team Overview</Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 12 }}>
      {clockIn ? (
        <>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            On shift · {propertyName} · {elapsed}
          </span>
          <button
            onClick={() => {
              const updated = { ...clockIn, status: 'completed', clockOutTime: new Date().toISOString() }
              localStorage.setItem('nestops_clockin', JSON.stringify(updated))
              setClockIn(null)
            }}
            style={{ fontSize: 11, padding: '3px 8px', borderRadius: 5, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            Clock Out
          </button>
        </>
      ) : (
        <>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#6b7280' }} />
          <Link href="/staff/start" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Start Shift</Link>
        </>
      )}
    </div>
  )
}
