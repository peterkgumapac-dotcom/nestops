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
  u3: 's1',
  u4: 's3',
  u5: 's2',
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
      if (stored) {
        const profile = JSON.parse(stored)
        const staffId = USER_TO_STAFF[profile.id]
        const staff = staffId
          ? STAFF_MEMBERS.find(s => s.id === staffId) ?? STAFF_MEMBERS[0]
          : STAFF_MEMBERS[0]
        setCurrentStaff(staff)
        setCheckedJobs(new Set(
          JOBS.filter(j => staff.jobIds.includes(j.id) && j.status === 'done').map(j => j.id)
        ))
      } else {
        setCurrentStaff(STAFF_MEMBERS[0])
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
      return next
    })
  }

  return (
    <div>
      <PageHeader title={`${greeting}, ${firstName} 👋`} subtitle="Here's your day at a glance" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Assigned Properties" value={myProperties.length} icon={Building2} />
        <StatCard label="Open Tasks" value={myJobs.filter(j => !checkedJobs.has(j.id)).length} icon={CheckSquare} />
        <StatCard label="My Jobs" value={myJobs.length} icon={ClipboardList} />
      </div>

      {/* New Intake CTA */}
      <Link href="/staff/new-intake" style={{ textDecoration: 'none', display: 'block', marginBottom: 24 }}>
        <div style={{ background: `${accent}14`, border: `1px solid ${accent}33`, borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', gap: 16, transition: 'background 0.15s', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.background = `${accent}22`)}
          onMouseLeave={e => (e.currentTarget.style.background = `${accent}14`)}
        >
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Assigned Properties */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Today's Properties</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {myProperties.map(p => {
              const job = myJobs.find(j => j.propertyId === p.id)
              return (
                <div key={p.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{p.name}</span>
                    {job?.urgencyLabel && <StatusBadge status={job.urgencyLabel.toLowerCase() as 'urgent' | 'scheduled'} />}
                  </div>
                  {job?.checkoutTime && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Checkout: {job.checkoutTime}</div>}
                  {job?.checkinTime && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Check-in: {job.checkinTime}</div>}
                  <button
                    onClick={() => router.push('/staff/new-intake')}
                    style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: accent, color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                  >
                    Start Intake
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Today's Tasks */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Today's Tasks</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {myJobs.map(j => {
              const isDone = checkedJobs.has(j.id)
              return (
                <div key={j.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 9 }}>
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => toggleJob(j.id)}
                    style={{ accentColor: accent, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: isDone ? 'var(--text-subtle)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none' }}>{j.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{j.propertyName} · Due {j.dueTime}</div>
                  </div>
                  <StatusBadge status={j.priority} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
