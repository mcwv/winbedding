import { Metadata } from 'next'
import NeomorphHeader from "@/app/components/neomorph/neomorph-header"
import NeomorphToolBrowser from "@/app/components/neomorph/neomorph-tool-browser"
import { getAllTools } from "@/app/lib/db"

export const dynamic = 'force-dynamic'

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

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string; c?: string }> }) {
  // Wait for search params
  await searchParams

  // Load tools from PostgreSQL database
  let tools: any[] = []
  let toolCount = 0
  let error = null

  try {
    tools = await getAllTools()
    toolCount = tools.length
  } catch (e: any) {
    error = e.message || 'Database connection failed'
    console.error('Database error:', e)
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F0F0F3' }}>
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Database Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#F0F0F3' }}>
      <NeomorphHeader />

      {/* Tool Browser - fills remaining space */}
      <div className="flex-1 overflow-hidden pb-4">
        <div className="container mx-auto px-4 h-full max-w-7xl">
          <NeomorphToolBrowser tools={tools} />
        </div>
      </div>
    </div>
  )
}
