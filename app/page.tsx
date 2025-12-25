import { Metadata } from 'next'
import { Suspense } from 'react'
import Header from "@/app/components/ui/header"
import ToolBrowser from "@/app/components/ui/tool-browser"
import { getAllTools } from "@/app/lib/db"

// ISR: Revalidate every 60 seconds (cached, regenerated in background)
export const revalidate = 60


export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string; c?: string }> }): Promise<Metadata> {
  const { q, c } = await searchParams

  let title = "Bedwinning | AI Tool Index"
  let description = "Discover the best AI tools for builders, creators, and entrepreneurs."

  if (q && c && c !== 'all') {
    title = `${q} tools in ${c} | Bedwinning`
  } else if (q) {
    title = `Search: ${q} | Bedwinning AI Index`
  } else if (c && c !== 'all') {
    title = `Best ${c} AI Tools | Bedwinning`
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ['/favicon.png'],
    },
    alternates: {
      canonical: 'https://www.bedwinning.com',
    },
  }
}

// Loading skeleton for the tool browser
function ToolBrowserSkeleton() {
  return (
    <div className="grid lg:grid-cols-5 gap-6 h-full animate-pulse">
      <div className="lg:col-span-2 space-y-4">
        <div className="h-4 bg-neutral-200 rounded w-24"></div>
        <div className="rounded-2xl p-4 space-y-3 bg-neutral-100 border border-neutral-200 shadow-inner">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-neutral-200 rounded-lg"></div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-3">
        <div className="rounded-2xl h-full bg-neutral-200"></div>
      </div>
    </div>
  )
}

// Async component to fetch and render tools
async function ToolBrowserWithData() {
  const tools = await getAllTools()
  return <ToolBrowser tools={tools} />
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string; c?: string }> }) {
  // Wait for search params
  await searchParams

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Header />

      {/* Tool Browser - fills remaining space */}
      <div className="flex-1 overflow-hidden pb-4">
        <div className="container mx-auto px-4 h-full max-w-7xl">
          <Suspense fallback={<ToolBrowserSkeleton />}>
            <ToolBrowserWithData />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

