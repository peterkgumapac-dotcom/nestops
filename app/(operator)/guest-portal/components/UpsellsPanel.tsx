'use client'

import { useState } from 'react'
import { DollarSign, Plus } from 'lucide-react'
import { UPSELL_RULES, type UpsellRule, type UpsellCategory } from '@/lib/data/upsells'
import ModuleCard from './ModuleCard'
import UpsellRuleRow, { CATEGORY_LABELS } from './UpsellRuleRow'
import UpsellRuleEditor from './UpsellRuleEditor'
import { Button } from '@/components/ui/button'

const ALL_CATEGORIES: ('all' | UpsellCategory)[] = ['all', 'arrival', 'departure', 'experience', 'transport', 'extras']

function makeNewRule(): UpsellRule {
  return {
    id: `ur${Date.now()}`,
    title: '',
    description: '',
    price: 0,
    currency: 'NOK',
    category: 'extras',
    enabled: true,
    targeting: 'all',
    targetGroupIds: [],
    targetPropertyIds: [],
    conditions: [],
    ctaLabel: 'Add to Stay',
    approvalType: 'auto',
    paymentMode: 'auto_charge',
  }
}

export default function UpsellsPanel() {
  const [enabled, setEnabled] = useState(true)
  const [rules, setRules] = useState<UpsellRule[]>(() => [...UPSELL_RULES])
  const [selectedCategory, setSelectedCategory] = useState<'all' | UpsellCategory>('all')
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null)
  const [editBuffer, setEditBuffer] = useState<UpsellRule | null>(null)
  const [newRule, setNewRule] = useState<UpsellRule | null>(null)

  const activeCount = rules.filter(r => r.enabled).length
  const filteredRules = selectedCategory === 'all'
    ? rules
    : rules.filter(r => r.category === selectedCategory)

  function handleExpand(ruleId: string) {
    if (expandedRuleId === ruleId) {
      setExpandedRuleId(null)
      setEditBuffer(null)
      return
    }
    const rule = rules.find(r => r.id === ruleId)
    if (rule) {
      setExpandedRuleId(ruleId)
      setEditBuffer({ ...rule })
      setNewRule(null)
    }
  }

  function handleToggleEnabled(ruleId: string) {
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
  }

  function handleSave() {
    if (newRule && editBuffer) {
      setRules(prev => [editBuffer, ...prev])
      setNewRule(null)
      setExpandedRuleId(null)
      setEditBuffer(null)
      return
    }
    if (!editBuffer) return
    setRules(prev => prev.map(r => r.id === editBuffer.id ? editBuffer : r))
    setExpandedRuleId(null)
    setEditBuffer(null)
  }

  function handleCancel() {
    setExpandedRuleId(null)
    setEditBuffer(null)
    setNewRule(null)
  }

  function handleDelete() {
    if (!expandedRuleId) return
    setRules(prev => prev.filter(r => r.id !== expandedRuleId))
    setExpandedRuleId(null)
    setEditBuffer(null)
  }

  function handleNew() {
    const rule = makeNewRule()
    setNewRule(rule)
    setEditBuffer(rule)
    setExpandedRuleId(rule.id)
  }

  const configContent = (
    <>
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {ALL_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className="rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
            style={{
              background: selectedCategory === cat ? 'var(--accent-muted, rgba(var(--accent-rgb, 0,0,0), 0.12))' : 'var(--bg-surface)',
              color: selectedCategory === cat ? 'var(--accent)' : 'var(--text-muted)',
              border: `1px solid ${selectedCategory === cat ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Rules list header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Upsell Rules
          </span>
          <span className="rounded-full bg-[var(--bg-surface)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
            {filteredRules.length}
          </span>
        </div>
        <Button size="sm" variant="outline" onClick={handleNew}>
          <Plus className="mr-1 h-3 w-3" />
          New
        </Button>
      </div>

      {/* New rule editor (at top) */}
      {newRule && editBuffer && expandedRuleId === newRule.id && (
        <div className="rounded-lg border border-[var(--accent)]">
          <div className="px-3 py-2 text-xs font-medium text-[var(--accent)]">New Upsell</div>
          <UpsellRuleEditor
            rule={editBuffer}
            onChange={setEditBuffer}
            onSave={handleSave}
            onCancel={handleCancel}
            onDelete={handleCancel}
            isNew
          />
        </div>
      )}

      {/* Rules list */}
      <div className="flex flex-col gap-1.5">
        {filteredRules.map(rule => (
          <div key={rule.id}>
            <UpsellRuleRow
              rule={rule}
              expanded={expandedRuleId === rule.id && !newRule}
              onExpand={() => handleExpand(rule.id)}
              onToggleEnabled={() => handleToggleEnabled(rule.id)}
            />
            {expandedRuleId === rule.id && editBuffer && !newRule && (
              <UpsellRuleEditor
                rule={editBuffer}
                onChange={setEditBuffer}
                onSave={handleSave}
                onCancel={handleCancel}
                onDelete={handleDelete}
              />
            )}
          </div>
        ))}
      </div>

      {filteredRules.length === 0 && (
        <div className="rounded-lg bg-[var(--bg-surface)] px-3 py-4 text-center text-xs text-[var(--text-subtle)]">
          No rules in this category
        </div>
      )}
    </>
  )

  return (
    <ModuleCard
      icon={DollarSign}
      title="Upsells"
      description="Guest add-ons and revenue boosters"
      accentColor="var(--status-amber-fg)"
      enabled={enabled}
      onToggle={setEnabled}
      stats={[
        { label: `${activeCount} active rules` },
        { label: '$2,340 this month' },
      ]}
      configContent={configContent}
      manageLink={{ href: '/operator/upsells', label: 'Open full editor' }}
    />
  )
}
