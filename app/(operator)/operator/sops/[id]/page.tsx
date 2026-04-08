'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import { useRole } from '@/context/RoleContext'

const STEPS = ['Draft', 'Pending Approval', 'Approved']
const ACTIVE_STEP = 1 // Pending Approval

const ACK_DATA = [
  { id: '1', name: 'Maria Santos',   status: 'done'    as const, date: '2026-03-02' },
  { id: '2', name: 'Bjorn Larsen',   status: 'done'    as const, date: '2026-03-03' },
  { id: '3', name: 'Fatima Ndiaye',  status: 'pending' as const, date: '—' },
  { id: '4', name: 'Ivan Petrov',    status: 'pending' as const, date: '—' },
]

export default function SopDetailPage() {
  const { accent } = useRole()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div style={{ marginBottom: 8 }}>
        <Link href="/operator/sops" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to SOPs
        </Link>
      </div>

      <PageHeader
        title="Guest Check-In Procedure"
        subtitle="Operations · Last updated 2026-03-01"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${accent}`, background: 'transparent', color: accent, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              Edit
            </button>
            <button style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>
              Archive
            </button>
          </div>
        }
      />

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
        {STEPS.map((step, i) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'unset' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0,
                background: i < ACTIVE_STEP ? accent : i === ACTIVE_STEP ? `${accent}22` : 'var(--bg-elevated)',
                color: i < ACTIVE_STEP ? '#fff' : i === ACTIVE_STEP ? accent : 'var(--text-subtle)',
                border: i === ACTIVE_STEP ? `2px solid ${accent}` : '2px solid transparent',
              }}>
                {i < ACTIVE_STEP ? <Check size={12} /> : i + 1}
              </div>
              <span style={{ fontSize: 13, fontWeight: i === ACTIVE_STEP ? 600 : 400, color: i === ACTIVE_STEP ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < ACTIVE_STEP ? accent : 'var(--border)', margin: '0 12px' }} />
            )}
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="stack-sm" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>
        {/* SOP Body */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 24 }}>
          <div className="label-upper" style={{ marginBottom: 16 }}>SOP Content</div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>1. Purpose</h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 20 }}>
            This procedure ensures all guests receive a consistent, professional check-in experience across all AfterStay properties. Staff should follow each step in sequence and document any deviations.
          </p>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>2. Scope</h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 20 }}>
            Applies to all front-line staff responsible for guest arrivals, including part-time and contract cleaners who manage self-check-in coordination.
          </p>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>3. Procedure</h3>
          <ol style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.9, paddingLeft: 20 }}>
            <li>Confirm booking details in AfterStay 24 hours before arrival.</li>
            <li>Send check-in instructions via the guest messaging template.</li>
            <li>Verify the lockbox code is active and tested.</li>
            <li>Complete the pre-arrival inspection checklist.</li>
            <li>Notify the operator if any issues are found.</li>
          </ol>
        </div>

        {/* Acknowledgement tracker */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="label-upper">Acknowledgements</div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {ACK_DATA.filter(a => a.status === 'done').length}/{ACK_DATA.length}
            </span>
          </div>
          <div>
            {ACK_DATA.map((row, i) => (
              <div key={row.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderBottom: i < ACK_DATA.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: accent, flexShrink: 0 }}>
                  {row.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{row.name}</div>
                  {row.date !== '—' && <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{row.date}</div>}
                </div>
                <StatusBadge status={row.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
