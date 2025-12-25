import type { Metadata, Viewport } from "next"
import Script from "next/script"
import "./globals.css"

export const viewport: Viewport = {
  themeColor: '#ffffff',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.bedwinning.com'),

  // ========== CORE TITLE & DESCRIPTION ==========
  title: {
    template: '%s | Bedwinning: Vetted AI Tools Directory',
    default: 'Bedwinning | Strictly Vetted AI Tools Directory',
  },
  description: "Discover handpicked, utility-first AI tools that actually work. No fluff, no hype - just tools that respect your time and deliver real value.",

  // ========== KEYWORDS & CATEGORIZATION ==========
  keywords: [
    'AI tools', 'vetted AI tools', 'AI utility', 'productivity AI',
    'AI directory', 'handpicked AI', 'no-fluff AI', 'practical AI tools',
    'AI for professionals', 'time-saving AI', 'bedwinning', 'AI curation'
  ],
  category: 'Technology',

  // ========== ROBOTS & CRAWLING ==========
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
      noimageindex: false,
    },
  },

  // ========== AUTHORS & CREATORS ==========
  authors: [
    { name: 'Bedwinning Team' },
    // Add individual authors if you have them
  ],

  // ========== ALTERNATE LANGUAGES (if applicable) ==========
  // alternates: {
  //   languages: {
  //     'en-US': 'https://www.bedwinning.com',
  //     // 'es-ES': 'https://www.bedwinning.com/es',
  //   }
  // },

  // ========== ICONS & APP CONFIG ==========
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',

  // ========== OPEN GRAPH (Facebook, LinkedIn, etc.) ==========
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.bedwinning.com',
    siteName: 'Bedwinning',
    title: 'Bedwinning | Vetted AI Tools Directory',
    description: 'Handpicked AI tools with pure utility. No time-wasters, just tools that actually work.',
    images: [
      {
        url: '/og-image.jpg', // Create a 1200x630px branded OG image
        width: 1200,
        height: 630,
        alt: 'Bedwinning - Vetted AI Tools Directory',
        type: 'image/jpeg',
        // Optional: Add specific OG properties
        // secureUrl: 'https://www.bedwinning.com/og-image.jpg',
      },
    ],
    // Optional: Add video if you have a promo video
    // videos: [],
    // Optional: Add your Facebook app ID if you have one
    // facebookAppId: 'YOUR_FB_APP_ID',
  },

  // ========== TWITTER CARD ==========
  twitter: {
    card: 'summary_large_image',
    title: 'Bedwinning | AI Tool Directory',
    description: 'Discover strictly vetted AI tools with pure utility. No fluff, just tools that work.',
    images: ['/twitter-image.jpg'], // Create a 1200x600px Twitter card image
    creator: '@bedwinning', // Add your Twitter handle
    site: '@bedwinning', // Add your Twitter handle
    // Optional: Player card if you have video content
    // player: {
    //   url: 'https://www.bedwinning.com/video',
    //   width: 1200,
    //   height: 630,
    //   streamUrl: 'https://www.bedwinning.com/video/stream',
    // }
  },

  // ========== APP LINKS & DEEP LINKING ==========
  // appLinks: {
  //   web: {
  //     url: 'https://www.bedwinning.com',
  //     should_fallback: true,
  //   },
  // },

  // ========== STRUCTURED DATA FORMAT (JSON-LD) ==========
  // Note: For complex structured data, consider adding in <head> or via component
  // Example: Organization, Website, SearchAction schema

  // ========== VERIFICATIONS ==========
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    // Add others as needed:
    // yandex: 'yandex-verification-code',
    // yahoo: 'yahoo-verification-code',
    // me: 'my-email@example.com', // For rel="me" auth
  },

  // ========== CANONICAL & REFERRER ==========
  // referrer: 'origin-when-cross-origin', // Good default for privacy
  // archives: ['https://www.bedwinning.com/archive'], // If you have archives
  // assets: ['https://cdn.bedwinning.com/assets'], // If using CDN
  // bookmarks: ['https://www.bedwinning.com/bookmark'], // For permalinks

  // ========== OTHER ==========
  // formatDetection: {
  //   telephone: false, // Disable automatic telephone detection
  //   date: false,
  //   address: false,
  //   email: false,
  // },
}

import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import NavigationLoader from "@/app/components/navigation-loader"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        {/* GTM scripts */}

        {/* OPTIONAL: Add JSON-LD Structured Data */}
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Bedwinning",
              "url": "https://www.bedwinning.com",
              "description": "A directory of strictly vetted AI tools with pure utility",
              "publisher": {
                "@type": "Organization",
                "name": "Bedwinning",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://www.bedwinning.com/logo.png"
                }
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://www.bedwinning.com/search?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />

        {/* OPTIONAL: Additional meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Bedwinning" />
        <meta name="apple-mobile-web-app-title" content="Bedwinning" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className="antialiased font-sans bg-background text-foreground">
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <NavigationLoader />
          {children}
        </Suspense>
      </body>
    </html>
  )
}