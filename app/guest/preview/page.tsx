'use client'
import { useState, useCallback, useEffect } from 'react'
import {
  AlertTriangle, Phone, ChevronRight, ChevronUp, ChevronDown,
  Search, Heart, Check, Star, MapPin, Copy, Bookmark,
  ClipboardList, Plug, KeyRound, ArrowUpDown, HelpCircle,
  MessageSquare, MessageCircle, Wrench, CircleHelp,
  Users, Map, ShieldAlert, CloudSun, ThumbsUp, ThumbsDown,
  Sparkles, Send, Link2, RefreshCw, Loader2,
} from 'lucide-react'
import { GUIDEBOOKS } from '@/lib/data/guidebooks'
import { PROPERTIES } from '@/lib/data/properties'
import { GUEST_VERIFICATIONS } from '@/lib/data/verification'
import { UPSELL_RULES, PROPERTY_GROUPS } from '@/lib/data/upsells'
import { G } from '@/lib/guest/theme'
import GuestPortalShell, { GuestTab } from '@/components/guest/GuestPortalShell'
import ReportIssueSheet from '@/components/guest/ReportIssueSheet'

/* ——— Curated Unsplash imagery ——————————————————————————————— */
const PREVIEW_IMAGES = {
  hero: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
  ],
  discover: [
    { cat: 'food',      name: 'Maemo',              loc: 'Grünerløkka · 1.2 km',  rating: '4.9', reviews: '2,847', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop', badge: 'SEAFOOD', desc: 'Michelin-starred Nordic tasting menu. Book 2 weeks ahead.' },
    { cat: 'food',      name: 'Café Sara',           loc: 'Torshov · 0.8 km',      rating: '4.7', reviews: '1,932', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop', badge: 'CAFÉ', desc: 'Best cinnamon rolls in Oslo. Cozy upstairs nook.' },
    { cat: 'activity',  name: 'Fjord Kayaking',      loc: 'Aker Brygge · 2.5 km',  rating: '4.8', reviews: '4,102', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop', badge: 'WATER SPORTS', desc: '2-hour guided kayak on the Oslofjord. All gear included.' },
    { cat: 'outdoors',  name: 'Nordmarka Trails',    loc: 'Frognerseteren · 6 km',  rating: '4.9', reviews: '8,234', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=300&fit=crop', badge: 'HIKING', desc: 'Forest trails 30 min from the city. Bring layers.' },
    { cat: 'sights',    name: 'Oslo Opera House',     loc: 'Bjørvika · 3 km',       rating: '4.8', reviews: '12,456', url: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=400&h=300&fit=crop', badge: 'LANDMARK', desc: 'Walk on the roof for panoramic fjord views. Free.' },
    { cat: 'nightlife', name: 'Blå',                  loc: 'Grünerløkka · 1.5 km',  rating: '4.3', reviews: '2,108', url: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=400&h=300&fit=crop', badge: 'LIVE MUSIC', desc: 'Live jazz and electronic by the Akerselva river.' },
  ],
  services: [
    { url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=200&fit=crop', label: 'Spa & Wellness' },
    { url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=200&fit=crop', label: 'Private Chef' },
    { url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0afe?w=400&h=200&fit=crop', label: 'Car Rental' },
    { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=200&fit=crop', label: 'Late Checkout' },
  ],
  hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
}

/* ——— Colored icon config ———————————————————————————————————— */
const GUIDE_ICONS: { icon: typeof ClipboardList; color: string; rgb: string }[] = [
  { icon: ClipboardList, color: '#F5A623', rgb: '245,166,35' },
  { icon: Plug,          color: '#4A9EFF', rgb: '74,158,255' },
  { icon: KeyRound,      color: G.accent,  rgb: '91,107,47' },
  { icon: ArrowUpDown,   color: '#A78BFA', rgb: '167,139,250' },
  { icon: HelpCircle,    color: '#3ECF8E', rgb: '62,207,142' },
  { icon: Map,           color: '#4A9EFF', rgb: '74,158,255' },
  { icon: ShieldAlert,   color: '#FF4D4D', rgb: '255,77,77' },
]

const GUIDE_DETAIL_CONTENT: Record<string, React.ReactNode> = {
  'House Rules': (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {['Quiet hours 10 PM – 8 AM', 'No smoking indoors', 'Max 2 extra guests', 'Pets allowed (notify host)', 'No parties or events'].map(r => (
        <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 4, height: 4, borderRadius: 2, background: G.accent, flexShrink: 0 }} />
          <span>{r}</span>
        </div>
      ))}
    </div>
  ),
  'Appliances': (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[
        { name: 'Oven', desc: 'Preheat 10 min, dial on left' },
        { name: 'Washer', desc: 'Programs on door, pods under sink' },
        { name: 'TV', desc: 'Remote in drawer, Netflix pre-logged' },
        { name: 'Coffee', desc: 'Nespresso machine, capsules in cabinet' },
      ].map(a => (
        <div key={a.name}>
          <span style={{ fontWeight: 800, color: G.text }}>{a.name}: </span>
          <span>{a.desc}</span>
        </div>
      ))}
    </div>
  ),
  'Access & Parking': (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[
        { name: 'Main door', desc: 'Code 4821' },
        { name: 'Building gate', desc: 'Buzz #12' },
        { name: 'Parking', desc: 'Spot B14 in basement' },
        { name: 'Elevator', desc: 'Card in welcome pack' },
      ].map(a => (
        <div key={a.name}>
          <span style={{ fontWeight: 800, color: G.text }}>{a.name}: </span>
          <span>{a.desc}</span>
        </div>
      ))}
    </div>
  ),
  'Checkout Guide': (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {['Strip beds', 'Start dishwasher', 'Take out trash', 'Close windows', 'Leave keys on counter', 'Lock door (auto-locks)'].map(t => (
        <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${G.border}`, flexShrink: 0 }} />
          <span>{t}</span>
        </div>
      ))}
    </div>
  ),
  'FAQs': (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[
        { q: 'Where are extra towels?', a: 'Hall closet, top shelf' },
        { q: 'How does heating work?', a: 'Thermostat in hallway, set to 21°C' },
        { q: 'Is there a hair dryer?', a: 'Under bathroom sink' },
        { q: 'Nearest grocery store?', a: 'Kiwi, 200m east' },
      ].map(f => (
        <div key={f.q}>
          <div style={{ fontWeight: 800, color: G.text, marginBottom: 2 }}>{f.q}</div>
          <div>{f.a}</div>
        </div>
      ))}
    </div>
  ),
  'Property Map': (
    <div style={{ padding: '8px 0', lineHeight: 1.7 }}>
      Kitchen → Living → Bedroom 1 → Bedroom 2<br />
      Bathroom off hallway · Balcony via living room
    </div>
  ),
  'Safety & Emergency': (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div><span style={{ fontWeight: 800, color: G.text }}>Fire exit: </span>Main door + balcony</div>
      <div><span style={{ fontWeight: 800, color: G.text }}>First aid: </span>Under kitchen sink</div>
      <div style={{ padding: '8px 12px', borderRadius: 10, background: `${G.red}0d` }}>
        <div style={{ fontWeight: 800, color: G.red, marginBottom: 4 }}>Emergency Numbers</div>
        <div>112 (police) · 113 (ambulance) · 110 (fire)</div>
        <div style={{ marginTop: 4 }}>Host emergency: +47 900 12 345</div>
      </div>
    </div>
  ),
}

const SUPPORT_ICONS: { icon: typeof MessageSquare; color: string; rgb: string }[] = [
  { icon: MessageSquare, color: '#4A9EFF', rgb: '74,158,255' },
  { icon: Phone,         color: '#3ECF8E', rgb: '62,207,142' },
  { icon: Wrench,        color: '#FF4D4D', rgb: '255,77,77' },
]

const QUICK_ACTIONS = [
  { label: 'Help',    icon: CircleHelp,    color: '#FF4D4D', rgb: '255,77,77' },
  { label: 'Add-ons', icon: ClipboardList, color: '#F5A623', rgb: '245,166,35' },
  { label: 'Message', icon: MessageSquare, color: '#4A9EFF', rgb: '74,158,255' },
]

const DISCOVER_CATEGORIES = [
  { emoji: '✨', label: 'All',       key: 'all' },
  { emoji: '🍽️', label: 'Food',      key: 'food' },
  { emoji: '☕', label: 'Coffee',    key: 'coffee' },
  { emoji: '📸', label: 'Sights',    key: 'sights' },
  { emoji: '🌲', label: 'Outdoors',  key: 'outdoors' },
  { emoji: '🌙', label: 'Nightlife', key: 'nightlife' },
  { emoji: '⛵', label: 'Activities', key: 'activity' },
]

/* ——— Trip Planner mock data ———————————————————————————————— */
const TRIP_INTERESTS = [
  { key: 'food',     emoji: '🍽', label: 'Food & Drink' },
  { key: 'beach',    emoji: '🏖', label: 'Beach & Water' },
  { key: 'nightlife', emoji: '🎉', label: 'Nightlife' },
  { key: 'family',   emoji: '👨‍👩‍👧', label: 'Family' },
  { key: 'nature',   emoji: '🌿', label: 'Nature' },
  { key: 'culture',  emoji: '🏛', label: 'Culture' },
  { key: 'shopping', emoji: '🛍', label: 'Shopping' },
  { key: 'wellness', emoji: '💆', label: 'Wellness' },
]

const TRIP_PLANNER_RESULTS: Record<string, Array<{
  name: string; source: 'host' | 'google'; rating?: string;
  distance: string; reason: string;
}>> = {
  food: [
    { name: 'Maemo', source: 'host', distance: '1.2 km', reason: 'Michelin-starred Nordic tasting. Book ahead.' },
    { name: 'Café Sara', source: 'host', distance: '0.8 km', reason: 'Best cinnamon rolls in the city.' },
    { name: 'Spice Bird', source: 'google', rating: '4.7', distance: '1.5 km', reason: 'Affordable Filipino fusion, great lunch.' },
    { name: 'Sunny Side Café', source: 'google', rating: '4.6', distance: '0.9 km', reason: 'Brunch with a view of the park.' },
    { name: 'Halowich Burgers', source: 'google', rating: '4.5', distance: '2.1 km', reason: 'Best burgers in Grünerløkka.' },
  ],
  nightlife: [
    { name: 'Blå', source: 'host', distance: '1.5 km', reason: 'Live jazz by the river. Iconic.' },
    { name: 'Himkok', source: 'google', rating: '4.6', distance: '1.8 km', reason: 'Speakeasy cocktails, hidden entrance.' },
    { name: 'Crowbar', source: 'google', rating: '4.4', distance: '1.3 km', reason: 'Dive bar vibes, great craft beer.' },
    { name: 'Dattera til Hansen', source: 'google', rating: '4.5', distance: '2.0 km', reason: 'Rooftop terrace, summer essential.' },
    { name: 'Kulturhuset', source: 'google', rating: '4.3', distance: '2.2 km', reason: 'Multi-floor venue, different vibe each floor.' },
  ],
  nature: [
    { name: 'Nordmarka Trails', source: 'host', distance: '6 km', reason: 'Forest trails 30 min from city. Bring layers.' },
    { name: 'Sognsvann Lake', source: 'google', rating: '4.8', distance: '5 km', reason: 'Easy loop trail, stunning in any season.' },
    { name: 'Ekebergparken', source: 'google', rating: '4.7', distance: '3 km', reason: 'Sculpture park with fjord panorama.' },
    { name: 'Bygdøy Peninsula', source: 'google', rating: '4.6', distance: '4 km', reason: 'Beaches + museums, full day trip.' },
    { name: 'Akerselva River Walk', source: 'host', distance: '0.5 km', reason: 'Urban nature walk, waterfalls included.' },
  ],
  beach: [
    { name: 'Sørenga Sjøbad', source: 'host', distance: '3 km', reason: 'Urban seawater pool and beach. Packed in summer.' },
    { name: 'Huk Beach', source: 'google', rating: '4.5', distance: '5 km', reason: 'Sandy beach on Bygdøy with sunset views.' },
    { name: 'Langøyene Island', source: 'google', rating: '4.7', distance: '8 km', reason: 'Ferry-accessible island, bring a picnic.' },
    { name: 'Paradisbukta', source: 'google', rating: '4.4', distance: '5.5 km', reason: 'Quiet cove, great for families.' },
    { name: 'Tjuvholmen Beach', source: 'host', distance: '2 km', reason: 'Small city beach near Aker Brygge.' },
  ],
  culture: [
    { name: 'Munch Museum', source: 'host', distance: '2.5 km', reason: 'The Scream and 28,000 other works. Allow 3 hours.' },
    { name: 'Vigeland Park', source: 'google', rating: '4.8', distance: '3 km', reason: '200+ sculptures in open air. Free entry.' },
    { name: 'National Museum', source: 'google', rating: '4.7', distance: '2 km', reason: 'Largest art collection in Nordics.' },
    { name: 'Akershus Fortress', source: 'google', rating: '4.6', distance: '2.5 km', reason: 'Medieval castle with fjord views.' },
    { name: 'Nobel Peace Center', source: 'host', distance: '2 km', reason: 'Interactive exhibits, always thought-provoking.' },
  ],
  family: [
    { name: 'TusenFryd', source: 'google', rating: '4.3', distance: '20 km', reason: 'Theme park with rollercoasters. Full day.' },
    { name: 'Teknisk Museum', source: 'host', distance: '4 km', reason: 'Hands-on science museum. Kids love it.' },
    { name: 'Reptile Park', source: 'google', rating: '4.2', distance: '1.5 km', reason: 'Small but fascinating. 30–60 min visit.' },
    { name: 'Mini Bottle Gallery', source: 'google', rating: '4.5', distance: '1 km', reason: 'Quirky attraction, fun for all ages.' },
    { name: 'Holmenkollen Ski Jump', source: 'host', distance: '8 km', reason: 'Iconic views + simulator ride for kids.' },
  ],
  shopping: [
    { name: 'Grünerløkka Markets', source: 'host', distance: '1 km', reason: 'Vintage, vinyl, local design. Sunday best.' },
    { name: 'Aker Brygge', source: 'google', rating: '4.4', distance: '2 km', reason: 'Waterfront shops and restaurants.' },
    { name: 'Mathallen Oslo', source: 'host', distance: '1.2 km', reason: 'Food hall with local specialties.' },
    { name: 'Bogstadveien', source: 'google', rating: '4.3', distance: '3 km', reason: 'Main shopping street, all major brands.' },
    { name: 'Vestkanttorget Flea Market', source: 'google', rating: '4.5', distance: '2.5 km', reason: 'Saturday mornings, hidden gems.' },
  ],
  wellness: [
    { name: 'SALT Sauna', source: 'host', distance: '3 km', reason: 'Fjord-side sauna complex. Book evening slot.' },
    { name: 'The Well', source: 'google', rating: '4.7', distance: '15 km', reason: 'Nordic spa resort, worth the trip.' },
    { name: 'Farris Bad', source: 'google', rating: '4.6', distance: '120 km', reason: 'Day trip to hot springs by the sea.' },
    { name: 'Vøien Yoga', source: 'google', rating: '4.5', distance: '1 km', reason: 'Drop-in morning classes. Bring your own mat.' },
    { name: 'Vulkan Spa', source: 'host', distance: '1.3 km', reason: 'Urban spa, great couples package.' },
  ],
}

/* ——— Our Trip mock data ——————————————————————————————————— */
const MOCK_GROUP = [
  { name: 'Sarah', role: 'host' as const },
  { name: 'Marcus', role: 'guest' as const },
  { name: 'Lin', role: 'guest' as const },
]

const MOCK_TRIP_BOARD = [
  { id: 'tb1', name: 'Maemo', cat: '🍽', addedBy: 'Sarah', source: 'trip-planner' as const, votes: { up: 3, down: 0 } },
  { id: 'tb2', name: 'Fjord Kayaking', cat: '⛵', addedBy: 'Marcus', source: 'manual' as const, votes: { up: 2, down: 1 } },
  { id: 'tb3', name: 'Bar Boca', cat: '🌙', addedBy: 'Lin', source: 'manual' as const, votes: { up: 1, down: 2 } },
  { id: 'tb4', name: 'Nordmarka Trails', cat: '🌲', addedBy: 'Sarah', source: 'trip-planner' as const, votes: { up: 3, down: 0 } },
]

const MOCK_CHECKLIST_INIT = [
  { id: 'c1', task: 'Dishes washed', done: true, by: 'Marcus' as string | null },
  { id: 'c2', task: 'Trash taken out', done: true, by: 'Lin' as string | null },
  { id: 'c3', task: 'Windows closed', done: true, by: 'Sarah' as string | null },
  { id: 'c4', task: 'Thermostat reset', done: false, by: null as string | null },
  { id: 'c5', task: 'Keys on counter', done: false, by: null as string | null },
  { id: 'c6', task: 'Towels in hamper', done: false, by: null as string | null },
]

/* ——— Guest recommendations mock data ——————————————————————— */
const GUEST_RECS = [
  { name: 'Tim Wendelboe', cat: 'Coffee', recCount: 18 },
  { name: 'Hrimnir Ramen', cat: 'Food', recCount: 12 },
  { name: 'Sognsvann Lake', cat: 'Nature', recCount: 24 },
]

/**
 * Guest Portal preview — photo-forward travel-app aesthetic.
 * Interactive: category filters, copy-to-clipboard, save/bookmark, press feedback.
 */
export default function GuestPortalPreview() {
  const guidebook = GUIDEBOOKS[0]
  const property  = PROPERTIES.find(p => p.id === guidebook.propertyId)
  const verif     = GUEST_VERIFICATIONS.find(v => v.propertyId === guidebook.propertyId)
  const group     = PROPERTY_GROUPS.find(g => g.propertyIds.includes(guidebook.propertyId))
  const upsells   = UPSELL_RULES.filter(r => {
    if (!r.enabled) return false
    if (r.targeting === 'all') return true
    if (r.targeting === 'properties') return r.targetPropertyIds.includes(guidebook.propertyId)
    if (r.targeting === 'groups' && group) return r.targetGroupIds.includes(group.id)
    return false
  })

  const [issueOpen, setIssueOpen] = useState(false)
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null)
  const [helpMenuOpen, setHelpMenuOpen] = useState(false)
  const [tab, setTab] = useState<GuestTab>('home')
  const [favorited, setFavorited] = useState(false)
  const [activeCat, setActiveCat] = useState('all')
  const [savedRecs, setSavedRecs] = useState<Set<number>>(new Set())
  const [addedServices, setAddedServices] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)
  const [wifiConnected, setWifiConnected] = useState(false)
  const [heroIdx, setHeroIdx] = useState(0)

  // Trip Planner state
  const [tripPlannerState, setTripPlannerState] = useState<'collapsed' | 'questions' | 'loading' | 'results'>('collapsed')
  const [tripInterests, setTripInterests] = useState<Set<string>>(new Set())
  const [tripFirstTime, setTripFirstTime] = useState<string | null>(null)
  const [tripSaved, setTripSaved] = useState<Set<string>>(new Set())

  // Our Trip state
  const [tripVotes, setTripVotes] = useState<Record<string, 'up' | 'down' | null>>({})
  const [checklist, setChecklist] = useState(MOCK_CHECKLIST_INIT)

  const guestName = verif?.guestName?.split(' ')[0] ?? 'Sarah'
  const ssid = `${guidebook.propertyName.replace(/\s+/g, '')}_5G`

  // Hero carousel auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIdx(prev => (prev + 1) % PREVIEW_IMAGES.hero.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 1800)
  }, [])

  const toggleSaveRec = useCallback((i: number) => {
    setSavedRecs(prev => {
      const next = new Set(prev)
      if (next.has(i)) { next.delete(i) } else { next.add(i) }
      return next
    })
  }, [])

  const toggleAddService = useCallback((id: string) => {
    setAddedServices(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        showToast('Removed from cart')
      } else {
        next.add(id)
        showToast('Added to cart ✓')
      }
      return next
    })
  }, [showToast])

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard?.writeText(text).catch(() => {})
    showToast(`${label} copied!`)
  }, [showToast])

  const toggleTripInterest = useCallback((key: string) => {
    setTripInterests(prev => {
      const next = new Set(prev)
      if (next.has(key)) { next.delete(key) } else { next.add(key) }
      return next
    })
  }, [])

  const startTripPlanner = useCallback(() => {
    setTripPlannerState('loading')
    setTimeout(() => setTripPlannerState('results'), 1500)
  }, [])

  const toggleTripSave = useCallback((key: string) => {
    setTripSaved(prev => {
      const next = new Set(prev)
      if (next.has(key)) { next.delete(key); showToast('Removed from Trip Board') }
      else { next.add(key); showToast('Saved to Trip Board ✓') }
      return next
    })
  }, [showToast])

  const handleVote = useCallback((id: string, vote: 'up' | 'down') => {
    setTripVotes(prev => ({
      ...prev,
      [id]: prev[id] === vote ? null : vote,
    }))
  }, [])

  const toggleChecklistItem = useCallback((id: string) => {
    setChecklist(prev => prev.map(item =>
      item.id === id
        ? { ...item, done: !item.done, by: !item.done ? guestName : null }
        : item
    ))
  }, [guestName])

  const filteredDiscover = activeCat === 'all'
    ? PREVIEW_IMAGES.discover
    : PREVIEW_IMAGES.discover.filter(r => r.cat === activeCat)

  // ——— Home ————————————————————————————————————————————————
  const HomePanel = (
    <div>
      {/* Full-bleed hero carousel */}
      <div className="gp-press" style={{
        position: 'relative', height: 320, overflow: 'hidden',
      }}>
        {PREVIEW_IMAGES.hero.map((url, i) => (
          <div key={url} style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${url})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: i === heroIdx ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
          }} />
        ))}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.02) 30%, rgba(0,0,0,0.55) 100%)',
        }} />
        <button
          onClick={() => setFavorited(v => !v)}
          className="gp-press-sm"
          style={{
            position: 'absolute', top: 14, right: 14,
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'transform 0.15s, background 0.15s',
          }}
        >
          <Heart
            size={18}
            color={favorited ? '#C43333' : '#fff'}
            fill={favorited ? '#C43333' : 'none'}
            strokeWidth={2}
          />
        </button>

        {/* Dot indicators */}
        <div style={{
          position: 'absolute', bottom: 96, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 6, zIndex: 10,
        }}>
          {PREVIEW_IMAGES.hero.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIdx(i)}
              style={{
                width: 6, height: 6, borderRadius: '50%', border: 'none', padding: 0,
                background: i === heroIdx ? '#fff' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
          <div style={{
            fontSize: 26, fontWeight: 900, color: '#fff',
            letterSpacing: '-0.02em', lineHeight: 1.15,
            textShadow: '0 2px 12px rgba(0,0,0,0.3)',
          }}>{guidebook.propertyName}</div>
          <div style={{
            fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginTop: 4,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <MapPin size={12} /> {property ? `${property.address ?? ''}${property.city ? `, ${property.city}` : ''}` : 'Oslo, Norway'}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '5px 12px', borderRadius: 10,
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', color: '#fff',
            }}>Mar 22 → 27</span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '5px 12px', borderRadius: 10,
              background: `${G.accent}44`, backdropFilter: 'blur(6px)', color: '#fff',
            }}>✓ Verified</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        {/* Greeting */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 32, fontWeight: 900, lineHeight: 1.15, color: G.text,
            letterSpacing: '-0.02em',
          }}>
            Hey {guestName} 👋
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: G.textBody, marginTop: 6 }}>
            Let&apos;s make your stay effortless
          </div>
        </div>

        {/* AI Concierge Search Bar */}
        <button
          className="gp-press"
          onClick={() => showToast('AI Concierge coming soon')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '13px 18px', borderRadius: 999,
            background: G.surfaceHover, border: `1px solid ${G.border}`,
            cursor: 'pointer', marginBottom: 16,
            fontFamily: 'inherit',
          }}
        >
          <Search size={16} color={G.textMuted} />
          <span style={{ fontSize: 14, fontWeight: 600, color: G.textMuted }}>
            Ask anything about your stay...
          </span>
        </button>

        {/* Trip Planner — Inline Expansion */}
        {tripPlannerState === 'collapsed' && (
          <button
            className="gp-press"
            onClick={() => setTripPlannerState('questions')}
            style={{
              width: '100%', padding: 18, borderRadius: 20,
              background: 'linear-gradient(135deg, #EEF2E2 0%, #D8E4B8 100%)',
              border: `1px solid ${G.accent}33`,
              boxShadow: `0 4px 16px ${G.accent}22`,
              cursor: 'pointer', textAlign: 'left',
              marginBottom: 18,
              fontFamily: 'inherit',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Sparkles size={18} color={G.accent} />
              <span style={{ fontSize: 16, fontWeight: 900, color: G.text }}>Plan Your Trip</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: G.textBody, marginBottom: 10 }}>
              First time in Oslo? We&apos;ll build your top picks in 30s.
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 13, fontWeight: 800, color: G.accent,
            }}>
              Start Planning <ChevronRight size={14} />
            </span>
          </button>
        )}

        {tripPlannerState === 'questions' && (
          <div style={{
            padding: 18, borderRadius: 20, marginBottom: 18,
            background: G.surface, border: `1px solid ${G.border}`,
            boxShadow: G.shadowMd,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Sparkles size={18} color={G.accent} />
              <span style={{ fontSize: 16, fontWeight: 900, color: G.text }}>Plan Your Trip</span>
            </div>

            {/* First time question */}
            <div style={{ fontSize: 13, fontWeight: 700, color: G.text, marginBottom: 10 }}>
              First time here?
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {['First visit', 'Been before', 'Local-ish'].map(opt => (
                <button
                  key={opt}
                  className="gp-press-sm"
                  onClick={() => setTripFirstTime(opt)}
                  style={{
                    padding: '8px 16px', borderRadius: 999,
                    background: tripFirstTime === opt ? G.accent : G.surfaceHover,
                    color: tripFirstTime === opt ? '#fff' : G.textBody,
                    border: tripFirstTime === opt ? 'none' : `1px solid ${G.border}`,
                    fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.2s',
                  }}
                >{opt}</button>
              ))}
            </div>

            {/* Interest selection */}
            <div style={{ fontSize: 13, fontWeight: 700, color: G.text, marginBottom: 10 }}>
              What are you into?
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
              {TRIP_INTERESTS.map(ti => {
                const sel = tripInterests.has(ti.key)
                return (
                  <button
                    key={ti.key}
                    className="gp-press-sm"
                    onClick={() => toggleTripInterest(ti.key)}
                    style={{
                      padding: '10px 12px', borderRadius: 14,
                      background: sel ? G.accentBg : G.surfaceHover,
                      border: sel ? `1.5px solid ${G.accent}66` : `1px solid ${G.border}`,
                      color: sel ? G.accent : G.textBody,
                      fontSize: 13, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', gap: 6,
                      transition: 'all 0.2s',
                    }}
                  >
                    <span>{ti.emoji}</span> {ti.label}
                  </button>
                )
              })}
            </div>

            <button
              className="gp-press"
              onClick={startTripPlanner}
              disabled={tripInterests.size === 0}
              style={{
                width: '100%', padding: '13px 20px', borderRadius: 999,
                background: tripInterests.size > 0 ? G.accent : G.surfaceHover,
                color: tripInterests.size > 0 ? '#fff' : G.textMuted,
                border: 'none', fontSize: 14, fontWeight: 800,
                cursor: tripInterests.size > 0 ? 'pointer' : 'default',
                fontFamily: 'inherit', transition: 'all 0.2s',
              }}
            >
              Build My Top 5 →
            </button>
          </div>
        )}

        {tripPlannerState === 'loading' && (
          <div style={{
            padding: 40, borderRadius: 20, marginBottom: 18,
            background: G.surface, border: `1px solid ${G.border}`,
            boxShadow: G.shadowMd,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          }}>
            <Loader2 size={28} color={G.accent} className="gp-spin" />
            <div style={{ fontSize: 14, fontWeight: 700, color: G.text }}>
              Building your personalized Top 5...
            </div>
          </div>
        )}

        {tripPlannerState === 'results' && (
          <div style={{
            padding: 18, borderRadius: 20, marginBottom: 18,
            background: G.surface, border: `1px solid ${G.border}`,
            boxShadow: G.shadowMd,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} color={G.accent} />
                <span style={{ fontSize: 16, fontWeight: 900, color: G.text }}>Your Top Picks</span>
              </div>
              <button
                className="gp-press-sm"
                onClick={() => setTripPlannerState('collapsed')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 11, fontWeight: 700, color: G.textMuted,
                  fontFamily: 'inherit',
                }}
              >
                Collapse <ChevronUp size={14} />
              </button>
            </div>

            {Array.from(tripInterests).map(interest => {
              const items = TRIP_PLANNER_RESULTS[interest]
              if (!items) return null
              const label = TRIP_INTERESTS.find(t => t.key === interest)
              return (
                <div key={interest} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: G.text, marginBottom: 10 }}>
                    {label?.emoji} {label?.label ?? interest}
                  </div>
                  {items.map((item, idx) => {
                    const saveKey = `${interest}-${idx}`
                    return (
                      <div key={idx} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        padding: '10px 0',
                        borderBottom: idx < items.length - 1 ? `1px solid ${G.border}` : 'none',
                      }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                          background: G.accentBg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 900, color: G.accent,
                        }}>{idx + 1}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: G.text }}>{item.name}</span>
                            <span style={{
                              fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 6,
                              background: item.source === 'host' ? G.accentBg : '#FFF8E1',
                              color: item.source === 'host' ? G.accent : '#F5A623',
                            }}>
                              {item.source === 'host' ? '⭐ Host\'s Pick' : `${item.rating} ★ Google`}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: G.textBody, marginBottom: 2 }}>
                            {item.distance} · {item.reason}
                          </div>
                          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                            <button
                              className="gp-press-sm"
                              onClick={() => showToast('Vote recorded ✓')}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 3,
                                padding: '4px 10px', borderRadius: 10,
                                background: G.surfaceHover, border: `1px solid ${G.border}`,
                                fontSize: 10, fontWeight: 700, color: G.textMuted,
                                cursor: 'pointer', fontFamily: 'inherit',
                              }}
                            >
                              <ThumbsUp size={10} /> Vote
                            </button>
                            <button
                              className="gp-press-sm"
                              onClick={() => toggleTripSave(saveKey)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 3,
                                padding: '4px 10px', borderRadius: 10,
                                background: tripSaved.has(saveKey) ? G.accentBg : G.surfaceHover,
                                border: `1px solid ${tripSaved.has(saveKey) ? G.accent + '44' : G.border}`,
                                fontSize: 10, fontWeight: 700,
                                color: tripSaved.has(saveKey) ? G.accent : G.textMuted,
                                cursor: 'pointer', fontFamily: 'inherit',
                              }}
                            >
                              <Bookmark size={10} fill={tripSaved.has(saveKey) ? G.accent : 'none'} /> {tripSaved.has(saveKey) ? 'Saved' : 'Save to Trip'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="gp-press-sm"
                onClick={() => {
                  setTripPlannerState('loading')
                  setTimeout(() => setTripPlannerState('results'), 1500)
                }}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px 16px', borderRadius: 14,
                  background: G.surfaceHover, border: `1px solid ${G.border}`,
                  fontSize: 12, fontWeight: 700, color: G.textMuted,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <RefreshCw size={13} /> Regenerate
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions — 3-col row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10,
          marginBottom: 18,
        }}>
          {QUICK_ACTIONS.map(qa => {
            const QaIcon = qa.icon
            return (
              <button
                key={qa.label}
                className="gp-press"
                onClick={qa.label === 'Add-ons' ? () => setTab('services') : () => showToast('Coming soon')}
                style={{
                  background: G.surface, border: `1px solid ${G.border}`,
                  borderRadius: 18, padding: '14px 8px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  cursor: 'pointer', boxShadow: G.shadowSm,
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 12,
                  background: `rgba(${qa.rgb}, 0.1)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <QaIcon size={18} color={qa.color} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: G.text }}>{qa.label}</span>
              </button>
            )
          })}
        </div>

        {/* Compact Quick Access — 2×2 grid */}
        <SectionHeader title="Quick Access" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <button
            className="gp-press"
            onClick={() => copyToClipboard(ssid, 'WiFi')}
            style={{
              background: G.surface, borderRadius: 18, padding: 12,
              boxShadow: G.shadowSm, border: `1px solid ${G.border}`,
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: G.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>WiFi Network</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: G.text }}>{ssid}</div>
              <Copy size={10} color={G.accent} />
            </div>
          </button>
          <button
            className="gp-press"
            onClick={() => copyToClipboard('4821', 'Door code')}
            style={{
              background: `${G.accent}0a`, borderRadius: 18, padding: 12,
              boxShadow: G.shadowSm, border: `1px solid ${G.accent}1a`,
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: `${G.accent}99`, textTransform: 'uppercase', marginBottom: 6 }}>Door Code</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: G.accent, letterSpacing: '0.14em' }}>4821</div>
              <span style={{ fontSize: 14 }}>🔑</span>
            </div>
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <div style={{
            background: G.surface, borderRadius: 18, padding: 12, textAlign: 'center',
            boxShadow: G.shadowSm, border: `1px solid ${G.border}`,
          }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: G.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>Check-in</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: G.text }}>15:00</div>
            <div style={{ fontSize: 9, fontWeight: 600, color: G.textMuted, marginTop: 2 }}>Sat Mar 22</div>
          </div>
          <div style={{
            background: G.surface, borderRadius: 18, padding: 12, textAlign: 'center',
            boxShadow: G.shadowSm, border: `1px solid ${G.border}`,
          }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: G.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>Check-out</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: G.text }}>11:00</div>
            <div style={{ fontSize: 9, fontWeight: 600, color: G.textMuted, marginTop: 2 }}>Thu Mar 27</div>
          </div>
        </div>

        {/* Access Window Status Card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: 14, marginBottom: 8, borderRadius: 18,
          background: G.surface, border: `1px solid ${G.border}`,
          boxShadow: G.shadowSm,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'rgba(245,166,35,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Wrench size={18} color="#F5A623" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: G.text }}>
              Maintenance Visit · Today 2:00–3:00 PM
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: G.textBody, marginTop: 2 }}>
              Plumber — Bathroom faucet repair
            </div>
          </div>
          <span style={{
            fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 8,
            background: G.accentBg, color: G.accent,
          }}>Scheduled ✓</span>
        </div>

        {/* Compact WiFi connect bar */}
        <button
          className="gp-press"
          onClick={() => { setWifiConnected(true); showToast('Connected to WiFi ✓') }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            background: G.surface, borderRadius: 18, padding: '10px 14px',
            boxShadow: G.shadowSm, border: `1px solid ${G.border}`,
            cursor: 'pointer', marginBottom: 18,
            fontFamily: 'inherit',
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: G.accentBg, border: `1px solid ${G.accent}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>📶</div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: G.text }}>Connect to {ssid}</div>
          </div>
          <div style={{
            background: wifiConnected ? G.accentBg : G.accent,
            color: wifiConnected ? G.accent : '#fff',
            border: wifiConnected ? `1px solid ${G.accent}33` : 'none',
            fontSize: 11, fontWeight: 800, padding: '6px 14px', borderRadius: 16,
            letterSpacing: '0.02em',
          }}>{wifiConnected ? 'Connected ✓' : 'Connect'}</div>
        </button>

        {/* Upsell photo cards */}
        {upsells.length > 0 && (
          <>
            <SectionHeader
              title="Enhance Your Stay"
              action="View all"
              onAction={() => setTab('services')}
            />
            <HorizontalRail>
              {upsells.slice(0, 4).map((u, i) => {
                const added = addedServices.has(u.id)
                return (
                  <div key={u.id} className="gp-press" style={{
                    width: 200, flexShrink: 0,
                    background: G.surface, borderRadius: 18,
                    boxShadow: G.shadowMd, border: `1px solid ${G.border}`,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: 130,
                      backgroundImage: `url(${PREVIEW_IMAGES.services[i % PREVIEW_IMAGES.services.length].url})`,
                      backgroundSize: 'cover', backgroundPosition: 'center',
                    }} />
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{
                        fontSize: 13, fontWeight: 800, color: G.text,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{u.title}</div>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginTop: 8,
                      }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: G.accent }}>
                          {u.price} {u.currency ?? 'NOK'}
                        </div>
                        <button
                          className="gp-press-sm"
                          onClick={() => toggleAddService(u.id)}
                          style={{
                            padding: '6px 14px', borderRadius: 999,
                            background: added ? G.accentBg : G.accent,
                            color: added ? G.accent : '#fff',
                            border: added ? `1px solid ${G.accent}44` : 'none',
                            fontSize: 11, fontWeight: 800, cursor: 'pointer',
                            fontFamily: 'inherit', transition: 'all 0.2s',
                          }}
                        >{added ? 'Added ✓' : 'Add'}</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </HorizontalRail>
          </>
        )}

        {/* Spacer at bottom for FAB clearance */}
        <div style={{ height: 60 }} />
      </div>
    </div>
  )

  // ——— Guide ————————————————————————————————————————————————
  const guideRows = [
    { t: 'House Rules',        s: 'Quiet hours · Pets · Extra guests' },
    { t: 'Appliances',         s: 'Oven · Washer · TV · Coffee' },
    { t: 'Access & Parking',   s: 'Gate codes · Building entry' },
    { t: 'Checkout Guide',     s: 'Checklist · 11:00 AM · Thu Mar 27' },
    { t: 'FAQs',               s: 'Common questions · Quick answers' },
    { t: 'Property Map',       s: 'Floor plan & key locations' },
    { t: 'Safety & Emergency', s: 'Fire exits · First aid · Emergency contacts' },
  ]

  const GuidePanel = (
    <div style={{ padding: '20px 20px 0' }}>
      {/* Host welcome card */}
      <div className="gp-press" style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: 16, marginBottom: 20,
        background: G.surface, borderRadius: 20,
        boxShadow: G.shadowMd, border: `1px solid ${G.border}`,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
          backgroundImage: `url(${PREVIEW_IMAGES.hostAvatar})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          border: `3px solid ${G.accentBg}`,
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: G.text, letterSpacing: '-0.02em' }}>
            Welcome to {guidebook.propertyName}!
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: G.textBody, marginTop: 2 }}>
            I&apos;m Erik, your host. Reach out anytime!
          </div>
        </div>
        <ChevronRight size={18} color={G.textFaint} />
      </div>

      {/* Stay progress card */}
      <div style={{
        padding: '14px 16px', marginBottom: 20,
        background: G.surface, borderRadius: 16,
        boxShadow: G.shadowSm, border: `1px solid ${G.border}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: G.text }}>Stay progress</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: G.accent }}>Day 2 of 5</div>
        </div>
        <div style={{
          height: 6, borderRadius: 3,
          background: G.surfaceHover, overflow: 'hidden',
        }}>
          <div style={{ width: '40%', height: '100%', background: G.accent, borderRadius: 3, transition: 'width 0.3s' }} />
        </div>
      </div>

      <SectionTitle>Property Guide</SectionTitle>
      {guideRows.map((row, i) => {
        const iconCfg = GUIDE_ICONS[i]
        const IconComp = iconCfg.icon
        const isExpanded = expandedGuide === row.t
        const detail = GUIDE_DETAIL_CONTENT[row.t]
        return (
          <div key={row.t} style={{ marginBottom: 10 }}>
            <button
              className="gp-press"
              onClick={() => setExpandedGuide(isExpanded ? null : row.t)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: 14,
                background: G.surface,
                borderRadius: isExpanded ? '18px 18px 0 0' : '18px',
                boxShadow: G.shadowSm, cursor: 'pointer',
                border: `1px solid ${isExpanded ? G.accent + '33' : G.border}`,
                borderBottom: isExpanded ? 'none' : `1px solid ${G.border}`,
                transition: 'border-color 0.15s',
                fontFamily: 'inherit',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                background: `rgba(${iconCfg.rgb}, 0.08)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <IconComp size={22} color={`rgba(${iconCfg.rgb}, 0.7)`} />
              </div>
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: G.text }}>{row.t}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: G.textBody, marginTop: 2 }}>{row.s}</div>
              </div>
              {isExpanded
                ? <ChevronDown size={18} color={G.accent} style={{ transform: 'rotate(180deg)', transition: 'transform 0.2s' }} />
                : <ChevronRight size={18} color={G.textFaint} />
              }
            </button>
            {isExpanded && detail && (
              <div style={{
                padding: '14px 16px 16px',
                background: G.surfaceHover,
                borderRadius: '0 0 18px 18px',
                border: `1px solid ${G.accent}33`,
                borderTop: 'none',
                fontSize: 12, fontWeight: 600, color: G.textBody,
                lineHeight: 1.55,
              }}>
                {detail}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  // ——— Discover ————————————————————————————————————————————————
  const DiscoverPanel = (
    <div style={{ padding: '20px 20px 0' }}>
      {/* Weather Widget */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px', borderRadius: 16, marginBottom: 14,
        background: G.surface, border: `1px solid ${G.border}`,
        boxShadow: G.shadowSm,
      }}>
        <CloudSun size={20} color="#F5A623" />
        <span style={{ fontSize: 13, fontWeight: 700, color: G.text }}>Oslo</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: G.textMuted }}>·</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: G.text }}>12°C</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: G.textMuted }}>·</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: G.textMuted }}>Partly cloudy</span>
      </div>

      {/* Search bar */}
      <div className="gp-press" style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px', borderRadius: 999,
        background: G.surfaceHover, cursor: 'pointer',
        marginBottom: 16,
      }}>
        <Search size={16} color={G.textMuted} />
        <span style={{ fontSize: 14, fontWeight: 600, color: G.textMuted }}>
          Search places, restaurants...
        </span>
      </div>

      {/* Category pills — functional filter */}
      <HorizontalRail style={{ marginBottom: 18 }}>
        {DISCOVER_CATEGORIES.map(c => {
          const active = activeCat === c.key
          return (
            <button
              key={c.key}
              className="gp-cat-pill"
              onClick={() => setActiveCat(c.key)}
              style={{
                flexShrink: 0,
                padding: '8px 18px', borderRadius: 999,
                background: active ? G.accent : G.surface,
                color: active ? '#fff' : G.textBody,
                border: active ? 'none' : `1.5px solid ${G.border}`,
                fontSize: 13, fontWeight: 800,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: active ? `0 4px 14px ${G.accent}66` : G.shadowSm,
                transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                transform: active ? 'scale(1.04)' : 'scale(1)',
              }}
            >
              <span>{c.emoji}</span> {c.label}
            </button>
          )
        })}
      </HorizontalRail>

      {/* Map View Stub */}
      <button
        className="gp-press"
        onClick={() => showToast('Map view coming soon')}
        style={{
          width: '100%', height: 100, borderRadius: 18, marginBottom: 18,
          background: G.surfaceHover, border: `1px solid ${G.border}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <MapPin size={24} color={G.textMuted} />
        <span style={{ fontSize: 12, fontWeight: 700, color: G.textMuted }}>View on map →</span>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: G.text, letterSpacing: '-0.02em' }}>Host&apos;s Local Picks</div>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', color: G.textMuted }}>CURATED</div>
      </div>

      {/* Stacked photo recommendation cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filteredDiscover.length === 0 && (
          <div style={{ color: G.textMuted, fontSize: 14, textAlign: 'center', padding: '32px 0' }}>
            No recommendations in this category yet.
          </div>
        )}
        {filteredDiscover.map((rec, i) => {
          const globalIdx = PREVIEW_IMAGES.discover.indexOf(rec)
          const saved = savedRecs.has(globalIdx)
          return (
            <div key={globalIdx} className="gp-press" style={{
              background: G.surface, borderRadius: 22,
              boxShadow: G.shadowMd, overflow: 'hidden',
              border: `1px solid ${G.border}`,
              transition: 'border-color 0.15s',
            }}>
              <div style={{
                height: 180, position: 'relative',
                backgroundImage: `url(${rec.url})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)',
                }} />
                {/* Category badge */}
                <div style={{
                  position: 'absolute', top: 11, left: 11,
                  padding: '3px 9px', borderRadius: 10,
                  background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
                  fontSize: 9, fontWeight: 900, color: '#fff',
                  letterSpacing: '0.06em',
                }}>
                  {rec.badge}
                </div>
                {/* Host pick badge */}
                {i === 0 && (
                  <div style={{
                    position: 'absolute', top: 11, right: 11,
                    padding: '3px 9px', borderRadius: 10,
                    background: `${G.accent}ee`,
                    fontSize: 9, fontWeight: 900, color: '#fff',
                    letterSpacing: '0.04em',
                    display: 'flex', alignItems: 'center', gap: 3,
                  }}>
                    ⭐ HOST PICK
                  </div>
                )}
                {/* Rating overlay */}
                <div style={{
                  position: 'absolute', bottom: 10, left: 11,
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                  padding: '4px 9px', borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  <Star size={11} color="#FFC107" fill="#FFC107" />
                  <span style={{ fontSize: 11, fontWeight: 900, color: '#fff' }}>{rec.rating}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>({rec.reviews})</span>
                </div>
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{
                  fontSize: 15, fontWeight: 900, color: G.text,
                  letterSpacing: '-0.01em', marginBottom: 4,
                }}>{rec.name}</div>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: G.textBody, lineHeight: 1.45,
                  marginBottom: 10,
                }}>{rec.desc}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: G.textMuted,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <MapPin size={10} /> {rec.loc}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="gp-press-sm"
                      onClick={() => toggleSaveRec(globalIdx)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        background: saved ? G.accentBg : G.surfaceHover,
                        border: `1px solid ${saved ? G.accent + '44' : G.border}`,
                        borderRadius: 14, padding: '6px 11px',
                        fontSize: 10, fontWeight: 800,
                        color: saved ? G.accent : G.textMuted,
                        cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all 0.15s',
                      }}
                    >
                      <Bookmark size={11} fill={saved ? G.accent : 'none'} /> {saved ? 'Saved' : 'Save'}
                    </button>
                    <button
                      className="gp-press-sm"
                      style={{
                        background: 'transparent', border: `1px solid ${G.accent}44`,
                        color: G.accent, fontSize: 11, fontWeight: 800,
                        padding: '6px 12px', borderRadius: 14,
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >Navigate →</button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Guest Recommendations Section */}
      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: G.text, letterSpacing: '-0.02em' }}>Guest Recommendations</div>
          <span style={{
            fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 8,
            background: G.accentBg, color: G.accent, letterSpacing: '0.04em',
          }}>NEW</span>
        </div>
        {GUEST_RECS.map(gr => (
          <div key={gr.name} className="gp-press" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: 14, marginBottom: 10,
            background: G.surface, borderRadius: 18,
            boxShadow: G.shadowSm, border: `1px solid ${G.border}`,
            cursor: 'pointer',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: G.accentBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Users size={18} color={G.accent} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: G.text }}>{gr.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8,
                  background: G.surfaceHover, color: G.textMuted,
                }}>{gr.cat}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: G.textBody }}>
                  Recommended by {gr.recCount} guests
                </span>
              </div>
            </div>
            <ChevronRight size={16} color={G.textFaint} />
          </div>
        ))}
      </div>
    </div>
  )

  // ——— Services ————————————————————————————————————————————————
  const ServicesPanel = (
    <div style={{ padding: '20px 20px 0' }}>
      <div style={{
        fontSize: 22, fontWeight: 900, color: G.text, marginBottom: 16,
        letterSpacing: '-0.02em',
      }}>
        Enhance Your Stay
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {upsells.slice(0, 8).map((u, i) => {
          const added = addedServices.has(u.id)
          return (
            <div key={u.id} className="gp-press" style={{
              background: G.surface, borderRadius: 20,
              boxShadow: G.shadowMd, overflow: 'hidden',
              border: `1px solid ${G.border}`,
              transition: 'border-color 0.15s',
            }}>
              <div style={{
                height: 100,
                backgroundImage: `url(${PREVIEW_IMAGES.services[i % PREVIEW_IMAGES.services.length].url})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
              }} />
              <div style={{ padding: '12px 12px 14px' }}>
                <div style={{
                  fontSize: 13, fontWeight: 800, color: G.text,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{u.title}</div>
                <div style={{
                  fontSize: 10, fontWeight: 600, color: G.textBody,
                  marginTop: 2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{u.description}</div>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginTop: 10,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: G.accent }}>
                    {u.price} {u.currency ?? 'NOK'}
                  </div>
                  <button
                    className="gp-press-sm"
                    onClick={() => toggleAddService(u.id)}
                    style={{
                      padding: '7px 14px', borderRadius: 14,
                      background: added ? G.accentBg : G.accent,
                      color: added ? G.accent : '#fff',
                      border: added ? `1px solid ${G.accent}44` : 'none',
                      fontSize: 11, fontWeight: 800, cursor: 'pointer',
                      fontFamily: 'inherit', transition: 'all 0.2s',
                    }}
                  >{added ? 'Added ✓' : 'Add'}</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {upsells.length === 0 && (
        <div style={{ color: G.textMuted, fontSize: 14, textAlign: 'center', padding: '32px 0' }}>
          No services available.
        </div>
      )}
    </div>
  )

  // ——— Our Trip ————————————————————————————————————————————————
  const checklistDoneCount = checklist.filter(c => c.done).length
  const TripPanel = (
    <div style={{ padding: '20px 20px 0' }}>
      <div style={{
        fontSize: 22, fontWeight: 900, color: G.text, marginBottom: 20,
        letterSpacing: '-0.02em',
      }}>Our Trip</div>

      {/* Section 1 — Invite Your Group */}
      <div style={{
        padding: 18, borderRadius: 20, marginBottom: 20,
        background: G.surface, border: `1px solid ${G.border}`,
        boxShadow: G.shadowMd,
      }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: G.text, marginBottom: 4 }}>Invite your group</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: G.textBody, marginBottom: 14 }}>Share access with everyone staying</div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            type="text"
            placeholder="Name"
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 12,
              background: G.surfaceHover, border: `1px solid ${G.border}`,
              color: G.text, fontSize: 13, fontWeight: 500,
              fontFamily: 'inherit', outline: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Email or phone"
            style={{
              flex: 1.5, padding: '10px 14px', borderRadius: 12,
              background: G.surfaceHover, border: `1px solid ${G.border}`,
              color: G.text, fontSize: 13, fontWeight: 500,
              fontFamily: 'inherit', outline: 'none',
            }}
          />
        </div>
        <button
          className="gp-press"
          onClick={() => showToast('Invite sent ✓')}
          style={{
            width: '100%', padding: '11px 20px', borderRadius: 14,
            background: G.accent, color: '#fff', border: 'none',
            fontSize: 13, fontWeight: 800, cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <Send size={14} /> Send Invite
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0',
        }}>
          <div style={{ flex: 1, height: 1, background: G.border }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: G.textMuted }}>or</span>
          <div style={{ flex: 1, height: 1, background: G.border }} />
        </div>

        <button
          className="gp-press"
          onClick={() => copyToClipboard('https://afterstay.app/trip/abc123', 'Link')}
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 14,
            background: G.surfaceHover, border: `1px solid ${G.border}`,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 10,
          }}
        >
          <Link2 size={14} color={G.accent} />
          <span style={{ flex: 1, textAlign: 'left', fontSize: 12, fontWeight: 600, color: G.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            afterstay.app/trip/abc123
          </span>
          <Copy size={12} color={G.accent} />
        </button>

        <div style={{ marginTop: 12, fontSize: 11, fontWeight: 700, color: G.accent, textAlign: 'center' }}>
          3 guests have joined
        </div>
      </div>

      {/* Section 2 — Group Members */}
      <SectionTitle>Group</SectionTitle>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {MOCK_GROUP.map(m => (
          <div key={m.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: `linear-gradient(135deg, ${G.accentBg}, ${G.accent}33)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 800, color: G.accent,
              }}>
                {m.name[0]}
              </div>
              {m.role === 'host' && (
                <span style={{
                  position: 'absolute', bottom: -2, right: -4,
                  fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 6,
                  background: G.accent, color: '#fff',
                }}>Host</span>
              )}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: G.text }}>{m.name}</span>
          </div>
        ))}
      </div>

      {/* Section 3 — Trip Board with Voting */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <SectionTitle>Trip Board</SectionTitle>
        <span style={{ fontSize: 11, fontWeight: 600, color: G.textMuted }}>{MOCK_TRIP_BOARD.length} items</span>
      </div>

      {MOCK_TRIP_BOARD.map(item => {
        const myVote = tripVotes[item.id] ?? null
        const upCount = item.votes.up + (myVote === 'up' ? 1 : 0)
        const downCount = item.votes.down + (myVote === 'down' ? 1 : 0)
        const total = upCount + downCount
        const majority = total >= 2 ? (upCount > downCount ? 'yes' : downCount > upCount ? 'no' : 'voting') : 'voting'
        return (
          <div key={item.id} style={{
            padding: 14, borderRadius: 18, marginBottom: 10,
            background: G.surface, border: `1px solid ${G.border}`,
            boxShadow: G.shadowSm,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 16 }}>{item.cat}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: G.text }}>{item.name}</span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: G.textBody, marginBottom: 10 }}>
              {item.source === 'trip-planner' ? 'From Trip Planner' : `Added by ${item.addedBy}`}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                className="gp-press-sm"
                onClick={() => handleVote(item.id, 'up')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '6px 12px', borderRadius: 12,
                  background: myVote === 'up' ? G.accentBg : G.surfaceHover,
                  border: `1px solid ${myVote === 'up' ? G.accent + '44' : G.border}`,
                  color: myVote === 'up' ? G.accent : G.textMuted,
                  fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <ThumbsUp size={13} /> {upCount}
              </button>
              <button
                className="gp-press-sm"
                onClick={() => handleVote(item.id, 'down')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '6px 12px', borderRadius: 12,
                  background: myVote === 'down' ? `${G.red}0d` : G.surfaceHover,
                  border: `1px solid ${myVote === 'down' ? G.red + '44' : G.border}`,
                  color: myVote === 'down' ? G.red : G.textMuted,
                  fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <ThumbsDown size={13} /> {downCount}
              </button>
              <span style={{
                marginLeft: 'auto',
                fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 10,
                background: majority === 'yes' ? G.accentBg : majority === 'no' ? `${G.red}0d` : G.surfaceHover,
                color: majority === 'yes' ? G.accent : majority === 'no' ? G.red : G.textMuted,
              }}>
                {majority === 'yes' ? '✅ Group says YES' : majority === 'no' ? '❌ Group passed' : '🗳 Voting'}
              </span>
            </div>
          </div>
        )
      })}

      <button
        className="gp-press"
        onClick={() => showToast('Coming soon')}
        style={{
          width: '100%', padding: '12px 16px', borderRadius: 14,
          background: G.surfaceHover, border: `1px dashed ${G.border}`,
          color: G.textMuted, fontSize: 13, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
          marginBottom: 24,
        }}
      >+ Add a suggestion</button>

      {/* Section 4 — Collaborative Checkout Checklist */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <SectionTitle>Checkout Checklist</SectionTitle>
        <span style={{ fontSize: 11, fontWeight: 600, color: G.textMuted }}>
          {checklistDoneCount} of {checklist.length} done
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 6, borderRadius: 3, marginBottom: 14,
        background: G.surfaceHover, overflow: 'hidden',
      }}>
        <div style={{
          width: `${(checklistDoneCount / checklist.length) * 100}%`,
          height: '100%', background: G.accent, borderRadius: 3,
          transition: 'width 0.3s',
        }} />
      </div>

      {checklist.map(item => (
        <button
          key={item.id}
          className="gp-press"
          onClick={() => toggleChecklistItem(item.id)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', marginBottom: 8, borderRadius: 14,
            background: G.surface, border: `1px solid ${G.border}`,
            cursor: 'pointer', fontFamily: 'inherit',
            opacity: item.done ? 0.7 : 1,
          }}
        >
          <div style={{
            width: 22, height: 22, borderRadius: 6, flexShrink: 0,
            background: item.done ? G.accent : 'transparent',
            border: item.done ? 'none' : `2px solid ${G.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {item.done && <Check size={14} color="#fff" strokeWidth={3} />}
          </div>
          <span style={{
            flex: 1, textAlign: 'left',
            fontSize: 13, fontWeight: 700,
            color: item.done ? G.textMuted : G.text,
            textDecoration: item.done ? 'line-through' : 'none',
          }}>{item.task}</span>
          {item.done && item.by && (
            <span style={{ fontSize: 10, fontWeight: 600, color: G.textMuted }}>
              ✓ by {item.by}
            </span>
          )}
        </button>
      ))}
    </div>
  )

  const panels: Record<GuestTab, React.ReactNode> = {
    home:     HomePanel,
    guide:    GuidePanel,
    discover: DiscoverPanel,
    services: ServicesPanel,
    trip:     TripPanel,
  }

  const portalContent = (
    <GuestPortalShell
      tab={tab}
      onTabChange={setTab}
      panels={panels}
      banner={
        <div style={{
          background: G.accentBg,
          borderBottom: `1px solid ${G.border}`,
          padding: '9px 16px', textAlign: 'center',
          fontSize: 11, fontWeight: 700, color: G.accent,
          letterSpacing: '0.04em',
          fontFamily: 'var(--font-nunito), var(--font-sans)',
        }}>
          PREVIEW MODE — sample guest experience
        </div>
      }
    />
  )

  return (
    <>
      {/* Phone device frame for desktop viewing */}
      <PhoneFrame
        toast={toast}
        fab={
          <>
            {/* Help menu popover */}
            {helpMenuOpen && (
              <>
                <div
                  onClick={() => setHelpMenuOpen(false)}
                  style={{ position: 'absolute', inset: 0, zIndex: 198 }}
                />
                <div style={{
                  position: 'absolute', bottom: 150, right: 20, zIndex: 200,
                  background: G.surface, borderRadius: 18,
                  boxShadow: G.shadowLg, border: `1px solid ${G.border}`,
                  padding: 6, width: 200,
                  backdropFilter: 'blur(12px)',
                }}>
                  {[
                    { label: 'Emergency', icon: AlertTriangle, color: G.red, rgb: '196,51,51',
                      action: () => { setHelpMenuOpen(false); showToast('Calling emergency...') } },
                    { label: 'Message Host', icon: MessageSquare, color: '#4A9EFF', rgb: '74,158,255',
                      action: () => { setHelpMenuOpen(false); showToast('Coming soon') } },
                    { label: 'Call Host', icon: Phone, color: '#3ECF8E', rgb: '62,207,142',
                      action: () => { setHelpMenuOpen(false); showToast('Coming soon') } },
                    { label: 'Report Issue', icon: Wrench, color: '#FF4D4D', rgb: '255,77,77',
                      action: () => { setHelpMenuOpen(false); setIssueOpen(true) } },
                  ].map(item => {
                    const ItemIcon = item.icon
                    return (
                      <button
                        key={item.label}
                        className="gp-press-sm"
                        onClick={item.action}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 12px', borderRadius: 12,
                          background: 'transparent', border: 'none',
                          cursor: 'pointer', fontFamily: 'inherit',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = G.surfaceHover }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                          background: `rgba(${item.rgb}, 0.1)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <ItemIcon size={16} color={item.color} />
                        </div>
                        <span style={{
                          fontSize: 13, fontWeight: 700,
                          color: item.label === 'Emergency' ? G.red : G.text,
                        }}>{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {/* FAB button */}
            <button
              onClick={() => setHelpMenuOpen(v => !v)}
              className="gp-press-sm"
              style={{
                position: 'absolute', bottom: 90, right: 20, zIndex: 199,
                width: 52, height: 52, borderRadius: '50%',
                background: G.accent, border: 'none',
                boxShadow: `0 6px 20px ${G.accent}66, 0 2px 8px rgba(0,0,0,0.2)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              <MessageCircle size={22} color="#fff" />
            </button>
          </>
        }
      >{portalContent}</PhoneFrame>

      <ReportIssueSheet
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        guidebook={guidebook}
        verification={verif}
      />
    </>
  )
}

// ——— Phone device frame ——————————————————————————————————————
function PhoneFrame({ children, toast, fab }: { children: React.ReactNode; toast: string | null; fab?: React.ReactNode }) {
  return (
    <>
      {/* ── Mobile: direct fullscreen rendering ── */}
      <div className="gp-mobile-shell" style={{
        position: 'fixed', inset: 0,
        display: 'none', flexDirection: 'column',
        fontFamily: 'var(--font-nunito), var(--font-sans)',
        background: G.bg,
      }}>
        {/* Toast notification */}
        <div style={{
          position: 'fixed', left: '50%', top: 48, zIndex: 300,
          transform: `translateX(-50%) translateY(${toast ? '0' : '-20px'})`,
          opacity: toast ? 1 : 0,
          background: G.accent, color: '#fff',
          padding: '12px 20px', borderRadius: 24,
          fontSize: 13, fontWeight: 900,
          boxShadow: `0 8px 24px ${G.accent}66, 0 4px 12px rgba(0,0,0,0.3)`,
          pointerEvents: 'none',
          transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
          whiteSpace: 'nowrap',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Check size={16} /> {toast}
        </div>

        {/* Scrollable content */}
        <div style={{
          flex: 1, overflow: 'auto',
          scrollbarWidth: 'none',
          position: 'relative',
        }}>
          {children}
        </div>

        {/* Floating overlays (FAB) */}
        {fab}
      </div>

      {/* ── Desktop: phone bezel frame ── */}
      <div className="gp-desktop-shell" style={{
        position: 'fixed', inset: 0,
        background: '#0c0d14',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-nunito), var(--font-sans)',
      }}>
        <div style={{
          position: 'absolute', top: 24, left: 0, right: 0,
          textAlign: 'center', fontSize: 13, fontWeight: 600,
          color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em',
        }}>
          Guest Portal Preview
        </div>

        <div
          className="phone-frame-bezel"
          style={{
            position: 'relative',
            width: 390, height: 844,
            borderRadius: 48,
            background: '#1c1d2a',
            border: '3px solid #2a2b3a',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Status bar */}
          <div style={{
            height: 54, flexShrink: 0,
            background: G.bg,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            padding: '0 28px 6px',
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: G.text }}>9:41</span>
            <div style={{
              position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
              width: 120, height: 28, borderRadius: 14,
              background: '#1c1d2a',
            }} />
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M1 8h2v4H1zM5 5h2v7H5zM9 2h2v10H9zM13 0h2v12h-2z" fill={G.text}/></svg>
              <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><path d="M8 3.5a5.5 5.5 0 0 1 3.9 1.6l1.1-1.1A7.5 7.5 0 0 0 8 1.5a7.5 7.5 0 0 0-5 2.5l1.1 1.1A5.5 5.5 0 0 1 8 3.5z" fill={G.text}/><path d="M8 6.5a3 3 0 0 1 2.1.9L11.2 6A5 5 0 0 0 8 4.5 5 5 0 0 0 4.8 6l1.1 1.4A3 3 0 0 1 8 6.5z" fill={G.text}/><circle cx="8" cy="9.5" r="1.5" fill={G.text}/></svg>
              <svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="2" stroke={G.text} strokeOpacity="0.4"/><rect x="2" y="2" width="14" height="8" rx="1" fill={G.accent}/><path d="M22 4.5v3a1.5 1.5 0 0 0 0-3z" fill={G.text} fillOpacity="0.4"/></svg>
            </div>
          </div>

          {/* Toast notification */}
          <div style={{
            position: 'absolute', left: '50%', top: 80, zIndex: 300,
            transform: `translateX(-50%) translateY(${toast ? '0' : '-20px'})`,
            opacity: toast ? 1 : 0,
            background: G.accent, color: '#fff',
            padding: '12px 20px', borderRadius: 24,
            fontSize: 13, fontWeight: 900,
            boxShadow: `0 8px 24px ${G.accent}66, 0 4px 12px rgba(0,0,0,0.3)`,
            pointerEvents: 'none',
            transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
            whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Check size={16} /> {toast}
          </div>

          {/* Scrollable content area */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            scrollbarWidth: 'none',
            position: 'relative',
          }}>
            {children}
          </div>

          {/* Floating overlays (FAB) */}
          {fab}
        </div>
      </div>

      <style>{`
        /* Mobile: show direct shell, hide bezel */
        @media (max-width: 500px) {
          .gp-mobile-shell { display: flex !important; }
          .gp-desktop-shell { display: none !important; }
        }
        /* Desktop: show bezel, hide mobile shell */
        @media (min-width: 501px) {
          .gp-mobile-shell { display: none !important; }
          .gp-desktop-shell { display: flex !important; }
        }
        .gp-mobile-shell::-webkit-scrollbar,
        .gp-mobile-shell *::-webkit-scrollbar,
        .phone-frame-bezel::-webkit-scrollbar,
        .phone-frame-bezel *::-webkit-scrollbar {
          display: none;
        }

        /* ── Press feedback (tap scale) ── */
        .gp-press {
          transition: transform 0.15s cubic-bezier(0.4,0,0.2,1), border-color 0.15s !important;
        }
        .gp-press:active {
          transform: scale(0.98) !important;
        }
        .gp-press-sm {
          transition: transform 0.15s cubic-bezier(0.4,0,0.2,1), background 0.15s, color 0.15s, border-color 0.15s !important;
        }
        .gp-press-sm:active {
          transform: scale(0.94) !important;
        }

        /* ── Category pill pop ── */
        @keyframes cpPop {
          from { transform: scale(1); }
          50% { transform: scale(1.08); }
          to { transform: scale(1.04); }
        }
        .gp-cat-pill {
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1) !important;
        }
        .gp-cat-pill:active {
          transform: scale(0.94) !important;
        }

        /* ── Spinner animation ── */
        @keyframes gpSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .gp-spin {
          animation: gpSpin 1s linear infinite;
        }

        /* ── Panel entry animation ── */
        @keyframes gpPanelUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}

// ——— Local UI helpers ————————————————————————————————————————
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: G.textMuted,
      textTransform: 'uppercase', letterSpacing: '0.08em',
      marginBottom: 12,
    }}>{children}</div>
  )
}

function SectionHeader({
  title, action, onAction,
}: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      margin: '22px 0 10px',
    }}>
      <div style={{ fontSize: 20, fontWeight: 900, color: G.text, letterSpacing: '-0.02em' }}>{title}</div>
      {action && (
        <button
          onClick={onAction}
          className="gp-press-sm"
          style={{
            background: 'none', border: 'none', padding: 0,
            fontSize: 12, fontWeight: 700, color: G.accent,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >{action} →</button>
      )}
    </div>
  )
}

function HorizontalRail({
  children, style,
}: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        display: 'flex', gap: 10,
        overflowX: 'auto', overflowY: 'hidden',
        marginLeft: -20, marginRight: -20,
        padding: '4px 20px 6px',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth',
        ...style,
      }}
    >{children}</div>
  )
}
