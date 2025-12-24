"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import ReactMarkdown from 'react-markdown'
import { Star, ExternalLink, Shield, Zap, Code, Target, CheckCircle, Building2, Lock, Users, Award, Image as ImageIcon, Tag, Share2, Check, ChevronRight } from "lucide-react"
import { Tool } from "@/app/types/tool"
import { expandQuery, matchesQuery, calculateRelevanceScore } from "@/app/lib/searchUtils"
import { MAIN_CATEGORIES } from "@/app/lib/categoryMapping"

interface NeomorphToolBrowserProps {
  tools: Tool[]
  initialSelectedTool?: Tool | null
}

const neomorphShadow = {
  raised: "8px 8px 16px rgba(209, 217, 230, 0.8), -8px -8px 16px rgba(255, 255, 255, 0.8)",
  pressed: "inset 4px 4px 8px rgba(209, 217, 230, 0.7), inset -4px -4px 8px rgba(255, 255, 255, 0.7)",
  flat: 'none',
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

export default function NeomorphToolBrowser({ tools, initialSelectedTool = null }: NeomorphToolBrowserProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const searchQuery = searchParams.get("q") || ""
  const selectedCategory = searchParams.get("c") || "all"

  const [selectedTool, setSelectedTool] = useState<Tool | null>(initialSelectedTool)
  const [visibleCount, setVisibleCount] = useState(30)
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    if (!selectedTool) return
    const url = `${window.location.origin}/tools/${selectedTool.slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams()
    if (category !== "all") params.set('c', category)
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('q', tag)
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

  useEffect(() => {
    setVisibleCount(30)

    // If we have an initial selected tool from props, use it
    if (initialSelectedTool && !selectedTool) {
      setSelectedTool(initialSelectedTool)
      return
    }

    // Default selection: first found or null
    if (filteredTools.length > 0) {
      // Don't override if current selection is still in filtered results
      if (!selectedTool || !filteredTools.some(t => t.id === selectedTool.id)) {
        setSelectedTool(filteredTools[0])
      }
    } else {
      setSelectedTool(null)
    }
  }, [filteredTools, initialSelectedTool])

  const handleToolSelect = (tool: Tool) => {
    setSelectedTool(tool)
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

  return (
    <div className="flex flex-col h-full space-y-4 w-full">
      <div className="grid lg:grid-cols-5 gap-6 flex-1 overflow-hidden">
        {/* Left: Tool List - hidden on mobile when a tool is selected */}
        <div className={`lg:col-span-2 flex flex-col overflow-hidden space-y-4 ${selectedTool ? 'hidden lg:flex' : 'flex'}`}>

          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 px-1">
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
            className="rounded-2xl p-4 flex-1 overflow-y-auto"
            style={{ background: '#F0F0F3', boxShadow: neomorphShadow.pressed }}
            onScroll={handleScroll}
          >
            <div className="space-y-3">
              {visibleTools.map((tool: Tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleToolSelect(tool)}
                  className="w-full text-left rounded-lg p-4 transition-all"
                  style={{
                    background: '#F0F0F3',
                    boxShadow: selectedTool?.id === tool.id ? neomorphShadow.pressed : neomorphShadow.raised,
                    border: selectedTool?.id === tool.id ? '2px solid #4f46e5' : '2px solid transparent',
                  }}
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white p-1" style={{ boxShadow: neomorphShadow.pressed }}>
                      <img src={getToolThumb(tool)!} alt="" className="w-full h-full object-contain" />
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
                        className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider hover:text-indigo-400 transition-colors cursor-pointer"
                      >
                        {tool.category}
                      </span>
                    </div>
                  </div>
                </button>

              ))}
            </div>
          </div>
        </div>

        {/* Right: Detail View - hidden on mobile when no tool selected, full-screen on mobile when selected */}
        <div className={`lg:col-span-3 flex flex-col overflow-hidden space-y-4 ${selectedTool ? 'block' : 'hidden lg:block'}`}>
          {selectedTool ? (
            <div
              className="rounded-2xl flex-1 overflow-y-auto relative"
              style={{
                background: '#F0F0F3',
                boxShadow: neomorphShadow.raised,
              }}
            >
              {/* Mobile Back Button */}
              <button
                onClick={() => setSelectedTool(null)}
                className="lg:hidden absolute top-4 left-4 z-10 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
                style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised, color: '#4f46e5' }}
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back
              </button>

              <div className="p-8 md:p-10 pt-16 lg:pt-8 space-y-10">

                <div className="flex items-end gap-8">
                  <div className="w-28 h-28 rounded-3xl flex items-center justify-center flex-shrink-0 p-6 bg-white" style={{ boxShadow: neomorphShadow.pressed }}>
                    <img
                      src={getToolThumb(selectedTool)!}
                      alt={selectedTool.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <button
                      onClick={() => handleCategoryClick(selectedTool.category)}
                      className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600/60 mb-2 hover:text-indigo-600 transition-colors"
                    >
                      {selectedTool.category}
                    </button>
                    <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-6">
                      {selectedTool.name}
                    </h2>

                    <div className="flex flex-wrap items-center gap-4">
                      <a
                        href={selectedTool.visitURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex px-8 py-3.5 rounded-xl items-center gap-2 text-sm font-bold transition-all active:scale-95"
                        style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised, color: '#4f46e5' }}
                      >
                        Open Website
                        <ExternalLink className="w-4 h-4 stroke-[3px]" />
                      </a>

                      <Link
                        href={`/tools/${selectedTool.slug}`}
                        className="inline-flex px-8 py-3.5 rounded-xl items-center gap-2 text-sm font-bold transition-all active:scale-95"
                        style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised, color: '#71717a' }}
                      >
                        More
                        <ChevronRight className="w-4 h-4 stroke-[3px]" />
                      </Link>

                      <button
                        onClick={handleShare}
                        className="inline-flex px-8 py-3.5 rounded-xl items-center gap-2 text-sm font-bold transition-all active:scale-95"
                        style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised, color: copied ? '#22c55e' : '#71717a' }}
                      >
                        {copied ? <Check className="w-4 h-4 stroke-[2px]" /> : <Share2 className="w-4 h-4 stroke-[2px]" />}
                        {copied ? 'Copied' : 'Share'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Screenshot */}
                {getToolPreviewImage(selectedTool) && (
                  <div className="rounded-[2rem] overflow-hidden p-3" style={{ background: '#F0F0F3', boxShadow: neomorphShadow.pressed }}>
                    <img
                      src={getToolPreviewImage(selectedTool)!}
                      alt=""
                      className="w-full h-auto rounded-[1.2rem] shadow-sm"
                    />
                  </div>
                )}

                <div className="space-y-6">
                  <div className="flex items-center gap-3 opacity-30">
                    <Target className="w-4 h-4 text-gray-900" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-900">Analysis</h3>
                  </div>
                  <div className="text-lg text-gray-700 leading-relaxed font-medium prose prose-indigo max-w-none">
                    <ReactMarkdown>{selectedTool.description}</ReactMarkdown>
                  </div>

                  {selectedTool.v2_tags && selectedTool.v2_tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-6 border-t border-white/20">
                      {selectedTool.v2_tags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleTagClick(tag)}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-[#F0F0F3] hover:text-indigo-600 transition-colors active:scale-95"
                          style={{ boxShadow: neomorphShadow.pressed }}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-8 border-t border-white/40 flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30">
                  <span>Bedwinning AI Index</span>
                </div>
              </div>
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="rounded-3xl flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6"
              style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised }}>
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-indigo-400"
                style={{ background: '#F0F0F3', boxShadow: neomorphShadow.pressed }}>
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
                className="px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all"
                style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised, color: '#4f46e5' }}
              >
                Clear Everything
              </button>
            </div>
          ) : (
            <div className="rounded-2xl p-8 h-full flex items-center justify-center opacity-40" style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised }}>
              <p className="text-sm font-bold uppercase tracking-widest">Select a tool to explore</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
