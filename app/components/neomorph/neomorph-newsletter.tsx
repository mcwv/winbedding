"use client"

import { useState } from "react"
import { Mail, CheckCircle2 } from "lucide-react"

const neomorphShadow = {
    raised: "4px 4px 8px rgba(209, 217, 230, 0.8), -4px -4px 8px rgba(255, 255, 255, 0.8)",
    pressed: "inset 2px 2px 4px rgba(209, 217, 230, 0.7), inset -2px -2px 4px rgba(255, 255, 255, 0.7)",
}

export default function NeomorphNewsletter() {
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
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl"
                style={{ background: '#F0F0F3', boxShadow: neomorphShadow.pressed }}>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-700">You're in!</span>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="relative flex items-center group">
            <div className="absolute left-4 z-10">
                <Mail className={`w-4 h-4 transition-colors ${status === 'loading' ? 'animate-pulse text-indigo-400' : 'text-zinc-400 group-focus-within:text-indigo-500'}`} />
            </div>
            <input
                type="email"
                placeholder="Join the AI newsletter..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
                className="pl-12 pr-24 py-3 rounded-xl bg-[#F0F0F3] text-[11px] font-bold outline-none transition-all duration-300 placeholder:text-zinc-400 w-full lg:w-80"
                style={{
                    boxShadow: neomorphShadow.pressed,
                }}
            />
            <button
                type="submit"
                disabled={status === 'loading' || !email}
                className="absolute right-1.5 px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                style={{
                    background: '#F0F0F3',
                    boxShadow: neomorphShadow.raised,
                    color: '#4f46e5'
                }}
            >
                {status === 'loading' ? '...' : 'Join'}
            </button>
        </form>
    )
}
