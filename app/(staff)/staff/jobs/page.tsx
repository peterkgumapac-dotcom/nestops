'use client'
import { useState, useEffect } from 'react'
import React from 'react'
import { Wrench, CheckSquare, ClipboardList, Search, Headphones, RotateCcw, AlertCircle, Clock, Package, List, MoreHorizontal } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import AppDrawer from '@/components/shared/AppDrawer'
import Tabs from '@/components/shared/Tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TaskCommentSection } from '@/components/comments/TaskCommentSection'
import { JOBS, STAFF_MEMBERS, type Job, type StaffMember } from '@/lib/data/staff'
import { useRole } from '@/context/RoleContext'

const GREEN = 'var(--status-green-fg)', GBG = 'var(--status-green-bg)', GBORDER = 'rgba(29,158,117,0.22)'
const RED = 'var(--status-red-fg)', RBG = 'var(--status-red-bg)', RBORDER = 'rgba(226,75,74,0.22)'
const AMBER = 'var(--status-amber-fg)', ABG = 'var(--status-amber-bg)', ABORDER = 'rgba(239,159,39,0.22)'
const BLUE = 'var(--status-blue-fg)', BBG = 'var(--status-blue-bg)', BBORDER = 'rgba(55,138,221,0.22)'

const USER_TO_STAFF: Record<string, string> = {
  u3: 's1', u4: 's3', u5: 's4', u7: 's2',
}

const MAINTENANCE_STAFF = new Set(['s3'])
const GUEST_STAFF = new Set(['s4'])

const TYPE_ICONS: Record<string, React.ElementType> = {
  cleaning: CheckSquare, maintenance: Wrench, inspection: Search, intake: ClipboardList, guest_services: Headphones,
}

const PIPELINE_STEPS = ['Assigned', 'En route', 'On site', 'Done']

function pipelineIndex(status: string, pipeStep: number): number {
  if (status === 'done') return 3
  if (pipeStep >= 2) return 2
  if (pipeStep >= 1) return 1
  return 0
}

function getJobColor(job: Job): { bar: string; bg: string; border: string } {
  if (job.status === 'done') return { bar: GREEN, bg: GBG, border: GBORDER }
  if (job.status === 'pending') return { bar: GREEN, bg: 'transparent', border: 'var(--border)' }
  const now = new Date()
  const dueStr = job.dueTime
  if (dueStr) {
    const [h, m] = dueStr.split(':').map(Number)
    const dueMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h || 0, m || 0).getTime()
    const diff = dueMs - now.getTime()
    const mins = diff / 60000
    if (mins < 0) return { bar: RED, bg: RBG, border: RBORDER }
    if (mins < 30) return { bar: AMBER, bg: ABG, border: ABORDER }
  }
  return { bar: GREEN, bg: GBG, border: GBORDER }
}

function getProgress(job: Job): number {
  if (job.status === 'done') return 100
  if (job.status === 'pending') return 0
  return 60
}

function getBufferLabel(job: Job): string | null {
  if (job.status !== 'in_progress' || !job.dueTime) return null
  const now = new Date()
  const [h, m] = job.dueTime.split(':').map(Number)
  const dueMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h || 0, m || 0).getTime()
  const mins = Math.round((dueMs - now.getTime()) / 60000)
  if (mins < 0) return `Overdue by ${Math.abs(mins)} min`
  if (mins < 30) return `${mins} min buffer`
  return `${mins} min buffer`
}

function getStatusLabel(job: Job): string {
  if (job.status === 'done') return 'Done'
  if (job.status === 'pending') return 'Not started'
  const col = getJobColor(job)
  if (col.bar === RED) return 'Overdue — not complete'
  if (col.bar === AMBER) return 'Approaching deadline'
  return 'In progress'
}

// Pipeline step visualization (shared between card and drawer)
function PipelineSteps({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center">
      {PIPELINE_STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div
            className="flex-1 py-1 px-2 rounded text-[9px] font-semibold text-center whitespace-nowrap"
            style={{
              background: i < currentStep ? GBG : i === currentStep ? BBG : 'var(--bg-elevated)',
              color: i < currentStep ? GREEN : i === currentStep ? BLUE : 'var(--text-subtle)',
              border: `1px solid ${i < currentStep ? GBORDER : i === currentStep ? BBORDER : 'var(--border)'}`,
            }}
          >
            {step}
          </div>
          {i < PIPELINE_STEPS.length - 1 && (
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="var(--text-subtle)" strokeWidth="2" className="shrink-0"><path d="M4 8h8M9 5l3 3-3 3"/></svg>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// Cleaning progress card
function CleaningCard({ job, onClick, menuOpen, onMenuToggle }: {
  job: Job; onClick: () => void; menuOpen: boolean; onMenuToggle: () => void
}) {
  const col = getJobColor(job)
  const pct = getProgress(job)
  const buffer = getBufferLabel(job)
  const statusLabel = getStatusLabel(job)
  const isOverdue = col.bar === RED
  const isAmber = col.bar === AMBER

  const MENU_ITEMS = [
    { label: 'Restart task', Icon: RotateCcw },
    { label: 'Report delay', Icon: AlertCircle },
    { label: 'Report late start', Icon: Clock },
    null,
    { label: 'Report issue', Icon: AlertCircle },
    { label: 'Add consumables', Icon: Package },
    null,
    { label: 'View task history', Icon: List },
  ]

  return (
    <Card
      onClick={onClick}
      className="card overflow-visible relative cursor-pointer border-l-[3px]"
      style={{
        borderLeftColor: col.bar,
        borderColor: isOverdue ? RBORDER : isAmber ? ABORDER : undefined,
      }}
    >
      {/* Three-dot menu */}
      <button
        onClick={e => { e.stopPropagation(); onMenuToggle() }}
        className="absolute top-2.5 right-2.5 w-6 h-6 rounded-[var(--radius-sm)] flex items-center justify-center cursor-pointer bg-transparent border-none text-[var(--text-subtle)] hover:text-[var(--text-muted)] z-[2]"
      >
        <MoreHorizontal size={14} />
      </button>
      {menuOpen && (
        <Card
          onClick={e => e.stopPropagation()}
          className="absolute top-8 right-2.5 z-20 w-[180px] p-1 shadow-lg"
          style={{ boxShadow: '0 8px 24px rgba(0,0,0,.5)' }}
        >
          {MENU_ITEMS.map((item, i) =>
            item === null
              ? <div key={i} className="h-px bg-[var(--border)] my-0.5" />
              : <div
                  key={item.label}
                  className="px-2.5 py-1.5 text-[11px] text-[var(--text-muted)] cursor-pointer rounded-[var(--radius-sm)] flex items-center gap-2 hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  <item.Icon size={13} className="opacity-60" /> {item.label}
                </div>
          )}
        </Card>
      )}

      {/* Head */}
      <div
        className="px-3.5 pt-3 pb-2.5 border-b border-[var(--border)]"
        style={{ background: isOverdue ? RBG : isAmber ? ABG : 'transparent' }}
      >
        <div
          className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded mb-1.5"
          style={{ background: BBG, color: BLUE, border: `1px solid ${BBORDER}` }}
        >
          {job.propertyName}
        </div>
        <div className="text-sm font-medium text-[var(--text-primary)] mb-0.5">{job.title}</div>
        <div className="text-[11px] text-[var(--text-subtle)]">Started {job.dueTime ? 'earlier' : '—'}</div>
      </div>

      {/* Body */}
      <div className="px-3.5 py-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium font-mono" style={{ color: col.bar }}>{pct}%</span>
          {buffer && <span className="text-[10px] font-mono" style={{ color: isOverdue ? RED : isAmber ? AMBER : 'var(--text-subtle)' }}>{buffer}</span>}
        </div>
        <div className="h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden mb-1.5 relative">
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{
              width: `${pct}%`, background: col.bar,
              animation: isOverdue ? 'barPulse 1.5s ease infinite' : 'none',
            }}
          />
          {job.checkinTime && <div className="absolute top-0 right-[14%] w-0.5 h-full bg-white/20" />}
        </div>
        <div className="flex justify-between text-[10px] text-[var(--text-subtle)] font-mono mb-2.5">
          <span>Due {job.dueTime ?? '—'}</span>
          {job.checkinTime && <span style={{ color: isAmber ? AMBER : undefined }}>Check-in {job.checkinTime}</span>}
        </div>
        <div
          className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: col.bg, border: `1px solid ${col.border}` }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: col.bar, animation: isOverdue ? 'dotPulse 1.5s ease infinite' : 'none' }}
          />
          <span style={{ color: col.bar }}>{statusLabel}</span>
        </div>
      </div>
      <style>{`@keyframes barPulse{0%,100%{opacity:1}50%{opacity:.45}}@keyframes dotPulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </Card>
  )
}

// Maintenance pipeline card
function MaintenanceCard({ job, onClick, pipeStep, onPipeStepChange }: {
  job: Job; onClick: () => void; pipeStep: number; onPipeStepChange: (n: number) => void
}) {
  const currentStep = pipelineIndex(job.status, pipeStep)

  return (
    <Card onClick={onClick} className="card overflow-hidden cursor-pointer">
      {/* Head */}
      <div className="px-3.5 pt-3 pb-2.5 border-b border-[var(--border)]">
        <div
          className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded mb-1.5"
          style={{ background: getJobColor(job).bg, color: getJobColor(job).bar, border: `1px solid ${getJobColor(job).border}` }}
        >
          {job.propertyName}
        </div>
        <div className="text-sm font-medium text-[var(--text-primary)] mb-0.5">{job.title}</div>
        <div className="text-[11px] text-[var(--text-subtle)]">Assigned {job.dueTime ?? '—'}</div>
      </div>
      {/* Pipeline */}
      <div className="px-3.5 py-3">
        <div className="mb-3">
          <PipelineSteps currentStep={currentStep} />
        </div>
        {currentStep === 0 && (
          <Button onClick={e => { e.stopPropagation(); onPipeStepChange(1) }} variant="outline" size="sm" className="gap-1.5" style={{ background: BBG, color: BLUE, borderColor: BBORDER }}>
            <Clock size={12} /> En Route
          </Button>
        )}
        {currentStep === 1 && (
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Search size={12} /> Before photo
            </Button>
            <Button onClick={e => { e.stopPropagation(); onPipeStepChange(2) }} size="sm" className="gap-1.5" style={{ background: GREEN, color: '#fff' }}>
              &#9654; Start task
            </Button>
          </div>
        )}
        {currentStep >= 2 && currentStep < 3 && (
          <Button onClick={e => { e.stopPropagation(); onPipeStepChange(3) }} size="sm" style={{ background: GREEN, color: '#fff' }}>
            Mark Complete
          </Button>
        )}
      </div>
    </Card>
  )
}

// Generic job card (guest services / default)
function DefaultJobCard({ job, onClick, accent }: { job: Job; onClick: () => void; accent: string }) {
  const Icon = TYPE_ICONS[job.type] ?? CheckSquare
  const borderColor = job.status === 'done' ? GREEN : job.status === 'in_progress' ? AMBER : 'var(--text-subtle)'
  return (
    <Card onClick={onClick} className="card p-4 cursor-pointer border-l-4" style={{ borderLeftColor: borderColor }}>
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${accent}18` }}
        >
          <Icon size={18} className="text-[var(--accent)]" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="text-sm font-semibold text-[var(--text-primary)]">{job.title}</span>
            <div className="flex gap-1.5 shrink-0">
              <StatusBadge status={job.priority} />
              <StatusBadge status={job.status} />
            </div>
          </div>
          <div className="text-xs text-[var(--text-muted)]">{job.propertyName} · Due {job.dueTime}</div>
        </div>
      </div>
    </Card>
  )
}

// Maintenance detail drawer content
function MaintenanceDrawerContent({ job, pipeStep, onPipeStepChange }: {
  job: Job; pipeStep: number; onPipeStepChange: (n: number) => void
}) {
  const [resolution, setResolution] = useState<string | null>(null)
  const [photosDone, setPhotosDone] = useState<Record<string, boolean>>({})
  const currentStep = pipelineIndex(job.status, pipeStep)

  const RES_BUTTONS = [
    { key: 'minor', label: 'Minor fix', hoverColor: 'var(--text-primary)', hoverBg: 'var(--bg-elevated)', hoverBorder: 'var(--border)' },
    { key: 'fixed', label: '\u2713 Fixed', hoverColor: GREEN, hoverBg: GBG, hoverBorder: GBORDER },
    { key: 'vendor', label: 'Needs vendor', hoverColor: BLUE, hoverBg: BBG, hoverBorder: BBORDER },
    { key: 'parts', label: 'Needs parts', hoverColor: AMBER, hoverBg: ABG, hoverBorder: ABORDER },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Pipeline */}
      <PipelineSteps currentStep={currentStep} />

      {/* ETA badge (en route) */}
      {currentStep === 1 && (
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium font-mono self-start"
          style={{ background: BBG, color: BLUE, border: `1px solid ${BBORDER}` }}
        >
          <Clock size={10} /> ETA {job.dueTime ?? '—'} · in ~20 min
        </div>
      )}

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3">
        {([['Status', <StatusBadge key="s" status={job.status} />], ['Priority', <StatusBadge key="p" status={job.priority} />], ['Type', job.type], ['Due Time', job.dueTime ?? '—']] as [string, React.ReactNode][]).map(([k, v], i) => (
          <div key={i}>
            <div className="label-upper mb-1">{k}</div>
            <div className="text-sm text-[var(--text-primary)] capitalize">{v}</div>
          </div>
        ))}
      </div>

      {/* Before / After photos (on site) */}
      {currentStep >= 2 && (
        <div>
          <div className="label-upper mb-2">Site Photos</div>
          <div className="flex gap-4">
            {['Before', 'After'].map(label => (
              <div key={label}>
                <div className="text-[9px] text-[var(--text-subtle)] mb-1 font-medium tracking-wider uppercase">{label}</div>
                <div
                  onClick={() => setPhotosDone(p => ({ ...p, [label]: !p[label] }))}
                  className="w-16 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors"
                  style={{
                    border: `1.5px ${photosDone[label] ? 'solid' : 'dashed'} ${photosDone[label] ? GBORDER : 'var(--border)'}`,
                    background: photosDone[label] ? GBG : 'var(--bg-elevated)',
                  }}
                >
                  {photosDone[label]
                    ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={GREEN} strokeWidth="1.5"><path d="M3 8l4 4 6-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : <>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--text-subtle)" strokeWidth="1.5"><rect x="2" y="3" width="12" height="10" rx="1.5"/><circle cx="8" cy="8" r="2.5"/></svg>
                      <span className="text-[9px] text-[var(--text-subtle)]">Add</span>
                    </>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolution (on site) */}
      {currentStep >= 2 && (
        <div>
          <div className="h-px bg-[var(--border)] mb-2.5" />
          <div className="label-upper text-center mb-2">How was this resolved?</div>
          <div className="grid grid-cols-4 gap-1.5">
            {RES_BUTTONS.map(rb => (
              <button
                key={rb.key}
                onClick={() => setResolution(resolution === rb.key ? null : rb.key)}
                className="px-1.5 py-1.5 rounded-lg text-[10px] font-medium cursor-pointer text-center transition-all border"
                style={{
                  borderColor: resolution === rb.key ? rb.hoverBorder : 'var(--border)',
                  background: resolution === rb.key ? rb.hoverBg : 'var(--bg-elevated)',
                  color: resolution === rb.key ? rb.hoverColor : 'var(--text-muted)',
                }}
              >
                {rb.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Work order form (needs vendor/parts) */}
      {(resolution === 'vendor' || resolution === 'parts') && (
        <Card className="p-3" style={{ background: 'var(--bg-elevated)', borderColor: ABORDER }}>
          <div className="text-[11px] font-medium text-[var(--text-primary)] mb-2.5 flex items-center gap-1.5">
            <Package size={13} style={{ color: AMBER }} /> Work Order
          </div>
          {[
            { label: 'Vendor', placeholder: 'e.g. Oslo Heating Services' },
            { label: 'Description', placeholder: 'What needs to be done?' },
            { label: 'Estimate (NOK)', placeholder: '0' },
            { label: 'Notes / parts needed', placeholder: 'List parts...' },
          ].map(field => (
            <div key={field.label} className="mb-2">
              <div className="label-upper mb-0.5">{field.label}</div>
              <input
                placeholder={field.placeholder}
                className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-[var(--radius-sm)] px-2 py-1.5 text-[11px] text-[var(--text-muted)] outline-none"
              />
            </div>
          ))}
          <div className="flex gap-1.5 mt-2.5">
            <Button size="sm" className="flex-1 gap-1.5" style={{ background: GREEN, color: '#fff' }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8l4 4 6-7" strokeLinecap="round" strokeLinejoin="round"/></svg> Approve
            </Button>
            <Button variant="outline" size="sm">Reject</Button>
            <Button variant="outline" size="sm">More info</Button>
          </div>
          <div
            className="flex items-center gap-1.5 mt-2 px-2.5 py-1.5 rounded-lg"
            style={{ background: ABG, border: `1px solid ${ABORDER}` }}
          >
            <AlertCircle size={12} style={{ color: AMBER }} />
            <span className="text-[10px]" style={{ color: AMBER }}>Above threshold · owner approval also required</span>
          </div>
        </Card>
      )}

      {/* Notes */}
      <div>
        <div className="label-upper mb-1.5">Notes</div>
        <textarea
          className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm outline-none min-h-[80px] resize-y"
          placeholder="Add notes about this job…"
        />
      </div>

      {/* Comments */}
      <TaskCommentSection taskId={job.id} propertyId={job.propertyId ?? ''} />
    </div>
  )
}

export default function JobsPage() {
  const { accent } = useRole()
  const [activeTab, setActiveTab] = useState('all')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [pipeSteps, setPipeSteps] = useState<Record<string, number>>({})

  useEffect(() => {
    try {
      const stored = localStorage.getItem('afterstay_user')
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

  useEffect(() => {
    function handler() { setOpenMenu(null) }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  if (!currentStaff) return null

  const isMaintenance = MAINTENANCE_STAFF.has(currentStaff.id)
  const isGuest = GUEST_STAFF.has(currentStaff.id)

  const myJobs = JOBS.filter(j => currentStaff.jobIds.includes(j.id))

  const tabs = [
    { key: 'all', label: 'All', count: myJobs.length },
    { key: 'pending', label: 'Pending', count: myJobs.filter(j => j.status === 'pending').length },
    { key: 'in_progress', label: 'In Progress', count: myJobs.filter(j => j.status === 'in_progress').length },
    { key: 'done', label: 'Done', count: myJobs.filter(j => j.status === 'done').length },
  ]

  const filtered = myJobs.filter(j => activeTab === 'all' || j.status === activeTab)

  const selectedPipeStep = selectedJob ? (pipeSteps[selectedJob.id] ?? 0) : 0

  return (
    <div onClick={() => setOpenMenu(null)}>
      <PageHeader title={isMaintenance ? 'My Jobs' : 'My Cleanings'} subtitle="Your assigned tasks and jobs" />
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <div className="flex flex-col gap-2.5">
        {filtered.length === 0 && (
          <div className="py-10 text-center text-[var(--text-subtle)] text-sm">No jobs found</div>
        )}
        {filtered.map(job => {
          if (isMaintenance) {
            return (
              <MaintenanceCard key={job.id} job={job}
                onClick={() => setSelectedJob(job)}
                pipeStep={pipeSteps[job.id] ?? 0}
                onPipeStepChange={n => setPipeSteps(prev => ({ ...prev, [job.id]: n }))}
              />
            )
          }
          if (isGuest) {
            return <DefaultJobCard key={job.id} job={job} onClick={() => setSelectedJob(job)} accent={accent} />
          }
          return (
            <CleaningCard key={job.id} job={job}
              onClick={() => setSelectedJob(job)}
              menuOpen={openMenu === job.id}
              onMenuToggle={() => setOpenMenu(openMenu === job.id ? null : job.id)}
            />
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
          <div className="flex gap-2 w-full">
            <Button onClick={() => setSelectedJob(null)} variant="outline" className="flex-1">Close</Button>
            {!isMaintenance && (
              <Button className="flex-1 rounded-full">Mark Complete</Button>
            )}
          </div>
        }
      >
        {selectedJob && (
          isMaintenance ? (
            <MaintenanceDrawerContent
              job={selectedJob}
              pipeStep={selectedPipeStep}
              onPipeStepChange={n => {
                setPipeSteps(prev => ({ ...prev, [selectedJob.id]: n }))
              }}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                {([['Status', <StatusBadge key="s" status={selectedJob.status} />], ['Priority', <StatusBadge key="p" status={selectedJob.priority} />], ['Type', selectedJob.type], ['Due Time', selectedJob.dueTime ?? '—']] as [string, React.ReactNode][]).map(([k, v], i) => (
                  <div key={i}>
                    <div className="label-upper mb-1">{k as string}</div>
                    <div className="text-sm text-[var(--text-primary)] capitalize">{v as React.ReactNode}</div>
                  </div>
                ))}
              </div>
              {selectedJob.checkoutTime && (
                <Card className="p-3 flex gap-4" style={{ background: 'var(--bg-elevated)' }}>
                  <div><div className="label-upper mb-0.5">Checkout</div><div className="text-sm">{selectedJob.checkoutTime}</div></div>
                  {selectedJob.checkinTime && <div><div className="label-upper mb-0.5">Next Check-in</div><div className="text-sm">{selectedJob.checkinTime}</div></div>}
                </Card>
              )}
              <div>
                <div className="label-upper mb-1.5">Notes</div>
                <textarea
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm outline-none min-h-[80px] resize-y"
                  placeholder="Add notes about this job…"
                />
              </div>
              <TaskCommentSection taskId={selectedJob.id} propertyId={selectedJob.propertyId ?? ''} />
            </div>
          )
        )}
      </AppDrawer>
    </div>
  )
}
