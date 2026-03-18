'use client'
import { Building2, MapPin, Bed, Bath } from 'lucide-react'
import Link from 'next/link'
import StatusBadge from '@/components/shared/StatusBadge'

export interface PropertyCardProps {
  property: {
    id: string
    name: string
    location: string
    bedrooms: number
    baths: number
    imageUrl?: string
    status?: string
    complianceStatus?: { color: string; label: string } | null
  }
  accent: string
  href: string
  showCompliance?: boolean
  onClick?: () => void
  /** When true, omits the card border/radius/bg shell — useful when a parent already provides the card shell */
  noShell?: boolean
}

export default function PropertyCard({
  property,
  accent,
  href,
  showCompliance = false,
  onClick,
  noShell = false,
}: PropertyCardProps) {
  const cardStyle: React.CSSProperties = noShell
    ? { display: 'block', textDecoration: 'none', cursor: 'pointer' }
    : {
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        overflow: 'hidden',
        transition: 'transform 0.2s',
        cursor: 'pointer',
      }

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = 'translateY(-2px)'
  }
  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = 'translateY(0)'
  }

  const inner = (
    <>
      {property.imageUrl ? (
        <img
          src={property.imageUrl}
          alt={property.name}
          style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div
          style={{
            height: 140,
            background: `linear-gradient(135deg, ${accent}22, ${accent}08)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Building2 size={40} style={{ color: accent, opacity: 0.5 }} strokeWidth={1} />
        </div>
      )}
      <div style={{ padding: 16 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
            {property.name}
          </div>
          {property.status && <StatusBadge status={property.status as unknown as Parameters<typeof StatusBadge>[0]['status']} />}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            color: 'var(--text-muted)',
            marginBottom: 10,
          }}
        >
          <MapPin size={11} />
          {property.location}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12,
                color: 'var(--text-muted)',
              }}
            >
              <Bed size={12} /> {property.bedrooms} beds
            </span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12,
                color: 'var(--text-muted)',
              }}
            >
              <Bath size={12} /> {property.baths} baths
            </span>
          </div>
          {showCompliance && property.complianceStatus && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                color: property.complianceStatus.color,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: property.complianceStatus.color,
                  display: 'inline-block',
                }}
              />
              {property.complianceStatus.label}
            </span>
          )}
        </div>
      </div>
    </>
  )

  if (onClick) {
    return (
      <div
        style={cardStyle}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {inner}
      </div>
    )
  }

  return (
    <Link
      href={href}
      style={{ ...cardStyle, textDecoration: 'none', display: 'block' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {inner}
    </Link>
  )
}
