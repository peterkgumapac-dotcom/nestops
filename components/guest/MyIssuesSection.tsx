'use client'
import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { issueStore, type GuestIssue } from '@/lib/guest/issueStore'
import { useGuestTheme } from '@/lib/guest/theme-context'

const STATUS_LABELS: Record<GuestIssue['status'], string> = {
  open:         'Open',
  investigating:'Investigating',
  in_progress:  'In Progress',
  resolved:     'Resolved',
}

const CATEGORY_EMOJIS: Record<string, string> = {
  plumbing: '🔧', electrical: '⚡', cleaning: '🧹',
  appliance: '🏠', structural: '🔨', other: '❓',
  inquiry: '💬', emergency: '🚨',
}

interface Props {
  propertyId: string
}

export default function MyIssuesSection({ propertyId }: Props) {
  const { theme: G } = useGuestTheme()
  const reduced = useReducedMotion()

  const STATUS_COLORS: Record<GuestIssue['status'], string> = {
    open:         G.amber,
    investigating:G.blue,
    in_progress:  G.blue,
    resolved:     G.green,
  }
  const [issues, setIssues] = useState<GuestIssue[]>([])

  useEffect(() => {
    setIssues(issueStore.getIssues(propertyId))
  }, [propertyId])

  if (!issues.length) return null

  return (
    <div style={{ padding: '0 16px' }}>
      <motion.h2
        initial={reduced ? {} : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 22, fontWeight: 600,
          color: G.text, margin: '0 0 14px',
        }}
      >
        My Requests
      </motion.h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {issues.map((issue, i) => (
          <motion.div
            key={issue.id}
            initial={reduced ? {} : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            style={{
              background: G.surface, border: `1px solid ${G.border}`,
              borderRadius: 14, boxShadow: G.shadowSm,
              padding: '14px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>
                  {CATEGORY_EMOJIS[issue.category] ?? '📋'}
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: G.text }}>
                    {issue.description.slice(0, 60)}{issue.description.length > 60 ? '…' : ''}
                  </div>
                  <div style={{ fontSize: 11, color: G.textFaint, marginTop: 2 }}>
                    {issue.trackingId} · {new Date(issue.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div style={{
                flexShrink: 0, padding: '3px 10px', borderRadius: 20,
                background: STATUS_COLORS[issue.status] + '18',
                color: STATUS_COLORS[issue.status],
                fontSize: 11, fontWeight: 600,
                border: `1px solid ${STATUS_COLORS[issue.status]}30`,
              }}>
                {STATUS_LABELS[issue.status]}
              </div>
            </div>
            {issue.operatorResponse && (
              <div style={{
                marginTop: 10, padding: '8px 12px',
                background: G.bg, borderRadius: 8,
                fontSize: 13, color: G.textBody, borderLeft: `3px solid ${G.green}`,
              }}>
                {issue.operatorResponse}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
