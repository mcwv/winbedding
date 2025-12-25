"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Home, Tags, UserCircle, Menu, X, Search } from "lucide-react"



export default function Nav() {
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [mobileSearch, setMobileSearch] = useState("")
    const menuRef = useRef<HTMLDivElement>(null)

    const navItems = [
        { label: "Home", icon: Home, href: "/" },
        { label: "Categories", icon: Tags, href: "/categories" },
        { label: "About", icon: UserCircle, href: "/about" },
    ]

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false)
            }
        }
        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isMenuOpen])

    const handleMobileSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (mobileSearch.trim()) {
            router.push(`/?q=${encodeURIComponent(mobileSearch.trim())}`)
            setIsMenuOpen(false)
            setMobileSearch("")
        }
    }

    return (
        <div className="flex items-center justify-end w-full gap-2 md:gap-3">
            {/* Desktop: Inline Nav Items */}
            <div className="hidden md:flex items-center gap-2">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border ${isActive
                                ? 'bg-neutral-100 text-brand border-neutral-200 shadow-inner'
                                : 'bg-card-weak text-text-secondary border-border shadow-sm hover:text-brand hover:border-brand/30'}`}
                        >
                            <Icon className="w-4 h-4" />
                            {item.label}
                        </Link>
                    )
                })}
            </div>

            {/* CTA Button - Visible only on Desktop */}
            <Link
                href="/submit"
                className="hidden md:flex px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap bg-brand text-white shadow-md hover:bg-brand-hover hover:shadow-lg active:scale-95"
            >
                Submit
            </Link>

            {/* Mobile: Hamburger Menu */}
            <div className="md:hidden relative" ref={menuRef}>
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`p-2 rounded-lg transition-all border ${isMenuOpen
                        ? 'bg-neutral-100 text-brand border-neutral-200 shadow-inner'
                        : 'bg-card-weak text-text-secondary border-border shadow-sm'}`}
                    aria-label="Menu"
                >
                    {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>

                {/* Dropdown Menu - Full width on mobile */}
                {isMenuOpen && (
                    <div
                        className="fixed left-4 right-4 top-20 rounded-2xl p-4 z-[100] shadow-2xl bg-popover border border-border"
                    >
                        {/* Search in dropdown */}
                        <form onSubmit={handleMobileSearch} className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    type="text"
                                    placeholder="Search tools..."
                                    value={mobileSearch}
                                    onChange={(e) => setMobileSearch(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none bg-neutral-100 text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand/20"
                                    autoFocus
                                />
                            </div>
                        </form>

                        {/* Nav Links */}
                        <div className="space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                const isActive = pathname === item.href

                                // Handle navigation with loading indicator
                                const handleClick = (e: React.MouseEvent) => {
                                    setIsMenuOpen(false)
                                    if (item.href === '/') {
                                        e.preventDefault()
                                        // Check if we're on clean homepage (no params at all)
                                        const isCleanHomepage = pathname === '/' && searchParams.toString() === ''

                                        if (isCleanHomepage) {
                                            // Already on clean homepage - just scroll to top
                                            const toolList = document.getElementById('tool-list')
                                            if (toolList) toolList.scrollTo({ top: 0, behavior: 'smooth' })
                                        } else {
                                            // Any other case - navigate to clean home
                                            window.dispatchEvent(new CustomEvent('navigationStart'))
                                            router.push('/')
                                        }
                                    } else {
                                        // Dispatch loading start event for other pages
                                        window.dispatchEvent(new CustomEvent('navigationStart'))
                                    }
                                }



                                return (

                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        onClick={handleClick}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                            ? 'bg-neutral-100 text-brand'
                                            : 'text-text-secondary hover:bg-neutral-50 hover:text-brand'}`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.label}
                                    </Link>
                                )
                            })}

                            {/* Mobile Submit Button */}
                            <Link
                                href="/submit"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center justify-center gap-2 px-4 py-3 mt-4 rounded-xl text-sm font-bold bg-brand text-white shadow-md active:scale-95"
                            >
                                Submit Tool
                            </Link>
                        </div>


                    </div>
                )}
            </div>
        </div>
    )
}


