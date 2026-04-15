'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, CheckSquare, CalendarDays, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAlerts } from '@/context/AlertsContext'

interface TabItem {
  label: string
  href: string
  icon: typeof Home
}

const TABS: TabItem[] = [
  { label: 'Today',    href: '/app/cleaner',          icon: Home },
  { label: 'Tasks',    href: '/app/my-tasks',         icon: CheckSquare },
  { label: 'Schedule', href: '/app/cleaner/schedule',  icon: CalendarDays },
  { label: 'Alerts',   href: '/app/alerts',            icon: Bell },
  { label: 'Profile',  href: '/app/my-account',        icon: User },
]

/**
 * Standalone bottom tab bar for cleaners on mobile.
 * Uses `md:hidden` so it only renders on <768px — no hydration mismatch.
 */
export default function CleanerBottomTabs() {
  const pathname = usePathname()
  const { getAlertsForRole } = useAlerts()
  const alertCount = getAlertsForRole('cleaner').filter(a => !a.dismissed).length

  const isActive = (href: string) => {
    if (href === '/app/cleaner') return pathname === '/app/cleaner'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] md:hidden"
      style={{
        background: 'rgba(20,21,30,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-stretch justify-around max-w-lg mx-auto">
        {TABS.map(tab => {
          const active = isActive(tab.href)
          const Icon = tab.icon
          const showBadge = tab.label === 'Alerts' && alertCount > 0

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[56px] min-h-[52px] no-underline transition-colors duration-150',
                active
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--text-subtle)] hover:text-[var(--text-muted)]'
              )}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={active ? 2 : 1.5} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 rounded-full bg-[var(--status-red-fg)] text-white text-[9px] font-semibold flex items-center justify-center px-1">
                    {alertCount > 9 ? '9+' : alertCount}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-[10px] leading-tight',
                active ? 'font-semibold' : 'font-medium'
              )}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
