'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useRole } from '@/context/RoleContext'
import type { Role, UserProfile } from '@/context/RoleContext'

interface DemoUser {
  userId: string
  initials: string
  name: string
  role: Role
  subRole?: string
  avatarBg: string
  badgeLabel: string
}

const DEMO_USERS: DemoUser[] = [
  { userId: 'pk', initials: 'PK', name: 'Peter K.',   role: 'operator' as Role, avatarBg: '#7c3aed', badgeLabel: 'Operator' },
  { userId: 'ms', initials: 'MS', name: 'Maria S.',   role: 'staff'    as Role, subRole: 'Cleaning Team',  avatarBg: '#d97706', badgeLabel: 'Cleaning' },
  { userId: 'bl', initials: 'BL', name: 'Bjorn L.',   role: 'staff'    as Role, subRole: 'Maintenance',    avatarBg: '#0ea5e9', badgeLabel: 'Maintenance' },
  { userId: 'fn', initials: 'FN', name: 'Fatima N.',  role: 'staff'    as Role, subRole: 'Guest Services', avatarBg: '#ec4899', badgeLabel: 'Guest Svc' },
  { userId: 'sj', initials: 'SJ', name: 'Sarah J.',   role: 'owner'    as Role, avatarBg: '#2563eb', badgeLabel: 'Owner' },
  { userId: 'mc', initials: 'MC', name: 'Michael C.', role: 'owner'    as Role, avatarBg: '#10b981', badgeLabel: 'Owner' },
]

const USER_ID_MAP: Record<string, string> = {
  pk: 'u1', ms: 'u3', bl: 'u4', fn: 'u5', sj: 'u2', mc: 'u6',
}

const DEMO_USER_MAP: Record<string, DemoUser> = Object.fromEntries(
  DEMO_USERS.map(u => [u.userId, u])
)

const CREDENTIALS = [
  { email: 'peter@nestops.com',   password: 'demo123', userId: 'pk' },
  { email: 'maria@nestops.com',   password: 'demo123', userId: 'ms' },
  { email: 'bjorn@nestops.com',   password: 'demo123', userId: 'bl' },
  { email: 'fatima@nestops.com',  password: 'demo123', userId: 'fn' },
  { email: 'sarah@nestops.com',   password: 'demo123', userId: 'sj' },
  { email: 'michael@nestops.com', password: 'demo123', userId: 'mc' },
]

export default function LoginPage() {
  const { setUser } = useRole()
  const router = useRouter()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [showDemo, setShowDemo] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  const buildProfile = (user: DemoUser): UserProfile => ({
    id: USER_ID_MAP[user.userId] ?? user.userId,
    name: user.name,
    role: user.role,
    subRole: user.subRole,
    avatarInitials: user.initials,
    avatarColor: user.avatarBg,
  })

  // Demo click → briefing (morning ritual flow)
  const handleDemoSelect = (user: DemoUser) => {
    if (isLoading) return
    setIsLoading(true)
    const profile = buildProfile(user)
    localStorage.setItem('nestops_user', JSON.stringify(profile))
    setUser(profile)
    router.push('/briefing')
  }

  // Email+password login → dashboard directly (power user, skip briefing)
  const handleLogin = () => {
    setError('')
    const cred = CREDENTIALS.find(
      c => c.email.toLowerCase() === email.toLowerCase() && c.password === password
    )
    if (cred) {
      const demoUser = DEMO_USER_MAP[cred.userId]
      if (demoUser) {
        setIsLoading(true)
        setTimeout(() => {
          const profile = buildProfile(demoUser)
          localStorage.setItem('nestops_user', JSON.stringify(profile))
          setUser(profile)
          router.push('/app/dashboard')
        }, 150)
      }
    } else {
      setError('Invalid email or password')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0f1a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={shake
          ? { opacity: 1, y: 0, x: [0, -8, 8, -8, 8, 0] }
          : { opacity: 1, y: 0, x: 0 }
        }
        transition={shake ? { duration: 0.4 } : { duration: 0.2 }}
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#111827',
          border: `1px solid ${error ? '#dc2626' : '#1f2937'}`,
          borderRadius: 12,
          padding: '32px 28px',
        }}
      >
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: '#7c3aed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: '#fff', fontSize: 14, flexShrink: 0,
          }}>N</div>
          <span style={{ fontWeight: 800, color: '#f9fafb', fontSize: 20, letterSpacing: '-0.02em' }}>NestOps</span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
            background: 'rgba(124,58,237,0.2)', color: '#a78bfa', letterSpacing: '0.04em', marginLeft: 4,
          }}>v1.0 Beta</span>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f9fafb', marginBottom: 4 }}>{greeting}</h2>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>Sign in to continue</p>

        {/* Email */}
        <div style={{ marginBottom: 12 }}>
          <label style={{
            display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280',
            marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>Email</label>
          <input
            type="email"
            autoComplete="email"
            placeholder="peter@nestops.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            onKeyDown={e => { if (e.key === 'Enter') handleLogin() }}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              background: '#1f2937',
              border: `1px solid ${error ? '#dc2626' : '#374151'}`,
              color: '#f9fafb', fontSize: 14, outline: 'none', boxSizing: 'border-box',
              boxShadow: emailFocused ? '0 0 0 3px rgba(124,58,237,0.25)' : 'none',
              transition: 'box-shadow 0.15s',
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: error ? 6 : 20, position: 'relative' }}>
          <label style={{
            display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280',
            marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            onKeyDown={e => { if (e.key === 'Enter') handleLogin() }}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            style={{
              width: '100%', padding: '10px 40px 10px 12px', borderRadius: 8,
              background: '#1f2937',
              border: `1px solid ${error ? '#dc2626' : '#374151'}`,
              color: '#f9fafb', fontSize: 14, outline: 'none', boxSizing: 'border-box',
              boxShadow: passwordFocused ? '0 0 0 3px rgba(124,58,237,0.25)' : 'none',
              transition: 'box-shadow 0.15s',
            }}
          />
          <button
            onClick={() => setShowPassword(v => !v)}
            style={{
              position: 'absolute', right: 10, bottom: 9,
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6b7280', fontSize: 16, padding: 2, lineHeight: 1,
            }}
          >
            {showPassword ? '🙈' : '👁'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ fontSize: 12, color: '#dc2626', marginBottom: 14 }}>
            {error}
          </div>
        )}

        {/* Sign In */}
        <motion.button
          whileHover={{ opacity: 0.9 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            width: '100%', padding: '11px', borderRadius: 8,
            background: '#7c3aed', color: '#fff', fontSize: 14, fontWeight: 700,
            border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? 'Signing in…' : 'Sign In →'}
        </motion.button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 16px' }}>
          <div style={{ flex: 1, height: 1, background: '#1f2937' }} />
          <span style={{ fontSize: 11, color: '#4b5563', whiteSpace: 'nowrap' }}>or</span>
          <div style={{ flex: 1, height: 1, background: '#1f2937' }} />
        </div>

        {/* Demo toggle */}
        <AnimatePresence mode="wait">
          {!showDemo ? (
            <motion.button
              key="try-demo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDemo(true)}
              style={{
                width: '100%', padding: '10px', borderRadius: 8,
                background: 'transparent',
                border: '1px solid #1f2937',
                color: '#9ca3af', fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try Demo
            </motion.button>
          ) : (
            <motion.div
              key="demo-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Sign in as
                </span>
                <button
                  onClick={() => setShowDemo(false)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#6b7280', fontSize: 13, padding: 0,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  ↑ Hide
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {DEMO_USERS.map((user, i) => (
                  <motion.button
                    key={user.userId}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDemoSelect(user)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '9px 12px', borderRadius: 8,
                      background: '#0d1525',
                      border: '1px solid #1f2937',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: user.avatarBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
                    }}>
                      {user.initials}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#f9fafb', flex: 1 }}>
                      {user.name}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      padding: '2px 8px', borderRadius: 4,
                      background: user.avatarBg + '25',
                      color: user.avatarBg,
                    }}>
                      {user.badgeLabel}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <p style={{ marginTop: 28, fontSize: 11, color: '#374151' }}>
        NestOps © {new Date().getFullYear()} · Built for STR operators
      </p>
    </div>
  )
}
