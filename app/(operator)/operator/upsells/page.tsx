'use client'
import { useState } from 'react'
import { ShoppingBag, Plus, X, ChevronRight, Tag, Building2, Users } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import { useRole } from '@/context/RoleContext'
import { UPSELL_RULES, PROPERTY_GROUPS, type UpsellRule, type UpsellCondition, type UpsellCategory, type ConditionField, type ConditionOperator } from '@/lib/data/upsells'
import { PROPERTIES } from '@/lib/data/properties'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'

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

const CONDITION_FIELDS: { value: ConditionField; label: string }[] = [
  { value: 'stay_length',    label: 'Stay length (nights)' },
  { value: 'checkin_day',    label: 'Check-in day' },
  { value: 'guests',         label: 'Guests (#)' },
  { value: 'booking_source', label: 'Booking source' },
  { value: 'group',          label: 'Property group' },
  { value: 'property_type',  label: 'Property type' },
]

const CONDITION_OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: 'is',     label: 'is' },
  { value: 'is_not', label: 'is not' },
  { value: '>',      label: '>' },
  { value: '<',      label: '<' },
  { value: '>=',     label: '>=' },
]

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--bg-elevated)',
  color: 'var(--text-primary)', fontSize: 13, outline: 'none',
}
const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block',
}
const selectStyle: React.CSSProperties = {
  padding: '7px 10px', borderRadius: 7, border: '1px solid var(--border)',
  background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, outline: 'none',
}

function countTargetedProperties(rule: Pick<UpsellRule, 'targeting' | 'targetGroupIds' | 'targetPropertyIds'>): number {
  if (rule.targeting === 'all') return PROPERTIES.length
  if (rule.targeting === 'groups') {
    const ids = new Set<string>()
    for (const gid of rule.targetGroupIds) {
      const g = PROPERTY_GROUPS.find(g => g.id === gid)
      if (g) g.propertyIds.forEach(id => ids.add(id))
    }
    return ids.size
  }
  return rule.targetPropertyIds.length
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

type EditorTab = 'details' | 'targeting' | 'conditions'

export default function UpsellsPage() {
  const { accent } = useRole()
  const [rules, setRules] = useState<UpsellRule[]>(UPSELL_RULES)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<UpsellRule | null>(null)
  const [editorTab, setEditorTab] = useState<EditorTab>('details')
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const openNew = () => {
    setEditingRule({
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
    })
    setEditorTab('details')
    setDrawerOpen(true)
  }

  const openEdit = (rule: UpsellRule) => {
    setEditingRule({ ...rule })
    setEditorTab('details')
    setDrawerOpen(true)
  }

  const toggleEnabled = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
  }

  const saveRule = () => {
    if (!editingRule) return
    setRules(prev => {
      const exists = prev.find(r => r.id === editingRule.id)
      if (exists) return prev.map(r => r.id === editingRule.id ? editingRule : r)
      return [...prev, editingRule]
    })
    setDrawerOpen(false)
    showToast('Upsell rule saved')
  }

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id))
    setDrawerOpen(false)
    showToast('Upsell rule deleted')
  }

  const updateEditing = (patch: Partial<UpsellRule>) => {
    if (!editingRule) return
    setEditingRule({ ...editingRule, ...patch })
  }

  const addCondition = () => {
    if (!editingRule) return
    const newCond: UpsellCondition = {
      id: Date.now().toString(),
      field: 'stay_length',
      operator: '>=',
      value: '',
    }
    updateEditing({ conditions: [...editingRule.conditions, newCond] })
  }

  const updateCondition = (id: string, patch: Partial<UpsellCondition>) => {
    if (!editingRule) return
    updateEditing({
      conditions: editingRule.conditions.map(c => c.id === id ? { ...c, ...patch } : c),
    })
  }

  const removeCondition = (id: string) => {
    if (!editingRule) return
    updateEditing({ conditions: editingRule.conditions.filter(c => c.id !== id) })
  }

  const toggleGroupTarget = (gid: string) => {
    if (!editingRule) return
    const has = editingRule.targetGroupIds.includes(gid)
    updateEditing({
      targetGroupIds: has
        ? editingRule.targetGroupIds.filter(id => id !== gid)
        : [...editingRule.targetGroupIds, gid],
    })
  }

  const togglePropertyTarget = (pid: string) => {
    if (!editingRule) return
    const has = editingRule.targetPropertyIds.includes(pid)
    updateEditing({
      targetPropertyIds: has
        ? editingRule.targetPropertyIds.filter(id => id !== pid)
        : [...editingRule.targetPropertyIds, pid],
    })
  }

  const editorTabStyle = (tab: EditorTab): React.CSSProperties => ({
    padding: '7px 14px',
    borderRadius: 7,
    border: 'none',
    background: editorTab === tab ? `${accent}22` : 'transparent',
    color: editorTab === tab ? accent : 'var(--text-muted)',
    fontSize: 13,
    fontWeight: editorTab === tab ? 600 : 400,
    cursor: 'pointer',
  })

  const targetCount = editingRule ? countTargetedProperties(editingRule) : 0

  return (
    <div>
      <PageHeader
        title="Upsells"
        subtitle="Rules-based upsell catalog for all properties"
        action={
          <button
            onClick={openNew}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >
            <Plus size={15} /> New Upsell
          </button>
        }
      />

      {/* Catalog list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rules.map(rule => {
          const catColor = CATEGORY_COLORS[rule.category]
          const targetLabel = getTargetingLabel(rule)
          return (
            <div
              key={rule.id}
              onClick={() => openEdit(rule)}
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${rule.enabled ? 'var(--border)' : 'var(--border-subtle)'}`,
                borderRadius: 10,
                padding: '14px 16px',
                cursor: 'pointer',
                opacity: rule.enabled ? 1 : 0.55,
                transition: 'border-color 0.15s, opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = accent)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = rule.enabled ? 'var(--border)' : 'var(--border-subtle)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Category dot */}
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${catColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShoppingBag size={16} style={{ color: catColor }} />
                </div>

                {/* Info */}
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

                {/* Toggle */}
                <button
                  onClick={e => { e.stopPropagation(); toggleEnabled(rule.id) }}
                  style={{ width: 36, height: 20, borderRadius: 10, border: 'none', background: rule.enabled ? accent : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                >
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: rule.enabled ? 19 : 3, transition: 'left 0.2s' }} />
                </button>

                <ChevronRight size={14} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
              </div>
            </div>
          )
        })}
      </div>

      {rules.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-subtle)', fontSize: 14 }}>
          No upsell rules yet. Click "+ New Upsell" to create one.
        </div>
      )}

      {/* Rule Editor Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent style={{ width: 520, maxWidth: '90vw', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <SheetHeader style={{ paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <SheetTitle style={{ color: 'var(--text-primary)' }}>
              {editingRule && rules.find(r => r.id === editingRule.id) ? 'Edit Upsell Rule' : 'New Upsell Rule'}
            </SheetTitle>
          </SheetHeader>

          {editingRule && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0' }}>
              {/* Tab bar */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
                {(['details', 'targeting', 'conditions'] as EditorTab[]).map(tab => (
                  <button key={tab} onClick={() => setEditorTab(tab)} style={editorTabStyle(tab)}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Details Tab */}
              {editorTab === 'details' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Title</label>
                    <input style={inputStyle} value={editingRule.title} onChange={e => updateEditing({ title: e.target.value })} placeholder="e.g. Early Check-in" />
                  </div>
                  <div>
                    <label style={labelStyle}>Description</label>
                    <textarea style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }} value={editingRule.description} onChange={e => updateEditing({ description: e.target.value })} placeholder="What does this upsell include?" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 10 }}>
                    <div>
                      <label style={labelStyle}>Price</label>
                      <input type="number" style={inputStyle} value={editingRule.price} onChange={e => updateEditing({ price: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Currency</label>
                      <select style={{ ...selectStyle, width: '100%' }} value={editingRule.currency} onChange={e => updateEditing({ currency: e.target.value as UpsellRule['currency'] })}>
                        <option value="NOK">NOK</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select style={{ ...selectStyle, width: '100%' }} value={editingRule.category} onChange={e => updateEditing({ category: e.target.value as UpsellCategory })}>
                      {(Object.keys(CATEGORY_LABELS) as UpsellCategory[]).map(cat => (
                        <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>CTA Label</label>
                    <input style={inputStyle} value={editingRule.ctaLabel ?? ''} onChange={e => updateEditing({ ctaLabel: e.target.value })} placeholder="e.g. Add to Stay" />
                  </div>
                  <div>
                    <label style={labelStyle}>Image URL (optional)</label>
                    <input style={inputStyle} value={editingRule.imageUrl ?? ''} onChange={e => updateEditing({ imageUrl: e.target.value })} placeholder="https://..." />
                  </div>
                </div>
              )}

              {/* Targeting Tab */}
              {editorTab === 'targeting' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={labelStyle}>Show upsell for</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(['all', 'groups', 'properties'] as const).map(opt => (
                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 12px', borderRadius: 8, border: `1px solid ${editingRule.targeting === opt ? accent : 'var(--border)'}`, background: editingRule.targeting === opt ? `${accent}0d` : 'transparent' }}>
                          <input
                            type="radio"
                            name="targeting"
                            value={opt}
                            checked={editingRule.targeting === opt}
                            onChange={() => updateEditing({ targeting: opt })}
                            style={{ accentColor: accent }}
                          />
                          <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: editingRule.targeting === opt ? 500 : 400 }}>
                            {opt === 'all' ? 'All Properties' : opt === 'groups' ? 'Property Groups' : 'Specific Properties'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {editingRule.targeting === 'groups' && (
                    <div>
                      <label style={labelStyle}>Select groups</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {PROPERTY_GROUPS.map(g => {
                          const checked = editingRule.targetGroupIds.includes(g.id)
                          return (
                            <label key={g.id} onClick={() => toggleGroupTarget(g.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 12px', borderRadius: 8, border: `1px solid ${checked ? g.color : 'var(--border)'}`, background: checked ? `${g.color}0d` : 'transparent' }}>
                              <div style={{ width: 10, height: 10, borderRadius: '50%', background: g.color, flexShrink: 0 }} />
                              <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>{g.name}</span>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{g.propertyIds.length} props</span>
                              <input type="checkbox" checked={checked} onChange={() => {}} style={{ accentColor: g.color }} />
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {editingRule.targeting === 'properties' && (
                    <div>
                      <label style={labelStyle}>Select properties</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {PROPERTIES.map(p => {
                          const checked = editingRule.targetPropertyIds.includes(p.id)
                          return (
                            <label key={p.id} onClick={() => togglePropertyTarget(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 12px', borderRadius: 8, border: `1px solid ${checked ? accent : 'var(--border)'}`, background: checked ? `${accent}0d` : 'transparent' }}>
                              <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>{p.name}</span>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.city}</span>
                              <input type="checkbox" checked={checked} onChange={() => {}} style={{ accentColor: accent }} />
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Conditions Tab */}
              {editorTab === 'conditions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                    All conditions must match for this upsell to show.
                  </p>

                  {editingRule.conditions.length === 0 && (
                    <div style={{ padding: '16px 12px', borderRadius: 8, background: 'var(--bg-elevated)', textAlign: 'center', fontSize: 13, color: 'var(--text-subtle)' }}>
                      No conditions — upsell shows for all qualifying stays
                    </div>
                  )}

                  {editingRule.conditions.map(cond => (
                    <div key={cond.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                      <select
                        style={selectStyle}
                        value={cond.field}
                        onChange={e => updateCondition(cond.id, { field: e.target.value as ConditionField })}
                      >
                        {CONDITION_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                      <select
                        style={{ ...selectStyle, width: 80 }}
                        value={cond.operator}
                        onChange={e => updateCondition(cond.id, { operator: e.target.value as ConditionOperator })}
                      >
                        {CONDITION_OPERATORS.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                      </select>
                      <input
                        style={{ ...selectStyle, flex: 1 }}
                        value={cond.value}
                        onChange={e => updateCondition(cond.id, { value: e.target.value })}
                        placeholder="Value"
                      />
                      <button onClick={() => removeCondition(cond.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 4 }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={addCondition}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 7, border: `1px dashed var(--border)`, background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', width: 'fit-content' }}
                  >
                    <Plus size={13} /> Add condition
                  </button>
                </div>
              )}
            </div>
          )}

          {editingRule && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              {/* Summary bar */}
              <div style={{ padding: '10px 12px', borderRadius: 8, background: `${accent}0d`, marginBottom: 14, fontSize: 13, color: accent }}>
                This upsell will show for <strong>{targetCount}</strong> {targetCount === 1 ? 'property' : 'properties'}
              </div>

              <SheetFooter style={{ display: 'flex', gap: 8 }}>
                {rules.find(r => r.id === editingRule.id) && (
                  <button
                    onClick={() => deleteRule(editingRule.id)}
                    style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={() => setDrawerOpen(false)}
                  style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveRule}
                  style={{ flex: 2, padding: '9px 14px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Save Rule
                </button>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
