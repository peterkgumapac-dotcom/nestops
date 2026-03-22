'use client'
import { useState } from 'react'
import type { JobProgress, JobPriority, JobPTEStatus } from '@/lib/data/staff'

export interface PipelineMaintenanceCardProps {
  id: string
  title: string
  propertyName: string
  assigneeName: string
  priority: JobPriority
  dueDisplay?: string
  pteStatus?: JobPTEStatus
  progress: JobProgress
  onProgressChange: (p: JobProgress) => void
  beforeDone: boolean
  afterDone: boolean
  onBeforePhoto: () => void
  onAfterPhoto: () => void
  resolution: string
  onResolve: (r: string) => void
}

const STEPS: { key: JobProgress; label: string }[] = [
  { key: 'assigned', label: 'Assigned' },
  { key: 'en_route', label: 'En route' },
  { key: 'on_site',  label: 'On site' },
  { key: 'done',     label: 'Done' },
]

const STEP_INDEX: Record<JobProgress, number> = {
  assigned: 0, en_route: 1, on_site: 2, done: 3,
}

function tagColor(priority: JobPriority): { bg: string; color: string; border: string } {
  if (priority === 'urgent' || priority === 'high') return { bg: 'rgba(226,75,74,0.10)', color: '#e24b4a', border: 'rgba(226,75,74,0.22)' }
  if (priority === 'medium') return { bg: 'rgba(55,138,221,0.10)', color: '#378ADD', border: 'rgba(55,138,221,0.22)' }
  return { bg: 'rgba(156,163,175,0.10)', color: '#9ca3af', border: 'rgba(156,163,175,0.22)' }
}

function cardBorder(priority: JobPriority, pteStatus?: JobPTEStatus): string {
  if (pteStatus === 'denied' || pteStatus === 'expired') return '1px solid rgba(226,75,74,0.30)'
  if (pteStatus === 'pending') return '1px solid rgba(239,159,39,0.25)'
  if (priority === 'urgent' || priority === 'high') return '1px solid rgba(226,75,74,0.20)'
  return '1px solid rgba(255,255,255,0.07)'
}

function stepPillStyle(rel: 'done' | 'active' | 'inactive'): React.CSSProperties {
  if (rel === 'done')   return { background: 'rgba(29,158,117,0.10)', color: '#15d492', border: '1px solid rgba(29,158,117,0.22)' }
  if (rel === 'active') return { background: 'rgba(55,138,221,0.10)', color: '#378ADD', border: '1px solid rgba(55,138,221,0.22)' }
  return { background: '#161b26', color: '#5a5f6b', border: '1px solid rgba(255,255,255,0.07)' }
}

const ARROW = (
  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#5a5f6b', flexShrink: 0 }}>
    <path d="M4 8h8M9 5l3 3-3 3"/>
  </svg>
)

export function PipelineMaintenanceCard({
  title, propertyName, assigneeName, priority, dueDisplay, pteStatus,
  progress, onProgressChange,
  beforeDone, afterDone, onBeforePhoto, onAfterPhoto,
  resolution, onResolve,
}: PipelineMaintenanceCardProps) {
  const tag = tagColor(priority)
  const border = cardBorder(priority, pteStatus)
  const stepIdx = STEP_INDEX[progress]

  const stepSubtitle: Record<JobProgress, string> = {
    assigned: dueDisplay ?? 'Assigned',
    en_route: 'En route',
    on_site:  `On site · Started`,
    done:     'Completed',
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Main card */}
      <div style={{ background: '#111722', border, borderRadius: 12, overflow: 'hidden', marginBottom: resolution === 'needs_vendor' ? 0 : 12 }}>
        {/* Header */}
        <div style={{ padding: '12px 40px 10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Property tag */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 4,
            background: tag.bg, color: tag.color, border: `1px solid ${tag.border}`,
            marginBottom: 7,
          }}>
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2L1.5 13h13L8 2z"/>
            </svg>
            {propertyName}
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#e8e6e1', marginBottom: 3 }}>{title}</div>
          <div style={{ fontSize: 11, color: '#5a5f6b' }}>
            {assigneeName}
            {' · '}
            <span style={{ color: progress === 'en_route' ? '#378ADD' : progress === 'on_site' ? '#ef9f27' : '#5a5f6b' }}>
              {stepSubtitle[progress]}
            </span>
          </div>
        </div>

        {/* Three-dot menu (decorative) */}
        <button style={{
          position: 'absolute', top: 10, right: 10, width: 22, height: 22,
          borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', background: 'transparent', border: 'none', gap: 2, padding: 0,
        }}>
          {[0,1,2].map(i => <span key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: '#5a5f6b', display: 'block' }} />)}
        </button>

        {/* Body */}
        <div style={{ padding: '12px 14px' }}>
          {/* Pipeline bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 12, overflow: 'hidden' }}>
            {STEPS.map((step, i) => {
              const rel: 'done' | 'active' | 'inactive' = i < stepIdx ? 'done' : i === stepIdx ? 'active' : 'inactive'
              return (
                <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 0, flex: 1 }}>
                  <div style={{
                    ...stepPillStyle(rel),
                    padding: '4px 8px', borderRadius: 4, fontSize: 9, fontWeight: 600,
                    whiteSpace: 'nowrap', letterSpacing: '0.02em', flex: 1, textAlign: 'center',
                  }}>
                    {step.label}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ width: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {ARROW}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Step-specific content */}
          {progress === 'assigned' && (
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              <button
                onClick={() => onProgressChange('en_route')}
                style={{
                  padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 500,
                  cursor: 'pointer', border: '1px solid rgba(55,138,221,0.22)',
                  background: 'rgba(55,138,221,0.10)', color: '#378ADD',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>
                En Route
              </button>
            </div>
          )}

          {progress === 'en_route' && (
            <>
              {/* ETA badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 500,
                  background: 'rgba(55,138,221,0.10)', color: '#378ADD', border: '1px solid rgba(55,138,221,0.22)',
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>
                  ETA · En route
                </div>
              </div>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                <button
                  onClick={onBeforePhoto}
                  style={{
                    padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 500,
                    cursor: 'pointer', border: '1px solid rgba(255,255,255,0.12)',
                    background: '#161b26', color: '#9ca3af',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="10" height="10" rx="1.5"/><circle cx="5.5" cy="5.5" r="1"/><path d="M13 10l-3-3L5 13"/></svg>
                  Before photo
                </button>
                <button
                  onClick={() => onProgressChange('on_site')}
                  style={{
                    padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 500,
                    cursor: 'pointer', border: 'none',
                    background: '#1D9E75', color: '#fff',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="5,3 13,8 5,13"/></svg>
                  Start task
                </button>
              </div>
            </>
          )}

          {progress === 'on_site' && (
            <>
              {/* Before / After photo slots */}
              <div style={{ display: 'flex', gap: 7, marginBottom: 10 }}>
                {[
                  { label: 'Before', done: beforeDone, onAdd: onBeforePhoto },
                  { label: 'After',  done: afterDone,  onAdd: onAfterPhoto },
                ].map(slot => (
                  <div key={slot.label}>
                    <div style={{ fontSize: 9, color: '#5a5f6b', marginBottom: 4, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {slot.label}
                    </div>
                    <button
                      onClick={slot.done ? undefined : slot.onAdd}
                      style={{
                        width: 64, height: 48, borderRadius: 7,
                        border: slot.done ? '1.5px solid rgba(29,158,117,0.22)' : '1.5px dashed rgba(255,255,255,0.12)',
                        background: slot.done ? 'rgba(29,158,117,0.10)' : '#161b26',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: 2, cursor: slot.done ? 'default' : 'pointer',
                        fontSize: 9, color: '#5a5f6b',
                      }}
                    >
                      {slot.done ? (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#15d492" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 8l4 4 6-7"/>
                        </svg>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="10" rx="1.5"/><circle cx="8" cy="8" r="2.5"/></svg>
                          Add
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Resolution */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 -14px 10px' }} />
              <div style={{ fontSize: 10, fontWeight: 500, color: '#5a5f6b', textAlign: 'center', marginBottom: 7, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                How was this resolved?
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
                {[
                  { key: 'minor',       label: 'Minor fix',    hoverBg: '#161b26',                   hoverColor: '#e8e6e1', hoverBorder: 'rgba(255,255,255,0.12)' },
                  { key: 'fixed',       label: 'Fixed',        hoverBg: 'rgba(29,158,117,0.10)',      hoverColor: '#15d492', hoverBorder: 'rgba(29,158,117,0.22)' },
                  { key: 'needs_vendor',label: 'Needs vendor', hoverBg: 'rgba(55,138,221,0.10)',      hoverColor: '#378ADD', hoverBorder: 'rgba(55,138,221,0.22)' },
                  { key: 'needs_parts', label: 'Needs parts',  hoverBg: 'rgba(239,159,39,0.10)',      hoverColor: '#ef9f27', hoverBorder: 'rgba(239,159,39,0.22)' },
                ].map(btn => {
                  const isSelected = resolution === btn.key
                  return (
                    <button
                      key={btn.key}
                      onClick={() => onResolve(btn.key)}
                      style={{
                        padding: '7px 6px', borderRadius: 8, fontSize: 10, fontWeight: 500,
                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.12s',
                        background: isSelected ? btn.hoverBg : '#161b26',
                        color: isSelected ? btn.hoverColor : '#9ca3af',
                        border: isSelected ? `1px solid ${btn.hoverBorder}` : '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      {btn.key === 'fixed' && '✓ '}
                      {btn.label}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {progress === 'done' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#15d492', fontWeight: 500 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8l4 4 6-7"/>
              </svg>
              Completed
            </div>
          )}
        </div>
      </div>

      {/* Work Order panel — only when needs_vendor */}
      {resolution === 'needs_vendor' && (
        <div style={{
          background: '#111722', border: '1px solid rgba(239,159,39,0.22)',
          borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden', marginBottom: 12,
        }}>
          {/* WO Header */}
          <div style={{ background: 'rgba(239,159,39,0.10)', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: 'rgba(239,159,39,0.10)', color: '#ef9f27', border: '1px solid rgba(239,159,39,0.22)', marginBottom: 6 }}>
                Work order
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#e8e6e1', marginBottom: 2 }}>Requires vendor</div>
              <div style={{ fontSize: 11, color: '#5a5f6b' }}>{propertyName} · Submitted by {assigneeName}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 500, color: '#ef9f27', fontFamily: "'JetBrains Mono', monospace" }}>—</div>
              <div style={{ fontSize: 10, color: '#5a5f6b' }}>NOK estimate</div>
            </div>
          </div>
          {/* WO Body */}
          <div style={{ padding: '12px 14px' }}>
            {/* Fields */}
            {[
              { label: 'Vendor', value: '' },
              { label: 'Description', value: '' },
              { label: 'Estimate (NOK)', value: '' },
              { label: 'Notes / parts needed', value: '' },
            ].map(field => (
              <div key={field.label} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#5a5f6b', marginBottom: 3 }}>
                  {field.label}
                </div>
                <div style={{
                  width: '100%', background: '#0f1219', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 6, padding: '6px 9px', fontSize: 11, color: '#5a5f6b',
                  fontStyle: 'italic',
                }}>
                  Enter {field.label.toLowerCase()}...
                </div>
              </div>
            ))}
            {/* Actions */}
            <div style={{ display: 'flex', gap: 7, marginTop: 10 }}>
              <button
                onClick={() => onResolve('')}
                style={{
                  flex: 1, padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 500,
                  cursor: 'pointer', border: 'none', background: '#1D9E75', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l4 4 6-7"/></svg>
                Submit
              </button>
              <button
                onClick={() => onResolve('')}
                style={{
                  padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 500,
                  cursor: 'pointer', border: '1px solid rgba(255,255,255,0.12)',
                  background: '#161b26', color: '#9ca3af',
                }}
              >
                Cancel
              </button>
            </div>
            {/* Warning */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, marginTop: 8,
              padding: '7px 10px', background: 'rgba(239,159,39,0.10)',
              borderRadius: 7, border: '1px solid rgba(239,159,39,0.22)',
            }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#ef9f27" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3" strokeLinecap="round"/><circle cx="8" cy="11" r=".6" fill="#ef9f27"/></svg>
              <span style={{ fontSize: 10, color: '#ef9f27' }}>Work order will be sent to supervisor for approval</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
