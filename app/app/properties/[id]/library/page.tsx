'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Lock, Zap, Cpu, BookOpen, AlertTriangle, Star,
  MapPin, StickyNote, Image, ChevronLeft, CheckCircle, Circle
} from 'lucide-react'
import Link from 'next/link'
import { useRole } from '@/context/RoleContext'
import { PROPERTIES } from '@/lib/data/properties'
import { getLibrary } from '@/lib/data/propertyLibrary'

type Tab = 'overview' | 'access' | 'utilities' | 'appliances' | 'rules' | 'emergency' | 'amenities' | 'local' | 'notes' | 'photos'

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'overview',   label: 'Overview',   icon: Home },
  { key: 'access',     label: 'Access',     icon: Lock },
  { key: 'utilities',  label: 'Utilities',  icon: Zap },
  { key: 'appliances', label: 'Appliances', icon: Cpu },
  { key: 'rules',      label: 'Rules',      icon: BookOpen },
  { key: 'emergency',  label: 'Emergency',  icon: AlertTriangle },
  { key: 'amenities',  label: 'Amenities',  icon: Star },
  { key: 'local',      label: 'Local Area', icon: MapPin },
  { key: 'notes',      label: 'Notes',      icon: StickyNote },
  { key: 'photos',     label: 'Photos',     icon: Image },
]

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-subtle)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  )
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0 24px' }}>{children}</div>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16, marginTop: 8 }}>{children}</h3>
}

export default function PropertyLibraryPage() {
  const { accent } = useRole()
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const property = PROPERTIES.find(p => p.id === id)
  const library = getLibrary(id)

  if (!property || !library) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        Property not found.
        <Link href="/app/properties" style={{ display: 'block', marginTop: 12, color: accent }}>← Back to Properties</Link>
      </div>
    )
  }

  const score = library.completionScore
  const scoreColor = score >= 80 ? '#34d399' : score >= 50 ? accent : '#f87171'

  return (
    <div>
      {/* Back nav */}
      <Link href="/app/properties" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 16 }}>
        <ChevronLeft size={14} /> Properties
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{property.name}</h1>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{property.address}, {property.city} · {library.type}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Library completion</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: scoreColor }}>{score}%</div>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${scoreColor}18`, border: `2px solid ${scoreColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={18} style={{ color: scoreColor }} />
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
                border: `1px solid ${isActive ? accent : 'var(--border)'}`,
                background: isActive ? `${accent}1a` : 'transparent',
                color: isActive ? accent : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}
        >
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <SectionTitle>Property Details</SectionTitle>
              <FieldGrid>
                <Field label="Nickname" value={library.nickname} />
                <Field label="Type" value={library.type} />
                <Field label="Max Guests" value={library.maxGuests} />
                <Field label="Min Nights" value={library.minNights} />
                <Field label="Check-in" value={library.checkIn} />
                <Field label="Check-out" value={library.checkOut} />
              </FieldGrid>
              {library.tagline && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-subtle)', marginBottom: 6 }}>Tagline</div>
                  <div style={{ fontSize: 15, fontStyle: 'italic', color: 'var(--text-primary)' }}>"{library.tagline}"</div>
                </div>
              )}
              {library.description && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-subtle)', marginBottom: 6 }}>Description</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>{library.description}</div>
                </div>
              )}
              {library.rooms.length > 0 && (
                <>
                  <SectionTitle>Rooms</SectionTitle>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                    {library.rooms.map((room, i) => (
                      <div key={i} style={{ padding: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                        <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>{room.name}</div>
                        {room.beds && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>🛏 {room.beds}</div>}
                        {room.notes && <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 3 }}>{room.notes}</div>}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ACCESS */}
          {activeTab === 'access' && (
            <div>
              <SectionTitle>Entry & Access</SectionTitle>
              <FieldGrid>
                <Field label="Access Type" value={library.accessType.replace('_', ' ')} />
                <Field label="Access Code" value={library.accessCode} />
                <Field label="Check-in Time" value={library.checkIn} />
                <Field label="Check-out Time" value={library.checkOut} />
              </FieldGrid>
              <Field label="Access Instructions" value={library.accessInstructions} />
              <Field label="Parking" value={library.parkingInfo} />
              <Field label="Garbage / Recycling" value={library.garbageInfo} />
            </div>
          )}

          {/* UTILITIES */}
          {activeTab === 'utilities' && (
            <div>
              <SectionTitle>Internet & TV</SectionTitle>
              <FieldGrid>
                <Field label="Internet Provider" value={library.internetProvider} />
                <Field label="WiFi Name" value={library.wifiName} />
                <Field label="WiFi Password" value={library.wifiPassword} />
                <Field label="TV Provider" value={library.tvProvider} />
              </FieldGrid>
              <Field label="TV Info" value={library.tvInfo} />
              <SectionTitle>Heating & Energy</SectionTitle>
              <FieldGrid>
                <Field label="Heating Type" value={library.heatingType} />
                <Field label="Electricity Provider" value={library.electricityProvider} />
                <Field label="Meter Location" value={library.meterLocation} />
                <Field label="Water Provider" value={library.waterProvider} />
              </FieldGrid>
              <Field label="Heating Instructions" value={library.heatingInstructions} />
            </div>
          )}

          {/* APPLIANCES */}
          {activeTab === 'appliances' && (
            <div>
              <SectionTitle>Appliances & Equipment</SectionTitle>
              {library.appliances.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No appliances added yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {library.appliances.map((a, i) => (
                    <div key={i} style={{ padding: 14, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '4px 20px' }}>
                      <div style={{ gridColumn: '1 / -1', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>{a.name}</div>
                      {a.brand && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}><b>Brand:</b> {a.brand}</div>}
                      {a.model && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}><b>Model:</b> {a.model}</div>}
                      {a.location && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}><b>Location:</b> {a.location}</div>}
                      {a.serialNumber && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}><b>Serial:</b> {a.serialNumber}</div>}
                      {a.warrantyExpiry && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}><b>Warranty:</b> {a.warrantyExpiry}</div>}
                      {a.notes && <div style={{ fontSize: 12, color: 'var(--text-subtle)', gridColumn: '1 / -1', marginTop: 4 }}>{a.notes}</div>}
                    </div>
                  ))}
                </div>
              )}
              {library.smartHome.length > 0 && (
                <>
                  <SectionTitle>Smart Home</SectionTitle>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {library.smartHome.map((d, i) => (
                      <div key={i} style={{ padding: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                        <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)', marginBottom: 3 }}>{d.device}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {d.brand && <span>Brand: {d.brand} · </span>}
                          {d.appName && <span>App: {d.appName}</span>}
                        </div>
                        {d.notes && <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 3 }}>{d.notes}</div>}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* RULES */}
          {activeTab === 'rules' && (
            <div>
              <SectionTitle>House Rules</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Smoking', allowed: library.houseRules.smokingAllowed },
                  { label: 'Pets', allowed: library.houseRules.petsAllowed },
                  { label: 'Parties', allowed: library.houseRules.partiesAllowed },
                ].map(rule => (
                  <div key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                    {rule.allowed
                      ? <CheckCircle size={16} style={{ color: '#34d399', flexShrink: 0 }} />
                      : <Circle size={16} style={{ color: '#f87171', flexShrink: 0 }} />}
                    <span style={{ fontSize: 13, fontWeight: 500, color: rule.allowed ? '#34d399' : '#f87171' }}>
                      {rule.allowed ? '✓' : '✗'} {rule.label} {rule.allowed ? 'Allowed' : 'Not Allowed'}
                    </span>
                  </div>
                ))}
              </div>
              <Field label="Quiet Hours" value={library.houseRules.quietHours} />
              {library.houseRules.additionalRules && library.houseRules.additionalRules.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-subtle)', marginBottom: 8 }}>Additional Rules</div>
                  <ul style={{ paddingLeft: 16, margin: 0 }}>
                    {library.houseRules.additionalRules.map((rule, i) => (
                      <li key={i} style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* EMERGENCY */}
          {activeTab === 'emergency' && (
            <div>
              <SectionTitle>Emergency Contacts</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {library.emergency.contacts.map((c, i) => (
                  <div key={i} style={{ padding: 14, borderRadius: 8, border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.05)' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>{c.name}</div>
                    {c.phone && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>📞 {c.phone}</div>}
                    {c.email && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>✉ {c.email}</div>}
                    {c.notes && <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 4 }}>{c.notes}</div>}
                  </div>
                ))}
              </div>
              <SectionTitle>Nearby Services</SectionTitle>
              <FieldGrid>
                <Field label="Nearest Hospital" value={library.emergency.nearestHospital} />
                <Field label="Nearest Pharmacy" value={library.emergency.nearestPharmacy} />
                <Field label="Maintenance" value={library.emergency.maintenanceContractor} />
                <Field label="Electrician" value={library.emergency.electrician} />
                <Field label="Plumber" value={library.emergency.plumber} />
              </FieldGrid>
            </div>
          )}

          {/* AMENITIES */}
          {activeTab === 'amenities' && (
            <div>
              <SectionTitle>Amenities</SectionTitle>
              {library.amenities.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No amenities added yet.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {library.amenities.map((a, i) => (
                    <span key={i} style={{ padding: '5px 12px', borderRadius: 20, background: `${accent}12`, border: `1px solid ${accent}30`, color: accent, fontSize: 13, fontWeight: 500 }}>
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LOCAL AREA */}
          {activeTab === 'local' && (
            <div>
              <SectionTitle>Getting Around</SectionTitle>
              <FieldGrid>
                <Field label="Nearest Supermarket" value={library.localArea.supermarket} />
                <Field label="Distance" value={library.localArea.supermarketDistance} />
                <Field label="Nearest Airport" value={library.localArea.airport} />
                <Field label="Airport Distance" value={library.localArea.airportDistance} />
              </FieldGrid>
              <Field label="Public Transport" value={library.localArea.publicTransport} />
              {library.localArea.restaurants && library.localArea.restaurants.length > 0 && (
                <>
                  <SectionTitle>Restaurants</SectionTitle>
                  <ul style={{ paddingLeft: 16, margin: 0 }}>
                    {library.localArea.restaurants.map((r, i) => <li key={i} style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>{r}</li>)}
                  </ul>
                </>
              )}
              {library.localArea.attractions && library.localArea.attractions.length > 0 && (
                <>
                  <SectionTitle>Attractions</SectionTitle>
                  <ul style={{ paddingLeft: 16, margin: 0 }}>
                    {library.localArea.attractions.map((a, i) => <li key={i} style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>{a}</li>)}
                  </ul>
                </>
              )}
              {library.localArea.notes && <Field label="Notes" value={library.localArea.notes} />}
            </div>
          )}

          {/* NOTES */}
          {activeTab === 'notes' && (
            <div>
              <SectionTitle>Internal Notes</SectionTitle>
              <Field label="Internal Notes" value={library.internalNotes ?? 'No internal notes added yet.'} />
              <SectionTitle>Cleaning</SectionTitle>
              <FieldGrid>
                <Field label="Cleaning Duration" value={library.cleaningDuration ? `${library.cleaningDuration} minutes` : undefined} />
                <Field label="Buffer Days" value={library.bufferDays !== undefined ? `${library.bufferDays} day(s)` : undefined} />
                <Field label="Inspection Required" value={library.inspectionRequired ? 'Yes' : 'No'} />
              </FieldGrid>
              <Field label="Cleaning Instructions" value={library.cleaningInstructions} />
            </div>
          )}

          {/* PHOTOS */}
          {activeTab === 'photos' && (
            <div>
              <SectionTitle>Property Photos</SectionTitle>
              {library.photos.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No photos added yet.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                  {library.photos.map((photo, i) => (
                    <div key={i} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
                      <img src={photo.url} alt={photo.caption ?? `Photo ${i + 1}`} style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} />
                      {photo.isPrimary && (
                        <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: accent, color: '#fff' }}>Primary</span>
                      )}
                      {photo.caption && (
                        <div style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text-muted)' }}>{photo.caption}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <button style={{ marginTop: 16, padding: '8px 16px', borderRadius: 8, border: `1px solid ${accent}`, background: 'transparent', color: accent, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                + Add Photos
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
