'use client'
import { useState, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  BookOpen, Zap, KeyRound, CheckSquare, HelpCircle, AlertTriangle,
  Phone,
} from 'lucide-react'
import type { Guidebook } from '@/lib/data/guidebooks'
import BottomSheet from './BottomSheet'
import { G } from '@/lib/guest/theme'

interface GuideCard {
  key: string
  label: string
  icon: React.ReactElement
  gradient: [string, string]
}

const CARDS: GuideCard[] = [
  { key: 'rules',      label: 'House Rules',        icon: <BookOpen size={26} />,      gradient: ['#8B5CF6', '#A78BFA'] },
  { key: 'appliances', label: 'Appliances',          icon: <Zap size={26} />,           gradient: ['#F59E0B', '#FCD34D'] },
  { key: 'access',     label: 'Access & How-To',    icon: <KeyRound size={26} />,      gradient: ['#10B981', '#34D399'] },
  { key: 'checkout',   label: 'Checkout Guide',      icon: <CheckSquare size={26} />,   gradient: ['#3B82F6', '#60A5FA'] },
  { key: 'faqs',       label: 'FAQs',                icon: <HelpCircle size={26} />,    gradient: ['#EC4899', '#F9A8D4'] },
  { key: 'emergency',  label: 'Emergency',           icon: <AlertTriangle size={26} />, gradient: ['#EF4444', '#FCA5A5'] },
]

interface Props {
  guidebook: Guidebook
  accentColor: string
}

// 3D tilt card
function TiltCard({
  children, onClick, style, delay, reduced,
}: {
  children: React.ReactNode
  onClick: () => void
  style?: React.CSSProperties
  delay: number
  reduced: boolean | null
}) {
  const ref = useRef<HTMLButtonElement>(null)

  function onMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const el = ref.current
    if (!el || reduced) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const rx = ((y - rect.height / 2) / rect.height) * -14
    const ry = ((x - rect.width / 2) / rect.width) * 14
    el.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px) scale(1.02)`
    el.style.boxShadow = `0 ${14 + Math.abs(rx)}px ${36 + Math.abs(ry) * 2}px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)`
  }

  function onMouseLeave() {
    const el = ref.current
    if (!el) return
    el.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateZ(0) scale(1)'
    el.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)'
  }

  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement>}
      initial={reduced ? {} : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileTap={reduced ? {} : { scale: 0.96 }}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.92)',
        borderRadius: 18,
        boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
        padding: '16px 8px 14px',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 10,
        textAlign: 'center',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      {children}
    </motion.button>
  )
}

function RulesContent({ rules }: { rules?: string }) {
  if (!rules) return <p style={{ color: G.textMuted, fontSize: 14 }}>No house rules specified.</p>
  return (
    <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
      {rules.split('\n').filter(Boolean).map((r, i) => (
        <li key={i} style={{ fontSize: 14, color: G.textBody, lineHeight: 1.65, marginBottom: 8 }}>
          {r.replace(/^•\s*/, '')}
        </li>
      ))}
    </ul>
  )
}

function AccessContent({ instructions }: { instructions?: string }) {
  if (!instructions) return <p style={{ color: G.textMuted, fontSize: 14 }}>No access instructions.</p>
  return (
    <ol style={{ margin: 0, padding: '0 0 0 20px' }}>
      {instructions.split('\n').filter(Boolean).map((line, i) => (
        <li key={i} style={{ fontSize: 14, color: G.textBody, lineHeight: 1.65, marginBottom: 10 }}>
          {line.replace(/^•\s*/, '')}
        </li>
      ))}
    </ol>
  )
}

function AppliancesContent() {
  const items = [
    { label: 'TV', tip: 'Remote on the coffee table. Press Home to access streaming apps.' },
    { label: 'Dishwasher', tip: 'Pods under the sink. Press the power button, then select a cycle and press Start.' },
    { label: 'Heating', tip: 'Smart thermostat in the hallway. Use +/– to adjust. Setback mode at night.' },
    { label: 'Washer/Dryer', tip: 'Detergent in the cabinet above. Select a cycle and press Start. Each cycle takes ~45 min.' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map(it => (
        <div key={it.label} style={{
          background: G.bg, border: `1px solid ${G.border}`, borderRadius: 12, padding: '12px 14px',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: G.text, marginBottom: 4 }}>{it.label}</div>
          <div style={{ fontSize: 13, color: G.textBody, lineHeight: 1.55 }}>{it.tip}</div>
        </div>
      ))}
    </div>
  )
}

function CheckoutContent() {
  const items = [
    'Leave keys on the kitchen counter',
    'Close all windows and lock the door',
    'Turn off lights, AC, and heating',
    'Place used towels in the bathroom',
    'Dispose of personal food items',
    'Leave the property as you found it',
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{
            width: 24, height: 24, borderRadius: 7, flexShrink: 0,
            background: G.green + '18', color: G.green,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700,
          }}>
            {i + 1}
          </div>
          <span style={{ fontSize: 14, color: G.textBody, lineHeight: 1.55 }}>{item}</span>
        </div>
      ))}
    </div>
  )
}

function FAQContent({ faqs }: { faqs?: Array<{ question: string; answer: string }> }) {
  const [open, setOpen] = useState<number | null>(null)
  if (!faqs?.length) return <p style={{ color: G.textMuted, fontSize: 14 }}>No FAQs available.</p>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {faqs.map((faq, i) => (
        <div key={i} style={{ borderBottom: `1px solid ${G.border}` }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: '100%', textAlign: 'left', background: 'none', border: 'none',
              cursor: 'pointer', padding: '12px 0',
              fontSize: 14, fontWeight: 600, color: G.text,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            {faq.question}
            <span style={{ color: G.textMuted, fontSize: 18, fontWeight: 300, marginLeft: 8 }}>
              {open === i ? '−' : '+'}
            </span>
          </button>
          {open === i && (
            <p style={{ margin: '0 0 12px', fontSize: 13, color: G.textBody, lineHeight: 1.65 }}>
              {faq.answer}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function EmergencyContent({ operatorPhone, operatorName }: { operatorPhone?: string; operatorName?: string }) {
  const contacts = [
    { label: 'Police', number: '112', color: G.blue },
    { label: 'Fire', number: '110', color: G.red },
    { label: 'Ambulance', number: '113', color: G.red },
    ...(operatorPhone ? [{ label: operatorName ?? 'Host', number: operatorPhone, color: G.green }] : []),
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {contacts.map(c => (
        <a
          key={c.label}
          href={`tel:${c.number}`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderRadius: 14,
            background: c.color + '12', border: `1px solid ${c.color}30`,
            textDecoration: 'none',
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: G.text }}>{c.label}</div>
            <div style={{ fontSize: 13, color: G.textMuted }}>{c.number}</div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, fontWeight: 600, color: c.color,
          }}>
            <Phone size={14} /> Call
          </div>
        </a>
      ))}
    </div>
  )
}

export default function PropertyGuideGrid({ guidebook, accentColor }: Props) {
  const [activeSheet, setActiveSheet] = useState<string | null>(null)
  const reduced = useReducedMotion()

  function sheetContent(key: string) {
    switch (key) {
      case 'rules':      return <RulesContent rules={guidebook.houseRules} />
      case 'appliances': return <AppliancesContent />
      case 'access':     return <AccessContent instructions={guidebook.accessInstructions} />
      case 'checkout':   return <CheckoutContent />
      case 'faqs':       return <FAQContent faqs={guidebook.faqs} />
      case 'emergency':  return <EmergencyContent operatorPhone={guidebook.operatorPhone} operatorName={guidebook.operatorName} />
      default: return null
    }
  }

  function sheetTitle(key: string) {
    return CARDS.find(c => c.key === key)?.label ?? ''
  }

  return (
    <div style={{ padding: '0 16px' }}>
      <motion.h2
        initial={reduced ? {} : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 24, fontWeight: 700,
          color: G.text, margin: '0 0 16px',
          letterSpacing: '-0.01em',
        }}
      >
        Property Guide
      </motion.h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10,
      }}>
        {CARDS.map((card, i) => (
          <TiltCard
            key={card.key}
            onClick={() => setActiveSheet(card.key)}
            delay={i * 0.07}
            reduced={reduced}
          >
            {/* Icon with gradient background */}
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: `linear-gradient(135deg, ${card.gradient[0]}, ${card.gradient[1]})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
              boxShadow: `0 6px 18px ${card.gradient[0]}40`,
            }}>
              {card.icon}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, color: G.text,
              lineHeight: 1.2, letterSpacing: '0.01em',
            }}>
              {card.label}
            </span>
          </TiltCard>
        ))}
      </div>

      <BottomSheet
        open={!!activeSheet}
        onClose={() => setActiveSheet(null)}
        title={activeSheet ? sheetTitle(activeSheet) : ''}
      >
        {activeSheet && sheetContent(activeSheet)}
      </BottomSheet>
    </div>
  )
}
