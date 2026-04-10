'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Role = 'operator' | 'owner' | 'staff' | 'vendor'
export type AccessTier = 'full' | 'guest-services' | 'preview'

export interface UserProfile {
  id: string
  name: string
  role: Role
  accessTier?: AccessTier
  subRole?: string
  jobRole?: 'cleaner' | 'supervisor' | 'maintenance'
  avatarInitials: string
  avatarColor: string
}

interface RoleContextType {
  role: Role
  accessTier: AccessTier
  setRole: (r: Role, tier?: AccessTier) => void
  user: UserProfile | null
  setUser: (u: UserProfile) => void
  accent: string
  accentVar: string
  portalLabel: string
  meshClass: string
}

const ROLE_META: Record<Role, { accent: string; accentVar: string; portalLabel: string; meshClass: string }> = {
  operator: { accent: '#14b8a6', accentVar: 'var(--accent-operator)', portalLabel: 'Operator Portal', meshClass: 'mesh-operator' },
  owner:    { accent: '#10b981', accentVar: 'var(--accent-owner)',    portalLabel: 'Owner Portal',    meshClass: 'mesh-owner' },
  staff:    { accent: '#f59e0b', accentVar: 'var(--accent-staff)',    portalLabel: 'Staff Portal',    meshClass: 'mesh-staff' },
  vendor:   { accent: '#0ea5e9', accentVar: 'var(--accent-vendor)',   portalLabel: 'Vendor Portal',   meshClass: 'mesh-operator' },
}

const RoleContext = createContext<RoleContextType | null>(null)

/** Migrate old GS-as-staff profiles to operator+accessTier */
function migrateProfile(u: Record<string, unknown>): UserProfile {
  const oldJobRole = u.jobRole as string | undefined
  if (u.role === 'staff' && (oldJobRole === 'guest-services' || oldJobRole === 'gs-supervisor')) {
    const migrated = {
      ...u,
      role: 'operator' as Role,
      accessTier: 'guest-services' as AccessTier,
      jobRole: undefined,
    }
    delete migrated.jobRole
    localStorage.setItem('afterstay_user', JSON.stringify(migrated))
    return migrated as unknown as UserProfile
  }
  return u as unknown as UserProfile
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>('operator')
  const [accessTier, setAccessTierState] = useState<AccessTier>('full')
  const [user, setUserState] = useState<UserProfile | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('afterstay_user')
    if (savedUser) {
      try {
        const u = migrateProfile(JSON.parse(savedUser))
        setUserState(u)
        setRoleState(u.role)
        setAccessTierState(u.accessTier ?? 'full')
        applyAccent(u.role)
        return
      } catch { /* fall through */ }
    }
    const saved = localStorage.getItem('afterstay_role') as Role | null
    if (saved && ROLE_META[saved]) {
      setRoleState(saved)
      applyAccent(saved)
    } else {
      applyAccent('operator')
    }
  }, [])

  const applyAccent = (r: Role) => {
    document.documentElement.style.setProperty('--accent', ROLE_META[r].accent)
  }

  const setRole = (r: Role, tier?: AccessTier) => {
    setRoleState(r)
    const newTier = tier ?? 'full'
    setAccessTierState(newTier)
    localStorage.setItem('afterstay_role', r)
    applyAccent(r)
    try {
      const raw = localStorage.getItem('afterstay_user')
      if (raw) {
        const u = JSON.parse(raw)
        localStorage.setItem('afterstay_user', JSON.stringify({ ...u, role: r, accessTier: newTier }))
      }
    } catch {}
  }

  const setUser = (u: UserProfile) => {
    setUserState(u)
    setRoleState(u.role)
    setAccessTierState(u.accessTier ?? 'full')
    localStorage.setItem('afterstay_user', JSON.stringify(u))
    localStorage.setItem('afterstay_role', u.role)
    applyAccent(u.role)
  }

  const portalLabel = role === 'operator' && accessTier === 'guest-services'
    ? 'Guest Services'
    : ROLE_META[role].portalLabel

  return (
    <RoleContext.Provider value={{ role, accessTier, setRole, user, setUser, ...ROLE_META[role], portalLabel }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) {
    return {
      role: 'operator' as Role,
      accessTier: 'full' as AccessTier,
      setRole: () => {},
      user: null,
      setUser: () => {},
      accent: '#14b8a6',
      accentVar: 'var(--accent-operator)',
      portalLabel: 'Operator Portal',
      meshClass: 'mesh-operator',
    }
  }
  return ctx
}
