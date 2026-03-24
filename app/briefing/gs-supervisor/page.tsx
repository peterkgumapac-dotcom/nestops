'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { UserProfile } from '@/context/RoleContext'
import { GUEST_ISSUES, getActiveIssues } from '@/lib/data/guestServices'
import { STAFF_MEMBERS } from '@/lib/data/staff'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function GSSupervisorBriefingPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('nestops_user')
    if (!stored) {
      router.replace('/login')
      return
    }
    try {
      const user: UserProfile = JSON.parse(stored)
      if (user.jobRole !== 'gs-supervisor' && !user.subRole?.includes('GS Supervisor')) {
        router.replace('/staff/start')
        return
      }
      setCurrentUser(user)
    } catch {
      router.replace('/login')
    }
  }, [])

  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const dateLabel = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
  const fullDateLabel = `${dayName}, ${dateLabel}`

  if (!mounted || !currentUser) return null

  const firstName = currentUser.name.split(' ')[0]
  const badgeColor = '#8b5cf6'

  const activeIssues = getActiveIssues(GUEST_ISSUES)
  const criticalIssues = activeIssues.filter(i => i.severity === 'critical')
  const highIssues = activeIssues.filter(i => i.severity === 'high')
  const slaBreakers = [...criticalIssues, ...highIssues]

  // Unassigned issues (no assignedTo)
  const unassignedIssues = activeIssues.filter(i => !i.assignedTo)

  // GS team members
  const gsTeam = STAFF_MEMBERS.filter(m =>
    m.role.toLowerCase().includes('guest') || m.role.toLowerCase().includes('service')
  )

  const primaryBtnStyle: React.CSSProperties = {
    display: 'block', width: '100%', padding: '18px', borderRadius: 16,
    fontSize: 16, fontWeight: 700, textAlign: 'center',
    border: 'none', cursor: 'pointer', background: badgeColor, color: '#fff',
    textDecoration: 'none',
  }
  const secondaryBtnStyle: React.CSSProperties = {
    display: 'block', width: '100%', padding: '14px', borderRadius: 16,
    fontSize: 14, fontWeight: 600, textDecoration: 'none', textAlign: 'center',
    background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.6)',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 50%, #1e0a3f 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #0f1923 0%, transparent 60%), #0a0f1a',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 52,
        background: 'rgba(10,15,26,0.85)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 13 }}>N</div>
          <span style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>NestOps</span>
        </div>
        <Link href="/app/dashboard" style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
          Dashboard →
        </Link>
      </div>

      {/* Main */}
      <div style={{ padding: '72px 20px 60px', maxWidth: 600, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* Greeting */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
              {getGreeting()}, {firstName} 🎧
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: `${badgeColor}30`, color: badgeColor }}>
                GS Supervisor
              </span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{fullDateLabel}</span>
            </div>
          </div>

          {/* At a glance */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Open Issues',  value: activeIssues.length,   color: activeIssues.length > 0 ? '#f87171' : '#34d399' },
              { label: 'SLA Risk',     value: slaBreakers.length,    color: slaBreakers.length > 0 ? '#f59e0b' : '#34d399' },
              { label: 'Unassigned',   value: unassignedIssues.length, color: unassignedIssues.length > 0 ? '#f87171' : '#34d399' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>

            {/* SLA breakers */}
            <div style={{
              background: slaBreakers.length > 0 ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${slaBreakers.length > 0 ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 16, padding: '16px', marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: slaBreakers.length > 0 ? 12 : 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: slaBreakers.length > 0 ? '#f87171' : 'rgba(255,255,255,0.4)' }}>
                  SLA Risk — Critical & High
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: slaBreakers.length > 0 ? '#ef444420' : '#10b98120', color: slaBreakers.length > 0 ? '#f87171' : '#34d399' }}>
                  {slaBreakers.length} issue{slaBreakers.length !== 1 ? 's' : ''}
                </span>
              </div>
              {slaBreakers.length === 0 ? (
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>No critical or high-severity issues</div>
              ) : (
                slaBreakers.map((issue, i) => (
                  <div key={issue.id} style={{ padding: '8px 0', borderBottom: i < slaBreakers.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                        background: issue.severity === 'critical' ? '#dc262620' : '#f59e0b20',
                        color: issue.severity === 'critical' ? '#f87171' : '#fbbf24',
                        textTransform: 'uppercase',
                      }}>
                        {issue.severity}
                      </span>
                      <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{issue.title}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                      {issue.propertyName} · {issue.status}
                      {!issue.assignedTo ? ' · ⚠️ Unassigned' : ` · ${issue.assignedTo}`}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Team queue */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                GS Team
              </div>
              {gsTeam.length === 0 ? (
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>No GS staff found</div>
              ) : (
                gsTeam.map((member, i) => (
                  <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < gsTeam.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: badgeColor + '30', border: `1px solid ${badgeColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: badgeColor, flexShrink: 0 }}>
                      {member.initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{member.name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{member.role}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#10b98120', color: '#34d399' }}>
                      Active
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* All active issues summary */}
            {activeIssues.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  {activeIssues.length} open issue{activeIssues.length !== 1 ? 's' : ''} across all properties
                </span>
                <Link href="/app/guest-services/issues" style={{ fontSize: 13, color: badgeColor, fontWeight: 600, textDecoration: 'none', marginLeft: 'auto' }}>
                  View all →
                </Link>
              </div>
            )}

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/app/guest-services" style={primaryBtnStyle}>
                ▶ View Team Queue
              </Link>
              <Link href="/app/guest-services/issues" style={secondaryBtnStyle}>
                All Issues →
              </Link>
            </div>

          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
