'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useRole } from '@/context/RoleContext'
import { LS_COMPLETE_KEY } from '../setup/types'

export default function SetupBanner() {
  const { accent } = useRole()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const done = localStorage.getItem(LS_COMPLETE_KEY)
      setVisible(done !== 'true')
    } catch {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className="mb-6 flex items-center justify-between rounded-xl border p-5"
      style={{ borderColor: `${accent}40`, background: `${accent}08` }}
    >
      <div>
        <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">Set up your Guest Portal</div>
        <div className="text-xs text-[var(--text-muted)]">
          Walk through a guided setup to configure verification, messaging, upsells, and more.
        </div>
      </div>
      <Link
        href="/guest-portal/setup"
        className="flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: accent }}
      >
        Start Setup <ArrowRight size={14} />
      </Link>
    </div>
  )
}
