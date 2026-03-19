'use client'
import { useState, use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { Lock, ShieldCheck, AlertTriangle } from 'lucide-react'
import { GUIDEBOOKS } from '@/lib/data/guidebooks'
import { PROPERTIES } from '@/lib/data/properties'
import { UPSELL_RULES, PROPERTY_GROUPS } from '@/lib/data/upsells'
import { GUEST_VERIFICATIONS } from '@/lib/data/verification'
import { issueStore } from '@/lib/guest/issueStore'
import { G } from '@/lib/guest/theme'

import GuidebookHero     from '@/components/guest/GuidebookHero'
import StickyNav         from '@/components/guest/StickyNav'
import EssentialsGrid    from '@/components/guest/EssentialsGrid'
import WelcomeSection    from '@/components/guest/WelcomeSection'
import PropertyGuideGrid from '@/components/guest/PropertyGuideGrid'
import LocalAreaSection  from '@/components/guest/LocalAreaSection'
import UpsellGrid        from '@/components/guest/UpsellGrid'
import GuestFeedbackCard from '@/components/guest/GuestFeedbackCard'
import ShareFooter       from '@/components/guest/ShareFooter'
import FloatingActionButton from '@/components/guest/FloatingActionButton'
import ContactHostSheet  from '@/components/guest/ContactHostSheet'
import ReportIssueSheet  from '@/components/guest/ReportIssueSheet'
import EmergencySheet    from '@/components/guest/EmergencySheet'
import MyIssuesSection   from '@/components/guest/MyIssuesSection'

// ─── Door code logic ──────────────────────────────────────────────────────────

type DoorCodeMode = 'hidden' | 'countdown' | 'available'

function resolveDoorCode(
  guidebook: ReturnType<typeof GUIDEBOOKS.find>,
  verification: ReturnType<typeof GUEST_VERIFICATIONS.find>,
  isVerified: boolean
): { mode: DoorCodeMode; code?: string; hoursUntil?: number } {
  if (!guidebook) return { mode: 'hidden' }
  const mode = guidebook.doorCodeRevealMode ?? 'always'
  const rawCode = '4821' // In a real app this comes from the property access codes

  if (mode === 'always') return { mode: 'available', code: rawCode }

  if (mode === 'verified_only') {
    return isVerified ? { mode: 'available', code: rawCode } : { mode: 'hidden' }
  }

  if (mode === 'time_gated') {
    if (!isVerified) return { mode: 'hidden' }
    const hours = guidebook.codeRevealHoursBeforeCheckin ?? 2
    const checkIn = verification?.checkInDate
      ? new Date(verification.checkInDate).getTime()
      : Date.now() + 999 * 3600 * 1000
    const revealAt = checkIn - hours * 3600 * 1000
    const now = Date.now()
    if (now >= revealAt) return { mode: 'available', code: rawCode }
    const hoursUntil = Math.ceil((revealAt - now) / (3600 * 1000))
    return { mode: 'countdown', hoursUntil }
  }

  return { mode: 'hidden' }
}

// ─── Upsell filtering (same logic as before) ────────────────────────────────

function getActiveUpsells(propertyId: string) {
  const property = PROPERTIES.find(p => p.id === propertyId)
  if (!property) return []

  const propertyGroup = PROPERTY_GROUPS.find(g => g.propertyIds.includes(propertyId))

  return UPSELL_RULES.filter(rule => {
    if (!rule.enabled) return false
    if (rule.targeting === 'all') return true
    if (rule.targeting === 'properties') return rule.targetPropertyIds.includes(propertyId)
    if (rule.targeting === 'groups' && propertyGroup) return rule.targetGroupIds.includes(propertyGroup.id)
    return false
  })
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function GuidebookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const reduced = useReducedMotion()

  const guidebook = GUIDEBOOKS.find(g => g.id === id)
  const property  = PROPERTIES.find(p => p.id === guidebook?.propertyId)
  const guestVerif = GUEST_VERIFICATIONS.find(v => v.propertyId === guidebook?.propertyId)
  const isVerified = guestVerif?.status === 'verified' || guestVerif?.status === 'overridden'

  const [contactSheet,   setContactSheet]   = useState(false)
  const [issueSheet,     setIssueSheet]     = useState(false)
  const [emergencySheet, setEmergencySheet] = useState(false)
  const [hasIssues,      setHasIssues]      = useState(false)

  useEffect(() => {
    if (guidebook?.propertyId) {
      setHasIssues(issueStore.getIssues(guidebook.propertyId).length > 0)
    }
  }, [issueSheet, guidebook?.propertyId])

  if (!guidebook) {
    return (
      <div style={{ minHeight: '100vh', background: G.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 40 }}>🔍</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: G.text, margin: '12px 0 8px' }}>
            Guidebook not found
          </h2>
          <p style={{ color: G.textMuted, fontSize: 14 }}>This link may have expired or been removed.</p>
        </div>
      </div>
    )
  }

  const accentColor = guidebook.brandColor ?? '#b8a088'
  const brandName   = guidebook.brandName
  const activeUpsells = getActiveUpsells(guidebook.propertyId)

  // Door code resolution
  const { mode: doorCodeMode, code: doorCode, hoursUntil: hoursUntilReveal } =
    resolveDoorCode(guidebook, guestVerif, isVerified)

  // Feedback visibility
  const now       = Date.now()
  const checkOut  = guestVerif?.checkOutDate ? new Date(guestVerif.checkOutDate).getTime() : 0
  const checkIn   = guestVerif?.checkInDate  ? new Date(guestVerif.checkInDate).getTime()  : 0
  const showFeedback = !!guestVerif && (
    now > checkOut || (now > checkIn + 24 * 3600 * 1000 && now < checkOut)
  )

  // ─── Lock gate ──────────────────────────────────────────────────────────────
  if (guidebook.requiresVerification && !isVerified) {
    return (
      <div style={{
        minHeight: '100vh', background: G.bg,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}>
        {/* Blurred preview */}
        <div style={{
          position: 'relative', width: '100%', maxWidth: 400,
          filter: 'blur(6px)', opacity: 0.35, pointerEvents: 'none',
          marginBottom: -120, overflow: 'hidden', maxHeight: 200,
          borderRadius: 16,
          background: G.surface, border: `1px solid ${G.border}`,
          padding: 20,
        }}>
          <div style={{ height: 140, background: G.border, borderRadius: 12, marginBottom: 16 }} />
          <div style={{ height: 16, background: G.border, borderRadius: 8, width: '60%' }} />
        </div>

        {/* Lock card */}
        <motion.div
          initial={reduced ? {} : { scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            background: G.surface, border: `1px solid ${G.border}`,
            borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,.08)',
            padding: '32px 28px', textAlign: 'center', maxWidth: 360, width: '100%',
            position: 'relative', zIndex: 1,
          }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: accentColor + '18',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Lock size={28} color={accentColor} />
          </div>

          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700,
            color: G.text, margin: '0 0 8px',
          }}>
            Verification required
          </h2>
          <p style={{ fontSize: 14, color: G.textMuted, margin: '0 0 24px', lineHeight: 1.6 }}>
            Complete your identity verification to access the full guidebook, including the door code and all property details.
          </p>

          {guestVerif && (
            <button
              onClick={() => router.push(`/guest/verify/${guestVerif.id}`)}
              style={{
                width: '100%', padding: '14px',
                background: accentColor, color: '#fff',
                border: 'none', borderRadius: 12,
                fontSize: 15, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <ShieldCheck size={18} /> Verify Identity (2 min)
            </button>
          )}

          {!guestVerif && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
              fontSize: 13, color: G.amber,
            }}>
              <AlertTriangle size={16} /> No verification link found
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  // ─── Main page ──────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: G.bg, position: 'relative', minHeight: '100vh' }}>
      {/* Draft banner */}
      {guidebook.status === 'draft' && (
        <div style={{
          background: G.amber + '18', borderBottom: `1px solid ${G.amber}30`,
          padding: '9px 16px', textAlign: 'center',
          fontSize: 12, color: G.amber, fontWeight: 600,
          backdropFilter: 'blur(8px)',
        }}>
          ✏️ Preview — this guidebook is not yet published
        </div>
      )}

      <GuidebookHero
        guidebook={guidebook}
        imageUrl={property?.imageUrl}
        accentColor={accentColor}
        verification={guestVerif}
      />

      <StickyNav
        accentColor={accentColor}
        hasIssues={hasIssues}
        onSOS={() => setEmergencySheet(true)}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 36, paddingTop: 28, paddingBottom: 8 }}>

        <section id="essentials">
          <EssentialsGrid
            guidebook={guidebook}
            accentColor={accentColor}
            verification={guestVerif}
            isVerified={isVerified}
            doorCodeMode={doorCodeMode}
            doorCode={doorCode}
            hoursUntilReveal={hoursUntilReveal}
          />
        </section>

        <section id="guide">
          {guidebook.welcomeMessage && (
            <WelcomeSection message={guidebook.welcomeMessage} />
          )}
          <PropertyGuideGrid guidebook={guidebook} accentColor={accentColor} />
        </section>

        {guidebook.localRecs && guidebook.localRecs.length > 0 && (
          <section id="area">
            <LocalAreaSection localRecs={guidebook.localRecs} accentColor={accentColor} />
          </section>
        )}

        {activeUpsells.length > 0 && (
          <section id="addons">
            <UpsellGrid upsells={activeUpsells} accentColor={accentColor} />
          </section>
        )}

        {showFeedback && guestVerif && (
          <GuestFeedbackCard guidebookId={guidebook.id} verification={guestVerif} />
        )}

        {hasIssues && (
          <section id="issues">
            <MyIssuesSection propertyId={guidebook.propertyId} />
          </section>
        )}

        <section id="contact">
          <ShareFooter guidebook={guidebook} accentColor={accentColor} brandName={brandName} />
        </section>
      </div>

      <FloatingActionButton
        accentColor={accentColor}
        onContactHost={() => setContactSheet(true)}
        onReportIssue={() => setIssueSheet(true)}
        onEmergency={() => setEmergencySheet(true)}
      />

      <ContactHostSheet
        open={contactSheet}
        onClose={() => setContactSheet(false)}
        guidebook={guidebook}
        verification={guestVerif}
      />

      <ReportIssueSheet
        open={issueSheet}
        onClose={() => { setIssueSheet(false); setHasIssues(issueStore.getIssues(guidebook.propertyId).length > 0) }}
        guidebook={guidebook}
        verification={guestVerif}
      />

      <EmergencySheet
        open={emergencySheet}
        onClose={() => setEmergencySheet(false)}
        operatorPhone={guidebook.operatorPhone}
        propertyId={guidebook.propertyId}
        propertyName={guidebook.propertyName}
        guestName={guestVerif?.guestName}
      />
    </div>
  )
}
