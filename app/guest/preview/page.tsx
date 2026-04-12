'use client'
import { useState, useCallback, useEffect } from 'react'
import {
  AlertTriangle, Phone, ChevronRight, ChevronUp, ChevronDown,
  Search, Heart, Check, Star, MapPin, Copy, Bookmark,
  ClipboardList, Plug, KeyRound, ArrowUpDown, HelpCircle,
  MessageSquare, MessageCircle, Wrench, Compass, Gift,
  Users, Map, ShieldAlert, CloudSun, ThumbsUp, ThumbsDown,
  Sparkles, Send, Link2, RefreshCw, Loader2, LogOut, ShoppingCart, Trash2,
  Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Droplets,
  Plane, Plus, Bell, Mail,
  Navigation2, Clock, Car,
  Eye, EyeOff, Lock, Unlock, Shield, FileText, Palmtree,
  X, Camera, ChevronLeft, CreditCard, ArrowLeft,
} from 'lucide-react'
import { GUIDEBOOKS } from '@/lib/data/guidebooks'
import { PROPERTIES } from '@/lib/data/properties'
import { GUEST_VERIFICATIONS } from '@/lib/data/verification'
import { UPSELL_RULES, PROPERTY_GROUPS } from '@/lib/data/upsells'
import type { GuestTheme } from '@/lib/guest/theme'
import { useGuestTheme, GuestThemeProvider } from '@/lib/guest/theme-context'
import { STAY_FORECAST, type DayForecast } from '@/lib/data/weather'
import GuestPortalShell, { GuestTab } from '@/components/guest/GuestPortalShell'

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
    { cat: 'sights',    name: 'Oslo Opera House',     loc: 'Bjørvika · 3 km',       rating: '4.8', reviews: '12,456', url: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=400&h=300&fit=crop', badge: 'LANDMARK', desc: 'Walk on the roof for panoramic fjord views. Free.' },
    { cat: 'nightlife', name: 'Blå',                  loc: 'Grünerløkka · 1.5 km',  rating: '4.3', reviews: '2,108', url: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=400&h=300&fit=crop', badge: 'LIVE MUSIC', desc: 'Live jazz and electronic by the Akerselva river.' },
    { cat: 'shopping',  name: 'Grünerløkka Markets',  loc: 'Grünerløkka · 1 km',    rating: '4.6', reviews: '3,421', url: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&h=300&fit=crop', badge: 'VINTAGE', desc: 'Vintage, vinyl, and local design. Sunday mornings are best.' },
    { cat: 'shopping',  name: 'Aker Brygge',           loc: 'Aker Brygge · 2 km',    rating: '4.4', reviews: '5,891', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop', badge: 'WATERFRONT', desc: 'Waterfront shops and restaurants with fjord views.' },
  ],
  services: [
    { url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=200&fit=crop', label: 'Spa & Wellness' },
    { url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=200&fit=crop', label: 'Private Chef' },
    { url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0afe?w=400&h=200&fit=crop', label: 'Car Rental' },
    { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=200&fit=crop', label: 'Late Checkout' },
  ],
  hostAvatar: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=100&h=100&fit=crop',
}

/* ——— Colored icon config ———————————————————————————————————— */
function getGuideIcons(accent: string): { icon: typeof ClipboardList; color: string; rgb: string }[] {
  return [
    { icon: ClipboardList, color: '#F5A623', rgb: '245,166,35' },   // info — amber
    { icon: Plug,          color: '#4A9EFF', rgb: '74,158,255' },   // access — blue
    { icon: Navigation2,   color: '#3ECF8E', rgb: '62,207,142' },   // transport — green
    { icon: KeyRound,      color: '#4A9EFF', rgb: '74,158,255' },   // access — blue
    { icon: ArrowUpDown,   color: '#F5A623', rgb: '245,166,35' },   // info — amber
    { icon: HelpCircle,    color: accent,    rgb: '91,107,47' },    // status — green
    { icon: Map,           color: accent,    rgb: '91,107,47' },    // status — green
    { icon: ShieldAlert,   color: '#FF4D4D', rgb: '255,77,77' },    // safety — red
  ]
}

function getGuideDetailContent(theme: GuestTheme): Record<string, React.ReactNode> {
  return {
    'House Rules': (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {['Quiet hours 10 PM – 8 AM', 'No smoking indoors', 'Max 2 extra guests', 'Pets allowed (notify host)', 'No parties or events'].map(r => (
          <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 4, height: 4, borderRadius: 2, background: theme.accent, flexShrink: 0 }} />
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
            <span style={{ fontWeight: 800, color: theme.text }}>{a.name}: </span>
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
            <span style={{ fontWeight: 800, color: theme.text }}>{a.name}: </span>
            <span>{a.desc}</span>
          </div>
        ))}
      </div>
    ),
    'Checkout Guide': (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {['Strip beds', 'Start dishwasher', 'Take out trash', 'Close windows', 'Leave keys on counter', 'Lock door (auto-locks)'].map(t => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${theme.border}`, flexShrink: 0 }} />
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
            <div style={{ fontWeight: 800, color: theme.text, marginBottom: 2 }}>{f.q}</div>
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
        <div><span style={{ fontWeight: 800, color: theme.text }}>Fire exit: </span>Main door + balcony</div>
        <div><span style={{ fontWeight: 800, color: theme.text }}>First aid: </span>Under kitchen sink</div>
        <div style={{ padding: '8px 12px', borderRadius: 10, background: `${theme.red}0d` }}>
          <div style={{ fontWeight: 800, color: theme.red, marginBottom: 4 }}>Emergency Numbers</div>
          <div>112 (police) · 113 (ambulance) · 110 (fire)</div>
          <div style={{ marginTop: 4 }}>Lev Collection emergency: +47 900 12 345</div>
        </div>
      </div>
    ),
  }
}

const SUPPORT_ICONS: { icon: typeof MessageSquare; color: string; rgb: string }[] = [
  { icon: MessageSquare, color: '#4A9EFF', rgb: '74,158,255' },
  { icon: Phone,         color: '#3ECF8E', rgb: '62,207,142' },
  { icon: Wrench,        color: '#FF4D4D', rgb: '255,77,77' },
]


const DISCOVER_CATEGORIES = [
  { emoji: '✨', label: 'All',       key: 'all' },
  { emoji: '🍽️', label: 'Food',      key: 'food' },
  { emoji: '☕', label: 'Coffee',    key: 'coffee' },
  { emoji: '📸', label: 'Sights',    key: 'sights' },
  { emoji: '🌲', label: 'Outdoors',  key: 'outdoors' },
  { emoji: '🌙', label: 'Nightlife', key: 'nightlife' },
  { emoji: '⛵', label: 'Activities', key: 'activity' },
  { emoji: '🛍', label: 'Shopping',   key: 'shopping' },
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

/* ——— Departure & Getting There mock data ————————————————————— */
const MOCK_DEPARTURE = {
  flightTime: '14:30',
  flightNumber: 'SK1473',
  airline: 'SAS',
  destination: 'Stockholm (ARN)',
  terminal: 'T2',
  gate: 'B22',
  checkoutTime: '11:00',
  travelMinutes: 60,
  bufferHours: 2,
  departureDate: 'Thu Mar 27',
}

const MOCK_ARRIVAL_FLIGHT = {
  flightNumber: 'SK1472',
  airline: 'SAS',
  from: 'Stockholm (ARN)',
  arrivalTime: '14:10',
  terminal: 'T2',
  gate: 'A15',
  arrivalDate: 'Sat Mar 22',
}

const GETTING_THERE_DATA = {
  airport: {
    title: 'From Oslo Airport (Gardermoen)',
    options: [
      { mode: 'Flytoget (express train)', time: '20 min', cost: '~220 NOK', icon: '🚄' },
      { mode: 'Airport bus (Flybussen)', time: '45 min', cost: '~190 NOK', icon: '🚌' },
      { mode: 'Taxi / Uber', time: '~45 min', cost: '600–900 NOK', icon: '🚕' },
    ],
    lastMile: 'From Oslo S → Walk 12 min or Tram 17 to Grünerløkka (8 min)',
  },
  train: {
    title: 'From Oslo Central Station (Oslo S)',
    options: [
      { mode: 'Walk via Karl Johans gate', time: '12 min', cost: 'Free', icon: '🚶' },
      { mode: 'Tram 17 to Grünerløkka', time: '8 min', cost: '~40 NOK', icon: '🚋' },
    ],
    lastMile: null,
  },
  local: {
    title: 'Driving to the property',
    options: [
      { mode: 'Street parking (metered)', time: '', cost: '30 NOK/hr', icon: '🅿️' },
      { mode: 'Basement spot B14', time: '', cost: 'Included', icon: '🏠' },
    ],
    lastMile: null,
  },
}

const PROPERTY_ADDRESS = 'Thorvald Meyers gate 15, 0555 Oslo'

const WIFI_PASSWORD = 'SunsetGuest2026!'

const GETTING_THERE_DEPARTURE_DATA = {
  airport: {
    title: 'To Oslo Airport (Gardermoen)',
    options: [
      { mode: 'Flytoget (express train)', time: '20 min', cost: '~220 NOK', icon: '🚄' },
      { mode: 'Airport bus (Flybussen)', time: '45 min', cost: '~190 NOK', icon: '🚌' },
      { mode: 'Taxi / Uber', time: '~45 min', cost: '600–900 NOK', icon: '🚕' },
    ],
    lastMile: 'Tram 17 from Grünerløkka to Oslo S (8 min) → Flytoget platform',
  },
  train: {
    title: 'To Oslo Central Station (Oslo S)',
    options: [
      { mode: 'Walk via Karl Johans gate', time: '12 min', cost: 'Free', icon: '🚶' },
      { mode: 'Tram 17 from Grünerløkka', time: '8 min', cost: '~40 NOK', icon: '🚋' },
    ],
    lastMile: null,
  },
  local: {
    title: 'Driving from the property',
    options: [
      { mode: 'Return parking spot B14', time: '', cost: 'Keys on hook', icon: '🏠' },
      { mode: 'Street parking ends', time: '', cost: 'Check meter', icon: '🅿️' },
    ],
    lastMile: null,
  },
}

const UPSELL_CATEGORY_ICON: Record<string, { icon: typeof Clock; color: string; rgb: string }> = {
  arrival:    { icon: Clock,   color: '#4A9EFF', rgb: '74,158,255' },
  departure:  { icon: LogOut,  color: '#F5A623', rgb: '245,166,35' },
  transport:  { icon: Car,     color: '#3ECF8E', rgb: '62,207,142' },
  experience: { icon: Compass, color: '#A855F7', rgb: '168,85,247' },
  extras:     { icon: Gift,    color: '#EC4899', rgb: '236,72,153' },
}

const MOCK_DEPARTURE_FLIGHTS = [
  { id: 'd1', name: 'Emma',   flight: 'SK1473', airline: 'SAS',       to: 'Stockholm (ARN)', departing: 'Mar 27, 14:30', terminal: 'T2', gate: 'B22', status: 'confirmed' as const },
  { id: 'd2', name: 'Marcus', flight: 'DY1803', airline: 'Norwegian', to: 'Berlin (BER)',    departing: 'Mar 27, 16:45', terminal: 'T1', gate: 'D12', status: 'confirmed' as const },
  { id: 'd3', name: 'Lin',    flight: null,      airline: null,        to: null,              departing: null,            terminal: null, gate: null,  status: 'pending'   as const },
]

const MOCK_CHAT_MESSAGES = [
  { id: 'c1', from: 'host' as const, text: 'Hi Emma! Welcome to Oslo 🇳🇴 Let me know if you need anything before check-in.', time: '10:15 AM' },
  { id: 'c2', from: 'guest' as const, text: 'Thanks! Is there any chance we could check in a bit early? Our flight lands at 14:10.', time: '10:22 AM' },
  { id: 'c3', from: 'host' as const, text: 'Absolutely! The previous guest checked out early, so the place will be ready by 13:00. I\'ll send you the door code once it\'s cleaned.', time: '10:25 AM' },
  { id: 'c4', from: 'guest' as const, text: 'That\'s perfect! Thank you so much 🙏', time: '10:26 AM' },
  { id: 'c5', from: 'host' as const, text: 'You\'re welcome! The door code is 4821. Have a great trip!', time: '10:30 AM' },
]

const CHAT_QUICK_REPLIES = [
  'What time is check-in?',
  'Where do I park?',
  'Is early check-in possible?',
  'How does the WiFi work?',
]

/* ——— Our Trip mock data ——————————————————————————————————— */
const MOCK_GROUP = [
  { name: 'Emma',   role: 'host'  as const, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face', email: 'emma.lindqvist@gmail.com', phone: '+46 70 123 4567' },
  { name: 'Marcus', role: 'guest' as const, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', email: 'marcus.weber@outlook.de', phone: '+49 170 987 6543' },
  { name: 'Lin',    role: 'guest' as const, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', email: 'lin.chen@icloud.com', phone: '+86 138 0013 8000' },
]

const MOCK_TRIP_BOARD = [
  { id: 'tb1', name: 'Maemo', cat: '🍽', addedBy: 'Emma', source: 'trip-planner' as const, votes: { up: 3, down: 0 },
    location: 'Grünerløkka · 1.2 km', pricePerPax: '~$180', desc: 'Michelin-starred Nordic tasting menu. Book 2 weeks ahead.' },
  { id: 'tb2', name: 'Fjord Kayaking', cat: '⛵', addedBy: 'Marcus', source: 'manual' as const, votes: { up: 2, down: 1 },
    location: 'Aker Brygge · 2.5 km', pricePerPax: '~$65', desc: '2-hour guided kayak on the Oslofjord. All gear included.' },
  { id: 'tb3', name: 'Bar Boca', cat: '🌙', addedBy: 'Lin', source: 'manual' as const, votes: { up: 1, down: 2 },
    location: 'Grünerløkka · 1.5 km', pricePerPax: '~$25', desc: 'Relaxed cocktail bar with a Latin-inspired menu.' },
  { id: 'tb4', name: 'Nordmarka Trails', cat: '🌲', addedBy: 'Emma', source: 'trip-planner' as const, votes: { up: 3, down: 0 },
    location: 'Frognerseteren · 6 km', pricePerPax: 'Free', desc: 'Forest trails 30 min from the city. Bring layers.' },
]

const MOCK_FLIGHTS = [
  { id: 'f1', name: 'Emma',   flight: 'SK1472', airline: 'SAS',       from: 'Stockholm (ARN)', arriving: 'Mar 22, 15:30', terminal: 'T2', gate: 'A15', status: 'confirmed' as const },
  { id: 'f2', name: 'Marcus', flight: 'DY1802', airline: 'Norwegian', from: 'Berlin (BER)',    arriving: 'Mar 22, 17:10', terminal: 'T1', gate: 'C08', status: 'confirmed' as const },
  { id: 'f3', name: 'Lin',    flight: null,      airline: null,        from: null,              arriving: null,            terminal: null, gate: null,  status: 'pending'   as const },
]

const MOCK_PACKING_INIT = [
  { id: 'p1', item: 'Sunscreen SPF 50', checked: true, addedBy: 'Emma' },
  { id: 'p2', item: 'Power bank', checked: false, addedBy: 'Marcus' },
  { id: 'p3', item: 'Hiking boots', checked: false, addedBy: 'Emma' },
  { id: 'p4', item: 'Rain jacket', checked: true, addedBy: 'Lin' },
  { id: 'p5', item: 'Scuba gear (rental confirmed)', checked: false, addedBy: 'Marcus' },
]

const MOCK_CHECKOUT_CHECKLIST = [
  { id: 'co1', item: 'Return all keys & remotes', checked: false },
  { id: 'co2', item: 'Lock all doors and windows', checked: false },
  { id: 'co3', item: 'Start the dishwasher', checked: false },
  { id: 'co4', item: 'Take out trash to designated area', checked: false },
  { id: 'co5', item: 'Set thermostat to 20°C', checked: false },
  { id: 'co6', item: 'Check for personal belongings', checked: false },
]

const ISSUE_CATEGORIES = ['Plumbing', 'Heating', 'Appliance', 'Cleanliness', 'Electrical', 'Other'] as const

const REVIEW_CATEGORIES = ['Cleanliness', 'Communication', 'Location', 'Value', 'Check-in', 'Accuracy'] as const

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
export default function GuestPortalPreviewPage() {
  return (
    <GuestThemeProvider>
      <GuestPortalPreview />
    </GuestThemeProvider>
  )
}

function GuestPortalPreview() {
  const { theme: G } = useGuestTheme()
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
  const [cartOpen, setCartOpen] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [wifiConnected, setWifiConnected] = useState(false)
  const [heroIdx, setHeroIdx] = useState(0)

  // Trip Planner state
  const [tripPlannerState, setTripPlannerState] = useState<'collapsed' | 'questions' | 'loading' | 'results'>('collapsed')
  const [tripInterests, setTripInterests] = useState<Set<string>>(new Set())
  const [tripFirstTime, setTripFirstTime] = useState<string | null>(null)
  const [tripSaved, setTripSaved] = useState<Set<string>>(new Set())

  // Getting There / Departure state
  const [travelMode, setTravelMode] = useState<'airport' | 'train' | 'local' | null>(null)
  const [gettingThereOpen, setGettingThereOpen] = useState(false)
  const [departureOpen, setDepartureOpen] = useState(false)

  // Discover search
  const [discoverSearch, setDiscoverSearch] = useState('')

  // WiFi expanded state
  const [wifiExpanded, setWifiExpanded] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)

  // Chat state
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState(MOCK_CHAT_MESSAGES)
  const [chatInput, setChatInput] = useState('')
  const [chatTyping, setChatTyping] = useState(false)

  // Trip flights collapsible
  const [arrivingOpen, setArrivingOpen] = useState(true)
  const [departingOpen, setDepartingOpen] = useState(true)

  // Verification flow
  const [verificationComplete, setVerificationComplete] = useState(false)
  const [verificationStep, setVerificationStep] = useState(0)
  const [showVerification, setShowVerification] = useState(false)

  // Our Trip state
  const [tripVotes, setTripVotes] = useState<Record<string, 'up' | 'down' | null>>({})
  const [flightInput, setFlightInput] = useState('')
  const [flightTimeInput, setFlightTimeInput] = useState('')
  const [addedFlight, setAddedFlight] = useState<{ code: string; airline: string; from: string; arriving: string; terminal: string; gate: string } | null>(null)
  const [packingList, setPackingList] = useState(MOCK_PACKING_INIT)
  const [packingInput, setPackingInput] = useState('')

  // Checkout checklist state
  const [checkoutList, setCheckoutList] = useState(MOCK_CHECKOUT_CHECKLIST)

  // Mid-stay check-in state
  const [midStayRating, setMidStayRating] = useState<number | null>(null)
  const [midStaySubmitted, setMidStaySubmitted] = useState(false)

  // WiFi QR code state
  const [wifiQrVisible, setWifiQrVisible] = useState(false)

  // Review & Feedback state
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewRatings, setReviewRatings] = useState<Record<string, number>>({})
  const [reviewText, setReviewText] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  // Structured issue reporting state
  const [issueCategory, setIssueCategory] = useState<string | null>(null)
  const [issueDesc, setIssueDesc] = useState('')
  const [issuePte, setIssuePte] = useState(false)

  const guestName = verif?.guestName?.split(' ')[0] ?? 'Sarah'
  const ssid = `${guidebook.propertyName.replace(/\s+/g, '')}_5G`

  // Computed leave-by time for departure nudge
  const leaveByTime = (() => {
    const [h, m] = MOCK_DEPARTURE.flightTime.split(':').map(Number)
    const total = h * 60 + m - MOCK_DEPARTURE.travelMinutes - MOCK_DEPARTURE.bufferHours * 60
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
  })()

  // Cart derived state
  const cartItems = upsells.filter(u => addedServices.has(u.id))
  const cartTotal = cartItems.reduce((sum, u) => sum + u.price, 0)

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

  const togglePackingItem = useCallback((id: string) => {
    setPackingList(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }, [])

  const toggleCheckoutItem = useCallback((id: string) => {
    setCheckoutList(prev => {
      const next = prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
      if (next.every(item => item.checked)) {
        showToast('All done! Have a great trip home ✓')
      }
      return next
    })
  }, [showToast])

  const addPackingItem = useCallback(() => {
    const trimmed = packingInput.trim()
    if (!trimmed) return
    setPackingList(prev => [
      ...prev,
      { id: `p${Date.now()}`, item: trimmed, checked: false, addedBy: guestName },
    ])
    setPackingInput('')
  }, [packingInput, guestName])

  const sendChatMessage = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const newMsg = { id: `c${Date.now()}`, from: 'guest' as const, text: trimmed, time: 'Just now' }
    setChatMessages(prev => [...prev, newMsg])
    setChatInput('')
    setChatTyping(true)
    setTimeout(() => {
      setChatTyping(false)
      setChatMessages(prev => [...prev, {
        id: `c${Date.now()}`,
        from: 'host' as const,
        text: 'Thanks for your message! I\'ll get back to you shortly 😊',
        time: 'Just now',
      }])
    }, 1500)
  }, [])

  const handleCheckout = useCallback(() => {
    setCheckingOut(true)
    setTimeout(() => {
      setCheckingOut(false)
      setAddedServices(new Set())
      setCartOpen(false)
      showToast('Order confirmed ✓')
    }, 800)
  }, [showToast])

  const filteredDiscover = (activeCat === 'all'
    ? PREVIEW_IMAGES.discover
    : PREVIEW_IMAGES.discover.filter(r => r.cat === activeCat)
  ).filter(r => !discoverSearch ||
    r.name.toLowerCase().includes(discoverSearch.toLowerCase()) ||
    r.desc.toLowerCase().includes(discoverSearch.toLowerCase())
  )

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

      <div className="gp-section-enter" style={{ padding: '20px 20px 0' }}>
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

        {/* Locked Check-in Banner — shown when verification incomplete */}
        {!verificationComplete && (
          <button
            className="gp-press"
            onClick={() => setShowVerification(true)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: 16, marginBottom: 16, borderRadius: 18,
              background: `${G.amber}0a`,
              border: `1px solid ${G.amber}22`,
              boxShadow: G.shadowSm,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: `${G.amber}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Lock size={18} color={G.amber} />
            </div>
            <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: G.text }}>Check-in Instructions Locked</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: G.textMuted, marginTop: 2, lineHeight: 1.4 }}>
                Complete verification to unlock door codes, access details, and check-in instructions
              </div>
            </div>
            <ChevronRight size={16} color={G.textFaint} />
          </button>
        )}

        {/* Weather Forecast Card */}
        <div style={{
          padding: 16, borderRadius: 18, marginBottom: 16,
          background: G.surface, border: `1px solid ${G.border}`,
          boxShadow: G.shadowSm,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Sun size={16} color="#F5A623" />
            <span style={{ fontSize: 14, fontWeight: 800, color: G.text }}>Your Stay Weather</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: G.textMuted }}>· Oslo</span>
          </div>
          <HorizontalRail style={{ marginBottom: STAY_FORECAST.some(d => d.alert) ? 12 : 0, gap: 8 }}>
            {STAY_FORECAST.map((day, i) => {
              const isToday = i === 0
              return (
                <div key={day.date} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 6, padding: '8px 6px', borderRadius: 14,
                  minWidth: 56, flexShrink: 0,
                  background: isToday ? G.accentBg : G.surfaceHover,
                  border: isToday ? `1.5px solid ${G.accent}44` : '1.5px solid transparent',
                }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                    color: isToday ? G.accent : G.textMuted,
                  }}>
                    {isToday ? 'Today' : day.dayOfWeek}
                  </span>
                  <WeatherIcon condition={day.condition} size={22} />
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: G.text }}>{day.high}°</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: G.textMuted }}>{day.low}°</span>
                  </div>
                  {day.precipChance > 30 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Droplets size={10} color="#4A9EFF" />
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#4A9EFF' }}>{day.precipChance}%</span>
                    </div>
                  )}
                </div>
              )
            })}
          </HorizontalRail>
          {STAY_FORECAST.filter(d => d.alert).map(day => (
            <div key={day.date} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', borderRadius: 10, marginTop: 8,
              background: 'rgba(194,118,43,0.06)',
            }}>
              <AlertTriangle size={14} color="#C2762B" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: G.textBody }}>
                {day.dayOfWeek}: {day.alert}
              </span>
            </div>
          ))}
        </div>

        {/* Mid-Stay Check-in */}
        <div style={{
          padding: 16, borderRadius: 18, marginBottom: 16,
          background: G.surface, border: `1px solid ${G.border}`,
          boxShadow: G.shadowSm,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Star size={16} color="#FFC107" />
            <span style={{ fontSize: 14, fontWeight: 800, color: G.text }}>How&apos;s your stay so far?</span>
          </div>
          {midStaySubmitted ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: G.textBody }}>Thanks for the feedback!</span>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={16} color={s <= (midStayRating ?? 0) ? '#FFC107' : G.textFaint} fill={s <= (midStayRating ?? 0) ? '#FFC107' : 'none'} />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    className="gp-press-sm"
                    onClick={() => setMidStayRating(s)}
                    style={{
                      background: 'none', border: 'none', padding: 4,
                      cursor: 'pointer', transition: 'transform 0.15s',
                      transform: midStayRating === s ? 'scale(1.2)' : 'scale(1)',
                    }}
                  >
                    <Star size={28} color={s <= (midStayRating ?? 0) ? '#FFC107' : G.textFaint} fill={s <= (midStayRating ?? 0) ? '#FFC107' : 'none'} />
                  </button>
                ))}
              </div>
              {midStayRating !== null && (
                <button
                  className="gp-press"
                  onClick={() => {
                    setMidStaySubmitted(true)
                    if (midStayRating <= 2) showToast("We're sorry — your host has been notified")
                    else if (midStayRating === 3) showToast('Thank you for your feedback')
                    else showToast('Glad you\'re enjoying it! ✓')
                  }}
                  style={{
                    padding: '10px 20px', borderRadius: 999,
                    background: G.accent, color: G.accentFg, border: 'none',
                    fontSize: 13, fontWeight: 800, cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >Submit</button>
              )}
            </>
          )}
        </div>

        {/* Trip Planner — Inline Expansion */}
        {tripPlannerState === 'collapsed' && (
          <button
            className="gp-press"
            onClick={() => setTripPlannerState('questions')}
            style={{
              width: '100%', padding: 18, borderRadius: 18,
              background: G.accentBg,
              border: `1px solid ${G.accent}33`,
              boxShadow: `0 4px 16px ${G.accent}15`,
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
            padding: 18, borderRadius: 18, marginBottom: 18,
            background: G.surface, border: `1px solid ${G.border}`,
            boxShadow: G.shadowMd,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Sparkles size={18} color={G.accent} />
              <span style={{ flex: 1, fontSize: 16, fontWeight: 900, color: G.text }}>Plan Your Trip</span>
              <button className="gp-press-sm"
                onClick={() => setTripPlannerState('collapsed')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '5px 12px', borderRadius: 10,
                  background: G.surfaceHover, border: `1px solid ${G.border}`,
                  fontSize: 11, fontWeight: 700, color: G.textMuted,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <ChevronUp size={12} /> Minimize
              </button>
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
            padding: 40, borderRadius: 18, marginBottom: 18,
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
            padding: 18, borderRadius: 18, marginBottom: 18,
            background: G.surface, border: `1px solid ${G.border}`,
            boxShadow: G.shadowMd,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Sparkles size={18} color={G.accent} />
              <span style={{ flex: 1, fontSize: 16, fontWeight: 900, color: G.text }}>Your Top Picks</span>
              <button
                className="gp-press-sm"
                onClick={() => setTripPlannerState('collapsed')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '5px 12px', borderRadius: 10,
                  background: G.surfaceHover, border: `1px solid ${G.border}`,
                  fontSize: 11, fontWeight: 700, color: G.textMuted,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <ChevronUp size={12} /> Minimize
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

        {/* Getting There — compact when travelMode set, full selector when not */}
        <div style={{
          borderRadius: 18, marginBottom: 18, overflow: 'hidden',
          background: G.surface, border: `1px solid ${gettingThereOpen ? G.accent + '33' : G.border}`,
          boxShadow: G.shadowSm, transition: 'border-color 0.15s',
        }}>
          <button
            className="gp-press"
            onClick={() => setGettingThereOpen(v => !v)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: 14, cursor: 'pointer', fontFamily: 'inherit',
              background: 'transparent', border: 'none',
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 14, flexShrink: 0,
              background: 'rgba(62,207,142,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Navigation2 size={22} color="rgba(62,207,142,0.7)" />
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: G.text }}>Getting There</span>
                {travelMode && !gettingThereOpen && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                    background: G.accentBg, color: G.accent, border: `1px solid ${G.accent}33`,
                  }}>
                    {travelMode === 'airport' ? '✈️ Airport' : travelMode === 'train' ? '🚆 Train' : '🚗 Driving'}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: G.textBody, marginTop: 2 }}>
                {travelMode && !gettingThereOpen ? 'Tap to change transport mode' : 'Directions · Transport options'}
              </div>
            </div>
            {gettingThereOpen
              ? <ChevronDown size={18} color={G.accent} style={{ transform: 'rotate(180deg)', transition: 'transform 0.2s' }} />
              : <ChevronRight size={18} color={G.textFaint} />
            }
          </button>
          {gettingThereOpen && (
            <div style={{
              padding: '0 16px 16px',
              fontSize: 12, fontWeight: 600, color: G.textBody,
              lineHeight: 1.55,
            }}>
              {/* Pill selector */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                {([
                  { key: 'airport' as const, label: '✈️ Airport' },
                  { key: 'train' as const, label: '🚆 Train Station' },
                  { key: 'local' as const, label: '🚗 Local / Driving' },
                ]).map(opt => (
                  <button
                    key={opt.key}
                    className="gp-press-sm"
                    onClick={() => setTravelMode(travelMode === opt.key ? null : opt.key)}
                    style={{
                      padding: '7px 14px', borderRadius: 999,
                      background: travelMode === opt.key ? G.accent : G.surfaceHover,
                      color: travelMode === opt.key ? '#fff' : G.textBody,
                      border: travelMode === opt.key ? 'none' : `1px solid ${G.border}`,
                      fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'all 0.2s',
                    }}
                  >{opt.label}</button>
                ))}
              </div>

              {/* Route cards */}
              {travelMode && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: G.text, marginBottom: 4 }}>
                    {GETTING_THERE_DATA[travelMode].title}
                  </div>
                  {GETTING_THERE_DATA[travelMode].options.map(opt => (
                    <div key={opt.mode} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 12,
                      background: G.surfaceHover, border: `1px solid ${G.border}`,
                    }}>
                      <span style={{ fontSize: 18 }}>{opt.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: G.text }}>{opt.mode}</div>
                        {opt.time && (
                          <div style={{ fontSize: 11, fontWeight: 600, color: G.textMuted, marginTop: 2 }}>{opt.time}</div>
                        )}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: G.accent }}>{opt.cost}</div>
                    </div>
                  ))}

                  {/* Last mile */}
                  {GETTING_THERE_DATA[travelMode].lastMile && (
                    <div style={{
                      padding: '10px 12px', borderRadius: 12,
                      background: G.accentBg, border: `1px solid ${G.accent}22`,
                      fontSize: 11, fontWeight: 600, color: G.textBody,
                    }}>
                      🚶 {GETTING_THERE_DATA[travelMode].lastMile}
                    </div>
                  )}
                </div>
              )}

              {/* Departure directions */}
              {travelMode && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginTop: 4,
                  }}>
                    <div style={{ flex: 1, height: 1, background: G.border }} />
                    <span style={{
                      fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: G.textMuted,
                      textTransform: 'uppercase',
                    }}>DEPARTURE</span>
                    <div style={{ flex: 1, height: 1, background: G.border }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: G.text, marginBottom: 4 }}>
                    {GETTING_THERE_DEPARTURE_DATA[travelMode].title}
                  </div>
                  {GETTING_THERE_DEPARTURE_DATA[travelMode].options.map(opt => (
                    <div key={opt.mode} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 12,
                      background: G.surfaceHover, border: `1px solid ${G.border}`,
                    }}>
                      <span style={{ fontSize: 18 }}>{opt.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: G.text }}>{opt.mode}</div>
                        {opt.time && (
                          <div style={{ fontSize: 11, fontWeight: 600, color: G.textMuted, marginTop: 2 }}>{opt.time}</div>
                        )}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: G.accent }}>{opt.cost}</div>
                    </div>
                  ))}
                  {GETTING_THERE_DEPARTURE_DATA[travelMode].lastMile && (
                    <div style={{
                      padding: '10px 12px', borderRadius: 12,
                      background: G.accentBg, border: `1px solid ${G.accent}22`,
                      fontSize: 11, fontWeight: 600, color: G.textBody,
                    }}>
                      🚶 {GETTING_THERE_DEPARTURE_DATA[travelMode].lastMile}
                    </div>
                  )}
                  {travelMode === 'airport' && (
                    <button
                      className="gp-press"
                      onClick={() => toggleAddService('ur3')}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '10px 16px', borderRadius: 999,
                        background: addedServices.has('ur3') ? G.accentBg : G.accent,
                        color: addedServices.has('ur3') ? G.accent : G.accentFg,
                        border: addedServices.has('ur3') ? `1px solid ${G.accent}44` : 'none',
                        fontSize: 12, fontWeight: 800, cursor: 'pointer',
                        fontFamily: 'inherit', transition: 'all 0.2s',
                      }}
                    >
                      <Car size={14} />
                      {addedServices.has('ur3') ? 'Transfer Added ✓' : 'Book Airport Transfer — 850 NOK'}
                    </button>
                  )}
                </div>
              )}

              {/* Address pin */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 12px', borderRadius: 12,
                background: G.surfaceHover, border: `1px solid ${G.border}`,
              }}>
                <MapPin size={14} color={G.accent} />
                <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: G.text }}>{PROPERTY_ADDRESS}</span>
                <button
                  className="gp-press-sm"
                  onClick={() => copyToClipboard(PROPERTY_ADDRESS, 'Address')}
                  style={{
                    padding: '4px 10px', borderRadius: 8,
                    background: G.accentBg, border: 'none',
                    fontSize: 10, fontWeight: 700, color: G.accent,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <Copy size={10} /> Copy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Plan Your Departure — expandable section */}
        <div style={{
          borderRadius: 18, marginBottom: 18, overflow: 'hidden',
          background: G.surface, border: `1px solid ${G.border}`,
          boxShadow: G.shadowSm,
        }}>
          <button
            className="gp-press"
            onClick={() => setDepartureOpen(v => !v)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: 16, background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'rgba(245,166,35,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Plane size={18} color="#F5A623" style={{ transform: 'rotate(45deg)' }} />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: G.text }}>Plan Your Departure</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: G.textMuted }}>
                {MOCK_DEPARTURE.departureDate} · Checkout {MOCK_DEPARTURE.checkoutTime}
              </div>
            </div>
            {travelMode !== null && (
              <span style={{
                fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 8,
                background: G.accentBg, color: G.accent,
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                {travelMode === 'airport' ? 'Flight' : travelMode === 'train' ? 'Train' : 'Local'}
              </span>
            )}
            {departureOpen
              ? <ChevronUp size={16} color={G.textMuted} />
              : <ChevronDown size={16} color={G.textMuted} />
            }
          </button>

          {departureOpen && (
            <div style={{ padding: '0 16px 16px' }}>
              {travelMode === null ? (
                <div style={{
                  padding: '12px 14px', borderRadius: 12,
                  background: G.surfaceHover, border: `1px solid ${G.border}`,
                  fontSize: 12, fontWeight: 600, color: G.textMuted, textAlign: 'center',
                }}>
                  Select your travel mode in Getting There first
                </div>
              ) : (
                <>
                  {travelMode === 'airport' && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 12, marginBottom: 10,
                      background: G.surfaceHover, border: `1px solid ${G.border}`,
                    }}>
                      <Plane size={14} color={G.accent} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: G.text }}>
                          {MOCK_DEPARTURE.airline} {MOCK_DEPARTURE.flightNumber} → {MOCK_DEPARTURE.destination}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: G.textMuted }}>
                          Departs {MOCK_DEPARTURE.flightTime} · {MOCK_DEPARTURE.terminal} · Gate {MOCK_DEPARTURE.gate}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Leave-by nudge */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 12px', borderRadius: 12, marginBottom: 12,
                    background: `${G.amber}0a`, border: `1px solid ${G.amber}22`,
                  }}>
                    <AlertTriangle size={14} color={G.amber} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: G.amber }}>
                      Leave by {leaveByTime} to make your {travelMode === 'airport' ? 'flight' : 'departure'}
                    </span>
                  </div>

                  {/* Quick actions */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="gp-press-sm"
                      onClick={() => setGettingThereOpen(true)}
                      style={{
                        flex: 1, padding: '10px 12px', borderRadius: 12,
                        background: G.surfaceHover, border: `1px solid ${G.border}`,
                        fontSize: 11, fontWeight: 700, color: G.text,
                        cursor: 'pointer', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}
                    >
                      <Navigation2 size={12} color={G.accent} /> Get Directions
                    </button>
                    {travelMode === 'airport' && (
                      <button
                        className="gp-press-sm"
                        onClick={() => toggleAddService('ur3')}
                        style={{
                          flex: 1, padding: '10px 12px', borderRadius: 12,
                          background: addedServices.has('ur3') ? G.accentBg : G.accent,
                          color: addedServices.has('ur3') ? G.accent : G.accentFg,
                          border: addedServices.has('ur3') ? `1px solid ${G.accent}44` : 'none',
                          fontSize: 11, fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'inherit',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}
                      >
                        <Car size={12} /> {addedServices.has('ur3') ? 'Transfer Added ✓' : 'Book Transfer'}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
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
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: G.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>WiFi Network</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: G.text }}>{ssid}</div>
              <Copy size={10} color={G.accent} />
            </div>
          </button>
          <button
            className="gp-press"
            onClick={() => {
              if (verificationComplete) {
                copyToClipboard('4821', 'Door code')
              } else {
                setShowVerification(true)
              }
            }}
            style={{
              background: verificationComplete ? `${G.accent}0a` : G.surfaceHover,
              borderRadius: 18, padding: 12,
              boxShadow: G.shadowSm,
              border: `1px solid ${verificationComplete ? `${G.accent}1a` : G.border}`,
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: verificationComplete ? `${G.accent}99` : G.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>Door Code</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {verificationComplete ? (
                <>
                  <div style={{ fontSize: 22, fontWeight: 900, color: G.accent, letterSpacing: '0.14em' }}>4821</div>
                  <span style={{ fontSize: 14 }}>🔑</span>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 22, fontWeight: 900, color: G.textMuted, letterSpacing: '0.14em' }}>••••</div>
                  <Lock size={14} color={G.textMuted} />
                </>
              )}
            </div>
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <div style={{
            background: G.surface, borderRadius: 18, padding: 12, textAlign: 'center',
            boxShadow: G.shadowSm, border: `1px solid ${G.border}`,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: G.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>Check-in</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: G.text }}>15:00</div>
            <div style={{ fontSize: 9, fontWeight: 600, color: G.textMuted, marginTop: 2 }}>Sat Mar 22</div>
          </div>
          <div style={{
            background: G.surface, borderRadius: 18, padding: 12, textAlign: 'center',
            boxShadow: G.shadowSm, border: `1px solid ${G.border}`,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: G.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>Check-out</div>
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

        {/* WiFi expandable card */}
        <div style={{
          borderRadius: 18, marginBottom: 18, overflow: 'hidden',
          background: G.surface, border: `1px solid ${wifiExpanded ? G.accent + '33' : G.border}`,
          boxShadow: G.shadowSm, transition: 'border-color 0.15s',
        }}>
          <button
            className="gp-press"
            onClick={() => setWifiExpanded(v => !v)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', cursor: 'pointer', fontFamily: 'inherit',
              background: 'transparent', border: 'none',
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: G.accentBg, border: `1px solid ${G.accent}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
            }}>📶</div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: G.text }}>{ssid}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: G.textMuted, marginTop: 1 }}>
                {wifiExpanded ? 'WiFi details' : 'Tap for password & instructions'}
              </div>
            </div>
            {wifiExpanded
              ? <ChevronDown size={16} color={G.accent} style={{ transform: 'rotate(180deg)', transition: 'transform 0.2s' }} />
              : <ChevronRight size={16} color={G.textFaint} />
            }
          </button>
          {wifiExpanded && (
            <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* SSID row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', borderRadius: 12,
                background: G.surfaceHover, border: `1px solid ${G.border}`,
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: G.textMuted, width: 52 }}>SSID</span>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 800, color: G.text }}>{ssid}</span>
                <button
                  className="gp-press-sm"
                  onClick={() => copyToClipboard(ssid, 'SSID')}
                  style={{
                    padding: '4px 8px', borderRadius: 6,
                    background: G.accentBg, border: 'none',
                    fontSize: 10, fontWeight: 700, color: G.accent,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                ><Copy size={10} /> Copy</button>
              </div>
              {/* Password row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', borderRadius: 12,
                background: G.surfaceHover, border: `1px solid ${G.border}`,
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: G.textMuted, width: 52 }}>Pass</span>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 800, color: G.text, letterSpacing: passwordVisible ? '0' : '0.12em' }}>
                  {passwordVisible ? WIFI_PASSWORD : '••••••••••'}
                </span>
                <button
                  className="gp-press-sm"
                  onClick={() => setPasswordVisible(v => !v)}
                  style={{
                    padding: 4, borderRadius: 6,
                    background: 'transparent', border: 'none',
                    cursor: 'pointer', display: 'flex',
                  }}
                >
                  {passwordVisible ? <EyeOff size={14} color={G.textMuted} /> : <Eye size={14} color={G.textMuted} />}
                </button>
                <button
                  className="gp-press-sm"
                  onClick={() => copyToClipboard(WIFI_PASSWORD, 'Password')}
                  style={{
                    padding: '4px 8px', borderRadius: 6,
                    background: G.accentBg, border: 'none',
                    fontSize: 10, fontWeight: 700, color: G.accent,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                ><Copy size={10} /> Copy</button>
              </div>
              {/* Instructions */}
              <div style={{
                padding: '10px 12px', borderRadius: 12,
                background: G.accentBg, border: `1px solid ${G.accent}22`,
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: G.accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  How to connect
                </div>
                {[
                  `1. Open Settings → WiFi`,
                  `2. Select "${ssid}"`,
                  `3. Enter password`,
                  `4. Done!`,
                ].map(step => (
                  <div key={step} style={{ fontSize: 11, fontWeight: 600, color: G.textBody, lineHeight: 1.7 }}>{step}</div>
                ))}
              </div>
              {/* Connect button */}
              <button
                className="gp-press-sm"
                onClick={() => { setWifiConnected(true); showToast('Connected to WiFi ✓') }}
                style={{
                  width: '100%', padding: '10px 16px', borderRadius: 999,
                  background: wifiConnected ? G.accentBg : G.accent,
                  color: wifiConnected ? G.accent : G.accentFg,
                  border: wifiConnected ? `1px solid ${G.accent}33` : 'none',
                  fontSize: 12, fontWeight: 800, cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.2s',
                }}
              >{wifiConnected ? 'Connected ✓' : 'Connect'}</button>
              {/* WiFi QR Code */}
              <button
                className="gp-press-sm"
                onClick={() => setWifiQrVisible(v => !v)}
                style={{
                  width: '100%', padding: '10px 16px', borderRadius: 999,
                  background: G.surfaceHover, border: `1px solid ${G.border}`,
                  fontSize: 12, fontWeight: 800, color: G.textBody,
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <Camera size={14} color={G.textMuted} />
                {wifiQrVisible ? 'Hide QR Code' : 'Show QR Code'}
              </button>
              {wifiQrVisible && (
                <div style={{
                  padding: 16, borderRadius: 14,
                  background: G.surfaceHover, border: `1px solid ${G.border}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                }}>
                  {/* Mock QR code placeholder */}
                  <div style={{
                    width: 120, height: 120, borderRadius: 10,
                    background: '#fff',
                    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(7, 1fr)',
                    gap: 2, padding: 8,
                  }}>
                    {Array.from({ length: 49 }).map((_, i) => {
                      const row = Math.floor(i / 7)
                      const col = i % 7
                      const isCorner = (row < 3 && col < 3) || (row < 3 && col > 3) || (row > 3 && col < 3)
                      const isFilled = isCorner || [10, 12, 17, 22, 24, 26, 30, 31, 33, 36, 38, 40].includes(i)
                      return (
                        <div key={i} style={{
                          borderRadius: 1,
                          background: isFilled ? '#111' : '#e5e5e5',
                        }} />
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Camera size={14} color={G.accent} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: G.textBody }}>Scan with camera</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: G.textMuted }}>Scan to connect automatically</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Travel Reminders — shows when any travelMode is set */}
        {travelMode !== null && (() => {
          const modeData = GETTING_THERE_DATA[travelMode]
          const firstOption = modeData.options[0]
          return (
            <div style={{
              padding: 16, borderRadius: 18, marginBottom: 18,
              background: G.surface, border: `1px solid ${G.border}`,
              boxShadow: G.shadowMd,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <MapPin size={16} color={G.accent} />
                <span style={{ fontSize: 14, fontWeight: 800, color: G.text }}>Travel Reminders</span>
              </div>

              {/* Arrival section */}
              <div style={{
                padding: 12, borderRadius: 12, marginBottom: 10,
                background: G.surfaceHover,
              }}>
                <div style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: G.accent,
                  textTransform: 'uppercase', marginBottom: 6,
                }}>ARRIVING · {MOCK_ARRIVAL_FLIGHT.arrivalDate}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: G.text, marginBottom: 4 }}>
                  {modeData.title} → Property
                </div>
                {firstOption && (
                  <div style={{ fontSize: 11, fontWeight: 600, color: G.textBody, marginBottom: 4 }}>
                    Recommended: {firstOption.mode}{firstOption.time ? ` (${firstOption.time})` : ''}
                  </div>
                )}
                {travelMode === 'airport' && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', borderRadius: 10, marginTop: 8,
                    background: `${G.accent}0a`, border: `1px solid ${G.accent}1a`,
                  }}>
                    <Plane size={14} color={G.accent} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: G.text }}>
                        {MOCK_ARRIVAL_FLIGHT.airline} {MOCK_ARRIVAL_FLIGHT.flightNumber}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: G.textMuted }}>
                        {MOCK_ARRIVAL_FLIGHT.from} → Oslo · Arr {MOCK_ARRIVAL_FLIGHT.arrivalTime}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: G.textMuted }}>{MOCK_ARRIVAL_FLIGHT.terminal} · Gate {MOCK_ARRIVAL_FLIGHT.gate}</div>
                    </div>
                  </div>
                )}
                <div style={{ fontSize: 11, fontWeight: 600, color: G.textMuted, marginTop: 6 }}>
                  Check-in from 15:00
                </div>
              </div>

              {/* Departure section */}
              <div style={{
                padding: 12, borderRadius: 12, marginBottom: 10,
                background: G.surfaceHover,
              }}>
                <div style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: G.textMuted,
                  textTransform: 'uppercase', marginBottom: 6,
                }}>DEPARTING · {MOCK_DEPARTURE.departureDate}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: G.text, marginBottom: 4 }}>
                  Property → {travelMode === 'airport' ? MOCK_DEPARTURE.destination.split('(')[0].trim() : modeData.title.replace(/^From /, '')}
                </div>
                {travelMode === 'airport' && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', borderRadius: 10, marginTop: 4,
                    background: `${G.accent}0a`, border: `1px solid ${G.accent}1a`,
                  }}>
                    <Plane size={14} color={G.accent} style={{ transform: 'rotate(45deg)' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: G.text }}>
                        {MOCK_DEPARTURE.airline} {MOCK_DEPARTURE.flightNumber}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: G.textMuted }}>
                        Oslo → {MOCK_DEPARTURE.destination} · Dep {MOCK_DEPARTURE.flightTime}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: G.textMuted }}>{MOCK_DEPARTURE.terminal} · Gate {MOCK_DEPARTURE.gate}</div>
                    </div>
                  </div>
                )}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  marginTop: 8,
                }}>
                  <AlertTriangle size={12} color={G.amber} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: G.amber }}>
                    Leave by {leaveByTime} at the latest
                  </span>
                </div>
              </div>

              {/* Airport transfer upsell — airport mode only */}
              {travelMode === 'airport' && (
                <button
                  className="gp-press"
                  onClick={() => toggleAddService('ur3')}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '12px 20px', borderRadius: 999,
                    background: addedServices.has('ur3') ? G.accentBg : G.accent,
                    color: addedServices.has('ur3') ? G.accent : G.accentFg,
                    border: addedServices.has('ur3') ? `1px solid ${G.accent}44` : 'none',
                    fontSize: 13, fontWeight: 800, cursor: 'pointer',
                    fontFamily: 'inherit', transition: 'all 0.2s',
                  }}
                >
                  <Car size={16} />
                  {addedServices.has('ur3') ? 'Transfer Added ✓' : 'Book Airport Transfer — 850 NOK'}
                </button>
              )}
            </div>
          )
        })()}

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
                    {(() => {
                      const cat = UPSELL_CATEGORY_ICON[u.category]
                      const CatIcon = cat?.icon ?? Gift
                      const catColor = cat?.color ?? '#EC4899'
                      const catRgb = cat?.rgb ?? '236,72,153'
                      return (
                        <div style={{
                          height: 130,
                          background: `radial-gradient(circle at center, rgba(${catRgb}, 0.06), rgba(${catRgb}, 0.02))`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <div style={{
                            width: 56, height: 56, borderRadius: '50%',
                            background: `rgba(${catRgb}, 0.12)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <CatIcon size={28} color={catColor} strokeWidth={1.5} />
                          </div>
                        </div>
                      )
                    })()}
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
                            color: added ? G.accent : G.accentFg,
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

        {/* Checkout Checklist */}
        <div style={{
          padding: 16, borderRadius: 18, marginBottom: 16,
          background: G.surface, border: `1px solid ${G.border}`,
          boxShadow: G.shadowSm,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <ClipboardList size={16} color={G.accent} />
            <span style={{ fontSize: 14, fontWeight: 800, color: G.text }}>Checkout Checklist</span>
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: G.textMuted, marginBottom: 14 }}>
            Checkout · 11:00 AM · Thu Mar 27
          </div>
          {/* Progress bar */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: G.textMuted }}>
                {checkoutList.filter(i => i.checked).length}/{checkoutList.length} completed
              </span>
              {checkoutList.every(i => i.checked) && (
                <span style={{ fontSize: 11, fontWeight: 800, color: G.accent }}>All done!</span>
              )}
            </div>
            <div style={{ height: 6, borderRadius: 999, background: G.surfaceHover, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 999,
                background: G.accent,
                width: `${(checkoutList.filter(i => i.checked).length / checkoutList.length) * 100}%`,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
          {/* Checklist items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {checkoutList.map(item => (
              <button
                key={item.id}
                className="gp-press"
                onClick={() => toggleCheckoutItem(item.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 14,
                  background: item.checked ? G.accentBg : G.surfaceHover,
                  border: item.checked ? `1px solid ${G.accent}22` : `1px solid ${G.border}`,
                  cursor: 'pointer', fontFamily: 'inherit',
                  opacity: item.checked ? 0.8 : 1,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  background: item.checked ? G.accent : 'transparent',
                  border: item.checked ? 'none' : `2px solid ${G.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.checked && <Check size={14} color={G.accentFg} strokeWidth={3} />}
                </div>
                <span style={{
                  flex: 1, textAlign: 'left',
                  fontSize: 13, fontWeight: 700,
                  color: item.checked ? G.textMuted : G.text,
                  textDecoration: item.checked ? 'line-through' : 'none',
                }}>{item.item}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Rate Your Stay CTA */}
        {!reviewSubmitted && (
          <button
            className="gp-press"
            onClick={() => setReviewOpen(true)}
            style={{
              width: '100%', padding: 16, borderRadius: 18, marginBottom: 16,
              background: G.surface, border: `1px solid ${G.border}`,
              boxShadow: G.shadowSm,
              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'rgba(255,193,7,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Star size={20} color="#FFC107" fill="#FFC107" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: G.text }}>Rate Your Stay ★</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: G.textMuted, marginTop: 2 }}>Share your feedback before you go</div>
            </div>
            <ChevronRight size={16} color={G.textFaint} />
          </button>
        )}
        {reviewSubmitted && (
          <div style={{
            padding: 16, borderRadius: 18, marginBottom: 16,
            background: G.accentBg, border: `1px solid ${G.accent}22`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: G.accent }}>Thank you for your review!</div>
          </div>
        )}

        {/* Post-Checkout Retention CTA */}
        <div style={{
          padding: 20, borderRadius: 18, marginTop: 8,
          background: G.accentBg,
          border: `1px solid ${G.accent}44`,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 20 }}>🎉</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: G.text, marginTop: 8 }}>
            Enjoying AfterStay?
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: G.textBody, margin: '8px 0 16px' }}>
            Keep the app and plan your next trip with the same ease.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {/* Apple App Store badge */}
            <button
              className="gp-press"
              onClick={() => showToast('Opening App Store...')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px 8px 10px', borderRadius: 10,
                background: '#000', color: '#fff', border: '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <svg width="20" height="24" viewBox="0 0 20 24" fill="white">
                <path d="M16.52 12.46c-.03-2.85 2.33-4.22 2.44-4.29-1.33-1.94-3.4-2.21-4.13-2.24-1.76-.18-3.43 1.04-4.32 1.04-.89 0-2.27-1.01-3.73-.99-1.92.03-3.69 1.12-4.68 2.84-2 3.46-.51 8.59 1.43 11.4.95 1.38 2.08 2.92 3.57 2.87 1.43-.06 1.97-.93 3.7-.93 1.73 0 2.22.93 3.73.9 1.54-.03 2.52-1.4 3.46-2.79 1.09-1.6 1.54-3.15 1.57-3.23-.03-.01-3.01-1.16-3.04-4.58zM13.69 3.97c.79-.96 1.32-2.29 1.17-3.62-1.13.05-2.5.75-3.31 1.7-.73.84-1.37 2.19-1.2 3.48 1.26.1 2.55-.64 3.34-1.56z"/>
              </svg>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 8, fontWeight: 500, lineHeight: 1, letterSpacing: '0.02em' }}>Download on the</div>
                <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01em' }}>App Store</div>
              </div>
            </button>
            {/* Google Play badge */}
            <button
              className="gp-press"
              onClick={() => showToast('Opening Google Play...')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px 8px 10px', borderRadius: 10,
                background: '#000', color: '#fff', border: '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
                <path d="M1.22.97L11.53 11 1.22 21.03c-.14-.18-.22-.42-.22-.7V1.67c0-.28.08-.52.22-.7z" fill="#4285F4"/>
                <path d="M14.97 7.56L11.53 11l3.44 3.44 3.88-2.2c.66-.38.66-1.1 0-1.48l-3.88-2.2z" fill="#FBBC04"/>
                <path d="M1.22 21.03c.28.36.72.52 1.16.3l13.03-7.33L11.53 11 1.22 21.03z" fill="#EA4335"/>
                <path d="M1.22.97c-.44-.22-.88-.06-1.16.3L11.53 11l3.88-3.44L2.38.67c-.44-.22-.88-.06-1.16.3z" fill="#34A853"/>
              </svg>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 8, fontWeight: 500, lineHeight: 1, letterSpacing: '0.02em' }}>GET IT ON</div>
                <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01em' }}>Google Play</div>
              </div>
            </button>
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: G.textMuted, marginTop: 12 }}>
            Plan your next adventure →
          </div>
        </div>

        {/* Spacer at bottom for FAB clearance */}
        <div style={{ height: 60 }} />
      </div>
    </div>
  )

  // ——— Guide ————————————————————————————————————————————————
  const guideRows = [
    { t: 'House Rules',        s: 'Quiet hours · Pets · Extra guests' },
    { t: 'Appliances',         s: 'Oven · Washer · TV · Coffee' },
    { t: 'Getting There',      s: 'Directions · Transport options' },
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
        background: G.surface, borderRadius: 18,
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
            Lev Collection — your hosts. Reach out anytime!
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
        const guideIcons = getGuideIcons(G.accent)
        const iconCfg = guideIcons[i]
        const IconComp = iconCfg.icon
        const isExpanded = expandedGuide === row.t
        const guideContent = getGuideDetailContent(G)
        const detail = guideContent[row.t]
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
            {isExpanded && row.t === 'Getting There' && (
              <div style={{
                padding: '14px 16px 16px',
                background: G.surfaceHover,
                borderRadius: '0 0 18px 18px',
                border: `1px solid ${G.accent}33`,
                borderTop: 'none',
                fontSize: 12, fontWeight: 600, color: G.textBody,
                lineHeight: 1.55,
              }}>
                {/* Pill selector */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                  {([
                    { key: 'airport' as const, label: '✈️ Airport' },
                    { key: 'train' as const, label: '🚆 Train Station' },
                    { key: 'local' as const, label: '🚗 Local / Driving' },
                  ]).map(opt => (
                    <button
                      key={opt.key}
                      className="gp-press-sm"
                      onClick={() => setTravelMode(travelMode === opt.key ? null : opt.key)}
                      style={{
                        padding: '7px 14px', borderRadius: 999,
                        background: travelMode === opt.key ? G.accent : G.surface,
                        color: travelMode === opt.key ? '#fff' : G.textBody,
                        border: travelMode === opt.key ? 'none' : `1px solid ${G.border}`,
                        fontSize: 12, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all 0.2s',
                      }}
                    >{opt.label}</button>
                  ))}
                </div>

                {/* Route cards */}
                {travelMode && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: G.text, marginBottom: 4 }}>
                      {GETTING_THERE_DATA[travelMode].title}
                    </div>
                    {GETTING_THERE_DATA[travelMode].options.map(opt => (
                      <div key={opt.mode} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', borderRadius: 12,
                        background: G.surface, border: `1px solid ${G.border}`,
                      }}>
                        <span style={{ fontSize: 18 }}>{opt.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: G.text }}>{opt.mode}</div>
                          {opt.time && (
                            <div style={{ fontSize: 11, fontWeight: 600, color: G.textMuted, marginTop: 2 }}>{opt.time}</div>
                          )}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: G.accent }}>{opt.cost}</div>
                      </div>
                    ))}

                    {/* Last mile */}
                    {GETTING_THERE_DATA[travelMode].lastMile && (
                      <div style={{
                        padding: '10px 12px', borderRadius: 12,
                        background: G.accentBg, border: `1px solid ${G.accent}22`,
                        fontSize: 11, fontWeight: 600, color: G.textBody,
                      }}>
                        🚶 {GETTING_THERE_DATA[travelMode].lastMile}
                      </div>
                    )}
                  </div>
                )}

                {/* Address pin */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px', borderRadius: 12,
                  background: G.surface, border: `1px solid ${G.border}`,
                }}>
                  <MapPin size={14} color={G.accent} />
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: G.text }}>{PROPERTY_ADDRESS}</span>
                  <button
                    className="gp-press-sm"
                    onClick={() => copyToClipboard(PROPERTY_ADDRESS, 'Address')}
                    style={{
                      padding: '4px 10px', borderRadius: 8,
                      background: G.accentBg, border: 'none',
                      fontSize: 10, fontWeight: 700, color: G.accent,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    <Copy size={10} /> Copy
                  </button>
                </div>
              </div>
            )}
            {isExpanded && row.t !== 'Getting There' && detail && (
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
        <WeatherIcon condition={STAY_FORECAST[0].condition} size={20} />
        <span style={{ fontSize: 13, fontWeight: 700, color: G.text }}>Oslo</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: G.textMuted }}>·</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: G.text }}>{STAY_FORECAST[0].high}°C</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: G.textMuted }}>·</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: G.textMuted }}>{CONDITION_LABELS[STAY_FORECAST[0].condition]}</span>
      </div>

      {/* Search bar — functional input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px', borderRadius: 999,
        background: G.surfaceHover,
        marginBottom: 16,
      }}>
        <Search size={16} color={G.textMuted} style={{ flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search places, restaurants..."
          value={discoverSearch}
          onChange={e => setDiscoverSearch(e.target.value)}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontSize: 14, fontWeight: 600, color: G.text,
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Category pills — functional filter */}
      <HorizontalRail style={{ marginBottom: 18, scrollSnapType: 'x proximity' }}>
        {DISCOVER_CATEGORIES.map(c => {
          const active = activeCat === c.key
          return (
            <button
              key={c.key}
              className="gp-cat-pill"
              onClick={() => setActiveCat(c.key)}
              style={{
                flexShrink: 0, scrollSnapAlign: 'start',
                padding: '8px 14px', borderRadius: 999,
                background: active ? G.accent : G.surface,
                color: active ? G.accentFg : G.textBody,
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

      {/* Map View — opens Google Maps */}
      <button
        className="gp-press"
        onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(PROPERTY_ADDRESS)}`, '_blank')}
        style={{
          width: '100%', height: 100, borderRadius: 18, marginBottom: 18,
          background: G.surfaceHover, border: `1px solid ${G.border}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <MapPin size={24} color={G.accent} />
        <span style={{ fontSize: 12, fontWeight: 700, color: G.accent }}>Open in Maps →</span>
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
              background: G.surface, borderRadius: 18,
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
                    fontSize: 9, fontWeight: 900, color: G.accentFg,
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
                  fontSize: 12, fontWeight: 600, color: G.textBody, lineHeight: 1.45,
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
              background: G.surface, borderRadius: 18,
              boxShadow: G.shadowMd, overflow: 'hidden',
              border: `1px solid ${G.border}`,
              transition: 'border-color 0.15s',
            }}>
              {(() => {
                const cat = UPSELL_CATEGORY_ICON[u.category]
                const CatIcon = cat?.icon ?? Gift
                const catColor = cat?.color ?? '#EC4899'
                const catRgb = cat?.rgb ?? '236,72,153'
                return (
                  <div style={{
                    height: 100,
                    background: `radial-gradient(circle at center, rgba(${catRgb}, 0.06), rgba(${catRgb}, 0.02))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: `rgba(${catRgb}, 0.12)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CatIcon size={22} color={catColor} strokeWidth={1.5} />
                    </div>
                  </div>
                )
              })()}
              <div style={{ padding: '14px 16px' }}>
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
                      color: added ? G.accent : G.accentFg,
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
      {/* Floating view cart bar */}
      {addedServices.size > 0 && (
        <div style={{ position: 'sticky', bottom: 0, padding: '12px 0 20px', background: `linear-gradient(transparent, ${G.bg})` }}>
          <button
            className="gp-press"
            onClick={() => setCartOpen(true)}
            style={{
              width: '100%', padding: '14px 20px', borderRadius: 999,
              background: G.accent, color: G.accentFg, border: 'none',
              fontSize: 14, fontWeight: 800, cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: `0 4px 16px ${G.accent}44`,
            }}
          >
            <ShoppingCart size={16} />
            View Cart ({addedServices.size}) — {cartTotal} NOK
          </button>
        </div>
      )}
    </div>
  )

  // ——— Our Trip ————————————————————————————————————————————————
  const TripPanel = (
    <div style={{ padding: '20px 20px 0' }}>
      <div style={{
        fontSize: 22, fontWeight: 900, color: G.text, marginBottom: 20,
        letterSpacing: '-0.02em',
      }}>Our Trip</div>

      {/* Trip Overview */}
      <div style={{
        padding: 18, borderRadius: 18, marginBottom: 20,
        background: G.surface, border: `1px solid ${G.border}`,
        boxShadow: G.shadowMd,
      }}>
        {/* Property + Address */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <img
            src={PREVIEW_IMAGES.hero[0]}
            alt="Property"
            style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: G.text }}>{guidebook.propertyName}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: G.textMuted, marginTop: 2 }}>
              {PROPERTY_ADDRESS}
            </div>
          </div>
        </div>

        {/* Dates */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 12px', borderRadius: 12, marginBottom: 10,
          background: G.surfaceHover, border: `1px solid ${G.border}`,
        }}>
          <Clock size={14} color={G.accent} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: G.text }}>
              Mar 22, 15:00 → Mar 27, 11:00
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: G.textMuted, marginTop: 2 }}>5 nights</div>
          </div>
        </div>

        {/* Group */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 12px', borderRadius: 12, marginBottom: 10,
          background: G.surfaceHover, border: `1px solid ${G.border}`,
        }}>
          <div style={{ display: 'flex', marginRight: 4 }}>
            {MOCK_GROUP.map((m, i) => (
              <img
                key={m.name}
                src={m.avatar}
                alt={m.name}
                style={{
                  width: 24, height: 24, borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid ${G.surface}`,
                  marginLeft: i > 0 ? -8 : 0,
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: G.text }}>{MOCK_GROUP.length} guests</span>
        </div>

        {/* Booked Services */}
        {addedServices.size > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 8, padding: '0 2px',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: G.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Booked Services
              </span>
              <span style={{ fontSize: 12, fontWeight: 800, color: G.accent }}>
                {cartTotal} NOK
              </span>
            </div>
            {cartItems.map(item => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 12px', borderRadius: 8,
                fontSize: 12, fontWeight: 600,
              }}>
                <span style={{ color: G.text }}>{item.title}</span>
                <span style={{ color: G.textMuted }}>{item.price} NOK</span>
              </div>
            ))}
          </div>
        )}

        {/* Flight summary */}
        <button
          className="gp-press-sm"
          onClick={() => {
            setArrivingOpen(true)
            setTimeout(() => document.getElementById('flights-section')?.scrollIntoView({ behavior: 'smooth' }), 100)
          }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 12px', borderRadius: 12,
            background: G.surfaceHover, border: `1px solid ${G.border}`,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <Plane size={14} color={G.accent} />
          <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: G.text, textAlign: 'left' }}>
            {MOCK_FLIGHTS.filter(f => f.status === 'confirmed').length + MOCK_DEPARTURE_FLIGHTS.filter(f => f.status === 'confirmed').length} flights tracked · {MOCK_FLIGHTS.filter(f => f.status === 'confirmed').length + MOCK_DEPARTURE_FLIGHTS.filter(f => f.status === 'confirmed').length} confirmed, {MOCK_FLIGHTS.filter(f => f.status === 'pending').length + MOCK_DEPARTURE_FLIGHTS.filter(f => f.status === 'pending').length} pending
          </span>
          <ChevronDown size={14} color={G.textFaint} />
        </button>

        {/* Email trip details */}
        <button
          className="gp-press-sm"
          onClick={() => showToast('Trip details sent to group ✓')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 12px', borderRadius: 12, marginTop: 8,
            background: G.surfaceHover, border: `1px solid ${G.border}`,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <Mail size={14} color={G.accent} />
          <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: G.text, textAlign: 'left' }}>
            Email Trip Details
          </span>
          <ChevronRight size={14} color={G.textFaint} />
        </button>
      </div>

      {/* Section 1 — Invite Your Group */}
      <div style={{
        padding: 18, borderRadius: 18, marginBottom: 20,
        background: G.surface, border: `1px solid ${G.border}`,
        boxShadow: G.shadowMd,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: G.text }}>Invite your group</div>
          <span style={{ fontSize: 10, fontWeight: 700, color: G.textMuted }}>Max 8 guests</span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: G.textBody, marginBottom: 14 }}>Share access with everyone staying</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
          <input
            type="text"
            placeholder="Name"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 12,
              background: G.surfaceHover, border: `1px solid ${G.border}`,
              color: G.text, fontSize: 13, fontWeight: 500,
              fontFamily: 'inherit', outline: 'none',
            }}
          />
          <input
            type="email"
            placeholder="Email (required)"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 12,
              background: G.surfaceHover, border: `1px solid ${G.border}`,
              color: G.text, fontSize: 13, fontWeight: 500,
              fontFamily: 'inherit', outline: 'none',
            }}
          />
          <input
            type="tel"
            placeholder="Phone number (required)"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 12,
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
            background: G.accent, color: G.accentFg, border: 'none',
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
          3 of 8 spots filled
        </div>
      </div>

      {/* Section 2 — Group Members */}
      <SectionTitle>Group</SectionTitle>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {MOCK_GROUP.map(m => (
          <div key={m.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ position: 'relative' }}>
              <img
                src={m.avatar}
                alt={m.name}
                style={{
                  width: 44, height: 44, borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid ${m.role === 'host' ? G.accent : G.border}`,
                }}
              />
              {m.role === 'host' && (
                <span style={{
                  position: 'absolute', bottom: -2, right: -4,
                  fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 6,
                  background: G.accent, color: G.accentFg,
                }}>Host</span>
              )}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: G.text }}>{m.name}</span>
            <span style={{ fontSize: 9, fontWeight: 600, color: G.textMuted, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</span>
          </div>
        ))}
      </div>

      {/* Section 3 — Flights */}
      <div id="flights-section"><SectionTitle>Flights</SectionTitle></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {/* Arriving sub-section */}
        <button
          className="gp-press"
          onClick={() => setArrivingOpen(v => !v)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', borderRadius: 14,
            background: G.surface, border: `1px solid ${G.border}`,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <Plane size={16} color={G.accent} />
          <span style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: 800, color: G.text }}>
            Arriving (Mar 22)
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color: G.textMuted }}>{MOCK_FLIGHTS.filter(f => f.status === 'confirmed').length}/{MOCK_FLIGHTS.length}</span>
          {arrivingOpen
            ? <ChevronUp size={16} color={G.textMuted} />
            : <ChevronDown size={16} color={G.textMuted} />
          }
        </button>
        {arrivingOpen && MOCK_FLIGHTS.map(f => (
          <div key={f.id} style={{
            padding: 14, borderRadius: 18,
            background: G.surface, border: `1px solid ${G.border}`,
            boxShadow: G.shadowSm,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: f.status === 'confirmed' ? 8 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Plane size={16} color={f.status === 'confirmed' ? G.accent : G.textMuted} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: G.text }}>
                    {f.flight ? `${f.name} · ${f.airline} ${f.flight}` : f.name}
                  </div>
                  {f.status === 'confirmed' ? (
                    <div style={{ fontSize: 11, fontWeight: 600, color: G.textBody, marginTop: 2 }}>
                      {f.from} → Oslo · Arriving {f.arriving}
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, fontWeight: 600, color: G.textMuted, marginTop: 2 }}>
                      No flight added yet
                    </div>
                  )}
                </div>
              </div>
              <span style={{
                fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 8,
                background: f.status === 'confirmed' ? G.accentBg : G.surfaceHover,
                color: f.status === 'confirmed' ? G.accent : G.textMuted,
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>{f.status}</span>
            </div>
            {f.status === 'confirmed' && f.terminal && (
              <div style={{ display: 'flex', gap: 8, marginLeft: 26 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                  background: G.surfaceHover, color: G.textMuted,
                }}>Terminal {f.terminal}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                  background: G.surfaceHover, color: G.textMuted,
                }}>Gate {f.gate}</span>
              </div>
            )}
          </div>
        ))}

        {/* Departing sub-section */}
        <button
          className="gp-press"
          onClick={() => setDepartingOpen(v => !v)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', borderRadius: 14,
            background: G.surface, border: `1px solid ${G.border}`,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <Plane size={16} color={G.textMuted} style={{ transform: 'rotate(45deg)' }} />
          <span style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: 800, color: G.text }}>
            Departing (Mar 27)
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color: G.textMuted }}>{MOCK_DEPARTURE_FLIGHTS.filter(f => f.status === 'confirmed').length}/{MOCK_DEPARTURE_FLIGHTS.length}</span>
          {departingOpen
            ? <ChevronUp size={16} color={G.textMuted} />
            : <ChevronDown size={16} color={G.textMuted} />
          }
        </button>
        {departingOpen && MOCK_DEPARTURE_FLIGHTS.map(f => (
          <div key={f.id} style={{
            padding: 14, borderRadius: 18,
            background: G.surface, border: `1px solid ${G.border}`,
            boxShadow: G.shadowSm,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: f.status === 'confirmed' ? 8 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Plane size={16} color={f.status === 'confirmed' ? G.accent : G.textMuted} style={{ transform: 'rotate(45deg)' }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: G.text }}>
                    {f.flight ? `${f.name} · ${f.airline} ${f.flight}` : f.name}
                  </div>
                  {f.status === 'confirmed' ? (
                    <div style={{ fontSize: 11, fontWeight: 600, color: G.textBody, marginTop: 2 }}>
                      Oslo → {f.to} · Departing {f.departing}
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, fontWeight: 600, color: G.textMuted, marginTop: 2 }}>
                      No flight added yet
                    </div>
                  )}
                </div>
              </div>
              <span style={{
                fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 8,
                background: f.status === 'confirmed' ? G.accentBg : G.surfaceHover,
                color: f.status === 'confirmed' ? G.accent : G.textMuted,
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>{f.status}</span>
            </div>
            {f.status === 'confirmed' && f.terminal && (
              <div style={{ display: 'flex', gap: 8, marginLeft: 26 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                  background: G.surfaceHover, color: G.textMuted,
                }}>Terminal {f.terminal}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                  background: G.surfaceHover, color: G.textMuted,
                }}>Gate {f.gate}</span>
              </div>
            )}
          </div>
        ))}

        {/* Add flight input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Flight number (e.g. SK1472)"
              value={flightInput}
              onChange={e => setFlightInput(e.target.value)}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 12,
                background: G.surfaceHover, border: `1px solid ${G.border}`,
                color: G.text, fontSize: 13, fontWeight: 500,
                fontFamily: 'inherit', outline: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Date & time (e.g. Mar 22, 19:45)"
              value={flightTimeInput}
              onChange={e => setFlightTimeInput(e.target.value)}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 12,
                background: G.surfaceHover, border: `1px solid ${G.border}`,
                color: G.text, fontSize: 13, fontWeight: 500,
                fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>
          <button
            className="gp-press-sm"
            onClick={() => {
              if (flightInput.trim()) {
                const time = flightTimeInput.trim() || 'Mar 22, 19:45'
                setAddedFlight({ code: flightInput.trim().toUpperCase(), airline: 'SAS', from: 'Copenhagen (CPH)', arriving: time, terminal: 'T2', gate: 'B12' })
                showToast('Flight added ✓')
                setFlightInput('')
                setFlightTimeInput('')
              }
            }}
            style={{
              width: '100%', padding: '10px 18px', borderRadius: 12,
              background: G.accent, color: G.accentFg, border: 'none',
              fontSize: 13, fontWeight: 800, cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <Plane size={14} /> Add Flight
          </button>
        </div>

        {/* Recently added flight details */}
        {addedFlight && (
          <div style={{
            padding: 14, borderRadius: 18, marginTop: 10,
            background: G.surface, border: `1px solid ${G.border}`,
            boxShadow: G.shadowSm,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Plane size={16} color={G.accent} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: G.text }}>
                    {addedFlight.airline} {addedFlight.code}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: G.textBody, marginTop: 2 }}>
                    {addedFlight.from} → Oslo · Arriving {addedFlight.arriving}
                  </div>
                </div>
              </div>
              <span style={{
                fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 8,
                background: G.accentBg, color: G.accent,
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>confirmed</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginLeft: 26 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                background: G.surfaceHover, color: G.textMuted,
              }}>Terminal {addedFlight.terminal}</span>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                background: G.surfaceHover, color: G.textMuted,
              }}>Gate {addedFlight.gate}</span>
            </div>
          </div>
        )}
      </div>

      {/* Section 4 — Packing & Reminders */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <SectionTitle>Packing &amp; Reminders</SectionTitle>
        <button
          className="gp-press-sm"
          onClick={() => showToast('Reminders sent to all ✓')}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '5px 10px', borderRadius: 8,
            background: G.surfaceHover, border: `1px solid ${G.border}`,
            fontSize: 10, fontWeight: 700, color: G.textMuted,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <Bell size={11} /> Remind All
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {packingList.map(item => (
          <div
            key={item.id}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 14,
              background: G.surface, border: `1px solid ${G.border}`,
              opacity: item.checked ? 0.7 : 1,
            }}
          >
            <button
              className="gp-press"
              onClick={() => togglePackingItem(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0,
                background: 'none', border: 'none', padding: 0,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                background: item.checked ? G.accent : 'transparent',
                border: item.checked ? 'none' : `2px solid ${G.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {item.checked && <Check size={14} color="#fff" strokeWidth={3} />}
              </div>
              <span style={{
                flex: 1, textAlign: 'left',
                fontSize: 13, fontWeight: 700,
                color: item.checked ? G.textMuted : G.text,
                textDecoration: item.checked ? 'line-through' : 'none',
              }}>{item.item}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: G.textMuted }}>
                {item.addedBy}
              </span>
            </button>
            {!item.checked && (
              <button
                className="gp-press-sm"
                onClick={() => showToast(`Reminder sent to ${item.addedBy} ✓`)}
                style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: G.surfaceHover, border: `1px solid ${G.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Bell size={12} color={G.textMuted} />
              </button>
            )}
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Add a reminder..."
            value={packingInput}
            onChange={e => setPackingInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addPackingItem() }}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 12,
              background: G.surfaceHover, border: `1px solid ${G.border}`,
              color: G.text, fontSize: 13, fontWeight: 500,
              fontFamily: 'inherit', outline: 'none',
            }}
          />
          <button
            className="gp-press-sm"
            onClick={addPackingItem}
            style={{
              width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
              background: G.accent, color: G.accentFg, border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Section 5 — Trip Board with Voting */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>{item.cat}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: G.text }}>{item.name}</span>
            </div>
            {/* Location + price row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: G.textMuted }}>
                <MapPin size={11} /> {item.location}
              </div>
              <span style={{
                fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 8,
                background: G.accentBg, color: G.accent,
              }}>{item.pricePerPax}</span>
            </div>
            {/* Description */}
            <div style={{ fontSize: 12, fontWeight: 600, color: G.textBody, marginBottom: 10, lineHeight: 1.4 }}>
              {item.desc}
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
      banner={!verificationComplete ? (
        <button
          className="gp-press"
          onClick={() => setShowVerification(true)}
          style={{
            width: '100%',
            background: `${G.amber}12`,
            borderBottom: `1px solid ${G.amber}22`,
            padding: '9px 16px', textAlign: 'center',
            fontSize: 11, fontWeight: 700, color: G.amber,
            letterSpacing: '0.02em',
            fontFamily: 'var(--font-nunito), var(--font-sans)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <Lock size={11} /> Check-in instructions locked — complete verification to unlock
        </button>
      ) : undefined}
    />
  )

  // ——— Verification Flow ——————————————————————————————————
  const VERIFICATION_STEPS = [
    {
      title: 'Security Deposit / Damage Waiver',
      icon: Shield,
      color: '#4A9EFF',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Card on file */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 14, background: G.surfaceHover, border: `1px solid ${G.border}` }}>
            <CreditCard size={18} color="#4A9EFF" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: G.text }}>Visa ••••4242</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: G.textMuted, marginTop: 2 }}>$200 hold · Pre-authorized</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 8, background: G.accentBg, color: G.accent }}>Active</span>
          </div>

          {/* What it covers */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: G.text, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>What this covers</div>
            {[
              'Accidental damage to furniture or fixtures',
              'Excessive cleaning beyond normal wear',
              'Missing or broken inventory items',
              'Key / access device replacement',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                <div style={{ width: 4, height: 4, borderRadius: 2, background: '#4A9EFF', flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: G.textBody }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Refund timeline */}
          <div style={{ padding: '10px 12px', borderRadius: 12, background: G.accentBg, border: `1px solid ${G.accent}22` }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: G.accent, marginBottom: 4 }}>Refund Timeline</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: G.textBody, lineHeight: 1.5 }}>
              The $200 hold is <span style={{ fontWeight: 800 }}>not a charge</span>. It will be automatically released within 48 hours after checkout, provided no damage claim is filed by the host.
            </div>
          </div>

          {/* Note */}
          <div style={{ fontSize: 10, fontWeight: 600, color: G.textMuted, lineHeight: 1.5 }}>
            You will not be charged unless the host submits a documented damage report with photos. Any dispute can be resolved through AfterStay support.
          </div>
        </div>
      ),
    },
    {
      title: 'ID Verification',
      icon: FileText,
      color: '#3ECF8E',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Document row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, background: G.surfaceHover, border: `1px solid ${G.border}` }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(62,207,142,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} color="#3ECF8E" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: G.text }}>Emma Lindqvist</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: G.textMuted, marginTop: 2 }}>Passport · Sweden</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 8, background: G.accentBg, color: G.accent }}>Verified</span>
          </div>
          {/* Selfie match */}
          <div style={{ padding: '12px 14px', borderRadius: 14, background: G.surfaceHover, border: `1px solid ${G.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: G.text, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Selfie Verification</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Selfie photo */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', overflow: 'hidden',
                  border: `2px solid ${G.accent}`,
                }}>
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face" alt="Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{
                  position: 'absolute', bottom: -2, right: -2,
                  width: 20, height: 20, borderRadius: '50%',
                  background: G.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${G.surface}`,
                }}>
                  <Check size={10} color="#fff" strokeWidth={3} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: G.accent }}>Face match confirmed</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: G.textMuted, marginTop: 2 }}>Photo matches passport ID</div>
              </div>
              <Camera size={18} color={G.textMuted} />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'House Rules',
      icon: ClipboardList,
      color: '#F5A623',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {['Quiet hours 10 PM – 8 AM', 'No smoking indoors', 'Max 2 extra guests', 'Pets allowed (notify host)', 'No parties or events'].map(rule => (
            <div key={rule} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, background: G.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={12} color="#fff" strokeWidth={3} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: G.text }}>{rule}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Travel Purpose',
      icon: Palmtree,
      color: '#A855F7',
      content: (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['Vacation', 'Business', 'Family visit', 'Event', 'Other'].map(purpose => (
            <div key={purpose} style={{
              padding: '8px 16px', borderRadius: 999,
              background: purpose === 'Vacation' ? G.accent : G.surfaceHover,
              color: purpose === 'Vacation' ? '#fff' : G.textBody,
              border: purpose === 'Vacation' ? 'none' : `1px solid ${G.border}`,
              fontSize: 12, fontWeight: 700,
            }}>{purpose}</div>
          ))}
        </div>
      ),
    },
  ]

  const verificationFlow = (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100%',
      background: G.bg,
      fontFamily: 'var(--font-nunito), var(--font-sans)',
    }}>
      {/* Hero image (blurred) + back button */}
      <div style={{
        position: 'relative', height: 200, overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${PREVIEW_IMAGES.hero[0]})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'blur(3px) brightness(0.6)',
          transform: 'scale(1.1)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)',
        }} />
        {/* Back button */}
        <button
          className="gp-press-sm"
          onClick={() => setShowVerification(false)}
          style={{
            position: 'absolute', top: 14, left: 14, zIndex: 10,
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ArrowLeft size={18} color="#fff" />
        </button>
        <div style={{
          position: 'absolute', bottom: 20, left: 20, right: 20,
        }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
            {guidebook.propertyName}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
            Mar 22 – Mar 27 · 5 nights
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: G.text }}>Pre-Check-in Verification</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: G.textMuted }}>Step {verificationStep + 1} of {VERIFICATION_STEPS.length}</span>
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          {VERIFICATION_STEPS.map((_, idx) => (
            <div key={idx} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: idx <= verificationStep ? G.accent : G.surfaceHover,
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
        {/* Disclaimer */}
        <div style={{
          padding: '8px 12px', borderRadius: 10, marginBottom: 16,
          background: `${G.amber}0a`, border: `1px solid ${G.amber}18`,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Lock size={12} color={G.amber} />
          <span style={{ fontSize: 11, fontWeight: 600, color: G.textBody, lineHeight: 1.4 }}>
            Complete all steps to unlock check-in instructions, door codes, and access details
          </span>
        </div>
      </div>

      {/* Current step card */}
      <div style={{ padding: '0 20px', flex: 1 }}>
        {(() => {
          const step = VERIFICATION_STEPS[verificationStep]
          const StepIcon = step.icon
          return (
            <div style={{
              padding: 18, borderRadius: 18,
              background: G.surface, border: `1px solid ${G.border}`,
              boxShadow: G.shadowMd, marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${step.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <StepIcon size={18} color={step.color} />
                </div>
                <span style={{ fontSize: 15, fontWeight: 800, color: G.text }}>{step.title}</span>
              </div>
              {step.content}
            </div>
          )
        })()}
      </div>

      {/* CTA buttons */}
      <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          className="gp-press"
          onClick={() => {
            if (verificationStep < VERIFICATION_STEPS.length - 1) {
              setVerificationStep(s => s + 1)
            } else {
              showToast('All verified! Check-in unlocked ✓')
              setVerificationComplete(true)
              setTimeout(() => setShowVerification(false), 600)
            }
          }}
          style={{
            width: '100%', padding: '14px 24px', borderRadius: 999,
            background: G.accent, color: G.accentFg, border: 'none',
            fontSize: 14, fontWeight: 800, cursor: 'pointer',
            fontFamily: 'inherit', transition: 'all 0.2s',
            boxShadow: `0 4px 16px ${G.accent}44`,
          }}
        >
          {verificationStep < VERIFICATION_STEPS.length - 1 ? 'Confirm & Continue' : 'Complete Verification'}
        </button>
        {verificationStep > 0 && (
          <button
            className="gp-press-sm"
            onClick={() => setVerificationStep(s => s - 1)}
            style={{
              width: '100%', padding: '10px 20px', borderRadius: 999,
              background: 'transparent', border: `1px solid ${G.border}`,
              color: G.textMuted, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >Back</button>
        )}
      </div>
    </div>
  )

  // ——— Chat Sheet ———————————————————————————————————————
  const chatSheet = chatOpen && (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      fontFamily: 'var(--font-nunito), var(--font-sans)',
    }}>
      <div
        onClick={() => setChatOpen(false)}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
      />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        maxHeight: '85vh',
        background: G.surface, borderRadius: '20px 20px 0 0',
        boxShadow: G.shadowLg,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: `1px solid ${G.border}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src={PREVIEW_IMAGES.hostAvatar}
              alt="Host"
              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: G.text }}>Chat with Host</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: G.accent }}>Online</div>
            </div>
          </div>
          <button
            className="gp-press-sm"
            onClick={() => setChatOpen(false)}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: G.surfaceHover, border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} color={G.textMuted} />
          </button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflow: 'auto', padding: '14px 18px',
          display: 'flex', flexDirection: 'column', gap: 8,
          maxHeight: '50vh', scrollbarWidth: 'none',
        }}>
          {chatMessages.map(msg => (
            <div key={msg.id} style={{
              display: 'flex', justifyContent: msg.from === 'guest' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '80%', padding: '10px 14px', borderRadius: 16,
                background: msg.from === 'guest' ? G.accent : G.surfaceHover,
                color: msg.from === 'guest' ? '#fff' : G.text,
                fontSize: 13, fontWeight: 600, lineHeight: 1.45,
                borderBottomRightRadius: msg.from === 'guest' ? 4 : 16,
                borderBottomLeftRadius: msg.from === 'host' ? 4 : 16,
              }}>
                {msg.text}
                <div style={{
                  fontSize: 9, fontWeight: 600, marginTop: 4,
                  color: msg.from === 'guest' ? 'rgba(255,255,255,0.6)' : G.textMuted,
                  textAlign: msg.from === 'guest' ? 'right' : 'left',
                }}>{msg.time}</div>
              </div>
            </div>
          ))}
          {chatTyping && (
            <div style={{
              display: 'flex', justifyContent: 'flex-start',
            }}>
              <div style={{
                padding: '10px 14px', borderRadius: 16, borderBottomLeftRadius: 4,
                background: G.surfaceHover,
                fontSize: 13, fontWeight: 600, color: G.textMuted,
              }}>
                Typing...
              </div>
            </div>
          )}
        </div>

        {/* Quick replies */}
        <div style={{
          display: 'flex', gap: 6, padding: '8px 18px',
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {CHAT_QUICK_REPLIES.map(reply => (
            <button
              key={reply}
              className="gp-press-sm"
              onClick={() => sendChatMessage(reply)}
              style={{
                padding: '6px 12px', borderRadius: 999, flexShrink: 0,
                background: G.accentBg, border: `1px solid ${G.accent}33`,
                color: G.accent, fontSize: 11, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}
            >{reply}</button>
          ))}
        </div>

        {/* Input */}
        <div style={{
          display: 'flex', gap: 8, padding: '10px 18px 18px',
          borderTop: `1px solid ${G.border}`,
        }}>
          <input
            type="text"
            placeholder="Type a message..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') sendChatMessage(chatInput) }}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 14,
              background: G.surfaceHover, border: `1px solid ${G.border}`,
              color: G.text, fontSize: 13, fontWeight: 500,
              fontFamily: 'inherit', outline: 'none',
            }}
          />
          <button
            className="gp-press-sm"
            onClick={() => sendChatMessage(chatInput)}
            style={{
              width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
              background: G.accent, border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Send size={16} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  )

  // ——— Verification screen (toggled, not gate) ——————————————
  if (showVerification) {
    return (
      <>
        <PhoneFrame toast={toast}>
          {verificationFlow}
        </PhoneFrame>
        {chatSheet}
      </>
    )
  }

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
                      action: () => { setHelpMenuOpen(false); setChatOpen(true) } },
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

            {/* Cart FAB badge */}
            {addedServices.size > 0 && !helpMenuOpen && (
              <button
                onClick={() => setCartOpen(true)}
                className="gp-press-sm"
                style={{
                  position: 'absolute', bottom: 150, right: 20, zIndex: 199,
                  width: 48, height: 48, borderRadius: '50%',
                  background: G.surface, border: `1px solid ${G.border}`,
                  boxShadow: G.shadowLg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <ShoppingCart size={20} color={G.accent} />
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 20, height: 20, borderRadius: '50%',
                  background: G.red ?? '#C43333', color: '#fff',
                  fontSize: 10, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{addedServices.size}</span>
              </button>
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
              <MessageCircle size={22} color={G.accentFg} />
            </button>
          </>
        }
      >{portalContent}</PhoneFrame>

      {/* Structured Issue Reporting Sheet */}
      {issueOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 400,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}>
          <div onClick={() => setIssueOpen(false)} style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.5)',
          }} />
          <div style={{
            position: 'relative', zIndex: 1,
            width: '100%', maxWidth: 430, maxHeight: '80vh',
            background: G.bg, borderRadius: '24px 24px 0 0',
            overflow: 'auto',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 20px 0',
            }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: G.text }}>Report an Issue</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: G.textMuted, marginTop: 2 }}>We&apos;ll notify your host right away</div>
              </div>
              <button onClick={() => setIssueOpen(false)} style={{
                width: 36, height: 36, borderRadius: '50%',
                background: G.surfaceHover, border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <X size={18} color={G.textMuted} />
              </button>
            </div>

            <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Category pills */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: G.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Category</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {ISSUE_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      className="gp-press-sm"
                      onClick={() => setIssueCategory(cat)}
                      style={{
                        padding: '8px 14px', borderRadius: 999,
                        background: issueCategory === cat ? G.accent : G.surfaceHover,
                        color: issueCategory === cat ? G.accentFg : G.textBody,
                        border: issueCategory === cat ? 'none' : `1px solid ${G.border}`,
                        fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        fontFamily: 'inherit', transition: 'all 0.15s',
                      }}
                    >{cat}</button>
                  ))}
                </div>
              </div>

              {/* Description textarea */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: G.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Description</div>
                <textarea
                  value={issueDesc}
                  onChange={e => setIssueDesc(e.target.value)}
                  placeholder="Describe the issue..."
                  style={{
                    width: '100%', minHeight: 80, padding: 12, borderRadius: 12,
                    background: G.surfaceHover, border: `1px solid ${G.border}`,
                    color: G.text, fontSize: 13, fontWeight: 600,
                    fontFamily: 'inherit', resize: 'vertical',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Add Photo button */}
              <button
                className="gp-press-sm"
                onClick={() => showToast('Camera opening...')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '10px 16px', borderRadius: 12,
                  background: G.surfaceHover, border: `1px dashed ${G.border}`,
                  color: G.textBody, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <Camera size={16} color={G.textMuted} /> Add Photo
              </button>

              {/* PTE toggle */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: 14,
                background: G.surfaceHover, border: `1px solid ${G.border}`,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: G.text }}>Can we enter to fix it?</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: G.textMuted, marginTop: 2 }}>Permission to enter while you&apos;re out</div>
                </div>
                <button
                  className="gp-press-sm"
                  onClick={() => setIssuePte(v => !v)}
                  style={{
                    width: 44, height: 26, borderRadius: 999, padding: 2,
                    background: issuePte ? G.accent : G.surfaceHover,
                    border: issuePte ? 'none' : `2px solid ${G.border}`,
                    cursor: 'pointer', position: 'relative',
                    transition: 'background 0.2s',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: issuePte ? G.accentFg : G.textMuted,
                    transition: 'transform 0.2s',
                    transform: issuePte ? 'translateX(18px)' : 'translateX(0)',
                  }} />
                </button>
              </div>

              {/* Submit */}
              <button
                className="gp-press"
                onClick={() => {
                  showToast('Issue reported — your host has been notified ✓')
                  setIssueOpen(false)
                  setIssueCategory(null)
                  setIssueDesc('')
                  setIssuePte(false)
                }}
                style={{
                  width: '100%', padding: '14px 20px', borderRadius: 999,
                  background: G.accent, color: G.accentFg, border: 'none',
                  fontSize: 14, fontWeight: 800, cursor: 'pointer',
                  fontFamily: 'inherit',
                  opacity: (!issueCategory && !issueDesc) ? 0.5 : 1,
                  boxShadow: `0 4px 16px ${G.accent}44`,
                }}
              >Submit Report</button>
            </div>
          </div>
        </div>
      )}

      {/* Review & Feedback Sheet */}
      {reviewOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 400,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}>
          <div onClick={() => setReviewOpen(false)} style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.5)',
          }} />
          <div style={{
            position: 'relative', zIndex: 1,
            width: '100%', maxWidth: 430, maxHeight: '85vh',
            background: G.bg, borderRadius: '24px 24px 0 0',
            overflow: 'auto',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 20px 0',
            }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: G.text }}>How was your stay at {guidebook.propertyName}?</div>
              </div>
              <button onClick={() => setReviewOpen(false)} style={{
                width: 36, height: 36, borderRadius: '50%',
                background: G.surfaceHover, border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
              }}>
                <X size={18} color={G.textMuted} />
              </button>
            </div>

            <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {!reviewSubmitted ? (
                <>
                  {/* Rating categories */}
                  {REVIEW_CATEGORIES.map(cat => (
                    <div key={cat} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: 14,
                      background: G.surfaceHover, border: `1px solid ${G.border}`,
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: G.text }}>{cat}</span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <button
                            key={s}
                            className="gp-press-sm"
                            onClick={() => setReviewRatings(prev => ({ ...prev, [cat]: s }))}
                            style={{
                              background: 'none', border: 'none', padding: 2,
                              cursor: 'pointer',
                            }}
                          >
                            <Star size={18} color={s <= (reviewRatings[cat] ?? 0) ? '#FFC107' : G.textFaint} fill={s <= (reviewRatings[cat] ?? 0) ? '#FFC107' : 'none'} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Free text */}
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="Anything you'd like us to know?"
                    style={{
                      width: '100%', minHeight: 80, padding: 12, borderRadius: 12,
                      background: G.surfaceHover, border: `1px solid ${G.border}`,
                      color: G.text, fontSize: 13, fontWeight: 600,
                      fontFamily: 'inherit', resize: 'vertical',
                      outline: 'none',
                    }}
                  />

                  {/* Submit */}
                  <button
                    className="gp-press"
                    onClick={() => {
                      setReviewSubmitted(true)
                    }}
                    style={{
                      width: '100%', padding: '14px 20px', borderRadius: 999,
                      background: G.accent, color: G.accentFg, border: 'none',
                      fontSize: 14, fontWeight: 800, cursor: 'pointer',
                      fontFamily: 'inherit',
                      opacity: Object.keys(reviewRatings).length === 0 ? 0.5 : 1,
                      boxShadow: `0 4px 16px ${G.accent}44`,
                    }}
                  >Submit Review</button>
                </>
              ) : (() => {
                const avg = Object.values(reviewRatings).length > 0
                  ? Object.values(reviewRatings).reduce((a, b) => a + b, 0) / Object.values(reviewRatings).length
                  : 0
                return (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>🙏</div>
                    {avg >= 4 ? (
                      <>
                        <div style={{ fontSize: 15, fontWeight: 800, color: G.text, marginBottom: 8 }}>
                          Thank you! Would you like to leave a public review?
                        </div>
                        <button
                          className="gp-press"
                          onClick={() => {
                            showToast('Opening review page...')
                            setReviewOpen(false)
                          }}
                          style={{
                            padding: '12px 24px', borderRadius: 999,
                            background: G.accent, color: G.accentFg, border: 'none',
                            fontSize: 13, fontWeight: 800, cursor: 'pointer',
                            fontFamily: 'inherit', marginTop: 8,
                          }}
                        >Leave Review →</button>
                      </>
                    ) : (
                      <div style={{ fontSize: 15, fontWeight: 800, color: G.text }}>
                        Thank you for your feedback — we&apos;ll use this to improve.
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Cart Sheet */}
      {cartOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 400,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}>
          <div onClick={() => setCartOpen(false)} style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.5)',
          }} />
          <div style={{
            position: 'relative', zIndex: 1,
            width: '100%', maxWidth: 430, maxHeight: '80vh',
            background: G.bg, borderRadius: '24px 24px 0 0',
            overflow: 'auto',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 20px 0',
            }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: G.text }}>Your Cart</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: G.textMuted, marginTop: 2 }}>
                  {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
                </div>
              </div>
              <button onClick={() => setCartOpen(false)} style={{
                width: 36, height: 36, borderRadius: '50%',
                background: G.surfaceHover, border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <X size={18} color={G.textMuted} />
              </button>
            </div>

            {/* Items */}
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cartItems.map(item => {
                const cat = UPSELL_CATEGORY_ICON[item.category]
                const CatIcon = cat?.icon ?? Gift
                return (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 14,
                    background: G.surface, border: `1px solid ${G.border}`,
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                      background: `rgba(${cat?.rgb ?? '236,72,153'}, 0.12)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CatIcon size={18} color={cat?.color ?? '#EC4899'} strokeWidth={1.5} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: G.text }}>{item.title}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: G.accent, marginTop: 2 }}>
                        {item.price} {item.currency ?? 'NOK'}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAddService(item.id)}
                      style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: `${G.red ?? '#C43333'}12`, border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={14} color={G.red ?? '#C43333'} />
                    </button>
                  </div>
                )
              })}

              {cartItems.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px 0', color: G.textMuted, fontSize: 13 }}>
                  Your cart is empty
                </div>
              )}
            </div>

            {/* Subtotal & Payment */}
            {cartItems.length > 0 && (
              <div style={{ padding: '0 20px 24px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 0', borderTop: `1px solid ${G.border}`,
                  marginBottom: 14,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: G.text }}>Subtotal</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: G.text }}>{cartTotal} NOK</span>
                </div>

                {/* Payment method */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px', borderRadius: 12,
                  background: G.surface, border: `1px solid ${G.border}`,
                  marginBottom: 14,
                }}>
                  <CreditCard size={18} color={G.textMuted} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: G.text }}>Visa ••••4242</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: G.textMuted }}>From verification</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: G.textFaint }}>Change</span>
                </div>

                {/* Checkout CTA */}
                <button
                  className="gp-press"
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  style={{
                    width: '100%', padding: '15px 20px', borderRadius: 999,
                    background: G.accent, color: G.accentFg, border: 'none',
                    fontSize: 15, fontWeight: 800, cursor: 'pointer',
                    fontFamily: 'inherit', opacity: checkingOut ? 0.7 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: `0 4px 16px ${G.accent}44`,
                  }}
                >
                  {checkingOut ? (
                    <><Loader2 size={16} className="animate-spin" /> Processing...</>
                  ) : (
                    <>Confirm & Pay — {cartTotal} NOK</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {chatSheet}
    </>
  )
}

// ——— Phone device frame ——————————————————————————————————————
function PhoneFrame({ children, toast, fab }: { children: React.ReactNode; toast: string | null; fab?: React.ReactNode }) {
  const { theme: G } = useGuestTheme()
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
          background: G.accent, color: G.accentFg,
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

        {/* ── Realistic iPhone 16 Pro Max frame ── */}
        <div style={{ position: 'relative' }}>
          {/* Side buttons — Left */}
          {/* Silent switch */}
          <div style={{
            position: 'absolute', left: -2, top: 120,
            width: 4, height: 28, borderRadius: 2,
            background: 'linear-gradient(180deg, #3a3b4a 0%, #2a2b3a 100%)',
            boxShadow: '-1px 0 3px rgba(0,0,0,0.4)',
          }} />
          {/* Volume Up */}
          <div style={{
            position: 'absolute', left: -2, top: 178,
            width: 4, height: 56, borderRadius: 2,
            background: 'linear-gradient(180deg, #3a3b4a 0%, #2a2b3a 100%)',
            boxShadow: '-1px 0 3px rgba(0,0,0,0.4)',
          }} />
          {/* Volume Down */}
          <div style={{
            position: 'absolute', left: -2, top: 248,
            width: 4, height: 56, borderRadius: 2,
            background: 'linear-gradient(180deg, #3a3b4a 0%, #2a2b3a 100%)',
            boxShadow: '-1px 0 3px rgba(0,0,0,0.4)',
          }} />
          {/* Side button — Right (Power) */}
          <div style={{
            position: 'absolute', right: -2, top: 200,
            width: 4, height: 72, borderRadius: 2,
            background: 'linear-gradient(180deg, #3a3b4a 0%, #2a2b3a 100%)',
            boxShadow: '1px 0 3px rgba(0,0,0,0.4)',
          }} />

          {/* Outer titanium shell */}
          <div
            className="phone-frame-bezel"
            style={{
              position: 'relative',
              width: 446, height: 948,
              borderRadius: 58,
              background: 'linear-gradient(145deg, #2e2f3e 0%, #1e1f2e 50%, #2a2b3a 100%)',
              boxShadow: '0 32px 100px rgba(0,0,0,0.6), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.3)',
              padding: 8,
            }}
          >
            {/* Titanium edge highlight */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 58,
              border: '1px solid rgba(255,255,255,0.06)',
              pointerEvents: 'none',
            }} />

            {/* Speaker grille */}
            <div style={{
              position: 'absolute', top: 3, left: '50%', transform: 'translateX(-50%)',
              width: 44, height: 3, borderRadius: 1.5,
              background: '#15161e',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.6)',
            }} />

            {/* Inner screen area */}
            <div style={{
              position: 'relative',
              width: 430, height: 932,
              borderRadius: 50,
              overflow: 'hidden',
              background: G.bg,
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Dynamic Island */}
              <div style={{
                position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
                width: 126, height: 36, borderRadius: 18,
                background: '#000',
                zIndex: 200,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}>
                {/* Camera lens */}
                <div style={{
                  position: 'absolute', right: 28, top: '50%', transform: 'translateY(-50%)',
                  width: 12, height: 12, borderRadius: '50%',
                  background: 'radial-gradient(circle at 40% 40%, #1a1a2e 0%, #0a0a15 60%, #000 100%)',
                  boxShadow: 'inset 0 0 2px rgba(255,255,255,0.1), 0 0 1px rgba(0,0,0,0.5)',
                }}>
                  {/* Lens reflection */}
                  <div style={{
                    position: 'absolute', top: 2, left: 3,
                    width: 3, height: 2, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                  }} />
                </div>
              </div>

              {/* Status bar — flanking Dynamic Island */}
              <div style={{
                height: 54, flexShrink: 0,
                background: G.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 28px',
                position: 'relative', zIndex: 100,
              }}>
                {/* Time — left of Dynamic Island */}
                <span style={{ fontSize: 15, fontWeight: 700, color: G.text, marginTop: 2 }}>9:41</span>
                {/* Icons — right of Dynamic Island */}
                <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginTop: 2 }}>
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
                background: G.accent, color: G.accentFg,
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

              {/* Home indicator */}
              <div style={{
                flexShrink: 0,
                display: 'flex', justifyContent: 'center',
                paddingBottom: 8, paddingTop: 4,
                background: G.bg,
              }}>
                <div style={{
                  width: 134, height: 5, borderRadius: 2.5,
                  background: 'rgba(255,255,255,0.2)',
                }} />
              </div>

              {/* Floating overlays (FAB) */}
              {fab}
            </div>
          </div>
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

        /* ── Press feedback (tap scale + hover lift) ── */
        .gp-press {
          transition: transform 0.2s cubic-bezier(0.25,1,0.5,1), box-shadow 0.2s, border-color 0.15s !important;
        }
        @media (hover: hover) {
          .gp-press:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
          }
        }
        .gp-press:active {
          transform: scale(0.97) !important;
          transition-duration: 0.1s !important;
        }
        .gp-press-sm {
          transition: transform 0.2s cubic-bezier(0.25,1,0.5,1), background 0.15s, color 0.15s, border-color 0.15s !important;
        }
        @media (hover: hover) {
          .gp-press-sm:hover {
            transform: translateY(-1px) !important;
          }
        }
        .gp-press-sm:active {
          transform: scale(0.94) !important;
          transition-duration: 0.1s !important;
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

        /* ── Staggered section entrance ── */
        @keyframes gpFadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .gp-section-enter > * {
          animation: gpFadeSlideUp 0.4s cubic-bezier(0.25,1,0.5,1) both;
        }
        .gp-section-enter > *:nth-child(1) { animation-delay: 0.04s; }
        .gp-section-enter > *:nth-child(2) { animation-delay: 0.08s; }
        .gp-section-enter > *:nth-child(3) { animation-delay: 0.12s; }
        .gp-section-enter > *:nth-child(4) { animation-delay: 0.16s; }
        .gp-section-enter > *:nth-child(5) { animation-delay: 0.20s; }
        .gp-section-enter > *:nth-child(6) { animation-delay: 0.24s; }
        .gp-section-enter > *:nth-child(7) { animation-delay: 0.28s; }
        .gp-section-enter > *:nth-child(8) { animation-delay: 0.32s; }
        .gp-section-enter > *:nth-child(n+9) { animation-delay: 0.36s; }

        @media (prefers-reduced-motion: reduce) {
          .gp-section-enter > * { animation: none !important; }
          .gp-press:hover, .gp-press-sm:hover { transform: none !important; }
        }
      `}</style>
    </>
  )
}

// ——— Local UI helpers ————————————————————————————————————————
function SectionTitle({ children }: { children: React.ReactNode }) {
  const { theme: G } = useGuestTheme()
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
  const { theme: G } = useGuestTheme()
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

const CONDITION_LABELS: Record<DayForecast['condition'], string> = {
  sunny: 'Sunny',
  partly_cloudy: 'Partly cloudy',
  cloudy: 'Cloudy',
  rain: 'Rain',
  snow: 'Snow',
  storm: 'Storm',
  windy: 'Windy',
}

const WEATHER_ICON_MAP: Record<DayForecast['condition'], { icon: typeof Sun; color: string | null }> = {
  sunny:         { icon: Sun,            color: '#F5A623' },
  partly_cloudy: { icon: CloudSun,       color: '#F5A623' },
  cloudy:        { icon: Cloud,          color: null },
  rain:          { icon: CloudRain,      color: '#4A9EFF' },
  snow:          { icon: CloudSnow,      color: '#4A9EFF' },
  storm:         { icon: CloudLightning, color: '#FF4D4D' },
  windy:         { icon: Wind,           color: null },
}

function WeatherIcon({ condition, size }: { condition: DayForecast['condition']; size: number }) {
  const { theme } = useGuestTheme()
  const { icon: Icon, color } = WEATHER_ICON_MAP[condition]
  return <Icon size={size} color={color ?? theme.textMuted} />
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
