'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Calendar } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import { useRole } from '@/context/RoleContext'
import type { UserProfile } from '@/context/RoleContext'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog'

interface Sop {
  id: string
  title: string
  category: string
  date: string
  acknowledged: boolean
  body: string
  roles: string[]
}

const SOPS: Sop[] = [
  {
    id: 'sop-1',
    title: 'Guest Check-In Procedure',
    category: 'Operations',
    date: '2026-03-01',
    acknowledged: false,
    body: 'Confirm booking details 24 hours before arrival. Send check-in instructions via the guest messaging template. Verify the lockbox code is active and tested. Complete the pre-arrival inspection checklist.',
    roles: ['Guest'],
  },
  {
    id: 'sop-2',
    title: 'Linen Change Protocol',
    category: 'Housekeeping',
    date: '2026-02-15',
    acknowledged: true,
    body: 'Strip all bedding and towels after each checkout. Use the correct washing programme for each fabric type. Replace with freshly laundered sets from the linen cupboard. Report any damaged items to the operator.',
    roles: ['Cleaning', 'Cleaner'],
  },
  {
    id: 'sop-3',
    title: 'Maintenance Escalation Flow',
    category: 'Maintenance',
    date: '2026-03-10',
    acknowledged: false,
    body: 'For minor issues, log via the AfterStay app and mark priority. For urgent issues (flooding, no heating), call the operator directly and submit a high-priority ticket immediately.',
    roles: ['Maintenance'],
  },
]

type Tab = 'needs' | 'acknowledged' | 'all'

export default function StaffSopsPage() {
  const { accent } = useRole()
  const [activeTab, setActiveTab] = useState<Tab>('needs')
  const [selectedSop, setSelectedSop] = useState<Sop | null>(null)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('afterstay_user')
    if (stored) {
      try { setCurrentUser(JSON.parse(stored)) } catch { /* ignore */ }
    }
  }, [])

  const subRole = currentUser?.subRole ?? ''

  const tabs: { key: Tab; label: string }[] = [
    { key: 'needs', label: 'Needs Acknowledgement' },
    { key: 'acknowledged', label: 'Acknowledged' },
    { key: 'all', label: 'All' },
  ]

  const visible = SOPS.filter(s => {
    if (!s.roles.some(r => subRole.includes(r))) return false
    if (activeTab === 'needs') return !s.acknowledged
    if (activeTab === 'acknowledged') return s.acknowledged
    return true
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader title="My SOPs" subtitle="Standard operating procedures assigned to you" />

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
              fontWeight: activeTab === t.key ? 600 : 400,
              color: activeTab === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === t.key ? `2px solid ${accent}` : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* SOP Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {visible.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--text-subtle)', textAlign: 'center', padding: '40px 0' }}>
            No SOPs in this category.
          </p>
        )}
        {visible.map(sop => (
          <div
            key={sop.id}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10,
              padding: 16, display: 'flex', alignItems: 'center', gap: 16,
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 8, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={18} style={{ color: accent }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>{sop.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: `${accent}18`, color: accent }}>
                  {sop.category}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={11} /> {sop.date}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedSop(sop)}
              style={{
                padding: '8px 14px', borderRadius: 8, border: 'none',
                background: sop.acknowledged ? 'var(--bg-elevated)' : accent,
                color: sop.acknowledged ? 'var(--text-muted)' : '#fff',
                fontSize: 13, fontWeight: 500, cursor: 'pointer', flexShrink: 0,
              }}
            >
              {sop.acknowledged ? 'View' : 'View & Acknowledge'}
            </button>
          </div>
        ))}
      </div>

      {/* Dialog */}
      <Dialog open={!!selectedSop} onOpenChange={open => { if (!open) setSelectedSop(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSop?.title}</DialogTitle>
          </DialogHeader>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            {selectedSop?.body}
          </p>
          <DialogFooter>
            <DialogClose render={<button style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }} />}>
              Close
            </DialogClose>
            {selectedSop && !selectedSop.acknowledged && (
              <button
                onClick={() => setSelectedSop(null)}
                style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
              >
                Mark as Acknowledged
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
