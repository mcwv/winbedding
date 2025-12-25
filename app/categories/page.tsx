import { getCategoriesWithCounts } from "@/app/lib/db"
import { getCategoryColor, MAIN_CATEGORIES } from "@/app/lib/categoryMapping"

// ISR: Revalidate counts every hour
export const revalidate = 3600

import Link from "next/link"
import Header from "@/app/components/ui/header"
import {
    Palette,
    PenTool,
    Code2,
    Briefcase,
    Zap,
    MessageSquare,
    Video,
    Music,
    ChevronRight,
    Sparkles
} from "lucide-react"

const iconMap: Record<string, any> = {
    "Code": Code2,
    "Business": Briefcase,
    "Writing": PenTool,
    "Image": Palette,
    "Chatbot": MessageSquare,
    "Productivity": Zap,
    "Video": Video,
    "Audio": Music,
}

const descriptionMap: Record<string, string> = {
    "Code": "Coding assistants, code generation, and developer tools.",
    "Business": "Business intelligence, management, and corporate solutions.",
    "Writing": "Content creation, copywriting, and editing assistants.",
    "Image": "Generative art, image editing, and design tools.",
    "Chatbot": "Conversational AI agents and customer support bots.",
    "Productivity": "workflow automation and personal productivity boosters.",
    "Video": "Video generation, editing, and enhancement tools.",
    "Audio": "Voice synthesis, music generation, and audio processing.",
}



export default async function CategoriesPage() {
    const stats = await getCategoriesWithCounts()
    // Filter to only show categories present in our official taxonomy
    const filteredStats = stats.filter(s => (MAIN_CATEGORIES as unknown as string[]).includes(s.category))


    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="pt-12 pb-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <header className="mb-12 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 bg-neutral-100 border border-neutral-200 shadow-inner">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <span className="text-eyebrow text-text-muted">Curated Taxonomy</span>
                        </div>
                        <h1 className="text-display-bold text-text-primary mb-4 tracking-tight">
                            Browse by <span className="text-brand">Intent</span>
                        </h1>
                        <p className="text-tagline text-text-secondary max-w-2xl mx-auto">
                            Our library is strictly vetted and organized into high-impact categories to help you find the right AI tool faster.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredStats.map((stat) => {
                            const Icon = iconMap[stat.category] || Sparkles
                            const color = getCategoryColor(stat.category as any)
                            return (
                                <Link
                                    key={stat.category}
                                    href={`/?c=${encodeURIComponent(stat.category)}`}
                                    className="group relative rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 block bg-surface border border-border shadow-sm hover:shadow-md hover:border-brand/30"
                                >
                                    <div className="flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-200 shadow-inner"
                                                style={{ color: color }}>
                                                <Icon className="w-8 h-8" />
                                            </div>
                                            <span className="text-eyebrow text-text-muted bg-neutral-100 px-3 py-1 rounded-lg border border-neutral-200">
                                                {stat.count} Tools
                                            </span>
                                        </div>

                                        <h2 className="text-heading text-gray-900 mb-3 group-hover:text-brand transition-colors">
                                            {stat.category}
                                        </h2>

                                        <p className="text-body text-gray-600 mb-8 flex-1 leading-relaxed">
                                            {descriptionMap[stat.category] || "Explore the best AI tools in this category."}
                                        </p>

                                        <div className="flex items-center text-brand font-bold text-sm">
                                            Explore Now
                                            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Small "Other" link or section if needed */}
                    < div className="mt-16 text-center" >
                        <Link href="/?c=Other" className="text-sm text-text-muted hover:text-brand transition-colors">
                            Looking for something else? Browse miscellaneous tools
                        </Link>
                    </div >
                </div >
            </div >
        </div >
    )
}
