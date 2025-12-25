"use client"

import { Tool } from "@/app/types/tool"
import { ExternalLink, ChevronLeft, Calendar, Tag, Share2, Check, Code, Award } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import ReactMarkdown from 'react-markdown'
import { useState } from "react"



interface ToolDetailProps {
    tool: Tool
}

export default function ToolDetail({ tool }: ToolDetailProps) {
    const [copied, setCopied] = useState(false)

    const handleShare = () => {
        const url = window.location.href
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Helper for pricing badge color
    const getPricingColor = (model?: string) => {
        switch (model?.toLowerCase()) {
            case 'free': return 'text-green-600 bg-green-500/10'
            case 'freemium': return 'text-blue-600 bg-blue-500/10'
            case 'paid': return 'text-purple-600 bg-purple-500/10'
            case 'contact': return 'text-orange-600 bg-orange-500/10'
            case 'open-source': return 'text-cyan-600 bg-cyan-500/10'
            default: return 'text-gray-600 bg-gray-500/10'
        }
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 space-y-12">
            {/* Back to Discovery */}
            <div className="flex justify-start">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-eyebrow transition-all active:scale-95 text-text-secondary hover:text-brand bg-surface border border-border shadow-sm"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Discovery
                </Link>
            </div>

            {/* Core Header Row */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div
                    className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-white flex items-center justify-center p-6 flex-shrink-0 relative shadow-sm border border-border"
                >
                    <Image
                        src={tool.logoUrl || `https://www.google.com/s2/favicons?domain=${new URL(tool.visitURL).hostname}&sz=128`}
                        alt={tool.name}
                        fill
                        className="object-contain p-6"
                    />
                </div>

                <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="px-3 py-1 rounded-lg text-label text-brand/60 bg-neutral-100 border border-neutral-200">
                            {tool.category}
                        </span>
                        <span className="px-3 py-1 rounded-lg text-label text-text-muted bg-neutral-100 border border-neutral-200">
                            Updated {new Date(tool.updatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                    </div>

                    <div className="space-y-1">
                        <Link href={`/tools/${tool.slug}`} className="hover:opacity-70 transition-opacity">
                            <h1 className="text-tool-name text-gray-900">
                                {tool.name}
                            </h1>
                        </Link>
                        {tool.tagline && (
                            <p className="text-tagline text-gray-500">
                                {tool.tagline}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2">
                        <a
                            href={tool.visitURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex px-8 py-4 rounded-xl items-center gap-2 text-sm font-bold transition-all active:scale-95 text-white bg-brand shadow-md hover:bg-brand-hover"
                        >
                            Visit Website
                            <ExternalLink className="w-4 h-4 stroke-[3px]" />
                        </a>
                        <button
                            onClick={handleShare}
                            className={`inline-flex px-6 py-4 rounded-xl items-center gap-2 text-sm font-bold transition-all active:scale-95 bg-surface border border-border shadow-sm ${copied ? 'text-success' : 'text-text-secondary hover:text-brand'}`}
                        >
                            {copied ? <Check className="w-4 h-4 stroke-[3px]" /> : <Share2 className="w-4 h-4 stroke-[3px]" />}
                            {copied ? 'Copied' : 'Share'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">

                {/* Main Column: Narrative */}
                <div className="space-y-12">

                    {/* Verdict Banner */}
                    {tool.verdict && (
                        <div
                            className="p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden bg-neutral-50 border border-neutral-200"
                        >
                            <div className="flex items-center gap-3 mb-6 opacity-40">
                                <h2 className="text-eyebrow text-indigo-900">The Honest Verdict</h2>
                            </div>
                            <div className="text-quote text-gray-800 italic">
                                "{tool.verdict}"
                            </div>
                            {tool.best_for && (
                                <div className="mt-8 pt-6 border-t border-gray-200/50">
                                    <span className="text-eyebrow text-indigo-400 block mb-2">Best Suited For</span>
                                    <p className="text-gray-600 font-medium">{tool.best_for}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Adams Guide (Pilot) */}
                    {tool.adams_description && (
                        <div className="prose prose-indigo max-w-none">
                            <div className="flex items-center gap-3 mb-4 opacity-50">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                <h3 className="text-eyebrow text-cyan-700 m-0">The Don't Panic Guide</h3>
                            </div>
                            <div className="text-quote text-gray-600 bg-cyan-50/30 p-8 rounded-[2.5rem] border border-cyan-100/50">
                                "{tool.adams_description}"
                            </div>
                        </div>
                    )}

                    {/* Screenshot Container */}
                    {tool.imageUrl && (
                        <div
                            className="rounded-[2.5rem] overflow-hidden p-3 md:p-4 bg-neutral-100 border border-neutral-200"
                        >
                            <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-white shadow-inner">
                                <Image
                                    src={tool.imageUrl}
                                    alt={`${tool.name} Interface`}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    )}

                    {/* Deep Analysis */}
                    <div className="space-y-8">
                        <div className="text-body text-gray-700 prose prose-zinc max-w-none">
                            <ReactMarkdown>{tool.description}</ReactMarkdown>
                        </div>

                        {/* Pros & Cons Grid */}
                        {(tool.pros?.length || tool.cons?.length || 0) > 0 && (
                            <div className="grid md:grid-cols-2 gap-8 pt-8">
                                {tool.pros && tool.pros.length > 0 && (
                                    <div className="p-8 rounded-[2rem] bg-green-50/50 border border-green-100">
                                        <h3 className="text-eyebrow text-green-600 mb-6 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            Strengths
                                        </h3>
                                        <ul className="space-y-4">
                                            {tool.pros.map((pro, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-gray-600 font-medium leading-relaxed">
                                                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                    {pro}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {tool.cons && tool.cons.length > 0 && (
                                    <div className="p-8 rounded-[2rem] bg-orange-50/50 border border-orange-100">
                                        <h3 className="text-eyebrow text-orange-600 mb-6 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                            Limitations
                                        </h3>
                                        <ul className="space-y-4">
                                            {tool.cons.map((con, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-gray-600 font-medium leading-relaxed">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-300 mt-1.5 flex-shrink-0" />
                                                    {con}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}


                    </div>
                </div>

                {/* Sidebar Column: Spec Sheet */}
                <div className="space-y-10">

                    {/* Investment Card */}
                    <div className="p-8 rounded-[2.5rem] space-y-6 bg-surface border border-border shadow-sm">
                        <h3 className="text-eyebrow text-gray-400">Investment</h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-200/50">
                                <span className="text-sm font-bold text-gray-600">Model</span>
                                <span className={`px-3 py-1 rounded-full text-label uppercase ${getPricingColor(tool.pricing_model)}`}>
                                    {tool.pricing_model || 'Unknown'}
                                </span>
                            </div>

                            {tool.price_amount && (
                                <div className="flex justify-between items-center pb-4 border-b border-gray-200/50">
                                    <span className="text-sm font-bold text-gray-600">Starting Price</span>
                                    <span className="text-sm font-black text-gray-900">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: tool.price_currency || 'USD' }).format(tool.price_amount)}
                                        <span className="text-gray-400 font-medium text-xs">/mo</span>
                                    </span>
                                </div>
                            )}

                            {tool.has_trial && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-600">Free Trial</span>
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50/50 px-2 py-1 rounded-lg">
                                        {tool.trial_days ? `${tool.trial_days}-Day Access` : 'Available'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>



                    {/* Scores Card */}
                    <div className="p-8 rounded-[2.5rem] space-y-8 bg-surface border border-border shadow-sm">
                        <h3 className="text-eyebrow text-gray-400">Analysis Scores</h3>

                        <div className="space-y-6">
                            {tool.transparency_score !== undefined && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-label text-gray-500">Transparency</span>
                                        <span className="text-xs font-black text-indigo-600">{tool.transparency_score}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full"
                                            style={{ width: `${tool.transparency_score}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                            {tool.experience_score !== undefined && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-label text-gray-500">UX Experience</span>
                                        <span className="text-xs font-black text-indigo-600">{tool.experience_score}/10</span>
                                    </div>
                                    <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full"
                                            style={{ width: `${(tool.experience_score as any) * 10}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ecosystem / Fit */}
                    <div className="space-y-6">
                        {tool.integrations && tool.integrations.length > 0 && (
                            <div>
                                <h3 className="text-eyebrow text-gray-400 mb-4 ml-2">Integrations</h3>
                                <div className="flex flex-wrap gap-2">
                                    {tool.integrations.map(integration => (
                                        <span key={integration} className="px-3 py-1.5 rounded-xl bg-white text-tiny font-bold text-gray-600 shadow-sm border border-gray-100">
                                            {integration}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Technical Specs Card (New V3) */}
                        <div className="pt-6 border-t border-white/40">
                            <h3 className="text-eyebrow text-zinc-400 mb-3">Tech Specs</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {tool.api_available !== undefined && (
                                    <div className="p-3 rounded-xl bg-white/40 border border-white/60 flex items-center gap-2">
                                        <Code className={`w-3.5 h-3.5 ${tool.api_available ? 'text-indigo-600' : 'text-gray-400'}`} />
                                        <span className="text-tiny font-bold text-gray-600">{tool.api_available ? 'API Access' : 'No API'}</span>
                                    </div>
                                )}
                                {tool.skill_level && (
                                    <div className="p-3 rounded-xl bg-white/40 border border-white/60 flex items-center gap-2">
                                        <Award className="w-3.5 h-3.5 text-orange-500" />
                                        <span className="text-tiny font-bold text-gray-600 capitalize">{tool.skill_level}</span>
                                    </div>
                                )}
                                {/* New Usability Row */}
                                {tool.learning_curve && (
                                    <div className="p-3 rounded-xl bg-white/40 border border-white/60 flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${tool.learning_curve === 'steep' ? 'bg-red-400' : tool.learning_curve === 'moderate' ? 'bg-orange-400' : 'bg-green-400'}`} />
                                        <span className="text-tiny font-bold text-gray-600 capitalize text-nowrap">{tool.learning_curve} Curve</span>
                                    </div>
                                )}
                                {tool.documentation_quality && (
                                    <div className="p-3 rounded-xl bg-white/40 border border-white/60 flex items-center gap-2">
                                        <span className="text-tiny font-bold text-gray-600 capitalize text-nowrap">{tool.documentation_quality} Docs</span>
                                    </div>
                                )}
                                {tool.platforms && tool.platforms.length > 0 && (
                                    <div className="col-span-2 p-3 rounded-xl bg-white/40 border border-white/60">
                                        <span className="text-eyebrow text-gray-400 block mb-1">Platforms</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {tool.platforms.map(p => (
                                                <span key={p} className="text-tiny font-bold text-gray-600 bg-white/50 px-1.5 py-0.5 rounded">{p}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {tool.support_options && tool.support_options.length > 0 && (
                                    <div className="col-span-2 p-3 rounded-xl bg-white/40 border border-white/60">
                                        <span className="text-eyebrow text-gray-400 block mb-1">Support</span>
                                        <div className="flex flex-wrap gap-2">
                                            {tool.support_options.map(s => (
                                                <span key={s} className="text-tiny font-bold text-gray-600 flex items-center gap-1">
                                                    <Check className="w-2.5 h-2.5 text-green-500" /> {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Features (New V3) */}
                        {tool.features && tool.features.length > 0 && (
                            <div className="pt-6 border-t border-white/40">
                                <h3 className="text-eyebrow text-zinc-400 mb-3">Key Features</h3>
                                <ul className="space-y-2">
                                    {tool.features.slice(0, 5).map(feature => (
                                        <li key={feature} className="flex items-start gap-2 text-tiny font-bold text-gray-600 leading-snug">
                                            <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Target Audience & Not Recommended (Side-by-Side) */}
                        {(tool.target_audience?.length || tool.not_recommended_for) && (
                            <div className="pt-6 border-t border-white/40">
                                <div className={`grid gap-4 ${tool.target_audience?.length && tool.not_recommended_for ? 'grid-cols-2' : 'grid-cols-1'}`}>

                                    {tool.target_audience && tool.target_audience.length > 0 && (
                                        <div className="space-y-3">
                                            <h3 className="text-eyebrow text-indigo-900/60 mb-1">Target Audience</h3>
                                            <div className="flex flex-col gap-1.5">
                                                {tool.target_audience.map(audience => (
                                                    <span key={audience} className="px-2 py-1 rounded-lg bg-indigo-50/50 text-tiny font-bold text-indigo-700 border border-indigo-100/50">
                                                        {audience}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {tool.not_recommended_for && (
                                        <div className="space-y-2">
                                            <h3 className="text-eyebrow text-red-900/60 mb-1">Not For</h3>
                                            <div className="p-3 rounded-xl bg-red-50/50 border border-red-100/50 relative overflow-hidden h-full">
                                                <p className="text-tiny font-bold text-red-700 leading-relaxed">
                                                    {tool.not_recommended_for}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        )}

                        {/* Tags (New V3) */}
                        {tool.tags && tool.tags.length > 0 && (
                            <div className="pt-6 border-t border-white/40">
                                <h3 className="text-eyebrow text-zinc-400 mb-3">Tags</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {tool.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="px-2 py-1 rounded-md bg-white/30 text-tiny font-bold text-gray-500 border border-white/40"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {tool.alternatives && tool.alternatives.length > 0 && (
                            <div>
                                <h3 className="text-eyebrow text-gray-400 mb-4 ml-2 mt-8">Competitors</h3>
                                <div className="flex flex-col gap-2">
                                    {tool.alternatives.map(alt => (
                                        <Link
                                            key={alt}
                                            href={`/?q=${encodeURIComponent(alt)}`}
                                            className="group flex items-center justify-between p-3 rounded-xl bg-white/60 hover:bg-white transition-all shadow-sm border border-transparent hover:border-indigo-100 text-left"
                                        >
                                            <span className="text-xs font-bold text-gray-600 group-hover:text-indigo-600 transition-colors">{alt}</span>
                                            <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-indigo-300" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Social Proof (moved to Sidebar) */}
                        {tool.reddit_morsels && tool.reddit_morsels.length > 0 && (
                            <div>
                                <h3 className="text-eyebrow text-gray-400 mb-4 ml-2 mt-8">Community Takes</h3>
                                <div className="space-y-4">
                                    {tool.reddit_morsels.map((morsel: any, i: number) => (
                                        <div key={i} className="p-4 rounded-2xl bg-white/40 border border-white/60 shadow-sm relative overflow-hidden group hover:bg-white/60 transition-colors">
                                            <p className="text-xs text-gray-600 font-medium italic mb-3 leading-relaxed">"{morsel.quote}"</p>
                                            <div className="flex items-center gap-2 text-tiny font-bold uppercase tracking-wider text-gray-400">
                                                <span className="text-orange-500/80">u/{morsel.author}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}


                    </div>

                </div>
            </div>

            {/* Site Nav Footer (Minimal) */}
            <div className="pt-24 pb-12 flex justify-center">
                <Link
                    href="/categories"
                    className="text-eyebrow text-gray-400 hover:text-indigo-600 transition-colors"
                >
                    Browse All Categories
                </Link>
            </div>
        </div>
    )
}
