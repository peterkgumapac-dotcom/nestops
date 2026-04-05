import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { RoleProvider } from '@/context/RoleContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { AlertsProvider } from '@/context/AlertsContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', weight: ['300', '400', '500', '600', '700'] })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500'] })

export const metadata: Metadata = {
  title: 'AfterStay',
  description: 'Short-term rental operations platform',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable}`}>
        <ThemeProvider>
          <RoleProvider>
            <AlertsProvider>
              {children}
            </AlertsProvider>
          </RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
