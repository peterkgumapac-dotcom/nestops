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
  jobRole?: UserProfile['jobRole']
  avatarBg: string
  badgeLabel: string
}

const DEMO_USERS: DemoUser[] = [
  { userId: 'pk', initials: 'PK', name: 'Peter K.',   role: 'operator' as Role, avatarBg: '#1D9E75', badgeLabel: 'Operator' },
  { userId: 'ms', initials: 'MS', name: 'Maria S.',   role: 'staff'    as Role, subRole: 'Cleaner',             jobRole: 'cleaner',       avatarBg: '#d97706', badgeLabel: 'Cleaner' },
  { userId: 'bl', initials: 'BL', name: 'Bjorn L.',   role: 'staff'    as Role, subRole: 'Maintenance',         jobRole: 'maintenance',   avatarBg: '#378ADD', badgeLabel: 'Maintenance' },
  { userId: 'fn', initials: 'FN', name: 'Fatima N.',  role: 'staff'    as Role, subRole: 'Guest Services',      jobRole: 'guest-services',avatarBg: '#ec4899', badgeLabel: 'Guest Svc' },
  { userId: 'ak', initials: 'AK', name: 'Anna K.',    role: 'staff'    as Role, subRole: 'Cleaning Supervisor', jobRole: 'supervisor',    avatarBg: '#06b6d4', badgeLabel: 'Supervisor' },
  { userId: 'cm', initials: 'CM', name: 'Carlos M.',  role: 'staff'    as Role, subRole: 'GS Supervisor',      jobRole: 'gs-supervisor', avatarBg: '#8b5cf6', badgeLabel: 'GS Supervisor' },
  { userId: 'sj', initials: 'SJ', name: 'Sarah J.',   role: 'owner'    as Role, avatarBg: '#7F77DD', badgeLabel: 'Owner' },
  { userId: 'mc', initials: 'MC', name: 'Michael C.', role: 'owner'    as Role, avatarBg: '#15d492', badgeLabel: 'Owner' },
]

const USER_ID_MAP: Record<string, string> = {
  pk: 'u1', ms: 'u3', bl: 'u4', fn: 'u5', ak: 'u7', cm: 'u8', sj: 'u2', mc: 'u6',
}

const DEMO_USER_MAP: Record<string, DemoUser> = Object.fromEntries(
  DEMO_USERS.map(u => [u.userId, u])
)

const CREDENTIALS = [
  { email: 'peter@nestops.com',    password: 'demo123', userId: 'pk' },
  { email: 'operator@nestops.com', password: 'demo123', userId: 'pk' },
  { email: 'maria@nestops.com',    password: 'demo123', userId: 'ms' },
  { email: 'staff@nestops.com',    password: 'demo123', userId: 'ms' },
  { email: 'bjorn@nestops.com',    password: 'demo123', userId: 'bl' },
  { email: 'fatima@nestops.com',   password: 'demo123', userId: 'fn' },
  { email: 'anna@nestops.com',     password: 'demo123', userId: 'ak' },
  { email: 'carlos@nestops.com',  password: 'demo123', userId: 'cm' },
  { email: 'sarah@nestops.com',    password: 'demo123', userId: 'sj' },
  { email: 'owner@nestops.com',    password: 'demo123', userId: 'sj' },
  { email: 'michael@nestops.com',  password: 'demo123', userId: 'mc' },
]

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --bg:#080b12; --bg2:#0f1219; --bg3:#161b26; --card:#111722;
    --border:rgba(255,255,255,0.06); --border2:rgba(255,255,255,0.1);
    --text:#e8e6e1; --text2:#9ca3af; --text3:#5a5f6b;
    --green:#1D9E75; --green2:#15d492;
    --green-bg:rgba(29,158,117,0.08); --green-border:rgba(29,158,117,0.2);
    --red:#e24b4a;
    --sans:'Outfit',system-ui,sans-serif;
    --mono:'JetBrains Mono',monospace;
  }
  .lp-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .lp-root {
    font-family: var(--sans);
    background: var(--bg);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow-x: hidden;
  }
  ::selection { background: var(--green); color: #fff; }

  /* Grain */
  .grain {
    position: fixed; inset: 0; pointer-events: none; z-index: 9999; opacity: 0.025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }
  /* Dot grid */
  .dot-grid {
    position: absolute; inset: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 32px 32px; pointer-events: none;
  }
  /* Glow */
  .hero-glow {
    position: absolute; top: -200px; left: 50%; transform: translateX(-50%);
    width: 800px; height: 600px;
    background: radial-gradient(ellipse, rgba(29,158,117,0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  /* Nav */
  .lp-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    padding: 14px 0;
    background: rgba(8,11,18,0.9);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .nav-inner {
    max-width: 960px; margin: 0 auto; padding: 0 24px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .nav-left { display: flex; align-items: center; gap: 10px; }
  .nav-logo {
    width: 32px; height: 32px; background: var(--green); border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 600; font-size: 14px; color: #fff; flex-shrink: 0;
  }
  .nav-name { font-size: 16px; font-weight: 600; color: var(--text); letter-spacing: -0.02em; }
  .nav-tag {
    font-size: 10px; padding: 2px 8px; border-radius: 6px;
    background: var(--bg3); color: var(--text3); font-weight: 500;
    font-family: var(--mono);
  }
  .nav-cta {
    padding: 8px 20px; border-radius: 8px; background: transparent;
    color: var(--text2); font-size: 13px; font-weight: 500;
    border: 1px solid var(--border); cursor: pointer;
    text-decoration: none; transition: all 0.15s; font-family: var(--sans);
  }
  .nav-cta:hover { border-color: var(--border2); color: var(--text); }

  /* Main content */
  .lp-main {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 120px 24px 60px; position: relative;
  }

  /* Hero badge */
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 16px; border-radius: 20px;
    border: 1px solid var(--green-border); background: var(--green-bg);
    font-size: 12px; color: var(--green2); font-weight: 500;
    margin-bottom: 24px;
  }
  .pulse {
    width: 6px; height: 6px; border-radius: 50%; background: var(--green2);
    animation: pulse 2s ease infinite; flex-shrink: 0;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.8); }
  }

  /* Card */
  .calc-card {
    background: var(--card); border: 1px solid var(--border2);
    border-radius: 16px; padding: 28px;
    position: relative; overflow: hidden;
    width: 100%; max-width: 440px;
  }
  .calc-card::before {
    content: ''; position: absolute; top: 0; left: 50%;
    transform: translateX(-50%); width: 200px; height: 1px;
    background: linear-gradient(90deg, transparent, var(--green), transparent);
  }

  /* Wordmark inside card */
  .card-wordmark {
    display: flex; align-items: center; gap: 10px; margin-bottom: 24px;
  }

  /* Form */
  .login-label {
    display: block; font-size: 11px; font-weight: 500; color: var(--text3);
    margin-bottom: 6px; letter-spacing: 0.06em; text-transform: uppercase;
  }
  .login-input {
    width: 100%; padding: 10px 12px; border-radius: 8px;
    background: var(--bg2); border: 1px solid var(--border);
    color: var(--text); font-size: 14px; outline: none;
    font-family: var(--sans); transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
  }
  .login-input:focus {
    border-color: rgba(29,158,117,0.4);
    box-shadow: 0 0 0 3px rgba(29,158,117,0.12);
  }
  .login-input.error { border-color: var(--red); }
  .login-input-wrap { position: relative; }
  .pw-toggle {
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    color: var(--text3); font-size: 16px; padding: 2px; line-height: 1;
  }

  /* Buttons */
  .cta-primary {
    display: block; width: 100%; padding: 14px; border-radius: 10px;
    background: var(--green); color: #fff; font-size: 14px; font-weight: 600;
    text-align: center; border: none; cursor: pointer;
    font-family: var(--sans); transition: all 0.15s; letter-spacing: -0.01em;
  }
  .cta-primary:hover {
    background: var(--green2);
    transform: translateY(-1px);
    box-shadow: 0 8px 30px rgba(29,158,117,0.25);
  }
  .cta-primary:disabled { opacity: 0.7; cursor: not-allowed; transform: none; box-shadow: none; }
  .cta-ghost {
    display: block; width: 100%; padding: 10px; border-radius: 10px;
    background: transparent; color: var(--text2); font-size: 12px;
    text-align: center; border: 1px solid var(--border);
    cursor: pointer; margin-top: 8px; font-family: var(--sans); transition: all 0.15s;
  }
  .cta-ghost:hover { border-color: var(--border2); color: var(--text); }

  /* Divider */
  .divider {
    display: flex; align-items: center; gap: 10px; margin: 20px 0 16px;
  }
  .divider-line { flex: 1; height: 1px; background: var(--border); }
  .divider-text { font-size: 11px; color: var(--text3); white-space: nowrap; }

  /* Demo section header */
  .demo-header {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;
  }
  .demo-header-label {
    font-size: 11px; font-weight: 500; color: var(--text3);
    letter-spacing: 0.08em; text-transform: uppercase;
  }
  .demo-header-hide {
    background: none; border: none; cursor: pointer;
    color: var(--text3); font-size: 12px; font-family: var(--sans);
    display: flex; align-items: center; gap: 4px;
  }
  .demo-header-hide:hover { color: var(--text2); }

  /* Tool cards (persona cards) */
  .tc {
    padding: 10px 12px; border-radius: 8px;
    border: 1px solid var(--border); background: var(--bg2);
    cursor: pointer; transition: all 0.12s;
    display: flex; align-items: center; gap: 10px;
    user-select: none; width: 100%; text-align: left;
    font-family: var(--sans); margin-bottom: 4px;
  }
  .tc:hover { border-color: var(--border2); background: var(--bg3); }
  .tc.on { border-color: var(--green-border); background: var(--green-bg); }
  .tc-name { font-size: 13px; font-weight: 500; color: var(--text); }
  .tc-meta { font-size: 10px; color: var(--text3); margin-top: 1px; }
  .tc-badge {
    font-size: 10px; font-weight: 500; padding: 2px 8px; border-radius: 6px;
    white-space: nowrap; margin-left: auto;
  }

  /* Error */
  .login-error { font-size: 12px; color: var(--red); margin-bottom: 12px; }

  /* Footer */
  .lp-footer {
    text-align: center; padding: 32px 0 24px;
    border-top: 1px solid var(--border); margin-top: auto;
  }
  .lp-footer p { font-size: 12px; color: var(--text3); }

  /* Floating switcher */
  .floating-wrap { position: fixed; bottom: 24px; right: 24px; z-index: 200; }
  .floating-panel {
    background: var(--card); border: 1px solid var(--border2);
    border-radius: 14px; padding: 14px 16px; margin-bottom: 10px;
    min-width: 230px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  }
  .floating-panel-title {
    font-size: 10px; font-weight: 500; color: var(--text3);
    letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 10px;
  }
  .floating-panel-divider { height: 1px; background: var(--border); margin-bottom: 10px; }
  .floating-btn {
    display: flex; align-items: center; gap: 10px;
    width: 100%; padding: 9px 10px; border-radius: 8px;
    background: var(--bg2); border: 1px solid var(--border);
    cursor: pointer; margin-bottom: 6px; text-align: left;
    font-family: var(--sans); transition: all 0.12s;
  }
  .floating-btn:hover { border-color: var(--border2); background: var(--bg3); }
  .floating-btn:last-child { margin-bottom: 0; }
  .floating-btn-name { font-size: 13px; font-weight: 500; color: var(--text); }
  .floating-btn-sub { font-size: 11px; color: var(--text3); }
  .floating-toggle {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 16px; border-radius: 40px;
    border: 1px solid var(--green); color: #fff; font-size: 13px; font-weight: 500;
    cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    font-family: var(--sans); transition: all 0.15s;
    background: var(--green);
  }
  .floating-toggle.open {
    background: var(--bg3); border-color: var(--border2); color: var(--text2);
  }
  .floating-toggle:hover { opacity: 0.9; }
`

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
  const [floatingOpen, setFloatingOpen] = useState(false)

  const buildProfile = (user: DemoUser): UserProfile => ({
    id: USER_ID_MAP[user.userId] ?? user.userId,
    name: user.name,
    role: user.role,
    subRole: user.subRole,
    jobRole: user.jobRole,
    avatarInitials: user.initials,
    avatarColor: user.avatarBg,
  })

  const handleDemoSelect = (user: DemoUser) => {
    if (isLoading) return
    setIsLoading(true)
    const profile = buildProfile(user)
    localStorage.setItem('nestops_user', JSON.stringify(profile))
    setUser(profile)
    let dest = '/briefing'
    if (profile.role === 'staff') {
      if (profile.jobRole === 'maintenance')               dest = '/briefing/maintenance'
      else if (profile.jobRole === 'gs-supervisor')        dest = '/briefing/gs-supervisor'
      else if (profile.jobRole === 'supervisor')           dest = '/briefing/supervisor'
      else if (profile.jobRole === 'guest-services')       dest = '/briefing/guest-services'
      else if (profile.jobRole === 'cleaner')              dest = '/briefing/cleaners'
      // subRole fallback
      else if (profile.subRole?.includes('Maintenance'))   dest = '/briefing/maintenance'
      else if (profile.subRole?.includes('Guest'))         dest = '/briefing/guest-services'
      else if (profile.subRole?.includes('Cleaner') || profile.subRole?.includes('Cleaning'))
                                                           dest = '/briefing/cleaners'
    }
    router.push(dest)
  }

  const handleFloatingLogin = (userId: string) => {
    const user = DEMO_USER_MAP[userId]
    if (!user || isLoading) return
    setIsLoading(true)
    const profile = buildProfile(user)
    localStorage.setItem('nestops_user', JSON.stringify(profile))
    setUser(profile)
    let dest = '/app/my-tasks'
    if (user.role === 'operator') dest = '/app/dashboard'
    else if (user.role === 'owner') dest = '/owner'
    else if (user.jobRole === 'supervisor' || user.jobRole === 'gs-supervisor') dest = '/app/dashboard'
    router.push(dest)
  }

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
          // Route by role — same logic as handleDemoSelect
          let dest = '/briefing'
          if (profile.role === 'owner') dest = '/owner'
          else if (profile.role === 'operator') dest = '/app/dashboard'
          else if (profile.role === 'staff') {
            if (profile.jobRole === 'maintenance')         dest = '/briefing/maintenance'
            else if (profile.jobRole === 'gs-supervisor')  dest = '/briefing/gs-supervisor'
            else if (profile.jobRole === 'supervisor')     dest = '/briefing/supervisor'
            else if (profile.jobRole === 'guest-services') dest = '/briefing/guest-services'
            else if (profile.jobRole === 'cleaner')        dest = '/briefing/cleaners'
          }
          router.push(dest)
        }, 150)
      }
    } else {
      setError('Invalid email or password')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="lp-root">
      {/* CSS injection */}
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Grain */}
      <div className="grain" />

      {/* Nav */}
      <nav className="lp-nav">
        <div className="nav-inner">
          <div className="nav-left">
            <div className="nav-logo">N</div>
            <span className="nav-name">NestOps</span>
            <span className="nav-tag">v4.0</span>
          </div>
          <a href="/" className="nav-cta">← Back to home</a>
        </div>
      </nav>

      {/* Main */}
      <main className="lp-main">
        <div className="dot-grid" />
        <div className="hero-glow" />

        {/* Greeting badge */}
        <div className="hero-badge">
          <span className="pulse" />
          {greeting} — sign in to your workspace
        </div>

        {/* Login card */}
        <motion.div
          className="calc-card"
          initial={{ opacity: 0, y: 16 }}
          animate={shake
            ? { opacity: 1, y: 0, x: [0, -8, 8, -8, 8, 0] }
            : { opacity: 1, y: 0, x: 0 }
          }
          transition={shake ? { duration: 0.4 } : { duration: 0.25 }}
        >
          {/* Wordmark */}
          <div className="card-wordmark">
            <div className="nav-logo">N</div>
            <span className="nav-name">NestOps</span>
            <span className="nav-tag">v4.0</span>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 12 }}>
            <label className="login-label">Email</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="peter@nestops.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={e => { if (e.key === 'Enter') handleLogin() }}
              className={`login-input${error ? ' error' : ''}`}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: error ? 8 : 20 }}>
            <label className="login-label">Password</label>
            <div className="login-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                onKeyDown={e => { if (e.key === 'Enter') handleLogin() }}
                className={`login-input${error ? ' error' : ''}`}
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && <div className="login-error">{error}</div>}

          {/* Sign In */}
          <button
            className="cta-primary"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in…' : 'Sign In →'}
          </button>

          {/* Divider */}
          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">or</span>
            <div className="divider-line" />
          </div>

          {/* Demo toggle */}
          <AnimatePresence mode="wait">
            {!showDemo ? (
              <motion.button
                key="try-demo"
                className="cta-ghost"
                style={{ marginTop: 0 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDemo(true)}
              >
                Try Demo — sign in as a persona
              </motion.button>
            ) : (
              <motion.div
                key="demo-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="demo-header">
                  <span className="demo-header-label">Sign in as</span>
                  <button className="demo-header-hide" onClick={() => setShowDemo(false)}>
                    ↑ Hide
                  </button>
                </div>
                <div>
                  {DEMO_USERS.map((user, i) => (
                    <motion.button
                      key={user.userId}
                      className="tc"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => handleDemoSelect(user)}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: user.avatarBg, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 600, color: '#fff',
                      }}>
                        {user.initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="tc-name">{user.name}</div>
                        <div className="tc-meta">{user.subRole ?? user.badgeLabel}</div>
                      </div>
                      <span className="tc-badge" style={{
                        background: user.avatarBg + '20',
                        color: user.avatarBg,
                        border: `1px solid ${user.avatarBg}30`,
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

        {/* Footer */}
        <p style={{ marginTop: 32, fontSize: 11, color: 'var(--text3)', position: 'relative', zIndex: 1 }}>
          NestOps © {new Date().getFullYear()} · Built for STR operators
        </p>
      </main>

      {/* Floating Demo Switcher */}
      <div className="floating-wrap">
        <AnimatePresence>
          {floatingOpen && (
            <motion.div
              className="floating-panel"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <div className="floating-panel-title">Demo Personas</div>
              <div className="floating-panel-divider" />
              {[
                { userId: 'pk', emoji: '⚙️', label: 'Operator',       sub: 'Peter K. · /app/dashboard' },
                { userId: 'ms', emoji: '🧹', label: 'Cleaner',         sub: 'Maria S. · /app/my-tasks' },
                { userId: 'bl', emoji: '🔧', label: 'Maintenance',     sub: 'Bjorn L. · /app/my-tasks' },
                { userId: 'fn', emoji: '🛎️', label: 'Guest Services',  sub: 'Fatima N. · /app/my-tasks' },
                { userId: 'ak', emoji: '👷', label: 'Supervisor',      sub: 'Anna K. · /app/dashboard' },
                { userId: 'cm', emoji: '🎧', label: 'GS Supervisor',   sub: 'Carlos M. · /app/dashboard' },
                { userId: 'sj', emoji: '🏠', label: 'Owner',           sub: 'Sarah J. · /owner' },
                { userId: 'mc', emoji: '🏠', label: 'Owner',           sub: 'Michael C. · /owner' },
              ].map(p => (
                <button key={p.userId} className="floating-btn" onClick={() => handleFloatingLogin(p.userId)}>
                  <span style={{ fontSize: 16 }}>{p.emoji}</span>
                  <div>
                    <div className="floating-btn-name">Login as {p.label}</div>
                    <div className="floating-btn-sub">{p.sub}</div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <button
          className={`floating-toggle${floatingOpen ? ' open' : ''}`}
          onClick={() => setFloatingOpen(v => !v)}
        >
          <span>🎭</span>
          <span>{floatingOpen ? 'Close' : 'Demo Personas'}</span>
        </button>
      </div>
    </div>
  )
}
