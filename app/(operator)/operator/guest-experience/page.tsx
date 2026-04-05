'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen, ShieldCheck, AlertCircle, Plus, Eye, Edit,
  Globe, QrCode, ToggleLeft, ToggleRight, ChevronRight,
  Sparkles, Check, X, ExternalLink, Users, KeyRound, Copy,
  Zap, Clock, Building2,
} from 'lucide-react'
import Link from 'next/link'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import AppDrawer from '@/components/shared/AppDrawer'
import { useRole } from '@/context/RoleContext'
import { GUIDEBOOKS } from '@/lib/data/guidebooks'
import { PROPERTIES } from '@/lib/data/properties'

type Tab = 'portal' | 'guidebooks' | 'issues'

type BookingSource = 'all' | 'airbnb' | 'direct' | 'vrbo' | 'booking_com'

interface VerificationGate {
  id: string
  step: string
  label: string
  description: string
  enabled: boolean
  conditions: { source: BookingSource; minNights?: number }[]
}

interface PortalConfig {
  id: string
  propertyId: string
  propertyName: string
  gatesEnabled: VerificationGate[]
  doorCodeReveal: 'immediate' | 'verified_only' | 'time_gated'
  brandColor: string
  shareUrl: string
  guestsVerified: number
}

const DEFAULT_GATES: VerificationGate[] = [
  { id: 'id', step: 'id_verification', label: 'ID Verification', description: 'Guest uploads a photo of their government-issued ID', enabled: true, conditions: [{ source: 'direct' }, { source: 'vrbo' }] },
  { id: 'selfie', step: 'selfie_match', label: 'Selfie Match', description: 'Guest takes a selfie that is matched against their ID', enabled: false, conditions: [{ source: 'direct' }] },
  { id: 'agreement', step: 'rental_agreement', label: 'Rental Agreement', description: 'Guest reads and digitally signs the rental agreement', enabled: true, conditions: [{ source: 'all' }] },
  { id: 'rules', step: 'house_rules', label: 'House Rules', description: 'Guest acknowledges house rules with explicit acceptance', enabled: true, conditions: [{ source: 'all' }] },
  { id: 'deposit', step: 'security_deposit', label: 'Security Deposit', description: 'Guest authorises a pre-authorisation hold via Stripe', enabled: true, conditions: [{ source: 'direct' }, { source: 'vrbo' }] },
]

const PORTAL_CONFIGS: PortalConfig[] = [
  { id: 'pc1', propertyId: 'p1', propertyName: 'Sunset Villa', gatesEnabled: DEFAULT_GATES, doorCodeReveal: 'verified_only', brandColor: '#7c3aed', shareUrl: 'afterstay.io/stay/sunset-villa', guestsVerified: 24 },
  { id: 'pc2', propertyId: 'p2', propertyName: 'Harbor Studio', gatesEnabled: DEFAULT_GATES.map(g => ({ ...g, enabled: g.id !== 'selfie' })), doorCodeReveal: 'verified_only', brandColor: '#0284c7', shareUrl: 'afterstay.io/stay/harbor-studio', guestsVerified: 18 },
  { id: 'pc3', propertyId: 'p3', propertyName: 'Downtown Loft', gatesEnabled: DEFAULT_GATES.map(g => ({ ...g, enabled: g.id !== 'selfie' && g.id !== 'deposit' })), doorCodeReveal: 'time_gated', brandColor: '#059669', shareUrl: 'afterstay.io/stay/downtown-loft', guestsVerified: 12 },
]

const BOOKING_SOURCE_LABELS: Record<BookingSource, string> = {
  all: 'All Sources', airbnb: 'Airbnb', direct: 'Direct', vrbo: 'VRBO', booking_com: 'Booking.com',
}

const GUEST_ISSUES = [
  { id: 'gi1', guestName: 'Erik Andersen', property: 'Sunset Villa', issue: 'Heating not working in bedroom', pteWindow: 'Tomorrow 10:00–12:00', status: 'draft_task', createdAt: '2026-03-20T09:30:00' },
  { id: 'gi2', guestName: 'Sofia Johansson', property: 'Harbor Studio', issue: 'WiFi keeps dropping in bedroom', pteWindow: null, status: 'open', createdAt: '2026-03-20T08:15:00' },
  { id: 'gi3', guestName: 'Lars Nielsen', property: 'Downtown Loft', issue: 'Dishwasher not draining', pteWindow: 'Today 15:00–17:00', status: 'assigned', createdAt: '2026-03-19T18:45:00' },
]

const ISSUE_STATUS: Record<string, { label: string; color: string }> = {
  draft_task: { label: 'Draft Task', color: '#6366f1' },
  open:       { label: 'Open',       color: '#ef4444' },
  assigned:   { label: 'Assigned',   color: '#d97706' },
  resolved:   { label: 'Resolved',   color: '#10b981' },
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--bg-elevated)',
  color: 'var(--text-primary)', fontSize: 13, outline: 'none',
}

export default function GuestExperiencePage() {
  const { accent } = useRole()
  const [tab, setTab] = useState<Tab>('portal')
  const [selectedPortal, setSelectedPortal] = useState<PortalConfig>(PORTAL_CONFIGS[0])
  const [portalConfigs, setPortalConfigs] = useState(PORTAL_CONFIGS)
  const [editingGate, setEditingGate] = useState<string | null>(null)
  const [gateConditions, setGateConditions] = useState<Record<string, BookingSource[]>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [newGuideDrawer, setNewGuideDrawer] = useState(false)
  const [newGuideProperty, setNewGuideProperty] = useState('')
  const [generating, setGenerating] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const currentConfig = portalConfigs.find(p => p.id === selectedPortal.id) ?? selectedPortal

  const toggleGate = (gateId: string) => {
    setPortalConfigs(prev => prev.map(pc => pc.id === currentConfig.id ? {
      ...pc,
      gatesEnabled: pc.gatesEnabled.map(g => g.id === gateId ? { ...g, enabled: !g.enabled } : g),
    } : pc))
  }

  const copyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(`https://${url}`).catch(() => showToast('Copy failed — try manually'))
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleGenerateGuide = async () => {
    if (!newGuideProperty) return
    setGenerating(true)
    await new Promise(r => setTimeout(r, 1200))
    setGenerating(false)
    setNewGuideDrawer(false)
    showToast('Guidebook generated and saved as draft')
  }

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'portal', label: 'Portal Builder', icon: ShieldCheck },
    { key: 'guidebooks', label: 'Guidebooks', icon: BookOpen },
    { key: 'issues', label: 'Guest-Initiated Issues', icon: AlertCircle },
  ]

  return (
    <div>
      <PageHeader
        title="Guest Experience"
        subtitle="Verification gates · Guidebooks · Guest-initiated issues"
        action={
          tab === 'guidebooks' ? (
            <button onClick={() => setNewGuideDrawer(true)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> New Guidebook
            </button>
          ) : undefined
        }
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 28 }}>
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 18px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                background: 'transparent',
                color: tab === t.key ? accent : 'var(--text-muted)',
                borderBottom: `2px solid ${tab === t.key ? accent : 'transparent'}`,
                transition: 'all 0.15s', marginBottom: -1,
              }}
            >
              <Icon size={14} />{t.label}
            </button>
          )
        })}
      </div>

      {/* ── PORTAL BUILDER ── */}
      {tab === 'portal' && (
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20 }}>
          {/* Property selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: 4 }}>Properties</div>
            {portalConfigs.map(pc => (
              <button
                key={pc.id}
                onClick={() => setSelectedPortal(pc)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  borderRadius: 8, border: `1px solid ${selectedPortal.id === pc.id ? accent : 'var(--border)'}`,
                  background: selectedPortal.id === pc.id ? `${accent}10` : 'var(--bg-card)',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: pc.brandColor, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pc.propertyName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 1 }}>{pc.guestsVerified} verified</div>
                </div>
              </button>
            ))}
          </div>

          {/* Gate config */}
          <div>
            {/* Portal link */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', marginBottom: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
              <Globe size={14} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: accent, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>https://{currentConfig.shareUrl}</span>
              <button onClick={() => copyLink(currentConfig.shareUrl, currentConfig.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-elevated)', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer' }}>
                {copied === currentConfig.id ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: `1px solid ${accent}40`, background: `${accent}10`, fontSize: 11, color: accent, cursor: 'pointer' }}>
                <QrCode size={11} /> QR
              </button>
            </div>

            {/* Door code reveal setting */}
            <div style={{ padding: '14px 16px', marginBottom: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                <KeyRound size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />Door Code Reveal
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['immediate', 'verified_only', 'time_gated'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setPortalConfigs(prev => prev.map(pc => pc.id === currentConfig.id ? { ...pc, doorCodeReveal: mode } : pc))}
                    style={{
                      padding: '6px 12px', borderRadius: 8, border: `1px solid ${currentConfig.doorCodeReveal === mode ? accent : 'var(--border)'}`,
                      background: currentConfig.doorCodeReveal === mode ? `${accent}15` : 'var(--bg-elevated)',
                      color: currentConfig.doorCodeReveal === mode ? accent : 'var(--text-muted)',
                      fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    }}
                  >
                    {mode === 'immediate' ? 'Always' : mode === 'verified_only' ? 'After Verification' : 'Time-Gated'}
                  </button>
                ))}
              </div>
            </div>

            {/* Verification gates */}
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
              Verification Gates
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentConfig.gatesEnabled.map(gate => (
                <div
                  key={gate.id}
                  style={{
                    background: 'var(--bg-card)', border: `1px solid ${gate.enabled ? `${accent}30` : 'var(--border)'}`,
                    borderRadius: 10, padding: '14px 16px',
                    opacity: gate.enabled ? 1 : 0.6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: gate.enabled ? 10 : 0 }}>
                    <button
                      onClick={() => toggleGate(gate.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: gate.enabled ? accent : 'var(--text-subtle)' }}
                    >
                      {gate.enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{gate.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{gate.description}</div>
                    </div>
                    {gate.enabled && (
                      <button
                        onClick={() => setEditingGate(editingGate === gate.id ? null : gate.id)}
                        style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-elevated)', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        Conditions
                      </button>
                    )}
                  </div>
                  {gate.enabled && editingGate === gate.id && (
                    <div style={{ paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 8 }}>Apply this gate when booking source is:</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(['all', 'airbnb', 'direct', 'vrbo', 'booking_com'] as BookingSource[]).map(src => {
                          const currentSources = gateConditions[gate.id] ?? gate.conditions.map(c => c.source)
                          const active = currentSources.includes(src)
                          return (
                            <button
                              key={src}
                              onClick={() => {
                                const cur = gateConditions[gate.id] ?? gate.conditions.map(c => c.source)
                                const next = active ? cur.filter(s => s !== src) : [...cur, src]
                                setGateConditions(prev => ({ ...prev, [gate.id]: next }))
                              }}
                              style={{
                                padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                border: `1px solid ${active ? accent : 'var(--border)'}`,
                                background: active ? `${accent}15` : 'transparent',
                                color: active ? accent : 'var(--text-muted)',
                              }}
                            >
                              {BOOKING_SOURCE_LABELS[src]}
                            </button>
                          )
                        })}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 10 }}>
                        Example: Enable Deposit for Direct and VRBO only. Disable for Airbnb (they handle deposits).
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── GUIDEBOOKS ── */}
      {tab === 'guidebooks' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {GUIDEBOOKS.map(guide => {
            const property = PROPERTIES.find(p => p.id === guide.propertyId)
            return (
              <div key={guide.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{guide.propertyName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{guide.sectionsCount} sections · {guide.viewCount} views</div>
                    </div>
                    <StatusBadge status={guide.status} />
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                      Check-in {guide.checkInTime}
                    </span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                      {guide.requiresVerification ? '🔒 Verification required' : '🔓 Open access'}
                    </span>
                  </div>
                </div>
                <div style={{ padding: '12px 18px', display: 'flex', gap: 8 }}>
                  <a
                    href={`/guest/guidebook/${guide.id}`}
                    target="_blank"
                    rel="noopener"
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-elevated)', fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', cursor: 'pointer' }}
                  >
                    <Eye size={12} /> Preview
                  </a>
                  <Link
                    href="/operator/guidebooks"
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, border: `1px solid ${accent}40`, background: `${accent}10`, fontSize: 12, color: accent, textDecoration: 'none' }}
                  >
                    <Edit size={12} /> Edit
                  </Link>
                  <button
                    onClick={() => copyLink(guide.shareUrl, guide.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 'auto' }}
                  >
                    {copied === guide.id ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Share</>}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── GUEST-INITIATED ISSUES ── */}
      {tab === 'issues' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ padding: '10px 14px', borderRadius: 8, background: `${accent}08`, border: `1px solid ${accent}20`, fontSize: 12, color: 'var(--text-muted)' }}>
            Guests can report issues directly from their portal. Issues with access needs automatically create a PTE request with the guest's preferred entry window.
          </div>
          {GUEST_ISSUES.map(issue => {
            const cfg = ISSUE_STATUS[issue.status]
            const ago = (() => {
              const diff = Date.now() - new Date(issue.createdAt).getTime()
              const hrs = Math.floor(diff / 3600000)
              return hrs > 0 ? `${hrs}h ago` : `${Math.floor(diff / 60000)}m ago`
            })()
            return (
              <div key={issue.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{issue.issue}</div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                        <Building2 size={11} />{issue.property}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                        <Users size={11} />{issue.guestName}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-subtle)' }}>
                        <Clock size={11} />{ago}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: `${cfg.color}15`, color: cfg.color, flexShrink: 0 }}>
                    {cfg.label}
                  </span>
                </div>
                {issue.pteWindow && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: '#10b98110', border: '1px solid #10b98130' }}>
                    <KeyRound size={12} color="#10b981" />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#10b981' }}>Guest provided PTE window</div>
                      <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{issue.pteWindow}</div>
                    </div>
                    <Link href="/operator/operations" style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                      View PTE <ChevronRight size={12} />
                    </Link>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: accent, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Assign Staff
                  </button>
                  <Link href="/operator/guest-services" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>
                    View in Guest Services <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* New guidebook drawer */}
      <AppDrawer
        open={newGuideDrawer}
        onClose={() => setNewGuideDrawer(false)}
        title="New Guidebook"
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setNewGuideDrawer(false)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleGenerateGuide} disabled={!newGuideProperty || generating} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: (newGuideProperty && !generating) ? accent : 'var(--bg-elevated)', color: (newGuideProperty && !generating) ? '#fff' : 'var(--text-subtle)', fontSize: 13, fontWeight: 600, cursor: (newGuideProperty && !generating) ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} />{generating ? 'Generating…' : 'Generate with AI'}
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>Property</label>
            <select value={newGuideProperty} onChange={e => setNewGuideProperty(e.target.value)} style={inputStyle}>
              <option value="">Select property…</option>
              {PROPERTIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div style={{ padding: '10px 14px', borderRadius: 8, background: `${accent}08`, border: `1px solid ${accent}20` }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: accent, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Sparkles size={11} /> AI Generation
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Claude reads the Property Library (all 10 tabs) and generates a complete guidebook in under 60 seconds. Includes WiFi, appliances, local tips, FAQ, and conditional sections. Variable tokens like <code style={{ fontSize: 11 }}>{'{{door_code}}'}</code> are automatically inserted.
            </div>
          </div>
        </div>
      </AppDrawer>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
