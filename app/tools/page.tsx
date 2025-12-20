import NeomorphNav from "@/app/components/neomorph/neomorph-nav"
import NeomorphToolsGrid from "@/app/components/neomorph/neomorph-tools-grid"
import { getAllTools } from "@/app/lib/db"

export const dynamic = 'force-dynamic'

export default async function ToolsPage() {
  const tools = await getAllTools()

  return (
    <div className="min-h-screen" style={{ background: '#F0F0F3' }}>
      <NeomorphNav />
      <NeomorphToolsGrid tools={tools} />
    </div>
  )
}
