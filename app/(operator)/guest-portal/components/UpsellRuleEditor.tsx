'use client'

import { Trash2, ExternalLink } from 'lucide-react'
import type { UpsellRule, UpsellCategory } from '@/lib/data/upsells'
import { Button } from '@/components/ui/button'
import { CATEGORY_COLORS, CATEGORY_LABELS } from './UpsellRuleRow'
import Link from 'next/link'

const CONDITION_FIELD_LABELS: Record<string, string> = {
  stay_length: 'Stay length',
  checkin_day: 'Check-in day',
  guests: 'Guests',
  booking_source: 'Booking source',
  group: 'Property group',
  property_type: 'Property type',
}

const OPERATOR_LABELS: Record<string, string> = {
  is: 'is',
  is_not: 'is not',
  '>': '>',
  '<': '<',
  '>=': '>=',
}

interface Props {
  rule: UpsellRule
  onChange: (updated: UpsellRule) => void
  onSave: () => void
  onCancel: () => void
  onDelete: () => void
  isNew?: boolean
}

export default function UpsellRuleEditor({ rule, onChange, onSave, onCancel, onDelete, isNew }: Props) {
  const update = (patch: Partial<UpsellRule>) => onChange({ ...rule, ...patch })

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--border)] px-3 pb-3 pt-3">
      {/* Title */}
      <div>
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Title
        </label>
        <input
          className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          value={rule.title}
          onChange={e => update({ title: e.target.value })}
          placeholder="e.g. Early Check-in"
        />
      </div>

      {/* Price + Currency */}
      <div className="grid grid-cols-[1fr_80px] gap-2">
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Price
          </label>
          <input
            type="number"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            value={rule.price}
            onChange={e => update({ price: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Currency
          </label>
          <select
            className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1.5 text-sm text-[var(--text-primary)] outline-none"
            value={rule.currency}
            onChange={e => update({ currency: e.target.value as UpsellRule['currency'] })}
          >
            <option value="NOK">NOK</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      {/* Category pills */}
      <div>
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Category
        </label>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CATEGORY_LABELS) as UpsellCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => update({ category: cat })}
              className="rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
              style={{
                background: rule.category === cat ? `${CATEGORY_COLORS[cat]}22` : 'var(--bg-surface)',
                color: rule.category === cat ? CATEGORY_COLORS[cat] : 'var(--text-muted)',
                border: `1px solid ${rule.category === cat ? CATEGORY_COLORS[cat] : 'var(--border)'}`,
              }}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* CTA Label */}
      <div>
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
          CTA Label
        </label>
        <input
          className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          value={rule.ctaLabel ?? ''}
          onChange={e => update({ ctaLabel: e.target.value })}
          placeholder="e.g. Add to Stay"
        />
      </div>

      {/* Conditions summary */}
      {rule.conditions.length > 0 && (
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Conditions
          </label>
          <div className="flex flex-wrap gap-1.5">
            {rule.conditions.map(c => (
              <span
                key={c.id}
                className="rounded bg-[var(--bg-surface)] px-2 py-0.5 text-xs text-[var(--text-muted)]"
              >
                {CONDITION_FIELD_LABELS[c.field] ?? c.field} {OPERATOR_LABELS[c.operator] ?? c.operator} {c.value}
              </span>
            ))}
          </div>
          <Link
            href="/operator/upsells"
            className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
          >
            Edit conditions <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Targeting summary */}
      <div>
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Targeting
        </label>
        <span className="rounded bg-[var(--bg-surface)] px-2 py-0.5 text-xs text-[var(--text-muted)]">
          {rule.targeting === 'all'
            ? 'All properties'
            : rule.targeting === 'groups'
              ? `${rule.targetGroupIds.length} group${rule.targetGroupIds.length !== 1 ? 's' : ''}`
              : `${rule.targetPropertyIds.length} propert${rule.targetPropertyIds.length !== 1 ? 'ies' : 'y'}`}
        </span>
        <Link
          href="/operator/upsells"
          className="ml-2 inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
        >
          Edit targeting <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-1">
        <Button size="sm" onClick={onSave}>
          {isNew ? 'Create' : 'Save'}
        </Button>
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        {!isNew && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="ml-auto text-[var(--status-red-fg)]"
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Delete
          </Button>
        )}
      </div>
    </div>
  )
}
