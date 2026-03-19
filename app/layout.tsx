import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { RoleProvider } from '@/context/RoleContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { AlertsProvider } from '@/context/AlertsContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NestOps',
  description: 'Short-term rental operations platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
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
