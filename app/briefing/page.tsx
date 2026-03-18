'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { UserProfile } from '@/context/RoleContext'
import { SHIFTS } from '@/lib/data/staffScheduling'
import type { Shift } from '@/lib/data/staffScheduling'
import { PROPERTY_WEATHER } from '@/lib/data/weather'
import { OVERNIGHT_REPORTS } from '@/lib/data/guestServices'
import { GUEST_ISSUES, getActiveIssues } from '@/lib/data/guestServices'
import { PROPERTIES } from '@/lib/data/properties'
import { JOBS } from '@/lib/data/staff'
import CountdownTimer from '@/components/shared/CountdownTimer'
import WeatherWidget from '@/components/shared/WeatherWidget'

const USER_TO_STAFF: Record<string, string> = {
  'u3': 's1',
  'u4': 's3',
  'u5': 's2',
}

const TODAY = '2026-03-18'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(): string {
  return new Date(TODAY).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function getRoleBadgeColor(role: string, subRole?: string): string {
  if (role === 'operator') return '#7c3aed'
  if (role === 'owner') return '#2563eb'
  if (subRole?.includes('Cleaning')) return '#d97706'
  if (subRole?.includes('Maintenance')) return '#0ea5e9'
  if (subRole?.includes('Guest')) return '#ec4899'
  return '#d97706'
}

function getRoleLabel(role: string, subRole?: string): string {
  if (role === 'operator') return 'Operator'
  if (role === 'owner') return 'Owner'
  return subRole ?? 'Staff'
}

export default function BriefingPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [todayShift, setTodayShift] = useState<Shift | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('nestops_user')
    if (stored) {
      try {
        const user: UserProfile = JSON.parse(stored)
        setCurrentUser(user)
        const staffId = USER_TO_STAFF[user.id]
        if (staffId) {
          const shift = SHIFTS.find(s => s.staffId === staffId && s.date === TODAY) ?? null
          setTodayShift(shift)
        }
      } catch {
        // ignore parse errors
      }
    }
  }, [])

  if (!mounted) return null

  // No user — generic screen
  if (!currentUser) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 20% 50%, #1e3a5f 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #0f1923 0%, transparent 60%), #0a0f1a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 40 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 20 }}>N</div>
            <span style={{ fontWeight: 800, color: '#fff', fontSize: 26, letterSpacing: '-0.02em' }}>NestOps</span>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
            {getGreeting()}
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
            {formatDate()}
          </p>

          {/* Default weather */}
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 18px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
            <span style={{ fontSize: 20 }}>❄️</span>
            <span style={{ fontWeight: 600, color: '#fff' }}>4°C</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>Oslo · Light snow this morning</span>
          </div>

          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 28 }}>
            Sign in to see your daily briefing
          </p>

          <Link
            href="/login"
            style={{
              display: 'inline-block',
              padding: '16px 36px',
              borderRadius: 14,
              background: '#7c3aed',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Sign In →
          </Link>
        </motion.div>
      </div>
    )
  }

  // Personalized screen
  const firstName = currentUser.name.split(' ')[0]
  const roleLabel = getRoleLabel(currentUser.role, currentUser.subRole)
  const badgeColor = getRoleBadgeColor(currentUser.role, currentUser.subRole)

  // Find property for weather
  const propertyId = todayShift?.propertyId
  const weatherData = PROPERTY_WEATHER.find(w => w.propertyId === propertyId) ?? PROPERTY_WEATHER[0]

  // Build target time for countdown
  const shiftTargetTime = todayShift
    ? `${TODAY}T${todayShift.startTime}:00`
    : `${TODAY}T09:00:00`

  // Operator data
  const todayReport = OVERNIGHT_REPORTS.find(r => r.date === TODAY)
  const unassignedOvernight = todayReport?.issues.filter(i => i.status === 'unassigned').length ?? 0
  const activeIssues = getActiveIssues(GUEST_ISSUES)
  const todayCheckIns = PROPERTIES.filter(p => p.status === 'live').length // demo proxy

  // Cleaning staff jobs
  const staffId = USER_TO_STAFF[currentUser.id]
  const myShiftsToday = SHIFTS.filter(s => s.staffId === staffId && s.date === TODAY)

  // Maintenance jobs
  const myJobs = JOBS.filter(j => j.staffId === staffId)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 50%, #1e3a5f 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #0f1923 0%, transparent 60%), #0a0f1a',
      position: 'relative',
    }}>
      {/* Header bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 52,
        background: 'rgba(10,15,26,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 13 }}>N</div>
          <span style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>NestOps</span>
        </div>
        <Link
          href="/login"
          style={{
            padding: '6px 14px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Sign In to Start →
        </Link>
      </div>

      {/* Main content */}
      <div style={{ paddingTop: 72, paddingBottom: 60, padding: '72px 20px 60px', maxWidth: 600, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Greeting */}
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
              {getGreeting()}, {firstName} 👋
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: `${badgeColor}30`, color: badgeColor }}>
                {roleLabel}
              </span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{formatDate()}</span>
            </div>
          </div>

          {/* Weather */}
          <div style={{ marginBottom: 24 }}>
            <WeatherWidget propertyId={weatherData.propertyId} compact />
          </div>

          {/* Countdown */}
          {todayShift && (
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: '28px 24px',
              marginBottom: 24,
              textAlign: 'center',
            }}>
              <CountdownTimer
                targetTime={shiftTargetTime}
                label="Shift starts in"
                context={`${todayShift.startTime} · ${PROPERTIES.find(p => p.id === todayShift.propertyId)?.name ?? 'Property'}`}
              />
            </div>
          )}

          {/* Role-specific preview */}
          {currentUser.role === 'operator' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
                  Portfolio Overview
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Properties', value: PROPERTIES.length.toString() },
                    { label: 'Check-ins today', value: todayCheckIns.toString() },
                    { label: 'Overnight issues', value: (todayReport?.issues.length ?? 0).toString() },
                    { label: 'Unassigned', value: unassignedOvernight.toString(), alert: unassignedOvernight > 0 },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: item.alert ? '#f87171' : '#fff', marginBottom: 2 }}>{item.value}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* First check-in countdown */}
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
                <CountdownTimer
                  targetTime={`${TODAY}T15:00:00`}
                  label="First check-in in"
                  context="15:00 · First guest arrival"
                />
              </div>
            </motion.div>
          )}

          {currentUser.role === 'staff' && currentUser.subRole?.includes('Cleaning') && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
                  Your Cleanings Today
                </div>
                {myShiftsToday.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>No cleanings scheduled today</p>
                ) : (
                  myShiftsToday.map(shift => {
                    const prop = PROPERTIES.find(p => p.id === shift.propertyId)
                    return (
                      <div key={shift.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {prop?.imageUrl && (
                          <img src={prop.imageUrl} alt={prop.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{prop?.name ?? shift.propertyId}</div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{shift.startTime} – {shift.endTime}</div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          )}

          {currentUser.role === 'staff' && currentUser.subRole?.includes('Maintenance') && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
                  Your Jobs Today
                </div>
                {myJobs.slice(0, 3).map(job => (
                  <div key={job.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: job.priority === 'urgent' ? '#dc262620' : '#d9770620', color: job.priority === 'urgent' ? '#f87171' : '#fbbf24' }}>
                      {job.priority.toUpperCase()}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{job.title}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{job.propertyName}</div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: job.pteStatus === 'granted' || job.pteStatus === 'auto_granted' ? '#16a34a' : '#d97706' }}>
                      {job.pteStatus === 'granted' || job.pteStatus === 'auto_granted' ? '✓ PTE' : job.pteStatus === 'not_required' ? '○' : '⏳ PTE'}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {currentUser.role === 'staff' && currentUser.subRole?.includes('Guest') && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>
                  Your Queue Today
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 16px', flex: 1 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{activeIssues.length}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Active issues</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 16px', flex: 1 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{todayCheckIns}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Check-ins today</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Bottom CTA */}
          <div style={{ marginTop: 8 }}>
            <Link
              href="/login"
              style={{
                display: 'block',
                width: '100%',
                padding: '18px',
                borderRadius: 16,
                background: '#7c3aed',
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                textDecoration: 'none',
                textAlign: 'center',
                marginBottom: 12,
              }}
            >
              Sign In to See Full Details →
            </Link>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
              View is limited until you sign in. Access codes and task details require authentication.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
