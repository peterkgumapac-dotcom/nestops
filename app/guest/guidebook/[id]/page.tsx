'use client'
import { useState, use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Wifi, Clock, ChevronDown, ChevronUp, MapPin, Copy, Check, Eye, EyeOff, Lock, ShoppingBag, ChevronRight, Utensils, Bus, Zap, X, KeyRound, Timer } from 'lucide-react'
import { GUIDEBOOKS } from '@/lib/data/guidebooks'
import { PROPERTIES } from '@/lib/data/properties'
import { UPSELL_RULES, PROPERTY_GROUPS } from '@/lib/data/upsells'
import { GUEST_VERIFICATIONS } from '@/lib/data/verification'

const AMENITY_ICONS: Record<string, string> = {
  WiFi: '📶', Pool: '🏊', Parking: '🅿️', AC: '❄️', Washer: '🫧',
  BBQ: '🔥', 'Sea View': '🌊', 'Pet Friendly': '🐾', Balcony: '🌅',
  'Mountain View': '⛰️', Gym: '💪', 'Hot Tub': '♨️',
}

const UPSELL_EMOJIS: Record<string, string> = {
  arrival: '🛬', departure: '🚪', experience: '🎉', transport: '🚗', extras: '✨',
}

export default function GuestGuidebookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const guidebook = GUIDEBOOKS.find(g => g.id === id)
  const property = guidebook ? PROPERTIES.find(p => p.id === guidebook.propertyId) : null

  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [wifiCopied, setWifiCopied] = useState(false)
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['howto']))
  const [localRecTab, setLocalRecTab] = useState<'food' | 'activity' | 'transport'>('food')
  const [upsellSheet, setUpsellSheet] = useState<string | null>(null)
  const [addedUpsells, setAddedUpsells] = useState<Set<string>>(new Set())
  const [upsellProcessing, setUpsellProcessing] = useState(false)
  const [codeRevealed, setCodeRevealed] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const [now] = useState(() => new Date())

  useEffect(() => {
    if (!guidebook) return
    if (!guidebook.requiresVerification) {
      setIsVerified(true)
      return
    }
    const flag = localStorage.getItem(`verified:${guidebook.id}`)
    setIsVerified(flag === '1')
  }, [guidebook])

  const toggleSection = (key: string) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const copyWifi = () => {
    if (guidebook?.wifiPassword) {
      navigator.clipboard.writeText(guidebook.wifiPassword).catch(() => {})
      setWifiCopied(true)
      setTimeout(() => setWifiCopied(false), 2000)
    }
  }

  const handleAddUpsell = (ruleId: string) => {
    setUpsellProcessing(true)
    setTimeout(() => {
      setAddedUpsells(prev => new Set([...prev, ruleId]))
      setUpsellProcessing(false)
      setUpsellSheet(null)
    }, 1800)
  }

  if (!guidebook) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 32 }}>🏠</div>
        <div style={{ color: '#f0f0f0', fontSize: 18, fontWeight: 600 }}>Guidebook not found</div>
        <div style={{ color: '#888', fontSize: 14 }}>This guide may have been removed or is not yet published.</div>
      </div>
    )
  }

  const accentColor = guidebook.brandColor ?? '#7c3aed'
  const brandName = guidebook.brandName ?? 'NestOps'

  // Lock gate (wait for localStorage check)
  if (isVerified === null) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 24, height: 24, border: `3px solid ${accentColor}40`, borderTopColor: accentColor, borderRadius: '50%' }} />
      </div>
    )
  }

  if (!isVerified) {
    // Find verification for this guidebook's property
    const verif = GUEST_VERIFICATIONS.find(v => v.propertyId === guidebook.propertyId)
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Blurred guidebook preview */}
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 16, padding: '24px', filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#f0f0f0', marginBottom: 8 }}>{guidebook.propertyName}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>WiFi · Check-in · House Rules · Local Tips</div>
              <div style={{ height: 12, background: '#1f2937', borderRadius: 6, marginBottom: 8 }} />
              <div style={{ height: 12, background: '#1f2937', borderRadius: 6, width: '70%' }} />
            </div>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(2px)', gap: 8 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={22} style={{ color: '#6b7280' }} />
              </div>
              <span style={{ fontSize: 14, color: '#9ca3af', fontWeight: 500 }}>Guidebook Locked</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#f0f0f0', marginBottom: 8 }}>Your guidebook is waiting</div>
            <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              Complete a quick 2-minute verification to unlock your full guidebook, including WiFi, check-in instructions, and exclusive add-ons.
            </div>
          </div>

          <button
            onClick={() => verif ? router.push(`/guest/verify/${verif.id}`) : null}
            style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: accentColor, color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            Start Verification <ChevronRight size={16} />
          </button>
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#4b5563' }}>
            Takes about 2 minutes · Your data is encrypted
          </div>
        </div>
      </div>
    )
  }

  const isDraft = guidebook.status === 'draft'

  const houseRulesList = (guidebook.houseRules ?? '')
    .split('\n')
    .map(r => r.replace(/^[•\-\*]\s*/, '').trim())
    .filter(Boolean)

  const howToItems = (guidebook.accessInstructions ?? '• WiFi: Connect to network and enter password\n• Heating: Thermostat in the hallway\n• Checkout: Leave keys on kitchen counter')
    .split('\n')
    .map(r => r.replace(/^[•\-\*]\s*/, '').trim())
    .filter(Boolean)

  // Door code reveal logic
  const accessCode = property?.accessCodes?.[0]
  const revealMode = guidebook.doorCodeRevealMode ?? 'always'
  const hoursBeforeCheckin = guidebook.codeRevealHoursBeforeCheckin ?? 2

  // Find the guest's check-in date from verifications (for time-gating)
  const guestVerif = GUEST_VERIFICATIONS.find(v => v.propertyId === guidebook.propertyId)
  let doorCodeState: 'hidden' | 'countdown' | 'available' = 'available'
  let hoursUntilAvailable = 0

  if (accessCode && revealMode !== 'always') {
    if (!isVerified) {
      doorCodeState = 'hidden'
    } else if (revealMode === 'time_gated' && guestVerif) {
      const checkinMs = new Date(guestVerif.checkInDate + 'T15:00:00').getTime()
      const revealMs = checkinMs - hoursBeforeCheckin * 60 * 60 * 1000
      if (now.getTime() < revealMs) {
        doorCodeState = 'countdown'
        hoursUntilAvailable = Math.ceil((revealMs - now.getTime()) / (60 * 60 * 1000))
      } else {
        doorCodeState = 'available'
      }
    } else {
      doorCodeState = 'available'
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  // Upsells for this property
  const propGroup = PROPERTY_GROUPS.find(g => g.propertyIds.includes(guidebook.propertyId))
  const activeUpsells = UPSELL_RULES.filter(rule => {
    if (!rule.enabled) return false
    if (rule.targeting === 'all') return true
    if (rule.targeting === 'properties') return rule.targetPropertyIds.includes(guidebook.propertyId)
    if (rule.targeting === 'groups') return propGroup ? rule.targetGroupIds.includes(propGroup.id) : false
    return false
  })

  const activeUpsellRule = activeUpsells.find(r => r.id === upsellSheet)

  const sectionCard = (key: string, label: string, icon?: React.ReactNode, children?: React.ReactNode) => (
    <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, overflow: 'hidden' }}>
      <button
        onClick={() => toggleSection(key)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {icon}
          <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
        </div>
        {openSections.has(key)
          ? <ChevronUp size={14} style={{ color: '#6b7280' }} />
          : <ChevronDown size={14} style={{ color: '#6b7280' }} />
        }
      </button>
      {openSections.has(key) && children}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 48 }}>
      {/* Draft banner */}
      {isDraft && (
        <div style={{ width: '100%', background: '#92400e', color: '#fef3c7', textAlign: 'center', fontSize: 12, fontWeight: 600, padding: '8px 16px', letterSpacing: '0.04em' }}>
          PREVIEW — This guidebook is not published yet
        </div>
      )}

      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Hero */}
        {property?.imageUrl ? (
          <img src={property.imageUrl} alt={guidebook.propertyName} style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ height: 220, width: '100%', background: `linear-gradient(135deg, ${accentColor}44, ${accentColor}18)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
            🏠
          </div>
        )}

        {/* Property name + check-in pills */}
        <div style={{ padding: '20px 20px 0' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f0f0f0', marginBottom: 12, letterSpacing: '-0.02em' }}>
            {guidebook.propertyName}
          </h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: '#1a1a1f', border: '1px solid #2a2a35', fontSize: 13, color: '#d0d0d0' }}>
              <Clock size={13} style={{ color: '#10b981' }} /> Check-in {guidebook.checkInTime}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, background: '#1a1a1f', border: '1px solid #2a2a35', fontSize: 13, color: '#d0d0d0' }}>
              <Clock size={13} style={{ color: '#f59e0b' }} /> Check-out {guidebook.checkOutTime}
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Amenities icon grid */}
          {guidebook.amenities && guidebook.amenities.length > 0 && (
            <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: '16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Amenities</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {guidebook.amenities.map(a => (
                  <div key={a} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 6px', borderRadius: 10, background: '#0d1525', border: '1px solid #1f2937' }}>
                    <span style={{ fontSize: 22 }}>{AMENITY_ICONS[a] ?? '✓'}</span>
                    <span style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center', lineHeight: 1.2 }}>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Door Code card */}
          {accessCode && (
            <div style={{ background: '#111827', border: `1px solid ${doorCodeState === 'available' ? '#10b98140' : '#1f2937'}`, borderRadius: 12, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 12, fontWeight: 700, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                <KeyRound size={13} style={{ color: doorCodeState === 'available' ? '#10b981' : '#6b7280' }} />
                {accessCode.label}
              </div>

              {doorCodeState === 'hidden' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, background: '#0d1525', border: '1px solid #1f2937' }}>
                  <Lock size={16} style={{ color: '#6b7280', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af' }}>Code locked</div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Complete verification to reveal your access code</div>
                  </div>
                </div>
              )}

              {doorCodeState === 'countdown' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, background: '#0d1525', border: '1px solid #1f2937' }}>
                  <Timer size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b' }}>Code available in ~{hoursUntilAvailable}h</div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                      Unlocks {hoursBeforeCheckin}h before check-in · {guestVerif?.checkInDate}
                    </div>
                  </div>
                </div>
              )}

              {doorCodeState === 'available' && (
                <div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>Access Code</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, padding: '10px 14px', borderRadius: 8, background: '#0d1525', border: '1px solid #10b98140', fontFamily: 'monospace', fontSize: 22, fontWeight: 700, color: '#10b981', letterSpacing: codeRevealed ? '0.2em' : '0.15em' }}>
                      {codeRevealed ? accessCode.code : '• • • • • •'}
                    </div>
                    <button onClick={() => setCodeRevealed(v => !v)} style={{ padding: '10px', borderRadius: 8, border: '1px solid #1f2937', background: '#0d1525', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                      {codeRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    {codeRevealed && (
                      <button onClick={() => copyCode(accessCode.code)} style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${codeCopied ? '#10b981' : '#1f2937'}`, background: codeCopied ? '#10b98118' : '#0d1525', cursor: 'pointer', color: codeCopied ? '#10b981' : '#6b7280', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, transition: 'all 0.15s' }}>
                        {codeCopied ? <Check size={14} /> : <Copy size={14} />} {codeCopied ? 'Copied!' : 'Copy'}
                      </button>
                    )}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 11, color: '#4b5563' }}>
                    Via {accessCode.source === 'suiteop' ? 'SuiteOp smart lock' : 'manual'} · Last used {accessCode.lastUsed}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* WiFi card */}
          {(guidebook.wifiName || guidebook.wifiPassword) && (
            <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 12, fontWeight: 700, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                <Wifi size={13} style={{ color: '#10b981' }} /> WiFi
              </div>
              {guidebook.wifiName && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 3 }}>Network</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f0' }}>{guidebook.wifiName}</div>
                </div>
              )}
              {guidebook.wifiPassword && (
                <div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>Password</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: '#0d1525', border: '1px solid #1f2937', fontFamily: 'monospace', fontSize: 15, fontWeight: 600, color: '#f0f0f0', letterSpacing: showPassword ? 'normal' : '0.15em' }}>
                      {showPassword ? guidebook.wifiPassword : '•'.repeat(Math.min(guidebook.wifiPassword.length, 10))}
                    </div>
                    <button onClick={() => setShowPassword(v => !v)} style={{ padding: '8px', borderRadius: 8, border: '1px solid #1f2937', background: '#0d1525', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button onClick={copyWifi} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${wifiCopied ? '#10b981' : '#1f2937'}`, background: wifiCopied ? '#10b98118' : '#0d1525', cursor: 'pointer', color: wifiCopied ? '#10b981' : '#6b7280', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, transition: 'all 0.15s' }}>
                      {wifiCopied ? <Check size={14} /> : <Copy size={14} />} {wifiCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Welcome message */}
          {guidebook.welcomeMessage && (
            <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: '16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Welcome</div>
              <p style={{ fontSize: 14, color: '#d0d0d0', lineHeight: 1.6, margin: 0 }}>{guidebook.welcomeMessage}</p>
            </div>
          )}

          {/* House Rules */}
          {houseRulesList.length > 0 && sectionCard('rules', 'House Rules', undefined,
            <div style={{ padding: '0 16px 14px' }}>
              {houseRulesList.map((rule, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 0', borderTop: i > 0 ? '1px solid #1f2937' : 'none' }}>
                  <span style={{ color: accentColor, fontWeight: 700, fontSize: 13, flexShrink: 0, paddingTop: 1 }}>{i + 1}.</span>
                  <span style={{ fontSize: 13, color: '#d0d0d0', lineHeight: 1.5 }}>{rule}</span>
                </div>
              ))}
            </div>
          )}

          {/* How-To / Instructions */}
          {sectionCard('howto', 'How-To Guide', undefined,
            <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {howToItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#d0d0d0', lineHeight: 1.5 }}>
                  <span style={{ color: '#10b981', fontWeight: 700, flexShrink: 0 }}>→</span> {item}
                </div>
              ))}
            </div>
          )}

          {/* Appliances & How-Tos */}
          {sectionCard('appliances', 'Appliances & How-Tos', <Zap size={13} style={{ color: '#f59e0b' }} />,
            <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { name: 'TV & Streaming', detail: 'Power on with the black remote. Netflix, Spotify, and YouTube are pre-installed. Use HDMI 1 for external devices.' },
                { name: 'Dishwasher', detail: 'Load dishes, add dishwasher pod from the cabinet below, select "Eco" mode, press Start. Cycle takes ~90 min.' },
                { name: 'Heating / AC', detail: 'Smart thermostat in the hallway. Set temperature using the + / − buttons. Economy mode saves energy when you\'re out.' },
                { name: 'Washing Machine', detail: 'Detergent is in the utility room cabinet. Select a normal cycle (40°C). Dryer is the unit stacked above.' },
              ].map((appl, i) => (
                <details key={i} style={{ background: '#0d1525', border: '1px solid #1f2937', borderRadius: 8 }}>
                  <summary style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: '#d0d0d0', cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {appl.name}
                    <ChevronDown size={13} style={{ color: '#6b7280' }} />
                  </summary>
                  <div style={{ padding: '0 14px 12px', fontSize: 13, color: '#9ca3af', lineHeight: 1.6 }}>{appl.detail}</div>
                </details>
              ))}
            </div>
          )}

          {/* Local Recommendations */}
          {guidebook.localRecs && guidebook.localRecs.length > 0 && sectionCard('localrecs', 'Local Recommendations', <MapPin size={13} style={{ color: '#f59e0b' }} />,
            <div style={{ padding: '0 16px 14px' }}>
              {/* Tabs */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {(['food', 'activity', 'transport'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setLocalRecTab(cat)}
                    style={{ flex: 1, padding: '7px 4px', borderRadius: 8, border: `1px solid ${localRecTab === cat ? accentColor : '#1f2937'}`, background: localRecTab === cat ? `${accentColor}20` : 'transparent', color: localRecTab === cat ? accentColor : '#6b7280', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                  >
                    {cat === 'food' ? <Utensils size={11} /> : cat === 'transport' ? <Bus size={11} /> : <span>🎯</span>}
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {guidebook.localRecs.filter(r => r.category === localRecTab).map((rec, i) => (
                  <div key={i} style={{ background: '#0d1525', border: '1px solid #1f2937', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f0', marginBottom: 4 }}>{rec.name}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>{rec.tip}</div>
                    {rec.address && (
                      <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6b7280' }}>
                        <MapPin size={10} /> {rec.address}
                      </div>
                    )}
                  </div>
                ))}
                {guidebook.localRecs.filter(r => r.category === localRecTab).length === 0 && (
                  <div style={{ fontSize: 13, color: '#4b5563', textAlign: 'center', padding: '12px' }}>No recommendations in this category yet.</div>
                )}
              </div>
            </div>
          )}

          {/* FAQs */}
          {guidebook.faqs && guidebook.faqs.length > 0 && sectionCard('faqs', 'FAQs', undefined,
            <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {guidebook.faqs.map((faq, i) => (
                <details key={i} style={{ background: '#0d1525', border: '1px solid #1f2937', borderRadius: 8 }}>
                  <summary style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#d0d0d0', cursor: 'pointer', listStyle: 'none' }}>
                    {faq.question}
                  </summary>
                  <div style={{ padding: '0 14px 12px', fontSize: 13, color: '#9ca3af', lineHeight: 1.6 }}>{faq.answer}</div>
                </details>
              ))}
            </div>
          )}

          {/* Add-Ons / Upsells */}
          {activeUpsells.length > 0 && (
            <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <ShoppingBag size={13} style={{ color: accentColor }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Add-Ons for Your Stay</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activeUpsells.map(rule => {
                  const added = addedUpsells.has(rule.id)
                  return (
                    <div key={rule.id} style={{ background: '#0d1525', border: `1px solid ${added ? '#10b981' : '#1f2937'}`, borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ fontSize: 26, flexShrink: 0 }}>{UPSELL_EMOJIS[rule.category] ?? '✨'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f0', marginBottom: 2 }}>{rule.title}</div>
                        <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.4 }}>{rule.description}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: accentColor, marginTop: 4 }}>
                          {rule.price.toLocaleString()} {rule.currency}
                        </div>
                      </div>
                      {added ? (
                        <div style={{ padding: '7px 12px', borderRadius: 8, background: '#10b98120', border: '1px solid #10b981', color: '#10b981', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                          <Check size={12} /> Added
                        </div>
                      ) : (
                        <button
                          onClick={() => setUpsellSheet(rule.id)}
                          style={{ padding: '7px 12px', borderRadius: 8, border: `1px solid ${accentColor}`, background: `${accentColor}18`, color: accentColor, fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
                        >
                          {rule.ctaLabel ?? 'Add'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>

        {/* QR Code share card */}
        <div style={{ margin: '20px 20px 0', padding: '16px', borderRadius: 12, background: '#111827', border: '1px solid #1f2937', display: 'flex', alignItems: 'center', gap: 16 }}>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : `/guest/guidebook/${guidebook.id}`)}&bgcolor=111827&color=f0f0f0&margin=4`}
            alt="QR code for this guidebook"
            width={80} height={80}
            style={{ borderRadius: 8, flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f0', marginBottom: 4 }}>Share this Guidebook</div>
            <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>Scan the QR code or copy the link to share with your guests.</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ margin: '16px 20px 0', padding: '16px', borderRadius: 10, background: '#0d1117', border: '1px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {guidebook.brandLogo ? (
            <img src={guidebook.brandLogo} alt={brandName} style={{ height: 28, objectFit: 'contain' }} />
          ) : (
            <>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 11 }}>
                {brandName[0]}
              </div>
              <span style={{ fontSize: 12, color: '#4b5563' }}>
                Powered by <span style={{ color: '#6b7280', fontWeight: 600 }}>{brandName}</span>
              </span>
            </>
          )}
        </div>

      </div>

      {/* Upsell bottom sheet */}
      {upsellSheet && activeUpsellRule && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setUpsellSheet(null)}>
          <div style={{ width: '100%', maxWidth: 480, background: '#111827', borderRadius: '16px 16px 0 0', padding: '24px', border: '1px solid #1f2937', borderBottom: 'none' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 36 }}>{UPSELL_EMOJIS[activeUpsellRule.category] ?? '✨'}</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#f0f0f0' }}>{activeUpsellRule.title}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{activeUpsellRule.description}</div>
                </div>
              </div>
              <button onClick={() => setUpsellSheet(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#0d1525', border: '1px solid #1f2937', borderRadius: 10, padding: '14px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>Price</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f0' }}>{activeUpsellRule.price.toLocaleString()} {activeUpsellRule.currency}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#6b7280' }}>Billed via</span>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>Stripe · Secure checkout</span>
              </div>
            </div>

            <button
              onClick={() => handleAddUpsell(activeUpsellRule.id)}
              disabled={upsellProcessing}
              style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: upsellProcessing ? '#1f2937' : accentColor, color: upsellProcessing ? '#6b7280' : '#fff', fontSize: 15, fontWeight: 600, cursor: upsellProcessing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {upsellProcessing ? 'Processing…' : `Add to Stay — ${activeUpsellRule.price.toLocaleString()} ${activeUpsellRule.currency}`}
            </button>
            <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: '#4b5563' }}>
              You won&apos;t be charged until confirmed · Cancel anytime before check-in
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
