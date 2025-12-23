"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, Send, Sparkles, Target, Link as LinkIcon, Mail, Building2, MessageSquare } from "lucide-react"
import NeomorphNav from "../components/neomorph/neomorph-nav"

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

export default function SubmitPage() {
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        // Simulate submission
        await new Promise(r => setTimeout(r, 1500))
        setLoading(false)
        setSubmitted(true)
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F0F0F3' }}>
                <div className="max-w-md w-full p-12 rounded-[2.5rem] text-center space-y-8"
                    style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised }}>
                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto text-green-500"
                        style={{ background: '#F0F0F3', boxShadow: neomorphShadow.pressed }}>
                        <Sparkles className="w-10 h-10" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Submission Sent</h2>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                            Thank you for contributing! Our team strictly vets every submission for quality and utility. We'll be in touch if your tool makes the cut.
                        </p>
                    </div>
                    <Link href="/"
                        className="inline-flex px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                        style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised, color: '#4f46e5' }}>
                        Back to Index
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col" style={{ background: '#F0F0F3' }}>
            <header className="w-full pt-6 pb-6" style={{ background: '#F0F0F3' }}>
                <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between">
                    <Link href="/" className="inline-flex p-3 rounded-2xl transition-all active:scale-95"
                        style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised }}>
                        <ChevronLeft className="w-6 h-6 text-gray-400" />
                    </Link>
                    <img src="/images/spinner.gif" alt="Bedwinning" className="h-12 object-contain" />
                    <div className="w-12 h-12" /> {/* Spacer */}
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 max-w-2xl py-12">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-2"
                        style={{ background: '#F0F0F3', boxShadow: 'inset 2px 2px 5px rgba(209,217,230,0.7), inset -2px -2px 5px rgba(255,255,255,0.7)' }}>
                        <Target className="w-4 h-4 text-indigo-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Quality Index</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none uppercase">
                        Submit a <span className="text-indigo-600">Pure</span> Tool
                    </h1>
                    <p className="text-sm text-gray-500 font-bold max-w-md mx-auto leading-relaxed">
                        We only index tools that solve real problems. No hype, no fluff, just utility.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Tool Name */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-2">Tool Name</label>
                        <div className="relative group">
                            <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                required
                                type="text"
                                placeholder="e.g. Claude"
                                className="w-full pl-14 pr-6 py-5 rounded-2xl bg-[#F0F0F3] text-sm outline-none transition-all placeholder:text-zinc-300 font-bold"
                                style={{ boxShadow: neomorphShadow.pressed }}
                            />
                        </div>
                    </div>

                    {/* URLs */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-2">Website URL</label>
                            <div className="relative group">
                                <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    required
                                    type="url"
                                    placeholder="https://..."
                                    className="w-full pl-14 pr-6 py-5 rounded-2xl bg-[#F0F0F3] text-sm outline-none transition-all placeholder:text-zinc-300 font-bold"
                                    style={{ boxShadow: neomorphShadow.pressed }}
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-2">Contact Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    required
                                    type="email"
                                    placeholder="your@email.com"
                                    className="w-full pl-14 pr-6 py-5 rounded-2xl bg-[#F0F0F3] text-sm outline-none transition-all placeholder:text-zinc-300 font-bold"
                                    style={{ boxShadow: neomorphShadow.pressed }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-2">Value Proposition (Markdown)</label>
                        <div className="relative group">
                            <MessageSquare className="absolute left-6 top-6 w-4 h-4 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                            <textarea
                                required
                                rows={6}
                                placeholder="Explain what makes this tool exceptional..."
                                className="w-full pl-14 pr-6 py-6 rounded-[2rem] bg-[#F0F0F3] text-sm outline-none transition-all placeholder:text-zinc-300 font-bold resize-none"
                                style={{ boxShadow: neomorphShadow.pressed }}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-6 rounded-[2rem] flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all active:scale-[0.98] disabled:opacity-50"
                            style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised, color: '#4f46e5' }}
                        >
                            {loading ? (
                                <div className="w-4 h-4 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                            ) : (
                                <>
                                    Dispatch Submission
                                    <Send className="w-4 h-4 stroke-[3px]" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <p className="mt-12 text-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/30">
                    Bedwinning strictly vets all tools. Submission does not guarantee indexing.
                </p>
            </main>
        </div>
    )
}
