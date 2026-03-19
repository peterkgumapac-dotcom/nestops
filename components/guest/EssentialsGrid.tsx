'use client'
import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Wifi, Eye, EyeOff, KeyRound, Timer, Clock,
  Waves, ParkingCircle, Wind, WashingMachine, Flame, PawPrint,
  Building2, Mountain, Dumbbell, Thermometer,
} from 'lucide-react'
import type { Guidebook } from '@/lib/data/guidebooks'
import type { GuestVerification } from '@/lib/data/verification'
import CopyButton from './CopyButton'
import { G } from '@/lib/guest/theme'

const AMENITY_ICONS: Record<string, React.ReactElement> = {
  WiFi:            <Wifi size={13} />,
  Pool:            <Waves size={13} />,
  Parking:         <ParkingCircle size={13} />,
  AC:              <Wind size={13} />,
  Washer:          <WashingMachine size={13} />,
  BBQ:             <Flame size={13} />,
  'Sea View':      <Waves size={13} />,
  'Pet Friendly':  <PawPrint size={13} />,
  Balcony:         <Building2 size={13} />,
  'Mountain View': <Mountain size={13} />,
  Gym:             <Dumbbell size={13} />,
  'Hot Tub':       <Thermometer size={13} />,
}

type DoorCodeMode = 'hidden' | 'countdown' | 'available'

interface Props {
  guidebook: Guidebook
  accentColor: string
  verification?: GuestVerification | null
  isVerified: boolean
  doorCodeMode: DoorCodeMode
  doorCode?: string
  hoursUntilReveal?: number
}

function glassCard(extra?: React.CSSProperties): React.CSSProperties {
  return {
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.92)',
    borderRadius: 20,
    boxShadow: '0 4px 28px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.85)',
    padding: '18px',
    flex: 1,
    ...extra,
  }
}

function GradientIconBox({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: `linear-gradient(135deg, ${color}22, ${color}10)`,
      border: `1px solid ${color}25`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color,
      boxShadow: `0 2px 8px ${color}18`,
    }}>
      {children}
    </div>
  )
}

export default function EssentialsGrid({
  guidebook, accentColor, isVerified, doorCodeMode, doorCode, hoursUntilReveal,
}: Props) {
  const [wifiVisible, setWifiVisible] = useState(false)
  const reduced = useReducedMotion()

  const stagger = (i: number) => ({
    initial: reduced ? {} : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  })

  return (
    <div style={{ padding: '0 16px' }}>
      <motion.h2
        {...stagger(0)}
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 24, fontWeight: 700,
          color: G.text, margin: '0 0 16px',
          letterSpacing: '-0.01em',
        }}
      >
        Essentials
      </motion.h2>

      {/* WiFi + Door Code row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>

        {/* WiFi Card */}
        <motion.div {...stagger(1)} style={glassCard()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <GradientIconBox color={accentColor}>
              <Wifi size={16} />
            </GradientIconBox>
            <span style={{
              fontSize: 11, fontWeight: 700, color: G.textMuted,
              textTransform: 'uppercase', letterSpacing: '0.07em',
            }}>WiFi</span>
          </div>

          {guidebook.wifiName ? (
            <>
              <div style={{
                fontSize: 14, fontWeight: 700, color: G.text,
                marginBottom: 6, lineHeight: 1.2,
              }}>
                {guidebook.wifiName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <span style={{
                  fontSize: 13, color: G.textMuted,
                  fontFamily: 'monospace', letterSpacing: '0.04em',
                }}>
                  {wifiVisible ? guidebook.wifiPassword : '••••••••'}
                </span>
                <button
                  onClick={() => setWifiVisible(v => !v)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: G.textMuted, padding: 0, lineHeight: 0,
                  }}
                >
                  {wifiVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              {wifiVisible && guidebook.wifiPassword && (
                <CopyButton value={guidebook.wifiPassword} label="Copy password" />
              )}
            </>
          ) : (
            <p style={{ fontSize: 13, color: G.textMuted, margin: 0 }}>Not provided</p>
          )}
        </motion.div>

        {/* Door Code Card */}
        <motion.div {...stagger(2)} style={glassCard()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <GradientIconBox color={doorCodeMode === 'available' ? G.green : G.amber}>
              {doorCodeMode === 'available'
                ? <KeyRound size={16} />
                : <Timer size={16} />
              }
            </GradientIconBox>
            <span style={{
              fontSize: 11, fontWeight: 700, color: G.textMuted,
              textTransform: 'uppercase', letterSpacing: '0.07em',
            }}>Door</span>
          </div>

          {doorCodeMode === 'available' && doorCode ? (
            <>
              <motion.div
                initial={reduced ? {} : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}
              >
                {doorCode.split('').map((digit, i) => (
                  <motion.span
                    key={i}
                    initial={reduced ? {} : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 + 0.1, duration: 0.35 }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 32, height: 38, borderRadius: 8,
                      background: `linear-gradient(145deg, ${G.bg}, rgba(255,255,255,0.6))`,
                      border: `1px solid ${G.border}`,
                      fontSize: 20, fontWeight: 800, fontFamily: 'monospace',
                      color: G.text, letterSpacing: 0,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                    }}
                  >
                    {digit}
                  </motion.span>
                ))}
              </motion.div>
              <CopyButton value={doorCode} label="Copy code" />
            </>
          ) : doorCodeMode === 'countdown' ? (
            <div style={{
              fontSize: 12, color: G.amber, fontWeight: 600,
              lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <Timer size={12} />
              Available in {hoursUntilReveal}h
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <KeyRound size={14} color={G.textMuted} />
              <span style={{ fontSize: 12, color: G.textMuted }}>Verify to unlock</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Check-in / Check-out */}
      <motion.div
        {...stagger(3)}
        style={{
          ...glassCard({ padding: '16px 20px' }),
          display: 'flex', gap: 0, marginBottom: 12, flex: 'none',
        }}
      >
        {[
          { label: 'Check-in', time: guidebook.checkInTime, color: accentColor },
          { label: 'Check-out', time: guidebook.checkOutTime, color: G.textMuted },
        ].map((item, i) => (
          <>
            {i > 0 && (
              <div key="sep" style={{
                width: 1, alignSelf: 'stretch', margin: '0 20px',
                background: `linear-gradient(to bottom, transparent, ${G.border}, transparent)`,
              }} />
            )}
            <div key={item.label} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: `linear-gradient(135deg, ${item.color}20, ${item.color}08)`,
                border: `1px solid ${item.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: item.color,
              }}>
                <Clock size={15} />
              </div>
              <div>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: G.textMuted,
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2,
                }}>
                  {item.label}
                </div>
                <div style={{
                  fontSize: 18, fontWeight: 800, color: G.text,
                  letterSpacing: '-0.02em', lineHeight: 1,
                }}>
                  {item.time}
                </div>
              </div>
            </div>
          </>
        ))}
      </motion.div>

      {/* Amenity pills */}
      {guidebook.amenities && guidebook.amenities.length > 0 && (
        <motion.div
          {...stagger(4)}
          style={{
            display: 'flex', gap: 8, overflowX: 'auto',
            paddingBottom: 4, scrollbarWidth: 'none',
          }}
        >
          {guidebook.amenities.map((a, i) => (
            <motion.div
              key={a}
              initial={reduced ? {} : { opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.04, duration: 0.35 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 24, flexShrink: 0,
                background: 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid rgba(255,255,255,0.9)`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                fontSize: 12, color: G.textBody, fontWeight: 600,
              }}
            >
              {AMENITY_ICONS[a] && (
                <span style={{ color: accentColor }}>{AMENITY_ICONS[a]}</span>
              )}
              {a}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
