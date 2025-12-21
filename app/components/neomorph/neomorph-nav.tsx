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
        { label: "Tools", icon: Sparkles, href: "/tools" },
        { label: "Categories", icon: Tags, href: "#" },
        { label: "About", icon: UserCircle, href: "#" },
    ]

    return (
        <nav
            className="sticky top-0 z-50 py-4"
            style={{ background: '#F0F0F3' }}
        >
            <div className="container mx-auto px-4 max-w-7xl">
                <div
                    className="rounded-2xl p-4 flex items-center justify-between"
                    style={{
                        background: '#F0F0F3',
                        boxShadow: neomorphShadow.raised,
                    }}
                >
                    {/* Logo - Big text style */}
                    <Link href="/" className="flex items-center">
                        <img src="/images/spinner.gif" alt="Bedwinning" className="h-14 md:h-20 object-contain" />
                    </Link>

                    {/* Nav Items */}
                    <div className="hidden md:flex items-center gap-2">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                                    style={{
                                        background: '#F0F0F3',
                                        boxShadow: isActive ? neomorphShadow.pressed : neomorphShadow.raised,
                                        color: isActive ? '#22c55e' : '#71717a',
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

                    {/* CTA Button */}
                    <Link
                        href="#"
                        className="px-5 py-2 rounded-xl text-sm font-semibold hover:scale-105 transition-transform"
                        style={{
                            background: '#F0F0F3',
                            boxShadow: neomorphShadow.raised,
                            color: '#22c55e',
                        }}
                    >
                        Submit Tool
                    </Link>
                </div>
            </div>
        </nav>
    )
}
