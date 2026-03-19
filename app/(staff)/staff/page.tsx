'use client'
import { useState, useEffect } from 'react'
import { ClipboardList, CheckSquare, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import StatCard from '@/components/shared/StatCard'
import StatusBadge from '@/components/shared/StatusBadge'
import { JOBS, STAFF_MEMBERS } from '@/lib/data/staff'
import { PROPERTIES } from '@/lib/data/properties'
import { useRole } from '@/context/RoleContext'
import Link from 'next/link'
import type { StaffMember } from '@/lib/data/staff'

const USER_TO_STAFF: Record<string, string> = {
  u3: 's1', // Maria → Johan Larsson (cleaning)
  u4: 's3', // Bjorn → Marcus Berg (maintenance)
  u5: 's4', // Fatima → Fatima Ndiaye (guest services)
  u7: 's2', // Anna → Anna Kowalski (inspector)
}

export default function StaffHome() {
  const { accent } = useRole()
  const router = useRouter()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null)
  const [checkedJobs, setCheckedJobs] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nestops_user')
      const profile = stored ? JSON.parse(stored) : null
      const staffId = profile ? USER_TO_STAFF[profile.id] : null
      const staff = staffId
        ? STAFF_MEMBERS.find(s => s.id === staffId) ?? STAFF_MEMBERS[0]
        : STAFF_MEMBERS[0]
      setCurrentStaff(staff)
      // Load persisted checked state, fall back to done-status jobs
      const savedChecks = profile ? localStorage.getItem(`nestops_job_checks_${profile.id}`) : null
      if (savedChecks) {
        setCheckedJobs(new Set(JSON.parse(savedChecks)))
      } else {
        setCheckedJobs(new Set(
          JOBS.filter(j => staff.jobIds.includes(j.id) && j.status === 'done').map(j => j.id)
        ))
      }
    } catch {
      setCurrentStaff(STAFF_MEMBERS[0])
    }
  }, [])

  if (!currentStaff) return null

  const myJobs = JOBS.filter(j => currentStaff.jobIds.includes(j.id))
  const myProperties = PROPERTIES.filter(p => currentStaff.assignedPropertyIds.includes(p.id))
  const firstName = currentStaff.name.split(' ')[0]

  const toggleJob = (id: string) => {
    setCheckedJobs(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try {
        const stored = localStorage.getItem('nestops_user')
        if (stored) {
          const profile = JSON.parse(stored)
          localStorage.setItem(`nestops_job_checks_${profile.id}`, JSON.stringify([...next]))
        }
      } catch {}
      return next
    })
  }

  const allDone = myJobs.length > 0 && myJobs.every(j => checkedJobs.has(j.id))
  const openCount = myJobs.filter(j => !checkedJobs.has(j.id)).length

  const markAllDone = () => {
    const allIds = new Set(myJobs.map(j => j.id))
    setCheckedJobs(allIds)
    try {
      const stored = localStorage.getItem('nestops_user')
      if (stored) {
        const profile = JSON.parse(stored)
        localStorage.setItem(`nestops_job_checks_${profile.id}`, JSON.stringify([...allIds]))
      }
    } catch {}
  }

  return (
    <div style={{ paddingBottom: 88 }}>
      {/* Sticky day header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-page)', paddingBottom: 8, marginBottom: 4 }}>
        <PageHeader title={`${greeting}, ${firstName} 👋`} subtitle="Here's your day at a glance" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard label="Properties" value={myProperties.length} icon={Building2} />
        <StatCard label="Open Tasks" value={openCount} icon={CheckSquare} />
        <StatCard label="My Jobs" value={myJobs.length} icon={ClipboardList} />
      </div>

      {/* New Intake CTA */}
      <Link href="/staff/new-intake" style={{ textDecoration: 'none', display: 'block', marginBottom: 24 }}>
        <div style={{ background: `${accent}14`, border: `1px solid ${accent}33`, borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ClipboardList size={22} style={{ color: '#fff' }} strokeWidth={1.5} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 2 }}>Start New Property Intake</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Inspect and document a property — photos, assets, notes, and issues</div>
          </div>
          <span style={{ fontSize: 20, color: accent }}>→</span>
        </div>
      </Link>

      {/* Today's Properties — full width */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Today's Properties</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {myProperties.length === 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, textAlign: 'center' }}>
              <Building2 size={28} style={{ color: 'var(--text-subtle)', margin: '0 auto 10px', display: 'block' }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>No properties assigned today</div>
              <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>Contact your operator for assignments</div>
            </div>
          )}
          {myProperties.map(p => {
            const job = myJobs.find(j => j.propertyId === p.id)
            return (
              <div key={p.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 16px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.3 }}>{p.name}</span>
                  {job?.urgencyLabel && <StatusBadge status={job.urgencyLabel.toLowerCase() as 'urgent' | 'scheduled'} />}
                </div>
                {job?.checkoutTime && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>Checkout: {job.checkoutTime}</div>}
                {job?.checkinTime && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Check-in: {job.checkinTime}</div>}
                <button
                  onClick={() => router.push('/staff/new-intake')}
                  style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 44, width: '100%' }}
                >
                  Start Intake
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Today's Tasks — full width, mobile-optimized */}
      <div>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Today's Tasks</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {myJobs.length === 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
              No tasks assigned for today
            </div>
          )}
          {myJobs.map(j => {
            const isDone = checkedJobs.has(j.id)
            return (
              <label
                key={j.id}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', minHeight: 56 }}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => toggleJob(j.id)}
                  style={{ accentColor: accent, flexShrink: 0, width: 22, height: 22 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: isDone ? 'var(--text-subtle)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none', marginBottom: 2 }}>{j.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{j.propertyName} · Due {j.dueTime}</div>
                </div>
                <StatusBadge status={j.priority} />
              </label>
            )
          })}
        </div>
      </div>

      {/* Floating Mark All Done button */}
      {myJobs.length > 0 && (
        <div style={{ position: 'fixed', bottom: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20, pointerEvents: 'none' }}>
          <button
            onClick={markAllDone}
            disabled={allDone}
            style={{
              pointerEvents: 'all',
              padding: '14px 32px', borderRadius: 100, border: 'none',
              background: allDone ? 'var(--bg-card)' : accent,
              color: allDone ? 'var(--text-subtle)' : '#fff',
              fontSize: 15, fontWeight: 700, cursor: allDone ? 'default' : 'pointer',
              boxShadow: allDone ? 'none' : '0 4px 24px rgba(0,0,0,0.25)',
              transition: 'all 0.2s',
              minHeight: 52,
            }}
          >
            {allDone ? '✓ All Done!' : `Mark All Done (${openCount})`}
          </button>
        </div>
      )}
    </div>
  )
}
