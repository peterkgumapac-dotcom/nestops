export type FeatureSection = {
  heading: string
  body: string
}

export type FeatureContent = {
  slug: string
  title: string
  eyebrow: string
  headline: string
  subhead: string
  color: string
  icon: string
  problem: string
  storyboard: string[]
  moat: string
  sections: FeatureSection[]
  prdUrl?: string
}

export const FEATURES: Record<string, FeatureContent> = {
  'property-library': {
    slug: 'property-library',
    title: 'Property Library',
    eyebrow: 'PROPERTY KNOWLEDGE',
    headline: 'One living file for every property you manage.',
    subhead:
      'Ten tabs of structured knowledge per unit — from access codes to appliance warranties — fed by one intake and read by every other module.',
    color: '#C4622D',
    icon: '🏠',
    problem:
      'Property knowledge is scattered across emails, Google Docs, WhatsApp threads, and the operator\u2019s memory. When the cleaner asks for the Wi-Fi password at 11pm, nobody can find it.',
    storyboard: [
      'New property onboarded. Operator runs the one-intake wizard.',
      'Access codes, utilities, appliances, and quirks are captured once.',
      'The 10-tab library auto-populates: Overview, Access, Utilities, Appliances, Cleaning, Guest, Compliance, Owner, Docs, Notes.',
      'Downstream modules (Cleaning, Ops, Guidebooks) read from the Library — no re-entry.',
      'When the dishwasher fails six months later, the warranty and contractor are already on the page.',
    ],
    moat:
      'Breezeway tracks cleanings but has no property knowledge base. Guesty has property settings but no 10-tab living library. AfterStay is the only tool that makes one intake feed every downstream module.',
    sections: [
      { heading: '10-tab living library', body: 'Every property has the same ten tabs. Operators always know where to look.' },
      { heading: 'One-intake wizard', body: 'Enter a property once. The wizard populates every tab and triggers the setup tasks.' },
      { heading: 'Downstream sync', body: 'Cleaning, Guidebooks, Compliance, and Assets all read from the Library. Update once, update everywhere.' },
    ],
  },
  briefing: {
    slug: 'briefing',
    title: 'Daily Briefing',
    eyebrow: 'MORNING START',
    headline: 'Know the day in 30 seconds.',
    subhead:
      'A role-aware morning screen: today\u2019s arrivals, weather, shift lineup, and the two things that matter most.',
    color: '#FBBF24',
    icon: '📰',
    problem:
      'The operator\u2019s morning starts with checking four different apps — PMS, WhatsApp, email, and a spreadsheet — just to figure out what the day looks like.',
    storyboard: [
      'Fatima opens AfterStay at 7:02am over coffee.',
      'Briefing greets her with weather, today\u2019s arrivals, and who\u2019s on shift.',
      'Two red flags surface: a late checkout at Villa 3 and an overdue compliance item.',
      'She taps the compliance row, drafts the renewal email with AI, and closes it.',
      'By 7:08am she\u2019s done. Four apps replaced by one screen.',
    ],
    moat:
      'Nobody else ships a morning briefing tuned to role. PMSs show inventory. Task apps show tasks. Only AfterStay opens with "here\u2019s your day, here\u2019s what matters" because we lived that 7am anxiety.',
    sections: [
      { heading: 'Role-aware', body: 'Operators, GS, cleaners, and owners each see a briefing tuned to their morning.' },
      { heading: 'Weather + shift lineup', body: 'Today\u2019s forecast and who is clocked in, side-by-side with the arrivals list.' },
      { heading: 'Today\u2019s arrivals', body: 'Every arrival, every departure, every exception flagged — pulled from the PMS automatically.' },
    ],
  },
  dashboard: {
    slug: 'dashboard',
    title: 'Command Center',
    eyebrow: 'COMMAND CENTER',
    headline: 'The whole operation on one screen.',
    subhead:
      'Eight live stat cards, today\u2019s cleanings, and every overdue approval — the full command center the operator drills into everything from.',
    color: '#3B82F6',
    icon: '📊',
    problem:
      'Operators need a single place to see the state of everything — occupancy, revenue, tasks, cleanings, approvals, alerts — not a dashboard that forces them to click through five tabs.',
    storyboard: [
      'Operator lands on the dashboard after the briefing.',
      'Eight stat cards show occupancy, revenue, open tickets, overdue tasks, inventory alerts, compliance, owner requests, and guest scores.',
      'Today\u2019s cleaning grid is pinned below — red rows are behind schedule.',
      'Approvals sidebar surfaces the three items blocking subordinates.',
      'Operator clears approvals in 90 seconds, drills into the red cleaning row, dispatches a second cleaner.',
      'Back on the dashboard, the red row turns green. The day is unblocked.',
    ],
    moat:
      'Most PMSs have a dashboard. None have a command center designed around the operator\u2019s daily drill-down workflow, because none of them were built by operators.',
    sections: [
      { heading: '8 live stat cards', body: 'Occupancy, revenue, tickets, tasks, inventory, compliance, approvals, guest score — all refreshed live.' },
      { heading: 'Today\u2019s cleanings', body: 'Every turnover, every assignee, every status — pinned to the dashboard, not buried in a subpage.' },
      { heading: 'Overdue + approvals', body: 'The sidebar shows only what\u2019s blocking someone. Clear it, and the operation moves.' },
    ],
  },
  operations: {
    slug: 'operations',
    title: 'Operations Hub',
    eyebrow: 'OPERATIONS',
    headline: 'Tasks, SOPs, cleaning, and meetings — one hub.',
    subhead:
      'A kanban board, a SOP library, the weekly cleaning grid, and meeting notes. The four things that used to live in four apps.',
    color: '#8B5CF6',
    icon: '📋',
    problem:
      'Tasks live in Asana, SOPs in Google Docs, cleaning in a spreadsheet, meeting notes in email. The operator jumps between four tools just to run a normal Tuesday.',
    storyboard: [
      'Morning standup. Team opens the Meetings tab — agenda already populated from yesterday\u2019s open items.',
      'Operator assigns three new tasks on the kanban during the meeting.',
      'A cleaner asks how to handle the new coffee machine — operator links the SOP from the Library.',
      'Weekly cleaning grid shows next week\u2019s schedule. Operator drags one turnover to a different cleaner.',
      'Meeting ends. Every decision logged, every task assigned, zero tab-switching.',
    ],
    moat:
      'Every competitor picks one of these four — tasks, SOPs, cleaning, meetings — and ignores the others. AfterStay ships all four as one hub because that\u2019s how the work actually flows.',
    sections: [
      { heading: 'Tasks (kanban)', body: 'Classic kanban, assignee + due date + SOP link, designed for the property-ops workflow.' },
      { heading: 'SOPs', body: 'Every procedure lives here. Linked from tasks, from the Library, from Guest Services.' },
      { heading: 'Weekly cleaning grid', body: 'Drag turnovers, rebalance cleaners, see the whole week in one view.' },
      { heading: 'Meetings', body: 'Agendas carry forward, decisions become tasks, notes are searchable.' },
    ],
  },
  'guest-services': {
    slug: 'guest-services',
    title: 'Guest Services',
    eyebrow: 'GUEST EXPERIENCE',
    headline: 'Every guest issue, tracked end-to-end.',
    subhead:
      'A kanban with SLA timers, threaded comments, and a built-in refund calculator — so nothing falls through WhatsApp.',
    color: '#f59e0b',
    icon: '💬',
    problem:
      'Guest complaints live in WhatsApp threads. Nobody tracks resolution time. When the same complaint hits twice in a month, nobody notices — and the owner finds out from the review.',
    storyboard: [
      'Guest reports a broken AC at Villa 7.',
      'Ticket opens on the kanban with a 4-hour SLA timer.',
      'GS drills into Villa 7\u2019s property health card — this is the second AC ticket this month.',
      'GS dispatches the HVAC contractor, threads replies to the guest in-app.',
      'Refund calculator proposes a two-night discount based on SLA breach.',
      'Ticket closes. Property health updates. Owner gets the resolution summary automatically.',
    ],
    moat:
      'Helpdesks don\u2019t know what a turnover is. PMSs don\u2019t have SLAs. AfterStay is the only tool where a guest ticket touches property health, contractors, and refund math in one flow.',
    sections: [
      { heading: 'Kanban + SLA', body: 'Every ticket has a timer. Breaches surface on the dashboard before the guest complains again.' },
      { heading: 'Threaded comments', body: 'Guest, GS, operator, contractor — one thread per issue, no lost context.' },
      { heading: 'Refund calculator', body: 'Fair, consistent refund math based on SLA + severity. No more escalations to the owner.' },
    ],
  },
  requests: {
    slug: 'requests',
    title: 'Requests & Tickets',
    eyebrow: 'UNIFIED INBOX',
    headline: 'Every ask, one inbox.',
    subhead:
      'Owner purchase requests, maintenance asks, and guest inquiries unified in a single triage queue with a sidebar badge that never lies.',
    color: '#10B981',
    icon: '🎫',
    problem:
      'Owner purchase requests, maintenance asks, and guest inquiries pile up in email. Nothing has a status. Follow-ups get forgotten. The operator is the single point of failure.',
    storyboard: [
      'Sidebar badge shows 7 pending requests.',
      'Operator opens the unified inbox: 3 owner, 2 maintenance, 2 guest.',
      'Click the first one — detail drawer with full history, attachments, and one-tap route to Tasks or Ops.',
      'Operator approves, rejects, or forwards. Badge drops to 6.',
      'Owner gets an update automatically. Nothing sits in someone\u2019s head.',
    ],
    moat:
      'No competitor unifies owner requests + maintenance + guest inquiries into one inbox because they treat each as a separate product. AfterStay treats them as one triage queue because the operator does.',
    sections: [
      { heading: 'Unified inbox', body: 'Owner, maintenance, guest — all in one triage queue, sorted by urgency.' },
      { heading: 'Detail drawer', body: 'Open a request and see the full property context, history, and route options on the right.' },
      { heading: 'Sidebar badge', body: 'The badge is the single source of truth for "what needs me right now."' },
    ],
  },
  inventory: {
    slug: 'inventory',
    title: 'Inventory',
    eyebrow: 'SUPPLIES',
    headline: 'Never run out of toilet paper again.',
    subhead:
      'Three-tier stock (warehouse → property → room), waste tracking, and AI-drafted purchase orders before the guest complains.',
    color: '#8B5CF6',
    icon: '📦',
    problem:
      'Coffee pods run out. Toilet paper hits critical. Nobody knows until the guest complains. Restocks are guesswork because nobody tracks waste or par levels.',
    storyboard: [
      'Cleaner closes a turnover — inventory auto-deducts from property stock.',
      'Warehouse deploys a resupply to Villa 3 from the 8-tab warehouse view.',
      'Coffee pods dip below par. AI drafts a PO to the usual vendor.',
      'Operator approves in one tap. PO goes out.',
      'Restock arrives, warehouse levels update, waste ratio flows into the monthly cost review.',
    ],
    moat:
      'PMSs don\u2019t do inventory. Inventory tools don\u2019t know about turnovers. AfterStay is the only tool where a cleaning triggers a stock deduction triggers a PO.',
    sections: [
      { heading: '8-tab warehouse', body: 'Central warehouse, deploy views, transfer logs, and restock planning.' },
      { heading: '3-tier stock', body: 'Warehouse → property → room. Par levels at every tier, alerts when any tier dips.' },
      { heading: 'Waste tracking', body: 'Every discard logged. Waste ratios feed into the monthly owner statement.' },
    ],
  },
  assets: {
    slug: 'assets',
    title: 'Fixed Assets',
    eyebrow: 'ASSET REGISTRY',
    headline: 'Every appliance, serialized and tracked.',
    subhead:
      'Serial numbers, warranty dates, condition grading, and one-tap contractor dispatch when something breaks.',
    color: '#06B6D4',
    icon: '🛠',
    problem:
      'Nobody knows when the dishwasher warranty expires. When it breaks, nobody knows which contractor installed it. The operator pays full price for a repair that should have been covered.',
    storyboard: [
      'Sunset Villa\u2019s dishwasher fails mid-turnover.',
      'Cleaner opens the asset on the property page.',
      'Serial, install date, warranty end date, contractor — all there.',
      'Warranty still covers it. One tap dispatches the original contractor.',
      'Condition grade updates to "under repair." The owner statement notes zero cost.',
    ],
    moat:
      'No competitor in property ops tracks fixed assets like this. Facility-management tools do, but they don\u2019t know about turnovers or guests. AfterStay bridges the two worlds.',
    sections: [
      { heading: 'Serial + warranty', body: 'Every asset logged with serial, install date, warranty end, and docs.' },
      { heading: 'Condition grading', body: 'A/B/C/D condition lets operators plan replacements before they fail.' },
      { heading: 'Contractor dispatch', body: 'One tap sends the job to the original installer. No guesswork, no markup.' },
    ],
  },
  team: {
    slug: 'team',
    title: 'Team & Staffing',
    eyebrow: 'PEOPLE',
    headline: 'Who\u2019s working where, right now.',
    subhead:
      'Roster, schedule, and workload in three tabs — so rebalancing a day takes a drag, not a group text.',
    color: '#EC4899',
    icon: '👥',
    problem:
      'Three cleaners, five properties. Who\u2019s where today? The answer lives in the operator\u2019s head and a WhatsApp thread from yesterday.',
    storyboard: [
      'Johan calls in sick Tuesday morning.',
      'Operator opens Team → Schedule. Johan\u2019s row highlights three turnovers.',
      'Workload tab shows Maria has capacity.',
      'Operator drags Johan\u2019s three turnovers to Maria. Maria gets a push notification.',
      'Schedule, workload, and today\u2019s cleanings on the dashboard all update.',
    ],
    moat:
      'Most PMSs have "a users page." AfterStay has Roster + Schedule + Workload because rebalancing a sick day is the single most common morning crisis.',
    sections: [
      { heading: 'Roster', body: 'Every team member with skills, availability, and pay rates.' },
      { heading: 'Schedule', body: 'Drag-and-drop shift planner synced to cleanings and tasks.' },
      { heading: 'Workload', body: 'See who\u2019s over-assigned and who has capacity at a glance.' },
    ],
  },
  contractors: {
    slug: 'contractors',
    title: 'Contractors',
    eyebrow: 'VENDOR NETWORK',
    headline: 'A vendor network that remembers.',
    subhead:
      'Vendor cards, category filters, ratings, and dispatch history so you never pay twice for unverified work.',
    color: '#F59E0B',
    icon: '🔧',
    problem:
      'Paying for unverified work from untracked vendors. When the HVAC guy disappears, the operator has no record of what was done or who he was.',
    storyboard: [
      'AC breaks at Villa 7. Operator filters contractors by "HVAC."',
      'Nordic HVAC has 4.8 stars, 12 past dispatches, and a response-time average of 90 min.',
      'Operator dispatches. Vendor card logs the new job automatically.',
      'Job completes, operator rates it, vendor history updates.',
      'Next month, the pattern in vendor history reveals Nordic is 30% cheaper than the old go-to.',
    ],
    moat:
      'Every ops tool has a "vendors" list. None of them score, rank, and remember contractors across dispatches because none of them were built by someone who got burned.',
    sections: [
      { heading: 'Vendor cards', body: 'One card per vendor with history, contact, rate, and docs.' },
      { heading: 'Ratings', body: 'Every dispatch gets rated. Averages surface the best vendor per category.' },
      { heading: 'Category filter', body: 'HVAC, plumbing, electrical, cleaning deep-clean — filter the network in one tap.' },
    ],
  },
  compliance: {
    slug: 'compliance',
    title: 'Compliance',
    eyebrow: 'REGULATORY',
    headline: 'Sleep through the next license deadline.',
    subhead:
      'An expiry calendar, request-from-owner flows, and AI-drafted renewal emails so nothing expires on your watch.',
    color: '#EF4444',
    icon: '🛡',
    problem:
      'Fire safety cert expired 3 weeks ago. The operator finds out from a guest complaint. The fine is bigger than the month\u2019s profit.',
    storyboard: [
      'Compliance calendar flags the fire cert expiring in 21 days.',
      'Operator opens it, taps "Request from owner."',
      '"Draft with AI" generates a polite renewal email referencing the property and the exact regulation.',
      'Owner replies with the new cert. Operator attaches it to the compliance record.',
      'Calendar auto-updates the next expiry. Dashboard alert clears.',
    ],
    moat:
      'Compliance tools exist — but they don\u2019t know about owners, properties, or the actual operator\u2019s workflow. AfterStay ships the calendar and the AI email because chasing owners is the real job.',
    sections: [
      { heading: 'Expiry calendar', body: 'Every license, permit, and cert across every property in one calendar view.' },
      { heading: 'Request from owner', body: 'One tap turns an expiring cert into an owner request with the right context.' },
      { heading: 'AI drafting', body: 'Renewal emails drafted by AI using the property and regulation context — no blank page.' },
    ],
  },
  guidebooks: {
    slug: 'guidebooks',
    title: 'Guidebooks',
    eyebrow: 'GUEST GUIDES',
    headline: 'From Library to guidebook in 10 minutes.',
    subhead:
      'AI generates a full guest guidebook from the property\u2019s Library — theme it, share via URL or QR, done.',
    color: '#22C55E',
    icon: '📖',
    problem:
      'Writing a guest guidebook takes 3\u20134 hours per property. Most operators never do it. Guests ask the same 20 questions and rate the stay lower when they can\u2019t find answers.',
    storyboard: [
      'New property goes live. Operator opens Guidebooks → Generate.',
      'Claude reads the property\u2019s Library — access, Wi-Fi, quirks, appliances, local area.',
      'In 10 minutes, a full guidebook draft is ready.',
      'Operator picks a theme, tweaks two sections, clicks publish.',
      'Guest gets a URL + QR in the welcome message. Question volume drops 60%.',
    ],
    moat:
      'Guidebook tools exist (Touch Stay, Hostfully) but they don\u2019t read from your property knowledge base — you re-type everything. AfterStay is the only tool where the Library generates the guidebook.',
    sections: [
      { heading: 'AI generation from Library', body: 'No blank page. The guidebook writes itself from the data you already entered once.' },
      { heading: 'Theme editor', body: 'Pick a theme, swap colors, add your logo. Looks like a brand, not a Google Doc.' },
      { heading: 'Share via URL / QR', body: 'Guests open it on the phone. QR in the entry, URL in the welcome message.' },
    ],
  },
}

export const FEATURE_SLUGS = Object.keys(FEATURES)
export const FEATURE_LIST: FeatureContent[] = Object.values(FEATURES)
