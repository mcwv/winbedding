"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Tags, UserCircle, Menu, X } from "lucide-react"

const neomorphShadow = {
    raised: `6px 6px 12px rgba(209, 217, 230, 0.8), -6px -6px 12px rgba(255, 255, 255, 0.8)`,
    pressed: `inset 3px 3px 6px rgba(209, 217, 230, 0.7), inset -3px -3px 6px rgba(255, 255, 255, 0.7)`,
}

export default function NeomorphNav() {
    const pathname = usePathname()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const navItems = [
        { label: "Home", icon: Home, href: "/" },
        { label: "Categories", icon: Tags, href: "/categories" },
        { label: "About", icon: UserCircle, href: "/about" },
    ]

    return (
        <div className="flex items-center justify-end w-full gap-3">
            {/* Desktop: Inline Nav Items */}
            <div className="hidden md:flex items-center gap-2">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
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

            {/* CTA Button - Always Visible */}
            <Link
                href="/submit"
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
                style={{
                    background: '#F0F0F3',
                    boxShadow: neomorphShadow.raised,
                    color: '#4f46e5',
                }}
            >
                Submit Tool
            </Link>

            {/* Mobile: Hamburger Menu */}
            <div className="md:hidden relative">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 rounded-lg transition-all"
                    style={{
                        background: '#F0F0F3',
                        boxShadow: isMenuOpen ? neomorphShadow.pressed : neomorphShadow.raised,
                        color: '#71717a',
                    }}
                >
                    {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                    <div
                        className="absolute right-0 top-full mt-2 rounded-xl p-2 z-50 min-w-[160px]"
                        style={{
                            background: '#F0F0F3',
                            boxShadow: neomorphShadow.raised,
                        }}
                    >
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all"
                                    style={{
                                        background: isActive ? '#E8E8EB' : 'transparent',
                                        color: isActive ? '#4f46e5' : '#71717a',
                                    }}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

