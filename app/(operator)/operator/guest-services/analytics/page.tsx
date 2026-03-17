'use client'
import { motion } from 'framer-motion'
import { BarChart2, Clock, TrendingUp, AlertTriangle, Repeat, Star } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatCard from '@/components/shared/StatCard'
import GuestServicesNav from '@/components/guest-services/GuestServicesNav'
import { useRole } from '@/context/RoleContext'
import {
  GUEST_ISSUES,
  getAvgResolutionHrs,
  getCategoryBreakdown,
  getPropertyHealth,
  fmtNok,
} from '@/lib/data/guestServices'

const CATEGORY_LABEL: Record<string, string> = {
  cleanliness:        'Cleanliness',
  maintenance:        'Maintenance',
  noise:              'Noise',
  amenity_failure:    'Amenity',
  access_issue:       'Access',
  listing_inaccuracy: 'Listing',
  safety:             'Safety',
  other:              'Other',
}

const CATEGORY_COLOR: Record<string, string> = {
  cleanliness:        '#ef4444',
  maintenance:        '#f97316',
  noise:              '#eab308',
  amenity_failure:    '#6366f1',
  access_issue:       '#d97706',
  listing_inaccuracy: '#06b6d4',
  safety:             '#dc2626',
  other:              '#6b7280',
}

// Simulated heatmap data (day-of-week × hour buckets)
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HEATMAP_DATA: Record<string, number[]> = {
  Mon: [0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 1, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0],
  Tue: [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
  Wed: [0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  Thu: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0],
  Fri: [0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 0, 0, 1, 2, 3, 2, 1, 0, 0, 0, 0, 0],
  Sat: [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 2, 3, 3, 2, 1, 0, 0, 0, 0],
  Sun: [0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0],
}
const HEAT_MAX = 3

// Compute by-property resolution time
const byPropertyResolution = (() => {
  const grouped: Record<string, number[]> = {}
  for (const issue of GUEST_ISSUES) {
    if (issue.resolutionTimeMinutes != null) {
      if (!grouped[issue.propertyName]) grouped[issue.propertyName] = []
      grouped[issue.propertyName].push(issue.resolutionTimeMinutes)
    }
  }
  return Object.entries(grouped).map(([name, times]) => ({
    name,
    avgHrs: Math.round(times.reduce((s, t) => s + t, 0) / times.length / 60 * 10) / 10,
    count: times.length,
  })).sort((a, b) => a.avgHrs - b.avgHrs)
})()

const resolutionMax = Math.max(...byPropertyResolution.map(p => p.avgHrs), 1)

// Repeat issue detection: categories with >2 issues
const catBreak = getCategoryBreakdown(GUEST_ISSUES)
const repeatCategories = Object.entries(catBreak)
  .filter(([, count]) => count >= 2)
  .sort((a, b) => b[1] - a[1])

// Property health overview
const healthData = getPropertyHealth(GUEST_ISSUES)

export default function AnalyticsPage() {
  const { accent } = useRole()

  const resolved = GUEST_ISSUES.filter(i => i.resolutionTimeMinutes != null)
  const avgHrs   = getAvgResolutionHrs(GUEST_ISSUES)
  const under4h  = resolved.filter(i => (i.resolutionTimeMinutes ?? 0) <= 240).length
  const under4hPct = resolved.length > 0 ? Math.round((under4h / resolved.length) * 100) : 0
  const escalations = GUEST_ISSUES.filter(i => i.status === 'escalated').length

  const fadeIn = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Guest service performance overview"
      />

      <GuestServicesNav />

      {/* KPI stats */}
      <motion.div
        {...fadeIn}
        transition={{ duration: 0.25 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}
      >
        <StatCard label="Avg Resolution"    value={`${avgHrs}h`}        icon={Clock}         subtitle="Mean time to resolve" animate={false} />
        <StatCard label="Resolved in <4h"   value={`${under4hPct}%`}    icon={TrendingUp}    subtitle={`${under4h} of ${resolved.length} issues`} animate={false} />
        <StatCard label="Escalations"       value={escalations}         icon={AlertTriangle} subtitle="Issues escalated to critical" />
        <StatCard label="Total Issues"      value={GUEST_ISSUES.length} icon={BarChart2}     subtitle="All time across properties" />
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>

        {/* Category distribution */}
        <motion.div
          {...fadeIn}
          transition={{ duration: 0.3, delay: 0.05 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}
        >
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Issue Distribution</h2>
          {Object.entries(catBreak).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
            const pct = Math.round((count / GUEST_ISSUES.length) * 100)
            const color = CATEGORY_COLOR[cat] ?? accent
            return (
              <div key={cat} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                    {CATEGORY_LABEL[cat] ?? cat}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {count} <span style={{ fontWeight: 400, color: 'var(--text-subtle)' }}>({pct}%)</span>
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3 }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(count / GUEST_ISSUES.length) * 100}%`,
                      background: color, borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </motion.div>

        {/* Resolution by property */}
        <motion.div
          {...fadeIn}
          transition={{ duration: 0.3, delay: 0.08 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}
        >
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Avg Resolution by Property</h2>
          {byPropertyResolution.map(p => (
            <div key={p.name} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{p.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: p.avgHrs > 8 ? '#ef4444' : p.avgHrs > 4 ? '#d97706' : '#10b981' }}>
                  {p.avgHrs}h
                </span>
              </div>
              <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3 }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(p.avgHrs / resolutionMax) * 100}%`,
                    background: p.avgHrs > 8 ? '#ef4444' : p.avgHrs > 4 ? '#d97706' : '#10b981',
                    borderRadius: 3,
                  }}
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Heatmap */}
      <motion.div
        {...fadeIn}
        transition={{ duration: 0.3, delay: 0.1 }}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px', marginBottom: 24 }}
      >
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Issue Timing Heatmap</h2>
        <p style={{ fontSize: 12, color: 'var(--text-subtle)', marginBottom: 16 }}>When issues are typically reported (hour of day)</p>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '44px repeat(24, 1fr)', gap: 3, minWidth: 600 }}>
            {/* Hour labels */}
            <div />
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} style={{ fontSize: 9, color: 'var(--text-subtle)', textAlign: 'center' }}>
                {h % 6 === 0 ? `${h}:00` : ''}
              </div>
            ))}

            {/* Day rows */}
            {DAYS.map(day => (
              <>
                <div key={`${day}-label`} style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', fontWeight: 500 }}>{day}</div>
                {HEATMAP_DATA[day].map((val, h) => (
                  <div
                    key={`${day}-${h}`}
                    title={`${day} ${h}:00 — ${val} issues`}
                    style={{
                      height: 20, borderRadius: 3,
                      background: val === 0
                        ? 'var(--bg-elevated)'
                        : `${accent}${Math.round((val / HEAT_MAX) * 100).toString(16).padStart(2, '0')}`,
                    }}
                  />
                ))}
              </>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
          <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>Low</span>
          {[0.2, 0.4, 0.6, 0.8, 1].map(opacity => (
            <div
              key={opacity}
              style={{ width: 14, height: 14, borderRadius: 2, background: `${accent}${Math.round(opacity * 100).toString(16).padStart(2, '0')}` }}
            />
          ))}
          <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>High</span>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Repeat issues */}
        <motion.div
          {...fadeIn}
          transition={{ duration: 0.3, delay: 0.12 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Repeat size={15} color="#d97706" />
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Repeat Issue Categories</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {repeatCategories.map(([cat, count]) => (
              <div
                key={cat}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 8,
                  background: `${CATEGORY_COLOR[cat] ?? accent}10`,
                  border: `1px solid ${CATEGORY_COLOR[cat] ?? accent}25`,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {CATEGORY_LABEL[cat] ?? cat}
                </span>
                <span
                  style={{
                    fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
                    background: `${CATEGORY_COLOR[cat] ?? accent}20`,
                    color: CATEGORY_COLOR[cat] ?? accent,
                  }}
                >
                  {count}×
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Property health summary */}
        <motion.div
          {...fadeIn}
          transition={{ duration: 0.3, delay: 0.14 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Star size={15} color={accent} />
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Property Performance</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {healthData.sort((a, b) => b.issueCount - a.issueCount).map(p => {
              const healthColors = { good: '#10b981', watch: '#d97706', alert: '#ef4444' }
              const hc = healthColors[p.health]
              return (
                <div
                  key={p.propertyId}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 8,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: hc, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.propertyName}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 2 }}>
                      {p.issueCount} issues · {p.avgResolutionHrs}h avg
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: hc, textTransform: 'capitalize' }}>{p.health}</span>
                    {p.totalRefunds > 0 && (
                      <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{fmtNok(p.totalRefunds)}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
