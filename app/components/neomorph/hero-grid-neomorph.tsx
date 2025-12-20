"use client"

import { useState } from "react"
import { TrendingUp } from "lucide-react"

interface Job {
    id: number
    title: string
    slug: string
    country: string
    salaryMin: number
    salaryMax: number | null
    salaryDisplay: string
    salaryAvg: number
    companyId: number
    companyName: string
    companyLogo: string | null
    link: string
}

interface HeroGridNeomorphProps {
    jobCount: number
    salaryJobs: Job[]
}

// Neumorphic shadow utility
const neomorphShadow = {
    raised: `
    12px 12px 24px rgba(209, 217, 230, 0.9),
    -12px -12px 24px rgba(255, 255, 255, 0.9)
  `,
    pressed: `
    inset 6px 6px 12px rgba(209, 217, 230, 0.85),
    inset -6px -6px 12px rgba(255, 255, 255, 0.85)
  `,
    pressedDeep: `
    inset 10px 10px 20px rgba(209, 217, 230, 0.95),
    inset -10px -10px 20px rgba(255, 255, 255, 0.95)
  `,
    flat: `
    6px 6px 12px rgba(209, 217, 230, 0.7),
    -6px -6px 12px rgba(255, 255, 255, 0.7)
  `,
}

export default function HeroGridNeomorph({ jobCount, salaryJobs }: HeroGridNeomorphProps) {
    const [searchFocused, setSearchFocused] = useState(false)

    return (
        <section className="relative py-12">
            {/* Add breathing animation styles */}
            <style jsx>{`
                @keyframes breathe {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.005); }
                }
                @keyframes pulse-shadow {
                    0%, 100% { filter: brightness(1); }
                    50% { filter: brightness(1.02); }
                }
                .breathing {
                    animation: breathe 4s ease-in-out infinite;
                }
                .pulse {
                    animation: pulse-shadow 3s ease-in-out infinite;
                }
            `}</style>
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid lg:grid-cols-5 gap-8 items-start">
                    {/* Left Column: Hero + Search */}
                    <div className="lg:col-span-3">
                        {/* Main Neumorphic Card - NOW BREATHING */}
                        <div
                            className="rounded-3xl p-8 md:p-12 breathing"
                            style={{
                                background: '#F0F0F3',
                                boxShadow: neomorphShadow.raised,
                            }}
                        >
                            <div className="space-y-6 max-w-2xl">
                                {/* Badge */}
                                <div
                                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full w-fit"
                                    style={{
                                        background: '#F0F0F3',
                                        boxShadow: neomorphShadow.flat,
                                        color: '#22c55e',
                                    }}
                                >
                                    <TrendingUp className="w-3 h-3" />
                                    Verified ratings and reviews
                                </div>

                                {/* Headline */}
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.1]">
                                    Soft landings for{" "}
                                    <span style={{ color: '#22c55e' }}>smart builders.</span>
                                </h1>

                                <p className="text-lg text-muted-foreground text-pretty max-w-lg leading-relaxed">
                                    Discover curated AI tools & SaaS products to launch your project faster.
                                    Quality over quantity - only the tools that matter.
                                </p>

                                {/* Neumorphic Search Bar */}
                                <div className="pt-2">
                                    <div
                                        className="rounded-2xl p-4 transition-all duration-200"
                                        style={{
                                            background: '#F0F0F3',
                                            boxShadow: searchFocused ? neomorphShadow.pressedDeep : neomorphShadow.pressed,
                                        }}
                                    >
                                        <input
                                            type="text"
                                            placeholder="Search AI tools by name, category, or feature..."
                                            className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground border-0"
                                            onFocus={() => setSearchFocused(true)}
                                            onBlur={() => setSearchFocused(false)}
                                            style={{
                                                background: 'transparent',
                                            }}
                                        />
                                    </div>

                                    {/* Trending Chips */}
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        <span className="text-xs text-muted-foreground font-medium mr-1 self-center">
                                            Trending:
                                        </span>
                                        {["AI Video", "Music Generator", "Chatbot"].map((term) => (
                                            <button
                                                key={term}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                                style={{
                                                    background: '#F0F0F3',
                                                    boxShadow: neomorphShadow.flat,
                                                    color: '#71717a',
                                                }}
                                            >
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Stats Card - PULSING */}
                    <div className="lg:col-span-2">
                        <div
                            className="rounded-3xl p-8 pulse"
                            style={{
                                background: '#F0F0F3',
                                boxShadow: neomorphShadow.raised,
                            }}
                        >
                            <div className="text-center space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    AI Tools
                                </h3>
                                <p className="text-6xl font-bold" style={{ color: '#22c55e' }}>
                                    {jobCount}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Curated and verified tools
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
