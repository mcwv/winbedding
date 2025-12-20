"use client"

import { useState, useMemo } from "react"
import ReactMarkdown from 'react-markdown'
import { Star, Heart, Search, Filter, ExternalLink, Tag as TagIcon, DollarSign, CheckCircle, Shield, Building, Lock, ChevronLeft, ChevronRight, Users, Code, Building2, Award, Target, Zap } from "lucide-react"
import { Tool } from "@/app/types/tool"
import { MAIN_CATEGORIES } from "@/app/lib/categoryMapping"

interface NeomorphToolBrowserProps {
  tools: Tool[]
}

const neomorphShadow = {
  raised: `
    8px 8px 16px rgba(209, 217, 230, 0.8),
    -8px -8px 16px rgba(255, 255, 255, 0.8)
  `,
  pressed: `
    inset 4px 4px 8px rgba(209, 217, 230, 0.7),
    inset -4px -4px 8px rgba(255, 255, 255, 0.7)
  `,
}

const TOOLS_PER_PAGE = 20

// ... helper functions (isValidImageUrl, getFaviconUrl, getToolImage) remain same ...
const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false
  if (typeof url !== 'string') return false
  if (url === '#N/A' || url === 'N/A') return false
  if (url.toLowerCase().includes('no high-quality') || url.toLowerCase().includes('no logo')) return false
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:')) return false
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

const getToolImage = (tool: Tool, size: number = 64): string | null => {
  if (isValidImageUrl(tool.thumbnail)) return tool.thumbnail!
  if (isValidImageUrl(tool.logo)) return tool.logo!
  return getFaviconUrl(tool.visitURL || tool.affiliateURL, size)
}

export default function NeomorphToolBrowser({ tools }: NeomorphToolBrowserProps) {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(tools[0] || null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)

  const categories = useMemo(() => ["all", ...MAIN_CATEGORIES], [])

  const filteredTools = useMemo(() => {
    const filtered = tools.filter(tool => {
      // Robust search
      const q = searchQuery.toLowerCase()
      const matchesSearch = tool.name?.toLowerCase().includes(q) ||
        tool.shortDescription?.toLowerCase().includes(q) ||
        (tool.description && tool.description.toLowerCase().includes(q)) ||
        (tool.tags && tool.tags.some(tag => tag?.toLowerCase().includes(q)))

      const matchesCategory = selectedCategory === "all" || tool.mappedCategory === selectedCategory
      return matchesSearch && matchesCategory
    })

    // Reset to page 1 when filters change
    setCurrentPage(1)

    return filtered
  }, [tools, searchQuery, selectedCategory])

  // Pagination
  const totalPages = Math.ceil(filteredTools.length / TOOLS_PER_PAGE)
  const startIndex = (currentPage - 1) * TOOLS_PER_PAGE
  const paginatedTools = filteredTools.slice(startIndex, startIndex + TOOLS_PER_PAGE)

  // Check if descriptive text is redundant
  const isDescriptionRedundant = selectedTool && selectedTool.description && selectedTool.shortDescription &&
    selectedTool.description.startsWith(selectedTool.shortDescription.substring(0, 50))

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Search and Filter Bar */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Search */}
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: '#F0F0F3', boxShadow: neomorphShadow.pressed }}>
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="rounded-2xl p-4" style={{ background: '#F0F0F3', boxShadow: neomorphShadow.pressed }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-transparent outline-none text-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === "all" ? "All Categories" : cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {startIndex + 1}-{Math.min(startIndex + TOOLS_PER_PAGE, filteredTools.length)} of {filteredTools.length} tools</span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
              style={{
                background: '#F0F0F3',
                boxShadow: currentPage === 1 ? neomorphShadow.pressed : neomorphShadow.raised,
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
              style={{
                background: '#F0F0F3',
                boxShadow: currentPage === totalPages ? neomorphShadow.pressed : neomorphShadow.raised,
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-6 flex-1" style={{ minHeight: 0 }}>
        {/* Left: Tool List */}
        <div className="lg:col-span-2 flex flex-col" style={{ minHeight: 0 }}>
          <div className="rounded-2xl p-4 flex-1 overflow-y-auto" style={{ background: '#F0F0F3', boxShadow: neomorphShadow.pressed, maxHeight: 'calc(100vh - 300px)' }}>
            <div className="space-y-3">
              {paginatedTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool)}
                  className="w-full text-left rounded-xl p-4 transition-all"
                  style={{
                    background: '#F0F0F3',
                    boxShadow: selectedTool?.id === tool.id ? neomorphShadow.pressed : neomorphShadow.raised,
                    border: selectedTool?.id === tool.id ? '2px solid #22c55e' : '2px solid transparent',
                  }}
                >
                  <div className="flex gap-3 mb-2">
                    {(() => {
                      const imageUrl = getToolImage(tool, 64)
                      return imageUrl ? (
                        <img src={imageUrl} alt="" className="w-10 h-10 rounded-lg object-contain flex-shrink-0 bg-white" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                      ) : null
                    })()}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">{tool.name}</h3>
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-medium text-green-600 line-clamp-1">{tool.mappedCategory || tool.category}</p>
                        {tool.shortDescription && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-90">
                            {tool.shortDescription.replace(/^#+\s*/, '').replace(/\*\*/g, '')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    {tool.rating > 0 && (
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{tool.rating.toFixed(1)}</span>
                    )}
                    {/* Quality Score Indicator - little dot */}
                    {tool.qualityScore && tool.qualityScore > 70 && (
                      <span className="w-2 h-2 rounded-full bg-green-500" title="High Quality Tool"></span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Tool Detail */}
        <div className="lg:col-span-3 flex flex-col" style={{ minHeight: 0 }}>
          {selectedTool ? (
            <div className="rounded-2xl p-8 flex-1 overflow-y-auto" style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised, maxHeight: 'calc(100vh - 300px)' }}>

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-start gap-4 mb-4">
                  {(() => {
                    const imageUrl = getToolImage(selectedTool, 128)
                    return imageUrl ? (
                      <img src={imageUrl} alt="" className="w-20 h-20 rounded-xl object-contain bg-white p-2" style={{ boxShadow: neomorphShadow.pressed }} onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                    ) : null
                  })()}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{selectedTool.name}</h2>
                    {/* Show short description ONLY if meaningful and distinct */}
                    {!isDescriptionRedundant && selectedTool.shortDescription && (
                      <p className="text-lg text-muted-foreground mb-2">{selectedTool.shortDescription}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 font-medium">
                        {selectedTool.mappedCategory || selectedTool.category}
                      </span>
                      {selectedTool.isVerified && <span className="px-3 py-1 rounded-lg bg-green-100 text-green-700 font-medium">Verified</span>}
                      {/* Trust Badges */}
                      {selectedTool.hasPrivacyPolicy && <span className="flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-gray-200 text-gray-600"><Shield className="w-3 h-3" /> Privacy Policy</span>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{(selectedTool.rating || 0).toFixed(2)}</span>
                    {selectedTool.reviewCount && selectedTool.reviewCount > 0 ? (
                      <span className="text-muted-foreground">({selectedTool.reviewCount} reviews)</span>
                    ) : null}
                  </div>
                </div>

                <a
                  href={selectedTool.affiliateURL || selectedTool.visitURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold hover:scale-[1.02] transition-transform"
                  style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised, color: '#22c55e' }}
                >
                  Visit Website
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Pros & Cons (E-E-A-T) */}
              {(selectedTool.pros?.length || 0 > 0 || (selectedTool.cons?.length || 0 > 0)) && (
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {selectedTool.pros && selectedTool.pros.length > 0 && (
                    <div className="p-4 rounded-xl bg-green-50/50 border border-green-100">
                      <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Pros</h4>
                      <ul className="list-disc list-inside text-sm text-green-900">
                        {selectedTool.pros.map(p => <li key={p}>{p}</li>)}
                      </ul>
                    </div>
                  )}
                  {selectedTool.cons && selectedTool.cons.length > 0 && (
                    <div className="p-4 rounded-xl bg-red-50/50 border border-red-100">
                      <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2"><Shield className="w-4 h-4" /> Cons</h4>
                      <ul className="list-disc list-inside text-sm text-red-900">
                        {selectedTool.cons.map(c => <li key={c}>{c}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Pricing Details */}
              {((selectedTool.priceAmount && selectedTool.priceAmount > 0) || selectedTool.pricingModel || selectedTool.hasFreeTrialDays || selectedTool.verdict) && (
                <div className="mb-6 p-3 rounded-xl bg-green-50/30 border border-green-100">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-600" /> Pricing</h4>
                  <div className="space-y-1 text-sm">
                    {selectedTool.priceAmount && Number(selectedTool.priceAmount) > 0 ? (
                      <p><strong>{selectedTool.priceCurrency || 'USD'} ${Number(selectedTool.priceAmount).toFixed(2)}/mo</strong></p>
                    ) : selectedTool.pricingModel && (
                      <p><span className="capitalize">{selectedTool.pricingModel}</span></p>
                    )}
                    {selectedTool.hasFreeTrialDays && <p className="text-xs">Free Trial: {selectedTool.hasFreeTrialDays} days</p>}
                    {selectedTool.verdict && <p className="italic text-gray-700 text-xs mt-2 pt-2 border-t border-green-200">&ldquo;{selectedTool.verdict}&rdquo;</p>}
                  </div>
                </div>
              )}

              {/* Best For / Not Recommended */}
              {(selectedTool.bestFor || selectedTool.notRecommendedFor) && (
                <div className="grid md:grid-cols-2 gap-3 mb-6">
                  {selectedTool.bestFor && (
                    <div className="p-3 rounded-xl bg-blue-50/40 border border-blue-100">
                      <h4 className="text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1"><Target className="w-3 h-3" /> Best For</h4>
                      <p className="text-xs text-blue-900">{selectedTool.bestFor}</p>
                    </div>
                  )}
                  {selectedTool.notRecommendedFor && (
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1"><Shield className="w-3 h-3" /> Not For</h4>
                      <p className="text-xs text-gray-700">{selectedTool.notRecommendedFor}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Expertise */}
              {(selectedTool.targetAudience || selectedTool.skillLevel || selectedTool.learningCurve) && (
                <div className="mb-6 p-3 rounded-xl" style={{ background: '#F0F0F3', boxShadow: neomorphShadow.pressed }}>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Users className="w-4 h-4" /> Who It's For</h4>
                  <div className="space-y-2 text-xs">
                    {selectedTool.targetAudience && selectedTool.targetAudience.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {selectedTool.targetAudience.map((aud, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-blue-100 text-blue-700">{aud}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-3">
                      {selectedTool.skillLevel && <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 capitalize">{selectedTool.skillLevel}</span>}
                      {selectedTool.learningCurve && <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 capitalize">{selectedTool.learningCurve} curve</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Integrations */}
              {selectedTool.integrations && selectedTool.integrations.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Code className="w-4 h-4" /> Integrations</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedTool.integrations.slice(0, 6).map((int, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-lg bg-white text-xs border">{int}</span>
                    ))}
                    {selectedTool.integrations.length > 6 && <span className="text-xs text-gray-500">+{selectedTool.integrations.length - 6} more</span>}
                  </div>
                  {selectedTool.apiAvailable && <p className="text-xs text-green-600 mt-1">✓ API Available</p>}
                </div>
              )}

              {/* Company Info */}
              {(selectedTool.companyFounded || selectedTool.employeeCount || selectedTool.fundingRaised) && (
                <div className="mb-6 p-3 rounded-xl" style={{ background: '#F0F0F3', boxShadow: neomorphShadow.pressed }}>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Building2 className="w-4 h-4" /> Company</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {selectedTool.companyName && <div><span className="text-gray-600">Name:</span> <strong>{selectedTool.companyName}</strong></div>}
                    {selectedTool.companyFounded && <div><span className="text-gray-600">Founded:</span> <strong>{selectedTool.companyFounded}</strong></div>}
                    {selectedTool.employeeCount && <div><span className="text-gray-600">Team:</span> <strong>{selectedTool.employeeCount}</strong></div>}
                    {selectedTool.fundingRaised && <div><span className="text-gray-600">Funding:</span> <strong>{selectedTool.fundingRaised}</strong></div>}
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              {(selectedTool.gdprCompliant || selectedTool.hasPrivacyPolicy || (selectedTool.securityFeatures && selectedTool.securityFeatures.length > 0)) && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Shield className="w-4 h-4 text-green-600" /> Security</h4>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {selectedTool.hasPrivacyPolicy && <span className="px-2 py-1 rounded bg-green-100 text-green-700">✓ Privacy Policy</span>}
                    {selectedTool.gdprCompliant && <span className="px-2 py-1 rounded bg-green-100 text-green-700">✓ GDPR</span>}
                    {selectedTool.securityFeatures?.slice(0, 3).map((feat, idx) => (
                      <span key={idx} className="px-2 py-1 rounded bg-gray-100 text-gray-700">{feat}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Alternatives */}
              {selectedTool.alternatives && selectedTool.alternatives.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Zap className="w-4 h-4" /> Alternatives</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTool.alternatives.slice(0, 5).map((alt, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-lg text-xs" style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised }}>{alt}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedTool.tags && selectedTool.tags.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTool.tags.map((tag, idx) => (
                      <span key={`tag-${selectedTool.id}-${idx}-${tag}`} className="text-xs px-2 py-1 rounded-lg" style={{ background: '#F0F0F3', boxShadow: neomorphShadow.pressed, color: '#6b7280' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description with Markdown */}
              {selectedTool.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">About</h3>
                  <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2" {...props} />,
                        h2: ({ node, ...props }) => <h4 className="text-base font-bold text-gray-800 mt-3 mb-2" {...props} />,
                        h3: ({ node, ...props }) => <h5 className="text-sm font-bold text-gray-800 mt-2 mb-1" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 mb-2" {...props} />,
                        a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" target="_blank" {...props} />,
                      }}
                    >
                      {selectedTool.description}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl p-8 h-[700px] flex items-center justify-center" style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised }}>
              <p className="text-muted-foreground">Select a tool to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
