"use client"

import Link from "next/link"
import Image from "next/image"
import { Tool } from "@/app/types/tool"
import { ChevronRight } from "lucide-react"



interface SimilarToolsProps {
    tools: Tool[]
}

export default function SimilarTools({ tools }: SimilarToolsProps) {
    if (!tools || tools.length === 0) return null

    return (
        <section className="mt-20 pt-20 border-t border-zinc-200/50">
            <h3 className="text-heading text-gray-900 tracking-tight mb-8 px-2 flex items-center justify-between">
                <span>You might also like</span>
                <ChevronRight className="w-5 h-5 text-indigo-500" />
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {tools.map((tool) => (
                    <Link
                        key={tool.id}
                        href={`/tools/${tool.slug}`}
                        className="group relative p-6 rounded-3xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] bg-surface border border-border shadow-sm hover:shadow-md hover:border-brand/50"
                    >
                        <div className="flex flex-col h-full">
                            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center p-3 mb-6 transition-transform group-hover:scale-110 shadow-sm relative bg-neutral-100 border border-neutral-200">
                                <Image
                                    src={tool.logoUrl || `https://www.google.com/s2/favicons?sz=128&domain=${new URL(tool.visitURL).hostname}`}
                                    alt={tool.name}
                                    fill
                                    className="object-contain p-3"
                                />
                            </div>

                            <div className="flex-1">
                                <p className="text-eyebrow text-indigo-600 mb-1">{tool.category}</p>
                                <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-1">{tool.name}</h4>
                                <p className="text-tiny text-zinc-500 line-clamp-2 leading-relaxed">
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
