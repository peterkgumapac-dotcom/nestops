'use client'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { G_LIGHT, G_DARK, type GuestTheme } from './theme'

type ThemeMode = 'light' | 'dark' | 'system'

interface GuestThemeCtx {
  theme: GuestTheme
  mode: ThemeMode
  resolved: 'light' | 'dark'
  setMode: (m: ThemeMode) => void
  toggle: () => void
}

const Ctx = createContext<GuestThemeCtx>({
  theme: G_LIGHT,
  mode: 'system',
  resolved: 'light',
  setMode: () => {},
  toggle: () => {},
})

const STORAGE_KEY = 'guest-theme-mode'

function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getSavedMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
  return 'system'
}

export function GuestThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system')
  const [systemPref, setSystemPref] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // Hydrate from localStorage + system preference after mount
  useEffect(() => {
    setModeState(getSavedMode())
    setSystemPref(getSystemPreference())
    setMounted(true)

    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemPref(e.matches ? 'dark' : 'light')
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m)
    localStorage.setItem(STORAGE_KEY, m)
  }, [])

  const resolved: 'light' | 'dark' = mode === 'system' ? systemPref : mode

  const toggle = useCallback(() => {
    // Cycle: current resolved → opposite, pinned (not system)
    setMode(resolved === 'light' ? 'dark' : 'light')
  }, [resolved, setMode])

  const theme = resolved === 'dark' ? G_DARK : G_LIGHT

  const value = useMemo<GuestThemeCtx>(
    () => ({ theme, mode, resolved, setMode, toggle }),
    [theme, mode, resolved, setMode, toggle],
  )

  // Prevent flash: render light theme during SSR/hydration
  if (!mounted) {
    return (
      <Ctx.Provider value={{ theme: G_LIGHT, mode: 'system', resolved: 'light', setMode, toggle }}>
        {children}
      </Ctx.Provider>
    )
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useGuestTheme() {
  return useContext(Ctx)
}
