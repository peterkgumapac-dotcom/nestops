'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, CheckCircle, Zap, Users, Building2, ClipboardList,
  Bell, Bot, ChevronRight, Menu, X, Shield, Smartphone, Star,
  BarChart3, Calendar, MessageSquare, FileText, Settings, Layers,
  TrendingUp, Clock, Globe, BookOpen, ClipboardCheck
} from 'lucide-react'
import Link from 'next/link'

/* ─── HELPERS ──────────────────────────────────────────────────── */

function useScrolled() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return scrolled
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── DATA ─────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Portals', href: '#portals' },
  { label: 'Pricing', href: '#pricing' },
]

const FEATURES = [
  {
    icon: Building2,
    title: 'Property Portfolio',
    desc: 'Manage unlimited properties, track compliance deadlines, and monitor cleaning schedules — all from one view.',
    color: '#7c3aed',
  },
  {
    icon: ClipboardList,
    title: 'SOPs & Tasks',
    desc: 'Create, assign, and acknowledge standard operating procedures. Staff confirm tasks with a single tap.',
    color: '#7c3aed',
  },
  {
    icon: Users,
    title: 'Team Coordination',
    desc: 'Manage staff and contractors with role-based access. Operators, owners, and staff each see exactly what they need.',
    color: '#2563eb',
  },
  {
    icon: MessageSquare,
    title: 'Guest Experience',
    desc: 'AI-powered guidebooks and automated guest communication keep your guests happy without manual effort.',
    color: '#059669',
  },
  {
    icon: Zap,
    title: 'Workflow Automation',
    desc: 'Trigger tasks, alerts, and messages automatically based on bookings, check-ins, and custom events.',
    color: '#d97706',
  },
  {
    icon: Bot,
    title: 'AI-Powered',
    desc: 'Draft emails, generate property guidebooks, and get reply suggestions — all powered by Claude AI.',
    color: '#7c3aed',
  },
  {
    icon: BookOpen,
    title: 'Guest Guidebooks',
    desc: 'Share mobile-optimized guidebooks directly with guests — WiFi, house rules, check-in details, and a real QR code. No app download needed.',
    color: '#059669',
  },
  {
    icon: ClipboardCheck,
    title: 'Inspector Portal',
    desc: 'Dedicated inspection workflow with intake forms, work orders, and SOP checklists — built for inspectors and quality-control staff.',
    color: '#7c3aed',
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Onboard Your Properties',
    desc: 'Add your properties, upload documents, and configure compliance requirements in minutes. Import from any existing system.',
  },
  {
    num: '02',
    title: 'Set Up Your Team',
    desc: 'Invite operators, owners, staff, inspectors, and guest services coordinators. Each role gets a tailored portal with exactly the right access.',
  },
  {
    num: '03',
    title: 'Run Operations on Autopilot',
    desc: 'Automations handle scheduling, alerts fire before deadlines, and your team executes with clarity.',
  },
]

const PORTALS = [
  {
    role: 'Operator',
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.1)',
    border: 'rgba(124,58,237,0.25)',
    tagline: 'Full operational control',
    features: [
      'Portfolio-wide dashboard',
      'SOP library & task assignment',
      'Team & contractor management',
      'Automation builder',
      'Compliance tracking',
      'AI guidebook generation',
    ],
  },
  {
    role: 'Owner',
    color: '#2563eb',
    bg: 'rgba(37,99,235,0.1)',
    border: 'rgba(37,99,235,0.25)',
    tagline: 'Property owner transparency',
    features: [
      'Property performance overview',
      'Approve maintenance requests',
      'View documents & reports',
      'Onboard new properties',
      'Track billing & invoices',
      'Request management',
    ],
  },
  {
    role: 'Staff',
    color: '#d97706',
    bg: 'rgba(217,119,6,0.1)',
    border: 'rgba(217,119,6,0.25)',
    tagline: 'Mobile-first for field teams',
    features: [
      'Daily job queue',
      'SOP acknowledgement',
      'Photo & intake uploads',
      'Guest service requests',
      'Shift scheduling',
      'Instant notifications',
    ],
  },
  {
    role: 'Inspector',
    color: '#059669',
    bg: 'rgba(5,150,105,0.1)',
    border: 'rgba(5,150,105,0.25)',
    tagline: 'Quality control built-in',
    features: [
      'My Inspections queue',
      'Property intake forms',
      'Work order creation',
      'Inspection SOPs',
      'Photo evidence upload',
      'Defect tracking',
    ],
  },
  {
    role: 'Guest Services',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.1)',
    border: 'rgba(236,72,153,0.25)',
    tagline: 'Guest-first coordination',
    features: [
      'Guest issue tracking',
      'Check-in/out coordination',
      'Guidebook management',
      'Late arrival handling',
      'Maintenance follow-up',
      'Urgency triage',
    ],
  },
]

const TESTIMONIALS = [
  {
    quote: "NestOps cut our onboarding time for new properties by 60%. The SOP system alone is worth it.",
    name: 'Amanda R.',
    role: 'STR Operator · 42 properties',
    avatar: 'AR',
    color: '#7c3aed',
  },
  {
    quote: "Finally a platform that gives our cleaning staff exactly what they need without drowning them in features.",
    name: 'James T.',
    role: 'Property Manager · 18 units',
    avatar: 'JT',
    color: '#d97706',
  },
  {
    quote: "The owner portal changed how we communicate with property owners. Complaints dropped immediately.",
    name: 'Sofia M.',
    role: 'Co-host Agency · 90 properties',
    avatar: 'SM',
    color: '#059669',
  },
]

const PLANS = [
  {
    name: 'Starter',
    price: '$49',
    period: '/mo',
    desc: 'Perfect for independent hosts getting operations organized.',
    features: ['Up to 5 properties', '3 team members', 'SOP library', 'Task management', 'Email support'],
    cta: 'Start free trial',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '$149',
    period: '/mo',
    desc: 'For scaling operators who need full team coordination.',
    features: ['Up to 30 properties', 'Unlimited team members', 'All Starter features', 'Workflow automation', 'Owner portal', 'AI features', 'Priority support'],
    cta: 'Start free trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large portfolios and co-host agencies.',
    features: ['Unlimited properties', 'Unlimited team members', 'All Growth features', 'Custom integrations', 'Dedicated onboarding', 'SLA guarantee', 'White-label option'],
    cta: 'Contact sales',
    highlight: false,
  },
]

const STATS = [
  { value: '10k+', label: 'Properties managed' },
  { value: '750+', label: 'STR operators' },
  { value: '99%', label: 'Task completion rate' },
  { value: '4.9★', label: 'Average rating' },
]

/* ─── COMPONENTS ───────────────────────────────────────────────── */

function Navbar() {
  const scrolled = useScrolled()
  const [open, setOpen] = useState(false)

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        transition: 'background 0.3s, border-color 0.3s, backdrop-filter 0.3s',
        background: scrolled ? 'rgba(13,13,13,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 15 }}>N</div>
          <span style={{ fontWeight: 800, color: '#fff', fontSize: 18, letterSpacing: '-0.02em' }}>NestOps</span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 20, background: 'rgba(124,58,237,0.25)', color: '#c4b5fd', letterSpacing: '0.04em' }}>v2.0</span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="hide-mobile">
          {NAV_LINKS.map(l => (
            <a key={l.label} href={l.href} style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
            >{l.label}</a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="hide-mobile">
          <Link href="/login" style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '8px 16px' }}>Sign in</Link>
          <Link href="/login" style={{
            fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none',
            padding: '8px 18px', borderRadius: 8, background: '#7c3aed',
            transition: 'background 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = '#6d28d9')}
            onMouseLeave={e => (e.currentTarget.style.background = '#7c3aed')}
          >Try free</Link>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 8, display: 'none' }} className="show-mobile">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ background: 'rgba(13,13,13,0.98)', borderTop: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}
          >
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {NAV_LINKS.map(l => (
                <a key={l.label} href={l.href} onClick={() => setOpen(false)} style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{l.label}</a>
              ))}
              <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                <Link href="/login" style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}>Sign in</Link>
                <Link href="/login" style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none', padding: '10px', background: '#7c3aed', borderRadius: 8 }}>Try free</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

function HeroSection() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 400], [0, 80])

  return (
    <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '120px 24px 80px' }}>
      {/* Background orbs */}
      {[
        { top: '5%', left: '-5%', size: 700, color: 'rgba(124,58,237,0.12)', delay: 0 },
        { top: '50%', left: '70%', size: 500, color: 'rgba(37,99,235,0.08)', delay: 8 },
        { top: '70%', left: '20%', size: 400, color: 'rgba(124,58,237,0.07)', delay: 16 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute', borderRadius: '50%',
            width: orb.size, height: orb.size,
            background: orb.color, filter: 'blur(100px)', pointerEvents: 'none',
            top: orb.top, left: orb.left,
          }}
          animate={{ x: [0, 40, -30, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 24, delay: orb.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <motion.div style={{ y, maxWidth: 800, textAlign: 'center', position: 'relative', zIndex: 1 }} className="hero-content">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', marginBottom: 32 }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#c4b5fd', letterSpacing: '0.04em' }}>NOW WITH GUEST GUIDEBOOKS · INSPECTOR PORTAL · TEAM DAILY VIEW</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 24 }}
        >
          Run your STR business<br />
          <span style={{ color: '#7c3aed' }}>without the chaos</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}
        >
          NestOps unifies your properties, team, SOPs, and guest experience into one operations platform built for short-term rental professionals.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.26 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}
        >
          <Link href="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 28px', borderRadius: 10, background: '#7c3aed',
            color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none',
            transition: 'all 0.2s', boxShadow: '0 0 0 0 rgba(124,58,237,0)',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#6d28d9'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 0 rgba(124,58,237,0)' }}
          >
            Start free trial <ArrowRight size={16} />
          </Link>
          <Link href="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 28px', borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: 15, textDecoration: 'none',
            background: 'rgba(255,255,255,0.04)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
          >
            View demo <ChevronRight size={16} />
          </Link>
        </motion.div>

        {/* Social proof line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}
        >
          No credit card required · 14-day free trial · Cancel anytime
        </motion.p>
      </motion.div>

      {/* Floating dashboard preview */}
      <FadeIn delay={0.5} className="dashboard-preview">
        <div style={{ maxWidth: 960, width: '100%', margin: '64px auto 0', position: 'relative', zIndex: 1, padding: '0 24px' }}>
          <div style={{
            background: 'rgba(20,20,20,0.8)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
            overflow: 'hidden', boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
          }}>
            {/* Window chrome */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
              {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
              ))}
              <div style={{ flex: 1, marginLeft: 8, display: 'flex', justifyContent: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '4px 16px', fontSize: 11, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Globe size={10} /> nestops.app/operator/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard mockup */}
            <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, minHeight: 320 }}>
              {/* Sidebar */}
              <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)', paddingRight: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', marginBottom: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>N</div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>NestOps</span>
                </div>
                {[
                  { icon: BarChart3, label: 'Dashboard', active: true },
                  { icon: Building2, label: 'Properties', active: false },
                  { icon: ClipboardList, label: 'Tasks & SOPs', active: false },
                  { icon: Users, label: 'Team', active: false },
                  { icon: Bell, label: 'Alerts', active: false },
                  { icon: Settings, label: 'Settings', active: false },
                ].map(({ icon: Icon, label, active }) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 6,
                    background: active ? 'rgba(124,58,237,0.15)' : 'transparent',
                    color: active ? '#c4b5fd' : 'rgba(255,255,255,0.35)',
                    fontSize: 11,
                  }}>
                    <Icon size={12} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {/* Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Good morning, Peter ☀️</div>

                {/* Stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[
                    { label: 'Properties', value: '24', trend: '+2', color: '#7c3aed' },
                    { label: 'Open Tasks', value: '18', trend: '-3', color: '#d97706' },
                    { label: 'Staff Online', value: '7', trend: '', color: '#059669' },
                    { label: 'Alerts', value: '3', trend: '', color: '#ef4444' },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>{s.label}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{s.value}</span>
                        {s.trend && <span style={{ fontSize: 10, color: s.color }}>{s.trend}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Activity rows */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recent Activity</div>
                  {[
                    { dot: '#059669', text: 'SOP #12 acknowledged by Maria S.', time: '2m ago' },
                    { dot: '#d97706', text: 'Cleaning task at Property 4B overdue', time: '15m ago' },
                    { dot: '#7c3aed', text: 'New owner request from Sarah J.', time: '1h ago' },
                  ].map((row, i) => (
                    <div key={i} style={{ padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: row.dot, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', flex: 1 }}>{row.text}</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{row.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Glow under dashboard */}
          <div style={{ position: 'absolute', bottom: -60, left: '50%', transform: 'translateX(-50%)', width: '60%', height: 120, background: 'rgba(124,58,237,0.15)', filter: 'blur(60px)', borderRadius: '50%', pointerEvents: 'none' }} />
        </div>
      </FadeIn>
    </section>
  )
}

function StatsSection() {
  return (
    <section style={{ padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, textAlign: 'center' }}>
        {STATS.map((s, i) => (
          <FadeIn key={s.label} delay={i * 0.08}>
            <div style={{ padding: '16px 8px' }}>
              <div style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section id="features" style={{ padding: '100px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 16 }}>Features</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 16 }}>Everything your team needs<br />to operate at their best</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', maxWidth: 560, margin: '0 auto' }}>From onboarding to automation, NestOps covers the full operational lifecycle of your STR portfolio.</p>
          </div>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.07}>
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14, padding: '28px', transition: 'all 0.25s',
                cursor: 'default',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.borderColor = `${f.color}40`
                  e.currentTarget.style.transform = 'translateY(-3px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${f.color}20`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <f.icon size={20} color={f.color} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhatsNewSection() {
  const highlights = [
    {
      icon: BookOpen,
      color: '#059669',
      title: 'Guest Guidebook Page',
      desc: 'Share /guest/guidebook/[id] directly with guests — WiFi reveal, QR code, house rules, no app needed.',
    },
    {
      icon: Layers,
      color: '#7c3aed',
      title: 'Portal Quick Switch',
      desc: 'Switch between Operator, Owner, Staff, Inspector, and Guest Services in one click — persists on refresh.',
    },
    {
      icon: Calendar,
      color: '#2563eb',
      title: 'Team Daily View',
      desc: 'See every staff member\'s tasks for today in one grid — color-coded by type with click-to-detail sheets.',
    },
  ]

  return (
    <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 100, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', marginBottom: 12 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#c4b5fd', letterSpacing: '0.06em', textTransform: 'uppercase' }}>What's New</span>
              </div>
              <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>v2.0 Highlights</h2>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: 'rgba(124,58,237,0.2)', color: '#c4b5fd' }}>Mar 19, 2026</span>
          </div>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {highlights.map((h, i) => {
            const Icon = h.icon
            return (
              <FadeIn key={h.title} delay={i * 0.08}>
                <div style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 14, padding: 24, height: '100%',
                }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 10, background: `${h.color}18`, border: `1px solid ${h.color}30`, marginBottom: 16 }}>
                    <Icon size={20} style={{ color: h.color }} strokeWidth={1.6} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>{h.title}</h3>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: 'rgba(124,58,237,0.2)', color: '#c4b5fd', whiteSpace: 'nowrap' }}>New in v2.0</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 }}>{h.desc}</p>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" style={{ padding: '100px 24px', background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 16 }}>How It Works</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 16 }}>Up and running in a day</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)' }}>No lengthy onboarding. No consultants. Just results.</p>
          </div>
        </FadeIn>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
          {/* Vertical line */}
          <div style={{ position: 'absolute', left: 32, top: 48, bottom: 48, width: 1, background: 'linear-gradient(to bottom, rgba(124,58,237,0.5), rgba(124,58,237,0.1))', display: 'none' }} />

          {STEPS.map((step, i) => (
            <FadeIn key={step.num} delay={i * 0.1}>
              <div style={{ display: 'flex', gap: 32, padding: '32px 0', borderBottom: i < STEPS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, width: 64, height: 64, borderRadius: 16, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#7c3aed', letterSpacing: '-0.02em' }}>
                  {step.num}
                </div>
                <div style={{ flex: 1, paddingTop: 8 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 10, letterSpacing: '-0.01em' }}>{step.title}</h3>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, maxWidth: 600 }}>{step.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function PortalsSection() {
  return (
    <section id="portals" style={{ padding: '100px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 16 }}>Role-Based Portals</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 16 }}>The right view for every role</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', maxWidth: 560, margin: '0 auto' }}>Three tailored portals ensure everyone — from owner to cleaning staff — sees exactly what they need and nothing more.</p>
          </div>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {PORTALS.map((p, i) => (
            <FadeIn key={p.role} delay={i * 0.1}>
              <div style={{
                background: p.bg, border: `1px solid ${p.border}`,
                borderRadius: 16, padding: '32px',
                transition: 'transform 0.25s, box-shadow 0.25s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 60px ${p.color}20` }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${p.color}25`, border: `1px solid ${p.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: p.color }}>
                    {p.role[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{p.role} Portal</div>
                    <div style={{ fontSize: 12, color: `${p.color}cc` }}>{p.tagline}</div>
                  </div>
                </div>

                <div style={{ height: 1, background: `${p.color}20`, margin: '20px 0' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {p.features.map(feat => (
                    <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CheckCircle size={14} color={p.color} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section style={{ padding: '100px 24px', background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginBottom: 16 }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="#f59e0b" color="#f59e0b" />)}
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 16 }}>Loved by STR operators</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)' }}>Join hundreds of property professionals who run smoother operations with NestOps.</p>
          </div>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.1}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '28px' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={13} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{t.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  return (
    <section id="pricing" style={{ padding: '100px 24px' }}>
      <div style={{ maxWidth: 1050, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7c3aed', marginBottom: 16 }}>Pricing</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 16 }}>Simple, transparent pricing</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)' }}>14-day free trial on all plans. No credit card required.</p>
          </div>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'start' }}>
          {PLANS.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.08}>
              <div style={{
                background: plan.highlight ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)',
                border: plan.highlight ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: '32px',
                position: 'relative', overflow: 'hidden',
              }}>
                {plan.highlight && (
                  <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#7c3aed', color: '#fff', letterSpacing: '0.04em' }}>MOST POPULAR</div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{plan.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                    <span style={{ fontSize: 40, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>{plan.price}</span>
                    {plan.period && <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>{plan.period}</span>}
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{plan.desc}</p>
                </div>

                <Link href="/login" style={{
                  display: 'block', textAlign: 'center', padding: '12px', borderRadius: 8,
                  background: plan.highlight ? '#7c3aed' : 'rgba(255,255,255,0.07)',
                  border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none',
                  marginBottom: 24, transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = plan.highlight ? '#6d28d9' : 'rgba(255,255,255,0.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = plan.highlight ? '#7c3aed' : 'rgba(255,255,255,0.07)' }}
                >
                  {plan.cta}
                </Link>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features.map(feat => (
                    <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CheckCircle size={13} color={plan.highlight ? '#7c3aed' : '#555'} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaSection() {
  return (
    <section style={{ padding: '100px 24px' }}>
      <FadeIn>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          {/* Background glow */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 300, background: 'rgba(124,58,237,0.12)', filter: 'blur(80px)', borderRadius: '50%', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', marginBottom: 24 }}>
              <Zap size={12} color="#7c3aed" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#c4b5fd' }}>Start today, free</span>
            </div>

            <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 20, lineHeight: 1.1 }}>
              Ready to transform your STR operations?
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', marginBottom: 40, lineHeight: 1.6 }}>
              Join hundreds of operators who have replaced spreadsheets, group chats, and guesswork with NestOps.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '15px 32px', borderRadius: 10, background: '#7c3aed',
                color: '#fff', fontWeight: 700, fontSize: 16, textDecoration: 'none',
                boxShadow: '0 0 40px rgba(124,58,237,0.35)', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#6d28d9'; e.currentTarget.style.boxShadow = '0 0 60px rgba(124,58,237,0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 40px rgba(124,58,237,0.35)' }}
              >
                Get started free <ArrowRight size={18} />
              </Link>
              <Link href="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '15px 32px', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 16, textDecoration: 'none',
                background: 'rgba(255,255,255,0.04)', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
              >
                <Smartphone size={18} /> View demo
              </Link>
            </div>

            <p style={{ marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>No credit card · 14-day trial · Cancel anytime</p>
          </div>
        </div>
      </FadeIn>
    </section>
  )
}

function Footer() {
  const cols = [
    { title: 'Product', links: [{ label: 'Features', href: '#features' }, { label: 'Pricing', href: '#pricing' }, { label: 'Changelog', href: '#' }, { label: 'Roadmap', href: '#' }] },
    { title: 'Portals', links: [{ label: 'Operator Portal', href: '/login' }, { label: 'Owner Portal', href: '/login' }, { label: 'Staff Portal', href: '/login' }, { label: 'Vendor Portal', href: '/login' }] },
    { title: 'Company', links: [{ label: 'About', href: '#' }, { label: 'Blog', href: '#' }, { label: 'Careers', href: '#' }, { label: 'Contact', href: '#' }] },
    { title: 'Legal', links: [{ label: 'Privacy', href: '#' }, { label: 'Terms', href: '#' }, { label: 'Security', href: '#' }, { label: 'GDPR', href: '#' }] },
  ]

  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '60px 24px 40px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 40, marginBottom: 56 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 15 }}>N</div>
              <span style={{ fontWeight: 800, color: '#fff', fontSize: 18, letterSpacing: '-0.02em' }}>NestOps</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.65, maxWidth: 260, marginBottom: 20 }}>
              The operational layer for short-term rental professionals. Built to bring clarity to complex operations.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[Shield, Globe, Smartphone].map((Icon, i) => (
                <div key={i} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={14} color="rgba(255,255,255,0.4)" />
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>{col.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(link => (
                  <Link key={link.label} href={link.href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>NestOps © 2026 · Built for STR operators</p>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ─── PAGE ─────────────────────────────────────────────────────── */

export default function MarketingPage() {
  return (
    <>
      
      <style>{`
        .hide-mobile { display: flex !important; }
        .show-mobile { display: none !important; }
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (max-width: 640px) {
          footer > div > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>

      <div style={{ background: '#0d0d0d', color: '#f5f5f5', fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh' }}>
        <Navbar />
        <main>
          <HeroSection />
          <StatsSection />
          <FeaturesSection />
          <WhatsNewSection />
          <HowItWorksSection />
          <PortalsSection />
          <TestimonialsSection />
          <PricingSection />
          <CtaSection />
        </main>
        <Footer />
      </div>
    </>
  )
}
