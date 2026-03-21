'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, ShieldX, Clock, CheckCircle2 } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import GuestServicesNav from '@/components/guest-services/GuestServicesNav'
import { useRole } from '@/context/RoleContext'
import { GUEST_VERIFICATIONS, type VerificationStatus } from '@/lib/data/verification'

type FilterStatus = 'all' | 'not_started' | 'in_progress' | 'verified' | 'failed'

const STATUS_CONFIG: Record<VerificationStatus, { label: string; color: string; bg: string }> = {
  not_started: { label: 'Not Started', color: '#6b7280', bg: '#6b728018' },
  in_progress:  { label: 'In Progress', color: '#d97706', bg: '#d9770618' },
  verified:     { label: 'Verified',    color: '#059669', bg: '#05966918' },
  failed:       { label: 'Failed',      color: '#ef4444', bg: '#ef444418' },
  overridden:   { label: 'Overridden',  color: '#6366f1', bg: '#6366f118' },
}

const FILTER_PILLS: { label: string; value: FilterStatus }[] = [
  { label: 'All',         value: 'all' },
  { label: 'Pending',     value: 'not_started' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Verified',    value: 'verified' },
  { label: 'Failed',      value: 'failed' },
]

export default function VerificationsPage() {
  const { accent } = useRole()
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const filtered = GUEST_VERIFICATIONS.filter(v => {
    if (filter === 'all') return true
    if (filter === 'not_started') return v.status === 'not_started'
    return v.status === filter
  })

  return (
    <div>
      <PageHeader
        title="Guest Verifications"
        subtitle={`${GUEST_VERIFICATIONS.length} total · ${GUEST_VERIFICATIONS.filter(v => v.status === 'verified').length} verified`}
      />

      <GuestServicesNav />

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTER_PILLS.map(pill => {
          const active = filter === pill.value
          return (
            <button
              key={pill.value}
              onClick={() => setFilter(pill.value)}
              style={{
                padding: '5px 14px', borderRadius: 20, border: '1px solid',
                borderColor: active ? accent : 'var(--border)',
                background: active ? `${accent}18` : 'transparent',
                color: active ? accent : 'var(--text-muted)',
                fontSize: 12, fontWeight: active ? 600 : 500, cursor: 'pointer',
              }}
            >
              {pill.label}
            </button>
          )
        })}
      </div>

      {/* Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: 14 }}>
        {filtered.map((v, i) => {
          const cfg = STATUS_CONFIG[v.status]
          const completed = v.steps.filter(s => s.status === 'completed').length
          const total = v.steps.length
          const pct = Math.round((completed / total) * 100)

          return (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '14px 16px',
                borderLeft: `4px solid ${cfg.color}`,
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{v.guestName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {v.propertyName} · Check-in {v.checkInDate}
                  </div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20,
                  background: cfg.bg, color: cfg.color, flexShrink: 0, marginLeft: 8,
                }}>
                  {cfg.label}
                </span>
              </div>

              {/* Step progress bar */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {completed}/{total} steps
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color }}>{pct}%</span>
                </div>
                <div style={{ height: 5, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${pct}%`, background: cfg.color,
                    borderRadius: 3, transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>

              {/* Step dots */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                {v.steps.map(step => {
                  const dotColor = step.status === 'completed' ? '#059669'
                    : step.status === 'failed' ? '#ef4444'
                    : step.status === 'skipped' ? '#6b728060'
                    : 'var(--bg-elevated)'
                  return (
                    <div key={step.step} style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: dotColor,
                      border: step.status === 'pending' ? '1px solid var(--border)' : 'none',
                      flexShrink: 0,
                    }} />
                  )
                })}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => showToast(`Reminder sent to ${v.guestName}`)}
                  style={{
                    flex: 1, padding: '6px 0', borderRadius: 7,
                    border: `1px solid ${accent}`, background: `${accent}12`,
                    color: accent, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  Send Reminder
                </button>
                <button
                  onClick={() => showToast(`Override applied for ${v.guestName}`)}
                  style={{
                    flex: 1, padding: '6px 0', borderRadius: 7,
                    border: '1px solid var(--border)', background: 'transparent',
                    color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  Override
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-subtle)', fontSize: 14 }}>
          No verifications match this filter.
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          padding: '10px 18px', borderRadius: 10,
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          fontSize: 13, color: 'var(--text-primary)', fontWeight: 500,
        }}>
          {toastMsg}
        </div>
      )}
    </div>
  )
}
