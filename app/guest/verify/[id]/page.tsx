'use client'
import { useState, use, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { GUEST_VERIFICATIONS } from '@/lib/data/verification'
import { GUIDEBOOKS } from '@/lib/data/guidebooks'
import { Shield, Upload, FileText, CheckSquare, CreditCard, ChevronRight, Lock, Check, Camera } from 'lucide-react'

const TOTAL_STEPS = 5

const STEP_META = [
  { icon: Shield,      label: 'Confirm Your Info',        short: 'Identity' },
  { icon: Camera,      label: 'Upload ID',                short: 'ID Upload' },
  { icon: FileText,    label: 'Sign Rental Agreement',    short: 'Agreement' },
  { icon: CheckSquare, label: 'Acknowledge House Rules',  short: 'House Rules' },
  { icon: CreditCard,  label: 'Security Deposit',         short: 'Deposit' },
]

const HOUSE_RULES = [
  'No smoking indoors or on balconies',
  'Quiet hours between 23:00 and 07:00',
  'Maximum occupancy as stated in your booking',
  'No parties or large gatherings',
  'Pets must be disclosed and approved before arrival',
  'Report any damages immediately — accidents happen, honesty is appreciated',
]

const RENTAL_AGREEMENT = `VACATION RENTAL AGREEMENT

This Vacation Rental Agreement ("Agreement") is entered into between the property operator ("Host") and the guest identified below ("Guest").

1. RENTAL PROPERTY
The Guest is renting the property described in the booking confirmation for the dates specified therein.

2. OCCUPANCY
Guest agrees that only the number of persons listed in the booking shall occupy the property. Unauthorized occupants may result in immediate termination of the stay without refund.

3. PAYMENT
Guest agrees to pay all charges as outlined in the booking confirmation, including the security deposit which will be held as an authorization on the provided payment method.

4. CANCELLATION POLICY
Cancellation is subject to the policy stated at time of booking. No exceptions will be made outside of force majeure events.

5. DAMAGE RESPONSIBILITY
Guest assumes responsibility for any damage to the property or its contents beyond normal wear and tear during the rental period.

6. HOUSE RULES
Guest agrees to comply with all house rules as communicated in the guidebook and this agreement. Violation of house rules may result in eviction without refund.

7. GOVERNING LAW
This agreement shall be governed by the laws of the jurisdiction where the property is located.

By signing below, Guest acknowledges reading, understanding, and agreeing to all terms of this Agreement.`

export default function GuestVerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const verification = GUEST_VERIFICATIONS.find(v => v.id === id)
  const guidebook = verification ? GUIDEBOOKS.find(g => g.propertyId === verification.propertyId) : null

  const [step, setStep] = useState(1)
  const [completed, setCompleted] = useState(false)

  // Step 1 state
  const [nameConfirmed, setNameConfirmed] = useState(false)
  const [phoneConfirmed, setPhoneConfirmed] = useState(false)

  // Step 2 state
  const [idFile, setIdFile] = useState<File | null>(null)
  const [idPreview, setIdPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Step 3 state
  const [agreementScrolled, setAgreementScrolled] = useState(false)
  const [agreementChecked, setAgreementChecked] = useState(false)
  const [signature, setSignature] = useState('')
  const agreementRef = useRef<HTMLDivElement>(null)

  // Step 4 state
  const [ruleChecks, setRuleChecks] = useState<boolean[]>(HOUSE_RULES.map(() => false))

  // Step 5 state
  const [depositState, setDepositState] = useState<'idle' | 'processing' | 'confirmed'>('idle')

  const accentColor = guidebook?.brandColor ?? '#7c3aed'

  useEffect(() => {
    if (completed && guidebook) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`verified:${guidebook.id}`, '1')
      }
      setTimeout(() => {
        router.push(`/guest/guidebook/${guidebook.id}`)
      }, 1800)
    }
  }, [completed, guidebook, router])

  if (!verification) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 32 }}>🔐</div>
        <div style={{ color: '#f0f0f0', fontSize: 18, fontWeight: 600 }}>Verification link not found</div>
        <div style={{ color: '#888', fontSize: 14 }}>This link may have expired or is invalid.</div>
      </div>
    )
  }

  const canAdvance = (() => {
    if (step === 1) return nameConfirmed && phoneConfirmed
    if (step === 2) return idFile !== null
    if (step === 3) return agreementScrolled && agreementChecked && signature.trim().length >= 2
    if (step === 4) return ruleChecks.every(Boolean)
    if (step === 5) return depositState === 'confirmed'
    return false
  })()

  const advance = () => {
    if (step < TOTAL_STEPS) {
      setStep(s => s + 1)
    } else {
      setCompleted(true)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIdFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setIdPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleAgreementScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      setAgreementScrolled(true)
    }
  }

  const handleDepositAuthorize = () => {
    setDepositState('processing')
    setTimeout(() => setDepositState('confirmed'), 2200)
  }

  const toggleRule = (i: number) => {
    setRuleChecks(prev => prev.map((v, idx) => idx === i ? !v : v))
  }

  const cardStyle: React.CSSProperties = {
    background: '#111827',
    border: '1px solid #1f2937',
    borderRadius: 12,
    padding: '20px',
  }

  const ctaBtnStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    borderRadius: 10,
    border: 'none',
    background: canAdvance ? accentColor : '#1f2937',
    color: canAdvance ? '#fff' : '#4b5563',
    fontSize: 15,
    fontWeight: 600,
    cursor: canAdvance ? 'pointer' : 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'background 0.2s',
  }

  if (completed) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#10b98120', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Check size={28} style={{ color: '#10b981' }} />
        </div>
        <div style={{ color: '#f0f0f0', fontSize: 22, fontWeight: 700, textAlign: 'center' }}>Verification Complete!</div>
        <div style={{ color: '#6b7280', fontSize: 14, textAlign: 'center' }}>Unlocking your guidebook…</div>
        <div style={{ width: 40, height: 3, borderRadius: 2, background: accentColor, animation: 'pulse 1s infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 48 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Header */}
        <div style={{ padding: '24px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${accentColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={16} style={{ color: accentColor }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f0' }}>Guest Verification</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{verification.propertyName}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Step {step} of {TOTAL_STEPS}</span>
              <span style={{ fontSize: 12, color: accentColor, fontWeight: 600 }}>{STEP_META[step - 1].label}</span>
            </div>
            <div style={{ height: 4, background: '#1f2937', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${(step / TOTAL_STEPS) * 100}%`, background: accentColor, borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
            {/* Step dots */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              {STEP_META.map((s, i) => {
                const done = i + 1 < step
                const active = i + 1 === step
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: done ? accentColor : active ? `${accentColor}30` : '#1f2937', border: `2px solid ${done || active ? accentColor : '#374151'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                      {done
                        ? <Check size={12} style={{ color: '#fff' }} />
                        : <span style={{ fontSize: 9, fontWeight: 700, color: active ? accentColor : '#4b5563' }}>{i + 1}</span>
                      }
                    </div>
                    <span style={{ fontSize: 9, color: active ? accentColor : '#4b5563', fontWeight: active ? 600 : 400 }}>{s.short}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ─── STEP 1: Confirm Info ─── */}
          {step === 1 && (
            <>
              <div style={cardStyle}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f0', marginBottom: 6 }}>Confirm Your Info</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20, lineHeight: 1.5 }}>
                  Please verify that the details below match your booking. Tap each item to confirm.
                </div>

                {/* Name */}
                <div
                  onClick={() => setNameConfirmed(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px', borderRadius: 10, background: nameConfirmed ? `${accentColor}15` : '#0d1525', border: `1px solid ${nameConfirmed ? accentColor : '#1f2937'}`, cursor: 'pointer', marginBottom: 10, transition: 'all 0.15s' }}
                >
                  <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${nameConfirmed ? accentColor : '#374151'}`, background: nameConfirmed ? accentColor : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                    {nameConfirmed && <Check size={12} style={{ color: '#fff' }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Full Name</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f0' }}>{verification.guestName}</div>
                  </div>
                </div>

                {/* Phone (simulated from email) */}
                <div
                  onClick={() => setPhoneConfirmed(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px', borderRadius: 10, background: phoneConfirmed ? `${accentColor}15` : '#0d1525', border: `1px solid ${phoneConfirmed ? accentColor : '#1f2937'}`, cursor: 'pointer', transition: 'all 0.15s' }}
                >
                  <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${phoneConfirmed ? accentColor : '#374151'}`, background: phoneConfirmed ? accentColor : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                    {phoneConfirmed && <Check size={12} style={{ color: '#fff' }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Email Address</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f0' }}>{verification.guestEmail}</div>
                  </div>
                </div>

                <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 8, background: '#0d1525', border: '1px solid #1f2937' }}>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Property</div>
                  <div style={{ fontSize: 13, color: '#d0d0d0' }}>{verification.propertyName} · {verification.checkInDate} → {verification.checkOutDate}</div>
                </div>
              </div>
            </>
          )}

          {/* ─── STEP 2: Upload ID ─── */}
          {step === 2 && (
            <div style={cardStyle}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f0', marginBottom: 6 }}>Upload Government ID</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20, lineHeight: 1.5 }}>
                Please upload a clear photo of the front of your government-issued photo ID (passport, driver&apos;s licence, or national ID card).
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: 'none' }} />

              {idPreview ? (
                <div style={{ marginBottom: 16 }}>
                  <img src={idPreview} alt="ID preview" style={{ width: '100%', borderRadius: 10, border: `2px solid ${accentColor}`, objectFit: 'cover', maxHeight: 200 }} />
                  <button
                    onClick={() => { setIdFile(null); setIdPreview(null) }}
                    style={{ marginTop: 10, width: '100%', padding: '8px', borderRadius: 8, border: '1px solid #374151', background: 'transparent', color: '#6b7280', fontSize: 13, cursor: 'pointer' }}
                  >
                    Remove & retake
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{ border: '2px dashed #374151', borderRadius: 12, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', marginBottom: 12, transition: 'border-color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = accentColor)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#374151')}
                >
                  <Upload size={32} style={{ color: '#374151', marginBottom: 12 }} />
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#d0d0d0', marginBottom: 6 }}>Tap to upload or take photo</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>JPG, PNG or HEIC · max 10MB</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => fileInputRef.current?.click()} style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1px solid ${accentColor}`, background: `${accentColor}18`, color: accentColor, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Camera size={14} /> Take Photo
                </button>
                <button onClick={() => fileInputRef.current?.click()} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #374151', background: 'transparent', color: '#9ca3af', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Upload size={14} /> Upload File
                </button>
              </div>

              <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 8, background: '#0a1628', border: '1px solid #1e3a5f', fontSize: 12, color: '#60a5fa', lineHeight: 1.5 }}>
                🔒 Your ID is encrypted and used only for verification. It is never stored permanently.
              </div>
            </div>
          )}

          {/* ─── STEP 3: Sign Agreement ─── */}
          {step === 3 && (
            <div style={cardStyle}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f0', marginBottom: 6 }}>Rental Agreement</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 14, lineHeight: 1.5 }}>
                Please read the agreement below in full, then sign to confirm your acceptance.
              </div>

              {/* Scrollable agreement */}
              <div
                ref={agreementRef}
                onScroll={handleAgreementScroll}
                style={{ height: 200, overflowY: 'auto', background: '#0d1525', border: '1px solid #1f2937', borderRadius: 8, padding: '14px', marginBottom: 14, fontSize: 12, color: '#9ca3af', lineHeight: 1.7, whiteSpace: 'pre-line' }}
              >
                {RENTAL_AGREEMENT}
              </div>

              {!agreementScrolled && (
                <div style={{ fontSize: 11, color: '#f59e0b', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                  ↑ Scroll to the bottom of the agreement to continue
                </div>
              )}

              {/* I agree checkbox */}
              <div
                onClick={() => agreementScrolled && setAgreementChecked(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', borderRadius: 8, background: agreementChecked ? `${accentColor}12` : '#0d1525', border: `1px solid ${agreementChecked ? accentColor : '#1f2937'}`, cursor: agreementScrolled ? 'pointer' : 'not-allowed', marginBottom: 14, opacity: agreementScrolled ? 1 : 0.4, transition: 'all 0.15s' }}
              >
                <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${agreementChecked ? accentColor : '#374151'}`, background: agreementChecked ? accentColor : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {agreementChecked && <Check size={12} style={{ color: '#fff' }} />}
                </div>
                <span style={{ fontSize: 13, color: '#d0d0d0' }}>I have read and agree to the Rental Agreement</span>
              </div>

              {/* Signature */}
              <div>
                <label style={{ fontSize: 11, color: '#6b7280', display: 'block', marginBottom: 6 }}>Digital Signature — type your full name</label>
                <input
                  value={signature}
                  onChange={e => setSignature(e.target.value)}
                  placeholder={verification.guestName}
                  disabled={!agreementChecked}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: `1px solid ${signature.trim().length >= 2 ? accentColor : '#1f2937'}`, background: '#0d1525', color: '#f0f0f0', fontSize: 16, fontFamily: 'Georgia, serif', outline: 'none', opacity: agreementChecked ? 1 : 0.4, boxSizing: 'border-box' }}
                />
              </div>
            </div>
          )}

          {/* ─── STEP 4: House Rules ─── */}
          {step === 4 && (
            <div style={cardStyle}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f0', marginBottom: 6 }}>House Rules</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 18, lineHeight: 1.5 }}>
                Please acknowledge each rule by tapping it. All rules must be accepted to continue.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {HOUSE_RULES.map((rule, i) => (
                  <div
                    key={i}
                    onClick={() => toggleRule(i)}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: 10, background: ruleChecks[i] ? `${accentColor}12` : '#0d1525', border: `1px solid ${ruleChecks[i] ? accentColor : '#1f2937'}`, cursor: 'pointer', transition: 'all 0.15s' }}
                  >
                    <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${ruleChecks[i] ? accentColor : '#374151'}`, background: ruleChecks[i] ? accentColor : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition: 'all 0.15s' }}>
                      {ruleChecks[i] && <Check size={12} style={{ color: '#fff' }} />}
                    </div>
                    <span style={{ fontSize: 13, color: '#d0d0d0', lineHeight: 1.5 }}>{rule}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 14, padding: '8px 12px', borderRadius: 8, background: '#0d1525', border: '1px solid #1f2937', fontSize: 12, color: '#6b7280' }}>
                {ruleChecks.filter(Boolean).length} of {HOUSE_RULES.length} rules acknowledged
              </div>
            </div>
          )}

          {/* ─── STEP 5: Security Deposit ─── */}
          {step === 5 && (
            <div style={cardStyle}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f0', marginBottom: 6 }}>Security Deposit</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20, lineHeight: 1.5 }}>
                A pre-authorization hold will be placed on your card. This is not a charge — it will be released after your stay if there are no damages.
              </div>

              {/* Deposit summary */}
              <div style={{ background: '#0d1525', border: '1px solid #1f2937', borderRadius: 10, padding: '16px', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>Security Deposit</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#f0f0f0' }}>NOK 3,000</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Property</span>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>{verification.propertyName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Hold type</span>
                  <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>Pre-auth only · Released after checkout</span>
                </div>
              </div>

              {/* Card mock */}
              <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #0d1525)', border: '1px solid #1f2937', borderRadius: 12, padding: '16px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `${accentColor}20` }} />
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 12 }}>Payment Method</div>
                <div style={{ fontSize: 18, fontFamily: 'monospace', color: '#d0d0d0', letterSpacing: '0.12em', marginBottom: 12 }}>•••• •••• •••• 4242</div>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 9, color: '#6b7280', marginBottom: 2 }}>EXPIRES</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>12/28</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: '#6b7280', marginBottom: 2 }}>CARD HOLDER</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{verification.guestName.toUpperCase()}</div>
                  </div>
                </div>
              </div>

              {depositState === 'idle' && (
                <button
                  onClick={handleDepositAuthorize}
                  style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: accentColor, color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <CreditCard size={16} /> Authorize Hold — NOK 3,000
                </button>
              )}

              {depositState === 'processing' && (
                <div style={{ padding: '14px', borderRadius: 10, background: '#1f2937', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                  Processing with Stripe…
                </div>
              )}

              {depositState === 'confirmed' && (
                <div style={{ padding: '14px', borderRadius: 10, background: '#10b98120', border: '1px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#10b981', fontSize: 14, fontWeight: 600 }}>
                  <Check size={16} /> Authorization confirmed
                </div>
              )}

              <div style={{ marginTop: 14, fontSize: 11, color: '#4b5563', textAlign: 'center', lineHeight: 1.5 }}>
                Powered by Stripe · Your payment is secured with 256-bit encryption
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={advance}
            disabled={!canAdvance}
            style={ctaBtnStyle}
          >
            {step === TOTAL_STEPS ? (depositState === 'confirmed' ? 'Complete Verification' : 'Authorize Deposit First') : 'Continue'}
            {canAdvance && <ChevronRight size={16} />}
          </button>

        </div>

        {/* Locked guidebook teaser */}
        <div style={{ margin: '24px 20px 0', position: 'relative', overflow: 'hidden', borderRadius: 12 }}>
          <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: '16px', filter: 'blur(2px)', pointerEvents: 'none', userSelect: 'none' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Your Guidebook</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#f0f0f0', marginBottom: 6 }}>{verification.propertyName}</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>WiFi · Check-in guide · House rules · Local tips · Add-ons</div>
          </div>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a90', backdropFilter: 'blur(1px)', borderRadius: 12, gap: 6 }}>
            <Lock size={20} style={{ color: '#6b7280' }} />
            <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Complete verification to unlock</span>
          </div>
        </div>

      </div>
    </div>
  )
}
