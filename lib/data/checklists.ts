export interface ChecklistItem {
  id: string
  label: string
  category: string
  photoRequired?: boolean
}

// Per-bedroom tasks (label gets " — Bedroom N" appended when beds > 1)
const BEDROOM_LABELS = [
  'Strip all bed linens',
  'Remake bed with fresh linens and protectors',
  'Dust and wipe bedside tables and all surfaces',
  'Check under bed and inside wardrobe/drawers',
  'Vacuum bedroom floor',
]

// Per-bathroom tasks
const BATHROOM_LABELS = [
  'Deep clean and disinfect toilet',
  'Clean sink, tap fittings, and mirror',
  'Clean shower and/or bathtub thoroughly',
  'Replace towels and restock toiletries',
  'Mop bathroom floor and wipe tile grout',
]

// Always-included common area tasks
const COMMON_ITEMS: Omit<ChecklistItem, 'id'>[] = [
  { label: 'Vacuum all living areas and hallways', category: 'Common Areas' },
  { label: 'Mop all hard floors', category: 'Common Areas' },
  { label: 'Wipe kitchen surfaces, splashback, and appliance exteriors', category: 'Kitchen' },
  { label: 'Clean inside microwave', category: 'Kitchen' },
  { label: 'Clean fridge exterior, handles, and door seal', category: 'Kitchen' },
  { label: 'Empty all bins and replace liners', category: 'Common Areas' },
  { label: 'Wipe all light switches and door handles', category: 'Common Areas' },
  { label: 'Clean windows and glass surfaces (interior)', category: 'Common Areas' },
  { label: 'Check and restock consumables (coffee, tea, soap, toilet paper)', category: 'Consumables' },
  { label: 'Final walk-through and spot check', category: 'Sign-Off', photoRequired: true },
]

// Amenity-specific tasks by amenity ID (matching intake form IDs)
const AMENITY_TASKS: Record<string, { category: string; items: string[] }> = {
  pool: { category: 'Pool Area', items: [
    'Skim pool surface for debris',
    'Check and record pool chemical levels (pH + chlorine)',
    'Wipe pool deck and outdoor furniture',
    'Check pool pump and equipment function',
  ]},
  hottub: { category: 'Hot Tub', items: [
    'Check hot tub water chemistry (pH and sanitiser)',
    'Clean hot tub interior surfaces and jets',
    'Rinse and reseat filter cartridge',
    'Test jets and set temperature to default',
    'Wipe hot tub cover inside and out',
  ]},
  bbq: { category: 'BBQ Area', items: [
    'Scrape and clean BBQ grill grates',
    'Empty and clean ash tray / grease trap',
    'Check and record gas or fuel level',
    'Wipe BBQ exterior and surrounding area',
  ]},
  gym: { category: 'Gym', items: [
    'Wipe down all gym machines and equipment',
    'Sanitise handles and high-touch surfaces',
    'Check equipment for damage or safety issues',
    'Restock hand sanitiser and paper towels',
  ]},
  washer: { category: 'Laundry', items: [
    'Check washer drum is empty',
    'Wipe washer door seal and drum interior',
  ]},
  dryer: { category: 'Laundry', items: [
    'Clean lint trap',
    'Wipe dryer exterior and door seal',
  ]},
  firepit: { category: 'Fire Pit', items: [
    'Clear ash and debris from fire pit',
    'Arrange outdoor seating around fire pit',
    'Check fire tools, tongs, and log storage',
  ]},
  beach: { category: 'Beach Access', items: [
    'Rinse and hang beach towels',
    'Check and restock beach gear storage',
    'Clean outdoor shower area',
    'Shake/rinse sand from entrance mats',
  ]},
  baby: { category: 'Baby Equipment', items: [
    'Sanitise all baby equipment, cot, and toys',
    'Check condition and completeness of items',
    'Verify all safety latches and guards are fitted',
  ]},
  ev: { category: 'EV Charger', items: [
    'Check EV charging cable condition and coil',
    'Wipe down charging unit exterior',
    'Confirm charger indicator light is operational',
  ]},
}

export function getCleaningChecklist(beds: number, baths: number, amenities: string[]): ChecklistItem[] {
  let idx = 0
  const id = () => `cl-${idx++}`
  const items: ChecklistItem[] = []

  // Per-bedroom items
  for (let i = 1; i <= beds; i++) {
    const cat = beds > 1 ? `Bedroom ${i}` : 'Bedroom'
    BEDROOM_LABELS.forEach(label => {
      items.push({ id: id(), label: beds > 1 ? `${label} — Bedroom ${i}` : label, category: cat })
    })
  }

  // Per-bathroom items
  for (let i = 1; i <= baths; i++) {
    const cat = baths > 1 ? `Bathroom ${i}` : 'Bathroom'
    BATHROOM_LABELS.forEach(label => {
      items.push({ id: id(), label: baths > 1 ? `${label} — Bathroom ${i}` : label, category: cat })
    })
  }

  // Common items
  COMMON_ITEMS.forEach(item => items.push({ ...item, id: id() }))

  // Amenity items
  amenities.forEach(amenity => {
    const def = AMENITY_TASKS[amenity]
    if (!def) return
    def.items.forEach(label => items.push({ id: id(), label, category: def.category }))
  })

  return items
}

const MAINTENANCE_WORK_LABELS: Omit<ChecklistItem, 'id'>[] = [
  { label: 'Assess and confirm full scope of work', category: 'Work Items' },
  { label: 'Source required parts, tools, or materials', category: 'Work Items' },
  { label: 'Complete primary repair / replacement', category: 'Work Items' },
  { label: 'Test and verify fix works correctly', category: 'Work Items' },
  { label: 'Clean up work area and dispose of waste', category: 'Work Items' },
  { label: 'Note any secondary issues observed on-site', category: 'Work Items' },
]

export function getMaintenanceChecklist(): ChecklistItem[] {
  return MAINTENANCE_WORK_LABELS.map((item, i) => ({ ...item, id: `mnt-${i}` }))
}
