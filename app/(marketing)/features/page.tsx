import Link from 'next/link'
import type { Metadata } from 'next'
import { FEATURE_LIST } from './_data/features'

export const metadata: Metadata = {
  title: 'Features — AfterStay',
  description:
    '12 things AfterStay does. No competitor does any of them. Every feature ships because we ran the operation first.',
}

export default function FeaturesIndexPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0c0d14',
        color: '#eae8e4',
        fontFamily: 'var(--font-sans), Inter, sans-serif',
      }}
    >
      <nav style={{ padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" style={{ color: '#eae8e4', textDecoration: 'none', fontWeight: 700, letterSpacing: '0.02em' }}>
          ← AfterStay
        </Link>
      </nav>

      <header style={{ maxWidth: 1080, margin: '0 auto', padding: '112px 32px 64px' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: '#C4622D',
            marginBottom: 28,
            textTransform: 'uppercase',
          }}
        >
          Property Operations
        </div>
        <h1
          style={{
            fontSize: 'clamp(40px, 6.4vw, 76px)',
            lineHeight: 1.02,
            fontWeight: 700,
            margin: '0 0 28px',
            color: '#eae8e4',
            letterSpacing: '-0.02em',
            maxWidth: 960,
          }}
        >
          12 things AfterStay does.
          <br />
          <span style={{ color: '#C4622D' }}>No competitor does any of them.</span>
        </h1>
        <p
          style={{
            fontSize: 20,
            lineHeight: 1.6,
            color: '#CBD5E1',
            maxWidth: 720,
            margin: '0 0 36px',
          }}
        >
          Every feature ships because we ran the operation first. That&apos;s not a tagline — it&apos;s why the product works.
        </p>
        <Link
          href="/login"
          style={{
            display: 'inline-block',
            padding: '16px 32px',
            borderRadius: 12,
            background: '#C4622D',
            color: '#0c0d14',
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: 16,
          }}
        >
          Start free trial →
        </Link>
      </header>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 32px 96px' }}>
        <div
          style={{
            display: 'grid',
            gap: 20,
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          }}
        >
          {FEATURE_LIST.map((f, i) => (
            <Link
              key={f.slug}
              href={`/features/${f.slug}`}
              style={{
                display: 'block',
                padding: 28,
                borderRadius: 18,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderTop: `3px solid ${f.color}`,
                color: '#eae8e4',
                textDecoration: 'none',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono), ui-monospace, monospace',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  color: f.color,
                  marginBottom: 20,
                  textTransform: 'uppercase',
                }}
              >
                {String(i + 1).padStart(2, '0')} · {f.eyebrow}
              </div>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
              <h3
                style={{
                  margin: '0 0 10px',
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#eae8e4',
                  letterSpacing: '-0.01em',
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  margin: '0 0 14px',
                  fontSize: 16,
                  lineHeight: 1.45,
                  color: '#eae8e4',
                  fontWeight: 600,
                }}
              >
                {f.headline}
              </p>
              <p style={{ margin: '0 0 22px', fontSize: 14, lineHeight: 1.55, color: '#94A3B8' }}>
                {f.subhead}
              </p>
              <div style={{ fontSize: 13, fontWeight: 600, color: f.color }}>Read the use case →</div>
            </Link>
          ))}
        </div>
      </section>

      <section
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '72px 32px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: '#eae8e4',
            margin: '0 0 12px',
            letterSpacing: '-0.01em',
          }}
        >
          Twelve modules. One operation.
        </h2>
        <p style={{ color: '#94A3B8', margin: '0 0 28px' }}>
          See what happens when the people who ran the operation build the software.
        </p>
        <div style={{ display: 'inline-flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.06)',
              color: '#eae8e4',
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            Back to home
          </Link>
          <Link
            href="/login"
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              borderRadius: 12,
              background: '#C4622D',
              color: '#0c0d14',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Start free trial →
          </Link>
        </div>
      </section>
    </main>
  )
}
