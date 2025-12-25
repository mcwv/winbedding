import type { Metadata, Viewport } from "next"
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'
import "./globals.css"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import NavigationLoader from "@/app/components/navigation-loader"

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.bedwinning.com'),
  title: {
    template: '%s | Bedwinning',
    default: 'Bedwinning | Strictly Vetted AI Tools',
  },
  description: "The AI tool directory for professionals. We strictly vet and curate only the highest-utility AI tools, saving you time on hype.",
  keywords: ['AI tools', 'AI directory', 'vetted AI', 'productivity', 'business AI', 'generative AI', 'software'],
  authors: [{ name: 'Bedwinning Team' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.bedwinning.com',
    siteName: 'Bedwinning',
    title: 'Bedwinning | Strictly Vetted AI Tools',
    description: 'Stop drowning in AI sludge. Discover the top 1% of AI tools that actually work for business and creativity.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Bedwinning AI Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bedwinning | Strictly Vetted AI Tools',
    description: 'Stop drowning in AI sludge. Discover the top 1% of AI tools that actually work.',
    creator: '@bedwinning',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased font-sans bg-background text-foreground">
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <NavigationLoader />
          {children}
        </Suspense>

        {/* Google Analytics & Tag Manager */}
        {gaId && <GoogleAnalytics gaId={gaId} />}
        {gtmId && <GoogleTagManager gtmId={gtmId} />}
      </body>
    </html>
  )
}