'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, AlertCircle, DollarSign, BarChart2, ShieldCheck, ArrowUpCircle } from 'lucide-react'
import { useRole } from '@/context/RoleContext'

const SUBROUTES = ['', '/verifications', '/upsells', '/issues', '/refunds', '/analytics']
const ICONS = [LayoutDashboard, ShieldCheck, ArrowUpCircle, AlertCircle, DollarSign, BarChart2]
const LABELS = ['Overview', 'Verifications', 'Upsells', 'Issues', 'Refunds', 'Analytics']

export default function GuestServicesNav() {
  const pathname = usePathname()
  const { accent } = useRole()

  // Detect base prefix: /operator/guest-services or /app/guest-services
  const base = pathname.startsWith('/app/') ? '/app/guest-services' : '/operator/guest-services'

  const NAV_ITEMS = SUBROUTES.map((sub, i) => ({
    label: LABELS[i],
    href: base + sub,
    icon: ICONS[i],
  }))

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        marginBottom: 24,
        padding: '4px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        width: 'fit-content',
      }}
    >
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '7px 14px',
              borderRadius: 7,
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              color: active ? accent : 'var(--text-muted)',
              background: active ? `${accent}18` : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Icon size={14} />
            {label}
          </Link>
        )
      })}
    </div>
  )
}
