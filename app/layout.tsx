import type { Metadata } from "next"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

// Metadata section
export const metadata: Metadata = {
  metadataBase: new URL('https://bedwinning.com'),
  title: {
    template: '%s | Bedwinning',
    default: 'Bedwinning | AI Tool Directory',
  },
  description: "Stop the AI Noise. Discover strictly vetted tools with pure utility for entrepreneurs and builders.",
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bedwinning.com',
    siteName: 'Bedwinning',
    images: [{
      url: '/favicon.png',
      width: 512,
      height: 512,
      alt: 'Bedwinning'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bedwinning | AI Tool Directory',
    description: 'Discover strictly vetted AI tools with pure utility.',
    images: ['/favicon.png'],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: 'https://bedwinning.com',
  },
}

import { Suspense } from "react"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {process.env.NEXT_PUBLIC_GTM_ID && (
          process.env.NEXT_PUBLIC_GTM_ID.startsWith('GTM-') ? (
            /* Google Tag Manager */
            <Script
              id="gtm-script"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
                `,
              }}
            />
          ) : (
            /* Google Tag (GA4 / gtag.js) */
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
                strategy="afterInteractive"
              />
              <Script
                id="google-analytics"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${process.env.NEXT_PUBLIC_GTM_ID}');
                  `,
                }}
              />
            </>
          )
        )}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}>
        {process.env.NEXT_PUBLIC_GTM_ID?.startsWith('GTM-') && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <Suspense fallback={<div className="min-h-screen bg-[#F0F0F3]" />}>
          {children}
        </Suspense>
      </body>
    </html>
  )
}
