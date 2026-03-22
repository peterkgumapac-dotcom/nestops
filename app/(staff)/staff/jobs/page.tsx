'use client'
import { useState, useEffect } from 'react'
import React from 'react'
import { Wrench, CheckSquare, ClipboardList, Search, Headphones } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import AppDrawer from '@/components/shared/AppDrawer'
import Tabs from '@/components/shared/Tabs'
import { JOBS, STAFF_MEMBERS, type Job, type StaffMember } from '@/lib/data/staff'
import { useRole } from '@/context/RoleContext'

const STATUS_BORDER: Record<string, string> = {
  done: '#1D9E75',
  in_progress: '#ef9f27',
  pending: '#6b7280',
}

const USER_TO_STAFF: Record<string, string> = {
  u3: 's1', u4: 's3', u5: 's4', u7: 's2',
}

const TYPE_ICONS: Record<string, React.ElementType> = { cleaning: CheckSquare, maintenance: Wrench, inspection: Search, intake: ClipboardList, guest_services: Headphones }

export default function JobsPage() {
  const { accent } = useRole()
  const [activeTab, setActiveTab] = useState('all')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nestops_user')
      const profile = stored ? JSON.parse(stored) : null
      const staffId = profile ? USER_TO_STAFF[profile.id] : null
      const staff = staffId
        ? STAFF_MEMBERS.find(s => s.id === staffId) ?? STAFF_MEMBERS[0]
        : STAFF_MEMBERS[0]
      setCurrentStaff(staff)
    } catch {
      setCurrentStaff(STAFF_MEMBERS[0])
    }
  }, [])

  if (!currentStaff) return null

  const myJobs = JOBS.filter(j => currentStaff.jobIds.includes(j.id))

  const tabs = [
    { key: 'all', label: 'All', count: myJobs.length },
    { key: 'pending', label: 'Pending', count: myJobs.filter(j => j.status === 'pending').length },
    { key: 'in_progress', label: 'In Progress', count: myJobs.filter(j => j.status === 'in_progress').length },
    { key: 'done', label: 'Done', count: myJobs.filter(j => j.status === 'done').length },
  ]

  const filtered = myJobs.filter(j => activeTab === 'all' || j.status === activeTab)

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' as const, fontSize: 14, outline: 'none' }

  return (
    <div>
      <PageHeader title="My Jobs" subtitle="Your assigned tasks and jobs" />
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-subtle)' }}>No jobs found</div>}
        {filtered.map((job) => {
          const Icon = TYPE_ICONS[job.type]
          return (
            <div
              key={job.id}
              onClick={() => setSelectedJob(job)}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderLeft: `4px solid ${STATUS_BORDER[job.status] ?? '#6b7280'}`,
                borderRadius: 10, padding: 16, cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-card)')}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} style={{ color: accent }} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{job.title}</span>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <StatusBadge status={job.priority} />
                      <StatusBadge status={job.status} />
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{job.propertyName} · Due {job.dueTime}</div>
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedJob(job) }}
                    style={{ padding: '6px 14px', borderRadius: 7, border: `1px solid ${accent}44`, background: `${accent}12`, color: accent, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Start Job
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Job Detail Drawer */}
      <AppDrawer
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={selectedJob?.title ?? ''}
        subtitle={selectedJob?.propertyName}
        footer={
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button onClick={() => setSelectedJob(null)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Close</button>
            <button style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Mark Complete</button>
          </div>
        }
      >
        {selectedJob && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[['Status', <StatusBadge key="s" status={selectedJob.status} />], ['Priority', <StatusBadge key="p" status={selectedJob.priority} />], ['Type', selectedJob.type], ['Due Time', selectedJob.dueTime]].map(([k, v], i) => (
                <div key={i}>
                  <div className="label-upper" style={{ marginBottom: 4 }}>{k as string}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{v as React.ReactNode}</div>
                </div>
              ))}
            </div>
            {selectedJob.checkoutTime && (
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 12, display: 'flex', gap: 16 }}>
                <div><div className="label-upper" style={{ marginBottom: 2 }}>Checkout</div><div style={{ fontSize: 13 }}>{selectedJob.checkoutTime}</div></div>
                {selectedJob.checkinTime && <div><div className="label-upper" style={{ marginBottom: 2 }}>Next Check-in</div><div style={{ fontSize: 13 }}>{selectedJob.checkinTime}</div></div>}
              </div>
            )}
            <div>
              <div className="label-upper" style={{ marginBottom: 6 }}>Update Status</div>
              <select style={inputStyle}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <div className="label-upper" style={{ marginBottom: 6 }}>Notes</div>
              <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Add notes about this job…" />
            </div>
          </div>
        )}
      </AppDrawer>
    </div>
  )
}
