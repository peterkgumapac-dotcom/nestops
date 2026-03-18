'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useRole } from '@/context/RoleContext'
import type { Role, UserProfile } from '@/context/RoleContext'

interface DemoUser {
  id: string
  initials: string
  name: string
  role: Role
  subRole?: string
  avatarBg: string
  badgeLabel: string
}

const DEMO_USERS: DemoUser[] = [
  { id: 'u1', initials: 'PK', name: 'Peter K.',   role: 'operator' as Role, avatarBg: '#7c3aed', badgeLabel: 'Operator' },
  { id: 'u3', initials: 'MS', name: 'Maria S.',   role: 'staff'    as Role, subRole: 'Cleaning Team',  avatarBg: '#d97706', badgeLabel: 'Cleaning' },
  { id: 'u4', initials: 'BL', name: 'Bjorn L.',   role: 'staff'    as Role, subRole: 'Maintenance',    avatarBg: '#0ea5e9', badgeLabel: 'Maintenance' },
  { id: 'u5', initials: 'FN', name: 'Fatima N.',  role: 'staff'    as Role, subRole: 'Guest Services', avatarBg: '#ec4899', badgeLabel: 'Guest Svc' },
  { id: 'u2', initials: 'SJ', name: 'Sarah J.',   role: 'owner'    as Role, avatarBg: '#2563eb', badgeLabel: 'Owner' },
  { id: 'u6', initials: 'MC', name: 'Michael C.', role: 'owner'    as Role, avatarBg: '#10b981', badgeLabel: 'Owner' },
]

const CREDENTIALS = [
  { email: 'peter@nestops.com',   password: 'demo123', userId: 'u1' },
  { email: 'maria@nestops.com',   password: 'demo123', userId: 'u3' },
  { email: 'bjorn@nestops.com',   password: 'demo123', userId: 'u4' },
  { email: 'fatima@nestops.com',  password: 'demo123', userId: 'u5' },
  { email: 'sarah@nestops.com',   password: 'demo123', userId: 'u2' },
  { email: 'michael@nestops.com', password: 'demo123', userId: 'u6' },
]

export default function LoginPage() {
  const { setUser } = useRole()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [showDemo, setShowDemo] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const buildProfile = (user: DemoUser): UserProfile => ({
    id: user.id,
    name: user.name,
    role: user.role,
    subRole: user.subRole,
    avatarInitials: user.initials,
    avatarColor: user.avatarBg,
  })

  const handleDemoSelect = (user: DemoUser) => {
    const profile = buildProfile(user)
    localStorage.setItem('nestops_user', JSON.stringify(profile))
    setUser(profile)
    router.push('/app/dashboard')
  }

  const handleLogin = () => {
    setError('')
    const cred = CREDENTIALS.find(
      c => c.email.toLowerCase() === email.toLowerCase() && c.password === password
    )
    if (cred) {
      setIsLoading(true)
      const demoUser = DEMO_USERS.find(u => u.id === cred.userId)
      if (demoUser) {
        const profile = buildProfile(demoUser)
        localStorage.setItem('nestops_user', JSON.stringify(profile))
        setUser(profile)
        router.push('/app/dashboard')
      }
    } else {
      setError('Invalid email or password')
      setShake(true)
      setTimeout(() => setShake(false), 500)
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
        animate={shake
          ? { opacity: 1, scale: 1, y: 0, x: [0, -8, 8, -8, 8, 0] }
          : { opacity: 1, scale: 1, y: 0, x: 0 }
        }
        transition={shake ? { duration: 0.4 } : { duration: 0.4 }}
        style={{
          maxWidth: 440, width: '100%', position: 'relative', zIndex: 1,
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${error ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 24, padding: '40px 36px',
        }}
      >
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 16 }}>N</div>
          <span style={{ fontWeight: 800, color: '#fff', fontSize: 22, letterSpacing: '-0.02em' }}>NestOps</span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: 'rgba(124,58,237,0.3)', color: '#c4b5fd', letterSpacing: '0.04em' }}>v1.0 Beta</span>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Welcome back</h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>Sign in to your account</p>

        {/* Email input */}
        <div style={{ marginBottom: 14 }}>
          <input
            type="email"
            autoComplete="email"
            placeholder="Email address"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 10,
              background: 'rgba(255,255,255,0.07)',
              border: `1px solid ${error ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.12)'}`,
              color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Password input */}
        <div style={{ marginBottom: 8, position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            onKeyDown={e => { if (e.key === 'Enter') handleLogin() }}
            style={{
              width: '100%', padding: '12px 48px 12px 16px', borderRadius: 10,
              background: 'rgba(255,255,255,0.07)',
              border: `1px solid ${error ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.12)'}`,
              color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
            }}
          />
          <button
            onClick={() => setShowPassword(v => !v)}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 4,
            }}
          >
            {showPassword ? '🙈' : '👁'}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div style={{ fontSize: 12, color: '#f87171', marginBottom: 12, marginTop: 4 }}>
            {error}
          </div>
        )}

        {/* Sign In button */}
        <motion.button
          whileHover={{ opacity: 0.9 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            width: '100%', padding: '14px', borderRadius: 10, marginTop: 8,
            background: '#7c3aed', color: '#fff', fontSize: 15, fontWeight: 700,
            border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? 'Signing in…' : 'Sign In →'}
        </motion.button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 16px' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>Demo Access</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* Try Demo button */}
        <AnimatePresence mode="wait">
          {!showDemo ? (
            <motion.button
              key="try-demo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ borderColor: 'rgba(255,255,255,0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDemo(true)}
              style={{
                width: '100%', padding: '12px', borderRadius: 10,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try Demo →
            </motion.button>
          ) : (
            <motion.div
              key="demo-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              {/* Back button */}
              <button
                onClick={() => setShowDemo(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.5)', fontSize: 13, padding: '0 0 12px 0',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                ← Back
              </button>

              {/* User grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {DEMO_USERS.map((user, i) => (
                  <motion.button
                    key={user.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -2, borderColor: user.avatarBg }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleDemoSelect(user)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: user.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {user.initials}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{user.name}</div>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 20, background: `${user.avatarBg}30`, color: user.avatarBg }}>
                        {user.badgeLabel}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer */}
      <p style={{ position: 'relative', zIndex: 1, marginTop: 32, fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
        NestOps © 2026 · Built for STR operators
      </p>
    </div>
  )
}
