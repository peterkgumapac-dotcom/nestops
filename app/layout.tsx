import type { Metadata } from 'next'
import { DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'
import { RoleProvider } from '@/context/RoleContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { AlertsProvider } from '@/context/AlertsContext'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans', weight: ['300', '400', '500', '600'] })
const mono = DM_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500'] })

export const metadata: Metadata = {
  title: 'NestOps',
  description: 'Short-term rental operations platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${mono.variable}`}>
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
