'use client'
import { useState } from 'react'
import { BookOpen, Grid, List, Eye, Edit, Globe, QrCode, Copy, Sparkles, Database } from 'lucide-react'
import { motion } from 'framer-motion'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import Tabs from '@/components/shared/Tabs'
import { GUIDEBOOKS, type Guidebook } from '@/lib/data/guidebooks'
import { PROPERTIES } from '@/lib/data/properties'
import { getLibrary } from '@/lib/data/propertyLibrary'
import { useRole } from '@/context/RoleContext'

export default function AppGuidebooksPage() {
  const { accent } = useRole()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [editingGuide, setEditingGuide] = useState<Guidebook | null>(null)
  const [editorTab, setEditorTab] = useState('content')
  const [generating, setGenerating] = useState(false)
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [houseRules, setHouseRulesText] = useState('')
  const [howTo, setHowTo] = useState('')
  const [localTips, setLocalTips] = useState('')
  const [libraryLoaded, setLibraryLoaded] = useState(false)

  const handleLoadFromLibrary = () => {
    if (!editingGuide) return
    const lib = getLibrary(editingGuide.propertyId)
    if (!lib) { alert('No library data found for this property. Complete the Property Library first.'); return }

    // Pre-populate with library data (rules shown as text)
    const rulesText = lib.houseRules ? [
      `• Check-in: ${lib.checkIn}, Check-out: ${lib.checkOut}`,
      !lib.houseRules.smokingAllowed ? '• No smoking inside the property' : '• Smoking is permitted',
      !lib.houseRules.petsAllowed ? '• No pets allowed' : '• Pets are welcome',
      !lib.houseRules.partiesAllowed ? '• No parties or events' : '• Parties permitted with prior notice',
      lib.houseRules.quietHours ? `• Quiet hours: ${lib.houseRules.quietHours}` : null,
      ...(lib.houseRules.additionalRules ?? []).map(r => `• ${r}`),
    ].filter(Boolean).join('\n') : ''

    const howToText = [
      lib.wifiName ? `• WiFi: Connect to "${lib.wifiName}", password: ${lib.wifiPassword ?? 'see welcome card'}` : null,
      lib.heatingInstructions ? `• Heating: ${lib.heatingInstructions}` : null,
      lib.accessInstructions ? `• Entry: ${lib.accessInstructions}` : null,
      `• Check-out: Please leave by ${lib.checkOut}`,
    ].filter(Boolean).join('\n')

    const localText = [
      lib.localArea.supermarket ? `• Supermarket: ${lib.localArea.supermarket} (${lib.localArea.supermarketDistance ?? 'nearby'})` : null,
      lib.localArea.publicTransport ? `• Transport: ${lib.localArea.publicTransport}` : null,
      ...(lib.localArea.restaurants ?? []).map(r => `• Restaurant: ${r}`),
      ...(lib.localArea.attractions ?? []).map(a => `• Attraction: ${a}`),
    ].filter(Boolean).join('\n')

    setWelcomeMessage(lib.description ? `Welcome to ${editingGuide.propertyName}!\n\n${lib.description}` : `Welcome to ${editingGuide.propertyName}! We're so glad you're here.`)
    setHouseRulesText(rulesText)
    setHowTo(howToText)
    setLocalTips(localText)
    setLibraryLoaded(true)
  }

  const handleGenerateAI = async () => {
    if (!editingGuide) return
    setGenerating(true)
    const lib = getLibrary(editingGuide.propertyId)
    try {
      const res = await fetch('/api/generate-guidebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyName: editingGuide.propertyName,
          wifiName: lib?.wifiName ?? editingGuide.wifiName,
          checkInTime: lib?.checkIn ?? editingGuide.checkInTime,
          checkOutTime: lib?.checkOut ?? editingGuide.checkOutTime,
          description: lib?.description,
          amenities: lib?.amenities,
          houseRules: lib?.houseRules,
          localRestaurants: lib?.localArea.restaurants,
          localAttractions: lib?.localArea.attractions,
          localTransport: lib?.localArea.publicTransport,
          heatingInstructions: lib?.heatingInstructions,
          accessInstructions: lib?.accessInstructions,
          city: PROPERTIES.find(p => p.id === editingGuide.propertyId)?.city,
        }),
      })
      if (!res.body) throw new Error('No stream')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      setWelcomeMessage('')
      setHouseRulesText('')
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
              if (data.field === 'rules') setHouseRulesText(v => v + (data.chunk ?? ''))
              if (data.field === 'howto') setHowTo(v => v + (data.chunk ?? ''))
              if (data.field === 'tips') setLocalTips(v => v + (data.chunk ?? ''))
            } catch { /* ignore */ }
          }
        }
      }
    } catch {
      setWelcomeMessage(`Welcome to ${editingGuide.propertyName}! We hope you enjoy your stay. The property has been carefully prepared for your arrival.`)
      setHouseRulesText('• Please respect quiet hours (10pm–8am)\n• No smoking indoors\n• Maximum occupancy as per booking\n• Report any damages immediately')
      setHowTo('• WiFi: Connect to network and enter password provided\n• Heating: Thermostat located in hallway\n• Checkout: Leave keys on kitchen counter')
      setLocalTips('• Great local restaurant: Ask host for recommendations\n• Grocery store: 5 min walk\n• Public transport: Bus stop at the corner')
    } finally {
      setGenerating(false)
    }
  }

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)' as const, fontSize: 14, outline: 'none' }
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }

  const editorTabs = [
    { key: 'content', label: 'Content' },
    { key: 'sections', label: 'Sections' },
    { key: 'theme', label: 'Theme' },
    { key: 'share', label: 'Share' },
  ]

  if (editingGuide) {
    const lib = getLibrary(editingGuide.propertyId)
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button onClick={() => { setEditingGuide(null); setLibraryLoaded(false) }} style={{ fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            ← Back to Guidebooks
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>{editingGuide.propertyName}</h1>
          <StatusBadge status={editingGuide.status} />
          <button style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            Publish
          </button>
        </div>

        <Tabs tabs={editorTabs} active={editorTab} onChange={setEditorTab} />

        {editorTab === 'content' && (
          <div style={{ maxWidth: 700 }}>
            {/* Library integration banner */}
            {lib && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: libraryLoaded ? 'rgba(52,211,153,0.08)' : `${accent}0a`,
                  border: `1px solid ${libraryLoaded ? 'rgba(52,211,153,0.3)' : `${accent}25`}`,
                  borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                <Database size={14} style={{ color: libraryLoaded ? '#34d399' : accent, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>
                  {libraryLoaded
                    ? 'Property library data loaded. Review and edit below, then use AI to enhance.'
                    : `Property library available (${lib.completionScore}% complete). Pre-populate from library data.`}
                </span>
                {!libraryLoaded && (
                  <button
                    onClick={handleLoadFromLibrary}
                    style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${accent}`, background: 'transparent', color: accent, fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    Load from Library
                  </button>
                )}
              </motion.div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button
                onClick={handleGenerateAI}
                disabled={generating}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: `1px solid ${accent}`, background: `${accent}14`, color: accent, fontSize: 14, fontWeight: 500, cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.7 : 1 }}
              >
                <Sparkles size={14} /> {generating ? 'Generating…' : lib ? 'Generate with AI (Library Enhanced)' : 'Generate with AI'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={labelStyle}>WiFi Network</label><input style={inputStyle} defaultValue={lib?.wifiName ?? editingGuide.wifiName} /></div>
                <div><label style={labelStyle}>WiFi Password</label><input style={inputStyle} defaultValue={lib?.wifiPassword ?? editingGuide.wifiPassword} /></div>
                <div><label style={labelStyle}>Check-in Time</label><input style={inputStyle} defaultValue={lib?.checkIn ?? editingGuide.checkInTime} /></div>
                <div><label style={labelStyle}>Check-out Time</label><input style={inputStyle} defaultValue={lib?.checkOut ?? editingGuide.checkOutTime} /></div>
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
                <textarea style={{ ...inputStyle, minHeight: 110, resize: 'vertical' }} value={houseRules} onChange={e => setHouseRulesText(e.target.value)} placeholder="List your house rules…" />
              </div>
              <div>
                <label style={labelStyle}>How-To Guides</label>
                <textarea style={{ ...inputStyle, minHeight: 110, resize: 'vertical' }} value={howTo} onChange={e => setHowTo(e.target.value)} placeholder="Appliances, heating, WiFi instructions…" />
              </div>
              <div>
                <label style={labelStyle}>Local Tips</label>
                <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} value={localTips} onChange={e => setLocalTips(e.target.value)} placeholder="Restaurants, transport, activities…" />
              </div>
              <button style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', width: 'fit-content' }}>Save Changes</button>
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
                <div key={t} style={{ flex: 1, padding: 16, borderRadius: 10, border: `2px solid ${editingGuide.theme === t ? accent : 'var(--border)'}`, cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: t === 'dark' ? '#111' : t === 'light' ? '#f5f5f5' : accent, margin: '0 auto 8px', border: '1px solid var(--border)' }} />
                  <span style={{ fontSize: 13, fontWeight: 500, textTransform: 'capitalize', color: 'var(--text-primary)' }}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div><label style={labelStyle}>Accent Color</label><input type="color" defaultValue={accent} style={{ height: 36, borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer' }} /></div>
              <div><label style={labelStyle}>Cover Image URL</label><input style={inputStyle} placeholder="https://…" /></div>
            </div>
          </div>
        )}

        {editorTab === 'share' && (
          <div style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Globe size={12} /> Shareable URL
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input style={{ ...inputStyle, flex: 1 }} readOnly value={editingGuide.shareUrl} />
                  <button style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
                    <Copy size={13} /> Copy
                  </button>
                </div>
              </div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <QrCode size={12} /> QR Code
                </div>
                <div style={{ width: 120, height: 120, background: 'var(--bg-elevated)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <QrCode size={64} style={{ color: 'var(--text-subtle)' }} />
                </div>
                <button style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Download QR</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Guidebooks"
        subtitle="Guest property guidebooks"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setView('grid')} style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${view === 'grid' ? accent : 'var(--border)'}`, background: view === 'grid' ? `${accent}1a` : 'transparent', color: view === 'grid' ? accent : 'var(--text-muted)', cursor: 'pointer' }}><Grid size={15} /></button>
            <button onClick={() => setView('list')} style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${view === 'list' ? accent : 'var(--border)'}`, background: view === 'list' ? `${accent}1a` : 'transparent', color: view === 'list' ? accent : 'var(--text-muted)', cursor: 'pointer' }}><List size={15} /></button>
            <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>New Guidebook</button>
          </div>
        }
      />

      <div style={{ display: view === 'grid' ? 'grid' : 'flex', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', flexDirection: 'column', gap: 16 }}>
        {GUIDEBOOKS.map((g, i) => {
          const prop = PROPERTIES.find(p => p.id === g.propertyId)
          const lib = getLibrary(g.propertyId)
          return (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', transition: 'transform 0.2s', cursor: 'pointer' }}
              whileHover={{ y: -2 }}
            >
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
                <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{g.sectionsCount} sections</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}><Eye size={11} /> {g.viewCount}</span>
                  {lib && <span style={{ fontSize: 11, color: lib.completionScore >= 80 ? '#34d399' : accent }}>📚 Library {lib.completionScore}%</span>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => { setEditingGuide(g); setWelcomeMessage(''); setHouseRulesText(''); setHowTo(''); setLocalTips(''); setLibraryLoaded(false) }}
                    style={{ flex: 1, padding: '7px', borderRadius: 7, border: `1px solid ${accent}`, background: `${accent}14`, color: accent, fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                  >
                    <Edit size={12} /> Edit
                  </button>
                  <button onClick={() => window.open(`/guest/guidebook/${g.id}`, '_blank')} style={{ flex: 1, padding: '7px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <Eye size={12} /> Preview
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
