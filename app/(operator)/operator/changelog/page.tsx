'use client'
import PageHeader from '@/components/shared/PageHeader'
import { useRole } from '@/context/RoleContext'

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
      { tag: '⚡ Feature', text: 'Cross-role data sharing — owner approvals, compliance alerts, and today\'s staff jobs now visible in operator dashboard' },
      { tag: '⚡ Feature', text: 'Owner Approvals panel on operator dashboard — approve/dismiss directly, no need to switch portals' },
      { tag: '⚡ Feature', text: 'Today\'s Jobs widget on operator dashboard — real-time view of all scheduled field work with priority and staff assignment' },
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
      { tag: '⚡ Feature', text: 'Role-specific navigation per staff subRole — Cleaning, Maintenance, and Guest Services each see only their relevant menu items' },
      { tag: '⚡ Feature', text: 'Sidebar now shows logged-in user\'s real name and initials from session storage' },
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

export default function ChangelogPage() {
  const { accent } = useRole()

  return (
    <div>
      <PageHeader title="Changelog" subtitle="What's been shipped in NestOps" />

      <div style={{ maxWidth: 720 }}>
        {CHANGELOG.map((entry, eIdx) => (
          <div key={entry.version} style={{ display: 'flex', gap: 24, marginBottom: 48 }}>
            {/* Timeline line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: accent, marginTop: 6, flexShrink: 0 }} />
              {eIdx < CHANGELOG.length - 1 && (
                <div style={{ width: 2, flex: 1, background: 'var(--border)', marginTop: 8 }} />
              )}
            </div>

            {/* Content */}
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
    </div>
  )
}
