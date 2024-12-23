import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from './components/Navigation'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Debt Manager',
  description: 'Manage group debts easily',
  icons: {
    icon: '/vercel.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-background text-foreground min-h-screen flex flex-col`}>
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        <footer className="border-t border-border">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            <p>Group Debt Manager - Manage shared expenses easily</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
