"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search, ChevronDown, X } from "lucide-react"
import { MAIN_CATEGORIES } from "@/app/lib/categoryMapping"

const neomorphShadow = {
    raised: "8px 8px 16px rgba(209, 217, 230, 0.8), -8px -8px 16px rgba(255, 255, 255, 0.8)",
    pressed: "inset 4px 4px 8px rgba(209, 217, 230, 0.7), inset -4px -4px 8px rgba(255, 255, 255, 0.7)",
}

export default function NeomorphFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()

    const [search, setSearch] = useState(searchParams.get("q") || "")
    const inputRef = (useCallback((node: HTMLInputElement | null) => {
        if (node !== null) {
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
                    e.preventDefault()
                    node.focus()
                }
            }
            window.addEventListener("keydown", handleKeyDown)
            return () => window.removeEventListener("keydown", handleKeyDown)
        }
    }, []))

    // Update state when URL changes
    useEffect(() => {
        setSearch(searchParams.get("q") || "")
    }, [searchParams])

    const updateParams = useCallback((newSearch: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (newSearch) {
            params.set("q", newSearch)
            params.delete("c") // Clear category when searching
        } else {
            params.delete("q")
        }

        // Always redirect to home index when searching
        router.push(`/?${params.toString()}`)
    }, [router, searchParams])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setSearch(val)
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        updateParams(search)
    }

    // Debounced search update
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (searchParams.get("q") || "")) {
                updateParams(search)
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [search, searchParams, updateParams])

    return (
        <form onSubmit={handleSearchSubmit} className="relative w-full group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
            <input
                ref={inputRef as any}
                type="text"
                placeholder="Search the AI Index (~2,000 tools)... Press / to focus"
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-12 py-4 rounded-xl bg-[#F0F0F3] text-sm outline-none transition-all duration-300 placeholder:text-zinc-400 font-medium"
                style={{
                    boxShadow: neomorphShadow.pressed,
                }}
            />
            {search && (
                <button
                    type="button"
                    onClick={() => { setSearch(""); updateParams(""); }}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-indigo-600 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </form>
    )
}

export function NeomorphCategoryChips() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const [isExpanded, setIsExpanded] = useState(false)

    const category = searchParams.get("c") || "all"

    const updateCategory = (newCategory: string) => {
        const params = new URLSearchParams() // Start fresh to clear search
        if (newCategory !== "all") params.set("c", newCategory)

        // Always redirect to home index when filtering
        router.push(`/?${params.toString()}`)
    }

    const visibleCategories = isExpanded ? MAIN_CATEGORIES : MAIN_CATEGORIES.slice(0, 8)

    return (
        <div className="flex flex-wrap items-center justify-start gap-3 w-full">
            <button
                onClick={() => updateCategory("all")}
                className="px-4 py-2 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider"
                style={{
                    background: '#F0F0F3',
                    boxShadow: category === "all" ? neomorphShadow.pressed : neomorphShadow.raised,
                    color: category === "all" ? '#4f46e5' : '#71717a',
                }}
            >
                All
            </button>
            {visibleCategories.map(cat => (
                <button
                    key={cat}
                    onClick={() => updateCategory(cat)}
                    className="px-4 py-2 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider whitespace-nowrap"
                    style={{
                        background: '#F0F0F3',
                        boxShadow: category === cat ? neomorphShadow.pressed : neomorphShadow.raised,
                        color: category === cat ? '#4f46e5' : '#71717a',
                    }}
                >
                    {cat}
                </button>
            ))}
            {!isExpanded && MAIN_CATEGORIES.length > 8 && (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="px-4 py-2 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider text-indigo-500/60 hover:text-indigo-600"
                    style={{
                        background: '#F0F0F3',
                        boxShadow: neomorphShadow.raised,
                    }}
                >
                    More +
                </button>
            )}
            {isExpanded && (
                <button
                    onClick={() => setIsExpanded(false)}
                    className="px-4 py-2 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider text-indigo-500/60 hover:text-indigo-600"
                    style={{
                        background: '#F0F0F3',
                        boxShadow: neomorphShadow.raised,
                    }}
                >
                    Less -
                </button>
            )}
        </div>
    )
}
