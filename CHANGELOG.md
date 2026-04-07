# Changelog

All notable changes to AfterStay (NestOps) will be documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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
