"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import Image from "next/image"
import Nav from "./nav"
import Filters, { CategoryChips } from "./filters"
import Newsletter from "./newsletter"

export default function Header() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()


    const handleLogoClick = () => {
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
    }


    return (
        <header className="w-full py-4 lg:py-6 sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md shadow-sm">
            <div className="container mx-auto px-4 max-w-7xl space-y-4">
                {/* Desktop Layout: 2 Rows */}
                <div className="hidden lg:flex flex-col gap-5">
                    {/* Row 1: Logo + Search + Nav */}
                    <div className="flex items-center gap-6 w-full">
                        {/* Logo */}
                        <div className="flex items-center justify-center p-3 rounded-xl shrink-0 bg-surface shadow-sm border border-border hover:shadow-md transition-all">
                            <button
                                onClick={handleLogoClick}
                                className="inline-block"
                            >
                                <Image
                                    src="/images/spinner.gif"
                                    alt="Bedwinning"
                                    width={160}
                                    height={50}
                                    className="h-12 w-auto object-contain mix-blend-multiply"
                                    priority
                                    unoptimized
                                />
                            </button>
                        </div>

                        {/* Search Bar - Centered/Right-ish */}
                        <div className="flex-1 max-w-2xl">
                            <Filters />
                        </div>

                        {/* Nav */}
                        <div className="ml-auto shrink-0">
                            <Nav />
                        </div>
                    </div>

                    {/* Row 2: Categories + Newsletter */}
                    <div className="flex items-center justify-between gap-4 pl-1">
                        <div className="flex-1 overflow-x-auto pb-1 scrollbar-hide">
                            <CategoryChips />
                        </div>
                        <div className="shrink-0 pl-4 border-l border-border/50">
                            <Newsletter />
                        </div>
                    </div>
                </div>

                {/* Mobile Layout: Stacked */}
                <div className="lg:hidden space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center justify-center p-3 rounded-xl shrink-0 bg-surface shadow-sm border border-border">
                            <button onClick={handleLogoClick}>
                                <Image
                                    src="/images/spinner.gif"
                                    alt="Bedwinning"
                                    width={140}
                                    height={40}
                                    className="h-10 w-auto object-contain mix-blend-multiply"
                                    priority
                                    unoptimized
                                />
                            </button>
                        </div>
                        <div className="flex-1 overflow-x-auto justify-end flex">
                            <Nav />
                        </div>
                    </div>
                    {/* Mobile Search - TODO: Make this collapsible or compact? For now keep full width */}
                    <Filters />

                </div>
            </div>
        </header>
    )
}


