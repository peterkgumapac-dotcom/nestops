'use client'
import PageHeader from '@/components/shared/PageHeader'
import Tabs from '@/components/shared/Tabs'
import { useState, useEffect } from 'react'
import { useRole } from '@/context/RoleContext'
import {
  getPrefs, savePrefs, resetPrefs,
  TOGGLE_LABELS, ALWAYS_ON,
} from '@/lib/data/briefingPrefs'
import type { BriefingPrefs, BriefingToggles } from '@/lib/data/briefingPrefs'

const INITIAL_INTEGRATIONS = [
  { id: 'guesty',     name: 'Guesty',     desc: 'PMS integration',       connected: true },
  { id: 'breezeway',  name: 'Breezeway',  desc: 'Operations platform',   connected: true },
  { id: 'noiseaware', name: 'NoiseAware', desc: 'Noise monitoring',      connected: false },
  { id: 'hostaway',   name: 'Hostaway',   desc: 'Channel manager',       connected: false },
]

const INITIAL_WAREHOUSES = [
  { id: 'w1', name: 'Oslo Warehouse',   address: 'Industrigata 14, Oslo' },
  { id: 'w2', name: 'Bergen Warehouse', address: 'Laksevåg 3, Bergen' },
]

interface ChangeEntry {
  version: string
  date: string
  items: { tag: string; text: string }[]
}

const CHANGELOG: ChangeEntry[] = [
  {
    version: 'v1.9',
    date: 'Mar 19, 2026',
    items: [
      { tag: '⚡ Feature', text: 'Inventory v2 — full rewrite with 7 tabs: Warehouse, Templates, Purchase Orders, Vendors, Restock Alerts, Cost Analytics, and Waste Tracking' },
      { tag: '⚡ Feature', text: 'Storage location filter — partitions stock items by location (central warehouse, group storage, property closet) with Add Location drawer' },
      { tag: '⚡ Feature', text: 'Consumption Templates — create/assign per-property-type turnover templates; Mark Cleaning Done deducts stock with toast confirmation' },
      { tag: '⚡ Feature', text: 'Purchase Order approval tiers — auto (<500 NOK), manager (<2000 NOK), owner (2000+ NOK); full approval chain shown in PO detail drawer' },
      { tag: '⚡ Feature', text: 'Multi-vendor price comparison — cheapest vendor highlighted on restock alerts and shopping cart with per-item vendor switcher' },
      { tag: '⚡ Feature', text: 'Shopping cart — grouped by vendor with editable qty, tier badge, and Create POs button (auto-splits by vendor)' },
      { tag: '⚡ Feature', text: 'Plan Restock Run modal — select properties, view combined shopping list by vendor, add all alerts to cart in one click' },
      { tag: '⚡ Feature', text: 'Cost Analytics tab — month-over-month spend bars, spend by category, and spend by property for current month' },
      { tag: '⚡ Feature', text: 'Staff Waste Leaderboard — actual vs expected consumption per staff member with Δ% badge and 4-week sparkline bars' },
      { tag: '⚡ Feature', text: 'Pre-check-in stock alert banner on operator dashboard — warns when a check-in within 72h has low/critical/out stock items assigned' },
      { tag: '⚡ Feature', text: 'Pending POs widget on operator dashboard — manager-tier POs with inline Approve / Request Changes actions' },
      { tag: '⚡ Feature', text: 'Purchase Approval cards in owner approvals portal — owner-tier POs surface automatically with vendor, amount, and tier badge' },
      { tag: '🐛 Fix', text: "What's New modal z-index — moved outside sidebar stacking context and raised to z-index 600 so it overlays all content correctly" },
      { tag: '🐛 Fix', text: 'IssueSheet stale state — convertDone, linkedTask, refundNights now reset via useEffect when switching between issues' },
      { tag: '🐛 Fix', text: 'IssueSheet confirm modal — Escape key closes it; z-index raised to 300 (above command palette)' },
      { tag: '🐛 Fix', text: 'NewIssueSheet — Cancel button resets all form fields; max-5 photo limit now shows a toast instead of silently failing' },
      { tag: '🐛 Fix', text: 'Issues page assign popover — closes on outside click via transparent backdrop div' },
      { tag: '🐛 Fix', text: 'Refunds Log Refund drawer — Cancel button now resets all form fields on close' },
      { tag: '🐛 Fix', text: 'Maintenance countdown badge — uses actual current date instead of hardcoded 2026-03-18' },
      { tag: '🐛 Fix', text: 'Upsells tab badge — now visible when "My Requests" tab is active (was invisible due to low-contrast background)' },
      { tag: '🐛 Fix', text: 'Inventory PO status — Approve / Request Changes / Send now persists to orders state, not just the display override map' },
    ],
  },
  {
    version: 'v1.8',
    date: 'Mar 18, 2026',
    items: [
      { tag: '⚡ Feature', text: 'Guest Verification module — /operator/verification with Guests table, per-property Step Configurator, and Analytics tab; verification statuses: Not Started, In Progress, Verified, Failed, Overridden' },
      { tag: '⚡ Feature', text: 'Variables tab in Guidebook editor — token picker organized by Booking, Guest, Listing, Access, and Calculated categories; click to copy {{token_name}} syntax' },
      { tag: '⚡ Feature', text: 'Conditions tab in Guidebook editor — available-from, expiry, and conditions engine (channel, booking source, nights, guest type, season) with AND/OR logic toggle' },
      { tag: '⚡ Feature', text: 'Upsell pricing units — Flat fee, Per night, Per person, Per pet, % of nightly rate, Per bedroom, Tiered; availability window and suppress-if-purchased controls' },
      { tag: '🎨 UI', text: 'Upsells Dashboard tab — stat cards (active rules, est. revenue, attach rate), top performers table, and category breakdown bars' },
      { tag: '🧭 Nav', text: 'Verification added to Platform section in operator and app sidebars (ShieldCheck icon)' },
    ],
  },
  {
    version: 'v1.7',
    date: 'Mar 18, 2026',
    items: [
      { tag: '⚡ Feature', text: 'Upsell Rules Engine — new /operator/upsells page with a central upsell catalog; 8 seed rules covering Early Check-in, Late Checkout, Airport Transfer, Welcome Basket, Local Food Tour, Mid-Stay Refresh, Ski Equipment Rental, and Pet Fee Add-on' },
      { tag: '⚡ Feature', text: 'Targeting system — each upsell rule can target All Properties, Property Groups (with color-coded group chips), or Specific Properties; summary bar shows live property count' },
      { tag: '⚡ Feature', text: 'Conditions engine — add/remove condition rows (stay length, check-in day, guests, booking source, property group) with field / operator / value dropdowns; AND logic' },
      { tag: '⚡ Feature', text: 'Rule Editor drawer — three-tab interface: Details (title, description, price, currency, category, CTA label, image URL), Targeting, and Conditions; Save / Delete / Cancel actions' },
      { tag: '🎨 UI', text: 'Guidebooks Upsells tab replaced with read-only Active Upsells preview — shows which rules apply to the selected property and why (group name or "All properties"), with "Manage Upsells →" deep-link' },
      { tag: '🧭 Nav', text: 'Upsells added to Platform section in operator sidebar (ShoppingBag icon)' },
    ],
  },
  {
    version: 'v1.6',
    date: 'Mar 18, 2026',
    items: [
      { tag: '⚡ Feature', text: 'Cleaning QA Scoring — after all checklist items are checked on a Cleaning task, a mandatory QA step appears: star rating (1–5), at least 1 photo, optional notes, saves qaStatus: pending to localStorage' },
      { tag: '⚡ Feature', text: 'QA Pending widget on operator dashboard — lists cleaning tasks pending review with property, cleaner, and star rating; Review opens sheet with photo + rating + Approve / Flag for Redo actions' },
      { tag: '⚡ Feature', text: 'Upsell Module in Guidebooks — Upsells tab with 5 default items (Early Check-in, Late Checkout, Airport Transfer, Local Tour, Welcome Basket); toggle + price edit per item; live preview panel' },
      { tag: '⚡ Feature', text: 'Review Request Automation Templates — "Post-Checkout Review Request" and "5★ Review Follow-up + Referral" added to Automation Templates' },
      { tag: '⚡ Feature', text: 'Smart Lock Management UI — Smart Access tab on property detail: SuiteOp/Manual connection badge, masked access codes with reveal toggle and Rotate button (generates new 6-digit code + toast), last-5-events access log' },
      { tag: '⚡ Feature', text: 'Actionable Cleaning Schedule — Schedule Cleaning button in Operations → Cleaning tab; click empty grid cell to open pre-filled drawer; click existing job card to open detail drawer; turnover gap shown amber (<3h) or red (<1.5h)' },
    ],
  },
  {
    version: 'v1.5',
    date: 'Mar 18, 2026',
    items: [
      { tag: '🐛 Fix', text: 'Maintenance dashboard no longer shows cleaning content — subRole isolation hardened with mount guard to prevent cross-role content bleed' },
      { tag: '⚡ Feature', text: 'Work Orders: "Requires Owner Approval" toggle — when checked, work order surfaces in owner Approvals portal automatically via localStorage' },
      { tag: '⚡ Feature', text: 'Owner Approvals: now merges staff-submitted owner-flagged work orders into Pending tab alongside existing approvals' },
      { tag: '🎨 UI', text: 'Owner dashboard: removed "Upcoming Maintenance" section — operational staff scheduling data not relevant to owners' },
      { tag: '⚡ Feature', text: 'Cleaning dashboard: "Add Cleaning" CTA with 5-template drawer (Full Turnover, Mid-Stay Refresh, Post-Construction, Pre-Inspection, Seasonal Deep Clean)' },
      { tag: '⚡ Feature', text: 'Cleaning templates: step 1 template selection → step 2 property + date + notes + read-only task preview → Create Cleaning toast + "N added today" badge' },
    ],
  },
  {
    version: 'v1.4',
    date: 'Mar 18, 2026',
    items: [
      { tag: '⚡ Feature', text: "Cross-role data sharing — owner approvals, compliance alerts, and today's staff jobs now visible in operator dashboard" },
      { tag: '⚡ Feature', text: 'Owner Approvals panel on operator dashboard — approve/dismiss directly, no need to switch portals' },
      { tag: '⚡ Feature', text: "Today's Jobs widget on operator dashboard — real-time view of all scheduled field work with priority and staff assignment" },
      { tag: '⚡ Feature', text: 'Field Reports widget — cleaning staff maintenance issues surface in operator sidebar in real-time' },
      { tag: '⚡ Feature', text: 'Compliance Alerts stat card on operator dashboard — count of expired/missing/expiring docs across all properties' },
      { tag: '⚡ Feature', text: 'Owner maintenance page redesigned with 2 sections: Routine Maintenance history + Requires Your Approval (threshold/vendor/expense items)' },
      { tag: '⚡ Feature', text: 'Owner properties page shows compliance indicator dots per property (green=compliant, amber=expiring, red=action needed)' },
      { tag: '⚡ Feature', text: 'Owner dashboard: compliance alert banners + Upcoming Maintenance section showing staff-scheduled jobs' },
      { tag: '⚡ Feature', text: 'Cleaning staff: "Report Maintenance Issue" CTA — submit issue type, urgency, description, saves to operator Field Reports widget' },
      { tag: '⚡ Feature', text: 'Work Orders page — staff portal for all roles to submit work orders, vendor approvals, and purchase approvals' },
      { tag: '⚡ Feature', text: 'Work Orders added to cleaning, maintenance, and guest services nav bars' },
      { tag: '⚡ Feature', text: 'My Tasks now filters by subRole type — maintenance staff see only maintenance tasks, cleaners see only cleaning/inspection' },
      { tag: '⚡ Feature', text: 'Operator property detail: Compliance, Assets, and Cleaning tabs now show real data (previously stubbed)' },
      { tag: '⚡ Feature', text: 'Operator tickets: New Request wired with full form, Approve/Decline for purchase requests, Assign to Staff popover for maintenance, Resolve closes and updates status' },
      { tag: '⚡ Feature', text: 'Operator settings: Save Changes, inline warehouse edit, Connect/Disconnect integrations — all wired with state and toast' },
      { tag: '⚡ Feature', text: 'Owner requests: Submit button wired — creates new request, appears in list immediately' },
      { tag: '⚡ Feature', text: 'Owner maintenance: Approve/Decline buttons now update row state + toast confirmation' },
      { tag: '⚡ Feature', text: 'Owner billing: Download statement button wired per paid statement row' },
      { tag: '🎨 UI', text: 'Maintenance page split into 3 sections: Pending Approvals (cost/vendor), Routine History, and Resolved Approvals — clear visual hierarchy' },
    ],
  },
  {
    version: 'v1.3',
    date: 'Mar 18, 2026',
    items: [
      { tag: '⚡ Feature', text: "Role-specific navigation per staff subRole — Cleaning, Maintenance, and Guest Services each see only their relevant menu items" },
      { tag: '⚡ Feature', text: "Sidebar now shows logged-in user's real name and initials from session storage" },
      { tag: '⚡ Feature', text: 'Nav restructured: Cleaning → Schedules, Tasks & SOPs → Operations, Contractors moved under Properties, Guest Experience + Automation merged into Platform section' },
      { tag: '⚡ Feature', text: '"Add Contractor" wired — opens slide-in drawer with form, saves new contractor to list with toast confirmation' },
      { tag: '⚡ Feature', text: '"Add Asset" and "Submit Report" wired on Fixed Assets page' },
      { tag: '⚡ Feature', text: 'Compliance: Edit, Send Request, and Save buttons wired with state and toast feedback' },
      { tag: '⚡ Feature', text: 'Automations: "Use Template" pre-fills form, "Save Draft" and "Activate" fully wired' },
      { tag: '⚡ Feature', text: 'Alerts: Edit/Delete rules, Disconnect integrations, Save alert rule, +Add mapping, Send Test Message, Save Slack config — all wired' },
      { tag: '⚡ Feature', text: 'Guidebooks: Publish/Unpublish toggle, Save Changes, theme selector, Copy URL, Download QR, New Guidebook, and Preview buttons all wired' },
      { tag: '⚡ Feature', text: 'Owner nav sections grouped: My Portfolio, Approvals, Financials' },
      { tag: '🎨 UI', text: 'Floating toast notifications for all interactive actions — consistent pattern across all pages' },
      { tag: '🎨 UI', text: 'Changelog page added under Account section for transparency on shipped improvements' },
    ],
  },
  {
    version: 'v1.2',
    date: 'Mar 18, 2026',
    items: [
      { tag: '♿ A11y', text: 'WCAG AA contrast fix for --text-subtle color token' },
      { tag: '♿ A11y', text: ':focus-visible keyboard navigation rings on all interactive elements' },
      { tag: '♿ A11y', text: 'prefers-reduced-motion respected for all pulsing animations' },
      { tag: '♿ A11y', text: 'aria-label added to Notifications bell and Briefing preferences button' },
      { tag: '⚡ Feature', text: 'Staff page reads auth from localStorage — shows correct logged-in user, not hardcoded Johan' },
      { tag: '⚡ Feature', text: 'Team schedule week dates computed dynamically from current date' },
      { tag: '🐛 Fix', text: 'Dynamic copyright year — no longer hardcoded' },
      { tag: '🐛 Fix', text: '"Show Code" shows locked state before 30-min threshold instead of disappearing' },
      { tag: '🐛 Fix', text: 'Demo user click guard prevents double-click login race condition' },
    ],
  },
  {
    version: 'v1.1',
    date: 'Mar 2026',
    items: [
      { tag: '⚡ Feature', text: 'Dark theme system with CSS custom properties — full token architecture' },
      { tag: '⚡ Feature', text: 'Role-based accent colors: operator purple, owner green, staff amber' },
      { tag: '⚡ Feature', text: 'Framer Motion page transitions on briefing flow' },
      { tag: '⚡ Feature', text: 'Briefing preferences persisted to localStorage per user' },
      { tag: '🎨 UI', text: 'Industrial design language — #0a0f1a background, card hierarchy, monospace accents' },
      { tag: '⚡ Feature', text: 'Multi-role demo login with 6 persona accounts' },
    ],
  },
]

const TAG_COLORS: Record<string, string> = {
  '⚡ Feature': '#7c3aed',
  '🎨 UI': '#0891b2',
  '🐛 Fix': '#dc2626',
  '♿ A11y': '#059669',
  '🧭 Nav': '#d97706',
}

export default function SettingsPage() {
  const { accent, user } = useRole()
  const [activeTab, setActiveTab] = useState('brand')
  const [briefingPrefs, setBriefingPrefs] = useState<BriefingPrefs | null>(null)
  const [toast, setToast] = useState('')
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  // Brand tab
  const [companyName, setCompanyName] = useState('NestOps Management')
  const [supportEmail, setSupportEmail] = useState('support@nestops.no')
  const [website, setWebsite] = useState('https://nestops.no')

  // Warehouses tab
  const [warehouses, setWarehouses] = useState(INITIAL_WAREHOUSES)
  const [editingWarehouseId, setEditingWarehouseId] = useState<string | null>(null)
  const [editWarehouseName, setEditWarehouseName] = useState('')
  const [editWarehouseAddress, setEditWarehouseAddress] = useState('')

  // Integrations tab
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS)

  useEffect(() => {
    if (!user) return
    const p = getPrefs(user.id, user.subRole ?? '', user.role)
    setBriefingPrefs(p)
  }, [user])

  const tabs = [
    { key: 'brand', label: 'Brand' },
    { key: 'warehouses', label: 'Warehouses' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'integrations', label: 'Integrations' },
    { key: 'briefing', label: 'Briefing' },
    { key: 'changelog', label: 'Changelog' },
  ]

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--bg-elevated)',
    color: 'var(--text-primary)' as const,
    fontSize: 14,
    outline: 'none',
  }

  const labelStyle = { fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 6, display: 'block' as const }

  const startEditWarehouse = (w: typeof INITIAL_WAREHOUSES[0]) => {
    setEditingWarehouseId(w.id)
    setEditWarehouseName(w.name)
    setEditWarehouseAddress(w.address)
  }

  const saveWarehouse = (id: string) => {
    setWarehouses(prev => prev.map(w => w.id === id ? { ...w, name: editWarehouseName, address: editWarehouseAddress } : w))
    setEditingWarehouseId(null)
    showToast('Warehouse updated')
  }

  const toggleIntegration = (id: string, connected: boolean) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: !connected } : i))
    showToast(connected ? 'Integration disconnected' : 'Integration connected')
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Platform configuration" />
      <div style={{ maxWidth: 600 }}>
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

        {activeTab === 'brand' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div><label style={labelStyle}>Company Name</label><input style={inputStyle} value={companyName} onChange={e => setCompanyName(e.target.value)} /></div>
            <div><label style={labelStyle}>Primary Color</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: 6, background: accent, border: '1px solid var(--border)' }} />
                <input style={{ ...inputStyle, flex: 1 }} defaultValue={accent} />
              </div>
            </div>
            <div><label style={labelStyle}>Support Email</label><input style={inputStyle} value={supportEmail} onChange={e => setSupportEmail(e.target.value)} type="email" /></div>
            <div><label style={labelStyle}>Website</label><input style={inputStyle} value={website} onChange={e => setWebsite(e.target.value)} /></div>
            <button onClick={() => showToast('Brand settings saved')} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: accent, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', width: 'fit-content' }}>
              Save Changes
            </button>
          </div>
        )}

        {activeTab === 'warehouses' && (
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {warehouses.map(w => (
                <div key={w.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                  {editingWarehouseId === w.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <input style={inputStyle} value={editWarehouseName} onChange={e => setEditWarehouseName(e.target.value)} placeholder="Warehouse name" />
                      <input style={inputStyle} value={editWarehouseAddress} onChange={e => setEditWarehouseAddress(e.target.value)} placeholder="Address" />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setEditingWarehouseId(null)} style={{ flex: 1, padding: '8px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                        <button onClick={() => saveWarehouse(w.id)} style={{ flex: 1, padding: '8px', borderRadius: 7, border: 'none', background: accent, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Save</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{w.name}</div>
                        <div style={{ fontSize: 12 }}>{w.address}</div>
                      </div>
                      <button onClick={() => startEditWarehouse(w)} style={{ fontSize: 13, color: accent, background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {['Email alerts for new requests', 'Low stock notifications', 'Compliance expiry reminders', 'New owner onboarding alerts'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{item}</span>
                <div style={{ width: 40, height: 22, borderRadius: 11, background: accent, cursor: 'pointer', position: 'relative' }}>
                  <div style={{ position: 'absolute', right: 3, top: 3, width: 16, height: 16, borderRadius: '50%', background: '#fff' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'integrations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {integrations.map(intg => (
              <div key={intg.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{intg.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{intg.desc}</div>
                </div>
                <button
                  onClick={() => toggleIntegration(intg.id, intg.connected)}
                  style={{ padding: '6px 14px', borderRadius: 7, fontSize: 13, cursor: 'pointer', border: intg.connected ? '1px solid var(--border)' : 'none', background: intg.connected ? 'transparent' : accent, color: intg.connected ? 'var(--text-muted)' : '#fff', fontWeight: 500 }}
                >
                  {intg.connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'briefing' && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
              Choose what appears on your daily briefing screen. Changes are saved instantly.
            </p>

            {!briefingPrefs || !user ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading preferences…</div>
            ) : (
              <>
                {Object.entries(TOGGLE_LABELS)
                  .filter(([key, meta]) =>
                    !ALWAYS_ON.includes(key as keyof BriefingToggles) &&
                    (meta.roles.includes('all') ||
                      meta.roles.includes(
                        user.role === 'operator'
                          ? 'operator'
                          : user.subRole ?? ''
                      ))
                  )
                  .map(([key, meta]) => {
                    const toggleKey = key as keyof BriefingToggles
                    const isOn = briefingPrefs.toggles[toggleKey]
                    return (
                      <div key={key} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 0',
                        borderBottom: '1px solid var(--border-subtle)',
                      }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
                            {meta.label}
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            {meta.description}
                          </div>
                        </div>
                        <div
                          onClick={() => {
                            const updated: BriefingPrefs = {
                              ...briefingPrefs,
                              toggles: {
                                ...briefingPrefs.toggles,
                                [toggleKey]: !isOn,
                              },
                            }
                            setBriefingPrefs(updated)
                            savePrefs(updated)
                          }}
                          style={{
                            width: 44, height: 24,
                            borderRadius: 12,
                            background: isOn ? accent : 'var(--border)',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            flexShrink: 0,
                            marginLeft: 20,
                          }}
                        >
                          <div style={{
                            position: 'absolute',
                            top: 2,
                            left: isOn ? 22 : 2,
                            width: 20, height: 20,
                            borderRadius: '50%',
                            background: 'white',
                            transition: 'left 0.2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                          }} />
                        </div>
                      </div>
                    )
                  })}

                <button
                  onClick={() => {
                    const reset = resetPrefs(user.id, user.subRole ?? '', user.role)
                    setBriefingPrefs(reset)
                  }}
                  style={{
                    marginTop: 24,
                    padding: '10px 20px',
                    background: 'none',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    color: 'var(--text-muted)',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Reset to defaults
                </button>
              </>
            )}
          </div>
        )}
        {activeTab === 'changelog' && (
          <div style={{ maxWidth: 720 }}>
            {CHANGELOG.map((entry, eIdx) => (
              <div key={entry.version} style={{ display: 'flex', gap: 24, marginBottom: 48 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: accent, marginTop: 6, flexShrink: 0 }} />
                  {eIdx < CHANGELOG.length - 1 && (
                    <div style={{ width: 2, flex: 1, background: 'var(--border)', marginTop: 8 }} />
                  )}
                </div>
                <div style={{ flex: 1, paddingBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, background: `${accent}18`, border: `1px solid ${accent}40`, fontSize: 12, fontWeight: 700, color: accent, letterSpacing: '0.04em' }}>
                      {entry.version}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{entry.date}</span>
                  </div>
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {entry.items.map((item, iIdx) => {
                      const tagColor = TAG_COLORS[item.tag] ?? accent
                      return (
                        <div key={iIdx} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: tagColor, background: `${tagColor}18`, border: `1px solid ${tagColor}30`, borderRadius: 5, padding: '2px 7px', flexShrink: 0, whiteSpace: 'nowrap', marginTop: 1 }}>
                            {item.tag}
                          </span>
                          <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.text}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#16a34a', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
