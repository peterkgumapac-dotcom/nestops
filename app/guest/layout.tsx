import { Playfair_Display, DM_Sans, Nunito } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-serif',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
})

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-nunito',
})

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${playfair.variable} ${dmSans.variable} ${nunito.variable}`}
      style={{ fontFamily: 'var(--font-sans)', minHeight: '100vh' }}
    >
      {children}
    </div>
  )
}
