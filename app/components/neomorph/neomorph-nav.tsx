"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Sparkles, Tags, UserCircle } from "lucide-react"

const neomorphShadow = {
    raised: `
    6px 6px 12px rgba(209, 217, 230, 0.8),
    -6px -6px 12px rgba(255, 255, 255, 0.8)
  `,
    pressed: `
    inset 3px 3px 6px rgba(209, 217, 230, 0.7),
    inset -3px -3px 6px rgba(255, 255, 255, 0.7)
  `,
}

export default function NeomorphNav() {
    const pathname = usePathname()

    const navItems = [
        { label: "Home", icon: Home, href: "/" },
        { label: "Tools", icon: Sparkles, href: "/" },
        { label: "Categories", icon: Tags, href: "/categories" },
        { label: "About", icon: UserCircle, href: "/about" },
    ]

    return (
        <div
            className="rounded-2xl p-4 flex items-center justify-between w-full"
            style={{
                background: '#F0F0F3',
                boxShadow: neomorphShadow.raised,
            }}
        >
            {/* Nav Items - Neutralized & Indigo Accent */}
            <div className="flex items-center gap-2">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                            style={{
                                background: '#F0F0F3',
                                boxShadow: isActive ? neomorphShadow.pressed : neomorphShadow.raised,
                                color: isActive ? '#4f46e5' : '#71717a',
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </div>
                        </Link>
                    )
                })}
            </div>

            {/* CTA Button - Indigo Accent */}
            <Link
                href="/submit"
                className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                    background: '#F0F0F3',
                    boxShadow: neomorphShadow.raised,
                    color: '#4f46e5',
                }}
            >
                Submit Tool
            </Link>
        </div>
    )
}
