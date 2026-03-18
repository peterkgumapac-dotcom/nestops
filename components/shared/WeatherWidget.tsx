'use client'
import { PROPERTY_WEATHER } from '@/lib/data/weather'

interface WeatherWidgetProps {
  propertyId?: string
  compact?: boolean
}

export default function WeatherWidget({ propertyId, compact = false }: WeatherWidgetProps) {
  const weather = PROPERTY_WEATHER.find(w => w.propertyId === propertyId)
  if (!weather) return null

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
        <span>{weather.icon}</span>
        <span style={{ fontWeight: 600 }}>{weather.temperature}°C</span>
        <span style={{ color: 'rgba(255,255,255,0.5)' }}>
          {weather.location}{weather.note ? ` · ${weather.note}` : ''}
        </span>
      </div>
    )
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
        📍 {weather.location}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
        {weather.icon} {weather.temperature}°C
      </div>
      {weather.note && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>{weather.note}</div>}
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>High {weather.high}° · Low {weather.low}°</div>
    </div>
  )
}
