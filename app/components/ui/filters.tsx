"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search, ChevronDown, X } from "lucide-react"
import { MAIN_CATEGORIES } from "@/app/lib/categoryMapping"



// Example searches that work with our search logic
const EXAMPLE_SEARCHES = [
    "writing assistant",
    "image generator",
    "video editor",
    "code helper",
    "SEO tools",
    "chatbot",
    "voice AI",
    "no-code",
]

export default function Filters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()

    const [search, setSearch] = useState(searchParams.get("q") || "")
    const [placeholderText, setPlaceholderText] = useState("Search tools...")
    const [isFocused, setIsFocused] = useState(false)

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

    // Typewriter effect for placeholder
    useEffect(() => {
        if (isFocused || search) return // Don't animate when focused or has value

        let currentIndex = 0
        let charIndex = 0
        let isDeleting = false
        let timeout: NodeJS.Timeout

        const type = () => {
            const currentSearch = EXAMPLE_SEARCHES[currentIndex]
            const fullText = `Try "${currentSearch}"...`

            if (!isDeleting) {
                setPlaceholderText(fullText.substring(0, charIndex + 1))
                charIndex++
                if (charIndex === fullText.length) {
                    isDeleting = true
                    timeout = setTimeout(type, 2000) // Pause at end
                    return
                }
            } else {
                setPlaceholderText(fullText.substring(0, charIndex - 1))
                charIndex--
                if (charIndex === 0) {
                    isDeleting = false
                    currentIndex = (currentIndex + 1) % EXAMPLE_SEARCHES.length
                }
            }
            timeout = setTimeout(type, isDeleting ? 30 : 80)
        }

        timeout = setTimeout(type, 1000)
        return () => clearTimeout(timeout)
    }, [isFocused, search])

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
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand transition-colors" />
            <input
                ref={inputRef as any}
                type="text"
                placeholder={placeholderText}
                value={search}
                onChange={handleSearchChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full pl-12 pr-12 py-4 rounded-xl bg-surface border border-border text-sm outline-none transition-all duration-300 placeholder:text-text-muted/60 font-medium shadow-sm focus:border-brand focus:ring-2 focus:ring-brand/10"
            />
            {search && (
                <button
                    type="button"
                    onClick={() => { setSearch(""); updateParams(""); }}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </form>
    )
}


export function CategoryChips() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const category = searchParams.get("c") || "all"

    const updateCategory = (newCategory: string) => {
        const params = new URLSearchParams()
        if (newCategory !== "all") params.set("c", newCategory)
        router.push(`/?${params.toString()}`)
    }

    return (
        <div className="flex flex-wrap items-center justify-start gap-2 w-full">
            <button
                onClick={() => updateCategory("all")}
                className={`px-3 py-2 rounded-xl text-label transition-all uppercase border font-bold text-[10px] tracking-wider ${category === "all"
                    ? 'bg-neutral-100 text-brand border-neutral-200 shadow-inner'
                    : 'bg-surface text-text-secondary border-border shadow-sm hover:text-brand hover:border-brand/40 hover:shadow'
                    }`}
            >
                All
            </button>
            {MAIN_CATEGORIES.map(cat => (
                <button
                    key={cat}
                    onClick={() => updateCategory(cat)}
                    className={`px-3 py-2 rounded-xl text-label transition-all uppercase whitespace-nowrap border font-bold text-[10px] tracking-wider ${category === cat
                        ? 'bg-neutral-100 text-brand border-neutral-200 shadow-inner'
                        : 'bg-surface text-text-secondary border-border shadow-sm hover:text-brand hover:border-brand/40 hover:shadow'
                        }`}
                >
                    {cat}
                </button>
            ))}
        </div>
    )
}

