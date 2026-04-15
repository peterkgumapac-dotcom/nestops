'use client'
import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, MapPin, Clock, CalendarDays,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCleanerWeek, getCleanerMonthSummary } from '@/lib/data/cleanerSchedule'
import { SHIFT_TYPE_COLOR } from '@/lib/data/staffScheduling'
import type { UserProfile } from '@/context/RoleContext'

const USER_TO_STAFF: Record<string, string> = {
  'u3': 's5', 'u4': 's3', 'u5': 's4', 'u7': 's2',
}

export default function CleanerSchedulePage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('afterstay_user')
      if (stored) setCurrentUser(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  const staffId = currentUser ? USER_TO_STAFF[currentUser.id] ?? null : null

  const week = useMemo(() => {
    if (!staffId) return []
    return getCleanerWeek(staffId, weekOffset)
  }, [staffId, weekOffset])

  const summary = useMemo(() => {
    if (!staffId) return null
    return getCleanerMonthSummary(staffId)
  }, [staffId])

  const selectedDay = selectedDate
    ? week.find(d => d.date === selectedDate)
    : week.find(d => d.isToday) ?? week[0]

  // Auto-select today
  useEffect(() => {
    const today = week.find(d => d.isToday)
    if (today && !selectedDate) setSelectedDate(today.date)
  }, [week, selectedDate])

  const weekLabel = useMemo(() => {
    if (week.length === 0) return ''
    const start = new Date(week[0].date)
    const end = new Date(week[6].date)
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${fmt(start)} – ${fmt(end)}`
  }, [week])

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto md:max-w-3xl space-y-5">
      <h1 className="heading text-2xl text-[var(--text-primary)]">Schedule</h1>

      {/* Week navigator */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { setWeekOffset(w => w - 1); setSelectedDate(null) }}
          className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-medium text-[var(--text-primary)]">{weekLabel}</span>
        <button
          onClick={() => { setWeekOffset(w => w + 1); setSelectedDate(null) }}
          className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Week strip */}
      <div className="grid grid-cols-7 gap-1.5">
        {week.map(day => {
          const dateNum = new Date(day.date).getDate()
          const isSelected = selectedDay?.date === day.date
          const hasShifts = day.shifts.length > 0

          return (
            <button
              key={day.date}
              onClick={() => setSelectedDate(day.date)}
              className={`flex flex-col items-center py-2.5 px-1 rounded-xl border cursor-pointer transition-colors min-h-[64px] ${
                isSelected
                  ? 'bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent)]'
                  : day.isToday
                  ? 'bg-[var(--bg-card)] border-[var(--accent)]/30 text-[var(--text-primary)]'
                  : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-muted)]'
              }`}
            >
              <span className="text-[10px] font-medium uppercase">{day.dayShort}</span>
              <span className="text-sm font-semibold tabular-nums mt-0.5">{dateNum}</span>
              {hasShifts && (
                <div className="flex gap-0.5 mt-1">
                  {day.shifts.slice(0, 3).map(s => (
                    <span
                      key={s.id}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: SHIFT_TYPE_COLOR[s.type] ?? 'var(--text-subtle)' }}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <motion.div
          key={selectedDay.date}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="heading text-base text-[var(--text-primary)]">
              {selectedDay.dayLabel}
            </h2>
            {selectedDay.shifts.length > 0 && (
              <span className="text-xs text-[var(--text-muted)]">
                {selectedDay.totalHours}h · {selectedDay.properties.length} propert{selectedDay.properties.length === 1 ? 'y' : 'ies'}
              </span>
            )}
          </div>

          {selectedDay.shifts.length === 0 ? (
            <Card className="p-5 text-center">
              <CalendarDays size={28} className="text-[var(--text-subtle)] mx-auto mb-2" strokeWidth={1} />
              <p className="text-sm text-[var(--text-muted)]">Day off</p>
            </Card>
          ) : (
            selectedDay.properties.map((prop, idx) => (
              <Card key={`${prop.id}-${idx}`} className="overflow-hidden">
                {prop.imageUrl && (
                  <div className="relative h-20 overflow-hidden">
                    <img src={prop.imageUrl} alt={prop.name} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-3">
                      <h3 className="text-sm font-semibold text-white">{prop.name}</h3>
                    </div>
                    <span
                      className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize"
                      style={{
                        background: `${SHIFT_TYPE_COLOR[prop.type as keyof typeof SHIFT_TYPE_COLOR] ?? '#6b7280'}30`,
                        color: SHIFT_TYPE_COLOR[prop.type as keyof typeof SHIFT_TYPE_COLOR] ?? '#6b7280',
                      }}
                    >
                      {prop.type}
                    </span>
                  </div>
                )}
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      <MapPin size={11} /> {prop.city}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      <Clock size={11} /> {prop.shiftTime}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </motion.div>
      )}

      {/* Month summary */}
      {summary && (
        <Card className="p-4">
          <h3 className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
            This Period
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-semibold text-[var(--text-primary)] tabular-nums">{summary.totalShifts}</div>
              <div className="text-[10px] text-[var(--text-muted)]">Shifts</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-[var(--text-primary)] tabular-nums">{summary.totalHours}h</div>
              <div className="text-[10px] text-[var(--text-muted)]">Hours</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-[var(--text-primary)] tabular-nums">{summary.propertiesCleaned}</div>
              <div className="text-[10px] text-[var(--text-muted)]">Properties</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
