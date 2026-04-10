'use client'

import { useState } from 'react'
import { Book, Wifi, DoorOpen, Scale, MapPin, Wrench, HandMetal } from 'lucide-react'
import { GUIDEBOOKS, type Guidebook, type GuidebookTheme } from '@/lib/data/guidebooks'
import StatusBadge from '@/components/shared/StatusBadge'
import ModuleCard from './ModuleCard'
import ToggleSwitch from '@/components/ui/toggle-switch'
import { Button } from '@/components/ui/button'

const STANDARD_SECTIONS = [
  { key: 'Welcome', icon: HandMetal },
  { key: 'WiFi & Tech', icon: Wifi },
  { key: 'Check-in Instructions', icon: DoorOpen },
  { key: 'House Rules', icon: Scale },
  { key: 'Appliances', icon: Wrench },
  { key: 'Local Tips', icon: MapPin },
] as const

const THEME_OPTIONS: { value: GuidebookTheme; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'brand', label: 'Brand' },
]

export default function GuidebookPanel() {
  const [enabled, setEnabled] = useState(true)
  const [selectedId, setSelectedId] = useState<string>(GUIDEBOOKS[0].id)
  const [activeSections, setActiveSections] = useState<Set<string>>(
    () => new Set(STANDARD_SECTIONS.map((s) => s.key)),
  )
  const [theme, setTheme] = useState<GuidebookTheme>('dark')

  const selected: Guidebook = GUIDEBOOKS.find((g) => g.id === selectedId) ?? GUIDEBOOKS[0]

  function handleSectionToggle(section: string) {
    setActiveSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  const configContent = (
    <>
      {/* Linked guidebook selector */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Linked Guidebook
        </span>
        <div className="flex items-center gap-2">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="flex-1 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-1.5 text-sm text-[var(--text-primary)]"
          >
            {GUIDEBOOKS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.propertyName}
              </option>
            ))}
          </select>
          <StatusBadge status={selected.status} />
        </div>
      </div>

      {/* Active sections */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Active Sections
        </span>
        <div className="flex flex-col gap-0.5">
          {STANDARD_SECTIONS.map(({ key, icon: SectionIcon }) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg bg-[var(--bg-surface)] px-3 py-2"
            >
              <div className="flex items-center gap-2.5">
                <SectionIcon className="h-4 w-4 text-[var(--text-muted)]" />
                <span className="text-sm text-[var(--text-primary)]">{key}</span>
              </div>
              <ToggleSwitch
                checked={activeSections.has(key)}
                onChange={() => handleSectionToggle(key)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Theme selector */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Theme
        </span>
        <div className="flex gap-1.5">
          {THEME_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={theme === opt.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>
    </>
  )

  return (
    <ModuleCard
      icon={Book}
      title="Guidebook"
      description="Link and configure the in-portal guidebook"
      accentColor="var(--status-green-fg)"
      enabled={enabled}
      onToggle={setEnabled}
      stats={[
        { label: `${selected.sectionsCount} sections` },
        { label: `${selected.viewCount} views` },
        { label: `Updated ${selected.lastUpdated}` },
      ]}
      configContent={configContent}
      manageLink={{ href: '/operator/guidebooks', label: 'Edit guidebook' }}
    />
  )
}
