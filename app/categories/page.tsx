import { getCategoriesWithCounts } from "@/app/lib/db"
import { getCategoryColor } from "@/app/lib/categoryMapping"
import Link from "next/link"
import NeomorphHeader from "@/app/components/neomorph/neomorph-header"
import {
    Palette,
    PenTool,
    Code2,
    Briefcase,
    User,
    Search,
    ChevronRight,
    Sparkles
} from "lucide-react"

const iconMap: Record<string, any> = {
    "Creative & Media": Palette,
    "Writing & Copy": PenTool,
    "Dev & Data": Code2,
    "Business Ops": Briefcase,
    "Personal & Life": User,
    "Search & Research": Search,
}

const descriptionMap: Record<string, string> = {
    "Creative & Media": "Generative art, video editing, music creation, and gaming tools.",
    "Writing & Copy": "AI-powered copywriting, SEO content, social media, and script writing.",
    "Dev & Data": "Coding assistants, data analytics, UI/UX design, and e-commerce platforms.",
    "Business Ops": "Productivity suites, project management, CRM, and financial automation.",
    "Personal & Life": "Learning platforms, health & wellness, travel, and personal growth.",
    "Search & Research": "Powerful AI assistants, specialized search engines, and research tools.",
}

const neomorphShadow = {
    raised: `
    8px 8px 16px rgba(209, 217, 230, 0.8),
    -8px -8px 16px rgba(255, 255, 255, 0.8)
  `,
    hover: `
    12px 12px 24px rgba(209, 217, 230, 0.9),
    -12px -12px 24px rgba(255, 255, 255, 0.9)
  `,
}

export default async function CategoriesPage() {
    const stats = await getCategoriesWithCounts()
    const filteredStats = stats.filter(s => s.category !== "Other")

    return (
        <div className="min-h-screen" style={{ background: '#F0F0F3' }}>
            <NeomorphHeader />
            <div className="pt-12 pb-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <header className="mb-12 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                            style={{ background: '#F0F0F3', boxShadow: 'inset 2px 2px 5px rgba(209,217,230,0.7), inset -2px -2px 5px rgba(255,255,255,0.7)' }}>
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Curated Taxonomy</span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-zinc-800 mb-4 tracking-tight">
                            Browse by <span className="text-indigo-600">Intent</span>
                        </h1>
                        <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
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
                                    className="group relative rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 block"
                                    style={{
                                        background: '#F0F0F3',
                                        boxShadow: neomorphShadow.raised,
                                    }}
                                >
                                    <div className="flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="p-4 rounded-2xl"
                                                style={{
                                                    background: '#F0F0F3',
                                                    boxShadow: 'inset 4px 4px 8px rgba(209,217,230,0.8), inset -4px -4px 8px rgba(255,255,255,0.8)',
                                                    color: color
                                                }}>
                                                <Icon className="w-8 h-8" />
                                            </div>
                                            <span className="text-sm font-bold text-zinc-400 group-hover:text-indigo-500 transition-colors">
                                                {stat.count} Tools
                                            </span>
                                        </div>

                                        <h2 className="text-2xl font-bold text-zinc-800 mb-3 group-hover:text-indigo-600 transition-colors">
                                            {stat.category}
                                        </h2>

                                        <p className="text-zinc-500 text-sm leading-relaxed mb-8 flex-grow">
                                            {descriptionMap[stat.category] || "Explore the best AI tools in this category."}
                                        </p>

                                        <div className="flex items-center text-indigo-600 font-bold text-sm">
                                            Explore Now
                                            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Small "Other" link or section if needed */}
                    <div className="mt-16 text-center">
                        <Link href="/?c=Other" className="text-sm text-zinc-400 hover:text-indigo-600 transition-colors">
                            Looking for something else? Browse miscellaneous tools
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
