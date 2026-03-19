'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Calendar, BarChart2, Plus, Clock, Home,
  CheckCircle, X, ChevronDown, ChevronRight, DollarSign, Wrench, Phone, Star,
} from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import AppDrawer from '@/components/shared/AppDrawer'
import { useRole } from '@/context/RoleContext'
import { STAFF_MEMBERS, JOBS } from '@/lib/data/staff'
import { PROPERTIES } from '@/lib/data/properties'
import {
  SHIFTS, AVAILABILITY, DAYS, SHIFT_TYPE_COLOR, SHIFT_STATUS_COLOR,
  getWorkloadSummary, getShiftsForStaff, getShiftsForDay, getStaffWeeklyHours,
  getShiftDuration,
  type Shift, type DayOfWeek, type ShiftType,
} from '@/lib/data/staffScheduling'

type Tab = 'roster' | 'schedule' | 'workload' | 'payroll' | 'contractors' | 'daily'

interface Contractor {
  id: string; name: string; specialty: string; phone: string; email: string; rating: number; status: 'active' | 'inactive'
}

const INITIAL_CONTRACTORS: Contractor[] = [
  { id: 'c1', name: 'Lars Plumbing AS',   specialty: 'Plumbing',    phone: '+47 900 12 345', email: 'lars@plumbing.no',       rating: 4.8, status: 'active' },
  { id: 'c2', name: 'Elcon Electricians', specialty: 'Electrical',  phone: '+47 900 23 456', email: 'contact@elcon.no',        rating: 4.9, status: 'active' },
  { id: 'c3', name: 'CleanPro Bergen',    specialty: 'Cleaning',    phone: '+47 900 34 567', email: 'info@cleanpro.no',        rating: 4.6, status: 'active' },
  { id: 'c4', name: 'Nordic HVAC',        specialty: 'HVAC',        phone: '+47 900 45 678', email: 'service@nordichvac.no',   rating: 4.7, status: 'active' },
  { id: 'c5', name: 'Tømrer Hansen',      specialty: 'Carpentry',   phone: '+47 900 56 789', email: 'hansen@tomrer.no',        rating: 4.5, status: 'inactive' },
]

const TYPE_LABEL: Record<ShiftType, string> = {
  cleaning:    'Cleaning',
  maintenance: 'Maintenance',
  inspection:  'Inspection',
  intake:      'Intake',
  standby:     'Standby',
}

const STATUS_LABEL: Record<string, string> = {
  scheduled:   'Scheduled',
  confirmed:   'Confirmed',
  in_progress: 'In Progress',
  completed:   'Completed',
  cancelled:   'Cancelled',
  no_show:     'No Show',
}

function getWeekDates(): Record<DayOfWeek, string> {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  const days: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return Object.fromEntries(
    days.map((day, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return [day, fmt(d)]
    })
  ) as Record<DayOfWeek, string>
}
const WEEK_DATES = getWeekDates()

// ─── Shift detail sheet ───────────────────────────────────────────────────────
function ShiftSheet({ shift, onClose }: { shift: Shift; onClose: () => void }) {
  const { accent } = useRole()
  const staff    = STAFF_MEMBERS.find(s => s.id === shift.staffId)
  const property = PROPERTIES.find(p => p.id === shift.propertyId)
  const duration = getShiftDuration(shift)
  const typeColor   = SHIFT_TYPE_COLOR[shift.type]
  const statusColor = SHIFT_STATUS_COLOR[shift.status]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }} />
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        style={{
          position: 'relative', zIndex: 1, width: 400, height: '100vh',
          background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: `${typeColor}20`, color: typeColor, textTransform: 'capitalize' }}>
                {TYPE_LABEL[shift.type]}
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: `${statusColor}18`, color: statusColor, textTransform: 'capitalize' }}>
                {STATUS_LABEL[shift.status]}
              </span>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-elevated)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={14} color="var(--text-muted)" />
            </button>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            {shift.day} {WEEK_DATES[shift.day]} · {shift.startTime}–{shift.endTime}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 2 }}>
            {duration >= 60 ? `${duration / 60}h` : `${duration}m`} shift
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: 8 }}>Staff</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: accent }}>
                  {staff?.initials}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{staff?.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{staff?.role}</div>
                </div>
              </div>
            </div>
            <div style={{ padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: 8 }}>Property</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Home size={13} color={accent} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{property?.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{property?.city}</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: 10 }}>Time Details</div>
            {[
              ['Date', `${shift.day}, ${WEEK_DATES[shift.day]}`],
              ['Start', shift.startTime],
              ['End', shift.endTime],
              ['Duration', duration >= 60 ? `${duration / 60} hours` : `${duration} minutes`],
            ].map(([k, v]) => (
              <div key={String(k)} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{k}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{v}</span>
              </div>
            ))}
          </div>

          {shift.notes && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: 8 }}>Notes</div>
              <div style={{ padding: '10px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {shift.notes}
              </div>
            </div>
          )}

          {shift.jobIds.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: 8 }}>Linked Jobs</div>
              {shift.jobIds.map(jid => (
                <div key={jid} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 7, marginBottom: 6 }}>
                  <CheckCircle size={13} color="#10b981" />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{jid}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Close
          </button>
          <button style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Mark Complete
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function TeamPage() {
  const { accent } = useRole()
  const [tab, setTab]                     = useState<Tab>('roster')
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [expandedStaff, setExpandedStaff] = useState<string | null>(null)
  const [dailyJobSheet, setDailyJobSheet] = useState(false)
  const [selectedDailyJob, setSelectedDailyJob] = useState<typeof JOBS[0] | null>(null)

  const workload = getWorkloadSummary()
  const [contractors, setContractors] = useState<Contractor[]>(INITIAL_CONTRACTORS)
  const [addDrawer, setAddDrawer] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSpecialty, setNewSpecialty] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [cToast, setCToast] = useState('')
  const showCToast = (msg: string) => { setCToast(msg); setTimeout(() => setCToast(''), 3000) }

  const tabStyle = (t: Tab): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 7,
    padding: '7px 16px', borderRadius: 7, fontSize: 13,
    fontWeight: tab === t ? 600 : 500,
    color: tab === t ? accent : 'var(--text-muted)',
    background: tab === t ? `${accent}18` : 'transparent',
    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
  })

  return (
    <div>
      <PageHeader
        title="Team"
        subtitle="Roster, scheduling & workload"
        action={
          <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={15} /> Add Shift
          </button>
        }
      />

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 24, padding: 4, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, width: 'fit-content' }}>
        <button style={tabStyle('roster')}      onClick={() => setTab('roster')}>      <Users size={14} /> Roster      </button>
        <button style={tabStyle('schedule')}    onClick={() => setTab('schedule')}>    <Calendar size={14} /> Schedule    </button>
        <button style={tabStyle('workload')}    onClick={() => setTab('workload')}>    <BarChart2 size={14} /> Workload    </button>
        <button style={tabStyle('payroll')}     onClick={() => setTab('payroll')}>     <DollarSign size={14} /> Payroll     </button>
        <button style={tabStyle('contractors')} onClick={() => setTab('contractors')}> <Wrench size={14} /> Contractors </button>
        <button style={tabStyle('daily')}       onClick={() => setTab('daily')}>       <Calendar size={14} /> Daily       </button>
      </div>

      <AnimatePresence mode="wait">

        {/* ── ROSTER ── */}
        {tab === 'roster' && (
          <motion.div key="roster" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {STAFF_MEMBERS.map(member => {
                const shifts  = getShiftsForStaff(member.id)
                const hours   = getStaffWeeklyHours(member.id)
                const props   = PROPERTIES.filter(p => member.assignedPropertyIds.includes(p.id))
                const avail   = AVAILABILITY.filter(a => a.staffId === member.id)
                const unavail = avail.filter(a => !a.available).map(a => a.day)
                const isOpen  = expandedStaff === member.id

                return (
                  <motion.div key={member.id} layout style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: accent }}>
                          {member.initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{member.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>{member.role}</div>
                        </div>
                        <StatusBadge status={member.status} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                        {[
                          { label: 'Shifts', value: shifts.length },
                          { label: 'Hours',  value: `${hours}h` },
                          { label: 'Props',  value: props.length },
                        ].map(({ label, value }) => (
                          <div key={label} style={{ padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 7, textAlign: 'center' }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 1 }}>{label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Availability bar */}
                      <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                        {DAYS.map(day => (
                          <div key={day} title={`${day}: ${unavail.includes(day) ? 'unavailable' : 'available'}`} style={{ flex: 1, height: 5, borderRadius: 2, background: unavail.includes(day) ? '#ef444435' : `${accent}55` }} />
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>Mon</span>
                        <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>Sun</span>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <button
                        onClick={() => setExpandedStaff(isOpen ? null : member.id)}
                        style={{ width: '100%', padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}
                      >
                        <span>This week's shifts</span>
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                            <div style={{ padding: '0 18px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {shifts.map(shift => (
                                <button
                                  key={shift.id}
                                  onClick={() => setSelectedShift(shift)}
                                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 7, background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s' }}
                                  onMouseEnter={e => (e.currentTarget.style.borderColor = `${SHIFT_TYPE_COLOR[shift.type]}60`)}
                                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                                >
                                  <div style={{ width: 8, height: 8, borderRadius: 2, background: SHIFT_TYPE_COLOR[shift.type], flexShrink: 0 }} />
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{shift.day} · {shift.startTime}–{shift.endTime}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-subtle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {PROPERTIES.find(p => p.id === shift.propertyId)?.name}
                                    </div>
                                  </div>
                                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 10, background: `${SHIFT_STATUS_COLOR[shift.status]}18`, color: SHIFT_STATUS_COLOR[shift.status] }}>
                                    {STATUS_LABEL[shift.status]}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ── SCHEDULE ── */}
        {tab === 'schedule' && (
          <motion.div key="schedule" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: 700 }}>
                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '140px repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
                  <div />
                  {DAYS.map(day => (
                    <div key={day} style={{ padding: '8px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 7, textAlign: 'center' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{day}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 1 }}>{WEEK_DATES[day]}</div>
                    </div>
                  ))}
                </div>

                {/* Staff rows */}
                {STAFF_MEMBERS.map(member => (
                  <div key={member.id} style={{ display: 'grid', gridTemplateColumns: '140px repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 7 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: accent }}>
                        {member.initials}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name.split(' ')[0]}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{member.role.split(' ')[0]}</div>
                      </div>
                    </div>

                    {DAYS.map(day => {
                      const dayShifts  = SHIFTS.filter(s => s.staffId === member.id && s.day === day)
                      const avail      = AVAILABILITY.find(a => a.staffId === member.id && a.day === day)
                      const unavailable = avail && !avail.available
                      return (
                        <div
                          key={day}
                          style={{
                            minHeight: 64, padding: 4,
                            background: unavailable ? '#ef444408' : 'var(--bg-card)',
                            border: `1px solid ${unavailable ? '#ef444425' : 'var(--border)'}`,
                            borderRadius: 7, display: 'flex', flexDirection: 'column', gap: 3,
                          }}
                        >
                          {unavailable && !dayShifts.length ? (
                            <div style={{ padding: '6px 4px', textAlign: 'center', fontSize: 10, color: '#ef444450' }}>Off</div>
                          ) : dayShifts.map(shift => (
                            <button
                              key={shift.id}
                              onClick={() => setSelectedShift(shift)}
                              style={{
                                display: 'block', width: '100%', padding: '4px 6px', borderRadius: 4,
                                background: `${SHIFT_TYPE_COLOR[shift.type]}22`,
                                border: `1px solid ${SHIFT_TYPE_COLOR[shift.type]}40`,
                                cursor: 'pointer', textAlign: 'left',
                              }}
                            >
                              <div style={{ fontSize: 10, fontWeight: 700, color: SHIFT_TYPE_COLOR[shift.type] }}>{shift.startTime}</div>
                              <div style={{ fontSize: 9, color: 'var(--text-subtle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {PROPERTIES.find(p => p.id === shift.propertyId)?.name?.split(' ')[0]}
                              </div>
                            </button>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                ))}

                {/* Legend */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12, padding: '10px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-subtle)', fontWeight: 600 }}>Legend:</span>
                  {Object.entries(SHIFT_TYPE_COLOR).map(([type, color]) => (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{TYPE_LABEL[type as ShiftType]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── WORKLOAD ── */}
        {tab === 'workload' && (
          <motion.div key="workload" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
              {[
                { label: 'Total Shifts', value: SHIFTS.length },
                { label: 'Active Staff', value: STAFF_MEMBERS.filter(s => s.status === 'active').length },
                { label: 'Total Hours',  value: `${workload.reduce((s, w) => s + w.weeklyHours, 0)}h` },
                { label: 'Avg Util.',    value: `${Math.round(workload.reduce((s, w) => s + w.utilisation, 0) / workload.length)}%` },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: '16px 18px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Utilization legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)' }}>Utilization:</span>
              {[
                { color: '#10b981', label: '<70% On track' },
                { color: '#d97706', label: '70–89% Busy' },
                { color: '#ef4444', label: '≥90% Overloaded' },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Staff bars */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 20px' }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 18 }}>Weekly Hours by Staff</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                {workload.map(w => {
                  const utilColor = w.utilisation > 90 ? '#ef4444' : w.utilisation > 70 ? '#d97706' : '#10b981'
                  return (
                    <div key={w.staffId}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: accent, flexShrink: 0 }}>
                            {w.initials}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{w.staffName}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{w.shiftCount} shifts this week</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{w.weeklyHours}h</div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: utilColor }}>{w.utilisation}% utilised</div>
                        </div>
                      </div>

                      <div style={{ height: 10, borderRadius: 5, overflow: 'hidden', display: 'flex', gap: 1 }}>
                        {Object.entries(w.byType).map(([type, hours]) => (
                          <div key={type} title={`${TYPE_LABEL[type as ShiftType]}: ${hours}h`} style={{ width: `${(Number(hours) / 40) * 100}%`, height: '100%', background: SHIFT_TYPE_COLOR[type as ShiftType] }} />
                        ))}
                        <div style={{ flex: 1, background: 'var(--bg-elevated)' }} />
                      </div>

                      <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                        {Object.entries(w.byType).map(([type, hours]) => (
                          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: SHIFT_TYPE_COLOR[type as ShiftType] }} />
                            <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{TYPE_LABEL[type as ShiftType]} {Number(hours).toFixed(1)}h</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Daily coverage */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 20px' }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>Daily Coverage</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
                {DAYS.map(day => {
                  const dayShifts  = getShiftsForDay(day)
                  const totalHrs   = dayShifts.reduce((s, sh) => s + getShiftDuration(sh) / 60, 0)
                  const staffCount = new Set(dayShifts.map(s => s.staffId)).size
                  const intensity  = Math.min(totalHrs / 15, 1)
                  const hexOpacity = Math.round(intensity * 30 + 10).toString(16).padStart(2, '0')

                  return (
                    <div
                      key={day}
                      style={{
                        padding: '12px 8px', borderRadius: 8, textAlign: 'center',
                        background: dayShifts.length ? `${accent}${hexOpacity}` : 'var(--bg-elevated)',
                        border: `1px solid ${dayShifts.length ? `${accent}30` : 'var(--border)'}`,
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{day}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-subtle)' }}>{WEEK_DATES[day]}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: dayShifts.length ? accent : 'var(--text-subtle)', margin: '8px 0 2px' }}>
                        {dayShifts.length}
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--text-subtle)' }}>shifts</div>
                      {staffCount > 0 && <div style={{ fontSize: 9, color: 'var(--text-subtle)', marginTop: 3 }}>{totalHrs.toFixed(0)}h</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
        {/* ── PAYROLL ── */}
        {tab === 'payroll' && (
          <motion.div key="payroll" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Summary cards */}
            {(() => {
              const totalHours = workload.reduce((s, w) => s + w.weeklyHours, 0)
              const totalPay = STAFF_MEMBERS.reduce((s, m) => {
                const hrs = getStaffWeeklyHours(m.id)
                return s + hrs * m.hourlyRate
              }, 0)
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                  {[
                    { label: 'Total Hours This Week', value: `${totalHours}h` },
                    { label: 'Est. Weekly Payroll',   value: `NOK ${Math.round(totalPay).toLocaleString('no-NO')}` },
                    { label: 'Active Staff',          value: STAFF_MEMBERS.filter(s => s.status === 'active').length },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ padding: '16px 18px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value}</div>
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* Per-staff rows */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Staff Time Log — Week of {WEEK_DATES['Mon']}</h2>
                <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Estimates based on scheduled hours</span>
              </div>

              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px 100px 110px', gap: 0, padding: '8px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                {['Staff', 'Rate (NOK/hr)', 'Hours', 'Est. Pay', ''].map(h => (
                  <div key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>{h}</div>
                ))}
              </div>

              {STAFF_MEMBERS.map((member, mi) => {
                const hrs  = getStaffWeeklyHours(member.id)
                const pay  = Math.round(hrs * member.hourlyRate)
                const shifts = getShiftsForStaff(member.id)
                const isOpen = expandedStaff === member.id
                return (
                  <div key={member.id} style={{ borderBottom: mi < STAFF_MEMBERS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    {/* Staff row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px 100px 110px', gap: 0, padding: '14px 20px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: accent, flexShrink: 0 }}>
                          {member.initials}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{member.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{member.role}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>
                        {member.hourlyRate}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {hrs}h
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: accent }}>
                        {pay.toLocaleString('no-NO')}
                      </div>
                      <button
                        onClick={() => setExpandedStaff(isOpen ? null : member.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', padding: 0 }}
                      >
                        {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                        {shifts.length} shifts
                      </button>
                    </div>

                    {/* Expanded shift breakdown */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                          <div style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-subtle)' }}>
                            {/* Shift table header */}
                            <div style={{ display: 'grid', gridTemplateColumns: '70px 90px 1fr 70px 90px', gap: 0, padding: '8px 20px 8px 62px', borderBottom: '1px solid var(--border-subtle)' }}>
                              {['Day', 'Time', 'Property', 'Hrs', 'Subtotal'].map(h => (
                                <div key={h} style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>{h}</div>
                              ))}
                            </div>
                            {shifts.map((shift, si) => {
                              const shiftHrs = getShiftDuration(shift) / 60
                              const subtotal = Math.round(shiftHrs * member.hourlyRate)
                              const propName = PROPERTIES.find(p => p.id === shift.propertyId)?.name ?? shift.propertyId
                              const typeColor = SHIFT_TYPE_COLOR[shift.type]
                              return (
                                <div
                                  key={shift.id}
                                  style={{
                                    display: 'grid', gridTemplateColumns: '70px 90px 1fr 70px 90px', gap: 0,
                                    padding: '8px 20px 8px 62px',
                                    borderBottom: si < shifts.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                                  }}
                                >
                                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{shift.day}</div>
                                  <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{shift.startTime}–{shift.endTime}</div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <div style={{ width: 7, height: 7, borderRadius: 2, background: typeColor, flexShrink: 0 }} />
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{propName}</span>
                                  </div>
                                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{shiftHrs.toFixed(1)}h</div>
                                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{subtotal.toLocaleString('no-NO')}</div>
                                </div>
                              )
                            })}
                            {/* Subtotal row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '70px 90px 1fr 70px 90px', gap: 0, padding: '10px 20px 10px 62px', borderTop: '1px solid var(--border)', background: `${accent}08` }}>
                              <div style={{ gridColumn: '1 / 4', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>Weekly Total</div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{hrs}h</div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: accent }}>NOK {pay.toLocaleString('no-NO')}</div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}

              {/* Grand total */}
              {(() => {
                const grandHrs = workload.reduce((s, w) => s + w.weeklyHours, 0)
                const grandPay = STAFF_MEMBERS.reduce((s, m) => s + Math.round(getStaffWeeklyHours(m.id) * m.hourlyRate), 0)
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px 100px 110px', gap: 0, padding: '14px 20px', background: `${accent}10`, borderTop: '2px solid var(--border)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Grand Total</div>
                    <div />
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{grandHrs}h</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: accent }}>NOK {grandPay.toLocaleString('no-NO')}</div>
                    <div />
                  </div>
                )
              })()}
            </div>
          </motion.div>
        )}

        {/* ── CONTRACTORS ── */}
        {tab === 'contractors' && (
          <motion.div key="contractors" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button onClick={() => setAddDrawer(true)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Add Contractor</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
              {contractors.map(c => (
                <div key={c.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, transition: 'transform 0.2s', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Wrench size={18} style={{ color: accent }} strokeWidth={1.5} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{c.specialty}</div>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                    <Phone size={11} /> {c.phone}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{c.email}</div>
                  <div style={{ height: 1, background: 'var(--border)', marginBottom: 12 }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={12} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.rating}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>/ 5.0</span>
                  </div>
                </div>
              ))}
            </div>
            <AppDrawer
              open={addDrawer}
              onClose={() => setAddDrawer(false)}
              title="Add Contractor"
              footer={
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setAddDrawer(false)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={() => {
                    if (!newName.trim()) return
                    setContractors(prev => [...prev, { id: `c${prev.length + 1}`, name: newName.trim(), specialty: newSpecialty.trim() || 'General', phone: newPhone.trim(), email: newEmail.trim(), rating: 5.0, status: 'active' }])
                    setNewName(''); setNewSpecialty(''); setNewPhone(''); setNewEmail('')
                    setAddDrawer(false); showCToast('Contractor added')
                  }} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Save</button>
                </div>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Name', value: newName, set: setNewName, placeholder: 'Company or person name' },
                  { label: 'Specialty', value: newSpecialty, set: setNewSpecialty, placeholder: 'e.g. Plumbing, Electrical' },
                  { label: 'Phone', value: newPhone, set: setNewPhone, placeholder: '+47 900 00 000' },
                  { label: 'Email', value: newEmail, set: setNewEmail, placeholder: 'email@company.no' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>{f.label}</label>
                    <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }} />
                  </div>
                ))}
              </div>
            </AppDrawer>
            {cToast && (
              <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>{cToast}</div>
            )}
          </motion.div>
        )}

        {/* ── DAILY ── */}
        {tab === 'daily' && (
          <motion.div key="daily" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, fontWeight: 500 }}>
              Today · {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {STAFF_MEMBERS.map(member => {
                const myJobs = JOBS.filter(j => member.jobIds.includes(j.id))
                const typeColor: Record<string, string> = {
                  cleaning: '#7c3aed', maintenance: '#d97706', inspection: '#06b6d4',
                  guest_services: '#ec4899', intake: '#059669',
                }
                return (
                  <div key={member.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: accent }}>
                        {member.initials}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{member.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{member.role} · {myJobs.length} task{myJobs.length !== 1 ? 's' : ''} today</div>
                      </div>
                    </div>
                    {myJobs.length === 0 ? (
                      <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 8, fontSize: 12, color: 'var(--text-subtle)' }}>
                        No tasks assigned today
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {myJobs.map(job => (
                          <div
                            key={job.id}
                            onClick={() => { setSelectedDailyJob(job); setDailyJobSheet(true) }}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 9, cursor: 'pointer', transition: 'border-color 0.15s' }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = accent)}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                          >
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: typeColor[job.type] ?? accent, flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{job.propertyName}</div>
                            </div>
                            <StatusBadge status={job.priority} />
                            <div style={{ fontSize: 11, color: 'var(--text-subtle)', flexShrink: 0 }}>{job.dueTime}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Job detail sheet */}
            {dailyJobSheet && selectedDailyJob && (
              <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                <div onClick={() => setDailyJobSheet(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
                <div style={{ position: 'relative', width: 380, height: '100vh', background: 'var(--bg-page)', borderLeft: '1px solid var(--border)', padding: 24, overflowY: 'auto', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Task Detail</span>
                    <button onClick={() => setDailyJobSheet(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><X size={18} /></button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>TITLE</div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{selectedDailyJob.title}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>PROPERTY</div>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{selectedDailyJob.propertyName}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>TYPE</div>
                        <div style={{ fontSize: 13, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{selectedDailyJob.type.replace('_', ' ')}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>DUE</div>
                        <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{selectedDailyJob.dueTime}</div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>PRIORITY</div>
                      <StatusBadge status={selectedDailyJob.priority} />
                    </div>
                    {'pteStatus' in selectedDailyJob && (selectedDailyJob as { pteStatus?: string }).pteStatus === 'pending' && (
                      <div style={{ padding: '8px 12px', borderRadius: 8, background: '#d9770618', border: '1px solid #d9770640', fontSize: 12, color: '#d97706', fontWeight: 600 }}>
                        🔒 PTE Pending — awaiting Guest Services approval
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* Shift sheet */}
      <AnimatePresence>
        {selectedShift && (
          <ShiftSheet shift={selectedShift} onClose={() => setSelectedShift(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
