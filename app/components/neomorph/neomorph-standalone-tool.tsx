"use client"

import { Tool } from "@/app/types/tool"
import { ExternalLink, ChevronLeft, Calendar, Tag, Share2, Check } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from 'react-markdown'
import { useState } from "react"

const neomorphShadow = {
    raised: `
    12px 12px 24px rgba(209, 217, 230, 0.8),
    -12px -12px 24px rgba(255, 255, 255, 0.8)
  `,
    pressed: `
    inset 4px 4px 8px rgba(209, 217, 230, 0.7),
    inset -4px -4px 8px rgba(255, 255, 255, 0.7)
  `,
}

interface NeomorphStandaloneToolProps {
    tool: Tool
}

export default function NeomorphStandaloneTool({ tool }: NeomorphStandaloneToolProps) {
    const [copied, setCopied] = useState(false)

    const handleShare = () => {
        const url = window.location.href
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
            {/* Back to Discovery */}
            <div className="flex justify-start">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95"
                    style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised, color: '#71717a' }}
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Discovery
                </Link>
            </div>

            {/* Core Info Row */}
            <div className="grid md:grid-cols-[200px_1fr] gap-12 items-start">
                <div
                    className="w-48 h-48 rounded-[2.5rem] bg-white flex items-center justify-center p-8 mx-auto md:mx-0"
                    style={{ boxShadow: neomorphShadow.pressed }}
                >
                    <img
                        src={tool.logoUrl || `https://www.google.com/s2/favicons?domain=${new URL(tool.visitURL).hostname}&sz=128`}
                        alt={tool.name}
                        className="w-full h-full object-contain"
                    />
                </div>

                <div className="space-y-6 text-center md:text-left">
                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-indigo-600/60">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: '#F0F0F3', boxShadow: neomorphShadow.pressed }}>
                            <Tag className="w-3 h-3" />
                            {tool.category}
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: '#F0F0F3', boxShadow: neomorphShadow.pressed }}>
                            <Calendar className="w-3 h-3" />
                            Updated {new Date(tool.updatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-none">
                        {tool.name}
                    </h1>

                    <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                        <a
                            href={tool.visitURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex px-10 py-5 rounded-2xl items-center gap-3 text-sm font-bold transition-all active:scale-95"
                            style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised, color: '#4f46e5' }}
                        >
                            Visit Website
                            <ExternalLink className="w-5 h-5 stroke-[3px]" />
                        </a>

                        <button
                            onClick={handleShare}
                            className="inline-flex px-8 py-5 rounded-2xl items-center gap-3 text-sm font-bold transition-all active:scale-95"
                            style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised, color: copied ? '#22c55e' : '#71717a' }}
                        >
                            {copied ? <Check className="w-5 h-5 stroke-[3px]" /> : <Share2 className="w-5 h-5 stroke-[3px]" />}
                            {copied ? 'Link Copied' : 'Share Tool'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="space-y-16 pt-12 border-t border-white/40">
                {/* DescriptionSection */}
                <div className="grid lg:grid-cols-[1fr_400px] gap-16">
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 opacity-30">
                            <h2 className="text-[12px] font-bold uppercase tracking-[0.5em] text-gray-900">Analysis & Insights</h2>
                        </div>
                        <div className="text-xl text-gray-700 leading-relaxed font-medium prose prose-zinc max-w-none">
                            <ReactMarkdown>{tool.description}</ReactMarkdown>
                        </div>
                        {tool.v2_tags && tool.v2_tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-6 border-t border-white/20">
                                {tool.v2_tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-[#F0F0F3]"
                                        style={{ boxShadow: neomorphShadow.pressed }}
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Meta Sidebar if needed */}
                    <div className="space-y-8">
                        <div
                            className="rounded-[2rem] p-8 space-y-6"
                            style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised }}
                        >
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Tool Verification</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                        <Check className="w-4 h-4 stroke-[3px]" />
                                    </div>
                                    <span className="text-[11px] font-bold text-gray-600">Strictly Vetted</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                        <Check className="w-4 h-4 stroke-[3px]" />
                                    </div>
                                    <span className="text-[11px] font-bold text-gray-600">Enterprise Ready</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-zinc-500/10 flex items-center justify-center text-zinc-500">
                                        <Check className="w-4 h-4 stroke-[3px]" />
                                    </div>
                                    <span className="text-[11px] font-bold text-gray-600">AI Utility</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Screenshot if available */}
                {tool.imageUrl && (
                    <div
                        className="rounded-[3rem] overflow-hidden p-4"
                        style={{ background: '#F0F0F3', boxShadow: neomorphShadow.pressed }}
                    >
                        <img
                            src={tool.imageUrl}
                            alt={`${tool.name} Screenshot`}
                            className="w-full h-auto rounded-[2rem] shadow-sm"
                        />
                    </div>
                )}
            </div>

            {/* CTA Footer */}
            <div className="pt-24 pb-12 text-center">
                <Link
                    href="/"
                    className="inline-flex px-12 py-6 rounded-[2rem] items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] transition-all active:scale-95"
                    style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised, color: '#4f46e5' }}
                >
                    Explore all 2,000+ AI Tools
                    <ExternalLink className="w-5 h-5 stroke-[3px]" />
                </Link>
            </div>
        </div>
    )
}
