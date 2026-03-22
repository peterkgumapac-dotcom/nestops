'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Role = 'operator' | 'owner' | 'staff' | 'vendor'

export interface UserProfile {
  id: string
  name: string
  role: Role
  subRole?: string
  jobRole?: 'cleaner' | 'supervisor' | 'maintenance' | 'guest-services' | 'gs-supervisor'
  avatarInitials: string
  avatarColor: string
}

interface RoleContextType {
  role: Role
  setRole: (r: Role) => void
  user: UserProfile | null
  setUser: (u: UserProfile) => void
  accent: string
  accentVar: string
  portalLabel: string
  meshClass: string
}

const ROLE_META: Record<Role, { accent: string; accentVar: string; portalLabel: string; meshClass: string }> = {
  operator: { accent: '#1D9E75', accentVar: 'var(--accent-operator)', portalLabel: 'Operator Portal', meshClass: 'mesh-operator' },
  owner:    { accent: '#059669', accentVar: 'var(--accent-owner)',    portalLabel: 'Owner Portal',    meshClass: 'mesh-owner' },
  staff:    { accent: '#d97706', accentVar: 'var(--accent-staff)',    portalLabel: 'Staff Portal',    meshClass: 'mesh-staff' },
  vendor:   { accent: '#0ea5e9', accentVar: 'var(--accent-vendor)',   portalLabel: 'Vendor Portal',   meshClass: 'mesh-operator' },
}

const RoleContext = createContext<RoleContextType | null>(null)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>('operator')
  const [user, setUserState] = useState<UserProfile | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('nestops_user')
    if (savedUser) {
      try {
        const u: UserProfile = JSON.parse(savedUser)
        setUserState(u)
        setRoleState(u.role)
        applyAccent(u.role)
        return
      } catch { /* fall through */ }
    }
    const saved = localStorage.getItem('nestops_role') as Role | null
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

  const setRole = (r: Role) => {
    setRoleState(r)
    localStorage.setItem('nestops_role', r)
    applyAccent(r)
    // Patch nestops_user so page refresh doesn't revert to old role
    try {
      const raw = localStorage.getItem('nestops_user')
      if (raw) {
        const u = JSON.parse(raw)
        localStorage.setItem('nestops_user', JSON.stringify({ ...u, role: r }))
      }
    } catch {}
  }

  const setUser = (u: UserProfile) => {
    setUserState(u)
    setRoleState(u.role)
    localStorage.setItem('nestops_user', JSON.stringify(u))
    localStorage.setItem('nestops_role', u.role)
    applyAccent(u.role)
  }

  return (
    <RoleContext.Provider value={{ role, setRole, user, setUser, ...ROLE_META[role] }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) {
    return {
      role: 'operator' as Role,
      setRole: () => {},
      user: null,
      setUser: () => {},
      accent: '#1D9E75',
      accentVar: 'var(--accent-operator)',
      portalLabel: 'Operator Portal',
      meshClass: 'mesh-operator',
    }
  }
  return ctx
}
