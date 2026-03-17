'use client'
import { ClipboardList, CheckSquare, Building2 } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatCard from '@/components/shared/StatCard'
import StatusBadge from '@/components/shared/StatusBadge'
import { JOBS, STAFF_MEMBERS } from '@/lib/data/staff'
import { PROPERTIES } from '@/lib/data/properties'
import { useRole } from '@/context/RoleContext'
import Link from 'next/link'

const CURRENT_STAFF = STAFF_MEMBERS[0] // Johan Larsson
const MY_JOBS = JOBS.filter(j => CURRENT_STAFF.jobIds.includes(j.id))
const MY_PROPERTIES = PROPERTIES.filter(p => CURRENT_STAFF.assignedPropertyIds.includes(p.id))
const MY_URGENT = MY_JOBS.filter(j => j.urgencyLabel === 'Urgent')

export default function StaffHome() {
  const { accent } = useRole()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      <PageHeader title={`${greeting}, Johan 👋`} subtitle="Here's your day at a glance" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Assigned Properties" value={MY_PROPERTIES.length} icon={Building2} />
        <StatCard label="Open Tasks" value={MY_JOBS.filter(j => j.status !== 'done').length} icon={CheckSquare} />
        <StatCard label="My Jobs" value={MY_JOBS.length} icon={ClipboardList} />
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
            {MY_PROPERTIES.map(p => {
              const job = MY_JOBS.find(j => j.propertyId === p.id)
              return (
                <div key={p.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{p.name}</span>
                    {job?.urgencyLabel && <StatusBadge status={job.urgencyLabel.toLowerCase() as 'urgent' | 'scheduled'} />}
                  </div>
                  {job?.checkoutTime && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Checkout: {job.checkoutTime}</div>}
                  {job?.checkinTime && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Check-in: {job.checkinTime}</div>}
                  <Link href="/staff/new-intake">
                    <button style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: accent, color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                      Start Intake
                    </button>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>

        {/* Today's Tasks */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Today's Tasks</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MY_JOBS.map(j => (
              <div key={j.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 9 }}>
                <input type="checkbox" defaultChecked={j.status === 'done'} style={{ accentColor: accent, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: j.status === 'done' ? 'var(--text-subtle)' : 'var(--text-primary)', textDecoration: j.status === 'done' ? 'line-through' : 'none' }}>{j.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{j.propertyName} · Due {j.dueTime}</div>
                </div>
                <StatusBadge status={j.priority} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
