"use client"

import Link from "next/link"
import NeomorphNav from "./neomorph-nav"
import NeomorphFilters, { NeomorphCategoryChips } from "./neomorph-filters"
import NeomorphNewsletter from "./neomorph-newsletter"

export default function NeomorphHeader() {
    const pressedShadow = "inset 4px 4px 8px rgba(209, 217, 230, 0.7), inset -4px -4px 8px rgba(255, 255, 255, 0.7)";

    return (
        <header className="w-full pt-6 pb-6 sticky top-0 z-50 border-b border-gray-200/20 shadow-sm" style={{ background: '#F0F0F3' }}>
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid lg:grid-cols-5 gap-x-6 gap-y-6 items-center">
                    {/* Logo Area: spans 2 columns to align with tool list */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-center p-5 rounded-xl w-full" style={{ background: '#F0F0F3', boxShadow: pressedShadow }}>
                            <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
                                <img
                                    src="/images/spinner.gif"
                                    alt="Bedwinning"
                                    className="h-14 md:h-16 object-contain"
                                />
                            </Link>
                        </div>
                    </div>

                    {/* Nav & Search Area: spans 3 columns to align with details pane */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="flex flex-wrap items-center justify-end gap-6">
                            <NeomorphNav />
                        </div>
                        <NeomorphFilters />
                    </div>

                    {/* Full-width Row for Category Chips & Newsletter */}
                    <div className="lg:col-span-5 pt-2 flex items-center justify-between gap-6">
                        <div className="flex-1">
                            <NeomorphCategoryChips />
                        </div>
                        <div className="shrink-0">
                            <NeomorphNewsletter />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
