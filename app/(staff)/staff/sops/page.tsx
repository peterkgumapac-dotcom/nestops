'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Calendar } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
      <div className="flex border-b border-[var(--border)] mb-5">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px cursor-pointer ${
              activeTab === t.key
                ? 'font-semibold text-[var(--text-primary)]'
                : 'font-normal text-[var(--text-muted)] border-transparent'
            }`}
            style={{
              borderBottomColor: activeTab === t.key ? accent : 'transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* SOP Cards */}
      <div className="flex flex-col gap-3">
        {visible.length === 0 && (
          <p className="text-xs text-[var(--text-subtle)] text-center py-10">
            No SOPs in this category.
          </p>
        )}
        {visible.map(sop => (
          <Card key={sop.id} className="card p-4 flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${accent}18` }}
            >
              <FileText size={18} className="text-[var(--accent)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[var(--text-primary)] mb-1">{sop.title}</div>
              <div className="flex items-center gap-2.5">
                <StatusBadge status={sop.category === 'Operations' ? 'in_progress' : sop.category === 'Housekeeping' ? 'active' : 'scheduled'} />
                <span className="text-xs text-[var(--text-subtle)] flex items-center gap-1">
                  <Calendar size={11} /> {sop.date}
                </span>
              </div>
            </div>
            <Button
              onClick={() => setSelectedSop(sop)}
              className={sop.acknowledged ? 'rounded-full px-4' : 'rounded-full px-5'}
              variant={sop.acknowledged ? 'outline' : 'default'}
              size="sm"
            >
              {sop.acknowledged ? 'View' : 'View & Acknowledge'}
            </Button>
          </Card>
        ))}
      </div>

      {/* Dialog */}
      <Dialog open={!!selectedSop} onOpenChange={open => { if (!open) setSelectedSop(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSop?.title}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            {selectedSop?.body}
          </p>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" size="sm">Close</Button>} />
            {selectedSop && !selectedSop.acknowledged && (
              <Button
                onClick={() => setSelectedSop(null)}
                className="rounded-full px-5"
                size="sm"
              >
                Mark as Acknowledged
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
