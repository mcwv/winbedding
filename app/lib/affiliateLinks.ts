// Affiliate link management system
// Add affiliate links one by one as you get approved for programs

export interface AffiliateLink {
  toolId: string
  affiliateUrl: string
  network?: string  // e.g., "PartnerStack", "Impact", "Direct"
  commission?: string  // e.g., "30% recurring"
  notes?: string
}

// Start with your top priority tools - add more as you get approved!
export const affiliateLinks: AffiliateLink[] = [
  // Example - replace with your actual affiliate links as you get them:
  // {
  //   toolId: "6601e5ffa1b2b5ce0d248614",  // Example tool ID
  //   affiliateUrl: "https://example.com/?ref=YOUR_CODE",
  //   network: "PartnerStack",
  //   commission: "30% recurring",
  //   notes: "Approved on 2025-01-15"
  // },

  // Add your affiliate links here as you get approved
]

// Helper to get affiliate link if it exists, otherwise return original
export function getToolLink(toolId: string, originalUrl: string): string {
  const affiliate = affiliateLinks.find(a => a.toolId === toolId)

  if (affiliate) {
    return affiliate.affiliateUrl
  }

  // Fallback: add your own UTM tracking to original URL
  return addYourTracking(originalUrl)
}

// Add your own UTM tracking to non-affiliate links
function addYourTracking(url: string): string {
  if (!url) return url

  try {
    const urlObj = new URL(url)

    // Don't override if it already has your tracking
    if (urlObj.searchParams.has('ref') || urlObj.searchParams.get('utm_source')?.includes('yoursite')) {
      return url
    }

    // Add your tracking parameters
    urlObj.searchParams.set('utm_source', 'ai-tools-hub')
    urlObj.searchParams.set('utm_medium', 'directory')
    urlObj.searchParams.set('utm_campaign', 'tool-listing')

    return urlObj.toString()
  } catch {
    // If URL parsing fails, return original
    return url
  }
}

// Get stats on your affiliate coverage
export function getAffiliateStats() {
  return {
    totalAffiliateLinks: affiliateLinks.length,
    byNetwork: affiliateLinks.reduce((acc, link) => {
      const network = link.network || 'Unknown'
      acc[network] = (acc[network] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}
