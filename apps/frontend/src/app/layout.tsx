import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'AI Startup Analyzer', template: '%s | AI Startup Analyzer' },
  description: 'Analyze your startup idea with 7 specialized AI agents. Get market research, competitor analysis, MVP plan, monetization strategy, and more.',
  keywords: ['startup', 'AI', 'market research', 'competitor analysis', 'MVP', 'business analysis'],
  openGraph: {
    title: 'AI Startup Analyzer',
    description: 'Analyze your startup idea with 7 specialized AI agents.',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
