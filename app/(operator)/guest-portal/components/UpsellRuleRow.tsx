'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'
import type { UpsellRule, UpsellCategory } from '@/lib/data/upsells'
import { PROPERTY_GROUPS } from '@/lib/data/upsells'
import ToggleSwitch from '@/components/ui/toggle-switch'

const CATEGORY_COLORS: Record<UpsellCategory, string> = {
  arrival:    '#7c3aed',
  departure:  '#2563eb',
  experience: '#059669',
  transport:  '#d97706',
  extras:     '#db2777',
}

const CATEGORY_LABELS: Record<UpsellCategory, string> = {
  arrival:    'Arrival',
  departure:  'Departure',
  experience: 'Experience',
  transport:  'Transport',
  extras:     'Extras',
}

function getTargetingLabel(rule: UpsellRule): string {
  if (rule.targeting === 'all') return 'All'
  if (rule.targeting === 'groups') {
    if (rule.targetGroupIds.length === 0) return 'No groups'
    return rule.targetGroupIds
      .map(gid => PROPERTY_GROUPS.find(g => g.id === gid)?.name ?? gid)
      .join(', ')
  }
  if (rule.targetPropertyIds.length === 0) return 'No properties'
  return `${rule.targetPropertyIds.length} properties`
}

interface Props {
  rule: UpsellRule
  expanded: boolean
  onExpand: () => void
  onToggleEnabled: () => void
}

export { CATEGORY_COLORS, CATEGORY_LABELS, getTargetingLabel }

export default function UpsellRuleRow({ rule, expanded, onExpand, onToggleEnabled }: Props) {
  const catColor = CATEGORY_COLORS[rule.category]

  return (
    <div
      className="rounded-lg border transition-colors"
      style={{
        borderColor: expanded ? catColor : 'var(--border)',
        opacity: rule.enabled ? 1 : 0.6,
      }}
    >
      <div
        onClick={onExpand}
        className="flex cursor-pointer items-center gap-3 px-3 py-2.5"
      >
        {/* Category dot */}
        <div
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: catColor }}
        />

        {/* Title + price */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate text-sm font-medium text-[var(--text-primary)]">
            {rule.title}
          </span>
          <span className="shrink-0 text-xs text-[var(--text-muted)]">
            {rule.price.toLocaleString()} {rule.currency}
          </span>
        </div>

        {/* Badges */}
        <div className="flex shrink-0 items-center gap-1.5">
          {rule.conditions.length > 0 && (
            <span className="rounded bg-[var(--bg-surface)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">
              {rule.conditions.length} rule{rule.conditions.length > 1 ? 's' : ''}
            </span>
          )}
          <span className="rounded bg-[var(--bg-surface)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">
            {getTargetingLabel(rule)}
          </span>
        </div>

        {/* Toggle */}
        <div onClick={e => e.stopPropagation()}>
          <ToggleSwitch checked={rule.enabled} onChange={onToggleEnabled} />
        </div>

        {/* Expand chevron */}
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[var(--text-subtle)]" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--text-subtle)]" />
        )}
      </div>
    </div>
  )
}
