'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TEMPLATES, type Template } from './templates'
import ToggleSwitch from '@/components/ui/toggle-switch'
import {
  Map, Globe, Sparkles, Star, Users, Vote, ShoppingCart, Sliders, Upload,
} from 'lucide-react'

interface CustomizationPanelProps {
  activeTemplateId: Template['id']
}

/* ─── Color picker swatch ─── */
function ColorSwatch({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-[var(--text-primary)]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-[var(--text-muted)]">{value}</span>
        <label
          className="block h-8 w-8 cursor-pointer overflow-hidden rounded-lg border border-[var(--border)]"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="invisible h-0 w-0"
          />
        </label>
      </div>
    </div>
  )
}

/* ─── Character progress bar ─── */
function CharProgress({ current, max }: { current: number; max: number }) {
  const ratio = current / max
  const barColor = ratio < 0.7 ? 'var(--status-green-fg)' : ratio < 0.9 ? 'var(--status-amber-fg)' : 'var(--status-red-fg)'
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]">
      <div
        className="h-full rounded-full transition-all duration-200"
        style={{ width: `${Math.min(ratio * 100, 100)}%`, backgroundColor: barColor }}
      />
    </div>
  )
}

/* ─── Feature pill toggle row ─── */
function FeaturePill({
  icon: Icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ElementType
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-[var(--bg-surface)] px-3 py-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[var(--text-muted)]" />
        <span className="text-sm text-[var(--text-primary)]">{label}</span>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  )
}

/* ─── Segmented button group (replaces <select>) ─── */
function SegmentedGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5 py-2">
      <span className="text-sm text-[var(--text-primary)]">{label}</span>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <Button
            key={opt}
            variant={value === opt ? 'default' : 'outline'}
            size="xs"
            onClick={() => onChange(opt)}
          >
            {opt}
          </Button>
        ))}
      </div>
    </div>
  )
}

/* ─── TextArea with progress bar ─── */
function TextAreaWithProgress({
  label,
  placeholder,
  maxLength,
  rows = 3,
}: {
  label: string
  placeholder: string
  maxLength: number
  rows?: number
}) {
  const [value, setValue] = useState('')
  return (
    <div className="flex flex-col gap-1.5 py-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--text-primary)]">{label}</span>
        <span className="text-xs text-[var(--text-muted)]">{value.length}/{maxLength}</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-subtle)]"
      />
      <CharProgress current={value.length} max={maxLength} />
    </div>
  )
}

/* ═══ Main Component ═══ */
export default function CustomizationPanel({ activeTemplateId }: CustomizationPanelProps) {
  const activeTemplate = TEMPLATES.find((t) => t.id === activeTemplateId) ?? TEMPLATES[0]
  const [primaryColor, setPrimaryColor] = useState(activeTemplate.colorScheme.bg)
  const [accentColor, setAccentColor] = useState(activeTemplate.colorScheme.accent)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [domainSlug, setDomainSlug] = useState('')

  // Feature toggles
  const [features, setFeatures] = useState({
    tripPlanner: true,
    googleData: true,
    aiSuggestions: true,
    quickRecs: true,
    invites: true,
    groupVoting: true,
    collabCheckout: true,
  })
  const [boostPicks, setBoostPicks] = useState('Always first')
  const [multiGuestPreset, setMultiGuestPreset] = useState('Full')
  const [hostsPicksMode, setHostsPicksMode] = useState('Curated only')

  function toggleFeature(key: keyof typeof features) {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setLogoPreview(url)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* ── Branding ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Branding</CardTitle>
          <CardDescription>Logo, colors, and domain</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {/* Live preview strip */}
          <div
            className="flex h-12 items-center justify-between rounded-lg px-4"
            style={{ backgroundColor: primaryColor }}
          >
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="h-6 w-6 rounded object-cover" />
            ) : (
              <span className="text-xs font-medium" style={{ color: activeTemplate.colorScheme.text }}>
                Your Brand
              </span>
            )}
            <span
              className="rounded-md px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: accentColor, color: primaryColor }}
            >
              Button
            </span>
          </div>

          {/* Logo upload — dashed drop-zone */}
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-[var(--border)] p-4 transition-colors hover:border-[var(--accent)] hover:bg-[var(--bg-surface)]">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo preview" className="h-10 w-10 rounded-lg object-cover" />
            ) : (
              <Upload className="h-5 w-5 text-[var(--text-muted)]" />
            )}
            <span className="text-xs text-[var(--text-muted)]">
              {logoPreview ? 'Change logo' : 'Upload logo'}
            </span>
            <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
          </label>

          <ColorSwatch label="Primary color" value={primaryColor} onChange={setPrimaryColor} />
          <ColorSwatch label="Accent color" value={accentColor} onChange={setAccentColor} />

          {/* Custom domain */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-[var(--text-primary)]">Domain</span>
            <div className="flex items-center rounded-md border border-[var(--border)] bg-[var(--bg-surface)]">
              <span className="border-r border-[var(--border)] px-2 py-1 text-xs text-[var(--text-muted)]">
                afterstay.app/
              </span>
              <input
                type="text"
                value={domainSlug}
                onChange={(e) => setDomainSlug(e.target.value.replace(/[^a-z0-9-]/g, ''))}
                placeholder="your-brand"
                className="w-24 bg-transparent px-2 py-1 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:outline-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Features ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Features</CardTitle>
          <CardDescription>Toggle guest-facing modules</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {/* Discovery group */}
          <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Discovery
          </span>
          <div className="flex flex-col gap-0.5">
            <FeaturePill icon={Map} label="Trip Planner" checked={features.tripPlanner} onChange={() => toggleFeature('tripPlanner')} />
            <FeaturePill icon={Globe} label="Show Google data" checked={features.googleData} onChange={() => toggleFeature('googleData')} />
            <FeaturePill icon={Sparkles} label="AI suggestions" checked={features.aiSuggestions} onChange={() => toggleFeature('aiSuggestions')} />
            <FeaturePill icon={Star} label="Quick Recs" checked={features.quickRecs} onChange={() => toggleFeature('quickRecs')} />
          </div>

          {/* Multi-Guest group */}
          <span className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Multi-Guest
          </span>
          <div className="flex flex-col gap-0.5">
            <FeaturePill icon={Users} label="Multi-Guest Invites" checked={features.invites} onChange={() => toggleFeature('invites')} />
            <FeaturePill icon={Vote} label="Group Voting" checked={features.groupVoting} onChange={() => toggleFeature('groupVoting')} />
            <FeaturePill icon={ShoppingCart} label="Collaborative Checkout" checked={features.collabCheckout} onChange={() => toggleFeature('collabCheckout')} />
          </div>

          {/* Segmented selects */}
          <span className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Curation
          </span>
          <SegmentedGroup
            label="Boost Host's Picks"
            options={['Always first', 'Mixed in', 'Disabled']}
            value={boostPicks}
            onChange={setBoostPicks}
          />
          <SegmentedGroup
            label="Multi-Guest Preset"
            options={['Full', 'Standard', 'Basic', 'Single-Player', 'Custom']}
            value={multiGuestPreset}
            onChange={setMultiGuestPreset}
          />
        </CardContent>
      </Card>

      {/* ── Content ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content</CardTitle>
          <CardDescription>Messaging and recommendations</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <TextAreaWithProgress
            label="Welcome message"
            placeholder="Welcome to your stay! We're excited to host you..."
            maxLength={200}
            rows={3}
          />
          <SegmentedGroup
            label="Host's Picks"
            options={['Curated only', 'Google + Curated', 'AI-generated']}
            value={hostsPicksMode}
            onChange={setHostsPicksMode}
          />
          <TextAreaWithProgress
            label="Custom AI prompt"
            placeholder="e.g. Focus on family-friendly activities..."
            maxLength={200}
            rows={2}
          />
        </CardContent>
      </Card>
    </div>
  )
}
