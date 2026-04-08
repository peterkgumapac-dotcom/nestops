# Changelog

All notable changes to AfterStay (NestOps) will be documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [v0.2.2-people] — 2026-04-07
### Changed
- **Sidebar** (`lib/nav.ts`) — operator nav label "Staff" → "People" (route `/app/team` unchanged).
- **Roster employment pill** — now color-coded per PRD: Hourly blue, Salaried purple, Contractor amber.
- **Timelog BREAK column** — per-staff values (Johan 45m, Anna —, Bjorn —, Fatima 32m).
- **Timelog NET HOURS column** — `h m` format (Johan 52h 15m, Anna 26h, Bjorn 23h, Fatima 22h 28m); grand total re-summed in minutes.
- **Timelog expanded row** — per-staff property breakdown now uses hardcoded demo values from PRD (Roster expand still uses real shift data).
- **Contracts employment pill** — composite label "{Full/Part Time} · {Hourly/Salaried/Contractor}".

### Added
- **Contracts View Contract drawer** — each card's `View Contract` button now opens a right-side drawer with a prefilled demo Employment Contract (AfterStay AS header, 8 numbered sections derived from `STAFF_CONTRACTS` data, e-signature block). `Download PDF` is a stubbed toast.

## [v0.2.1-people] — 2026-04-07
### Fixed
- **People tab active pill unreadable in dark mode** (`app/(operator)/operator/team/page.tsx`) — active tab used `color: var(--text-primary)` which resolved to white on the new white pill background, making the label invisible. Forced active-tab and Week/Month toggle label color to slate-900 (`#0f172a`) so it's always dark on white.

## [v0.2.0-people] — 2026-04-07
Repositions `/app/team` as the unified **People** hub per the People PRD — replacing HubStaff/Clockify/Deel. Changes are additive (naming, columns, inline warnings); no layout restructure.

### Changed
- **Page header** (`app/(operator)/operator/team/page.tsx`) — "Team" → **People**; subtitle → "Staff management, time tracking & payments".
- **Tabs** — `Payroll` → **Timelog** (Clock icon). Active tab pill is now neutral white (orange reserved for urgent only).
- **Roster cards** — each card now shows two small pills below the name/role: **employment type** (Hourly/Salaried/Contractor, neutral) and **contract status** (Active green / Expiring Soon amber / Expired red / Missing amber). Bjorn Larsen renders as Expiring Soon.
- **Timelog tab** — added `BREAK` and `NET HOURS` columns. Hourly staff show `23m` break (net = hours − 23min); salaried/contractor show `—`. Grand total now includes net-hours column.
- **Timelog tab** — added `Week | Month` neutral pill toggle + ghost `Export CSV` button top-right. CSV export is library-free (Blob download) and includes staff rows plus per-property shift breakdowns.
- **Leave tab** — Approve no longer mutates directly. It now opens an inline amber warning ("Approving this leave will leave {properties} unassigned {from–to}. Reassign before confirming.") with `Confirm Approval` / `Cancel` buttons. Johan / lr1 gets a property-aware message (Harbor Studio, Sunset Villa, Mar 25–28).
- **Contracts tab** — status map extended with `expiring_soon` (amber). Bjorn Larsen's contract card now renders as Expiring Soon. Added ghost `View Contract` button to each contract card (no-op for now).

### Types
- `lib/data/contracts.ts` — `StaffContract['status']` union widened to include `'expiring_soon'`.

## [v0.1.1-pulse] — 2026-04-07
### Fixed
- **GS staff Pulse missing.** `app/app/my-guest-services/page.tsx` (the per-user "My Guest Queue") did not expose a Pulse section in v0.1.0-pulse. Added a compact Pulse block above the stats row that surfaces live guest-service events, with a green pulsing dot, urgency-aware 2px orange left border on high/critical/escalated entries, and click-through to the existing issue sheet.

### Added
- `CHANGELOG.md` — project changelog. Every release from here on updates this file.

## [v0.1.0-pulse] — 2026-04-07
Alignment of all live-ops surfaces with the Pulse PRD.

### Changed
- **Shared** (`app/globals.css`) — `@keyframes livePulse` + `.live-dot` rewritten to PRD green spec (`#22c55e`, 2s loop, 8px dot). Propagates to every `.live-dot` consumer.
- **Operator dashboard** (`app/(operator)/operator/page.tsx`) — "Live Feed" → **PULSE**.
- **Operator dashboard alt shell** (`app/app/dashboard/page.tsx`) — "Activity Feed" → **PULSE**; active filter pill now white/neutral instead of accent-tinted.
- **GS Supervisor** (`app/(operator)/operator/guest-services/page.tsx`) — "Live Activity Feed" → **Pulse** with green `.live-dot`; active filter pill neutral; 2px solid orange left border on issue/blocked feed entries.
- **Cleaner My Alerts** (`app/app/alerts/page.tsx`) — active filter pill neutral/white (orange reserved for urgent). Create Work Order quick-action now gated to supervisors only — cleaners see "Review request" text only.
- **Maintenance briefing** (`app/briefing/maintenance/page.tsx`) — `showPteStatus` forced to `true` (PRD requirement); `sortJobsByAccessibility` wrapped with a stable urgency pre-sort so jobs render Urgent → Today → Earlier.

### Added
- **Cleaning Supervisor Pulse** — new Pulse section injected into `app/briefing/supervisor/page.tsx`. Green pulsing dot, `All / At Risk / Blocked / Complete` tabs (neutral active), per-entry quick actions (`Send Reminder` / `Reassign` / `Flag property` / `Reassign cleaner` / `Verify`) keyed off event type, 2px orange left border on blocked/at-risk entries.
