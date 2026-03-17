'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Bed, Bath, ArrowLeft, User, Link2, RefreshCw, CheckCircle, Loader2 } from 'lucide-react'
import { PROPERTIES } from '@/lib/data/properties'
import { OWNERS } from '@/lib/data/owners'
import { REQUESTS } from '@/lib/data/requests'
import StatusBadge from '@/components/shared/StatusBadge'
import Tabs from '@/components/shared/Tabs'
import { useRole } from '@/context/RoleContext'

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { accent } = useRole()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const property = PROPERTIES.find(p => p.id === id)
  const owner = property ? OWNERS.find(o => o.id === property.ownerId) : null
  const propertyRequests = REQUESTS.filter(r => r.propertyId === id)

  const [activeTab, setActiveTab] = useState('overview')
  const [icalUrl, setIcalUrl] = useState('')
  const [syncState, setSyncState] = useState<'idle' | 'loading' | 'success'>('idle')

  if (!property) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Property not found</div>
        <button
          onClick={() => router.push('/operator/properties')}
          style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', cursor: 'pointer', fontSize: 14 }}
        >
          Back to Properties
        </button>
      </div>
    )
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'compliance', label: 'Compliance' },
    { key: 'requests', label: 'Requests', count: propertyRequests.length },
    { key: 'assets', label: 'Assets' },
    { key: 'cleaning', label: 'Cleaning' },
  ]

  function handleSync() {
    setSyncState('loading')
    setTimeout(() => setSyncState('success'), 1500)
  }

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => router.push('/operator/properties')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, marginBottom: 16, padding: 0 }}
      >
        <ArrowLeft size={14} />
        Back to Properties
      </button>

      {/* Hero */}
      <div style={{ position: 'relative', height: 224, borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
        {property.imageUrl ? (
          <Image
            src={property.imageUrl}
            alt={property.name}
            fill
            style={{ objectFit: 'cover' }}
            sizes="100vw"
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${accent}33, ${accent}11)` }} />
        )}
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />
        {/* Text overlay */}
        <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{property.name}</h1>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{property.address}, {property.city}</div>
            </div>
            <StatusBadge status={property.status} />
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-primary)' }}>
          <Bed size={14} style={{ color: accent }} />
          {property.beds} Bedrooms
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-primary)' }}>
          <Bath size={14} style={{ color: accent }} />
          {property.baths} Bathrooms
        </div>
        {owner && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-primary)' }}>
            <User size={14} style={{ color: accent }} />
            {owner.name}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Owner contact card */}
          {owner && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Owner</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: accent, flexShrink: 0 }}>
                  {owner.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{owner.name}</div>
                  <StatusBadge status={owner.status} />
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div>{owner.email}</div>
                <div>{owner.phone}</div>
                <div style={{ fontSize: 11 }}>Member since {owner.joinedDate}</div>
              </div>
            </div>
          )}

          {/* iCal sync card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Link2 size={16} style={{ color: accent }} />
              <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>PMS Calendar Sync</h3>
            </div>
            <input
              type="url"
              value={icalUrl}
              onChange={e => setIcalUrl(e.target.value)}
              placeholder="Paste your iCal URL from Hostaway, Guesty, Airbnb..."
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', marginBottom: 10, boxSizing: 'border-box' }}
            />
            <button
              onClick={handleSync}
              disabled={syncState === 'loading'}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: syncState === 'loading' ? 'not-allowed' : 'pointer', opacity: syncState === 'loading' ? 0.7 : 1 }}
            >
              {syncState === 'loading' ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={13} />}
              Sync Now
            </button>
            {syncState === 'success' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 13, color: '#34d399' }}>
                <CheckCircle size={13} />
                3 bookings synced
              </div>
            )}
            {syncState === 'idle' && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>Last synced: Never</div>
            )}
          </div>

          {/* Quick actions */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Quick Actions</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveTab('cleaning')}
                style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${accent}`, background: 'transparent', color: accent, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
              >
                Schedule Clean
              </button>
              <a
                href={`/app/properties/${id}/library`}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              >
                View Library →
              </a>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🛡️</div>
          <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>Compliance</div>
          <div>Compliance documents and certificates will appear here.</div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div>
          {propertyRequests.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '40px 0', textAlign: 'center' }}>No requests for this property.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {propertyRequests.map(req => (
                <div key={req.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>{req.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{req.date}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <StatusBadge status={req.status} />
                    <StatusBadge status={req.priority} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'assets' && (
        <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
          <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>Fixed Assets</div>
          <div>Asset tracking for this property will appear here.</div>
        </div>
      )}

      {activeTab === 'cleaning' && (
        <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🧹</div>
          <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>Cleaning Schedule</div>
          <div>Cleaning jobs for this property will appear here.</div>
        </div>
      )}
    </div>
  )
}
