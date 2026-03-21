import type { Metadata } from 'next'
import { Inter, Outfit, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { RoleProvider } from '@/context/RoleContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { AlertsProvider } from '@/context/AlertsContext'

const inter = Inter({ subsets: ['latin'] })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'NestOps',
  description: 'Short-term rental operations platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${mono.variable} ${inter.className}`}>
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
