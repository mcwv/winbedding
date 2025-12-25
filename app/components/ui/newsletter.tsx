"use client"

import { useState } from "react"
import { Mail, CheckCircle2 } from "lucide-react"



export default function Newsletter() {
    const [email, setEmail] = useState("")
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setStatus('loading')
        // Simulate API call
        setTimeout(() => {
            setStatus('success')
            setEmail("")
        }, 1500)
    }

    if (status === 'success') {
        return (
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-popover border border-green-200 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-eyebrow text-text-secondary">You're in!</span>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="relative flex items-center group">
            <div className="absolute left-4 z-10">
                <Mail className={`w-4 h-4 transition-colors ${status === 'loading' ? 'animate-pulse text-brand' : 'text-text-muted group-focus-within:text-brand'}`} />
            </div>
            <input
                type="email"
                placeholder="Join the AI newsletter..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
                className="pl-12 pr-24 py-3 rounded-xl bg-card-weak border border-border text-form-label outline-none transition-all duration-300 placeholder:text-text-muted/60 w-full lg:w-80 shadow-sm focus:border-brand focus:ring-2 focus:ring-brand/10"
            />
            <button
                type="submit"
                disabled={status === 'loading' || !email}
                className="absolute right-1.5 px-4 py-2 rounded-lg text-form-label uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 bg-brand text-white shadow-md hover:bg-brand-hover"
            >
                {status === 'loading' ? '...' : 'Join'}
            </button>
        </form>
    )
}
