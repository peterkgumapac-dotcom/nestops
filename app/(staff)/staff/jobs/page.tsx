'use client'
import { useState } from 'react'
import { Wrench, CheckSquare, ClipboardList, Search } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import AppDrawer from '@/components/shared/AppDrawer'
import Tabs from '@/components/shared/Tabs'
import { JOBS, STAFF_MEMBERS, type Job } from '@/lib/data/staff'
import { useRole } from '@/context/RoleContext'

const CURRENT_STAFF = STAFF_MEMBERS[0]
const MY_JOBS = JOBS.filter(j => CURRENT_STAFF.jobIds.includes(j.id))

const TYPE_ICONS = { cleaning: CheckSquare, maintenance: Wrench, inspection: Search, intake: ClipboardList }

export default function JobsPage() {
  const { accent } = useRole()
  const [activeTab, setActiveTab] = useState('all')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  const tabs = [
    { key: 'all', label: 'All', count: MY_JOBS.length },
    { key: 'pending', label: 'Pending', count: MY_JOBS.filter(j => j.status === 'pending').length },
    { key: 'in_progress', label: 'In Progress', count: MY_JOBS.filter(j => j.status === 'in_progress').length },
    { key: 'done', label: 'Done', count: MY_JOBS.filter(j => j.status === 'done').length },
  ]

  const filtered = MY_JOBS.filter(j => activeTab === 'all' || j.status === activeTab)

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' as const, fontSize: 14, outline: 'none' }

  return (
    <div>
      <PageHeader title="My Jobs" subtitle="Your assigned tasks and jobs" />
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-subtle)' }}>No jobs found</div>}
        {filtered.map(job => {
          const Icon = TYPE_ICONS[job.type]
          return (
            <div
              key={job.id}
              onClick={() => setSelectedJob(job)}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-card)')}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} style={{ color: accent }} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{job.title}</span>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <StatusBadge status={job.priority} />
                      <StatusBadge status={job.status} />
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{job.propertyName} · Due {job.dueTime}</div>
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
