import { Playfair_Display, DM_Sans } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-serif',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
})

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${playfair.variable} ${dmSans.variable}`}
      style={{ fontFamily: 'var(--font-sans)', background: '#FAF9F6', minHeight: '100vh' }}
    >
      <style>{`html, body { background: #FAF9F6 !important; color-scheme: light; }`}</style>
      {children}
    </div>
  )
}
