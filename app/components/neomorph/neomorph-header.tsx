import Link from "next/link"
import NeomorphNav from "./neomorph-nav"
import NeomorphFilters, { NeomorphCategoryChips } from "./neomorph-filters"

export default function NeomorphHeader() {
    return (
        <header className="w-full pt-6 pb-6 sticky top-0 z-50 border-b border-gray-200/20 shadow-sm" style={{ background: '#F0F0F3' }}>
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid lg:grid-cols-5 gap-x-12 gap-y-6 items-center">
                    {/* Logo Area: spans 2 columns to align with tool list */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
                            <img
                                src="/images/spinner.gif"
                                alt="Bedwinning"
                                className="h-16 md:h-20 object-contain"
                            />
                        </Link>
                    </div>

                    {/* Nav & Search Area: spans 3 columns to align with details pane */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="flex justify-end">
                            <NeomorphNav />
                        </div>
                        <NeomorphFilters />
                    </div>

                    {/* Full-width Category Chips: Balances the visual weight */}
                    <div className="lg:col-span-5 pt-2">
                        <NeomorphCategoryChips />
                    </div>
                </div>
            </div>
        </header>
    )
}
