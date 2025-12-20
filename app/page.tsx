import NeomorphNav from "@/app/components/neomorph/neomorph-nav"
import NeomorphToolBrowser from "@/app/components/neomorph/neomorph-tool-browser"
import { getAllTools, getToolCount } from "@/app/lib/db"

export const dynamic = 'force-dynamic' // Ensure fresh data from DB

export default async function HomePage() {
  // Load tools from PostgreSQL database
  let tools = await getAllTools()
  const toolCount = await getToolCount()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F0F0F3' }}>
      <NeomorphNav />

      <div className="flex-1 flex flex-col">
        {/* Compact Hero */}
        <div className="container mx-auto px-4 pt-8 pb-6">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Soft landings for <span style={{ color: '#22c55e' }}>smart builders</span>
            </h1>
            <p className="text-base text-muted-foreground mb-4">
              {toolCount} curated AI tools.
            </p>
          </div>
        </div>

        {/* Splitscreen Browser */}
        <div className="flex-1 container mx-auto px-4 pb-8">
          <NeomorphToolBrowser tools={tools} />
        </div>
      </div>
    </div >
  )
}
