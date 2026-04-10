'use client'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { Building2, Search, LayoutGrid, List, ChevronRight, X, MapPin, Bed, Bath, BookOpen, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import { PROPERTIES, PropertyStatus } from '@/lib/data/properties'
import { OWNERS } from '@/lib/data/owners'
import { COMPLIANCE_DOCS } from '@/lib/data/compliance'
import { useRole } from '@/context/RoleContext'
import { getLibrary, PROPERTY_LIBRARIES } from '@/lib/data/propertyLibrary'

function getComplianceDot(propertyId: string): { color: string; title: string; label: string } {
  const docs = COMPLIANCE_DOCS.filter(d => d.propertyId === propertyId)
  if (docs.some(d => d.status === 'expired' || d.status === 'missing')) {
    return { color: 'var(--status-danger)', title: 'Expired or missing compliance documents', label: 'Action needed' }
  }
  if (docs.some(d => d.status === 'expiring')) {
    return { color: 'var(--status-warning)', title: 'Compliance documents expiring soon', label: 'Expiring soon' }
  }
  return { color: 'var(--status-success)', title: 'All compliance documents valid', label: 'Compliant' }
}

const PAGE_SIZE = 25

const selectStyle: React.CSSProperties = {
  padding: '7px 10px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--bg-card)',
  color: 'var(--text-primary)',
  fontSize: 13,
  cursor: 'pointer',
  outline: 'none',
}

export default function PropertiesPage() {
  const { accent } = useRole()
  const router = useRouter()

  // View
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filters
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | PropertyStatus>('all')
  const [ownerFilter, setOwnerFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'status' | 'beds_asc' | 'beds_desc'>('name_asc')

  // Library search mode
  const [libraryMode, setLibraryMode] = useState(false)
  const [libSearch, setLibSearch] = useState('')
  const [debouncedLibSearch, setDebouncedLibSearch] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebouncedLibSearch(libSearch), 250)
    return () => clearTimeout(t)
  }, [libSearch])

  // Pagination
  const [page, setPage] = useState(1)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(t)
  }, [search])

  // Library search results
  const librarySearchResults = useMemo(() => {
    if (!debouncedLibSearch) return null
    const q = debouncedLibSearch.toLowerCase()
    const results: { prop: typeof PROPERTIES[0]; matches: { label: string; value: string }[]; lib: typeof PROPERTY_LIBRARIES[0] | null }[] = []
    const missing: typeof PROPERTIES[0][] = []

    PROPERTIES.forEach(prop => {
      const lib = PROPERTY_LIBRARIES.find(l => l.propertyId === prop.id) ?? null
      const matches: { label: string; value: string }[] = []

      if (!lib) { missing.push(prop); return }

      const chk = (label: string, value?: string | null) => {
        if (value && value.toLowerCase().includes(q)) matches.push({ label, value })
      }
      chk('Access Code', lib.accessCode)
      chk('Entry Instructions', lib.accessInstructions)
      chk('Parking', lib.parkingInfo)
      chk('Garbage / Bins', lib.garbageInfo)
      chk('WiFi Name', lib.wifiName)
      chk('WiFi Password', lib.wifiPassword)
      chk('Meter Location', lib.meterLocation)
      chk('Electricity Provider', lib.electricityProvider)
      chk('Water Provider', lib.waterProvider)
      chk('Internet Provider', lib.internetProvider)
      chk('Heating Type', lib.heatingType)
      chk('Heating Instructions', lib.heatingInstructions)
      chk('TV Info', lib.tvInfo)
      chk('Description', lib.description)
      chk('Tagline', lib.tagline)
      chk('Check-in Time', lib.checkIn)
      chk('Check-out Time', lib.checkOut)
      lib.appliances?.forEach(a => {
        if ([a.name, a.brand, a.model, a.location, a.notes].some(v => v?.toLowerCase().includes(q)))
          matches.push({ label: 'Appliance', value: [a.name, a.brand, a.model].filter(Boolean).join(' · ') })
      })
      lib.smartHome?.forEach(s => {
        if ([s.device, s.appName, s.notes].some(v => v?.toLowerCase().includes(q)))
          matches.push({ label: 'Smart Home', value: s.device })
      })
      lib.houseRules?.additionalRules?.forEach(r => {
        if (r.toLowerCase().includes(q)) matches.push({ label: 'House Rule', value: r })
      })
      lib.emergency?.contacts?.forEach(c => {
        if ([c.name, c.phone, c.notes].some(v => v?.toLowerCase().includes(q)))
          matches.push({ label: 'Emergency Contact', value: c.name + (c.phone ? ` · ${c.phone}` : '') })
      })
      chk('Nearest Hospital', lib.emergency?.nearestHospital)
      chk('Nearest Pharmacy', lib.emergency?.nearestPharmacy)
      chk('Maintenance Contractor', lib.emergency?.maintenanceContractor)

      if (matches.length > 0) results.push({ prop, matches, lib })
      else missing.push(prop)
    })

    return { results, missing }
  }, [debouncedLibSearch])

  // Reset page on any filter/sort change
  useEffect(() => { setPage(1) }, [debouncedSearch, statusFilter, ownerFilter, cityFilter, sortBy])

  // Compliance map
  const complianceMap = useMemo(() =>
    Object.fromEntries(PROPERTIES.map(p => [p.id, getComplianceDot(p.id)])),
  [])

  // Unique filter options
  const uniqueCities = useMemo(() => [...new Set(PROPERTIES.map(p => p.city))].sort(), [])
  const uniqueOwners = useMemo(() => OWNERS.filter(o => PROPERTIES.some(p => p.ownerId === o.id)), [])

  // Filter + sort pipeline
  const filtered = useMemo(() => {
    let list = PROPERTIES
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        OWNERS.find(o => o.id === p.ownerId)?.name.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') list = list.filter(p => p.status === statusFilter)
    if (ownerFilter !== 'all') list = list.filter(p => p.ownerId === ownerFilter)
    if (cityFilter !== 'all') list = list.filter(p => p.city === cityFilter)

    list = [...list].sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name)
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name)
      if (sortBy === 'status') return a.status.localeCompare(b.status)
      if (sortBy === 'beds_asc') return a.beds - b.beds
      if (sortBy === 'beds_desc') return b.beds - a.beds
      return 0
    })
    return list
  }, [debouncedSearch, statusFilter, ownerFilter, cityFilter, sortBy])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const clearAllFilters = useCallback(() => {
    setSearch('')
    setStatusFilter('all')
    setOwnerFilter('all')
    setCityFilter('all')
    setSortBy('name_asc')
    setPage(1)
  }, [])

  const hasActiveFilters = debouncedSearch || statusFilter !== 'all' || ownerFilter !== 'all' || cityFilter !== 'all'

  // Active filter pills
  const filterPills: { label: string; onRemove: () => void }[] = []
  if (statusFilter !== 'all') filterPills.push({ label: `Status: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`, onRemove: () => setStatusFilter('all') })
  if (ownerFilter !== 'all') {
    const owner = OWNERS.find(o => o.id === ownerFilter)
    filterPills.push({ label: `Owner: ${owner?.name ?? ownerFilter}`, onRemove: () => setOwnerFilter('all') })
  }
  if (cityFilter !== 'all') filterPills.push({ label: `City: ${cityFilter}`, onRemove: () => setCityFilter('all') })

  const iconBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 9px',
    borderRadius: 8,
    border: `1px solid ${active ? accent : 'var(--border)'}`,
    background: active ? `${accent}18` : 'var(--bg-card)',
    color: active ? accent : 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    lineHeight: 1,
  })

  return (
    <div>
      <PageHeader
        title="Properties"
        subtitle="All managed properties"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => router.push('/operator/properties/onboard')}
              style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${accent}`, background: 'transparent', color: accent, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
            >
              Onboard Property
            </button>
            <button
              onClick={() => router.push('/operator/properties/onboard')}
              style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
            >
              Add Property
            </button>
          </div>
        }
      />

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search properties..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...selectStyle, width: '100%', paddingLeft: 30, boxSizing: 'border-box' }}
          />
        </div>

        {/* Status */}
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'all' | PropertyStatus)} style={selectStyle}>
          <option value="all">All Statuses</option>
          <option value="live">Live</option>
          <option value="onboarding">Onboarding</option>
          <option value="offboarding">Offboarding</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Owner */}
        <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Owners</option>
          {uniqueOwners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>

        {/* City */}
        <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Cities</option>
          {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Sort */}
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} style={selectStyle}>
          <option value="name_asc">Name A–Z</option>
          <option value="name_desc">Name Z–A</option>
          <option value="status">Status</option>
          <option value="beds_asc">Beds ↑</option>
          <option value="beds_desc">Beds ↓</option>
        </select>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 2px' }} />

        {/* View toggle */}
        <button style={iconBtnStyle(viewMode === 'grid')} onClick={() => setViewMode('grid')} title="Grid view">
          <LayoutGrid size={15} />
        </button>
        <button style={iconBtnStyle(viewMode === 'list')} onClick={() => setViewMode('list')} title="List view">
          <List size={15} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 2px' }} />

        {/* Library search toggle */}
        <button
          style={{
            ...iconBtnStyle(libraryMode),
            gap: 5,
            padding: '7px 12px',
            fontSize: 12,
            fontWeight: 500,
          }}
          onClick={() => { setLibraryMode(m => !m); setLibSearch('') }}
          title="Search across all property library data"
        >
          <BookOpen size={13} />
          Search Library
        </button>
      </div>

      {/* Library search bar */}
      {libraryMode && (
        <div style={{ marginBottom: 16, padding: 14, background: `${accent}08`, border: `1px solid ${accent}30`, borderRadius: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOpen size={14} style={{ color: accent, flexShrink: 0 }} />
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder='Search all property library fields… e.g. "fusebox", "wifi", "Nespresso"'
                value={libSearch}
                onChange={e => setLibSearch(e.target.value)}
                autoFocus
                style={{ ...selectStyle, width: '100%', paddingLeft: 30, boxSizing: 'border-box' }}
              />
            </div>
            {libSearch && (
              <button onClick={() => setLibSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                <X size={14} />
              </button>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
            Searches across access codes, wifi, utilities, appliances, smart home, house rules, emergency contacts, and more.
          </div>
        </div>
      )}

      {/* Results bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, minHeight: 24, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Showing {filtered.length} of {PROPERTIES.length} {PROPERTIES.length === 1 ? 'property' : 'properties'}
        </span>
        {filterPills.map(pill => (
          <span
            key={pill.label}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: `${accent}18`, color: accent, border: `1px solid ${accent}40` }}
          >
            {pill.label}
            <button onClick={pill.onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: accent, display: 'flex', alignItems: 'center', lineHeight: 1 }}>
              <X size={10} />
            </button>
          </span>
        ))}
        {hasActiveFilters && (
          <button onClick={clearAllFilters} style={{ fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
            Clear all filters
          </button>
        )}
      </div>

      {/* Library search results */}
      {libraryMode && librarySearchResults !== null && (
        <div>
          {librarySearchResults.results.length === 0 && librarySearchResults.missing.length > 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <BookOpen size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 600 }}>No library data matches "{debouncedLibSearch}"</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>{librarySearchResults.missing.length} {librarySearchResults.missing.length === 1 ? 'property' : 'properties'} have no match for this term</div>
            </div>
          ) : (
            <div>
              {/* Match count */}
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                <span style={{ fontWeight: 600, color: accent }}>{librarySearchResults.results.length}</span> {librarySearchResults.results.length === 1 ? 'property' : 'properties'} with data matching "{debouncedLibSearch}"
                {librarySearchResults.missing.length > 0 && (
                  <> · <span style={{ color: 'var(--status-warning)', fontWeight: 500 }}>{librarySearchResults.missing.length} missing this info</span></>
                )}
              </div>

              {/* Result cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {librarySearchResults.results.map(({ prop, matches }) => (
                  <div
                    key={prop.id}
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, cursor: 'pointer', display: 'flex', gap: 14 }}
                    onClick={() => router.push(`/operator/properties/${prop.id}`)}
                  >
                    {/* Thumbnail */}
                    {prop.imageUrl ? (
                      <img src={prop.imageUrl} alt={prop.name} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 56, height: 56, borderRadius: 8, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Building2 size={22} style={{ color: accent, opacity: 0.5 }} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>{prop.name}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {matches.slice(0, 6).map((m, i) => (
                          <span key={i} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `${accent}14`, color: 'var(--text-primary)', border: `1px solid ${accent}30` }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{m.label}:</span>{' '}
                            <span style={{ color: 'var(--text-primary)' }}>
                              {m.value.length > 60 ? m.value.slice(0, 57) + '…' : m.value}
                            </span>
                          </span>
                        ))}
                        {matches.length > 6 && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', padding: '2px 4px' }}>+{matches.length - 6} more</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, alignSelf: 'center' }} />
                  </div>
                ))}
              </div>

              {/* Missing section */}
              {librarySearchResults.missing.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <AlertTriangle size={13} style={{ color: 'var(--status-warning)' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--status-warning)' }}>
                      Missing this info — {librarySearchResults.missing.length} {librarySearchResults.missing.length === 1 ? 'property' : 'properties'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {librarySearchResults.missing.map(prop => (
                      <div
                        key={prop.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
                        onClick={() => router.push(`/operator/properties/${prop.id}`)}
                      >
                        <AlertTriangle size={11} style={{ color: 'var(--status-warning)', flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-primary)' }}>{prop.name}</span>
                        <span style={{ fontSize: 11, color: 'var(--status-warning)', fontWeight: 500 }}>Update library →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Normal property list (hidden when library search has results) */}
      {(!libraryMode || librarySearchResults === null) && (
      <>
      {/* Empty state — no properties at all */}
      {PROPERTIES.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Building2 size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
          <div style={{ fontSize: 16, fontWeight: 600 }}>No properties yet</div>
          <div style={{ fontSize: 14, marginTop: 8 }}>Add your first property to get started</div>
        </div>

      /* Empty state — filters returned nothing */
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Search size={40} style={{ opacity: 0.3, marginBottom: 16 }} />
          <div style={{ fontSize: 16, fontWeight: 600 }}>No properties match your filters</div>
          <div style={{ fontSize: 14, marginTop: 8 }}>
            <button onClick={clearAllFilters} style={{ color: accent, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, textDecoration: 'underline' }}>
              Clear filters
            </button>
          </div>
        </div>

      /* Grid view */
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: 16 }}>
          {paginated.map(prop => {
            const owner = OWNERS.find(o => o.id === prop.ownerId)
            return (
              <div
                key={prop.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onClick={() => router.push(`/operator/properties/${prop.id}`)}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {/* Image + overlaid status badge */}
                <div style={{ position: 'relative' }}>
                  {prop.imageUrl ? (
                    <img src={prop.imageUrl} alt={prop.name}
                      style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ height: 180, background: `linear-gradient(135deg, ${accent}22, ${accent}08)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={40} style={{ color: accent, opacity: 0.5 }} strokeWidth={1} />
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: 10, right: 10 }}>
                    <StatusBadge status={prop.status as Parameters<typeof StatusBadge>[0]['status']} />
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {prop.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
                    color: 'var(--text-muted)', marginBottom: 8 }}>
                    <MapPin size={11} /> {prop.address}, {prop.city}
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Bed size={12} /> {prop.beds} beds</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Bath size={12} /> {prop.baths} baths</span>
                  </div>
                  {owner && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                      Owner: {owner.name}
                    </div>
                  )}

                  {/* Library completion bar */}
                  {(() => {
                    const lib = getLibrary(prop.id)
                    const pct = lib?.completionScore ?? 0
                    return (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11,
                          color: 'var(--text-muted)', marginBottom: 4 }}>
                          <span>Library completion</span>
                          <span style={{ fontWeight: 600, color: accent }}>{pct}%</span>
                        </div>
                        <div style={{ height: 4, borderRadius: 2, background: 'var(--border)' }}>
                          <div style={{ height: '100%', borderRadius: 2, background: accent, width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })()}

                  {/* View Library button */}
                  <button
                    onClick={e => { e.stopPropagation(); router.push(`/operator/properties/${prop.id}`) }}
                    style={{
                      width: '100%', padding: '8px 0', borderRadius: 6,
                      border: `1px solid ${accent}40`, background: `${accent}14`,
                      color: accent, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    }}
                  >
                    View Library <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

      /* List view */
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 100px 100px 140px 90px 110px 32px', gap: 12, padding: '10px 16px', background: 'var(--bg-subtle, var(--bg-card))', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: 720 }}>
            <span>Name</span>
            <span>Status</span>
            <span>City</span>
            <span>Owner</span>
            <span>Beds/Baths</span>
            <span>Compliance</span>
            <span />
          </div>

          {/* Rows */}
          {paginated.map((prop, i) => {
            const owner = OWNERS.find(o => o.id === prop.ownerId)
            const dot = complianceMap[prop.id]
            return (
              <div
                key={prop.id}
                onClick={() => router.push(`/operator/properties/${prop.id}`)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 100px 100px 140px 90px 110px 32px',
                  gap: 12,
                  padding: '10px 16px',
                  alignItems: 'center',
                  borderBottom: i < paginated.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  minWidth: 720,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover, rgba(0,0,0,0.03))')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Name + address */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  {prop.imageUrl ? (
                    <img src={prop.imageUrl} alt={prop.name} style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 48, height: 48, borderRadius: 6, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Building2 size={20} style={{ color: accent, opacity: 0.5 }} />
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prop.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prop.address}</div>
                  </div>
                </div>

                {/* Status */}
                <div><StatusBadge status={prop.status as Parameters<typeof StatusBadge>[0]['status']} /></div>

                {/* City */}
                <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{prop.city}</div>

                {/* Owner */}
                <div style={{ fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{owner?.name ?? '—'}</div>

                {/* Beds/Baths */}
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{prop.beds}bd / {prop.baths}ba</div>

                {/* Compliance */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot.color, flexShrink: 0, display: 'inline-block' }} />
                  <span style={{ fontSize: 12, color: dot.color, fontWeight: 500 }}>{dot.label}</span>
                </div>

                {/* Chevron */}
                <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
              </div>
            )
          })}
          </div>{/* end scroll wrapper */}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 24 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)', fontSize: 13, cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
          >
            ← Previous
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: page === totalPages ? 'var(--text-muted)' : 'var(--text-primary)', fontSize: 13, cursor: page === totalPages ? 'default' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
          >
            Next →
          </button>
        </div>
      )}
      </>
      )}
    </div>
  )
}
