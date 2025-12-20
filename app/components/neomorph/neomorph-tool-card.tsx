"use client"

import { Star, Heart, Tag, ExternalLink } from "lucide-react"
import { Tool } from "@/app/types/tool"

interface NeomorphToolCardProps {
  tool: Tool
  onClick?: () => void
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

// Image helpers
const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
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
  if (isValidImageUrl(tool.logo)) return tool.logo!
  if (isValidImageUrl(tool.thumbnail)) return tool.thumbnail!
  return getFaviconUrl(tool.visitURL || tool.affiliateURL, size)
}

export default function NeomorphToolCard({ tool, onClick }: NeomorphToolCardProps) {
  const pricingLabel = tool.pricingModel === 'Free' ? 'Free' : tool.pricingModel === 'Freemium' ? 'Freemium' : tool.costs

  // Strip markdown from short description
  const cleanDescription = tool.shortDescription
    ?.replace(/^#+\s*/gm, '')  // Remove heading markers
    ?.replace(/\*\*/g, '')      // Remove bold markers
    ?.replace(/\*/g, '')        // Remove italic markers
    ?.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')  // Convert links to plain text

  return (
    <div
      className="rounded-2xl p-6 cursor-pointer hover:scale-[1.02] transition-all duration-300"
      style={{
        background: '#F0F0F3',
        boxShadow: neomorphShadow.raised,
      }}
      onClick={onClick}
    >
      {/* Header with Image */}
      <div className="flex items-start gap-4 mb-4">
        {/* Thumbnail */}
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{
            background: '#F0F0F3',
            boxShadow: neomorphShadow.pressed,
          }}
        >
          {getToolImage(tool, 64) ? (
            <img
              src={getToolImage(tool, 64)!}
              alt={tool.name}
              className="w-full h-full object-contain p-2"
              onError={(e) => {
                const favicon = getFaviconUrl(tool.visitURL, 64)
                if (favicon) {
                  (e.target as HTMLImageElement).src = favicon
                } else {
                  (e.target as HTMLImageElement).style.display = 'none'
                  const parent = (e.target as HTMLImageElement).parentElement
                  if (parent) parent.innerHTML = '<svg class="w-6 h-6 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>'
                }
              }}
            />
          ) : (
            <Tag className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        {/* Title & Category */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-base mb-1 line-clamp-2">
            {tool.name}
          </h3>
          <p className="text-sm text-muted-foreground">{tool.mappedCategory || tool.category}</p>
        </div>
      </div>

      {/* Short Description */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {cleanDescription}
      </p>

      {/* Rating & Stats */}
      <div className="flex items-center gap-4 mb-4">
        {tool.rating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{tool.rating.toFixed(1)}</span>
          </div>
        )}
        {tool.likes > 0 && (
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium">{tool.likes}</span>
          </div>
        )}
        {tool.isVerified && (
          <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-600 font-medium">
            Verified
          </span>
        )}
      </div>

      {/* Tags Preview */}
      {tool.tags && tool.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {tool.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={`tag-${tool.id}-${idx}`}
                className="text-xs px-2 py-1 rounded-lg"
                style={{
                  background: '#F0F0F3',
                  boxShadow: neomorphShadow.pressed,
                  color: '#6b7280',
                }}
              >
                {tag}
              </span>
            ))}
            {tool.tags.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{tool.tags.length - 2} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border/30">
        <span
          className="text-sm font-semibold px-3 py-1 rounded-lg"
          style={{
            background: '#F0F0F3',
            boxShadow: neomorphShadow.pressed,
            color: '#22c55e',
          }}
        >
          {pricingLabel}
        </span>

        {tool.hasAffiliateLink && (
          <span className="text-xs text-green-600 font-medium">
            💰 Partner
          </span>
        )}
      </div>
    </div>
  )
}
