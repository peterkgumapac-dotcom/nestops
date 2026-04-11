import Link from 'next/link'
import { FeatureContent, FEATURES } from '../_data/features'

type Props = { feature: FeatureContent }

export function FeaturePage({ feature }: Props) {
  const others = Object.values(FEATURES).filter((f) => f.slug !== feature.slug)

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#070C16',
        color: '#E2E8F0',
        fontFamily: 'var(--font-sans), Inter, sans-serif',
      }}
    >
      <nav style={{ padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/features" style={{ color: '#CBD5E1', textDecoration: 'none', fontWeight: 600 }}>
          ← AfterStay
        </Link>
      </nav>

      <section style={{ maxWidth: 880, margin: '0 auto', padding: '96px 32px 64px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${feature.color}55`,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: feature.color,
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 16 }}>{feature.icon}</span>
          {feature.eyebrow}
        </div>
        <h1
          style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            lineHeight: 1.05,
            fontWeight: 700,
            margin: '0 0 24px',
            color: '#FFF',
          }}
        >
          {feature.headline}
        </h1>
        <p style={{ fontSize: 20, lineHeight: 1.55, color: '#94A3B8', maxWidth: 720 }}>
          {feature.subhead}
        </p>
      </section>

      <section style={{ maxWidth: 880, margin: '0 auto', padding: '0 32px 48px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', color: '#94A3B8', marginBottom: 12 }}>
          THE PROBLEM
        </div>
        <p
          style={{
            margin: 0,
            padding: '16px 20px',
            borderLeft: `3px solid ${feature.color}`,
            background: `${feature.color}0a`,
            color: '#CBD5E1',
            fontSize: 17,
            lineHeight: 1.65,
          }}
        >
          {feature.problem}
        </p>
      </section>

      <section style={{ maxWidth: 880, margin: '0 auto', padding: '0 32px 64px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', color: '#94A3B8', marginBottom: 16 }}>
          HOW IT PLAYS OUT
        </div>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 }}>
          {feature.storyboard.map((beat, i) => (
            <li
              key={i}
              style={{
                display: 'flex',
                gap: 16,
                padding: '14px 18px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  background: feature.color,
                  color: '#0c0d14',
                  fontWeight: 700,
                  fontSize: 13,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {i + 1}
              </span>
              <span style={{ color: '#CBD5E1', lineHeight: 1.55 }}>{beat}</span>
            </li>
          ))}
        </ol>
      </section>

      <section style={{ maxWidth: 880, margin: '0 auto', padding: '0 32px 64px' }}>
        <div style={{ display: 'grid', gap: 20 }}>
          {feature.sections.map((s) => (
            <div
              key={s.heading}
              style={{
                padding: '28px 32px',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <h3 style={{ margin: '0 0 8px', fontSize: 20, color: '#FFF', fontWeight: 600 }}>{s.heading}</h3>
              <p style={{ margin: 0, color: '#94A3B8', lineHeight: 1.6 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 880, margin: '0 auto', padding: '0 32px 64px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', color: '#94A3B8', marginBottom: 12 }}>
          THE MOAT
        </div>
        <div
          style={{
            padding: '22px 26px',
            borderRadius: 14,
            background: `${feature.color}14`,
            border: `1px solid ${feature.color}59`,
            color: '#F5EDE6',
            fontSize: 17,
            fontWeight: 600,
            lineHeight: 1.55,
          }}
        >
          {feature.moat}
        </div>
      </section>

      <section style={{ maxWidth: 880, margin: '0 auto', padding: '0 32px 96px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', color: '#64748B', marginBottom: 16 }}>
          OTHER MODULES
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {others.map((o) => (
            <Link
              key={o.slug}
              href={`/features/${o.slug}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${o.color}44`,
                color: '#CBD5E1',
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              <span>{o.icon}</span>
              {o.title}
            </Link>
          ))}
        </div>
      </section>

      <section
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '64px 32px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: 32, fontWeight: 700, color: '#FFF', margin: '0 0 12px' }}>
          See it in action.
        </h2>
        <p style={{ color: '#94A3B8', margin: '0 0 24px' }}>
          One platform. Twelve modules. Your operation, finally on one screen.
        </p>
        <Link
          href="/features"
          style={{
            display: 'inline-block',
            padding: '14px 28px',
            borderRadius: 12,
            background: '#5e6ad2',
            color: '#FFF',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Back to overview
        </Link>
      </section>
    </main>
  )
}
