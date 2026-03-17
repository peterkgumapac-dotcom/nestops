'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, AlertCircle, DollarSign, BarChart2 } from 'lucide-react'
import { useRole } from '@/context/RoleContext'

const NAV_ITEMS = [
  { label: 'Overview',  href: '/operator/guest-services',           icon: LayoutDashboard },
  { label: 'Issues',    href: '/operator/guest-services/issues',    icon: AlertCircle },
  { label: 'Refunds',   href: '/operator/guest-services/refunds',   icon: DollarSign },
  { label: 'Analytics', href: '/operator/guest-services/analytics', icon: BarChart2 },
]

export default function GuestServicesNav() {
  const pathname = usePathname()
  const { accent } = useRole()

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
