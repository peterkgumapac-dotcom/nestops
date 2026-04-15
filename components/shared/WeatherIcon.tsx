'use client'

import { Sun, CloudRain, CloudSnow, Cloud, Wind } from 'lucide-react'

interface WeatherIconProps {
  condition: string
  size?: number
  className?: string
}

export default function WeatherIcon({ condition, size = 16, className }: WeatherIconProps) {
  switch (condition) {
    case 'sunny':
      return <Sun size={size} className={className ?? 'text-amber-400'} />
    case 'rain':
      return <CloudRain size={size} className={className ?? 'text-blue-400'} />
    case 'snow':
      return <CloudSnow size={size} className={className ?? 'text-blue-200'} />
    case 'cloudy':
      return <Cloud size={size} className={className ?? 'text-[var(--text-muted)]'} />
    case 'partly_cloudy':
      return <Sun size={size} className={className ?? 'text-amber-300'} />
    case 'windy':
      return <Wind size={size} className={className ?? 'text-cyan-400'} />
    default:
      return <Sun size={size} className={className ?? 'text-amber-400'} />
  }
}
