'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Bed, Bath, ArrowLeft, User, Link2, RefreshCw, CheckCircle, Loader2, LogIn, LogOut, KeyRound } from 'lucide-react'
import { PROPERTIES } from '@/lib/data/properties'
import { OWNERS } from '@/lib/data/owners'
import { REQUESTS } from '@/lib/data/requests'
import { COMPLIANCE_DOCS } from '@/lib/data/compliance'
import { ASSETS } from '@/lib/data/assets'
import { JOBS, STAFF_MEMBERS } from '@/lib/data/staff'
import StatusBadge from '@/components/shared/StatusBadge'
import Tabs from '@/components/shared/Tabs'
import PageHeader from '@/components/shared/PageHeader'
import { useRole } from '@/context/RoleContext'

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { accent } = useRole()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const property = PROPERTIES.find(p => p.id === id)
  const owner = property ? OWNERS.find(o => o.id === property.ownerId) : null
  const propertyRequests = REQUESTS.filter(r => r.propertyId === id)
  const propertyDocs = COMPLIANCE_DOCS.filter(d => d.propertyId === id)
  const propertyAssets = ASSETS.filter(a => a.propertyId === id)
  const propertyJobs = JOBS.filter(j => j.propertyId === id)

  const [activeTab, setActiveTab] = useState('overview')
  const [icalUrl, setIcalUrl] = useState('')
  const [syncState, setSyncState] = useState<'idle' | 'loading' | 'success'>('idle')
  const [toast, setToast] = useState('')
  const [revealedCodes, setRevealedCodes] = useState<Set<string>>(new Set())
  const [rotatingCode, setRotatingCode] = useState<string | null>(null)
  const [accessCodes, setAccessCodes] = useState(property?.accessCodes ?? [])
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

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
    { key: 'compliance', label: 'Compliance', count: propertyDocs.filter(d => d.status !== 'valid').length || undefined },
    { key: 'requests', label: 'Requests', count: propertyRequests.length },
    { key: 'assets', label: 'Assets', count: propertyAssets.length },
    { key: 'cleaning', label: 'Cleaning', count: propertyJobs.filter(j => j.status !== 'done').length || undefined },
    { key: 'access', label: 'Smart Access' },
  ]

  function handleSync() {
    setSyncState('loading')
    setTimeout(() => setSyncState('success'), 1500)
  }

  const conditionColor: Record<string, string> = {
    excellent: '#10b981',
    good: '#3b82f6',
    fair: '#f59e0b',
    poor: '#ef4444',
  }

  const statusPillColor: Record<string, string> = {
    valid: '#10b981',
    expiring: '#f59e0b',
    expired: '#ef4444',
    missing: '#6b7280',
  }

  return (
    <div>
      <PageHeader title={property.name ?? 'Property'} />
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
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />
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
        <div>
          {propertyDocs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🛡️</div>
              No compliance documents found for this property.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {propertyDocs.map(doc => (
                <div key={doc.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{doc.category}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{doc.issuer}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-subtle)', minWidth: 90 }}>
                    {doc.expiryDate ? `Expires ${doc.expiryDate}` : 'No expiry date'}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                    background: `${statusPillColor[doc.status]}18`,
                    color: statusPillColor[doc.status],
                    border: `1px solid ${statusPillColor[doc.status]}30`,
                    textTransform: 'capitalize',
                  }}>
                    {doc.status}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => showToast('Document editor opened')} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => showToast('Document request sent to owner')} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: 'none', background: `${accent}1a`, color: accent, cursor: 'pointer', fontWeight: 500 }}>Request</button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
        <div>
          {propertyAssets.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
              No assets registered for this property.
            </div>
          ) : (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                    {['Name', 'Category', 'Brand / Model', 'Value', 'Condition', 'Warranty'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {propertyAssets.map((asset, i) => (
                    <tr key={asset.id} style={{ borderBottom: i < propertyAssets.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--text-primary)' }}>{asset.name}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{asset.category}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 12 }}>{asset.brand} {asset.model}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{asset.valueNOK.toLocaleString()} NOK</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: `${conditionColor[asset.condition]}18`, color: conditionColor[asset.condition], textTransform: 'capitalize' }}>
                          {asset.condition}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: `${statusPillColor[asset.warrantyStatus]}18`, color: statusPillColor[asset.warrantyStatus], textTransform: 'capitalize' }}>
                          {asset.warrantyStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'cleaning' && (
        <div>
          {propertyJobs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🧹</div>
              No cleaning jobs scheduled for this property.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {propertyJobs.map(job => {
                const staff = STAFF_MEMBERS.find(s => s.id === job.staffId)
                const priorityColors: Record<string, string> = { urgent: '#ef4444', high: '#f97316', medium: '#3b82f6', low: '#6b7280' }
                const statusColors: Record<string, string> = { done: '#10b981', in_progress: '#3b82f6', pending: '#6b7280' }
                return (
                  <div key={job.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{job.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {staff?.name ?? 'Unassigned'} · Due {job.dueTime}
                        {job.urgencyLabel && ` · ${job.urgencyLabel}`}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: `${priorityColors[job.priority]}18`, color: priorityColors[job.priority], textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                      {job.priority}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: `${statusColors[job.status]}18`, color: statusColors[job.status], textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'access' && (
        <div>
          {/* Connection badge */}
          <div style={{ marginBottom: 24 }}>
            {accessCodes.some(c => c.source === 'suiteop') ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: '#7c3aed18', border: '1px solid #7c3aed40', color: '#7c3aed', fontSize: 12, fontWeight: 600 }}>
                <KeyRound size={12} /> Connected via SuiteOp
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>
                <KeyRound size={12} /> Manual
              </span>
            )}
          </div>

          {/* Access codes */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Access Codes</h3>
            {accessCodes.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '20px 0' }}>No access codes configured.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {accessCodes.map(code => (
                  <div key={code.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{code.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        Expires {code.expiresAt} · Last used {code.lastUsed}
                        <span style={{ marginLeft: 8, fontSize: 11, padding: '1px 6px', borderRadius: 3, background: code.source === 'suiteop' ? '#7c3aed18' : 'var(--bg-elevated)', color: code.source === 'suiteop' ? '#7c3aed' : 'var(--text-subtle)', border: '1px solid', borderColor: code.source === 'suiteop' ? '#7c3aed30' : 'var(--border)' }}>
                          {code.source === 'suiteop' ? 'SuiteOp' : 'Manual'}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: 4, minWidth: 90, textAlign: 'center' }}>
                      {revealedCodes.has(code.id) ? code.code : '••••••'}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => setRevealedCodes(prev => { const n = new Set(prev); if (n.has(code.id)) n.delete(code.id); else n.add(code.id); return n })}
                        style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        {revealedCodes.has(code.id) ? 'Hide' : 'Reveal'}
                      </button>
                      <button
                        onClick={() => {
                          setRotatingCode(code.id)
                          setTimeout(() => {
                            const newCode = Math.floor(100000 + Math.random() * 900000).toString()
                            setAccessCodes(prev => prev.map(c => c.id === code.id ? { ...c, code: newCode } : c))
                            setRevealedCodes(prev => new Set([...prev, code.id]))
                            setRotatingCode(null)
                            showToast(`New code generated for ${code.label}`)
                          }, 1200)
                        }}
                        disabled={rotatingCode === code.id}
                        style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: `1px solid ${accent}`, background: `${accent}14`, color: accent, cursor: rotatingCode === code.id ? 'not-allowed' : 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, opacity: rotatingCode === code.id ? 0.6 : 1 }}
                      >
                        {rotatingCode === code.id ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={11} />}
                        Rotate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Access log */}
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Recent Access Log</h3>
            {(!property.accessLog || property.accessLog.length === 0) ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No access events recorded.</div>
            ) : (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', maxWidth: 540 }}>
                {property.accessLog.slice(0, 5).map((event, i) => (
                  <div key={event.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < Math.min(4, property.accessLog!.length - 1) ? '1px solid var(--border-subtle)' : 'none' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: event.action === 'entry' ? '#10b98118' : '#f9731618', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {event.action === 'entry' ? <LogIn size={13} style={{ color: '#10b981' }} /> : <LogOut size={13} style={{ color: '#f97316' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{event.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{event.timestamp}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: event.action === 'entry' ? '#10b98118' : '#f9731618', color: event.action === 'entry' ? '#10b981' : '#f97316', textTransform: 'capitalize' }}>
                      {event.action}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
