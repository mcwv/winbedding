"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Send, Sparkles, Target, Link as LinkIcon, Mail, Building2, MessageSquare, Image as ImageIcon, Monitor, Video } from "lucide-react"
// import Nav from "@/app/components/ui/nav" // Unused
import { submitToolAction } from "./actions"



export default function SubmitPage() {
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const result = await submitToolAction(formData)

        setLoading(false)
        if (result.success) {
            setSubmitted(true)
        } else {
            setError(result.error || "Something went wrong")
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-background">
                <div className="max-w-md w-full p-12 rounded-[2.5rem] text-center space-y-8 bg-surface shadow-xl border border-border/50">
                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto text-success bg-success-subtle ring-1 ring-success/20">
                        <Sparkles className="w-10 h-10" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-text-primary uppercase tracking-tight">Submission Sent</h2>
                        <p className="text-sm text-text-secondary font-medium leading-relaxed">
                            Thank you for contributing! Our team strictly vets every submission for quality and utility. We'll be in touch if your tool makes the cut.
                        </p>
                    </div>
                    <Link href="/"
                        className="inline-flex px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 bg-brand text-white hover:bg-brand-hover shadow-lg shadow-brand/20">
                        Back to Index
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <header className="w-full pt-6 pb-6 bg-background">
                <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between">
                    <Link href="/" className="inline-flex p-3 rounded-2xl transition-all active:scale-95 bg-surface shadow-sm border border-border hover:bg-neutral-50 items-center justify-center text-text-secondary hover:text-brand">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <Image
                        src="/images/spinner.gif"
                        alt="Bedwinning"
                        width={180}
                        height={64}
                        className="h-12 w-auto object-contain mix-blend-multiply"
                        priority
                        unoptimized
                    />
                    <div className="w-12 h-12" /> {/* Spacer */}
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 max-w-2xl py-12">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-2 bg-surface border border-border shadow-sm">
                        <Target className="w-4 h-4 text-brand" />
                        <span className="text-eyebrow text-text-muted">Quality Index</span>
                    </div>
                    <h1 className="text-display-bold text-text-primary tracking-tight leading-none uppercase">
                        Submit a <span className="text-brand">New</span> Tool
                    </h1>
                    <p className="text-body-sm text-text-secondary font-bold max-w-md mx-auto leading-relaxed">
                        We only index tools that solve real problems. No hype, no fluff, just utility.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Tool Name */}
                    <div className="space-y-3">
                        <label className="text-form-label text-text-muted pl-2">Tool Name</label>
                        <div className="relative group">
                            <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand transition-colors" />
                            <input
                                required
                                type="text"
                                placeholder="e.g. Claude"
                                name="name"
                                className="w-full pl-14 pr-6 py-5 rounded-2xl bg-surface border border-border text-text-primary text-sm outline-none transition-all placeholder:text-text-muted/50 font-bold focus:border-brand focus:ring-2 focus:ring-brand/10 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* URLs */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-form-label text-text-muted pl-2">Website URL</label>
                            <div className="relative group">
                                <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand transition-colors" />
                                <input
                                    required
                                    type="url"
                                    name="websiteUrl"
                                    placeholder="https://..."
                                    className="w-full pl-14 pr-6 py-5 rounded-2xl bg-surface border border-border text-text-primary text-sm outline-none transition-all placeholder:text-text-muted/50 font-bold focus:border-brand focus:ring-2 focus:ring-brand/10 shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-form-label text-text-muted pl-2">Contact Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand transition-colors" />
                                <input
                                    required
                                    type="email"
                                    name="contactEmail"
                                    placeholder="your@email.com"
                                    className="w-full pl-14 pr-6 py-5 rounded-2xl bg-surface border border-border text-text-primary text-sm outline-none transition-all placeholder:text-text-muted/50 font-bold focus:border-brand focus:ring-2 focus:ring-brand/10 shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Media URLs */}
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-form-label text-text-muted pl-2">Logo URL (Optional)</label>
                                <div className="relative group">
                                    <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand transition-colors" />
                                    <input
                                        type="url"
                                        name="logoUrl"
                                        placeholder="https://.../logo.png"
                                        className="w-full pl-14 pr-6 py-5 rounded-2xl bg-surface border border-border text-text-primary text-sm outline-none transition-all placeholder:text-text-muted/50 font-bold focus:border-brand focus:ring-2 focus:ring-brand/10 shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-form-label text-text-muted pl-2">Screenshot URL (Optional)</label>
                                <div className="relative group">
                                    <Monitor className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand transition-colors" />
                                    <input
                                        type="url"
                                        name="screenshotUrl"
                                        placeholder="https://.../app.png"
                                        className="w-full pl-14 pr-6 py-5 rounded-2xl bg-surface border border-border text-text-primary text-sm outline-none transition-all placeholder:text-text-muted/50 font-bold focus:border-brand focus:ring-2 focus:ring-brand/10 shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-form-label text-text-muted pl-2">Video Demo URL (Optional)</label>
                            <div className="relative group">
                                <Video className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand transition-colors" />
                                <input
                                    type="url"
                                    name="videoUrl"
                                    placeholder="YouTube, Loom, or MP4 link"
                                    className="w-full pl-14 pr-6 py-5 rounded-2xl bg-surface border border-border text-text-primary text-sm outline-none transition-all placeholder:text-text-muted/50 font-bold focus:border-brand focus:ring-2 focus:ring-brand/10 shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <label className="text-form-label text-text-muted pl-2">Value Proposition (Markdown)</label>
                        <div className="relative group">
                            <MessageSquare className="absolute left-6 top-6 w-4 h-4 text-text-muted group-focus-within:text-brand transition-colors" />
                            <textarea
                                required
                                rows={6}
                                name="description"
                                placeholder="Explain what makes this tool exceptional..."
                                className="w-full pl-14 pr-6 py-6 rounded-[2rem] bg-surface border border-border text-text-primary text-sm outline-none transition-all placeholder:text-text-muted/50 font-bold resize-none focus:border-brand focus:ring-2 focus:ring-brand/10 shadow-sm"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-2xl bg-destructive-subtle text-destructive text-xs font-bold text-center animate-in fade-in duration-300 border border-destructive/20">
                            {error}
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-6 rounded-[2rem] flex items-center justify-center gap-3 text-eyebrow transition-all active:scale-[0.98] disabled:opacity-50 bg-brand text-white hover:bg-brand-hover shadow-lg shadow-brand/25"
                        >
                            {loading ? (
                                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                            ) : (
                                <>
                                    Dispatch Submission
                                    <Send className="w-4 h-4 stroke-[3px]" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <p className="mt-12 text-center text-eyebrow text-text-muted/50">
                    Bedwinning strictly vets all tools. Submission does not guarantee indexing.
                </p>
            </main>
        </div>
    )
}
