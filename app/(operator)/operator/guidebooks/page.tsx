'use client'
import { useState } from 'react'
import { BookOpen, Grid, List, Eye, Edit, Globe, QrCode, Copy, Sparkles, Tag, ShoppingBag, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import Tabs from '@/components/shared/Tabs'
import { GUIDEBOOKS, type Guidebook } from '@/lib/data/guidebooks'
import { PROPERTIES } from '@/lib/data/properties'
import { UPSELL_RULES, PROPERTY_GROUPS } from '@/lib/data/upsells'
import { useRole } from '@/context/RoleContext'

export default function GuidebooksPage() {
  const { accent } = useRole()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [editingGuide, setEditingGuide] = useState<Guidebook | null>(null)
  const [editorTab, setEditorTab] = useState('content')
  const [generating, setGenerating] = useState(false)
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [houseRules, setHouseRules] = useState('')
  const [howTo, setHowTo] = useState('')
  const [localTips, setLocalTips] = useState('')
  const [publishedIds, setPublishedIds] = useState<Set<string>>(new Set())
  const [activeTheme, setActiveTheme] = useState<string>('dark')
  const [toast, setToast] = useState('')
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleGenerateAI = async () => {
    if (!editingGuide) return
    setGenerating(true)
    try {
      const res = await fetch('/api/generate-guidebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyName: editingGuide.propertyName, wifiName: editingGuide.wifiName, checkInTime: editingGuide.checkInTime, checkOutTime: editingGuide.checkOutTime }),
      })
      if (!res.body) throw new Error('No stream')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      setWelcomeMessage('')
      setHouseRules('')
      setHowTo('')
      setLocalTips('')
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.field === 'welcome') setWelcomeMessage(v => v + (data.chunk ?? ''))
              if (data.field === 'rules') setHouseRules(v => v + (data.chunk ?? ''))
              if (data.field === 'howto') setHowTo(v => v + (data.chunk ?? ''))
              if (data.field === 'tips') setLocalTips(v => v + (data.chunk ?? ''))
            } catch { /* ignore */ }
          }
        }
      }
    } catch {
      setWelcomeMessage(`Welcome to ${editingGuide.propertyName}! We hope you enjoy your stay. The property has been carefully prepared for your arrival.`)
      setHouseRules('• Please respect quiet hours (10pm–8am)\n• No smoking indoors\n• Maximum occupancy as per booking\n• Report any damages immediately')
      setHowTo('• WiFi: Connect to network and enter password provided\n• Heating: Thermostat located in hallway\n• Checkout: Leave keys on kitchen counter')
      setLocalTips('• Great local restaurant: Ask host for recommendations\n• Grocery store: 5 min walk\n• Public transport: Bus stop at the corner')
    } finally {
      setGenerating(false)
    }
  }

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' as const, fontSize: 14, outline: 'none' }
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }

  const [variablesCopied, setVariablesCopied] = useState('')
  const [conditionRows, setConditionRows] = useState<{ id: string; field: string; operator: string; value: string }[]>([])
  const [conditionLogic, setConditionLogic] = useState<'and' | 'or'>('and')
  const [availableFrom, setAvailableFrom] = useState('3')
  const [expiryMode, setExpiryMode] = useState('checkout')

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token).catch(() => {})
    setVariablesCopied(token)
    setTimeout(() => setVariablesCopied(''), 2000)
  }

  const addConditionRow = () => {
    setConditionRows(prev => [...prev, { id: Date.now().toString(), field: 'channel', operator: 'is', value: '' }])
  }
  const removeConditionRow = (id: string) => setConditionRows(prev => prev.filter(r => r.id !== id))
  const updateConditionRow = (id: string, patch: Partial<{ field: string; operator: string; value: string }>) => {
    setConditionRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r))
  }

  const VARIABLE_CATEGORIES = [
    {
      label: 'Booking',
      tokens: ['{{booking_nights}}', '{{booking_id}}', '{{booking_checkin}}', '{{booking_checkout}}', '{{booking_total}}', '{{booking_source}}'],
    },
    {
      label: 'Guest',
      tokens: ['{{guest_first_name}}', '{{guest_last_name}}', '{{guest_email}}', '{{guest_phone}}', '{{guest_count}}'],
    },
    {
      label: 'Listing',
      tokens: ['{{property_name}}', '{{property_address}}', '{{checkin_time}}', '{{checkout_time}}', '{{host_name}}'],
    },
    {
      label: 'Access & Utility',
      tokens: ['{{wifi_name}}', '{{wifi_password}}', '{{door_code}}', '{{parking_code}}', '{{mailbox_code}}'],
    },
    {
      label: 'Calculated',
      tokens: ['{{days_until_checkin}}', '{{days_since_checkout}}', '{{stay_midpoint}}', '{{local_time}}'],
    },
  ]

  const editorTabs = [
    { key: 'content', label: 'Content' },
    { key: 'sections', label: 'Sections' },
    { key: 'theme', label: 'Theme' },
    { key: 'variables', label: 'Variables' },
    { key: 'conditions', label: 'Conditions' },
    { key: 'upsells', label: 'Upsells' },
    { key: 'share', label: 'Share' },
  ]

  if (editingGuide) {
    return (
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button
            onClick={() => setEditingGuide(null)}
            style={{ fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ← Back to Guidebooks
          </button>
          <h1 className="heading" style={{ fontSize: 20, color: 'var(--text-primary)' }}>{editingGuide.propertyName}</h1>
          <StatusBadge status={editingGuide.status} />
          <button
            onClick={() => {
              if (publishedIds.has(editingGuide.id)) {
                setPublishedIds(prev => { const n = new Set(prev); n.delete(editingGuide.id); return n })
                showToast('Guidebook unpublished')
              } else {
                setPublishedIds(prev => new Set([...prev, editingGuide.id]))
                showToast('Guidebook published')
              }
            }}
            style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: 8, border: 'none', background: publishedIds.has(editingGuide.id) ? 'var(--border)' : accent, color: publishedIds.has(editingGuide.id) ? 'var(--text-muted)' : '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            {publishedIds.has(editingGuide.id) ? 'Unpublish' : 'Publish'}
          </button>
        </div>

        <Tabs tabs={editorTabs} active={editorTab} onChange={setEditorTab} />

        {editorTab === 'content' && (
          <div style={{ maxWidth: 700 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button
                onClick={handleGenerateAI}
                disabled={generating}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: `1px solid ${accent}`, background: `${accent}14`, color: accent, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
              >
                <Sparkles size={14} /> {generating ? 'Generating…' : 'Generate with AI'}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={labelStyle}>WiFi Network</label><input style={inputStyle} defaultValue={editingGuide.wifiName} /></div>
                <div><label style={labelStyle}>WiFi Password</label><input style={inputStyle} defaultValue={editingGuide.wifiPassword} /></div>
                <div><label style={labelStyle}>Check-in Time</label><input style={inputStyle} defaultValue={editingGuide.checkInTime} /></div>
                <div><label style={labelStyle}>Check-out Time</label><input style={inputStyle} defaultValue={editingGuide.checkOutTime} /></div>
              </div>
              <div>
                <label style={labelStyle}>
                  Welcome Message
                  {generating && <span style={{ marginLeft: 8, color: accent, fontSize: 11 }}>● Generating…</span>}
                </label>
                <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} value={welcomeMessage || editingGuide.welcomeMessage} onChange={e => setWelcomeMessage(e.target.value)} placeholder="Welcome guests to your property…" />
              </div>
              <div>
                <label style={labelStyle}>House Rules</label>
                <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} value={houseRules} onChange={e => setHouseRules(e.target.value)} placeholder="List your house rules…" />
              </div>
              <div>
                <label style={labelStyle}>How-To Guides</label>
                <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} value={howTo} onChange={e => setHowTo(e.target.value)} placeholder="Appliances, heating, WiFi instructions…" />
              </div>
              <div>
                <label style={labelStyle}>Local Tips</label>
                <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={localTips} onChange={e => setLocalTips(e.target.value)} placeholder="Restaurants, transport, activities…" />
              </div>
              <button onClick={() => showToast('Changes saved')} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', width: 'fit-content' }}>Save Changes</button>
            </div>
          </div>
        )}

        {editorTab === 'sections' && (
          <div style={{ maxWidth: 500 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Toggle sections on/off and drag to reorder.</p>
            {['Welcome', 'WiFi & Tech', 'Check-in Instructions', 'House Rules', 'Appliances', 'Local Restaurants', 'Transport', 'Emergency Contacts'].map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', cursor: 'grab' }}>
                <span style={{ fontSize: 12, color: 'var(--text-subtle)', width: 16, textAlign: 'center' }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: 14, color: 'var(--text-primary)' }}>{s}</span>
                <div style={{ width: 36, height: 20, borderRadius: 10, background: i < 5 ? accent : 'var(--bg-elevated)', cursor: 'pointer', position: 'relative', border: i < 5 ? 'none' : '1px solid var(--border)' }}>
                  <div style={{ position: 'absolute', top: 2, left: i < 5 ? 'auto' : 2, right: i < 5 ? 2 : 'auto', width: 16, height: 16, borderRadius: '50%', background: '#fff' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {editorTab === 'theme' && (
          <div style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              {['dark', 'light', 'brand'].map(t => (
                <div key={t} onClick={() => setActiveTheme(t)} style={{ flex: 1, padding: 16, borderRadius: 10, border: `2px solid ${activeTheme === t ? accent : 'var(--border)'}`, cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: t === 'dark' ? '#111' : t === 'light' ? '#f5f5f5' : accent, margin: '0 auto 8px', border: '1px solid var(--border)' }} />
                  <span style={{ fontSize: 13, fontWeight: 500, textTransform: 'capitalize', color: 'var(--text-primary)' }}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div><label style={labelStyle}>Accent Color</label><input type="color" defaultValue={accent} style={{ height: 36, borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer' }} /></div>
              <div><label style={labelStyle}>Cover Image URL</label><input style={inputStyle} placeholder="https://..." /></div>
            </div>
          </div>
        )}

        {editorTab === 'variables' && (
          <div style={{ maxWidth: 680 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, margin: '0 0 20px' }}>
              Use these tokens in your guidebook content — they resolve dynamically at display time.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {VARIABLE_CATEGORIES.map(cat => (
                <details key={cat.label} open style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <summary style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', userSelect: 'none', listStyle: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {cat.label}
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>{cat.tokens.length} tokens</span>
                  </summary>
                  <div style={{ padding: '0 16px 14px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {cat.tokens.map(token => (
                      <button
                        key={token}
                        onClick={() => { copyToken(token); showToast('Copied!') }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 6, border: `1px solid ${variablesCopied === token ? accent : 'var(--border)'}`, background: variablesCopied === token ? `${accent}18` : 'var(--bg-elevated)', color: variablesCopied === token ? accent : 'var(--text-primary)', fontFamily: 'monospace', fontSize: 12, cursor: 'pointer', transition: 'all 0.15s' }}
                        title="Click to copy"
                      >
                        {token}
                        <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>⧉</span>
                      </button>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {editorTab === 'conditions' && (
          <div style={{ maxWidth: 580 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, margin: '0 0 20px' }}>
              Control which guests see this guidebook.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Available from */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px' }}>
                <label style={labelStyle}>Show starting X days before check-in</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number"
                    min={0}
                    value={availableFrom}
                    onChange={e => setAvailableFrom(e.target.value)}
                    style={{ width: 72, padding: '8px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
                  />
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>days before check-in</span>
                </div>
              </div>

              {/* Expiry */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px' }}>
                <label style={labelStyle}>Hide after</label>
                <select
                  value={expiryMode}
                  onChange={e => setExpiryMode(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
                >
                  <option value="checkout">Check-out</option>
                  <option value="days_after">X days after check-in</option>
                  <option value="never">Never</option>
                </select>
              </div>

              {/* Display conditions */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Display conditions</div>

                {conditionRows.length === 0 && (
                  <div style={{ padding: '12px', borderRadius: 8, background: 'var(--bg-elevated)', textAlign: 'center', fontSize: 13, color: 'var(--text-subtle)', marginBottom: 12 }}>
                    No conditions — guidebook shows for all guests
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  {conditionRows.map(row => (
                    <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                      <select
                        value={row.field}
                        onChange={e => updateConditionRow(row.id, { field: e.target.value })}
                        style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }}
                      >
                        <option value="channel">Channel</option>
                        <option value="booking_source">Booking source</option>
                        <option value="nights">Nights</option>
                        <option value="guest_type">Guest type</option>
                        <option value="property_group">Property group</option>
                        <option value="season">Season</option>
                      </select>
                      <select
                        value={row.operator}
                        onChange={e => updateConditionRow(row.id, { operator: e.target.value })}
                        style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', width: 72 }}
                      >
                        <option value="is">is</option>
                        <option value="is_not">is not</option>
                        <option value=">">{'>'}</option>
                        <option value="<">{'<'}</option>
                      </select>
                      <input
                        style={{ flex: 1, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }}
                        value={row.value}
                        onChange={e => updateConditionRow(row.id, { value: e.target.value })}
                        placeholder="Value"
                      />
                      <button onClick={() => removeConditionRow(row.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 4 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addConditionRow}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 7, border: '1px dashed var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', marginBottom: 16 }}
                >
                  + Add condition
                </button>

                {/* AND / OR toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Match logic:</span>
                  {(['and', 'or'] as const).map(l => (
                    <button
                      key={l}
                      onClick={() => setConditionLogic(l)}
                      style={{ padding: '4px 12px', borderRadius: 6, border: `1px solid ${conditionLogic === l ? accent : 'var(--border)'}`, background: conditionLogic === l ? `${accent}18` : 'transparent', color: conditionLogic === l ? accent : 'var(--text-muted)', fontSize: 12, fontWeight: conditionLogic === l ? 600 : 400, cursor: 'pointer', textTransform: 'uppercase' }}
                    >
                      {l}
                    </button>
                  ))}
                  <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                    {conditionLogic === 'and' ? 'All conditions must match' : 'Any condition must match'}
                  </span>
                </div>
              </div>

              <button onClick={() => showToast('Conditions saved')} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: 'fit-content' }}>
                Save Conditions
              </button>
            </div>
          </div>
        )}

        {editorTab === 'upsells' && (() => {
          const prop = PROPERTIES.find(p => p.name === editingGuide.propertyName) ?? PROPERTIES.find(p => editingGuide.propertyName.includes(p.name.split(' ')[0]))
          const propId = prop?.id
          const activeRules = UPSELL_RULES.filter(rule => {
            if (!rule.enabled) return false
            if (rule.targeting === 'all') return true
            if (rule.targeting === 'properties') return propId ? rule.targetPropertyIds.includes(propId) : false
            if (rule.targeting === 'groups') {
              if (!propId) return false
              return rule.targetGroupIds.some(gid => {
                const grp = PROPERTY_GROUPS.find(g => g.id === gid)
                return grp?.propertyIds.includes(propId)
              })
            }
            return false
          })
          return (
            <div style={{ maxWidth: 560 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                  Active upsell rules for this property (read-only).
                </p>
                <Link href="/operator/upsells" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: accent, textDecoration: 'none', fontWeight: 500 }}>
                  Manage Upsells <ArrowRight size={13} />
                </Link>
              </div>
              {activeRules.length === 0 ? (
                <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 24, textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13 }}>
                  No active upsell rules apply to this property.{' '}
                  <Link href="/operator/upsells" style={{ color: accent }}>Create rules →</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {activeRules.map(rule => {
                    let reasonLabel = 'All properties'
                    if (rule.targeting === 'groups') {
                      const matchedGroup = rule.targetGroupIds.map(gid => PROPERTY_GROUPS.find(g => g.id === gid)).find(g => g && propId && g.propertyIds.includes(propId))
                      if (matchedGroup) reasonLabel = matchedGroup.name + ' group'
                    } else if (rule.targeting === 'properties') {
                      reasonLabel = 'Specifically targeted'
                    }
                    return (
                      <div key={rule.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <ShoppingBag size={14} style={{ color: accent, flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{rule.title}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                              {rule.price.toLocaleString()} {rule.currency}
                              {rule.conditions.length > 0 && ` · ${rule.conditions.length} condition${rule.conditions.length > 1 ? 's' : ''}`}
                            </div>
                          </div>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: `${accent}18`, color: accent }}>
                            {reasonLabel}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })()}

        {editorTab === 'share' && (
          <div style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                <div className="label-upper" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Globe size={12} /> Shareable URL
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input style={{ ...inputStyle, flex: 1 }} readOnly value={editingGuide.shareUrl} />
                  <button onClick={() => { navigator.clipboard.writeText(editingGuide.shareUrl); showToast('Link copied to clipboard') }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
                    <Copy size={13} /> Copy
                  </button>
                </div>
              </div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                <div className="label-upper" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <QrCode size={12} /> QR Code
                </div>
                <div style={{ width: 120, height: 120, background: 'var(--bg-elevated)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <QrCode size={64} style={{ color: 'var(--text-subtle)' }} />
                </div>
                <button onClick={() => { const a = document.createElement('a'); a.href = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(editingGuide.shareUrl)}`; a.download = `qr-${editingGuide.id}.png`; a.click(); showToast('QR code downloaded') }} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Download QR</button>
              </div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                <div className="label-upper" style={{ marginBottom: 10 }}>Embed Code</div>
                <textarea readOnly style={{ ...inputStyle, minHeight: 80, fontFamily: 'monospace', fontSize: 12, resize: 'none' }} value={`<iframe src="https://${editingGuide.shareUrl}" width="100%" height="600" frameborder="0"></iframe>`} />
              </div>
            </div>
          </div>
        )}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Guidebooks"
        subtitle="Guest property guidebooks"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setView('grid')} style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${view === 'grid' ? accent : 'var(--border)'}`, background: view === 'grid' ? `${accent}1a` : 'transparent', color: view === 'grid' ? accent : 'var(--text-muted)', cursor: 'pointer' }}><Grid size={15} /></button>
            <button onClick={() => setView('list')} style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${view === 'list' ? accent : 'var(--border)'}`, background: view === 'list' ? `${accent}1a` : 'transparent', color: view === 'list' ? accent : 'var(--text-muted)', cursor: 'pointer' }}><List size={15} /></button>
            <button onClick={() => setEditingGuide(GUIDEBOOKS[0])} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>New Guidebook</button>
          </div>
        }
      />

      <div style={{ display: view === 'grid' ? 'grid' : 'flex', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', flexDirection: 'column', gap: 16 }}>
        {GUIDEBOOKS.map(g => {
          const prop = PROPERTIES.find(p => p.id === g.propertyId)
          return (
          <div
            key={g.id}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {/* Thumbnail */}
            {prop?.imageUrl ? (
              <img src={prop.imageUrl} alt={g.propertyName} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ height: 120, background: `linear-gradient(135deg, ${accent}22, ${accent}08)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={28} style={{ color: accent, opacity: 0.4 }} strokeWidth={1} />
              </div>
            )}
            <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={16} style={{ color: accent }} strokeWidth={1.5} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{g.propertyName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Theme: {g.theme}</div>
                </div>
              </div>
              <StatusBadge status={g.status} />
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{g.sectionsCount} sections</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}><Eye size={11} /> {g.viewCount}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: accent, flexShrink: 0 }}>
                {g.agentInitials}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Updated {g.lastUpdated}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setEditingGuide(g)}
                style={{ flex: 1, padding: '7px', borderRadius: 7, border: `1px solid ${accent}`, background: `${accent}14`, color: accent, fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
              >
                <Edit size={12} /> Edit
              </button>
              <button onClick={() => window.open(g.shareUrl, '_blank')} style={{ flex: 1, padding: '7px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <Eye size={12} /> Preview
              </button>
            </div>
            </div>
          </div>
          )
        })}
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
