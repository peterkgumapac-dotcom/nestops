'use client'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import GuestServicesNav from '@/components/guest-services/GuestServicesNav'

export default function IssuesRedirectPage() {
  const router = useRouter()

  return (
    <div>
      <PageHeader
        title="Guest Issues"
        subtitle="Now managed in the unified Tickets page"
      />
      <GuestServicesNav />

      <div style={{ maxWidth: 520, marginTop: 32 }}>
        <div style={{
          padding: '14px 16px', borderRadius: 10,
          background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)',
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            Guest Issues now live in Tickets
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            All guest-reported issues are managed in the unified Tickets page.
            Use the Source filter to view guest tickets specifically.
          </div>
        </div>
        <button
          onClick={() => router.push('/operator/tickets?source=guest')}
          style={{
            padding: '10px 20px', borderRadius: 8, border: 'none',
            background: '#3b82f6', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          View Guest Tickets →
        </button>
      </div>
    </div>
  )
}
