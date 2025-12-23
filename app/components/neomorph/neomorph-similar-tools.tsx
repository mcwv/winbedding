"use client"

import Link from "next/link"
import { Tool } from "@/app/types/tool"
import { ChevronRight } from "lucide-react"

const neomorphShadow = {
    raised: `
    8px 8px 16px rgba(209, 217, 230, 0.8),
    -8px -8px 16px rgba(255, 255, 255, 0.8)
  `,
    pressed: `
    inset 4px 4px 8px rgba(209, 217, 230, 0.7),
    inset -4px -4px 8px rgba(255, 255, 255, 0.7)
  `,
}

interface NeomorphSimilarToolsProps {
    tools: Tool[]
}

export default function NeomorphSimilarTools({ tools }: NeomorphSimilarToolsProps) {
    if (!tools || tools.length === 0) return null

    return (
        <section className="mt-20 pt-20 border-t border-zinc-200/50">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-8 px-2 flex items-center justify-between">
                <span>You might also like</span>
                <ChevronRight className="w-5 h-5 text-indigo-500" />
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {tools.map((tool) => (
                    <Link
                        key={tool.id}
                        href={`/tools/${tool.slug}`}
                        className="group relative p-6 rounded-3xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
                        style={{
                            background: '#F0F0F3',
                            boxShadow: neomorphShadow.raised,
                        }}
                    >
                        <div className="flex flex-col h-full">
                            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center p-3 mb-6 transition-transform group-hover:scale-110 shadow-sm" style={{ boxShadow: neomorphShadow.pressed }}>
                                <img
                                    src={tool.logoUrl || `https://www.google.com/s2/favicons?sz=128&domain=${new URL(tool.visitURL).hostname}`}
                                    alt={tool.name}
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">{tool.category}</p>
                                <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-1">{tool.name}</h4>
                                <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                                    {tool.description}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
