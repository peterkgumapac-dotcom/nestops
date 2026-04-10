'use client'

import { useState } from 'react'
import { MessageCircle, Smartphone, MessageSquare, Mail, Phone, Plus, Pencil, Trash2 } from 'lucide-react'
import ModuleCard from './ModuleCard'
import ToggleSwitch from '@/components/ui/toggle-switch'
import { Button } from '@/components/ui/button'
import {
  DEFAULT_TEMPLATES,
  DEFAULT_ROUTING,
  DEFAULT_NOTIFICATIONS,
  ROUTING_OPTIONS,
  type QuickTemplate,
  type InboxRouting,
  type NotificationPrefs,
} from '@/lib/data/messaging'

const CHANNELS = [
  { key: 'In-app', icon: Smartphone, connected: true },
  { key: 'WhatsApp', icon: MessageSquare, connected: false },
  { key: 'SMS', icon: Phone, connected: false },
  { key: 'Email', icon: Mail, connected: true },
] as const

const RESPONSE_GOALS = [
  { value: '5', label: '5 min' },
  { value: '15', label: '15 min' },
  { value: '60', label: '1 hour' },
  { value: '240', label: '4 hours' },
] as const

const DEFAULT_AUTO_REPLY = 'Thanks for reaching out! We typically respond within {responseGoal}. If this is urgent, please call us directly.'

export default function MessagingPanel() {
  const [enabled, setEnabled] = useState(true)
  const [channels, setChannels] = useState<Set<string>>(() => new Set(['In-app', 'Email']))
  const [routing, setRouting] = useState<InboxRouting>(() => ({ ...DEFAULT_ROUTING }))
  const [autoReplyOn, setAutoReplyOn] = useState(true)
  const [autoReplyText, setAutoReplyText] = useState(DEFAULT_AUTO_REPLY)
  const [autoReplyExpanded, setAutoReplyExpanded] = useState(false)
  const [templates, setTemplates] = useState<QuickTemplate[]>(() => [...DEFAULT_TEMPLATES])
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)
  const [templateBuffer, setTemplateBuffer] = useState<{ title: string; body: string }>({ title: '', body: '' })
  const [notifications, setNotifications] = useState<NotificationPrefs>(() => ({ ...DEFAULT_NOTIFICATIONS }))
  const [responseGoal, setResponseGoal] = useState('15')

  function handleChannelToggle(channel: string) {
    setChannels(prev => {
      const next = new Set(prev)
      if (next.has(channel)) { next.delete(channel) } else { next.add(channel) }
      return next
    })
  }

  function startEditTemplate(t: QuickTemplate) {
    setEditingTemplateId(t.id)
    setTemplateBuffer({ title: t.title, body: t.body })
  }

  function startNewTemplate() {
    const id = `qt${Date.now()}`
    setEditingTemplateId(id)
    setTemplateBuffer({ title: '', body: '' })
  }

  function saveTemplate() {
    if (!editingTemplateId) return
    const existing = templates.find(t => t.id === editingTemplateId)
    if (existing) {
      setTemplates(prev => prev.map(t =>
        t.id === editingTemplateId ? { ...t, title: templateBuffer.title, body: templateBuffer.body } : t
      ))
    } else {
      setTemplates(prev => [...prev, {
        id: editingTemplateId,
        title: templateBuffer.title,
        body: templateBuffer.body,
        category: 'general',
      }])
    }
    setEditingTemplateId(null)
  }

  function deleteTemplate(id: string) {
    setTemplates(prev => prev.filter(t => t.id !== id))
    if (editingTemplateId === id) setEditingTemplateId(null)
  }

  const configContent = (
    <>
      {/* Channel status */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Channels
        </span>
        <div className="flex flex-col gap-0.5">
          {CHANNELS.map(({ key, icon: ChannelIcon, connected }) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg bg-[var(--bg-surface)] px-3 py-2"
            >
              <div className="flex items-center gap-2.5">
                <ChannelIcon className="h-4 w-4 text-[var(--text-muted)]" />
                <span className="text-sm text-[var(--text-primary)]">{key}</span>
                {channels.has(key) && (
                  <span className="flex items-center gap-1 text-[10px]" style={{
                    color: connected ? 'var(--status-green-fg)' : 'var(--status-amber-fg)',
                  }}>
                    <span className="inline-block h-1.5 w-1.5 rounded-full" style={{
                      background: connected ? 'var(--status-green-fg)' : 'var(--status-amber-fg)',
                    }} />
                    {connected ? 'Connected' : 'Set up'}
                  </span>
                )}
              </div>
              <ToggleSwitch
                checked={channels.has(key)}
                onChange={() => handleChannelToggle(key)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Inbox routing */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Inbox Routing
        </span>
        <div className="flex flex-col gap-1">
          {ROUTING_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setRouting(prev => ({ ...prev, destination: opt.value }))}
              className="flex flex-col rounded-lg px-3 py-2 text-left transition-colors"
              style={{
                background: routing.destination === opt.value ? 'var(--accent-muted, rgba(0,0,0,0.06))' : 'var(--bg-surface)',
                border: `1px solid ${routing.destination === opt.value ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              <span className="text-sm font-medium text-[var(--text-primary)]">{opt.label}</span>
              <span className="text-xs text-[var(--text-muted)]">{opt.description}</span>
            </button>
          ))}
        </div>
        {/* Auto-escalate */}
        <div className="flex items-center justify-between rounded-lg bg-[var(--bg-surface)] px-3 py-2">
          <div className="flex flex-col">
            <span className="text-sm text-[var(--text-primary)]">Auto-escalate</span>
            {routing.escalationEnabled && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-[var(--text-muted)]">After</span>
                <input
                  type="number"
                  min={1}
                  className="w-12 rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-1.5 py-0.5 text-xs text-[var(--text-primary)] outline-none"
                  value={routing.escalationTimeoutMin}
                  onChange={e => setRouting(prev => ({ ...prev, escalationTimeoutMin: Number(e.target.value) }))}
                />
                <span className="text-xs text-[var(--text-muted)]">min</span>
              </div>
            )}
          </div>
          <ToggleSwitch
            checked={routing.escalationEnabled}
            onChange={v => setRouting(prev => ({ ...prev, escalationEnabled: v }))}
          />
        </div>
      </div>

      {/* Auto-reply editor */}
      <div className="flex flex-col gap-1">
        <div
          className="flex cursor-pointer items-center justify-between rounded-lg bg-[var(--bg-surface)] px-3 py-2"
          onClick={() => setAutoReplyExpanded(prev => !prev)}
        >
          <span className="text-sm text-[var(--text-primary)]">Auto-reply</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--text-subtle)]">{autoReplyExpanded ? '▲' : '▼'}</span>
            <div onClick={e => e.stopPropagation()}>
              <ToggleSwitch checked={autoReplyOn} onChange={setAutoReplyOn} />
            </div>
          </div>
        </div>
        {autoReplyExpanded && autoReplyOn && (
          <div className="rounded-lg border border-[var(--border)] p-3">
            <textarea
              className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              rows={3}
              value={autoReplyText}
              onChange={e => setAutoReplyText(e.target.value)}
            />
            <div className="mt-1 text-right text-[10px] text-[var(--text-subtle)]">
              {autoReplyText.length} / 500
            </div>
          </div>
        )}
      </div>

      {/* Quick templates */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              Quick Templates
            </span>
            <span className="rounded-full bg-[var(--bg-surface)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
              {templates.length}
            </span>
          </div>
          <Button size="sm" variant="outline" onClick={startNewTemplate}>
            <Plus className="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>

        {/* Inline template editor (for new) */}
        {editingTemplateId && !templates.find(t => t.id === editingTemplateId) && (
          <div className="rounded-lg border border-[var(--accent)] p-3">
            <input
              className="mb-2 w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-sm text-[var(--text-primary)] outline-none"
              placeholder="Template title"
              value={templateBuffer.title}
              onChange={e => setTemplateBuffer(prev => ({ ...prev, title: e.target.value }))}
            />
            <textarea
              className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-sm text-[var(--text-primary)] outline-none"
              rows={2}
              placeholder="Template body"
              value={templateBuffer.body}
              onChange={e => setTemplateBuffer(prev => ({ ...prev, body: e.target.value }))}
            />
            <div className="mt-2 flex gap-2">
              <Button size="sm" onClick={saveTemplate} disabled={!templateBuffer.title.trim()}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditingTemplateId(null)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-0.5">
          {templates.map(t => (
            <div key={t.id}>
              {editingTemplateId === t.id ? (
                <div className="rounded-lg border border-[var(--accent)] p-3">
                  <input
                    className="mb-2 w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-sm text-[var(--text-primary)] outline-none"
                    value={templateBuffer.title}
                    onChange={e => setTemplateBuffer(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <textarea
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-sm text-[var(--text-primary)] outline-none"
                    rows={2}
                    value={templateBuffer.body}
                    onChange={e => setTemplateBuffer(prev => ({ ...prev, body: e.target.value }))}
                  />
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" onClick={saveTemplate}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingTemplateId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between rounded-lg bg-[var(--bg-surface)] px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-[var(--text-primary)]">{t.title}</div>
                    <div className="line-clamp-2 text-xs text-[var(--text-muted)]">{t.body}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 ml-2">
                    <button
                      onClick={() => startEditTemplate(t)}
                      className="rounded p-1 text-[var(--text-subtle)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => deleteTemplate(t.id)}
                      className="rounded p-1 text-[var(--text-subtle)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--status-red-fg)]"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Notification preferences */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Notifications
        </span>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between rounded-lg bg-[var(--bg-surface)] px-3 py-2">
            <div className="flex flex-col">
              <span className="text-sm text-[var(--text-primary)]">Email digest</span>
              {notifications.emailDigest && (
                <select
                  className="mt-0.5 w-24 rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-1.5 py-0.5 text-xs text-[var(--text-primary)] outline-none"
                  value={notifications.digestFrequency}
                  onChange={e => setNotifications(prev => ({ ...prev, digestFrequency: e.target.value as NotificationPrefs['digestFrequency'] }))}
                >
                  <option value="instant">Instant</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                </select>
              )}
            </div>
            <ToggleSwitch
              checked={notifications.emailDigest}
              onChange={v => setNotifications(prev => ({ ...prev, emailDigest: v }))}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-[var(--bg-surface)] px-3 py-2">
            <span className="text-sm text-[var(--text-primary)]">Push notifications</span>
            <ToggleSwitch
              checked={notifications.pushNotifications}
              onChange={v => setNotifications(prev => ({ ...prev, pushNotifications: v }))}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-[var(--bg-surface)] px-3 py-2">
            <span className="text-sm text-[var(--text-primary)]">Real-time alerts</span>
            <ToggleSwitch
              checked={notifications.realTimeAlerts}
              onChange={v => setNotifications(prev => ({ ...prev, realTimeAlerts: v }))}
            />
          </div>
        </div>
      </div>

      {/* Response time goal */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
          Response Time Goal
        </span>
        <div className="flex flex-wrap gap-1.5">
          {RESPONSE_GOALS.map(opt => (
            <Button
              key={opt.value}
              variant={responseGoal === opt.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setResponseGoal(opt.value)}
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
      icon={MessageCircle}
      title="Messaging"
      description="Guest communication channels and templates"
      accentColor="var(--status-purple-fg)"
      enabled={enabled}
      onToggle={setEnabled}
      stats={[
        { label: '12 min avg response' },
        { label: '94% reply rate' },
      ]}
      configContent={configContent}
      manageLink={{ href: '/operator/guest-services/messaging', label: 'View inbox' }}
    />
  )
}
