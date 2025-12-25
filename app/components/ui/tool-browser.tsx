"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import ReactMarkdown from 'react-markdown'
import { Star, ExternalLink, Shield, Zap, Code, Target, CheckCircle, Building2, Lock, Users, Award, Image as ImageIcon, Tag, Share2, Check, ChevronRight, Globe, GraduationCap, LifeBuoy } from "lucide-react"
import { Tool } from "@/app/types/tool"
import { expandQuery, matchesQuery, calculateRelevanceScore } from "@/app/lib/searchUtils"
import { MAIN_CATEGORIES } from "@/app/lib/categoryMapping"

interface ToolBrowserProps {
  tools: Tool[]
  initialSelectedTool?: Tool | null
}



const TOOLS_PER_PAGE = 20

// ... helper functions (isValidImageUrl, getFaviconUrl, getToolImage) remain same ...
const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false
  if (typeof url !== 'string') return false
  if (url === '#N/A' || url === 'N/A') return false
  if (url.toLowerCase().includes('no high-quality') || url.toLowerCase().includes('no logo')) return false
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:') && !url.startsWith('/')) return false
  return true
}

const getFaviconUrl = (websiteUrl: string | null | undefined, size: number = 64): string | null => {
  if (!websiteUrl) return null
  try {
    const url = new URL(websiteUrl)
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=${size}`
  } catch {
    return null
  }
}

// Map tool names to local image files
const localThumbMap: Record<string, string> = {
  '10web': '/tool-thumbs/10w.png',
  '2short.ai': '/tool-thumbs/2short.png',
  '123rf ai image generator': '/tool-thumbs/123rf.png',
  '15 minute plan': '/tool-thumbs/15minplan.jpg',
}

const localImgMap: Record<string, string> = {
  '10web': '/tool-img/10web.jpg',
  '2short.ai': '/tool-img/2short.ai.png',
  '123rf ai image generator': '/tool-img/123rf.png',
  '15 minute plan': '/tool-img/15minplan.png',
}

const getToolThumb = (tool: Tool): string | null => {
  const nameKey = tool.name.toLowerCase().trim()
  if (localThumbMap[nameKey]) return localThumbMap[nameKey]
  return tool.logoUrl || getFaviconUrl(tool.visitURL, 128)
}

const getToolPreviewImage = (tool: Tool): string | null => {
  if (!tool) return null
  const nameKey = tool.name.toLowerCase().trim()
  if (localImgMap[nameKey]) return localImgMap[nameKey]
  return tool.imageUrl || null
}

export default function ToolBrowser({ tools, initialSelectedTool = null }: ToolBrowserProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const searchQuery = searchParams.get("q") || ""
  const selectedCategory = searchParams.get("c") || "all"
  const selectedToolSlug = searchParams.get("tool") // URL-based selection

  const [visibleCount, setVisibleCount] = useState(30)
  const [copied, setCopied] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true) // Assume desktop for SSR
  const [isNavigating, setIsNavigating] = useState(false)
  const [pendingTool, setPendingTool] = useState<Tool | null>(null) // Optimistic UI

  // Detect desktop vs mobile on mount
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Listen for 'goHome' event from Logo/Home button
  useEffect(() => {
    const handleGoHome = () => {
      setPendingTool(null)
      setIsNavigating(false) // Clear loading state
      // Navigate to clean home
      router.push('/', { scroll: false })
      // Scroll list to top
      const toolList = document.getElementById('tool-list')
      if (toolList) toolList.scrollTo({ top: 0, behavior: 'smooth' })
    }

    window.addEventListener('goHome', handleGoHome)
    return () => window.removeEventListener('goHome', handleGoHome)
  }, [router])


  // Clear pending tool when URL updates (including when tool param is removed)
  useEffect(() => {
    // If URL doesn't have a tool param but we have a pending tool, clear it
    if (!selectedToolSlug) {
      setPendingTool(null)
    }
    setIsNavigating(false)
  }, [selectedToolSlug])



  const handleShare = () => {
    const tool = selectedTool
    if (!tool) return
    const url = `${window.location.origin}/tools/${tool.slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (category !== "all") params.set('c', category)
    else params.delete('c')
    params.delete('q')
    params.delete('tool') // Clear tool selection when changing category
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('q', tag)
    params.delete('tool') // Clear tool selection when searching
    router.push(`${pathname}?${params.toString()}`)
  }

  const filteredTools = useMemo(() => {
    if (!tools) return []

    const filtered = tools.filter(tool => {
      const matchesSearch = searchQuery === "" || matchesQuery(tool, searchQuery)
      const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    if (searchQuery !== "") {
      return [...filtered].sort((a, b) => {
        const scoreA = calculateRelevanceScore(a, searchQuery)
        const scoreB = calculateRelevanceScore(b, searchQuery)
        return scoreB - scoreA
      })
    }

    return filtered
  }, [tools, searchQuery, selectedCategory])

  // Derive selectedTool: prioritize pendingTool for optimistic UI, then URL param
  const selectedTool = useMemo(() => {
    // Optimistic: if we just clicked a tool, show it immediately
    if (pendingTool) return pendingTool

    // If URL has a tool slug, find and use that tool
    if (selectedToolSlug) {
      const found = tools?.find(t => t.slug === selectedToolSlug)
      if (found) return found
    }

    // On desktop with no explicit selection, auto-select first tool
    if (isDesktop && filteredTools.length > 0 && !selectedToolSlug) {
      return filteredTools[0]
    }

    // On mobile or no tools: no selection
    return null
  }, [pendingTool, selectedToolSlug, tools, filteredTools, isDesktop])

  useEffect(() => {
    setVisibleCount(30)
  }, [filteredTools])

  // When clicking a tool, update URL and set pending for immediate UI
  const handleToolSelect = (tool: Tool) => {
    setPendingTool(tool) // Optimistic: show immediately
    setIsNavigating(true)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tool', tool.slug)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Go back to list (clear tool selection from URL)
  const handleBackToList = () => {
    setPendingTool(null)
    setIsNavigating(false) // Clear loading state
    const params = new URLSearchParams(searchParams.toString())
    params.delete('tool')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }


  const visibleTools = filteredTools.slice(0, visibleCount)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      if (visibleCount < filteredTools.length) {

        setVisibleCount(prev => Math.min(prev + 20, filteredTools.length))
      }
    }
  }

  const getPricingColor = (model?: string) => {
    switch (model?.toLowerCase()) {
      case 'free': return 'text-green-600 bg-green-500/10'
      case 'freemium': return 'text-blue-600 bg-blue-500/10'
      case 'paid': return 'text-purple-600 bg-purple-500/10'
      case 'contact': return 'text-orange-600 bg-orange-500/10'
      case 'open-source': return 'text-cyan-600 bg-cyan-500/10'
      default: return 'text-gray-600 bg-gray-500/10'
    }
  }

  return (
    <div className="flex flex-col h-full space-y-4 w-full">
      <div className="grid lg:grid-cols-5 gap-6 flex-1 overflow-hidden">
        {/* Left: Tool List - hidden on mobile when a tool is selected */}
        <div className={`lg:col-span-2 flex flex-col overflow-hidden space-y-4 relative ${selectedTool ? 'hidden lg:flex' : 'flex'}`}>


          <div className="flex items-center justify-between text-eyebrow text-muted-foreground/40 px-1">
            <span>{filteredTools.length} tools indexed</span>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => router.push(pathname)}
                className="text-indigo-500 hover:text-indigo-600 transition-colors"
              >
                Reset All
              </button>
            )}
          </div>

          <div
            id="tool-list"
            className="rounded-2xl p-4 flex-1 overflow-y-auto bg-card-weak border border-border shadow-inner"
            onScroll={handleScroll}
          >

            <div className="space-y-3">
              {visibleTools.map((tool: Tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleToolSelect(tool)}
                  className={`w-full text-left rounded-lg p-4 transition-all border ${selectedTool?.id === tool.id
                    ? 'bg-neutral-100 border-brand shadow-inner'
                    : 'bg-card-weak border-border shadow-sm hover:border-brand/30 hover:shadow-md'}`}
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white p-1 relative shadow-sm border border-border">
                      <Image
                        src={getToolThumb(tool)!}
                        alt={tool.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm mb-0.5 line-clamp-1">
                        {tool.name}
                      </h3>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCategoryClick(tool.category)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation()
                            handleCategoryClick(tool.category)
                          }
                        }}
                        className="text-label text-indigo-600 hover:text-indigo-400 transition-colors cursor-pointer"
                      >
                        {tool.category}
                      </span>
                    </div>
                  </div>
                </button>


              ))}
            </div>
          </div>

          {/* Loading overlay when navigating to a tool */}
          {isNavigating && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium text-gray-500">Loading...</span>
              </div>
            </div>
          )}
        </div>



        {/* Right: Detail View - hidden on mobile when no tool selected, full-screen on mobile when selected */}
        <div className={`lg:col-span-3 flex flex-col overflow-hidden space-y-4 ${selectedTool ? 'block' : 'hidden lg:block'}`}>
          {selectedTool ? (

            <div
              className="rounded-2xl flex-1 overflow-y-auto relative bg-card-mid border border-border/50 shadow-sm"
            >
              {/* Mobile Back Button - inline, not absolute */}
              <div className="lg:hidden px-4 pt-4">
                <button
                  onClick={handleBackToList}

                  className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all active:scale-95 bg-surface border border-border shadow-sm text-brand hover:bg-neutral-50"
                >
                  <ChevronRight className="w-3 h-3 rotate-180" />
                  Back
                </button>
              </div>

              <div className="p-4 lg:p-8 space-y-8 lg:space-y-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                  <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-[2rem] flex items-center justify-center flex-shrink-0 p-4 relative bg-white shadow-sm border border-border">
                    <Image
                      src={getToolThumb(selectedTool)!}
                      alt={selectedTool.name}
                      fill
                      className="object-contain p-4"
                    />
                  </div>

                  <div className="flex-1 text-center md:text-left space-y-4">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      <span
                        onClick={() => handleCategoryClick(selectedTool.category)}
                        className="px-2 py-1 rounded-lg text-label uppercase text-brand/60 cursor-pointer hover:text-brand bg-neutral-100 border border-neutral-200"
                      >
                        {selectedTool.category}
                      </span>
                      {selectedTool.pricing_model && (
                        <span className={`px-2 py-1 rounded-lg text-label ${getPricingColor(selectedTool.pricing_model)}`}>
                          {selectedTool.pricing_model}
                        </span>
                      )}
                      {selectedTool.has_trial && (
                        <span className="px-2 py-1 rounded-lg text-label text-indigo-500 bg-indigo-50/50">
                          {selectedTool.trial_days ? `${selectedTool.trial_days}-Day Trial` : 'Free Trial'}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Link href={`/tools/${selectedTool.slug}`} className="hover:opacity-70 transition-opacity">
                        <h2 className="text-tool-name text-gray-900">
                          {selectedTool.name}
                        </h2>
                      </Link>
                      {selectedTool.tagline && (
                        <p className="text-tagline text-gray-400 italic">
                          "{selectedTool.tagline}"
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                      <a
                        href={selectedTool.visitURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-xl flex items-center gap-2 text-xs lg:text-sm font-bold transition-all active:scale-95 text-white bg-brand shadow-md hover:bg-brand-hover hover:shadow-lg"
                      >
                        Visit Website
                        <ExternalLink className="w-3 h-3 lg:w-4 lg:h-4 stroke-[3px]" />
                      </a>
                      {selectedTool.price_amount && (
                        <div className="px-6 py-3 rounded-xl flex items-center gap-2 text-body-sm font-bold text-gray-500 bg-surface border border-border shadow-sm">
                          <span className="text-gray-400 text-label">Starts at</span>
                          <span className="text-gray-900">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: selectedTool.price_currency || 'USD' }).format(selectedTool.price_amount)}
                          </span>
                        </div>
                      )}
                      <Link
                        href={`/tools/${selectedTool.slug}`}
                        className="px-6 py-3 rounded-xl flex items-center gap-2 text-xs lg:text-sm font-bold transition-all active:scale-95 text-text-secondary bg-surface border border-border shadow-sm hover:text-brand hover:border-brand/30"
                      >
                        Full Page
                        <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 stroke-[3px]" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Verdict Banner */}
                {selectedTool.verdict && (
                  <div className="p-6 rounded-[2rem] relative overflow-hidden bg-card-mid border border-neutral-200">
                    <div className="flex items-center gap-2 mb-3 opacity-40">
                      <h3 className="text-eyebrow text-indigo-900">The Honest Verdict</h3>
                    </div>
                    <div className="text-quote text-gray-800 italic">
                      "{selectedTool.verdict}"
                    </div>
                  </div>
                )}



                {/* Screenshot - full width on mobile, constrained on desktop */}
                {getToolPreviewImage(selectedTool) && (
                  <div className="rounded-xl lg:rounded-[2rem] overflow-hidden p-2 lg:p-3 skeleton min-h-[150px] lg:min-h-[250px] relative bg-card-mid border border-neutral-200">
                    <Image
                      src={getToolPreviewImage(selectedTool)!}
                      alt={`${selectedTool.name} screenshot`}
                      width={1200}
                      height={675}
                      className="w-full h-auto rounded-lg lg:rounded-[1.2rem] shadow-sm bg-white"
                      priority={false}
                    />
                  </div>
                )}

                {/* Content Grid */}
                <div className="space-y-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 opacity-30">
                      <Target className="w-4 h-4 text-gray-900" />
                      <h3 className="text-eyebrow text-gray-900">Deep Dive</h3>
                    </div>
                    <div className="text-body text-gray-700 prose prose-indigo max-w-none">
                      <ReactMarkdown>{selectedTool.description}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Pros & Cons */}
                  {(selectedTool.pros?.length || selectedTool.cons?.length || 0) > 0 && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {selectedTool.pros && selectedTool.pros.length > 0 && (
                        <div className="p-6 rounded-[2rem] bg-green-50/50 border border-green-100">
                          <h3 className="text-eyebrow text-green-600 mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Strengths
                          </h3>
                          <ul className="space-y-3">
                            {selectedTool.pros.map((pro, i) => (
                              <li key={i} className="flex items-start gap-2 text-body-sm text-gray-600 font-medium">
                                <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedTool.cons && selectedTool.cons.length > 0 && (
                        <div className="p-6 rounded-[2rem] bg-orange-50/50 border border-orange-100">
                          <h3 className="text-eyebrow text-orange-600 mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            Limitations
                          </h3>
                          <ul className="space-y-3">
                            {selectedTool.cons.map((con, i) => (
                              <li key={i} className="flex items-start gap-2 text-body-sm text-gray-600 font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-300 mt-1.5 flex-shrink-0" />
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Adams Guide (Moved to Bottom) - Fun "Easter Egg" position */}
                  {selectedTool.adams_description && (
                    <div className="pt-8 mt-8 border-t border-dashed border-gray-200">
                      <div className="prose prose-indigo max-w-none">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                          <h3 className="text-eyebrow text-cyan-800 m-0 uppercase tracking-widest">The Don't Panic Guide</h3>
                        </div>
                        <div className="text-quote text-gray-600 italic bg-cyan-50/50 p-8 rounded-[2.5rem] border border-cyan-100 relative overflow-hidden">
                          <span className="absolute top-4 left-6 text-6xl text-cyan-200/40 font-serif leading-none">“</span>
                          <p className="relative z-10 leading-relaxed text-lg">
                            {selectedTool.adams_description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}



                  {/* Spec Sheet Sidebar Content (Inline for Browser View) */}
                  <div className="p-6 lg:p-8 rounded-[2.5rem] space-y-8 bg-card-strong border border-border shadow-sm">
                    {/* Access, Experience & Ecosystem Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-6 gap-y-8">

                      {/* Column 1: Core Specs */}
                      <div className="space-y-8">
                        {/* Access */}
                        <div>
                          <h3 className="text-eyebrow text-zinc-400 mb-4 uppercase tracking-widest">Access</h3>
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2.5 rounded-xl bg-white/50 border border-white/60 shadow-sm">
                                <Globe className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-gray-900">Deployment</h4>
                                <p className="text-tiny text-gray-500 mt-0.5 capitalize leading-snug">
                                  {selectedTool.platforms?.join(', ') || 'Web-based'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="p-2.5 rounded-xl bg-white/50 border border-white/60 shadow-sm">
                                <Code className="w-4 h-4 text-violet-600" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-gray-900">API Access</h4>
                                <p className="text-tiny text-gray-500 mt-0.5 leading-snug">
                                  {selectedTool.api_available ? 'Developer API' : 'No Public API'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Experience */}
                        <div>
                          <h3 className="text-eyebrow text-zinc-400 mb-4 uppercase tracking-widest">Experience</h3>
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2.5 rounded-xl bg-white/50 border border-white/60 shadow-sm">
                                <GraduationCap className="w-4 h-4 text-amber-500" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-gray-900">Learning Curve</h4>
                                <p className="text-tiny text-gray-500 mt-0.5 capitalize leading-snug">
                                  {selectedTool.learning_curve || 'Standard'}
                                </p>
                              </div>
                            </div>
                            {selectedTool.documentation_quality && (
                              <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-xl bg-white/50 border border-white/60 shadow-sm">
                                  <Target className="w-4 h-4 text-teal-600" />
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-gray-900">Documentation</h4>
                                  <p className="text-tiny text-gray-500 mt-0.5 capitalize leading-snug">
                                    {selectedTool.documentation_quality}
                                  </p>
                                </div>
                              </div>
                            )}
                            {selectedTool.support_options && selectedTool.support_options.length > 0 && (
                              <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-xl bg-white/50 border border-white/60 shadow-sm">
                                  <LifeBuoy className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-gray-900">Support</h4>
                                  <p className="text-tiny text-gray-500 mt-0.5 capitalize leading-snug">
                                    {selectedTool.support_options.slice(0, 2).join(', ')}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Key Features (Moved to Left Col) */}
                      {selectedTool.features && selectedTool.features.length > 0 && (
                        <div>
                          <h3 className="text-eyebrow text-zinc-400 mb-4 uppercase tracking-widest">Highlights</h3>
                          <ul className="space-y-2">
                            {selectedTool.features.slice(0, 5).map(feature => (
                              <li key={feature} className="flex items-start gap-2 text-tiny font-bold text-gray-600 leading-snug">
                                <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Column 2: Ecosystem & Competitors */}
                    <div className="space-y-8">
                      {/* Integrations */}
                      {selectedTool.integrations && selectedTool.integrations.length > 0 && (
                        <div>
                          <h3 className="text-eyebrow text-zinc-400 mb-4 uppercase tracking-widest">Integrations</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedTool.integrations.map(integration => (
                              <span key={integration} className="px-2.5 py-1.5 rounded-lg bg-white/40 text-[11px] font-bold text-gray-600 border border-white/50 shadow-sm">
                                {integration}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Competitors */}
                      {selectedTool.alternatives && selectedTool.alternatives.length > 0 && (
                        <div>
                          <h3 className="text-eyebrow text-zinc-400 mb-4 uppercase tracking-widest">Alternatives</h3>
                          <div className="space-y-2">
                            {selectedTool.alternatives.map(alt => (
                              <Link
                                key={alt}
                                href={`/?q=${encodeURIComponent(alt)}`}
                                className="group flex items-center justify-between p-2.5 rounded-xl bg-white/40 hover:bg-white/80 transition-all border border-transparent hover:border-indigo-100 shadow-sm"
                              >
                                <span className="text-[11px] font-bold text-gray-600 group-hover:text-indigo-600 transition-colors">{alt}</span>
                                <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-indigo-300" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Target Audience (Moved to Right Col) */}
                      {(selectedTool.target_audience?.length || selectedTool.not_recommended_for) && (
                        <div className="space-y-6">
                          {selectedTool.target_audience && selectedTool.target_audience.length > 0 && (
                            <div>
                              <h3 className="text-eyebrow text-indigo-900/40 mb-3 uppercase tracking-widest">Best For</h3>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedTool.target_audience.map(audience => (
                                  <span key={audience} className="px-2 py-1 rounded-lg bg-indigo-50/50 text-[10px] font-bold text-indigo-700 border border-indigo-100/50 uppercase tracking-wide">
                                    {audience}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedTool.not_recommended_for && (
                            <div>
                              <h3 className="text-eyebrow text-red-900/40 mb-2 uppercase tracking-widest">Not Suited For</h3>
                              <div className="p-3 rounded-xl bg-red-50/50 border border-red-100/50 relative overflow-hidden">
                                <p className="text-tiny font-bold text-red-700 leading-relaxed">
                                  {selectedTool.not_recommended_for}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>





                  {/* Tags */}
                  {selectedTool.tags && selectedTool.tags.length > 0 && (
                    <div className="pt-6 border-t border-white/40">
                      <h3 className="text-eyebrow text-zinc-400 mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTool.tags.map(tag => (
                          <span
                            key={tag}
                            onClick={() => handleTagClick(tag)}
                            className="px-2 py-1 rounded-md bg-white/30 text-tiny font-bold text-gray-500 border border-white/40 cursor-pointer hover:bg-white/60 hover:text-indigo-600 transition-colors"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Analysis Scores (Moved to Bottom) */}
                  <div className="pt-6 border-t border-white/40 opacity-80">
                    <h3 className="text-eyebrow text-zinc-400 mb-4 uppercase tracking-widest">Utility Score</h3>
                    <div className="space-y-6">
                      {selectedTool.transparency_score !== undefined && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-end">
                            <span className="text-label text-gray-500">Data Visibility</span>
                            <span className="text-xs font-black text-indigo-600">{selectedTool.transparency_score}%</span>
                          </div>
                          <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${selectedTool.transparency_score}%` }} />
                          </div>
                        </div>
                      )}
                      {selectedTool.experience_score !== undefined && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-end">
                            <span className="text-label text-gray-500">User Experience</span>
                            <span className="text-xs font-black text-indigo-600">{selectedTool.experience_score}/10</span>
                          </div>
                          <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(selectedTool.experience_score as any) * 10}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Social Proof (moved to Sidebar) */}
                  {selectedTool.reddit_morsels && selectedTool.reddit_morsels.length > 0 && (
                    <div className="pt-6 border-t border-white/40">
                      <h3 className="text-eyebrow text-gray-400 mb-4">Community Takes</h3>
                      <div className="space-y-4">
                        {selectedTool.reddit_morsels.map((morsel: any, i: number) => (
                          <div key={i} className="p-4 rounded-2xl bg-white/40 border border-white/60 shadow-sm relative overflow-hidden group hover:bg-white/60 transition-colors">
                            <p className="text-xs text-gray-600 font-medium italic mb-3 leading-relaxed">"{morsel.quote}"</p>
                            <div className="flex items-center gap-2 text-tiny font-bold uppercase tracking-wider text-gray-400">
                              <span className="text-orange-500/80">u/{morsel.author}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>


              </div>

              <div className="pt-8 border-t border-white/40 flex justify-between items-center text-eyebrow text-muted-foreground/30">
                <span>Bedwinning AI Index</span>
              </div>
            </div>

          ) : filteredTools.length === 0 ? (
            <div className="rounded-3xl flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6 bg-card-weak border border-border/50 shadow-sm">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-indigo-400 bg-neutral-100 border border-neutral-200 shadow-inner">
                <Zap className="w-10 h-10 opacity-20" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900 uppercase tracking-widest">No Tools Found</h3>
                <p className="text-sm text-gray-500 font-medium max-w-xs">
                  We couldn't find anything matching your search. Try adjusting your filters or search terms.
                </p>
              </div>
              <button
                onClick={() => router.push(pathname)}
                className="px-6 py-3 rounded-2xl text-eyebrow transition-all bg-surface border border-border shadow-sm text-brand hover:bg-neutral-50"
              >
                Clear Everything
              </button>
            </div>
          ) : (
            <div className="rounded-2xl p-8 h-full flex items-center justify-center opacity-40 bg-card-weak border border-border/50 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Select a tool to explore</p>
            </div>
          )}
        </div>
      </div>
    </div >
  )
}
