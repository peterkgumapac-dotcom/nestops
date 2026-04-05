'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, Clock, Zap } from 'lucide-react'
import { useRole } from '@/context/RoleContext'

interface NavItem {
  label: string
  href: string
  category: string
}

const OPERATOR_PAGES: NavItem[] = [
  { label: 'Dashboard', href: '/operator', category: 'Pages' },
  { label: 'Guest Services', href: '/operator/guest-services', category: 'Pages' },
  { label: 'All Issues', href: '/operator/guest-services/issues', category: 'Pages' },
  { label: 'Refunds', href: '/operator/guest-services/refunds', category: 'Pages' },
  { label: 'Inventory', href: '/operator/inventory', category: 'Pages' },
  { label: 'Properties', href: '/operator/properties', category: 'Pages' },
  { label: 'Team', href: '/operator/team', category: 'Pages' },
  { label: 'Workspace', href: '/workspace', category: 'Pages' },
  { label: 'Compliance', href: '/operator/compliance', category: 'Pages' },
  { label: 'Upsells', href: '/operator/upsells', category: 'Pages' },
  { label: 'Guidebooks', href: '/operator/guidebooks', category: 'Pages' },
  { label: 'Verification', href: '/operator/verification', category: 'Pages' },
]

const ACTIONS = [
  { label: 'New Issue', href: '/operator/guest-services', category: 'Actions', action: 'new-issue' },
  { label: 'Log Refund', href: '/operator/guest-services/refunds', category: 'Actions', action: 'log-refund' },
  { label: 'New Task', href: '/workspace', category: 'Actions', action: 'new-task' },
]

const RECENT_KEY = 'afterstay_cmd_recent'

function getRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function addRecent(href: string) {
  try {
    const current = getRecent().filter(h => h !== href)
    localStorage.setItem(RECENT_KEY, JSON.stringify([href, ...current].slice(0, 5)))
  } catch {}
}

export default function CommandPalette() {
  const { accent } = useRole()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const [recent, setRecent] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => {
          if (!o) setRecent(getRecent())
          return !o
        })
        setQuery('')
        setSelected(0)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  const allItems: NavItem[] = query
    ? [
        ...ACTIONS.filter(a => a.label.toLowerCase().includes(query.toLowerCase())),
        ...OPERATOR_PAGES.filter(p => p.label.toLowerCase().includes(query.toLowerCase())),
      ]
    : [
        ...ACTIONS,
        ...recent.map(href => {
          const page = OPERATOR_PAGES.find(p => p.href === href)
          return page ? { ...page, category: 'Recent' } : null
        }).filter(Boolean) as NavItem[],
      ]

  useEffect(() => { setSelected(0) }, [query])

  const handleSelect = (item: NavItem) => {
    addRecent(item.href)
    router.push(item.href)
    setOpen(false)
    setQuery('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, allItems.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && allItems[selected]) handleSelect(allItems[selected])
  }

  if (!open) return null

  // Group items
  const groups: Record<string, NavItem[]> = {}
  let globalIdx = 0
  const itemIdxMap: NavItem[] = []
  allItems.forEach(item => {
    groups[item.category] = groups[item.category] ?? []
    groups[item.category].push(item)
    itemIdxMap.push(item)
  })

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '15vh' }}
      onClick={() => setOpen(false)}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
      <div
        style={{
          position: 'relative', width: '100%', maxWidth: 520,
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 14, boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <Search size={16} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages or type a command…"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: 15, color: 'var(--text-primary)',
            }}
          />
          <kbd style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-subtle)' }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 360, overflowY: 'auto', padding: '8px 0' }}>
          {allItems.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13 }}>
              No results for &quot;{query}&quot;
            </div>
          ) : (
            Object.entries(groups).map(([category, items]) => {
              return (
                <div key={category}>
                  <div style={{ padding: '6px 16px 4px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-subtle)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {category === 'Recent' && <Clock size={10} />}
                    {category === 'Actions' && <Zap size={10} />}
                    {category}
                  </div>
                  {items.map(item => {
                    const idx = itemIdxMap.indexOf(item)
                    const isSelected = idx === selected
                    return (
                      <button
                        key={item.href + item.label}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelected(idx)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          width: '100%', padding: '10px 16px',
                          background: isSelected ? `${accent}14` : 'transparent',
                          border: 'none', cursor: 'pointer', textAlign: 'left',
                          transition: 'background 0.1s',
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: isSelected ? 500 : 400, color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)', flex: 1 }}>
                          {item.label}
                        </span>
                        {isSelected && <ArrowRight size={13} style={{ color: accent, flexShrink: 0 }} />}
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        {/* Footer hint */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 12 }}>
          {[['↑↓', 'Navigate'], ['↵', 'Open'], ['Esc', 'Close']].map(([key, label]) => (
            <span key={key} style={{ fontSize: 11, color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <kbd style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
