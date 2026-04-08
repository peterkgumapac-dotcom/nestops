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
  prdUrl?: string
  sections: FeatureSection[]
}

export const FEATURES: Record<string, FeatureContent> = {
  'work-orders': {
    slug: 'work-orders',
    title: 'Work Orders',
    eyebrow: 'OPERATIONS',
    headline: 'Every task, tracked. Every issue, closed.',
    subhead:
      'Assign, track, and verify tasks with standard procedures. Auto-created from check-ins, guest issues, and compliance alerts.',
    color: '#3B82F6',
    icon: '📋',
    sections: [
      { heading: 'Auto-creation', body: 'Tasks spawn from guest reports, cleaning checklists, and compliance triggers — no manual entry.' },
      { heading: 'SOP-driven', body: 'Every work order ships with the standard operating procedure attached. Vendors and staff know exactly what to do.' },
      { heading: 'Verification', body: 'Photo proof, timestamps, and signature capture before a task can be marked complete.' },
    ],
  },
  'guest-services': {
    slug: 'guest-services',
    title: 'Guest Services',
    eyebrow: 'GUEST EXPERIENCE',
    headline: 'From check-in to checkout, handled.',
    subhead:
      'Issue tracking, refund calculator, guest verification, and the guest portal — all in one place.',
    color: '#F59E0B',
    icon: '💬',
    sections: [
      { heading: 'Issue tracking', body: 'Guest issues become tickets the moment they hit your inbox, SMS, or portal.' },
      { heading: 'Refund calculator', body: 'Fair, consistent refund math — no more guesswork or manager escalations.' },
      { heading: 'Guest portal', body: 'White-label portal where guests check in, report issues, and get help 24/7.' },
    ],
  },
  cleaning: {
    slug: 'cleaning',
    title: 'Cleaning',
    eyebrow: 'TURNOVER',
    headline: 'Cleaning that runs itself.',
    subhead:
      'Turnover scheduling synced with your PMS. Cleaners see their day, access codes, and inventory checklists — no texts needed.',
    color: '#22C55E',
    icon: '🧹',
    sections: [
      { heading: 'PMS sync', body: 'Bookings flow in, cleanings get scheduled. Zero double-entry.' },
      { heading: 'Cleaner app', body: 'Today\u2019s board, access codes, photo proof, and supply checklists in one screen.' },
      { heading: 'Quality scores', body: 'Inspection results feed back into staffing decisions and pay.' },
    ],
  },
  inventory: {
    slug: 'inventory',
    title: 'Inventory',
    eyebrow: 'SUPPLIES',
    headline: 'Never run out of toilet paper again.',
    subhead:
      'Track supplies per property. Auto-deducts on every clean. AI drafts vendor orders before you get the panic text.',
    color: '#8B5CF6',
    icon: '📦',
    sections: [
      { heading: 'Per-property tracking', body: 'Stock levels at every unit, updated after every cleaning.' },
      { heading: 'Auto-deduct', body: 'Cleaners mark items used; inventory drops in real time.' },
      { heading: 'AI reordering', body: 'When stock dips below threshold, AI drafts the PO. You approve in one tap.' },
    ],
  },
  'owner-portal': {
    slug: 'owner-portal',
    title: 'Owner Portal',
    eyebrow: 'PROPERTY OWNERS',
    headline: 'White-label dashboard your owners actually log into.',
    subhead:
      'Revenue, tasks, issues, cleaning — one view, zero manual updates.',
    color: '#06B6D4',
    icon: '👤',
    sections: [
      { heading: 'Live revenue', body: 'Owners see bookings, payouts, and net revenue without bothering you.' },
      { heading: 'Auto-statements', body: 'Monthly statements generate themselves. PDF, email, done.' },
      { heading: 'Branded', body: 'Your logo, your colors, your domain. Owners see your brand, not ours.' },
    ],
  },
  compliance: {
    slug: 'compliance',
    title: 'Compliance',
    eyebrow: 'REGULATORY',
    headline: 'Sleep through the next license deadline.',
    subhead:
      'License tracking, permit renewals, and regulatory deadline alerts. Auto-pauses listings if non-compliant.',
    color: '#EF4444',
    icon: '🛡',
    sections: [
      { heading: 'Permit tracking', body: 'Every license, every property, every expiry date — in one calendar.' },
      { heading: 'Auto-pause', body: 'If a permit expires, the listing pauses on every channel automatically.' },
      { heading: 'Renewal tasks', body: 'Renewal work orders fire 30 days out so nothing slips through.' },
    ],
  },
  people: {
    slug: 'people',
    title: 'Team & Staffing',
    eyebrow: 'PEOPLE',
    headline: 'The source of truth for who is working where.',
    subhead:
      'Schedules, time tracking, payroll, and the foundation every other module reads from.',
    color: '#EC4899',
    icon: '👥',
    sections: [
      { heading: 'Scheduling', body: 'Drag-and-drop shift planner with availability, skills, and constraints baked in.' },
      { heading: 'Time tracking', body: 'Geofenced clock-in feeds Pulse and payroll in real time.' },
      { heading: 'Payroll', body: 'Hours, bonuses, and deductions auto-calculate. Export to your payroll provider.' },
    ],
  },
  pulse: {
    slug: 'pulse',
    title: 'Pulse',
    eyebrow: 'LIVE OPS',
    headline: 'See your operation breathe in real time.',
    subhead:
      'Live event stream of every clock-in, task, issue, and inventory change across all properties.',
    color: '#10B981',
    icon: '📡',
    sections: [
      { heading: 'Real-time stream', body: 'Every event in your operation, surfaced within 2 seconds.' },
      { heading: 'Green dots', body: 'Glanceable health for every property and every staffer on shift.' },
      { heading: 'Anomaly alerts', body: 'When something deviates from the pattern, Pulse pages you before guests notice.' },
    ],
  },
  briefing: {
    slug: 'briefing',
    title: 'Daily Briefing',
    eyebrow: 'MORNING START',
    headline: 'Know the day in 30 seconds.',
    subhead:
      'Personalized morning briefing screen for every role: today\u2019s tasks, properties, alerts, and AI priorities.',
    color: '#FBBF24',
    icon: '📰',
    sections: [
      { heading: 'Role-aware', body: 'Operators, GS, cleaners, and owners each see a briefing tuned to their day.' },
      { heading: 'AI priorities', body: 'The briefing surfaces what matters most — not just a wall of tasks.' },
      { heading: 'One-glance start', body: 'Open the app, read for 30 seconds, you\u2019re ready.' },
    ],
  },
}

export const FEATURE_SLUGS = Object.keys(FEATURES)
