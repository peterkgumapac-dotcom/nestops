'use client'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { PulseFeedItem } from '@/lib/data/pulseScenes'
import PulseFeedEntry from './PulseFeedEntry'

type FeedTab = 'all' | 'in_progress' | 'issues'

interface PulseFeedProps {
  items: PulseFeedItem[]
}

function filterItems(items: PulseFeedItem[], tab: FeedTab): PulseFeedItem[] {
  if (tab === 'all') return items
  if (tab === 'in_progress') return items.filter(i => i.severity === 'green' || i.severity === 'amber')
  return items.filter(i => i.severity === 'red')
}

const TABS: { key: FeedTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'issues', label: 'Issues' },
]

export default function PulseFeed({ items }: PulseFeedProps) {
  const [tab, setTab] = useState<FeedTab>('all')
  const filtered = filterItems(items, tab).slice(0, 6)

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-0.5 px-2.5 py-2 border-b border-[var(--border)]">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex-1 py-1 text-xs rounded-[5px] border-none cursor-pointer transition-colors',
              tab === t.key
                ? 'font-semibold bg-white text-[var(--text-primary)]'
                : 'font-normal bg-transparent text-[var(--text-muted)]'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Feed entries */}
      <div className="flex flex-col gap-1 p-2 max-h-[320px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {filtered.map((item, i) => (
            <PulseFeedEntry key={item.id} item={item} index={i} isNew={i === 0} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
