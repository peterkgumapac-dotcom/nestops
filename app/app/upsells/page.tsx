'use client'
import { useState } from 'react'
import { ShoppingBag, ChevronRight, Tag, Building2, Users, X, Clock } from 'lucide-react'
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

const REQUEST_STATUS_COLOR: Record<string, string> = {
  pending:  '#d97706',
  approved: '#10b981',
  declined: '#6b7280',
}

type UpsellRequest = {
  id: string
  ruleId: string
  title: string
  price: number
  currency: string
  category: UpsellCategory
  submittedAt: string
  status: 'pending' | 'approved' | 'declined'
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

  const [activeTab, setActiveTab] = useState<'browse' | 'requests'>('browse')
  const [selectedRule, setSelectedRule] = useState<UpsellRule | null>(null)
  const [requests, setRequests] = useState<UpsellRequest[]>([])
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleRequestUpsell = (rule: UpsellRule) => {
    const newRequest: UpsellRequest = {
      id: `req-${Date.now()}`,
      ruleId: rule.id,
      title: rule.title,
      price: rule.price,
      currency: rule.currency,
      category: rule.category,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    }
    setRequests(prev => [newRequest, ...prev])
    setSelectedRule(null)
    showToast('Request submitted — we\'ll confirm shortly')
  }

  const TAB_STYLE = (active: boolean): React.CSSProperties => ({
    padding: '8px 16px', borderRadius: 8, border: 'none',
    background: active ? accent : 'transparent',
    color: active ? '#fff' : 'var(--text-muted)',
    fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer',
    transition: 'all 0.15s',
  })

  return (
    <div>
      <PageHeader
        title="Upsells"
        subtitle="Add-ons and upgrades for your stay"
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        <button style={TAB_STYLE(activeTab === 'browse')} onClick={() => setActiveTab('browse')}>
          Browse Upsells
        </button>
        <button style={TAB_STYLE(activeTab === 'requests')} onClick={() => setActiveTab('requests')}>
          My Requests
          {requests.length > 0 && (
            <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 10, background: activeTab === 'requests' ? 'rgba(255,255,255,0.85)' : accent, color: activeTab === 'requests' ? accent : '#fff' }}>
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {/* Browse Tab */}
      {activeTab === 'browse' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {activeRules.map(rule => {
            const catColor = CATEGORY_COLORS[rule.category]
            const targetLabel = getTargetingLabel(rule)
            return (
              <button
                key={rule.id}
                onClick={() => setSelectedRule(rule)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '14px 16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 0 0 1px ${accent}30` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
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
              </button>
            )
          })}

          {activeRules.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-subtle)', fontSize: 14 }}>
              No active upsell rules.
            </div>
          )}
        </div>
      )}

      {/* My Requests Tab */}
      {activeTab === 'requests' && (
        <div>
          {requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-subtle)', fontSize: 14 }}>
              <ShoppingBag size={32} style={{ color: 'var(--border)', marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
              No requests yet. Browse upsells to make a request.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {requests.map(req => {
                const catColor = CATEGORY_COLORS[req.category]
                return (
                  <div
                    key={req.id}
                    style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: '14px 16px',
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${catColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ShoppingBag size={16} style={{ color: catColor }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{req.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {req.price.toLocaleString()} {req.currency}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>·</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-subtle)' }}>
                          <Clock size={10} />
                          {new Date(req.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                        background: `${REQUEST_STATUS_COLOR[req.status]}18`,
                        color: REQUEST_STATUS_COLOR[req.status],
                        textTransform: 'capitalize', flexShrink: 0,
                      }}
                    >
                      {req.status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Upsell Detail Sheet */}
      {selectedRule && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50 }}
          onClick={() => setSelectedRule(null)}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <div
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'var(--bg-surface)', borderRadius: '16px 16px 0 0',
              padding: '24px', maxHeight: '70vh', overflow: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 20px' }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${CATEGORY_COLORS[selectedRule.category]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag size={20} style={{ color: CATEGORY_COLORS[selectedRule.category] }} />
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedRule.title}</div>
                  <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: `${CATEGORY_COLORS[selectedRule.category]}18`, color: CATEGORY_COLORS[selectedRule.category], fontWeight: 500 }}>
                    {CATEGORY_LABELS[selectedRule.category]}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedRule(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {selectedRule.description && (
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
                {selectedRule.description}
              </p>
            )}

            {!selectedRule.description && (
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
                Enhance your stay with our {selectedRule.title.toLowerCase()} service. Available for your booking period.
              </p>
            )}

            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 10, marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Price</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                {selectedRule.price.toLocaleString()} {selectedRule.currency}
              </span>
            </div>

            <button
              onClick={() => handleRequestUpsell(selectedRule)}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: accent, color: '#fff', fontSize: 15, fontWeight: 700,
                cursor: 'pointer', transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Request Upsell
            </button>
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
