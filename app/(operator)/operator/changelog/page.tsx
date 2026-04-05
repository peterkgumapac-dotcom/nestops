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
    version: 'v4.1',
    date: 'Apr 4, 2026',
    items: [
      { tag: '🎨 UI', text: 'Brand logo SVG replaces placeholder "A" letter in all sidebars (AppSidebar, MainAppSidebar, OwnerShell) and landing page nav' },
      { tag: '🎨 UI', text: 'Design token rename — --green/--n-green tokens renamed to --accent/--n-accent for semantic consistency; all references updated across globals.css, login, intake, operator dashboard, and landing page' },
      { tag: '🎨 UI', text: 'Light mode border-subtle now carries a terracotta brand tint (rgba(184,90,38,0.08)) instead of flat #eeeeee' },
      { tag: '🎨 UI', text: 'OwnerShell sidebar padding standardized to match AppSidebar (20px 8px)' },
      { tag: '🎨 UI', text: 'Landing page border-radius standardized — cards 14px, mockup devices 20px, buttons 8px' },
      { tag: '✨ Animation', text: 'Mobile sidebar slide-in uses spring physics (damping:30, stiffness:300) with AnimatePresence + backdrop opacity fade' },
      { tag: '✨ Animation', text: 'What\'s New modal and banner entrance animations — scale(0.96) + y(8px) fade-in via framer-motion' },
      { tag: '✨ Animation', text: 'Nav item stagger animation fires only on initial mount via hasMountedRef — prevents re-animation on every route change' },
      { tag: '⚡ Perf', text: 'Sidebar collapse transition removed (was width 0.2s) — instant width change eliminates layout thrashing' },
      { tag: '⚡ Perf', text: 'All transition:all declarations in landing page (~18 instances) replaced with explicit property transitions for GPU compositing' },
      { tag: '⚡ Perf', text: 'IntersectionObserver rootMargin set to "0px 0px -60px 0px" for staggered scroll-reveal timing on landing page' },
    ],
  },
  {
    version: 'v4.0',
    date: 'Mar 24, 2026',
    items: [
      { tag: '⚡ Feature', text: 'Supplies bottom sheet — "+ Add item" now opens a swipeable bottom sheet (62% → 100% snap) replacing the two-step overlay; inline per-item steppers with "+ Add" toggle, search bar, Frequently Added section, and category accordions; "Done (N items added)" button merges all pending items into the supplies list in one tap' },
      { tag: '⚡ Feature', text: 'Available items subsection — expanded Supplies Used section now shows items not yet logged (muted, 60% opacity) with a single "+" to promote them to the active list with framer-motion layout animation' },
      { tag: '⚡ Feature', text: 'Expandable property card — property banner in the cleaning task drawer is now tappable; expands to show WiFi SSID, masked password, door code, storage location, and cleaning notes with Copy buttons; collapsed state shows hint icons (📶 WiFi · 🔑 Access · 🅿️ Parking)' },
      { tag: '⚡ Feature', text: 'Copy button pulse — tapping Copy on any property field triggers a scale pulse animation (1→1.15→1 over 200ms) and changes button to ✓; no toast notification per mobile UX spec' },
      { tag: '⚡ Feature', text: 'View all property info sheet — "View all property info →" link inside expanded property card opens a full-screen slide-up sheet with accordion sections: Access, WiFi, Storage, Parking, Notes, Emergency contacts, and Appliances' },
      { tag: '🏗 Arch', text: 'PropertyLibrary interface extended with storageLocation, storagePhotoUrl, and cleaningNotes optional fields; Harbor Studio (p2) seeded with hallway closet storage location and lavender allergy cleaning note' },
      { tag: '🏗 Arch', text: 'SheetItemRow and LibAccordionSection extracted as file-level helper components to keep the main page component clean; AnimatePresence added to framer-motion imports for enter/exit animations on both sheets' },
    ],
  },
  {
    version: 'v3.10',
    date: 'Mar 24, 2026',
    items: [
      { tag: '🐛 Fix', text: 'Supplies picker state bug — showSupplyOverlay and addingSupply were collapsed into one variable; setting addingSupply to an item id immediately closed the overlay gate; split into two independent state variables so the overlay stays open through item selection and confirm steps' },
      { tag: '📱 Mobile', text: 'Supplies picker two-step flow — Browse step shows full-width "Select →" buttons (44px min height); Confirm step shows 48×48px stepper buttons, 28px bold qty display, and full-width 52px "Add to list" button; "← Back" returns to Browse without closing overlay' },
      { tag: '📱 Mobile', text: 'stepperBtn touch target increased to 36×36px with borderRadius 8 and flex centering — up from 24×24px, meets WCAG minimum' },
      { tag: '⚡ Feature', text: 'Delivery task visibility — t-d01 task now renders with an amber 📦 Delivery badge and amber left border accent in the task list; also appears in the Today\'s Cleanings card strip with "📦 Delivery run" label and amber border' },
      { tag: '🏗 Arch', text: 'TODAYS_DELIVERIES array added alongside TODAYS_CLEANINGS; strip render combines both arrays so delivery entries appear in the prominent top card strip at shift start' },
    ],
  },
  {
    version: 'v3.9',
    date: 'Mar 23, 2026',
    items: [
      { tag: '⚡ Feature', text: 'Supplies Used collapsible section added to cleaning task drawer — pre-populated from property turnover template on task open; collapsed summary shows item count and total units; steppers for each item, remove button, warehouse picker overlay for adding items not in template' },
      { tag: '⚡ Feature', text: 'Warehouse picker overlay — two-step flow: browse by category (Consumables/Linen/Cleaning) with stock status badges, then confirm with quantity stepper; items already in the supply list are excluded from browse' },
      { tag: '⚡ Feature', text: 'Realistic per-persona inventory — Maria (Cleaner) sees critically low soap and coffee pods; Bjorn (Maintenance) sees critical spray; Fatima (Guest Services) sees nearly-out coffee; stock overrides seed from PERSONA_STOCK_SNAPSHOTS or localStorage for persistence' },
      { tag: '🏗 Arch', text: 'CONSUMPTION_TEMPLATES extended to Studio/1BR/2BR; template matching uses property bed count from PROPERTIES; supply consumption logged to afterstay_consumption localStorage key on task submit' },
    ],
  },
  {
    version: 'v3.8',
    date: 'Mar 23, 2026',
    items: [
      { tag: '⚡ Feature', text: 'Report Problem modal enriched — cleaner can specify problem type (Safety Hazard, Damage, Maintenance Required, Guest Complaint, Supply Issue), add photo evidence, and set urgency level; report saved to localStorage and visible in operator alerts' },
      { tag: '⚡ Feature', text: 'Task delegation — cleaning tasks can be reassigned from the task drawer; "Delegate to…" dropdown shows available staff on shift with availability indicators; delegation reason required for supervisor audit trail' },
      { tag: '🐛 Fix', text: 'Supplies logging on submit — supply items consumed during a cleaning task are now written to afterstay_consumption on submit, enabling operator-side waste tracking and reorder triggers' },
    ],
  },
  {
    version: 'v3.7',
    date: 'Mar 23, 2026',
    items: [
      { tag: '⚡ Feature', text: 'Cleaning task progress bar — live progress percentage calculated from checked checklist items; displayed in the drawer footer alongside the Submit button; color shifts from muted to accent as completion approaches 100%' },
      { tag: '⚡ Feature', text: 'Report problem in task drawer — "⚠ Report" button added to the action bar inside the cleaning task drawer; opens a modal for the cleaner to log an issue without leaving the task flow' },
      { tag: '🐛 Fix', text: 'Checklist progress was resetting on drawer close — checklistChecked state now persists per task ID in a ref map so re-opening the same task restores progress' },
    ],
  },
  {
    version: 'v3.6',
    date: 'Mar 22, 2026',
    items: [
      { tag: '⚡ Feature', text: 'Maintenance task drawer — tapping a maintenance job opens a full side drawer with before/after photo upload, work item checklist, ETA picker, resolution notes, and a pipeline progress stepper (Assigned → In Progress → Blocked → Done)' },
      { tag: '⚡ Feature', text: 'PTE notification panel — maintenance staff see a Permission to Enter panel at the top of the task drawer when PTE is required; status badge shows Granted/Pending/Denied with timestamp and granting operator name' },
      { tag: '⚡ Feature', text: 'Maintenance task status notifications — completing a task automatically creates a resolved notification visible in the operator alerts feed; blocked tasks trigger an escalation alert' },
      { tag: '🐛 Fix', text: 'Nav cleanup — dead /app/schedule link removed from all staff nav configurations; routes audited against existing page files' },
    ],
  },
  {
    version: 'v3.5',
    date: 'Mar 22, 2026',
    items: [
      { tag: '🐛 Fix', text: 'Briefing pages now have auth guards — /briefing/cleaners, /briefing/maintenance, and /briefing/guest-services redirect users with the wrong role to /staff/start instead of rendering for the wrong audience' },
      { tag: '⚡ Feature', text: 'SOPs page now role-filtered — cleaners see only cleaning SOPs, maintenance staff see only maintenance SOPs, guest services staff see only guest SOPs; roles field added to Sop data model and filtered against subRole on render' },
      { tag: '🏗 Arch', text: 'Staff intake field form directory added — /staff/intake/[propertyId] foundation in place for field visit data collection' },
    ],
  },
  {
    version: 'v3.4',
    date: 'Mar 22, 2026',
    items: [
      { tag: '🐛 Fix', text: 'handleLogin() now routes by jobRole — cleaners go to /briefing/cleaners, maintenance to /briefing/maintenance, supervisors to /briefing/supervisor, gs-supervisors to /briefing/gs-supervisor; previously all email/password logins landed on /app/dashboard regardless of role' },
      { tag: '🐛 Fix', text: 'handleFloatingLogin() now checks jobRole === supervisor/gs-supervisor instead of subRole.includes("Supervisor") — consistent with rest of codebase' },
      { tag: '⚡ Feature', text: 'Cleaner Upsell Awareness section added to My Tasks — read-only list of upcoming upsells at assigned properties; filtered to cleaner-relevant types only (early check-in, late checkout, mid-stay refresh, welcome basket, baby equipment)' },
      { tag: '⚡ Feature', text: 'Baby Equipment Add-on upsell rule (ur9) added — cot, high chair, baby bath; cleanerVisible: true; 3 sample approval records added for cleaner s1 properties (p1, p3, p5)' },
      { tag: '🏗 Arch', text: 'cleanerVisible boolean added to UpsellRule interface — all 8 existing rules tagged; ur1/ur2/ur4/ur6/ur9 are cleaner-visible; ur3/ur5/ur7/ur8 are not' },
      { tag: '🐛 Fix', text: 'Dead /app/schedule link removed from supervisor nav — no page exists for this route' },
    ],
  },
  {
    version: 'v3.3',
    date: 'Mar 22, 2026',
    items: [
      { tag: '⚡ Feature', text: 'gs-supervisor role fully implemented — STAFF_GS_SUPERVISOR_NAV added to lib/nav.ts with team queue, all issues, analytics, staffing, and platforms sections; distinct from GS staff nav per PRD v3 spec' },
      { tag: '⚡ Feature', text: 'Supervisor briefing page (/briefing/supervisor) — team-level view showing staff on shift today, today\'s cleanings count, and upsell approvals queue pending supervisor review' },
      { tag: '⚡ Feature', text: 'GS Supervisor briefing page (/briefing/gs-supervisor) — open issues count, SLA risk panel (critical/high severity), unassigned issues, GS team roster, and quick-nav to team queue' },
      { tag: '⚡ Feature', text: 'Carlos M. added as GS Supervisor demo persona (gs-supervisor jobRole, #8b5cf6) — available in login card, demo panel, and floating persona switcher; routes to /briefing/gs-supervisor on login' },
      { tag: '🏗 Arch', text: 'getStaffNav() updated to dispatch on jobRole (exact PRD IDs) first, falling back to subRole string matching — eliminates ambiguity between supervisor/gs-supervisor and future role additions' },
      { tag: '🏗 Arch', text: 'AppSidebar and MainAppSidebar now read and pass jobRole from localStorage to getStaffNav(), ensuring correct nav is rendered from first paint without subRole string hacks' },
      { tag: '🐛 Fix', text: 'Intake removed from STAFF_CLEANING_NAV — cleaners receive assigned field visits via job queue, not self-initiated intake per PRD v3 spec' },
      { tag: '⚡ Feature', text: 'Supervisor nav updated: Intake removed, Upsell Approvals (/app/upsells) and Schedule (/app/schedule) added per PRD v3 supervisor requirements' },
    ],
  },
  {
    version: 'v3.2',
    date: 'Mar 22, 2026',
    items: [
      { tag: '🐛 Fix', text: 'Upsell Approvals section now strictly gated to supervisor and gs-supervisor roles — cleaner, maintenance, and guest-services roles no longer receive the approval UI (cleaners retain awareness-only view per PRD)' },
      { tag: '🐛 Fix', text: 'Clock bar NaNm bug resolved — clockInTime was stored as a locale time string ("09:32 AM") by all briefing pages, causing new Date() to return NaN; ClockStatus now uses the clockInTimestamp (numeric ms) already persisted alongside it, with an isNaN guard as fallback' },
      { tag: '🏗 Arch', text: 'Added jobRole field to UserProfile (cleaner | supervisor | maintenance | guest-services | gs-supervisor) — aligns with PRD v3 role ID spec; all role-conditional logic in My Tasks and ClockStatus now uses jobRole === exact match instead of subRole.includes() string matching, making supervisor and gs-supervisor fully distinct from each other and from cleaner/guest-services' },
    ],
  },
  {
    version: 'v3.1',
    date: 'Mar 22, 2026',
    items: [
      { tag: '⚡ Feature', text: 'Maintenance role isolation — Maintenance staff now see only maintenance jobs; "My Jobs" page title replaces generic "My Tasks"; URL includes ?role=maintenance identifier for deep-linking and session clarity' },
      { tag: '⚡ Feature', text: 'Alerts added to Maintenance nav — maintenance staff can now view urgent flags and job assignments via the Alerts page, with field alerts scoped to their staff ID (s3)' },
      { tag: '🐛 Fix', text: 'Alerts page was showing cleaner alerts to all staff roles — staffId now maps correctly per subRole (Maintenance→s3, Guest Services→s4, Supervisor→s2)' },
      { tag: '🐛 Fix', text: 'Maintenance SOPs nav link was pointing to the full operator Operations board — now correctly routes to /app/sops (staff SOPs reference)' },
      { tag: '🐛 Fix', text: 'My Tasks page flashed all tasks briefly on load before user profile was read from localStorage — loading guard added to prevent cross-role data leak' },
      { tag: '🌐 Landing', text: 'Access Window section copy updated — headline now mirrors the demo sequence (chaos → resolution); competitor names removed from subtext' },
      { tag: '📱 Mobile', text: 'Landing page fully optimized for mobile — hero padding reduced, Access Window demo height fixed, Morning Briefing caption now appears above phone mockup, section padding halved across all breakpoints; new 480px breakpoint added' },
    ],
  },
  {
    version: 'v3.0',
    date: 'Mar 21, 2026',
    items: [
      { tag: '⚡ Feature', text: 'Demo persona switcher — floating 🎭 button available inside every portal; switch between all 7 personas (Operator, Owner, Cleaner, Supervisor, Guest Services, Maintenance, Linen) in one tap without returning to login' },
      { tag: '⚡ Feature', text: 'Per-persona inventory stock — inventory page filters items and stock levels per logged-in user; each persona sees only their assigned properties with realistic seed data; stock persisted in namespaced localStorage (afterstay_stock_userId)' },
      { tag: '⚡ Feature', text: 'Staff alerts now include Early Check-in and Late Checkout upsell requests visible to cleaners; clicking an alert navigates directly to My Tasks with "→ Review request" CTA on the alert card' },
      { tag: '⚡ Feature', text: "My Cleanings timeline cards on the staff portal are now fully clickable — tapping a cleaning job opens the full task checklist drawer; 'Open checklist' label shown on hover" },
      { tag: '⚡ Feature', text: 'Upsell approval sheet rewritten: shows full day schedule with type badge, property, time window, and ⚡ Tight gap warning per slot; Impact of Approving section computes a conflict verdict (🟢 Looks fine / 🟡 Plan carefully / 🔴 Schedule conflict) based on checkout/checkin time analysis' },
      { tag: '⚡ Feature', text: 'Guest Services portal now displays a live Staff Decisions notification panel showing which cleaners approved or declined upsell requests, synced via localStorage without a backend' },
      { tag: '🐛 Fix', text: 'Briefing page: Clock In button always visible for cleaners (removed 15-min shift gate); Owners get a dedicated "Clock In Now" button routing to the Owner Portal' },
      { tag: '🐛 Fix', text: 'Command palette links for Workspace and New Task now route correctly to /workspace instead of /operator/workspace' },
      { tag: '🐛 Fix', text: 'Guest Experience page: dead PTE link fixed to route to /operator/operations; clipboard failures now show an actionable toast instead of silent failure' },
      { tag: '🐛 Fix', text: 'Guidebooks "Connect →" custom domain button disabled with Coming Soon label; clipboard errors surface as user-visible toasts across guidebooks, contractors, and staff pages' },
      { tag: '🐛 Fix', text: 'Verification "+ Add condition" button disabled with Coming Soon label to prevent confusing dead-end interaction' },
    ],
  },
  {
    version: 'v2.8',
    date: 'Mar 20, 2026',
    items: [
      { tag: '⚡ Feature', text: 'Properties Library Global Search — "Search Library" toggle in the Properties toolbar; searches across ALL library fields per property (access code, wifi, utilities, appliances, smart home, house rules, emergency contacts, and more); results show per-property match cards with field label + value pills; "Missing info" section flags properties without the searched data with amber alerts and "Update library →" quick links' },
      { tag: '⚡ Feature', text: 'Operator Dashboard command center: expanded from 4 to 8 stat cards in two rows — Properties, Owners, Requests, Stock Alerts, Cleanings Today, Open Tasks, Overdue, and Approvals; alert banner for pending items; Owner Approvals section with "Approve (Pay by Card)" and "Approve (Invoice Later)" payment buttons; Follow-Up drafts an AI escalation email for unresponded approvals' },
    ],
  },
  {
    version: 'v2.7',
    date: 'Mar 20, 2026',
    items: [
      { tag: '⚡ Feature', text: 'Compliance standalone module — /operator/compliance rebuilt from scratch: 4 stat cards (categories, expired, expiring, missing), alert banner for critical docs, accordion per category (Fire Safety, Electrical, STR License, Building Insurance), per-property rows with status badges, "Request from Owner" drawer with AI-drafted email, "Add Document" drawer with file upload' },
      { tag: '⚡ Feature', text: 'Contractors onboarding link + work order tool — 3-tab structure: Directory (existing contacts + Send Onboarding Link), Onboarding (unique link generation, 6-step progress tracker, approve/activate flow), Work Orders (issue tokenized work order links, status tracking, detail drawer with before/after photos, invoice upload, time tracking)' },
      { tag: '⚡ Feature', text: 'PTE Management page — /operator/pte: request queue with filter tabs (All, Pending, Granted, Denied/Expired), Grant PTE drawer with date + time window picker that unlocks the access code, Deny drawer with optional reason, Follow-Up alert for requests pending 4+ hours, auto_granted badge for vacant properties' },
      { tag: '⚡ Feature', text: 'Check-In Guide auto-attaches to task cards — every task card now shows access code, parking info, entry instructions, and cleaning notes pulled from the property library; zero config, updates immediately when library is edited' },
      { tag: '⚡ Feature', text: 'Guest Experience unified module — /operator/guest-experience: Portal Builder (per-property verification gate toggles with booking-source conditions — Airbnb, Direct, VRBO, Booking.com — and door code reveal modes), Guidebooks quick-access tab, Guest-Initiated Issues feed with PTE window display' },
      { tag: '🧭 Nav', text: 'Added PTE Requests to operator Operations nav and Guest Services staff nav; added Guest Experience to Platform nav; Compliance restored as standalone nav item (no longer a redirect)' },
    ],
  },
  {
    version: 'v2.6',
    date: 'Mar 19, 2026',
    items: [
      { tag: '🐛 Fix', text: 'Alerts page title is now role-aware: "Team Alerts" for supervisors, "My Alerts" for cleaners' },
      { tag: '🐛 Fix', text: 'Demo Personas: Cleaning Supervisor (Anna K.) now lands on /app/dashboard instead of My Tasks' },
      { tag: '🐛 Fix', text: "Fixed Cleaner home dashboard: Maria's subRole \"Cleaner\" now correctly triggers the Today's Schedule section" },
      { tag: '🐛 Fix', text: 'Upsell Approvals section on My Tasks is now gated to supervisors only' },
      { tag: '🐛 Fix', text: 'ClockStatus header: supervisors see "Team Overview" link instead of individual "Start Shift" button' },
      { tag: '🐛 Fix', text: 'Floating demo panel subtitle updated to show correct destination route per persona' },
    ],
  },
  {
    version: 'v2.5',
    date: 'Mar 19, 2026',
    items: [
      { tag: '⚡ Feature', text: "Operator dashboard full rewrite: 6 KPI chips, 2-column layout (Owner Approvals + Today's Operations), Who's Online staff strip, secondary accordions, 280px sticky activity sidebar" },
      { tag: '⚡ Feature', text: 'Compliance removed from sidebar nav; /operator/compliance redirects to properties with 5-second toast' },
      { tag: '⚡ Feature', text: 'Property cards show compliance status dot (green/amber/red) from compliance documents' },
      { tag: '⚡ Feature', text: 'AlertsContext: new React context with seeded alerts (urgent/warning/info) + dismiss/dismissAll' },
      { tag: '⚡ Feature', text: 'Bell dropdown wired to AlertsContext: live badge, per-alert dismiss, Mark all read' },
      { tag: '⚡ Feature', text: 'Staff dashboard shows dismissible urgent alert banners below greeting' },
      { tag: '⚡ Feature', text: "My Tasks: Today's Cleanings section with tight-gap indicator above upsell approvals" },
      { tag: '🐛 Fix', text: 'Upsell approval cards on staff portal no longer show price, currency, or payment mode' },
    ],
  },
  {
    version: 'v2.4',
    date: 'Mar 19, 2026',
    items: [
      { tag: '⚡ Feature', text: 'Cleaner & Cleaning Supervisor demo personas — floating "Demo Personas" pill on login page (bottom-right) with one-click login as Maria S. (Cleaner) or Anna K. (Cleaning Supervisor); routes directly to /app/my-tasks' },
      { tag: '⚡ Feature', text: 'Field Alerts page (/app/alerts) — real alerts page for cleaning staff replacing the operator re-export; filter pills (All / Urgent / Tasks / Schedule / Cleaner Report); cards grouped by Urgent → Today → Earlier; mark-as-read on tap; role-based visibility (supervisor sees all incl. upsell escalations; cleaner sees only their own alerts)' },
      { tag: '⚡ Feature', text: '7 seeded field alerts — new_task, schedule_change, backjob, apartment_dirty, needs_consumables, upsell_escalation types; mixed cleaner-only (s1) and supervisor-visible (s1+s2) assignments' },
      { tag: '⚡ Feature', text: 'Alerts (Bell) added as first nav item in cleaning staff sidebar; new STAFF_CLEANING_SUPERVISOR_NAV with "Team Alerts" and "Team Tasks" labels; getStaffNav() dispatches Supervisor subRole to supervisor nav' },
      { tag: '⚡ Feature', text: 'CleanerApprovalSheet: removed price/currency/payment-mode line; replaced shift schedule with per-property workload summary (🔄 Turnovers / ⏰ Same-day check-ins / 🧹 Deep cleans / 👥 Total guests) pulled from new cleaningWorkload.ts data layer' },
      { tag: '⚡ Feature', text: 'lib/data/cleaningWorkload.ts — property+date keyed workload lookup table with 6 seed entries; getPropertyWorkload() helper with sensible fallback' },
      { tag: '🐛 Fix', text: 'My Tasks default filter changed from All → Today so cleaners land on their current workload immediately' },
      { tag: '🐛 Fix', text: 'Cleaner subRole matching — "Cleaner".includes("Cleaning") was false, causing type filter to silently skip; added explicit subRole.includes("Cleaner") check so Maria sees only Cleaning/Inspection tasks' },
      { tag: '🐛 Fix', text: 'Task seed dates refreshed from stale 2026-03-17 to 2026-03-19 (today); Maria now has 3 cleaning tasks today (Harbor Studio 10:00, Sunset Villa 13:00, Ocean View deep clean 15:00); Anna K. gets her own tasks as supervisor; upsell approvals loaded dynamically from localStorage user profile' },
    ],
  },
  {
    version: 'v2.3',
    date: 'Mar 19, 2026',
    items: [
      { tag: '⚡ Feature', text: 'ECO/LCO calendar signals (3-tier: Available / Tentative / Blocked) in Upsells, Verification, and Guest Services' },
      { tag: '⚡ Feature', text: 'Cleaner approval workflow — upsell requests routed to cleaners with their day schedule before confirmation' },
      { tag: '⚡ Feature', text: 'Payment modes — Auth Hold for cleaner-dependent upsells, Auto-Charge for guaranteed upsells' },
      { tag: '⚡ Feature', text: 'Upsell Approval tasks in My Tasks for cleaning staff' },
      { tag: '⚡ Feature', text: 'Supervisor escalation — upsell requests with no assigned cleaner automatically route to field supervisor; supervisor receives alert in Alerts > Field Team panel and task in My Tasks' },
      { tag: '⚡ Feature', text: 'Field Team Alerts panel in Alerts & Integrations — live view of escalated upsell requests for cleaning & maintenance supervisors' },
      { tag: '⚡ Feature', text: 'Upsell Approvals briefing panel in Guest Services with payment mode badges' },
      { tag: '⚡ Feature', text: 'PMS Reservations data layer + Reservation detail card in Verification sheet' },
      { tag: '⚡ Feature', text: 'Verification page: KPI bar, date pills, channel filter, portal activity, document grid' },
    ],
  },
  {
    version: 'v2.2',
    date: 'Mar 19, 2026',
    items: [
      { tag: '⚡ Feature', text: 'Branding Templates — define brand settings once at portal or property-group level; apply to any guidebook in one click; active template highlighted with "Active" badge; "Save as Template" creates reusable brand templates from current settings' },
      { tag: '⚡ Feature', text: 'Verification Templates — define step configs (e.g. Full KYC, Light ID+Rules) at portal/group level; select from template picker inside Branding tab when verification is enabled' },
      { tag: '⚡ Feature', text: 'Door Code Reveal — 3 modes: Always (no gate), After Verification, or Time-Gated (verified + X hours before check-in); operator configures mode + hours in Branding tab; code shows as • • • • • • until revealed' },
      { tag: '⚡ Feature', text: 'Time-Gated Door Code — countdown state shown to verified guest ("Code available in ~4h") when within time window; transitions to masked code once window opens; reveal + copy buttons; shows smart lock source + last used timestamp' },
      { tag: '⚡ Feature', text: 'lib/data/brandingTemplates.ts — 4 sample branding templates (Default, CoastalStays/g2, Oslo Premium/g1, Nordic Nature/g3) + 4 verification templates; all scoped to portal or group' },
      { tag: '🎨 UI', text: 'Branding tab redesign — template picker at top with scope badges, color swatches, one-click apply; custom fields below for per-guidebook overrides; door code reveal mode as radio cards with inline descriptions' },
    ],
  },
  {
    version: 'v2.1',
    date: 'Mar 19, 2026',
    items: [
      { tag: '⚡ Feature', text: 'Guest Verification Wizard — /guest/verify/[id]: 5-step mobile-first wizard (Confirm Info, Upload ID, Sign Agreement, House Rules, Security Deposit); progress bar with step dots; blurred guidebook teaser at bottom; state saved to localStorage on completion' },
      { tag: '⚡ Feature', text: 'Guidebook Lock Gate — /guest/guidebook/[id]: checks localStorage for verified flag; unverified guests see blurred preview with "Your guidebook is waiting" CTA linking to /guest/verify/[verificationId]; gate bypassed when requiresVerification is false' },
      { tag: '⚡ Feature', text: 'White-Label Guidebooks — brandColor, brandLogo, brandName fields per guidebook; accent color, footer logo/name all driven by brand settings; Ocean View Apt (g3) ships as CoastalStays demo with blue theme' },
      { tag: '⚡ Feature', text: 'Guidebook Branding Tab — new editor tab (between Upsells and Share) with: logo URL + live preview, brand name input, color picker + hex input, custom domain + Connect button, Stripe account ID, Verification Required toggle' },
      { tag: '⚡ Feature', text: 'Amenities Icon Grid — emoji icon grid in guidebook (WiFi, Pool, Parking, AC, Washer, BBQ, Sea View, Pet Friendly, Balcony, etc.); populated for Sunset Villa and Ocean View' },
      { tag: '⚡ Feature', text: 'Appliances & How-Tos — expandable <details> cards in guidebook (TV, Dishwasher, Heating/AC, Washing Machine) with step-by-step instructions for each appliance' },
      { tag: '⚡ Feature', text: 'Local Recommendations — tabbed section (Food / Activity / Transport) with name, tip, and address; 6 recs for Sunset Villa, 7 recs for Ocean View' },
      { tag: '⚡ Feature', text: 'FAQ Accordion — expandable Q&A section in guidebook; 4 FAQs for Sunset Villa, 5 FAQs for Ocean View (including verification FAQ)' },
      { tag: '⚡ Feature', text: 'Inline Upsell Cards in Guidebook — Add-Ons section at bottom of guidebook pulls from UPSELL_RULES filtered by property/group; each card has emoji, title, description, price, CTA; "Add to Stay" opens Stripe mock bottom sheet with processing state' },
      { tag: '⚡ Feature', text: 'Stripe mock bottom sheet — upsell purchase sheet with item details, price, processing animation, and "Added" confirmation state' },
      { tag: '🎨 UI', text: 'Guidebook page fully dark-themed with brand color applied to all accent elements (progress bars, section headers, CTA buttons, upsell highlights)' },
      { tag: '🎨 UI', text: 'Verification wizard: loading spinner state, branded progress dots, step-specific CTAs (Continue / Authorize Deposit First / Complete Verification)' },
    ],
  },
  {
    version: 'v2.0',
    date: 'Mar 19, 2026',
    items: [
      { tag: '⚡ Feature', text: 'Guest-facing Guidebook page — new route /guest/guidebook/[id]: mobile-optimized, no sidebar, WiFi reveal/copy, draft watermark banner, AfterStay footer branding' },
      { tag: '⚡ Feature', text: 'Portal Quick Switch pills — compact role-switcher row below logo in both sidebars; animated "Switched to X" confirmation badge' },
      { tag: '⚡ Feature', text: 'Team page — new Daily tab showing all staff members with their assigned jobs, color-coded by type (cleaning/maintenance/inspection/GS), click-to-detail sheet' },
      { tag: '⚡ Feature', text: 'Operator dashboard — Team Today widget: compact 2-column staff grid showing pending tasks per person and PTE flags' },
      { tag: '⚡ Feature', text: 'Full Guest Services role — Fatima Ndiaye added as s4 with own jobs (heating follow-up, late check-in), shifts, and availability; correct USER_TO_STAFF mapping in 4 files' },
      { tag: '⚡ Feature', text: 'Inspector demo login — anna@afterstay.com / demo123 — with dedicated Inspector nav (Home, My Inspections, Intake, Work Orders, Inspection SOPs)' },
      { tag: '🐛 Fix', text: 'Portal role switch now persists on page refresh — setRole() patches afterstay_user.role in localStorage to prevent role revert' },
      { tag: '🐛 Fix', text: 'Guidebook editor inputs (WiFi name/password, check-in/out times) converted from defaultValue to controlled state seeded from editingGuide' },
      { tag: '🐛 Fix', text: 'Guidebook section toggles are now interactive — click to enable/disable; state stored in enabledSections Set' },
      { tag: '🐛 Fix', text: 'Guidebook QR code now renders a real scannable QR image (api.qrserver.com) instead of the Lucide QrCode icon placeholder' },
      { tag: '🐛 Fix', text: 'OverduePanel: Mark Done moves task to done column; Send Reminder fires toast with staff name; Review SOP opens the SOP detail sheet' },
      { tag: '🐛 Fix', text: 'Briefing GS check-ins card now shows live GUEST_ISSUES count (urgent + open breakdown) instead of hardcoded "2 arrivals · 15:00 and 17:00"' },
      { tag: '🐛 Fix', text: 'Staff home: empty state card shown when no properties are assigned today; job checkbox state persisted to localStorage (survives refresh)' },
      { tag: '🎨 UI', text: '"Preview as Guest ↗" button added in Guidebook editor header and card Preview buttons fixed to open /guest/guidebook/[id] instead of dead external URL' },
    ],
  },
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
      <PageHeader title="Changelog" subtitle="What's been shipped in AfterStay" />

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
