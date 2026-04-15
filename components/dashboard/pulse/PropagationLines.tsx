'use client'
import { useEffect, useRef } from 'react'
import type { Severity } from '@/lib/data/pulseScenes'
import { SEVERITY_CONFIG } from '@/lib/data/pulseScenes'

interface PropagationLinesProps {
  severity: Severity
  roleCount: number
}

export default function PropagationLines({ severity, roleCount }: PropagationLinesProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const color = SEVERITY_CONFIG[severity].color

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const lines = svg.querySelectorAll<SVGLineElement | SVGPathElement>('[data-anim]')
    // Reset all lines
    lines.forEach(line => {
      const length = line instanceof SVGPathElement
        ? line.getTotalLength()
        : Math.hypot(
            Number(line.getAttribute('x2')) - Number(line.getAttribute('x1')),
            Number(line.getAttribute('y2')) - Number(line.getAttribute('y1'))
          )
      line.style.strokeDasharray = `${length}`
      line.style.strokeDashoffset = `${length}`
      line.style.transition = 'none'
    })

    // Animate with stagger
    requestAnimationFrame(() => {
      lines.forEach((line, i) => {
        const delay = i === 0 ? 0.35 : i === 1 ? 0.7 : 1.0 + (i - 2) * 0.17
        line.style.transition = `stroke-dashoffset 0.4s ease ${delay}s`
        line.style.strokeDashoffset = '0'
      })
    })
  }, [severity])

  // SVG layout: stem down from center, then fan out to 4 columns
  const w = 260
  const h = 48
  const cx = w / 2
  const cols = roleCount
  const colW = w / cols
  const endpoints = Array.from({ length: cols }, (_, i) => colW * i + colW / 2)

  return (
    <div className="relative h-12 overflow-visible">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${w} ${h}`}
        className="w-full h-12"
        fill="none"
        style={{ overflow: 'visible' }}
      >
        {/* Stem: center top to center mid */}
        <line
          data-anim="stem"
          x1={cx} y1={0} x2={cx} y2={20}
          stroke={color} strokeWidth={1.5} strokeLinecap="round"
        />
        {/* Horizontal bar */}
        <line
          data-anim="bar"
          x1={endpoints[0]} y1={20} x2={endpoints[endpoints.length - 1]} y2={20}
          stroke={color} strokeWidth={1.5} strokeLinecap="round"
        />
        {/* Drops down to each role */}
        {endpoints.map((x, i) => (
          <line
            key={i}
            data-anim={`drop-${i}`}
            x1={x} y1={20} x2={x} y2={h}
            stroke={color} strokeWidth={1.5} strokeLinecap="round"
          />
        ))}
      </svg>
    </div>
  )
}
