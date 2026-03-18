'use client'
import { useState } from 'react'
import { ShoppingBag, ChevronRight, Tag, Building2, Users } from 'lucide-react'
import Link from 'next/link'
import PageHeader from '@/components/shared/PageHeader'
import { useRole } from '@/context/RoleContext'
import { UPSELL_RULES, PROPERTY_GROUPS, type UpsellRule, type UpsellCategory } from '@/lib/data/upsells'
import { PROPERTIES } from '@/lib/data/properties'

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
  if (rule.targeting === 'all') return 'All properties'
  if (rule.targeting === 'groups') {
    if (rule.targetGroupIds.length === 0) return 'No groups selected'
    return rule.targetGroupIds.map(gid => PROPERTY_GROUPS.find(g => g.id === gid)?.name ?? gid).join(', ')
  }
  if (rule.targetPropertyIds.length === 0) return 'No properties selected'
  return rule.targetPropertyIds.map(pid => PROPERTIES.find(p => p.id === pid)?.name ?? pid).join(', ')
}

export default function AppUpsellsPage() {
  const { accent } = useRole()
  const activeRules = UPSELL_RULES.filter(r => r.enabled)

  return (
    <div>
      <PageHeader
        title="Upsells"
        subtitle="Active upsell offers across the portfolio"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {activeRules.map(rule => {
          const catColor = CATEGORY_COLORS[rule.category]
          const targetLabel = getTargetingLabel(rule)
          return (
            <div
              key={rule.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${catColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShoppingBag size={16} style={{ color: catColor }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{rule.title}</span>
                    <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: `${catColor}18`, color: catColor, fontWeight: 500 }}>
                      {CATEGORY_LABELS[rule.category]}
                    </span>
                    {rule.conditions.length > 0 && (
                      <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                        {rule.conditions.length} condition{rule.conditions.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {rule.price.toLocaleString()} {rule.currency}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>·</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {rule.targeting === 'all' ? <Building2 size={11} /> : rule.targeting === 'groups' ? <Tag size={11} /> : <Users size={11} />}
                      {targetLabel}
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
              </div>
            </div>
          )
        })}
      </div>

      {activeRules.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-subtle)', fontSize: 14 }}>
          No active upsell rules.
        </div>
      )}
    </div>
  )
}
