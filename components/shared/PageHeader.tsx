import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: ReactNode
  action?: ReactNode
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div
      className="flex items-start justify-between pb-5 mb-6"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div>
        <h1 className="text-2xl heading" style={{ color: 'var(--text-primary)' }}>{title}</h1>
        {subtitle && <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  )
}
