import NeomorphNav from "@/app/components/neomorph/neomorph-nav"
import NeomorphToolBrowser from "@/app/components/neomorph/neomorph-tool-browser"
import { getAllTools, getToolCount } from "@/app/lib/db"

export const dynamic = 'force-dynamic' // Ensure fresh data from DB

export default async function HomePage() {
  // Load tools from PostgreSQL database
  let tools: any[] = []
  let toolCount = 0
  let error = null

  try {
    tools = await getAllTools()
    toolCount = await getToolCount()
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
      <NeomorphNav />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Compact Hero */}
        <div className="container mx-auto px-4 pt-6 pb-4 flex-shrink-0">
          <div className="max-w-3xl">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Soft landings for <span style={{ color: '#22c55e' }}>smart builders</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              {toolCount} curated AI tools.
            </p>
          </div>
        </div>

        {/* Splitscreen Browser - fills remaining space */}
        <div className="flex-1 container mx-auto px-4 pb-4 overflow-hidden">
          <NeomorphToolBrowser tools={tools} />
        </div>
      </div>
    </div>
  )
}
