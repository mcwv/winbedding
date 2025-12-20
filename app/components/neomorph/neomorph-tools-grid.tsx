"use client"

import { useState, useMemo } from "react"
import { Search, ChevronLeft, ChevronRight, Grid3x3, Sparkles } from "lucide-react"
import { Tool } from "@/app/types/tool"
import NeomorphToolCard from "./neomorph-tool-card"
import NeomorphToolModal from "./neomorph-tool-modal"
import { MAIN_CATEGORIES } from "@/app/lib/categoryMapping"

interface NeomorphToolsGridProps {
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
  flat: `
    4px 4px 8px rgba(209, 217, 230, 0.6),
    -4px -4px 8px rgba(255, 255, 255, 0.6)
  `,
}

const TOOLS_PER_PAGE = 24

export default function NeomorphToolsGrid({ tools }: NeomorphToolsGridProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)

  // Filter tools
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = !searchQuery ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = selectedCategory === "All" ||
        tool.mappedCategory === selectedCategory ||
        tool.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [tools, searchQuery, selectedCategory])

  // Pagination
  const totalPages = Math.ceil(filteredTools.length / TOOLS_PER_PAGE)
  const startIndex = (currentPage - 1) * TOOLS_PER_PAGE
  const paginatedTools = filteredTools.slice(startIndex, startIndex + TOOLS_PER_PAGE)

  // Reset to page 1 when filters change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  return (
    <div className="relative min-h-screen pb-16">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <div
          className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-30"
          style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.1))',
            boxShadow: neomorphShadow.flat,
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        <div
          className="absolute top-40 right-20 w-24 h-24 rounded-full opacity-20"
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))',
            boxShadow: neomorphShadow.flat,
            animation: 'float 8s ease-in-out infinite 1s'
          }}
        />
        <div
          className="absolute bottom-40 left-1/4 w-40 h-40 rounded-full opacity-25"
          style={{
            background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1), rgba(251, 191, 36, 0.1))',
            boxShadow: neomorphShadow.flat,
            animation: 'float 10s ease-in-out infinite 2s'
          }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative container mx-auto px-4 pt-8 pb-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="p-3 rounded-2xl"
              style={{ boxShadow: neomorphShadow.pressed }}
            >
              <Grid3x3 className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Explore <span style={{ color: '#22c55e' }}>AI Tools</span>
            </h1>
          </div>
          <p className="text-lg text-muted-foreground mb-8">
            Discover {filteredTools.length} curated tools to supercharge your workflow
          </p>

          {/* Search Bar */}
          <div
            className="max-w-2xl mx-auto rounded-2xl p-1"
            style={{ boxShadow: neomorphShadow.pressed }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                style={{ background: '#F0F0F3' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="relative container mx-auto px-4 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => handleCategoryChange("All")}
            className="px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 hover:scale-105"
            style={{
              background: selectedCategory === "All" ? '#F0F0F3' : 'transparent',
              boxShadow: selectedCategory === "All" ? neomorphShadow.pressed : 'none',
              color: selectedCategory === "All" ? '#22c55e' : '#6b7280',
              fontWeight: selectedCategory === "All" ? '600' : '400'
            }}
          >
            All Tools
          </button>
          {MAIN_CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className="px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 hover:scale-105"
              style={{
                background: selectedCategory === category ? '#F0F0F3' : 'transparent',
                boxShadow: selectedCategory === category ? neomorphShadow.pressed : 'none',
                color: selectedCategory === category ? '#22c55e' : '#6b7280',
                fontWeight: selectedCategory === category ? '600' : '400'
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="relative container mx-auto px-4">
        {paginatedTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {paginatedTools.map((tool, index) => (
              <div
                key={tool.id}
                style={{
                  animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`
                }}
              >
                <NeomorphToolCard tool={tool} onClick={() => setSelectedTool(tool)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div
              className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl"
              style={{ boxShadow: neomorphShadow.flat }}
            >
              <Sparkles className="w-6 h-6 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">No tools found matching your criteria</p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-3 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
              style={{
                boxShadow: currentPage === 1 ? neomorphShadow.pressed : neomorphShadow.raised,
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10 h-10 rounded-xl transition-all duration-200 hover:scale-105"
                    style={{
                      boxShadow: currentPage === pageNum ? neomorphShadow.pressed : neomorphShadow.raised,
                      color: currentPage === pageNum ? '#22c55e' : '#6b7280',
                      fontWeight: currentPage === pageNum ? '600' : '400'
                    }}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-3 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
              style={{
                boxShadow: currentPage === totalPages ? neomorphShadow.pressed : neomorphShadow.raised,
              }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Page Info */}
        {paginatedTools.length > 0 && (
          <div className="text-center mt-6 text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + TOOLS_PER_PAGE, filteredTools.length)} of {filteredTools.length} tools
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedTool && (
        <NeomorphToolModal tool={selectedTool} onClose={() => setSelectedTool(null)} />
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
