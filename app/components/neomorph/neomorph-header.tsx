"use client"

import Link from "next/link"
import NeomorphNav from "./neomorph-nav"
import NeomorphFilters, { NeomorphCategoryChips } from "./neomorph-filters"
import NeomorphNewsletter from "./neomorph-newsletter"

export default function NeomorphHeader() {
    const pressedShadow = "inset 4px 4px 8px rgba(209, 217, 230, 0.7), inset -4px -4px 8px rgba(255, 255, 255, 0.7)";

    return (
        <header className="w-full py-4 lg:py-6 sticky top-0 z-50 border-b border-gray-200/20 shadow-sm" style={{ background: '#F0F0F3' }}>
            <div className="container mx-auto px-4 max-w-7xl space-y-4">
                {/* Mobile: Stack everything. Desktop: Grid layout */}

                {/* Row 1: Logo + Nav */}
                <div className="flex items-center justify-between gap-4">
                    {/* Logo */}
                    <div className="flex items-center justify-center p-3 lg:p-5 rounded-xl shrink-0" style={{ background: '#F0F0F3', boxShadow: pressedShadow }}>
                        <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
                            <img
                                src="/images/spinner.gif"
                                alt="Bedwinning"
                                className="h-10 md:h-14 lg:h-16 object-contain"
                            />
                        </Link>
                    </div>

                    {/* Nav - scrollable on mobile */}
                    <div className="flex-1 overflow-x-auto">
                        <NeomorphNav />
                    </div>
                </div>

                {/* Row 2: Search */}
                <NeomorphFilters />

                {/* Row 3: Categories (horizontal scroll on mobile) + Newsletter (hidden on mobile) */}
                <div className="flex items-start gap-4">
                    <div className="flex-1 overflow-x-auto pb-2 -mb-2">
                        <NeomorphCategoryChips />
                    </div>
                    {/* Newsletter - hidden on mobile, visible on lg+ */}
                    <div className="hidden lg:block shrink-0">
                        <NeomorphNewsletter />
                    </div>
                </div>
            </div>
        </header>
    )
}

