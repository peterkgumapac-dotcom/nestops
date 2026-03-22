'use client'
import { useState, useEffect } from 'react'
import React from 'react'
import { Wrench, CheckSquare, ClipboardList, Search, Headphones, RotateCcw, AlertCircle, Clock, Package, List, MoreHorizontal } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import AppDrawer from '@/components/shared/AppDrawer'
import Tabs from '@/components/shared/Tabs'
import { TaskCommentSection } from '@/components/comments/TaskCommentSection'
import { JOBS, STAFF_MEMBERS, type Job, type StaffMember } from '@/lib/data/staff'
import { useRole } from '@/context/RoleContext'

const GREEN = '#1D9E75', GREEN2 = '#15d492', GBG = 'rgba(29,158,117,0.10)', GBORDER = 'rgba(29,158,117,0.22)'
const RED = '#e24b4a', RBG = 'rgba(226,75,74,0.10)', RBORDER = 'rgba(226,75,74,0.22)'
const AMBER = '#ef9f27', ABG = 'rgba(239,159,39,0.10)', ABORDER = 'rgba(239,159,39,0.22)'
const BLUE = '#378ADD', BBG = 'rgba(55,138,221,0.10)', BBORDER = 'rgba(55,138,221,0.22)'

const USER_TO_STAFF: Record<string, string> = {
  u3: 's1', u4: 's3', u5: 's4', u7: 's2',
}

// Maintenance staff IDs
const MAINTENANCE_STAFF = new Set(['s3'])
// Guest services staff IDs
const GUEST_STAFF = new Set(['s4'])

const TYPE_ICONS: Record<string, React.ElementType> = {
  cleaning: CheckSquare, maintenance: Wrench, inspection: Search, intake: ClipboardList, guest_services: Headphones,
}

const PIPELINE_STEPS = ['Assigned', 'En route', 'On site', 'Done']

// Map job status → pipeline index
function pipelineIndex(status: string, pipeStep: number): number {
  if (status === 'done') return 3
  if (pipeStep >= 2) return 2 // on site
  if (pipeStep >= 1) return 1 // en route
  return 0
}

function getJobColor(job: Job): { bar: string; bg: string; border: string } {
  if (job.status === 'done') return { bar: GREEN, bg: GBG, border: GBORDER }
  if (job.status === 'pending') return { bar: GREEN, bg: 'transparent', border: 'var(--border)' }
  // in_progress: check due time
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
  if (mins < 30) return `⚠ ${mins} min buffer`
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
    <div onClick={onClick} style={{
      background: 'var(--bg-card)',
      border: `1px solid ${isOverdue ? RBORDER : isAmber ? ABORDER : 'var(--border)'}`,
      borderLeft: `3px solid ${col.bar}`,
      borderRadius: 12, overflow: 'visible', position: 'relative', cursor: 'pointer',
      transition: 'background .15s',
    }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-card)')}
    >
      {/* Three-dot menu */}
      <button onClick={e => { e.stopPropagation(); onMenuToggle() }}
        style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--text-subtle)', zIndex: 2 }}
      >
        <MoreHorizontal size={14} />
      </button>
      {menuOpen && (
        <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 32, right: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, zIndex: 20, width: 180, boxShadow: '0 8px 24px rgba(0,0,0,.5)' }}>
          {MENU_ITEMS.map((item, i) =>
            item === null
              ? <div key={i} style={{ height: 1, background: 'var(--border)', margin: '3px 0' }} />
              : <div key={item.label}
                style={{ padding: '7px 10px', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <item.Icon size={13} style={{ opacity: .6 }} /> {item.label}
              </div>
          )}
        </div>
      )}

      {/* Head */}
      <div style={{ padding: '12px 40px 10px 14px', borderBottom: '1px solid var(--border)', background: isOverdue ? RBG : isAmber ? ABG : 'transparent' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: BBG, color: BLUE, border: `1px solid ${BBORDER}`, marginBottom: 7 }}>
          {job.propertyName}
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 3 }}>{job.title}</div>
        <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Started {job.dueTime ? 'earlier' : '—'}</div>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <span style={{ fontSize: 13, fontWeight: 500, fontFamily: 'monospace', color: col.bar }}>{pct}%</span>
          {buffer && <span style={{ fontSize: 10, fontFamily: 'monospace', color: isOverdue ? RED : isAmber ? AMBER : 'var(--text-subtle)' }}>{buffer}</span>}
        </div>
        <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden', marginBottom: 6, position: 'relative' }}>
          <div style={{
            height: '100%', width: `${pct}%`, background: col.bar, borderRadius: 3, transition: 'width .3s',
            animation: isOverdue ? 'barPulse 1.5s ease infinite' : 'none',
          }} />
          {job.checkinTime && <div style={{ position: 'absolute', top: 0, right: '14%', width: 2, height: '100%', background: 'rgba(255,255,255,0.2)' }} />}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-subtle)', fontFamily: 'monospace', marginBottom: 10 }}>
          <span>Due {job.dueTime ?? '—'}</span>
          {job.checkinTime && <span style={{ color: isAmber ? AMBER : 'inherit' }}>Check-in {job.checkinTime}</span>}
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 500, padding: '3px 9px', borderRadius: 20, background: col.bg, border: `1px solid ${col.border}` }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: col.bar, animation: isOverdue ? 'dotPulse 1.5s ease infinite' : 'none' }} />
          <span style={{ color: col.bar }}>{statusLabel}</span>
        </div>
      </div>
      <style>{`@keyframes barPulse{0%,100%{opacity:1}50%{opacity:.45}}@keyframes dotPulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  )
}

// Maintenance pipeline card
function MaintenanceCard({ job, onClick, pipeStep, onPipeStepChange }: {
  job: Job; onClick: () => void; pipeStep: number; onPipeStepChange: (n: number) => void
}) {
  const currentStep = pipelineIndex(job.status, pipeStep)
  const col = getJobColor(job)

  return (
    <div onClick={onClick} style={{
      background: 'var(--bg-card)', border: `1px solid var(--border)`,
      borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'background .15s',
    }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-card)')}
    >
      {/* Head */}
      <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: col.bg, color: col.bar, border: `1px solid ${col.border}`, marginBottom: 7 }}>
          {job.propertyName}
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 3 }}>{job.title}</div>
        <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Assigned {job.dueTime ?? '—'}</div>
      </div>
      {/* Pipeline */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          {PIPELINE_STEPS.map((step, i) => (
            <React.Fragment key={step}>
              <div style={{
                flex: 1, padding: '4px 8px', borderRadius: 4, fontSize: 9, fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap',
                background: i < currentStep ? GBG : i === currentStep ? BBG : 'var(--bg-elevated)',
                color: i < currentStep ? GREEN2 : i === currentStep ? BLUE : 'var(--text-subtle)',
                border: `1px solid ${i < currentStep ? GBORDER : i === currentStep ? BBORDER : 'var(--border)'}`,
              }}>{step}</div>
              {i < PIPELINE_STEPS.length - 1 && (
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="var(--text-subtle)" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M4 8h8M9 5l3 3-3 3"/></svg>
              )}
            </React.Fragment>
          ))}
        </div>
        {/* CTA */}
        {currentStep === 0 && (
          <button onClick={e => { e.stopPropagation(); onPipeStepChange(1) }}
            style={{ padding: '7px 14px', borderRadius: 8, background: BBG, color: BLUE, border: `1px solid ${BBORDER}`, fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'system-ui,sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Clock size={12} /> En Route
          </button>
        )}
        {currentStep === 1 && (
          <div style={{ display: 'flex', gap: 7 }}>
            <button style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'system-ui,sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Search size={12} /> Before photo
            </button>
            <button onClick={e => { e.stopPropagation(); onPipeStepChange(2) }}
              style={{ padding: '7px 14px', borderRadius: 8, background: GREEN, color: '#fff', border: 'none', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'system-ui,sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              ▶ Start task
            </button>
          </div>
        )}
        {currentStep >= 2 && currentStep < 3 && (
          <button onClick={e => { e.stopPropagation(); onPipeStepChange(3) }}
            style={{ padding: '7px 14px', borderRadius: 8, background: GREEN, color: '#fff', border: 'none', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'system-ui,sans-serif' }}
          >
            Mark Complete
          </button>
        )}
      </div>
    </div>
  )
}

// Generic job card (guest services / default)
function DefaultJobCard({ job, onClick, accent }: { job: Job; onClick: () => void; accent: string }) {
  const Icon = TYPE_ICONS[job.type] ?? CheckSquare
  const borderColor = job.status === 'done' ? GREEN : job.status === 'in_progress' ? AMBER : 'var(--text-subtle)'
  return (
    <div onClick={onClick} style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderLeft: `4px solid ${borderColor}`, borderRadius: 10, padding: 16, cursor: 'pointer', transition: 'background 0.15s',
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
        </div>
      </div>
    </div>
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
    { key: 'fixed', label: '✓ Fixed', hoverColor: GREEN2, hoverBg: GBG, hoverBorder: GBORDER },
    { key: 'vendor', label: 'Needs vendor', hoverColor: BLUE, hoverBg: BBG, hoverBorder: BBORDER },
    { key: 'parts', label: 'Needs parts', hoverColor: AMBER, hoverBg: ABG, hoverBorder: ABORDER },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Pipeline */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {PIPELINE_STEPS.map((step, i) => (
          <React.Fragment key={step}>
            <div style={{
              flex: 1, padding: '4px 8px', borderRadius: 4, fontSize: 9, fontWeight: 600, textAlign: 'center',
              background: i < currentStep ? GBG : i === currentStep ? BBG : 'var(--bg-elevated)',
              color: i < currentStep ? GREEN2 : i === currentStep ? BLUE : 'var(--text-subtle)',
              border: `1px solid ${i < currentStep ? GBORDER : i === currentStep ? BBORDER : 'var(--border)'}`,
            }}>{step}</div>
            {i < PIPELINE_STEPS.length - 1 && (
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="var(--text-subtle)" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M4 8h8M9 5l3 3-3 3"/></svg>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ETA badge (en route) */}
      {currentStep === 1 && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 500, background: BBG, color: BLUE, border: `1px solid ${BBORDER}`, fontFamily: 'monospace', alignSelf: 'flex-start' }}>
          <Clock size={10} /> ETA {job.dueTime ?? '—'} · in ~20 min
        </div>
      )}

      {/* Info grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {([['Status', <StatusBadge key="s" status={job.status} />], ['Priority', <StatusBadge key="p" status={job.priority} />], ['Type', job.type], ['Due Time', job.dueTime ?? '—']] as [string, React.ReactNode][]).map(([k, v], i) => (
          <div key={i}>
            <div className="label-upper" style={{ marginBottom: 4 }}>{k}</div>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Before / After photos (on site) */}
      {currentStep >= 2 && (
        <div>
          <div className="label-upper" style={{ marginBottom: 8 }}>Site Photos</div>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Before', 'After'].map(label => (
              <div key={label}>
                <div style={{ fontSize: 9, color: 'var(--text-subtle)', marginBottom: 4, fontWeight: 500, letterSpacing: '.04em', textTransform: 'uppercase' }}>{label}</div>
                <div
                  onClick={() => setPhotosDone(p => ({ ...p, [label]: !p[label] }))}
                  style={{ width: 64, height: 48, borderRadius: 7, border: `1.5px ${photosDone[label] ? 'solid' : 'dashed'} ${photosDone[label] ? GBORDER : 'var(--border)'}`, background: photosDone[label] ? GBG : 'var(--bg-elevated)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, cursor: 'pointer' }}
                >
                  {photosDone[label]
                    ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={GREEN2} strokeWidth="1.5"><path d="M3 8l4 4 6-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : <>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--text-subtle)" strokeWidth="1.5"><rect x="2" y="3" width="12" height="10" rx="1.5"/><circle cx="8" cy="8" r="2.5"/></svg>
                      <span style={{ fontSize: 9, color: 'var(--text-subtle)' }}>Add</span>
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
          <div style={{ height: 1, background: 'var(--border)', margin: '0 0 10px' }} />
          <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-subtle)', textAlign: 'center', marginBottom: 8, letterSpacing: '.04em', textTransform: 'uppercase' }}>How was this resolved?</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
            {RES_BUTTONS.map(rb => (
              <button key={rb.key} onClick={() => setResolution(resolution === rb.key ? null : rb.key)}
                style={{
                  padding: '7px 6px', borderRadius: 8, fontSize: 10, fontWeight: 500, cursor: 'pointer', textAlign: 'center', fontFamily: 'system-ui,sans-serif',
                  border: `1px solid ${resolution === rb.key ? rb.hoverBorder : 'var(--border)'}`,
                  background: resolution === rb.key ? rb.hoverBg : 'var(--bg-elevated)',
                  color: resolution === rb.key ? rb.hoverColor : 'var(--text-muted)',
                  transition: 'all .12s',
                }}
              >{rb.label}</button>
            ))}
          </div>
        </div>
      )}

      {/* Work order form (needs vendor/parts) */}
      {(resolution === 'vendor' || resolution === 'parts') && (
        <div style={{ background: 'var(--bg-elevated)', border: `1px solid ${ABORDER}`, borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Package size={13} style={{ color: AMBER }} /> Work Order
          </div>
          {[
            { label: 'Vendor', placeholder: 'e.g. Oslo Heating Services' },
            { label: 'Description', placeholder: 'What needs to be done?' },
            { label: 'Estimate (NOK)', placeholder: '0' },
            { label: 'Notes / parts needed', placeholder: 'List parts...' },
          ].map(field => (
            <div key={field.label} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 3 }}>{field.label}</div>
              <input placeholder={field.placeholder} style={{ width: '100%', background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 9px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'system-ui,sans-serif', outline: 'none' }} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 7, marginTop: 10 }}>
            <button style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: GREEN, color: '#fff', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'system-ui,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8l4 4 6-7" strokeLinecap="round" strokeLinejoin="round"/></svg> Approve
            </button>
            <button style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer', fontFamily: 'system-ui,sans-serif' }}>Reject</button>
            <button style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer', fontFamily: 'system-ui,sans-serif' }}>More info</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '7px 10px', background: ABG, borderRadius: 7, border: `1px solid ${ABORDER}` }}>
            <AlertCircle size={12} style={{ color: AMBER }} />
            <span style={{ fontSize: 10, color: AMBER }}>Above threshold · owner approval also required</span>
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <div className="label-upper" style={{ marginBottom: 6 }}>Notes</div>
        <textarea style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', minHeight: 80, resize: 'vertical', fontFamily: 'system-ui,sans-serif' }} placeholder="Add notes about this job…" />
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

  // Close menus on outside click
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-subtle)' }}>No jobs found</div>
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
          // Cleaning card (default)
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
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button onClick={() => setSelectedJob(null)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Close</button>
            {!isMaintenance && (
              <button style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Mark Complete</button>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {([['Status', <StatusBadge key="s" status={selectedJob.status} />], ['Priority', <StatusBadge key="p" status={selectedJob.priority} />], ['Type', selectedJob.type], ['Due Time', selectedJob.dueTime ?? '—']] as [string, React.ReactNode][]).map(([k, v], i) => (
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
                <div className="label-upper" style={{ marginBottom: 6 }}>Notes</div>
                <textarea style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', minHeight: 80, resize: 'vertical', fontFamily: 'system-ui,sans-serif' }} placeholder="Add notes about this job…" />
              </div>
              <TaskCommentSection taskId={selectedJob.id} propertyId={selectedJob.propertyId ?? ''} />
            </div>
          )
        )}
      </AppDrawer>
    </div>
  )
}
