# AfterStay / NestOps — UI Design Standard

Next.js 15 · Tailwind v4 · framer-motion · shadcn/ui (base-ui) · Lucide icons
See `~/.claude/projects/*/memory/` for business context, pricing, and competitive positioning.

---

## Quality Bar

**Reference:** Dribbble-grade dark SaaS aesthetic — depth through elevation, not borders.

- Depth comes from layered surfaces + shadow, not outlines
- Restrained color: cool blue-gray neutrals + one accent per portal
- Generous whitespace — never cramped
- Subtle, purposeful motion — no gratuitous animation
- **If it looks like default shadcn, it needs more work**

Anti-patterns: flat white cards, uniform gray backgrounds, cluttered layouts, rainbow color usage.

---

## Color System

### Surface Hierarchy (unified cool blue-gray — all portals)

| Level | Token | Hex | Use |
|-------|-------|-----|-----|
| L0 | `--bg-page` | `#0c0d14` | Page background |
| L1 | `--bg-surface` | `#14151e` | Sidebar, rail, panels |
| L2 | `--bg-card` | `#1c1d2a` | Cards, sheets, modals |
| L3 | `--bg-elevated` | `#262838` | Hover states, selected items, inputs, nested cards |

**Rule: Child surface MUST be one level above parent. Never skip levels.**

### Borders

| Token | Value | Use |
|-------|-------|-----|
| `--border` | `rgba(255,255,255,0.07)` | Standard borders |
| `--border-subtle` | `rgba(255,255,255,0.04)` | Hairline/subtle borders |

### Operator Panel

`.operator-mesh-outer` adds the floating-panel effect (purple mesh gradient, rounded shell, shadow). It inherits root tokens — only these extras are scoped:

| Token | Value | Use |
|-------|-------|-----|
| `--panel-bg` | `#161720` | Panel shell background |
| `--border-hair` | `rgba(255,255,255,0.05)` | Extra-subtle panel borders |
| `--accent-gradient` | `linear-gradient(135deg, #14b8a6, #10b981, #34d399)` | Teal→green accent gradient |
| `--progress-gradient` | `linear-gradient(90deg, #ec4899, #a78bfa, #60a5fa)` | Decorative progress bars |

### Text Colors

| Token | Hex (dark) | Use |
|-------|-----------|-----|
| `--text-primary` | `#eae8e4` | Headings, body text |
| `--text-muted` | `#8a8f9c` | Secondary labels, descriptions |
| `--text-subtle` | `#4a4f5c` | Timestamps, disabled, placeholders |

### Accent & Status

**Accent per role** (set dynamically by `RoleContext`):

| Role | Token | Hex | Character |
|------|-------|-----|-----------|
| Operator | `--accent-operator` | `#14b8a6` | Teal |
| Owner | `--accent-owner` | `#10b981` | Emerald |
| Staff | `--accent-staff` | `#f59e0b` | Amber |

Accent derivative tokens (computed per role):
- `--accent-light`: lighter variant for hover/highlight
- `--accent-bg`: `rgba(accent, 0.08)` — tinted backgrounds
- `--accent-border`: `rgba(accent, 0.20)` — focus/hover borders

**Status badge pairs** — always use `bg` + `fg` together:

| Status | BG token | FG token |
|--------|----------|----------|
| Green | `--status-green-bg` | `--status-green-fg` |
| Red | `--status-red-bg` | `--status-red-fg` |
| Amber | `--status-amber-bg` | `--status-amber-fg` |
| Blue | `--status-blue-bg` | `--status-blue-fg` |
| Purple | `--status-purple-bg` | `--status-purple-fg` |
| Muted | `--status-muted-bg` | `--status-muted-fg` |

**Semantic status** (for inline indicators): `--status-success`, `--status-warning`, `--status-danger`, `--status-info`, `--status-neutral` (+ `*-bg` variants).

---

## Typography Scale

| Level | Size | Weight | Class | Use |
|-------|------|--------|-------|-----|
| T1 Page title | `text-2xl` | 600 | `heading text-2xl` | Page headings via `<PageHeader>` |
| T2 Section | `text-base` | 600 | `heading text-base` | Section headings |
| T3 Card title | `text-sm` | 500 | `text-sm font-medium` | Card/list item titles |
| T4 Metadata | `text-xs` | 400 | `text-xs text-[var(--text-muted)]` | Timestamps, counts |
| Label | 11px upper | 500 | `label-upper` | Section labels, column headers |

**Rules:**
- Font: Inter (system fallback: `system-ui, sans-serif`)
- Max weight: `font-semibold` (600) — never use `font-bold` (700)
- Headings use `.heading` class (adds `letter-spacing: -0.02em`)
- Always use `<PageHeader>` component for T1

---

## Spacing

| Context | Value | Class |
|---------|-------|-------|
| Page padding | Handled by shell (`main-content`) | 16px mobile, 24px desktop |
| Card internal | 16-20px | `p-4` or `p-5` |
| Card grid gap | 12px | `gap-3` |
| Section gap | 20-28px | `space-y-5` to `space-y-7` |
| Section block | `.section-block` | 20px mobile, 28px desktop |
| Min touch target | 36px | `.touch-btn` |

---

## Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | 6px | Badges, small inputs |
| `--radius-md` | 8px | Standard buttons |
| `--radius-lg` | 10px | Default cards |
| `--radius-xl` | 14px | Stat cards, elevated panels |
| `--radius-2xl` | 20px | Large panels |
| `rounded-full` | pill | **Primary CTA buttons**, avatars, status badges |

---

## Component Patterns

### Cards

Always use `<Card>` from `components/ui/card.tsx`.

```tsx
// DO
<Card className="p-4">
  <h3 className="text-sm font-medium">Title</h3>
  <p className="text-xs text-[var(--text-muted)]">Description</p>
</Card>

// DON'T
<div className="bg-gray-800 rounded-md p-2 border border-gray-700">...</div>
```

- Minimum radius: `rounded-xl` (Card component applies this)
- Hover lift: add `.card` class for `translateY(-2px)` + shadow transition
- Nested cards: parent at L2, child at L3

### Status Dots

```tsx
<span className="w-2 h-2 rounded-full bg-[var(--status-green-fg)]" />
```

Place before titles to indicate live/active state. Use `live-dot` class for pulsing green dot.

### Progress Bars

```tsx
<div className="h-1.5 w-full rounded-full bg-[var(--bg-elevated)]">
  <div className="h-full rounded-full" style={{ width: '65%', background: 'var(--progress-gradient)' }} />
</div>
```

### Avatar Stacks

```tsx
<div className="flex -space-x-2">
  {avatars.slice(0, 4).map(a => (
    <div key={a.id} className="w-7 h-7 rounded-full border-2 border-[var(--bg-card)]" />
  ))}
  {avatars.length > 4 && <span className="...">+{avatars.length - 4}</span>}
</div>
```

Border color must match parent background.

### Buttons

```tsx
// Primary CTA — pill shape
<Button className="rounded-full px-5">Get Started</Button>

// Secondary
<Button variant="outline">Cancel</Button>

// Icon button
<Button variant="ghost" size="icon-sm"><Settings className="w-4 h-4" /></Button>
```

No `pill` CVA variant exists yet — use `className="rounded-full px-5"`.

### Pill Selectors

```tsx
<button className={cn(
  "rounded-full px-4 py-2 text-sm transition-colors",
  active
    ? "bg-[var(--accent)] text-white"
    : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
)}>
  Label
</button>
```

### Toggle Switch

Always use `<ToggleSwitch>` from `components/ui/toggle-switch.tsx`. Never build custom toggles.

```tsx
<ToggleSwitch checked={value} onChange={setValue} label="Auto-assign" />
```

### Sheets & Modals

- Side drawers: `<Sheet>` from `components/ui/sheet.tsx`
- Centered dialogs: `<Dialog>` from shadcn
- Mobile: sheets go fullscreen via `.modal-fullscreen-sm`

---

## Icons

Library: **Lucide React only** — no other icon libraries.

| Context | Size | Stroke |
|---------|------|--------|
| Inline with text | 14-16px | 1.5 |
| Card header | 18-20px | 1.5 |
| Nav rail | 20px | 1.5 |
| Empty state | 32-48px | 1 |

- Default color: `text-[var(--text-muted)]`
- Active/accent: `text-[var(--accent)]`
- Never use filled icon variants

---

## Animation & Motion

| Pattern | Values |
|---------|--------|
| Spring toggle | `stiffness: 500, damping: 30` |
| Fade in | `opacity: 0 → 1` |
| Slide up (card enter) | `opacity: 0, y: 8 → opacity: 1, y: 0` |
| Hover lift | CSS `translateY(-2px)` + shadow (`.card` class) |
| Feed item enter | `.feed-item-enter` keyframe (0.3s) |
| KPI tile hover | `translateY(-1px)` + glow border |

**Durations:**
- Hover transitions: 150-200ms
- Content transitions: 200-300ms
- Layout animations: use framer-motion `layout` prop

**Always** respect `prefers-reduced-motion` — already handled globally in `globals.css`.

---

## Responsive

| Class | Behavior |
|-------|----------|
| `.hide-sm` | Hidden on mobile (<768px) |
| `.stack-sm` | 2-col grid → single column |
| `.cardify-sm` | Table rows → stacked cards |
| `.pills-row` | Horizontal scroll on mobile |
| `.modal-fullscreen-sm` | Sheet/modal goes fullscreen |
| `.dash-grid` | 2-col → 1-col, right panel hidden |

- Operator panel drops aside column at <1100px
- Operator panel collapses rail at <760px
- Touch targets: min 36px (`.touch-btn` applies on mobile)

---

## Anti-Patterns

| NEVER | DO INSTEAD |
|-------|-----------|
| `bg-gray-800` or any hardcoded hex | `bg-[var(--bg-card)]` token vars |
| `bg-red-500` Tailwind color scale | `bg-[var(--status-red-bg)]` status tokens |
| Warm brown hex (`#0e0a08`, `#171210`, etc.) | Cool blue-gray tokens (`#0c0d14`, `#14151e`, etc.) |
| `rounded-md` on cards | `rounded-xl` minimum |
| `p-2` inside cards | `p-4` minimum |
| Raw `<div>` styled as card | `<Card>` component |
| `font-bold` (700) | `font-semibold` (600) max |
| `style={{ color: '#...' }}` | Tailwind + CSS vars |
| Same elevation parent + child | Parent one level below child |
| Building custom toggles | `<ToggleSwitch>` component |
| Non-Lucide icons | Lucide React only |
| `border` for visual depth | Shadow + elevation layers |

---

## Guest Portal Exception

The guest portal uses a **separate palette** — does NOT follow the rules above.

- **Light palette:** `G` object in `lib/guest/theme.ts` — cream/white surfaces
- **Dark palette:** `G_DARK` in `lib/guest/theme.ts` — cool gray + lime accent
- Light-mode-first design
- Font: Nunito (not Inter)
- All rules in this document apply to **operator, staff, and owner portals only**

---

## Token Gaps (known debt)

- No `pill` variant in Button CVA — use `className="rounded-full px-5"` for now
- Badge missing `warning`, `danger`, `info`, `purple` variants — use inline status token classes
- `--n-*` tokens are a parallel namespace (task engine) — merge into canonical tokens long-term
- `--radius-lg` (10px) on `.card` CSS class vs `rounded-xl` (14px) on `<Card>` component — prefer `<Card>`
