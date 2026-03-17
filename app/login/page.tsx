'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useRole } from '@/context/RoleContext'
import type { Role, UserProfile } from '@/context/RoleContext'

interface DemoUser {
  id: string
  initials: string
  name: string
  role: Role
  subRole?: string
  avatarBg: string
  badgeColor: string
  badgeLabel: string
  href: string
}

const DEMO_USERS: DemoUser[] = [
  { id: 'u1', initials: 'PK', name: 'Peter K.',   role: 'operator', avatarBg: '#7c3aed', badgeColor: '#7c3aed', badgeLabel: 'Operator',         href: '/app/dashboard' },
  { id: 'u2', initials: 'SJ', name: 'Sarah J.',   role: 'owner',    avatarBg: '#2563eb', badgeColor: '#2563eb', badgeLabel: 'Owner',             href: '/owner' },
  { id: 'u3', initials: 'MS', name: 'Maria S.',   role: 'staff',    subRole: 'Cleaning Team',  avatarBg: '#d97706', badgeColor: '#d97706', badgeLabel: 'Staff', href: '/app/dashboard' },
  { id: 'u4', initials: 'BL', name: 'Bjorn L.',   role: 'staff',    subRole: 'Maintenance',    avatarBg: '#0ea5e9', badgeColor: '#d97706', badgeLabel: 'Staff', href: '/app/dashboard' },
  { id: 'u5', initials: 'FN', name: 'Fatima N.',  role: 'staff',    subRole: 'Guest Services', avatarBg: '#ec4899', badgeColor: '#d97706', badgeLabel: 'Staff', href: '/app/dashboard' },
  { id: 'u6', initials: 'MC', name: 'Michael C.', role: 'owner',    avatarBg: '#10b981', badgeColor: '#2563eb', badgeLabel: 'Owner',             href: '/owner' },
]

export default function LoginPage() {
  const { setUser } = useRole()
  const router = useRouter()

  const handleSelect = (user: DemoUser) => {
    const profile: UserProfile = {
      id: user.id,
      name: user.name,
      role: user.role,
      subRole: user.subRole,
      avatarInitials: user.initials,
      avatarColor: user.avatarBg,
    }
    setUser(profile)

    if (user.role === 'staff') {
      router.push('/staff/start')
    } else if (user.role === 'owner') {
      router.push('/owner')
    } else {
      router.push('/app/dashboard')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: `
        radial-gradient(ellipse at 20% 50%, #1e3a5f 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, #1a2e4a 0%, transparent 50%),
        #0f1923
      `,
      position: 'relative', overflow: 'hidden', padding: '40px 20px',
    }}>
      {/* Animated orbs */}
      {[
        { top: '10%', left: '5%',  size: 400, color: 'rgba(124,58,237,0.15)', delay: 0 },
        { top: '60%', left: '70%', size: 300, color: 'rgba(37,99,235,0.12)',  delay: 7 },
        { top: '30%', left: '50%', size: 350, color: 'rgba(14,165,233,0.1)',  delay: 14 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute', borderRadius: '50%',
            width: orb.size, height: orb.size,
            background: orb.color, filter: 'blur(80px)', pointerEvents: 'none',
            top: orb.top, left: orb.left,
          }}
          animate={{ x: [0, 30, -20, 0], y: [0, -25, 15, 0] }}
          transition={{ duration: 20, delay: orb.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Glass card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          maxWidth: 480, width: '100%', position: 'relative', zIndex: 1,
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24, padding: '40px 36px',
        }}
      >
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 16 }}>N</div>
          <span style={{ fontWeight: 800, color: '#fff', fontSize: 22, letterSpacing: '-0.02em' }}>NestOps</span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: 'rgba(124,58,237,0.3)', color: '#c4b5fd', letterSpacing: '0.04em' }}>v1.0 Beta</span>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>
          The operational layer for STR professionals
        </p>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 24 }} />

        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>
          Sign in as
        </div>

        {/* User grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {DEMO_USERS.map((user, i) => (
            <motion.button
              key={user.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              whileHover={{ y: -2, borderColor: user.avatarBg }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(user)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: user.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {user.initials}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{user.name}</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 20, background: `${user.badgeColor}30`, color: user.badgeColor }}>
                    {user.badgeLabel}
                  </span>
                  {user.subRole && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{user.subRole}</span>}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
          Demo mode · Click any profile to explore that role
        </p>
      </motion.div>

      {/* Footer */}
      <p style={{ position: 'relative', zIndex: 1, marginTop: 32, fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
        NestOps © 2026 · Built for STR operators
      </p>
    </div>
  )
}
